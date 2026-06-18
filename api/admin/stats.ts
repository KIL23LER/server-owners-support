// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, templatesTable, adminsTable, usersTable } from "../_lib/db.js";
import { count } from "drizzle-orm";
import { extractToken, getSessionUser, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  const user = await getSessionUser(token);
  if (!user?.isAdmin) return res.status(403).json({ error: "يجب أن تكون أدمن" });

  const [templateCount] = await db.select({ count: count() }).from(templatesTable);
  const [adminCount] = await db.select({ count: count() }).from(adminsTable);
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const featuredTemplates = await db.select().from(templatesTable);

  return res.json({
    totalTemplates: templateCount.count,
    totalAdmins: adminCount.count,
    totalUsers: userCount.count,
    featuredTemplates: featuredTemplates.filter((t) => t.featured).length,
  });
}
