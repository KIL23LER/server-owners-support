import serverless from "serverless-http";
import app from "../../artifacts/api-server/dist/app.mjs";

// Cloudflare Pages Functions require { fetch } object export
const handler = serverless(app);
export default { fetch: handler };
