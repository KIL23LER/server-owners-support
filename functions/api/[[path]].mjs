import serverless from "serverless-http";
import app from "../../artifacts/api-server/dist/app.mjs";

const handler = serverless(app);

export async function onRequest(context) {
  return handler(context.request, context.env, context);
}
