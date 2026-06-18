import type { VercelRequest, VercelResponse } from "@vercel/node";
import pkg from "pg";

const { Client } = pkg;

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  discord_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  global_name TEXT,
  avatar TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  discord_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  discord_id TEXT NOT NULL UNIQUE,
  added_by TEXT NOT NULL,
  is_owner BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  template_code TEXT NOT NULL,
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_by TEXT NOT NULL
);
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers["x-migrate-secret"] !== process.env.MIGRATE_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(SQL);
    await client.end();

    const check = new Client({
      connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await check.connect();
    const result = await check.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
    await check.end();

    return res.json({ success: true, tables: result.rows.map((r: { table_name: string }) => r.table_name) });
  } catch (err: unknown) {
    return res.status(500).json({ error: String(err) });
  }
}
