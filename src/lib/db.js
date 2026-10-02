import 'dotenv/config';
import pg from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  keepAlive: true
})

// Thin query helper. Deliberately NOT an ORM: for a system whose cent
// promise is "one center can never see another's data," every query t
// touches a center-scoped table should have its WHERE center_id = $1
// visible in the code, not hidden behind an abstraction. See lib/scop
// for the helper that makes this hard to forget.
export async function query(text, params) {
  return pool.query(text, params);
}