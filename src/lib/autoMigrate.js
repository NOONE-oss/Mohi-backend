import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import { seed } from '../scripts/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Render's free plan has no Shell access, so there's no way to run
// `psql -f db/schema.sql` or `npm run seed` by hand. This makes the app
// set itself up on first boot instead:
//   1. If the `centers` table doesn't exist yet, run db/schema.sql.
//   2. If the `centers` table exists but is completely empty, seed demo data.
// Both checks are safe to run on every boot — an already-set-up database
// with real data in it just skips straight through, untouched.
export async function ensureSchema() {
  const { rows } = await pool.query(`SELECT to_regclass('public.centers') AS exists`);
  if (!rows[0].exists) {
    console.log('[startup] No schema found — applying db/schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '..', '..', 'db', 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('[startup] Schema applied.');
  }

  const { rows: countRows } = await pool.query(`SELECT count(*)::int AS n FROM centers`);
  if (countRows[0].n === 0) {
    console.log('[startup] Database is empty — running seed data...');
    await seed();
    console.log('[startup] Seed complete.');
  } else {
    console.log(`[startup] Database already has ${countRows[0].n} center(s) — skipping seed.`);
  }
}
