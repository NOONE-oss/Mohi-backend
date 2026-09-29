require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();

  // See exact columns
  const cols = await client.query(`
    SELECT column_name, is_nullable
    FROM information_schema.columns
    WHERE table_name='admins' ORDER BY ordinal_position
  `);
  console.log('Columns:', cols.rows);

  const hash = await bcrypt.hash('Admin@123', 10);

  await client.query(`
    INSERT INTO admins (school_name, role, email, password_hash)
    VALUES ('MOHI', 'school_admin', 'school@mohiafrica.org', $1)
    ON CONFLICT (email) DO UPDATE SET password_hash = $1, school_name='MOHI', role='school_admin'
  `, [hash]);

  console.log('DONE! Now login: school@mohiafrica.org / Admin@123');

  const all = await client.query("SELECT email, school_name, role FROM admins");
  console.log(all.rows);

  client.release();
  await pool.end();
}
run();