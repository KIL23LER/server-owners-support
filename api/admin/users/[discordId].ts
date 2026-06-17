import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, adminsTable } from "../../_lib/db.js";
import { eq } from "drizzle-orm";
import { extractToken, getSessionUser, cors } from "../../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "DELETE") return res.status(405).end();

  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  const user = await getSessionUser(token);
  if (!user?.isAdmin) return res.status(403).json({ error: "يجب أن تكون أدمن" });

  const discordId = String(req.query.discordId);
  const target = await db.query.adminsTable.findFirst({ where: eq(adminsTable.discordId, discordId) });

  if (target?.isOwner) return res.status(403).json({ error: "لا يمكن حذف Owner" });

  await db.delete(adminsTable).where(eq(adminsTable.discordId, discordId));
  return res.json({ success: true });
}
