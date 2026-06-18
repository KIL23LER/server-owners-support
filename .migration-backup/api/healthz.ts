// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "./_lib/auth.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  return res.json({ status: "ok" });
}
