import { type Request } from "express";
import { db } from "@workspace/db";
import { sessionsTable, adminsTable, usersTable } from "@workspace/db";
import { eq, gt, and } from "drizzle-orm";

export interface AuthUser {
  discordId: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  isAdmin: boolean;
  isOwner: boolean;
}

export function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const header = req.headers["x-session-token"];
  if (typeof header === "string") return header;
  return null;
}

export async function getSessionUser(token: string): Promise<AuthUser | null> {
  const now = new Date();

  const rows = await db
    .select()
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.discordId, usersTable.discordId))
    .where(and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, now)))
    .limit(1);

  if (!rows[0]) return null;

  const { users: user } = rows[0];

  const admin = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.discordId, user.discordId))
    .limit(1);

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(user.discordId) >> 22n) % 6}.png`;

  return {
    discordId: user.discordId,
    username: user.username,
    globalName: user.globalName,
    avatar: avatarUrl,
    isAdmin: admin.length > 0,
    isOwner: admin[0]?.isOwner ?? false,
  };
}
