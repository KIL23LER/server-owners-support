import { Router } from "express";
import { db } from "@workspace/db";
import { adminsTable, usersTable, templatesTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/admin/users", requireAdmin, async (_req, res) => {
  const admins = await db.select().from(adminsTable);
  res.json(admins.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  })));
});

router.post("/admin/users", requireAdmin, async (req, res) => {
  const { discordId } = req.body;

  if (!discordId || typeof discordId !== "string") {
    res.status(400).json({ error: "Discord ID مطلوب" });
    return;
  }

  const existing = await db.query.adminsTable.findFirst({
    where: eq(adminsTable.discordId, discordId),
  });

  if (existing) {
    res.status(409).json({ error: "هذا المستخدم أدمن مسبقاً" });
    return;
  }

  const [admin] = await db.insert(adminsTable).values({
    discordId,
    addedBy: req.user!.discordId,
  }).returning();

  res.status(201).json({ ...admin, createdAt: admin.createdAt.toISOString() });
});

router.delete("/admin/users/:discordId", requireAdmin, async (req, res) => {
  const { discordId } = req.params;

  await db.delete(adminsTable).where(eq(adminsTable.discordId, discordId));
  res.json({ success: true });
});

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const [templateCount] = await db.select({ count: count() }).from(templatesTable);
  const [adminCount] = await db.select({ count: count() }).from(adminsTable);
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const featuredTemplates = await db.select().from(templatesTable);

  res.json({
    totalTemplates: templateCount.count,
    totalAdmins: adminCount.count,
    totalUsers: userCount.count,
    featuredTemplates: featuredTemplates.filter((t) => t.featured).length,
  });
});

export default router;
