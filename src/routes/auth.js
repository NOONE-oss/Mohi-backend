import { Router } from 'express';
import { query } from '../lib/db.js';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../lib/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

export const authRouter = Router();

// ---------- helpers ----------
async function issueAdminSession(admin, res) {
  if (admin.role === 'it_support') {
    const centers = await query(`SELECT id, name FROM centers WHERE is_active = true ORDER BY created_at DESC LIMIT 1`);
    if (!centers.rows[0]) return res.status(500).json({ error: 'No centers exist yet — add one first.' });
    const c = centers.rows[0];
    const token = signToken({ sub: admin.id, role: 'it_support', centerId: c.id });
    return res.json({ kind: 'admin', token, admin: { id: admin.id, name: admin.full_name, centerId: c.id }, isItSupport: true });
  }
  const token = signToken({ sub: admin.id, role: 'admin', centerId: admin.center_id });
  res.json({ kind: 'admin', token, admin: { id: admin.id, name: admin.full_name, centerId: admin.center_id }, isItSupport: false });
}

// ---------- UNIFIED LOGIN (Email / CIN) ----------
// Contains "@": admin -> individual teacher -> old shared teacher login.
// Anything else: student CIN.
authRouter.post('/login', asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) return res.status(400).json({ error: 'Enter your Email / CIN and password.' });
  const id = identifier.trim();
  const bad = () => res.status(401).json({ error: 'Incorrect Email / CIN or password' });

  if (id.includes('@')) {
    const email = id.toLowerCase();

    const a = await query(
      `SELECT id, center_id, role, full_name, password_hash FROM admins WHERE email = $1`, [email]);
    if (a.rows[0] && await verifyPassword(password, a.rows[0].password_hash)) {
      return issueAdminSession(a.rows[0], res);
    }

    // Individual teacher account
    const pt = await query(
      `SELECT id, center_id, full_name, section, password_hash, must_change_password
       FROM teachers WHERE lower(email) = $1`, [email]);
    if (pt.rows[0] && pt.rows[0].password_hash && await verifyPassword(password, pt.rows[0].password_hash)) {
      const tch = pt.rows[0];
      if (tch.must_change_password) {
        const resetToken = signToken({ sub: tch.id, role: 'teacher_reset', centerId: tch.center_id });
        return res.json({ kind: 'teacher_personal', needsPasswordChange: true, resetToken });
      }
      const token = signToken({ sub: tch.id, role: 'teacher', centerId: tch.center_id, section: tch.section });
      return res.json({ kind: 'teacher_personal', token, teacher: { id: tch.id, full_name: tch.full_name, section: tch.section } });
    }

    // Old shared teacher login (kept until you retire it)
    const t = await query(
      `SELECT id, center_id, password_hash FROM teacher_logins WHERE email = $1`, [email]);
    if (t.rows[0] && await verifyPassword(password, t.rows[0].password_hash)) {
      const teachers = await query(
        `SELECT id, full_name FROM teachers WHERE center_id = $1 ORDER BY full_name`, [t.rows[0].center_id]);
      const pendingToken = signToken({ role: 'teacher_pending', centerId: t.rows[0].center_id });
      return res.json({ kind: 'teacher', pendingToken, teachers: teachers.rows });
    }
    return bad();
  }

  const s = await query(
    `SELECT id, center_id, full_name, password_hash, password_changed FROM students WHERE school_id_number = $1`, [id]);
  const student = s.rows[0];
  if (!student || !(await verifyPassword(password, student.password_hash))) return bad();

  if (!student.password_changed) {
    const resetToken = signToken({ sub: student.id, role: 'student_reset', centerId: student.center_id });
    return res.json({ kind: 'student', needsPasswordChange: true, resetToken });
  }
  const token = signToken({ sub: student.id, role: 'student', centerId: student.center_id });
  res.json({ kind: 'student', token, student: { id: student.id, name: student.full_name } });
}));

