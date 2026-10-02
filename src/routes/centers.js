import { Router } from 'express';
import { query } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import { hashPassword } from '../lib/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

export const centersRouter = Router();
centersRouter.use(requireAuth);

// "Babadogo Center" -> "babadogo", used to build admin@<slug>.mohiafrica.org
function slugify(name) {
  return name.replace(/\bcenter\b/i, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

centersRouter.get('/', asyncHandler(async (req, res) => {
  if (req.auth.role === 'it_support') {
    const { rows } = await query(`SELECT * FROM centers ORDER BY name`);
    return res.json(rows);
  }
  const { rows } = await query(`SELECT * FROM centers WHERE id = $1`, [req.auth.centerId]);
  res.json(rows);
}));

// Only IT support onboards new centers. A new center gets ONE login: its school
// admin. Teachers are added by that admin under Teachers, each with their own
// email and password (no shared teacher login any more).
const DEFAULT_ADMIN_PASSWORD = 'Admin@2026';

centersRouter.post('/', (req, res, next) => {
  if (req.auth.role !== 'it_support') return res.status(403).json({ error: 'Only IT support can add centers' });
  next();
}, asyncHandler(async (req, res) => {
  const { name, centerCode, location } = req.body;
  if (!name || !centerCode) return res.status(400).json({ error: 'name and centerCode are required' });

  const dupe = await query(`SELECT id FROM centers WHERE center_code = $1`, [centerCode.trim().toUpperCase()]);
  if (dupe.rows[0]) return res.status(409).json({ error: `Center code "${centerCode}" is already in use` });

  const slug = slugify(name);
  const adminEmail = `${slug}@mohiafrica.org`;
  const emailDupe = await query(`SELECT 1 FROM admins WHERE email = $1`, [adminEmail]);
  if (emailDupe.rows[0]) return res.status(409).json({ error: `A login for "${slug}" already exists — pick a more distinct center name.` });

  const { rows } = await query(
    `INSERT INTO centers (name, center_code, location) VALUES ($1, $2, $3) RETURNING *`,
    [name, centerCode.trim().toUpperCase(), location || null]
  );
  const center = rows[0];

  await query(
    `INSERT INTO admins (center_id, role, full_name, email, password_hash) VALUES ($1, 'school_admin', $2, $3, $4)`,
    [center.id, `${name} Admin`, adminEmail, await hashPassword(DEFAULT_ADMIN_PASSWORD)]
  );

  res.status(201).json({
    ...center,
    logins: { admin: { email: adminEmail, password: DEFAULT_ADMIN_PASSWORD } },
  });
}));

centersRouter.patch('/:id/active', (req, res, next) => {
  if (req.auth.role !== 'it_support') return res.status(403).json({ error: 'Only IT support can do this' });
  next();
}, asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const { rows } = await query(`UPDATE centers SET is_active = $1 WHERE id = $2 RETURNING *`, [!!isActive, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Center not found' });
  res.json(rows[0]);
}));

// Org-wide headline numbers for IT's dashboard (counts only).
centersRouter.get('/org-stats', (req, res, next) => {
  if (req.auth.role !== 'it_support') return res.status(403).json({ error: 'Only IT support can see org-wide totals' });
  next();
}, asyncHandler(async (req, res) => {
  const [centers, students, teachers, perCenter] = await Promise.all([
    query(`SELECT count(*)::int AS n FROM centers WHERE is_active = true`),
    query(`SELECT count(*)::int AS n FROM students`),
    query(`SELECT count(*)::int AS n FROM teachers`),
    query(`
      SELECT c.id, c.name,
        (SELECT count(*)::int FROM students s WHERE s.center_id = c.id) AS student_count,
        (SELECT count(*)::int FROM teachers t WHERE t.center_id = c.id) AS teacher_count
      FROM centers c WHERE c.is_active = true ORDER BY c.name
    `),
  ]);
  res.json({
    centers: centers.rows[0].n,
    students: students.rows[0].n,
    teachers: teachers.rows[0].n,
    perCenter: perCenter.rows,
  });
}));
