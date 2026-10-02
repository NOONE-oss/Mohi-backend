import 'dotenv/config';
import pg from 'pg';

const apply = process.argv.includes('apply');
const force = process.argv.includes('force');
const url = (process.env.DATABASE_URL || '').replace(/\?.*$/, '');
const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  const noEmail = (await pool.query(
    `SELECT t.full_name, c.name AS center FROM teachers t JOIN centers c ON c.id = t.center_id
     WHERE t.email IS NULL OR t.password_hash IS NULL ORDER BY c.name, t.full_name`)).rows;
  const shared = (await pool.query(`SELECT count(*)::int AS n FROM teacher_logins`)).rows[0].n;

  console.log(`Shared teacher logins in database: ${shared}`);
  console.log(`Teachers with no own email/password: ${noEmail.length}`);
  console.table(noEmail);

  if (!apply) {
    console.log('Look only. To remove ALL shared logins run:  node remove-shared.js apply');
  } else if (noEmail.length && !force) {
    console.log('STOPPED: those teachers would be locked out. Give them an email + password in Teachers > Edit, or run: node remove-shared.js apply force');
  } else {
    const r = await pool.query(`DELETE FROM teacher_logins`);
    console.log(`DONE. Removed ${r.rowCount} shared teacher logins.`);
  }
} catch (e) { console.error('Error:', e.message); }
await pool.end();
