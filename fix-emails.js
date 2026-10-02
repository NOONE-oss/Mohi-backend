import 'dotenv/config';
import pg from 'pg';

const OLD_ADMIN = 'admin@school.mohiafrica.org';
const NEW_ADMIN = 'school@mohiafrica.org';
const apply = process.argv.includes('apply');
const force = process.argv.includes('force');

const url = (process.env.DATABASE_URL || '').replace(/\?.*$/, ''); // drop ?sslmode=... so our ssl setting wins
console.log('Connecting to:', url.replace(/:\/\/.*@/, '://***@'));
const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
const rows = (sql, p) => pool.query(sql, p).then(r => r.rows);

try {
  const admins = await rows(`SELECT email, role, center_id FROM admins ORDER BY email`);
  const shared = await rows(`SELECT email, center_id FROM teacher_logins ORDER BY email`);
  const teachers = await rows(`SELECT full_name, email, (password_hash IS NOT NULL) AS has_password, must_change_password FROM teachers ORDER BY full_name`);
  const noEmail = teachers.filter(t => !t.email);

  console.log('\nADMINS:'); console.table(admins);
  console.log('SHARED TEACHER LOGINS:'); console.table(shared);
  console.log('TEACHERS:'); console.table(teachers);
  console.log(`Teachers without their own email: ${noEmail.length}`);

  if (!apply) {
    console.log('\nLook only. To make the change run:  node fix-emails.js apply\n');
  } else if (!admins.some(a => a.email === OLD_ADMIN)) {
    console.log(`\nSTOPPED: no admin with email ${OLD_ADMIN}. Use a real address from the ADMINS table, edit OLD_ADMIN on line 4, run again.\n`);
  } else if (noEmail.length && !force) {
    console.log('\nSTOPPED: some teachers have no own email and would be locked out. Set emails in Teachers > Edit first, or run: node fix-emails.js apply force\n');
  } else {
    await pool.query('BEGIN');
    const del = await pool.query(`DELETE FROM teacher_logins WHERE lower(email) = $1`, [NEW_ADMIN]);
    const upd = await pool.query(`UPDATE admins SET email = $1 WHERE email = $2`, [NEW_ADMIN, OLD_ADMIN]);
    await pool.query('COMMIT');
    console.log(`\nDONE. Shared login rows removed: ${del.rowCount}. Admin rows updated: ${upd.rowCount}.\n`);
  }
} catch (err) {
  await pool.query('ROLLBACK').catch(() => {});
  console.error('Error:', err.message);
} finally {
  await pool.end();
}