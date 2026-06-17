import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, usersTable } from "../_lib/db.js";
import { eq } from "drizzle-orm";
import { extractToken, getSessionUser, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: "جلسة غير صالحة" });

  const dbUser = await db.query.usersTable.findFirst({ where: eq(usersTable.discordId, user.discordId) });
  if (!dbUser) return res.status(401).json({ error: "المستخدم غير موجود" });

  const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${dbUser.accessToken}` },
  });
  if (!guildsRes.ok) return res.status(400).json({ error: "فشل في جلب السيرفرات" });

  const guilds = await guildsRes.json() as Array<{ id: string; name: string; icon: string | null; owner: boolean; permissions: string }>;
  return res.json(guilds.filter((g) => g.owner).map((g) => ({ id: g.id, name: g.name, icon: g.icon, owner: g.owner })));
}
