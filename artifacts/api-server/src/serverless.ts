import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

let handler: APIGatewayProxyHandlerV2;
let initError: Error | null = null;

try {
  const serverless = await import("serverless-http");
  const { default: app } = await import("./app.js");
  handler = serverless.default(app) as APIGatewayProxyHandlerV2;
} catch (err) {
  initError = err instanceof Error ? err : new Error(String(err));
  console.error("SERVERLESS INIT ERROR:", initError.stack || initError.message);
}

export default async function (event: unknown, context: unknown) {
  if (initError) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "Init failed",
        message: initError.message,
        stack: initError.stack,
      }),
    };
  }
  return handler!(event as any, context as any, () => {});
}
