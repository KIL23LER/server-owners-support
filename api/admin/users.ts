import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, adminsTable } from "../_lib/db.js";
import { eq } from "drizzle-orm";
import { extractToken, getSessionUser, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  const user = await getSessionUser(token);
  if (!user?.isAdmin) return res.status(403).json({ error: "يجب أن تكون أدمن" });

  if (req.method === "GET") {
    const admins = await db.select().from(adminsTable);
    return res.json(admins.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })));
  }

  if (req.method === "POST") {
    const { discordId, isOwner } = req.body;
    if (!discordId || typeof discordId !== "string")
      return res.status(400).json({ error: "Discord ID مطلوب" });

    const existing = await db.query.adminsTable.findFirst({ where: eq(adminsTable.discordId, discordId) });
    if (existing) return res.status(409).json({ error: "هذا المستخدم أدمن مسبقاً" });

    const [admin] = await db.insert(adminsTable).values({
      discordId, addedBy: user.discordId, isOwner: isOwner === true,
    }).returning();

    return res.status(201).json({ ...admin, createdAt: admin.createdAt.toISOString() });
  }

  return res.status(405).end();
}
