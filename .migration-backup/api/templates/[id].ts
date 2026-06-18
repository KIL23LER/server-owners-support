// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, templatesTable } from "../_lib/db.js";
import { eq } from "drizzle-orm";
import { extractToken, getSessionUser, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const id = parseInt(String(req.query.id));
  if (isNaN(id)) return res.status(400).json({ error: "معرف غير صالح" });

  if (req.method === "GET") {
    const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, id)).limit(1);
    if (!template) return res.status(404).json({ error: "القالب غير موجود" });
    return res.json({ ...template, createdAt: template.createdAt.toISOString() });
  }

  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  const user = await getSessionUser(token);
  if (!user?.isAdmin) return res.status(403).json({ error: "يجب أن تكون أدمن" });

  if (req.method === "PUT") {
    const { name, description, imageUrl, templateCode, category, featured } = req.body;
    const [updated] = await db.update(templatesTable).set({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(templateCode !== undefined && { templateCode: templateCode.replace("https://discord.new/", "").trim() }),
      ...(category !== undefined && { category }),
      ...(featured !== undefined && { featured }),
      updatedAt: new Date(),
    }).where(eq(templatesTable.id, id)).returning();

    if (!updated) return res.status(404).json({ error: "القالب غير موجود" });
    return res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  }

  if (req.method === "DELETE") {
    await db.delete(templatesTable).where(eq(templatesTable.id, id));
    return res.json({ success: true });
  }

  return res.status(405).end();
}
