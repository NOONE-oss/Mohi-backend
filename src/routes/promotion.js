import { Router } from 'express';
import { randomUUID } from 'crypto';
import { query, pool } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { parseClassLabel } from '../lib/curriculum.js';

// Promotion = move learners up to the next class (by class, by stream, or one by
// one) and "set off" learners who are leaving the school. Every change is logged
// in batches so a whole promotion run can be undone. Transfers are separate
// (studentTransfer.js) and are not touched by this file.
export const promotionRouter = Router();
promotionRouter.use(requireAuth, requireRole('admin'));

const GRADE_ORDER = ['PP1', 'PP2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const sq = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// Created on first use, like the transfers table - no manual migration.
let ready = null;
function ensureTable() {
  if (!ready) {
    ready = query(`CREATE TABLE IF NOT EXISTS promotion_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      batch_id uuid NOT NULL,
      center_id uuid NOT NULL,
      student_id uuid NOT NULL,
      action text NOT NULL,                 -- promote | setoff | restore
      from_class uuid, from_name text,
      to_class uuid,   to_name text,
      academic_year text,
      created_at timestamptz NOT NULL DEFAULT now(),
      undone boolean NOT NULL DEFAULT false
    );
    CREATE INDEX IF NOT EXISTS idx_promotion_log_batch ON promotion_log(batch_id);
    CREATE INDEX IF NOT EXISTS idx_promotion_log_center ON promotion_log(center_id, created_at DESC);`)
      .catch(e => { ready = null; throw e; });
  }
  return ready;
}

// Every class with its learner count and a suggested next step:
//   promote -> the next grade's class (same stream where possible)
//   setoff  -> no higher grade exists in this school, so these learners are leaving
//   choose  -> the app cannot tell; the admin picks
promotionRouter.get('/plan', asyncHandler(async (req, res) => {
  const { rows: classes } = await query(
    `SELECT c.id, c.name, c.grade, c.stream, c.section,
            (SELECT count(*)::int FROM students s WHERE s.class_id = c.id AND s.status = 'active') AS learners
     FROM classes c WHERE c.center_id = $1 ORDER BY c.grade, c.stream`, [req.auth.centerId]);
  const parsed = classes.map(c => ({ c, p: parseClassLabel(c.name) || parseClassLabel(`${c.grade} ${c.stream || ''}`) }));
  const maxIdx = Math.max(-1, ...parsed.filter(x => x.p).map(x => GRADE_ORDER.indexOf(x.p.gradeKey)));
  const out = parsed.map(({ c, p }) => {
    const streamName = c.stream || (p && p.stream) || '';
    const base = { id: c.id, name: c.name, learners: c.learners, section: c.section, stream: streamName, streamKey: sq(streamName), gradeKey: p ? p.gradeKey : null, suggest: 'choose', targetId: null };
    if (!p) return base;
    const idx = GRADE_ORDER.indexOf(p.gradeKey);
    if (idx < 0) return base;
    if (idx >= maxIdx) return { ...base, suggest: 'setoff' };
    const nextKey = GRADE_ORDER[idx + 1];
    const cands = parsed.filter(x => x.p && x.p.gradeKey === nextKey);
    let pick = null;
    if (streamName) pick = cands.find(x => sq(x.c.stream || x.p.stream) === sq(streamName)) || null;
    if (!pick && cands.length === 1) pick = cands[0];
    return pick ? { ...base, suggest: 'promote', targetId: pick.c.id } : base;
  });
  res.json(out);
}));

// Apply one promotion run. moves: [{ studentIds: [...], action: 'promote'|'setoff', classId? }]
// The browser works out which learners belong to each move (a class, a stream or
// hand-picked learners); this route checks them and applies everything in one go.
promotionRouter.post('/apply', asyncHandler(async (req, res) => {
  await ensureTable();
  const moves = Array.isArray(req.body.moves) ? req.body.moves : [];
  const year = String(req.body.academicYear || '').trim().slice(0, 40) || null;
  if (!moves.length) return res.status(400).json({ error: 'Nothing selected to promote.' });

  const { rows: classes } = await query(`SELECT id, name FROM classes WHERE center_id = $1`, [req.auth.centerId]);
  const className = new Map(classes.map(c => [c.id, c.name]));
  const allIds = [...new Set(moves.flatMap(m => (Array.isArray(m.studentIds) ? m.studentIds : [])))];
  if (!allIds.length) return res.status(400).json({ error: 'No learners selected.' });
  const { rows: studs } = await query(
    `SELECT id, class_id FROM students WHERE id = ANY($1::uuid[]) AND center_id = $2 AND status = 'active'`, [allIds, req.auth.centerId]);
  const stu = new Map(studs.map(s => [s.id, s]));

  const batch = randomUUID(); const done = new Set();
  let promoted = 0, setOff = 0, skipped = 0;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const m of moves) {
      const ids = (Array.isArray(m.studentIds) ? m.studentIds : []).filter(id => stu.has(id) && !done.has(id));
      skipped += (Array.isArray(m.studentIds) ? m.studentIds.length : 0) - ids.length;
      if (!ids.length) continue;
      if (m.action === 'promote') {
        if (!className.has(m.classId)) throw Object.assign(new Error('Choose a class to promote into.'), { status: 400 });
        await client.query(`UPDATE students SET class_id = $1 WHERE id = ANY($2::uuid[]) AND center_id = $3`, [m.classId, ids, req.auth.centerId]);
        promoted += ids.length;
      } else if (m.action === 'setoff') {
        await client.query(`UPDATE students SET status = 'left', class_id = NULL WHERE id = ANY($1::uuid[]) AND center_id = $2`, [ids, req.auth.centerId]);
        setOff += ids.length;
      } else throw Object.assign(new Error('Unknown action.'), { status: 400 });
      for (const id of ids) {
        done.add(id);
        const from = stu.get(id).class_id;
        await client.query(
          `INSERT INTO promotion_log (batch_id, center_id, student_id, action, from_class, from_name, to_class, to_name, academic_year)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [batch, req.auth.centerId, id, m.action, from, className.get(from) || null, m.action === 'promote' ? m.classId : null, m.action === 'promote' ? className.get(m.classId) : null, year]);
      }
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    if (e.status) return res.status(e.status).json({ error: e.message });
    throw e;
  } finally { client.release(); }
  res.json({ batchId: batch, promoted, setOff, skipped });
}));

// Past runs, newest first.
promotionRouter.get('/history', asyncHandler(async (req, res) => {
  await ensureTable();
  const { rows } = await query(
    `SELECT batch_id, min(created_at) AS at, max(academic_year) AS academic_year,
            count(*) FILTER (WHERE action = 'promote')::int AS promoted,
            count(*) FILTER (WHERE action = 'setoff')::int AS set_off,
            count(*) FILTER (WHERE action = 'restore')::int AS restored,
            bool_and(undone) AS undone
     FROM promotion_log WHERE center_id = $1 GROUP BY batch_id ORDER BY min(created_at) DESC LIMIT 15`, [req.auth.centerId]);
  res.json(rows);
}));

// Undo a whole run: every learner still where the run left them goes back.
promotionRouter.post('/undo', asyncHandler(async (req, res) => {
  await ensureTable();
  const { batchId } = req.body;
  if (!batchId) return res.status(400).json({ error: 'batchId is required' });
  const { rows } = await query(
    `SELECT l.id, l.student_id, l.action, l.from_class, l.to_class FROM promotion_log l
     WHERE l.batch_id = $1 AND l.center_id = $2 AND NOT l.undone AND l.action IN ('promote','setoff')`, [batchId, req.auth.centerId]);
  if (!rows.length) return res.status(404).json({ error: 'Nothing left to undo for that run.' });
  const { rows: live } = await query(`SELECT id, class_id FROM classes WHERE center_id = $1`, [req.auth.centerId]);
  const liveSet = new Set(live.map(c => c.id));
  let restored = 0, skipped = 0;
  for (const r of rows) {
    const back = liveSet.has(r.from_class) ? r.from_class : null;
    const q = r.action === 'promote'
      ? await query(`UPDATE students SET class_id = $1 WHERE id = $2 AND center_id = $3 AND class_id IS NOT DISTINCT FROM $4`, [back, r.student_id, req.auth.centerId, r.to_class])
      : await query(`UPDATE students SET class_id = $1, status = 'active' WHERE id = $2 AND center_id = $3 AND status = 'left'`, [back, r.student_id, req.auth.centerId]);
    if (q.rowCount) restored++; else skipped++;
    await query(`UPDATE promotion_log SET undone = true WHERE id = $1`, [r.id]);
  }
  res.json({ restored, skipped });
}));

// Learners who have been set off.
promotionRouter.get('/left', asyncHandler(async (req, res) => {
  await ensureTable();
  const { rows } = await query(
    `SELECT s.id, s.full_name, s.school_id_number,
            (SELECT l.from_name FROM promotion_log l WHERE l.student_id = s.id AND l.action = 'setoff' AND NOT l.undone ORDER BY l.created_at DESC LIMIT 1) AS last_class,
            (SELECT l.academic_year FROM promotion_log l WHERE l.student_id = s.id AND l.action = 'setoff' AND NOT l.undone ORDER BY l.created_at DESC LIMIT 1) AS academic_year,
            (SELECT l.created_at FROM promotion_log l WHERE l.student_id = s.id AND l.action = 'setoff' AND NOT l.undone ORDER BY l.created_at DESC LIMIT 1) AS left_on
     FROM students s WHERE s.center_id = $1 AND s.status = 'left' ORDER BY left_on DESC NULLS LAST, s.full_name`, [req.auth.centerId]);
  res.json(rows);
}));

// Bring set-off learners back into a class (e.g. set off by mistake, or repeating).
promotionRouter.post('/restore', asyncHandler(async (req, res) => {
  await ensureTable();
  const { studentIds, classId } = req.body;
  const ids = (Array.isArray(studentIds) ? studentIds : []).filter(Boolean);
  if (!ids.length || !classId) return res.status(400).json({ error: 'Choose the learners and the class to put them in.' });
  const c = await query(`SELECT id, name FROM classes WHERE id = $1 AND center_id = $2`, [classId, req.auth.centerId]);
  if (!c.rows[0]) return res.status(404).json({ error: 'Class not found at this center.' });
  const r = await query(`UPDATE students SET status = 'active', class_id = $1 WHERE id = ANY($2::uuid[]) AND center_id = $3 AND status = 'left' RETURNING id`, [classId, ids, req.auth.centerId]);
  const batch = randomUUID();
  for (const s of r.rows) await query(
    `INSERT INTO promotion_log (batch_id, center_id, student_id, action, to_class, to_name) VALUES ($1,$2,$3,'restore',$4,$5)`, [batch, req.auth.centerId, s.id, classId, c.rows[0].name]);
  res.json({ restored: r.rowCount });
}));
