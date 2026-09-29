const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://mohi_results_db_ui2h_user:StAfmpIUHEMA8ygo133J9j3A2AmGUS0f@dpg-damfqkh42hec738upb3g-a.oregon-postgres.render.com/mohi_results_db_ui2h',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const res = await pool.query("UPDATE admins SET email = 'school@mohiafrica.org' WHERE email = 'admin@school.mohiafrica.org'");
  console.log('UPDATE result:', res.rowCount);
  const check = await pool.query("SELECT email FROM admins");
  console.log('All admins now:', check.rows);
  await pool.end();
}
run();