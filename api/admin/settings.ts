import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, settingsTable } from "../_lib/db.js";
import { extractToken, getSessionUser, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  const user = await getSessionUser(token);
  if (!user?.isAdmin) return res.status(403).json({ error: "يجب أن تكون أدمن" });

  if (req.method === "GET") {
    const settings = await db.select().from(settingsTable);
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    return res.json(map);
  }

  return res.status(405).end();
}
