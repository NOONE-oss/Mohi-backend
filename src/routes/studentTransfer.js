import { Router } from 'express';
import { query } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

export const studentTransferRouter = Router();
studentTransferRouter.use(requireAuth);

// Creates the table the first time it is needed (no manual migration).
let ready = null;
function ensureTable() {
  if (!ready) {
    ready = query(`CREATE TABLE IF NOT EXISTS student_transfers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id uuid NOT NULL,
      from_center uuid, from_class uuid,
      to_center uuid NOT NULL, to_class uuid NOT NULL,
      requested_by uuid,
      status text NOT NULL DEFAULT 'PENDING',
      requested_at timestamptz NOT NULL DEFAULT now(),
      resolved_at timestamptz
    )`).catch((e) => { ready = null; throw e; });
  }
  return ready;
}
const who = (req) => req.auth.sub || req.auth.id || req.auth.userId || null;

// Classes of any center. IT support only: used to pick a destination in another center.
studentTransferRouter.get('/classes', asyncHandler(async (req, res) => {
  if (req.auth.role !== 'it_support') return res.status(403).json({ error: 'Only IT support can see other centers.' });
  const { rows } = await query(`SELECT id, name, section FROM classes WHERE center_id = $1 ORDER BY name`, [req.query.centerId]);
  res.json(rows);
}));

// Move one or many students to a class.
// IT support: the move happens straight away (any center).
// School admin: the move is sent to IT support for approval (own center only).
studentTransferRouter.post('/', asyncHandler(async (req, res) => {
  await ensureTable();
  const role = req.auth.role;
  if (role !== 'admin' && role !== 'it_support') return res.status(403).json({ error: 'Not allowed' });
  const ids = (Array.isArray(req.body.studentIds) ? req.body.studentIds : [req.body.studentId]).filter(Boolean);
  const { classId } = req.body;
  if (!ids.length || !classId) return res.status(400).json({ error: 'Choose the students and the class to move them to.' });
  const cls = await query(`SELECT id, center_id FROM classes WHERE id = $1`, [classId]);
  if (!cls.rows[0]) return res.status(400).json({ error: 'That class was not found.' });
  const target = cls.rows[0].center_id;

  if (role === 'it_support') {
    const r = await query(`UPDATE students SET class_id = $1, center_id = $3 WHERE id = ANY($2::uuid[])`, [classId, ids, target]);
    return res.json({ moved: r.rowCount });
  }
  if (String(target) !== String(req.auth.centerId)) return res.status(403).json({ error: 'Only IT support can move students to another center.' });
  const st = await query(`SELECT id, class_id FROM students WHERE id = ANY($1::uuid[]) AND center_id = $2`, [ids, req.auth.centerId]);
  let requested = 0, already = 0;
  for (const s of st.rows) {
    const dupe = await query(`SELECT 1 FROM student_transfers WHERE student_id = $1 AND status = 'PENDING'`, [s.id]);
    if (dupe.rows[0]) { already++; continue; }
    await query(`INSERT INTO student_transfers (student_id, from_center, from_class, to_center, to_class, requested_by) VALUES ($1,$2,$3,$4,$5,$6)`,
      [s.id, req.auth.centerId, s.class_id, target, classId, who(req)]);
    requested++;
  }
  res.json({ requested, already });
}));

// Pending transfer requests. IT support sees all; a school admin sees their own center's.
studentTransferRouter.get('/requests', asyncHandler(async (req, res) => {
  await ensureTable();
  const role = req.auth.role;
  if (role !== 'admin' && role !== 'it_support') return res.status(403).json({ error: 'Not allowed' });
  const { rows } = await query(
    `SELECT t.id, t.requested_at, s.full_name, s.school_id_number,
            fc.name AS from_class, tc.name AS to_class, ce.name AS from_center, ct.name AS to_center
     FROM student_transfers t
     JOIN students s ON s.id = t.student_id
     LEFT JOIN classes fc ON fc.id = t.from_class
     LEFT JOIN classes tc ON tc.id = t.to_class
     LEFT JOIN centers ce ON ce.id = t.from_center
     LEFT JOIN centers ct ON ct.id = t.to_center
     WHERE t.status = 'PENDING' AND ($1 OR t.from_center = $2)
     ORDER BY t.requested_at DESC`, [role === 'it_support', req.auth.centerId]);
  res.json(rows);
}));

