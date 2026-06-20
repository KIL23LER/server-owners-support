import { cp, mkdir, rm } from "node:fs/promises";
import { execSync } from "node:child_process";
import { build as esbuild } from "esbuild";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

globalThis.require = createRequire(import.meta.url);

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, "dist");

console.log("🧹 Cleaning previous output...");
await rm(dist, { recursive: true, force: true });

console.log("📦 Building frontend...");
execSync("pnpm --filter @workspace/sos-website build", {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env, PORT: "3000", BASE_PATH: "/", NODE_ENV: "production" },
});

console.log("📂 Copying static files to dist/...");
await mkdir(dist, { recursive: true });
await cp(
  path.join(root, "artifacts/sos-website/dist/public"),
  dist,
  { recursive: true }
);

console.log("⚡ Building Cloudflare Pages Function...");
const funcDir = path.join(root, "functions", "api");
await mkdir(funcDir, { recursive: true });

await esbuild({
  entryPoints: [path.join(root, "artifacts/api-server/src/cf-handler.ts")],
  platform: "node",
  target: "node20",
  bundle: true,
  format: "esm",
  outfile: path.join(funcDir, "[[path]].js"),
  logLevel: "warning",
  define: { "process.env.NODE_ENV": '"production"' },
  external: [
    "*.node", "pg-native", "sharp", "canvas", "bcrypt", "argon2",
    "fsevents", "re2", "bufferutil", "utf-8-validate", "lightningcss",
    "oracledb", "better-sqlite3", "sqlite3", "dd-trace", "newrelic",
    "snappy", "piscina", "electron", "puppeteer", "puppeteer-core",
    "playwright", "pino-pretty", "thread-stream",
  ],
  tsconfig: path.join(root, "artifacts/api-server/tsconfig.json"),
  banner: {
    js: `import { createRequire as __cr } from 'node:module';
import __p from 'node:path';
import __u from 'node:url';
globalThis.require = __cr(import.meta.url);
globalThis.__filename = __u.fileURLToPath(import.meta.url);
globalThis.__dirname = __p.dirname(globalThis.__filename);`,
  },
});

console.log("✅ Cloudflare Pages build ready!");
console.log("   Static files  → dist/");
console.log("   CF Function   → functions/api/[[path]].js");
