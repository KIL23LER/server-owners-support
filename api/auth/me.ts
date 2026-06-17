import type { VercelRequest, VercelResponse } from "@vercel/node";
import { extractToken, getSessionUser, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "غير مصرح" });

  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: "جلسة غير صالحة أو منتهية" });

  return res.json(user);
}