async function resolve(req, res, approve) {
  await ensureTable();
  if (req.auth.role !== 'it_support') return res.status(403).json({ error: 'Only IT support can approve transfers.' });
  const r = await query(`SELECT * FROM student_transfers WHERE id = $1 AND status = 'PENDING'`, [req.params.id]);
  const t = r.rows[0];
  if (!t) return res.status(404).json({ error: 'Request not found or already handled' });
  if (approve) {
    const c = await query(`SELECT 1 FROM classes WHERE id = $1`, [t.to_class]);
    if (!c.rows[0]) return res.status(400).json({ error: 'The destination class no longer exists.' });
    await query(`UPDATE students SET class_id = $1, center_id = $2 WHERE id = $3`, [t.to_class, t.to_center, t.student_id]);
  }
  await query(`UPDATE student_transfers SET status = $1, resolved_at = now() WHERE id = $2`, [approve ? 'APPROVED' : 'REJECTED', t.id]);
  res.json({ ok: true });
}
studentTransferRouter.post('/requests/:id/approve', asyncHandler((req, res) => resolve(req, res, true)));
studentTransferRouter.post('/requests/:id/reject', asyncHandler((req, res) => resolve(req, res, false)));

// ---------- Class teacher: view the whole class's results ----------
studentTransferRouter.get('/class-results/mine', asyncHandler(async (req, res) => {
  if (req.auth.role !== 'teacher') return res.json([]);
  const { rows } = await query(`SELECT id, name, section FROM classes WHERE class_teacher_id = $1 ORDER BY name`, [who(req)]);
  res.json(rows);
}));

studentTransferRouter.get('/class-results', asyncHandler(async (req, res) => {
  if (req.auth.role !== 'teacher') return res.status(403).json({ error: 'Only class teachers can use this.' });
  const { examId, classId } = req.query;
  const c = await query(`SELECT id, name, section, center_id FROM classes WHERE id = $1 AND class_teacher_id = $2`, [classId, who(req)]);
  if (!c.rows[0]) return res.status(403).json({ error: 'You are not the class teacher of this class.' });
  const cls = c.rows[0];
  const [stu, subs] = await Promise.all([
    query(`SELECT id, full_name FROM students WHERE class_id = $1 ORDER BY full_name`, [classId]),
    query(`SELECT id, name FROM subjects WHERE center_id = $1 AND (section IS NULL OR section = $2) ORDER BY name`, [cls.center_id, cls.section]),
  ]);
  const ids = stu.rows.map((s) => s.id);
  const m = ids.length ? await query(`SELECT student_id, subject_id, percent, sublevel, points FROM marks WHERE exam_id = $1 AND student_id = ANY($2::uuid[])`, [examId, ids]) : { rows: [] };
  const by = {};
  m.rows.forEach((x) => { (by[x.student_id] = by[x.student_id] || {})[x.subject_id] = { percent: x.percent, sublevel: x.sublevel, points: x.points }; });
  const level = (p) => (p == null ? null : p >= 7 ? 'EE' : p >= 5 ? 'ME' : p >= 3 ? 'AE' : 'BE');
  const results = stu.rows.map((s) => {
    const marks = by[s.id] || {}, pts = Object.values(marks).map((x) => Number(x.points)).filter((n) => !isNaN(n));
    const mean = pts.length ? pts.reduce((a, b) => a + b, 0) / pts.length : null;
    return { student: { id: s.id, full_name: s.full_name }, marks, subjectsGraded: pts.length, meanPoints: mean, meanLevel: level(mean == null ? null : Math.round(mean)) };
  });
  const graded = results.filter((r) => r.meanPoints != null);
  results.forEach((r) => { r.position = r.meanPoints == null ? null : 1 + graded.filter((g) => g.meanPoints > r.meanPoints).length; });
  res.json({ class: { id: cls.id, name: cls.name }, subjects: subs.rows, results });
}));

// ---------- Duplicate IDs, bulk delete, ID checks ----------
// Two IDs are the same if they match once "MOHI-" is ignored (MOHI-025100 and 025100 are the same ID).
const KEY = `regexp_replace(upper(trim(school_id_number)), '^MOHI-', '')`;
const keyOf = (v) => String(v || '').trim().toUpperCase().replace(/^MOHI-/, '');
const isStaff = (req) => req.auth.role === 'admin' || req.auth.role === 'it_support';

