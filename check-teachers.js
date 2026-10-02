import 'dotenv/config';
import { pool } from './src/lib/db.js';
try {
  const r = await pool.query(`SELECT full_name, email, (password_hash IS NOT NULL) AS has_password, must_change_password FROM teachers ORDER BY full_name`);
  console.table(r.rows);
} catch (e) { console.error('Error:', e.message); }
await pool.end();
