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
