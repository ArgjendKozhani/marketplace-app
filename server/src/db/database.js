import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));
const { Pool } = pg;

let pool;

function getPoolConfig() {
  const connectionString = process.env.DATABASE_URL;
  const sslEnabled = (process.env.DB_SSL || 'true').toLowerCase() === 'true';

  if (!connectionString) {
    throw new Error('DATABASE_URL is required. Add it to server/.env or your hosting environment variables.');
  }

  return {
    connectionString,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false
  };
}

export async function initializeDatabase() {
  if (pool) {
    return pool;
  }

  pool = new Pool(getPoolConfig());
  await pool.query('SELECT 1');
  const schemaSql = await readFile(schemaPath, 'utf8');
  await pool.query(schemaSql);
  return pool;
}

export async function getPool() {
  if (!pool) {
    await initializeDatabase();
  }

  return pool;
}