// Forced first-login password change (teachers and students).
authRouter.post('/set-password', asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) return res.status(400).json({ error: 'resetToken and newPassword are required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  let claims;
  try { claims = verifyToken(resetToken); }
  catch { return res.status(401).json({ error: 'Session expired, please sign in again' }); }

  const hash = await hashPassword(newPassword);

  if (claims.role === 'teacher_reset') {
    const { rows } = await query(
      `UPDATE teachers SET password_hash = $1, must_change_password = false WHERE id = $2
       RETURNING id, center_id, full_name, section`, [hash, claims.sub]);
    if (!rows[0]) return res.status(404).json({ error: 'Teacher not found' });
    const t = rows[0];
    const token = signToken({ sub: t.id, role: 'teacher', centerId: t.center_id, section: t.section });
    return res.json({ kind: 'teacher', token, teacher: { id: t.id, full_name: t.full_name, section: t.section } });
  }
  if (claims.role === 'student_reset') {
    await query(`UPDATE students SET password_hash = $1, password_changed = true WHERE id = $2`, [hash, claims.sub]);
    const token = signToken({ sub: claims.sub, role: 'student', centerId: claims.centerId });
    return res.json({ kind: 'student', token });
  }
  return res.status(401).json({ error: 'Invalid reset token' });
}));

// ---------- OLDER ROUTES (kept so nothing else breaks) ----------
authRouter.post('/admin/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
  const { rows } = await query(
    `SELECT id, center_id, role, full_name, password_hash FROM admins WHERE email = $1`,
    [email.trim().toLowerCase()]);
  const admin = rows[0];
  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }
  return issueAdminSession(admin, res);
}));

// IT support: switch centers mid-session.
authRouter.post('/admin/switch-center', asyncHandler(async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const { centerId } = req.body;
  if (!token || !centerId) return res.status(400).json({ error: 'Bearer token and centerId are required' });

  let claims;
  try { claims = verifyToken(token); }
  catch { return res.status(401).json({ error: 'Session expired, please sign in again' }); }
  if (claims.role !== 'it_support') return res.status(403).json({ error: 'Only IT support can switch centers' });

  const center = await query(`SELECT id, name FROM centers WHERE id = $1 AND is_active = true`, [centerId]);
  if (!center.rows[0]) return res.status(404).json({ error: 'Center not found' });

  const newToken = signToken({ sub: claims.sub, role: 'it_support', centerId });
  res.json({ token: newToken, center: center.rows[0] });
}));

// Shared teacher login step 2: pick your name.
authRouter.post('/teacher/select', asyncHandler(async (req, res) => {
  const { pendingToken, teacherId } = req.body;
  if (!pendingToken || !teacherId) return res.status(400).json({ error: 'pendingToken and teacherId are required' });

  let claims;
  try { claims = verifyToken(pendingToken); }
  catch { return res.status(401).json({ error: 'Sign-in expired, please sign in again' }); }
  if (claims.role !== 'teacher_pending') return res.status(401).json({ error: 'Invalid token for this step' });

  const { rows } = await query(
    `SELECT id, full_name, section FROM teachers WHERE id = $1 AND center_id = $2`,
    [teacherId, claims.centerId]);
  if (!rows[0]) return res.status(403).json({ error: 'That teacher is not at this center' });

  const token = signToken({ sub: teacherId, role: 'teacher', centerId: claims.centerId, section: rows[0].section });
  res.json({ token, teacher: rows[0] });
}));

authRouter.post('/student/set-password', asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) return res.status(400).json({ error: 'resetToken and newPassword are required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  let claims;
  try { claims = verifyToken(resetToken); }
  catch { return res.status(401).json({ error: 'Reset session expired, please sign in again' }); }
  if (claims.role !== 'student_reset') return res.status(401).json({ error: 'Invalid reset token' });
  const passwordHash = await hashPassword(newPassword);
  await query(`UPDATE students SET password_hash = $1, password_changed = true WHERE id = $2`, [passwordHash, claims.sub]);
  const token = signToken({ sub: claims.sub, role: 'student', centerId: claims.centerId });
  res.json({ token });
}));
