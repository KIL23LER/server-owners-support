import { type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { sessionsTable, adminsTable, usersTable } from "@workspace/db";
import { eq, gt, and } from "drizzle-orm";

export interface AuthUser {
  discordId: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

async function getSessionUser(token: string): Promise<AuthUser | null> {
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

  return {
    discordId: user.discordId,
    username: user.username,
    globalName: user.globalName,
    avatar: user.avatar,
    isAdmin: admin.length > 0,
  };
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const header = req.headers["x-session-token"];
  if (typeof header === "string") return header;
  return null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }

  const user = await getSessionUser(token);
  if (!user) {
    res.status(401).json({ error: "جلسة غير صالحة أو منتهية" });
    return;
  }

  req.user = user;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }

  const user = await getSessionUser(token);
  if (!user) {
    res.status(401).json({ error: "جلسة غير صالحة أو منتهية" });
    return;
  }

  if (!user.isAdmin) {
    res.status(403).json({ error: "يجب أن تكون أدمن" });
    return;
  }

  req.user = user;
  next();
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const user = await getSessionUser(token);
    if (user) req.user = user;
  }
  next();
}
