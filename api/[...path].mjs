import serverless from "serverless-http";
import app from "../artifacts/api-server/dist/app.mjs";

export default serverless(app);
