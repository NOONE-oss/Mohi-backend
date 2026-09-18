import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function migrate() {
  try {
    console.log('Connecting to DB...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Tables created successfully!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();