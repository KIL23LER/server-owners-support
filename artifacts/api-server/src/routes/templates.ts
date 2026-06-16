import { Router } from "express";
import { db } from "@workspace/db";
import { templatesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/templates", async (req, res) => {
  const { category, featured } = req.query;

  let query = db.select().from(templatesTable).orderBy(desc(templatesTable.createdAt));

  const templates = await query;

  let result = templates;
  if (category && typeof category === "string") {
    result = result.filter((t) => t.category === category);
  }
  if (featured === "true") {
    result = result.filter((t) => t.featured);
  }

  res.json(result.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  })));
});

router.get("/templates/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  const template = await db.query.templatesTable.findFirst({
    where: eq(templatesTable.id, id),
  });

  if (!template) {
    res.status(404).json({ error: "القالب غير موجود" });
    return;
  }

  res.json({ ...template, createdAt: template.createdAt.toISOString() });
});

router.post("/templates", requireAdmin, async (req, res) => {
  const { name, description, imageUrl, templateCode, category, featured } = req.body;

  if (!name || !description || !templateCode || !category) {
    res.status(400).json({ error: "الحقول المطلوبة ناقصة" });
    return;
  }

  const [template] = await db.insert(templatesTable).values({
    name,
    description,
    imageUrl: imageUrl || null,
    templateCode: templateCode.replace("https://discord.new/", "").trim(),
    category,
    featured: featured ?? false,
    createdBy: req.user!.discordId,
  }).returning();

  res.status(201).json({ ...template, createdAt: template.createdAt.toISOString() });
});

router.put("/templates/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  const { name, description, imageUrl, templateCode, category, featured } = req.body;

  const [updated] = await db.update(templatesTable)
    .set({
      ...(name && { name }),
      ...(description && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(templateCode && { templateCode: templateCode.replace("https://discord.new/", "").trim() }),
      ...(category && { category }),
      ...(featured !== undefined && { featured }),
      updatedAt: new Date(),
    })
    .where(eq(templatesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "القالب غير موجود" });
    return;
  }

  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.delete("/templates/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "معرف غير صالح" });
    return;
  }

  await db.delete(templatesTable).where(eq(templatesTable.id, id));
  res.json({ success: true });
});

export default router;
