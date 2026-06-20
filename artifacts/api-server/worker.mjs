import serverless from "serverless-http";
import app from "./dist/app.mjs";

const handler = serverless(app);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handler(request, env, ctx);
    }
    return env.ASSETS.fetch(request);
  },
};

