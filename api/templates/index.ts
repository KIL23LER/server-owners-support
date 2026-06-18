// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, templatesTable } from "../_lib/db.js";
import { desc } from "drizzle-orm";
import { extractToken, getSessionUser, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const { category, featured } = req.query;
    let templates = await db.select().from(templatesTable).orderBy(desc(templatesTable.createdAt));
    if (category && typeof category === "string") templates = templates.filter((t) => t.category === category);
    if (featured === "true") templates = templates.filter((t) => t.featured);
    return res.json(templates.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })));
  }

  if (req.method === "POST") {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "غير مصرح" });
    const user = await getSessionUser(token);
    if (!user?.isAdmin) return res.status(403).json({ error: "يجب أن تكون أدمن" });

    const { name, description, imageUrl, templateCode, category, featured } = req.body;
    if (!name || !description || !templateCode || !category)
      return res.status(400).json({ error: "الحقول المطلوبة ناقصة" });

    const insertVals = {
      name, description,
      imageUrl: imageUrl || null,
      templateCode: templateCode.replace("https://discord.new/", "").trim(),
      category,
      featured: featured ?? false,
      createdBy: user.discordId,
    } as any;

    const [template] = await db.insert(templatesTable).values(insertVals).returning();

    return res.status(201).json({ ...template, createdAt: template.createdAt.toISOString() });
  }

  return res.status(405).end();
}
