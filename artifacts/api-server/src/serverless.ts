export default async function handler() {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "ok", env: process.env.NODE_ENV }),
  };
}
