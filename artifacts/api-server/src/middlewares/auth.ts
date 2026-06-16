import { type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { sessionsTable, adminsTable } from "@workspace/db/schema";
import { eq, gt } from "drizzle-orm";

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

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.headers["x-session-token"] as string;

  if (!token) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }

  const now = new Date();
  const session = await db.query.sessionsTable.findFirst({
    where: (s) => eq(s.token, token) && gt(s.expiresAt, now),
    with: { user: true },
  });

  if (!session) {
    res.status(401).json({ error: "جلسة غير صالحة أو منتهية" });
    return;
  }

  const admin = await db.query.adminsTable.findFirst({
    where: eq(adminsTable.discordId, session.user.discordId),
  });

  req.user = {
    discordId: session.user.discordId,
    username: session.user.username,
    globalName: session.user.globalName,
    avatar: session.user.avatar,
    isAdmin: !!admin,
  };

  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, async () => {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: "يجب أن تكون أدمن" });
      return;
    }
    next();
  });
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.headers["x-session-token"] as string;

  if (!token) {
    next();
    return;
  }

  const now = new Date();
  const session = await db.query.sessionsTable.findFirst({
    where: (s) => eq(s.token, token) && gt(s.expiresAt, now),
    with: { user: true },
  });

  if (session) {
    const admin = await db.query.adminsTable.findFirst({
      where: eq(adminsTable.discordId, session.user.discordId),
    });

    req.user = {
      discordId: session.user.discordId,
      username: session.user.username,
      globalName: session.user.globalName,
      avatar: session.user.avatar,
      isAdmin: !!admin,
    };
  }

  next();
}
