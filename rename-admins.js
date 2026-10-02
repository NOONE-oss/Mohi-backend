import 'dotenv/config';
import pg from 'pg';

const apply = process.argv.includes('apply');
const force = process.argv.includes('force');
const url = (process.env.DATABASE_URL || '').replace(/\?.*$/, '');
const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
const rows = (sql, p) => pool.query(sql, p).then(r => r.rows);

// admin@ndovoini.mohiafrica.org  ->  ndovoini@mohiafrica.org
const newEmail = (old) => {
  const m = old.match(/^admin@([^.]+)\.mohiafrica\.org$/);
  return m ? `${m[1]}@mohiafrica.org` : null;
};

try {
  const admins = await rows(`SELECT id, email FROM admins WHERE role = 'school_admin' ORDER BY email`);
  const plan = admins.map(a => ({ id: a.id, from: a.email, to: newEmail(a.email) }));
  const todo = plan.filter(p => p.to);

  // conflicts: another admin or a teacher already using the new address
  const taken = new Set([
    ...(await rows(`SELECT lower(email) AS e FROM admins`)).map(r => r.e),
    ...(await rows(`SELECT lower(email) AS e FROM teachers WHERE email IS NOT NULL`)).map(r => r.e),
  ]);
  const conflicts = todo.filter(p => taken.has(p.to.toLowerCase()));
  const noEmail = await rows(`SELECT t.full_name, c.name AS center FROM teachers t JOIN centers c ON c.id = t.center_id
                              WHERE t.email IS NULL OR t.password_hash IS NULL ORDER BY c.name, t.full_name`);
  const shared = (await rows(`SELECT count(*)::int AS n FROM teacher_logins`))[0].n;

  console.log('\nPLAN (current -> new):');
  console.table(plan.map(p => ({ from: p.from, to: p.to || '(left as is)' })));
  console.log(`Shared teacher logins that will be removed: ${shared}`);
  console.log(`Teachers with no own email/password: ${noEmail.length}`);
  if (noEmail.length) console.table(noEmail);
  if (conflicts.length) { console.log('CONFLICTS (new address already used by an admin or teacher):'); console.table(conflicts); }

  if (!apply) {
    console.log('\nLook only. To make the change run:  node rename-admins.js apply\n');
  } else if (conflicts.length) {
    console.log('\nSTOPPED: fix the conflicts above first.\n');
  } else if (noEmail.length && !force) {
    console.log('\nSTOPPED: those teachers would be locked out. Give them an email + password in Teachers > Edit, or run: node rename-admins.js apply force\n');
  } else {
    await pool.query('BEGIN');
    const del = await pool.query(`DELETE FROM teacher_logins`);
    let n = 0;
    for (const p of todo) n += (await pool.query(`UPDATE admins SET email = $1 WHERE id = $2`, [p.to, p.id])).rowCount;
    await pool.query('COMMIT');
    console.log(`\nDONE. Shared teacher logins removed: ${del.rowCount}. Admin emails renamed: ${n}.\n`);
  }
<<<<<<< HEAD
} catch (e) {ss
=======
} catch (e) {
>>>>>>> 0cf90b78a0a74706685173638d2fd83a99148a58
  await pool.query('ROLLBACK').catch(() => {});
  console.error('Error:', e.message);
}
await pool.end();
