import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomBytes } from "crypto";
import { db, usersTable, sessionsTable } from "../_lib/db.js";
import { cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "https://server-owners-support.vercel.app/api/auth/callback";

  const { code } = req.query;
  if (!code || typeof code !== "string") return res.redirect("/?error=no_code");

  let step = "token_exchange";
  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      return res.redirect(`/?error=token_failed&detail=${encodeURIComponent(body.slice(0, 100))}`);
    }

    step = "user_fetch";
    const tokenData = await tokenRes.json() as { access_token: string; refresh_token: string };
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userRes.ok) return res.redirect("/?error=user_failed");

    step = "db_insert";
    const discordUser = await userRes.json() as {
      id: string; username: string; global_name?: string; avatar?: string;
    };

    const insertData = {
      discordId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name ?? null,
      avatar: discordUser.avatar ?? null,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    } as any;

    const updateData = {
      username: discordUser.username,
      globalName: discordUser.global_name ?? null,
      avatar: discordUser.avatar ?? null,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    } as any;

    await db.insert(usersTable).values(insertData).onConflictDoUpdate({
      target: usersTable.discordId,
      set: updateData,
    });

    step = "session_create";
    const sessionToken = randomBytes(32).toString("hex");
    await db.insert(sessionsTable).values({
      token: sessionToken,
      discordId: discordUser.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    let mobileRedirect: string | null = null;
    try {
      const stateStr = req.query.state as string | undefined;
      if (stateStr) {
        const parsed = JSON.parse(stateStr);
        if (parsed.mobile) {
          const base = parsed.redirect?.startsWith("sos-website-mobile://") ? parsed.redirect : "sos-website-mobile://auth";
          mobileRedirect = `${base}?session=${sessionToken}`;
        }
      }
    } catch {}

    if (mobileRedirect) return res.redirect(mobileRedirect);
    return res.redirect(`/?session=${sessionToken}`);
  } catch (err) {
    return res.redirect(`/?error=server_error&step=${step}&detail=${encodeURIComponent(String(err).slice(0, 150))}`);
  }
}
