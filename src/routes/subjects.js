import { Router } from 'express';
import { query } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { catalogByLevel } from '../lib/curriculum.js';

export const subjectsRouter = Router();
subjectsRouter.use(requireAuth);

subjectsRouter.get('/', asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM subjects WHERE center_id = $1 ORDER BY name`,
    [req.auth.centerId]
  );
  res.json(rows);
}));

subjectsRouter.post('/', requireRole('admin'), asyncHandler(async (req, res) => {
  const { name, code, section } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const { rows } = await query(
    `INSERT INTO subjects (center_id, name, code, section) VALUES ($1, $2, $3, $4) RETURNING *`,
    [req.auth.centerId, name, code || null, section || null]
  );
  res.status(201).json(rows[0]);
}));

subjectsRouter.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const { rowCount } = await query(`DELETE FROM subjects WHERE id = $1 AND center_id = $2`, [req.params.id, req.auth.centerId]);
  if (!rowCount) return res.status(404).json({ error: 'Subject not found' });
  res.status(204).end();
}));

// The official CBC learning areas by level (Pre-Primary, Lower/Upper Primary,
// Junior, Senior), marking which ones this center already has.
subjectsRouter.get('/catalog', requireRole('admin'), asyncHandler(async (req, res) => {
  const { rows } = await query(`SELECT name FROM subjects WHERE center_id = $1`, [req.auth.centerId]);
  const have = new Set(rows.map(r => r.name.toLowerCase()));
  res.json(catalogByLevel().map(l => ({
    ...l,
    subjects: l.subjects.map(s => ({ ...s, added: have.has(s.name.toLowerCase()) })),
  })));
}));

// Add the chosen catalog subjects (by name) to this center. Safe to repeat.
subjectsRouter.post('/from-catalog', requireRole('admin'), asyncHandler(async (req, res) => {
  const names = Array.isArray(req.body.names) ? req.body.names : [];
  const wanted = new Map();
  for (const level of catalogByLevel()) for (const s of level.subjects) wanted.set(s.name.toLowerCase(), s);
  let added = 0;
  for (const n of names) {
    const s = wanted.get(String(n).toLowerCase());
    if (!s) continue;
    const r = await query(
      `INSERT INTO subjects (center_id, name, section)
       SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE center_id = $1 AND lower(name) = lower($2))`,
      [req.auth.centerId, s.name, s.section]
    );
    added += r.rowCount;
  }
  res.json({ added });
}));
