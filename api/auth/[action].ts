import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, sessionsTable } from "../_lib/db.js";
import { eq } from "drizzle-orm";
import { extractToken, getSessionUser, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const action = req.query.action as string;

  if (action === "login") {
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
    const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "https://server-owners-support.vercel.app/api/auth/callback";
    const mobile = req.query.mobile === "true";
    const mobileRedirect = req.query.redirect as string | undefined;
    const state = mobile ? JSON.stringify({ mobile: true, redirect: mobileRedirect }) : undefined;
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "identify guilds",
      ...(state ? { state } : {}),
    });
    return res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
  }

  if (action === "me") {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "غير مصرح" });
    const user = await getSessionUser(token);
    if (!user) return res.status(401).json({ error: "جلسة غير صالحة أو منتهية" });
    return res.json(user);
  }

  if (action === "logout") {
    if (req.method !== "POST") return res.status(405).end();
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "غير مصرح" });
    const user = await getSessionUser(token);
    if (!user) return res.status(401).json({ error: "جلسة غير صالحة" });
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
    return res.json({ success: true });
  }

  return res.status(404).json({ error: "مسار غير موجود" });
}
