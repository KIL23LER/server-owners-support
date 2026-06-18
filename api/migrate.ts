// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { randomBytes } from "crypto";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = req.headers["x-migrate-secret"] || req.query.secret;
  if (secret !== process.env.MIGRATE_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL!);

  try {
    await sql`CREATE TABLE IF NOT EXISTS users (discord_id TEXT PRIMARY KEY, username TEXT NOT NULL, global_name TEXT, avatar TEXT, access_token TEXT NOT NULL, refresh_token TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL)`;
    await sql`CREATE TABLE IF NOT EXISTS sessions (id SERIAL PRIMARY KEY, token TEXT NOT NULL UNIQUE, discord_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE, expires_at TIMESTAMP NOT NULL, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`;
    await sql`CREATE TABLE IF NOT EXISTS admins (id SERIAL PRIMARY KEY, discord_id TEXT NOT NULL UNIQUE, added_by TEXT NOT NULL, is_owner BOOLEAN DEFAULT FALSE NOT NULL, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`;
    await sql`CREATE TABLE IF NOT EXISTS templates (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, image_url TEXT, template_code TEXT NOT NULL, category TEXT NOT NULL, featured BOOLEAN DEFAULT FALSE NOT NULL, created_by TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL)`;
    await sql`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_by TEXT NOT NULL)`;

    // Create a real test session to test frontend login flow
    if (req.query.create_session === "1") {
      const testDiscordId = "999999999999999999";
      const sessionToken = randomBytes(32).toString("hex");
      await sql`DELETE FROM sessions WHERE discord_id = ${testDiscordId}`;
      await sql`DELETE FROM users WHERE discord_id = ${testDiscordId}`;
      await sql`INSERT INTO users (discord_id, username, global_name, avatar, access_token, refresh_token) VALUES (${testDiscordId}, 'TestUser', 'اختبار', null, 'acc', 'ref')`;
      await sql`INSERT INTO sessions (token, discord_id, expires_at) VALUES (${sessionToken}, ${testDiscordId}, NOW() + INTERVAL '1 hour')`;
      return res.json({ success: true, session: sessionToken, loginUrl: `https://server-owners-support.vercel.app/?session=${sessionToken}` });
    }

    if (req.query.test === "1") {
      const testToken = "test-token-" + Date.now();
      const testDiscordId = "000000000000000001";
      await sql`DELETE FROM sessions WHERE discord_id = ${testDiscordId}`;
      await sql`DELETE FROM users WHERE discord_id = ${testDiscordId}`;
      await sql`INSERT INTO users (discord_id, username, global_name, avatar, access_token, refresh_token) VALUES (${testDiscordId}, 'TestUser', 'Test User', null, 'acc', 'ref')`;
      await sql`INSERT INTO sessions (token, discord_id, expires_at) VALUES (${testToken}, ${testDiscordId}, NOW() + INTERVAL '30 days')`;
      const rows = await sql`SELECT s.token, u.discord_id, u.username FROM sessions s INNER JOIN users u ON s.discord_id = u.discord_id WHERE s.token = ${testToken} AND s.expires_at > NOW() LIMIT 1`;
      await sql`DELETE FROM sessions WHERE discord_id = ${testDiscordId}`;
      await sql`DELETE FROM users WHERE discord_id = ${testDiscordId}`;
      return res.json({ success: true, tables: "ok", fullFlowTest: rows.length > 0 ? "PASS - session found: " + rows[0].username : "FAIL - session not found" });
    }

    return res.json({ success: true, message: "All tables created successfully", tables: ["users","sessions","admins","templates","settings"] });
  } catch (err) {
    return res.status(500).json({ error: "Migration failed", details: String(err) });
  }
}
