import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = req.headers["x-migrate-secret"] || req.query.secret;
  if (secret !== process.env.MIGRATE_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL!);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        discord_id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        global_name TEXT,
        avatar TEXT,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        discord_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        discord_id TEXT NOT NULL UNIQUE,
        added_by TEXT NOT NULL,
        is_owner BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    await sql`
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
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_by TEXT NOT NULL
      )
    `;

    return res.json({
      success: true,
      message: "All tables created successfully",
      tables: ["users", "sessions", "admins", "templates", "settings"]
    });
  } catch (err) {
    console.error("Migration error:", err);
    return res.status(500).json({ error: "Migration failed", details: String(err) });
  }
}
