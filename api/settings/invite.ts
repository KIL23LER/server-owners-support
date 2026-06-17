import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, settingsTable } from "../_lib/db.js";
import { eq } from "drizzle-orm";
import { cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const row = await db.query.settingsTable.findFirst({ where: eq(settingsTable.key, "discord_invite") });
  return res.json({ invite: row?.value ?? "https://discord.gg/264549513333702657" });
}
