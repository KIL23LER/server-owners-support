import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, sessionsTable, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "https://server-owners-support.vercel.app/api/auth/callback";

router.get("/auth/login", (_req, res) => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds",
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

router.get("/auth/callback", async (req, res) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    res.redirect("/?error=no_code");
    return;
  }

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
      res.redirect("/?error=token_failed");
      return;
    }

    const tokenData = await tokenRes.json() as { access_token: string; refresh_token: string };

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      res.redirect("/?error=user_failed");
      return;
    }

    const discordUser = await userRes.json() as {
      id: string;
      username: string;
      global_name?: string;
      avatar?: string;
    };

    await db.insert(usersTable).values({
      discordId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name ?? null,
      avatar: discordUser.avatar ?? null,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    }).onConflictDoUpdate({
      target: usersTable.discordId,
      set: {
        username: discordUser.username,
        globalName: discordUser.global_name ?? null,
        avatar: discordUser.avatar ?? null,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      },
    });

    const sessionToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(sessionsTable).values({
      token: sessionToken,
      discordId: discordUser.id,
      expiresAt,
    });

    res.redirect(`/?session=${sessionToken}`);
  } catch (err) {
    req.log.error({ err }, "OAuth callback error");
    res.redirect("/?error=server_error");
  }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  res.json(req.user);
});

router.post("/auth/logout", requireAuth, async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.headers["x-session-token"] as string;
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  res.json({ success: true });
});

router.get("/discord/guilds", requireAuth, async (req, res) => {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.discordId, req.user!.discordId),
  });

  if (!user) {
    res.status(401).json({ error: "المستخدم غير موجود" });
    return;
  }

  const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${user.accessToken}` },
  });

  if (!guildsRes.ok) {
    res.status(400).json({ error: "فشل في جلب السيرفرات" });
    return;
  }

  const guilds = await guildsRes.json() as Array<{
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
  }>;

  const ownerGuilds = guilds.filter((g) => g.owner);
  res.json(ownerGuilds.map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    owner: g.owner,
  })));
});

export default router;
