import { Router } from "express";
import { db } from "@workspace/db";
import { templatesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

async function discordRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${DISCORD_API}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  return res;
}

async function getUserGuilds(accessToken: string): Promise<string[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  const guilds: Array<{ id: string; permissions: string }> = await res.json();
  return guilds
    .filter((g) => (BigInt(g.permissions) & 0x8n) === 0x8n)
    .map((g) => g.id);
}

router.post("/bot/apply", requireAuth, async (req, res) => {
  if (!BOT_TOKEN) {
    res.status(500).json({ error: "البوت غير مُعدّ في السيرفر" });
    return;
  }

  const { guildId, templateId } = req.body;

  if (!guildId || !templateId) {
    res.status(400).json({ error: "guildId و templateId مطلوبان" });
    return;
  }

  const userRow = await db.query.usersTable.findFirst({
    where: eq(usersTable.discordId, req.user!.discordId),
  });

  if (!userRow?.accessToken) {
    res.status(401).json({ error: "تعذّر الحصول على صلاحيات Discord، أعد تسجيل الدخول" });
    return;
  }

  const adminGuilds = await getUserGuilds(userRow.accessToken);
  if (!adminGuilds.includes(String(guildId))) {
    res.status(403).json({ error: "ليس لديك صلاحية ADMINISTRATOR في هذا السيرفر" });
    return;
  }

  const template = await db.query.templatesTable.findFirst({
    where: eq(templatesTable.id, Number(templateId)),
  });

  if (!template) {
    res.status(404).json({ error: "القالب غير موجود" });
    return;
  }

  const rawCode = template.templateCode.trim();
  const templateCode = rawCode
    .replace(/^https?:\/\/discord\.new\//, "")
    .replace(/^https?:\/\/discord\.com\/template\//, "")
    .trim();

  const tplRes = await discordRequest(`/guilds/templates/${templateCode}`);
  if (!tplRes.ok) {
    const errBody = await tplRes.text();
    console.error("Discord template fetch failed:", tplRes.status, errBody);
    res.status(400).json({ error: "فشل جلب بيانات القالب من Discord" });
    return;
  }

  const tplData = await tplRes.json();
  const source = tplData.serialized_source_guild;

  if (!source) {
    res.status(400).json({ error: "بيانات القالب غير صالحة" });
    return;
  }

  const roleIdMap: Record<string, string> = {};

  for (const role of source.roles ?? []) {
    if (role.name === "@everyone") continue;
    const r = await discordRequest(`/guilds/${guildId}/roles`, {
      method: "POST",
      body: JSON.stringify({
        name: role.name,
        color: role.color ?? 0,
        permissions: String(role.permissions ?? "0"),
        mentionable: role.mentionable ?? false,
        hoist: role.hoist ?? false,
      }),
    });
    if (r.ok) {
      const newRole = await r.json();
      roleIdMap[role.id] = newRole.id;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  const categoryIdMap: Record<string, string> = {};

  for (const ch of source.channels ?? []) {
    if (ch.type !== 4) continue;
    const r = await discordRequest(`/guilds/${guildId}/channels`, {
      method: "POST",
      body: JSON.stringify({ name: ch.name, type: 4, position: ch.position ?? 0 }),
    });
    if (r.ok) {
      const newCh = await r.json();
      categoryIdMap[ch.id] = newCh.id;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  for (const ch of source.channels ?? []) {
    if (ch.type === 4) continue;
    const parentId = ch.parent_id ? categoryIdMap[ch.parent_id] : undefined;
    await discordRequest(`/guilds/${guildId}/channels`, {
      method: "POST",
      body: JSON.stringify({
        name: ch.name,
        type: ch.type ?? 0,
        position: ch.position ?? 0,
        ...(parentId ? { parent_id: parentId } : {}),
        ...(ch.topic ? { topic: ch.topic } : {}),
      }),
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  await discordRequest(`/guilds/${guildId}/members/@me`, {
    method: "DELETE",
  });

  res.json({ success: true });
});

export default router;
