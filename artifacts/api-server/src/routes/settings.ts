import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/settings/invite", async (_req, res) => {
  const row = await db.query.settingsTable.findFirst({
    where: eq(settingsTable.key, "discord_invite"),
  });
  res.json({ invite: row?.value ?? "https://discord.gg/264549513333702657" });
});

export default router;
