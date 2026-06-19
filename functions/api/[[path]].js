import serverless from "serverless-http";
import app from "../../artifacts/api-server/dist/app.mjs";

export const onRequest = serverless(app);
