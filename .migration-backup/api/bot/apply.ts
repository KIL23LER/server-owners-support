// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, templatesTable, usersTable } from "../_lib/db.js";
import { eq } from "drizzle-orm";
import { extractToken, getSessionUser, cors } from "../_lib/auth.js";

const DISCORD_API = "https://discord.com/api/v10";

async function discordBot(path: string, options: RequestInit = {}) {
  return fetch(`${DISCORD_API}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

async function getUserAdminGuilds(accessToken: string): Promise<string[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  const guilds: Array<{ id: string; permissions: string }> = await res.json();
  return guilds.filter((g) => (BigInt(g.permissions) & 0x8n) === 0x8n).map((g) => g.id);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  if (!process.env.DISCORD_BOT_TOKEN)
    return res.status(500).json({ error: "البوت غير مُعدّ في السيرفر" });

  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: "جلسة غير صالحة" });

  const { guildId, templateId } = req.body;
  if (!guildId || !templateId) return res.status(400).json({ error: "guildId و templateId مطلوبان" });

  const userRow = await db.query.usersTable.findFirst({ where: eq(usersTable.discordId, user.discordId) });
  if (!userRow?.accessToken) return res.status(401).json({ error: "تعذّر الحصول على صلاحيات Discord، أعد تسجيل الدخول" });

  const adminGuilds = await getUserAdminGuilds(userRow.accessToken);
  if (!adminGuilds.includes(String(guildId)))
    return res.status(403).json({ error: "ليس لديك صلاحية ADMINISTRATOR في هذا السيرفر" });

  const template = await db.query.templatesTable.findFirst({ where: eq(templatesTable.id, Number(templateId)) });
  if (!template) return res.status(404).json({ error: "القالب غير موجود" });

  const templateCode = template.templateCode.trim()
    .replace(/^https?:\/\/discord\.new\//, "")
    .replace(/^https?:\/\/discord\.com\/template\//, "");

  const tplRes = await discordBot(`/guilds/templates/${templateCode}`);
  if (!tplRes.ok) return res.status(400).json({ error: "فشل جلب بيانات القالب من Discord" });

  const tplData = await tplRes.json();
  const source = tplData.serialized_source_guild;
  if (!source) return res.status(400).json({ error: "بيانات القالب غير صالحة" });

  const categoryIdMap: Record<string, string> = {};
  const delay = () => new Promise((r) => setTimeout(r, 300));

  for (const role of source.roles ?? []) {
    if (role.name === "@everyone") continue;
    await discordBot(`/guilds/${guildId}/roles`, {
      method: "POST",
      body: JSON.stringify({ name: role.name, color: role.color ?? 0, permissions: String(role.permissions ?? "0"), mentionable: role.mentionable ?? false, hoist: role.hoist ?? false }),
    });
    await delay();
  }

  for (const ch of source.channels ?? []) {
    if (ch.type !== 4) continue;
    const r = await discordBot(`/guilds/${guildId}/channels`, {
      method: "POST",
      body: JSON.stringify({ name: ch.name, type: 4, position: ch.position ?? 0 }),
    });
    if (r.ok) { const newCh = await r.json(); categoryIdMap[ch.id] = newCh.id; }
    await delay();
  }

  for (const ch of source.channels ?? []) {
    if (ch.type === 4) continue;
    const parentId = ch.parent_id ? categoryIdMap[ch.parent_id] : undefined;
    await discordBot(`/guilds/${guildId}/channels`, {
      method: "POST",
      body: JSON.stringify({ name: ch.name, type: ch.type ?? 0, position: ch.position ?? 0, ...(parentId ? { parent_id: parentId } : {}), ...(ch.topic ? { topic: ch.topic } : {}) }),
    });
    await delay();
  }

  await discordBot(`/guilds/${guildId}/members/@me`, { method: "DELETE" });
  return res.json({ success: true });
}
