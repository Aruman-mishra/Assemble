const { createClient } = require('@libsql/client');

let client;
function getDb() {
  if (!client) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error('TURSO_DATABASE_URL / TURSO_AUTH_TOKEN not set — add them in Vercel → Settings → Environment Variables');
    }
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

let initialized = false;
async function ensureTables() {
  if (initialized) return;
  const db = getDb();
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS portfolios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT, role TEXT, about TEXT, niche TEXT,
    data_json TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  initialized = true;
}

module.exports = { getDb, ensureTables };
