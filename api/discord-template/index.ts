import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).end();

  let code = req.query.code as string;
  if (!code) return res.status(400).json({ error: "code is required" });

  code = code.trim()
    .replace(/^https?:\/\/discord\.new\//, "")
    .replace(/^https?:\/\/discord\.com\/template\//, "");

  try {
    const discordRes = await fetch(`https://discord.com/api/v10/guilds/templates/${code}`, {
      headers: { "User-Agent": "SOS-Website/1.0" },
    });

    if (!discordRes.ok) {
      const err = await discordRes.text().catch(() => "");
      return res.status(discordRes.status).json({ error: "Template not found", detail: err });
    }

    const data = await discordRes.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch template from Discord" });
  }
}
