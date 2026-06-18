import { Router } from "express";
import { db, templatesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, optionalAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/templates", async (req, res) => {
  const { category, featured } = req.query;
  let templates = await db.select().from(templatesTable).orderBy(desc(templatesTable.createdAt));
  if (category && typeof category === "string") templates = templates.filter((t) => t.category === category);
  if (featured === "true") templates = templates.filter((t) => t.featured);
  return res.json(templates.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })));
});

router.get("/templates/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرف غير صالح" });
  const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, id)).limit(1);
  if (!template) return res.status(404).json({ error: "القالب غير موجود" });
  return res.json({ ...template, createdAt: template.createdAt.toISOString() });
});

router.post("/templates", requireAdmin, async (req, res) => {
  const user = req.user!;
  const { name, description, imageUrl, templateCode, category, featured } = req.body;
  if (!name || !description || !templateCode || !category)
    return res.status(400).json({ error: "الحقول المطلوبة ناقصة" });

  const [template] = await db.insert(templatesTable).values({
    name,
    description,
    imageUrl: imageUrl || null,
    templateCode: templateCode.replace("https://discord.new/", "").trim(),
    category,
    featured: featured ?? false,
    createdBy: user.discordId,
  }).returning();

  return res.status(201).json({ ...template, createdAt: template.createdAt.toISOString() });
});

router.put("/templates/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرف غير صالح" });

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
});

router.delete("/templates/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرف غير صالح" });
  await db.delete(templatesTable).where(eq(templatesTable.id, id));
  return res.json({ success: true });
});

router.get("/discord-template/:code", async (req, res) => {
  const { code } = req.params;
  if (!code || !/^[a-zA-Z0-9]+$/.test(code)) {
    return res.status(400).json({ error: "كود القالب غير صالح" });
  }
  try {
    const resp = await fetch(`https://discord.com/api/v10/guilds/templates/${code}`, {
      headers: { "User-Agent": "SOS-Website/1.0" },
    });
    if (!resp.ok) {
      return res.status(resp.status).json({ error: "لم يتم العثور على القالب في Discord" });
    }
    const data = await resp.json();
    return res.json(data);
  } catch {
    return res.status(502).json({ error: "تعذّر الاتصال بـ Discord" });
  }
});

export default router;
