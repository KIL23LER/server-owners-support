import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Global error handler — must have 4 params for Express to treat it as error middleware
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const msg = err instanceof Error ? err.message : String(err);
  try { req.log?.error({ err }, "Unhandled error"); } catch {}
  // If this is an auth callback, redirect instead of crashing
  if (req.path?.includes("/auth/callback")) {
    res.redirect(`/?error=server_error&detail=${encodeURIComponent(msg.slice(0, 200))}`);
    return;
  }
  if (!res.headersSent) {
    res.status(500).json({ error: "خطأ داخلي في الخادم" });
  }
});

export default app;
