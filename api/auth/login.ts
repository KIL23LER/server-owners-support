import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "../_lib/auth.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

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

  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
}
