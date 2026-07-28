import { Router } from 'express';
import { query } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

export const centersRouter = Router();
centersRouter.use(requireAuth);

// IT support sees every center (this is the whole point of the IT dimension —
// one view across all ~42 as they're onboarded). A school_admin only ever
// sees their own single center here, for consistency/display purposes —
// they still can't query another center's classes/students/etc. even if they
// somehow learned its id, since every other route filters by req.auth.centerId,
// which a school_admin's token can't change.
centersRouter.get('/', async (req, res) => {
  if (req.auth.role === 'it_support') {
    const { rows } = await query(`SELECT * FROM centers ORDER BY name`);
    return res.json(rows);
  }
  const { rows } = await query(`SELECT * FROM centers WHERE id = $1`, [req.auth.centerId]);
  res.json(rows);
});

// Only IT support onboards new centers — this is deliberately not exposed to
// requireRole('admin'), so a school_admin can never create a center (which
// would otherwise let them mint data outside their own walled-off scope).
centersRouter.post('/', (req, res, next) => {
  if (req.auth.role !== 'it_support') return res.status(403).json({ error: 'Only IT support can add centers' });
  next();
}, async (req, res) => {
  const { name, centerCode, location } = req.body;
  if (!name || !centerCode) return res.status(400).json({ error: 'name and centerCode are required' });

  const dupe = await query(`SELECT id FROM centers WHERE center_code = $1`, [centerCode.trim().toUpperCase()]);
  if (dupe.rows[0]) return res.status(409).json({ error: `Center code "${centerCode}" is already in use` });

  const { rows } = await query(
    `INSERT INTO centers (name, center_code, location) VALUES ($1, $2, $3) RETURNING *`,
    [name, centerCode.trim().toUpperCase(), location || null]
  );
  res.status(201).json(rows[0]);
});

centersRouter.patch('/:id/active', (req, res, next) => {
  if (req.auth.role !== 'it_support') return res.status(403).json({ error: 'Only IT support can do this' });
  next();
}, async (req, res) => {
  const { isActive } = req.body;
  const { rows } = await query(`UPDATE centers SET is_active = $1 WHERE id = $2 RETURNING *`, [!!isActive, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Center not found' });
  res.json(rows[0]);
});