// Is this ID already used anywhere (any center)?
studentTransferRouter.get('/id-taken', asyncHandler(async (req, res) => {
  const r = await query(`SELECT center_id FROM students WHERE ${KEY} = $1 LIMIT 1`, [keyOf(req.query.id)]);
  res.json({ taken: !!r.rows[0], mine: !!r.rows[0] && String(r.rows[0].center_id) === String(req.auth.centerId) });
}));

// Which of these IDs are already used anywhere? Returns the normalised keys that are taken.
studentTransferRouter.post('/check-ids', asyncHandler(async (req, res) => {
  const keys = (Array.isArray(req.body.ids) ? req.body.ids : []).map(keyOf).filter(Boolean);
  if (!keys.length) return res.json({ taken: [] });
  const r = await query(`SELECT DISTINCT ${KEY} AS k FROM students WHERE ${KEY} = ANY($1)`, [keys]);
  res.json({ taken: r.rows.map((x) => x.k) });
}));

// Students whose ID is used more than once. IT support sees every center.
// A school admin only sees the groups that include their own center, with other centers hidden.
studentTransferRouter.get('/duplicates', asyncHandler(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Not allowed' });
  const build = (marks) => `SELECT * FROM (
      SELECT s.id, s.full_name, s.school_id_number, s.center_id, c.name AS class_name, ce.name AS center_name,
             regexp_replace(upper(trim(s.school_id_number)), '^MOHI-', '') AS key ${marks}
      FROM students s LEFT JOIN classes c ON c.id = s.class_id LEFT JOIN centers ce ON ce.id = s.center_id) x
    WHERE key IN (SELECT ${KEY} FROM students GROUP BY 1 HAVING count(*) > 1) ORDER BY key, school_id_number`;
  let rows;
  try { rows = (await query(build(`, (SELECT count(*) FROM marks m WHERE m.student_id = s.id)::int AS marks`))).rows; }
  catch { rows = (await query(build(`, 0 AS marks`))).rows; }
  const it = req.auth.role === 'it_support', groups = {};
  rows.forEach((r) => { (groups[r.key] = groups[r.key] || []).push(r); });
  const out = [];
  Object.values(groups).forEach((g) => {
    if (!it && !g.some((r) => String(r.center_id) === String(req.auth.centerId))) return;
    g.forEach((r) => {
      const mine = it || String(r.center_id) === String(req.auth.centerId);
      out.push(mine ? { ...r, mine: true } : { id: r.id, key: r.key, mine: false, full_name: 'A student in another center', school_id_number: r.school_id_number, marks: 0 });
    });
  });
  res.json(out);
}));

// Delete many students at once (and their marks and remarks). Admin: own center. IT support: any.
studentTransferRouter.post('/delete-students', asyncHandler(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Not allowed' });
  let ids = (Array.isArray(req.body.ids) ? req.body.ids : []).filter(Boolean);
  if (!ids.length) return res.status(400).json({ error: 'Choose at least one student.' });
  if (req.auth.role === 'admin') {
    ids = (await query(`SELECT id FROM students WHERE id = ANY($1::uuid[]) AND center_id = $2`, [ids, req.auth.centerId])).rows.map((r) => r.id);
    if (!ids.length) return res.status(404).json({ error: 'Those students were not found in your center.' });
  }
  for (const sql of [
    `DELETE FROM marks WHERE student_id = ANY($1::uuid[])`,
    `DELETE FROM remarks WHERE student_id = ANY($1::uuid[])`,
    `DELETE FROM student_transfers WHERE student_id = ANY($1::uuid[])`,
  ]) { try { await query(sql, [ids]); } catch { /* table may not exist; ignore */ } }
  try {
    const r = await query(`DELETE FROM students WHERE id = ANY($1::uuid[])`, [ids]);
    res.json({ deleted: r.rowCount });
  } catch { res.status(409).json({ error: 'Could not delete: these students still have linked records.' }); }
}));

// Add "MOHI-" to IDs that are only numbers (skips any that would create a duplicate).
studentTransferRouter.post('/normalize-ids', asyncHandler(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Not allowed' });
  const it = req.auth.role === 'it_support';
  const r = await query(
    `UPDATE students s SET school_id_number = 'MOHI-' || s.school_id_number
     WHERE s.school_id_number ~ '^[0-9]+$' AND ($1 OR s.center_id = $2)
       AND NOT EXISTS (SELECT 1 FROM students o WHERE o.id <> s.id AND upper(trim(o.school_id_number)) = 'MOHI-' || s.school_id_number)`,
    [it, req.auth.centerId]);
  res.json({ fixed: r.rowCount });
}));
