import { Router } from 'express';
import { query } from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const teachersRouter = Router();
teachersRouter.use(requireAuth);

teachersRouter.get('/', async (req, res) => {
  const { rows } = await query(
    `SELECT t.*,
       COALESCE(json_agg(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL), '[]') AS class_ids,
       COALESCE(json_agg(DISTINCT s.id) FILTER (WHERE s.id IS NOT NULL), '[]') AS subject_ids
     FROM teachers t
     LEFT JOIN class_teachers ct ON ct.teacher_id = t.id
     LEFT JOIN classes c ON c.id = ct.class_id
     LEFT JOIN teacher_subjects ts ON ts.teacher_id = t.id
     LEFT JOIN subjects s ON s.id = ts.subject_id
     WHERE t.center_id = $1
     GROUP BY t.id
     ORDER BY t.full_name`,
    [req.auth.centerId]
  );
  res.json(rows);
});

teachersRouter.post('/', requireRole('admin'), async (req, res) => {
  const { fullName, phone, bio, section, classId, subjectId } = req.body;
  if (!fullName || !section) return res.status(400).json({ error: 'fullName and section are required' });

  const { rows } = await query(
    `INSERT INTO teachers (center_id, full_name, phone, bio, section) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.auth.centerId, fullName, phone || null, bio || null, section]
  );
  const teacher = rows[0];

  if (classId) {
    await query(`INSERT INTO class_teachers (class_id, teacher_id)
                 SELECT id, $2 FROM classes WHERE id = $1 AND center_id = $3
                 ON CONFLICT DO NOTHING`, [classId, teacher.id, req.auth.centerId]);
  }
  if (subjectId) {
    await query(`INSERT INTO teacher_subjects (teacher_id, subject_id)
                 SELECT $1, id FROM subjects WHERE id = $2 AND center_id = $3
                 ON CONFLICT DO NOTHING`, [teacher.id, subjectId, req.auth.centerId]);
  }
  res.status(201).json(teacher);
});

teachersRouter.patch('/:id', requireRole('admin'), async (req, res) => {
  const { fullName, phone, bio } = req.body;
  const { rows } = await query(
    `UPDATE teachers SET full_name = COALESCE($1, full_name), phone = $2, bio = $3
     WHERE id = $4 AND center_id = $5 RETURNING *`,
    [fullName || null, phone || null, bio || null, req.params.id, req.auth.centerId]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Teacher not found' });
  res.json(rows[0]);
});

teachersRouter.delete('/:id', requireRole('admin'), async (req, res) => {
  const { rowCount } = await query(`DELETE FROM teachers WHERE id = $1 AND center_id = $2`, [req.params.id, req.auth.centerId]);
  if (!rowCount) return res.status(404).json({ error: 'Teacher not found' });
  res.status(204).end();
});
