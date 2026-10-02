import 'dotenv/config';
import pg from 'pg';

const url = (process.env.DATABASE_URL || '').replace(/\?.*$/, '');
const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
try {
  const admins = await pool.query(`SELECT email, role, center_id FROM admins ORDER BY email`);
  const shared = await pool.query(`SELECT email, center_id FROM teacher_logins ORDER BY email`);
  console.log('ADMINS:'); console.table(admins.rows);
  console.log('SHARED TEACHER LOGINS:'); console.table(shared.rows);
  const hit = admins.rows.find(a => a.email === 'school@mohiafrica.org');
  console.log(hit
    ? 'YES: school@mohiafrica.org IS an admin account.'
    : 'NO: school@mohiafrica.org is NOT an admin account yet.');
} catch (e) { console.error('Error:', e.message); }
await pool.end();