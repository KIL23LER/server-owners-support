import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, settingsTable } from "../../_lib/db.js";
import { extractToken, getSessionUser, cors } from "../../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PUT") return res.status(405).end();

  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  const user = await getSessionUser(token);
  if (!user?.isAdmin) return res.status(403).json({ error: "يجب أن تكون أدمن" });

  const key = String(req.query.key);
  const { value } = req.body;
  if (!value || typeof value !== "string") return res.status(400).json({ error: "القيمة مطلوبة" });

  await db.insert(settingsTable)
    .values({ key, value, updatedBy: user.discordId })
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: { value, updatedAt: new Date(), updatedBy: user.discordId },
    });

  return res.json({ success: true, key, value });
}
