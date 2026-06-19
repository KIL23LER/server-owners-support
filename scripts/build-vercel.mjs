import { cp, mkdir, writeFile, rm } from "node:fs/promises";
import { execSync } from "node:child_process";
import { build as esbuild } from "esbuild";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

globalThis.require = createRequire(import.meta.url);

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output = path.join(root, ".vercel", "output");

console.log("🧹 Cleaning previous output...");
await rm(output, { recursive: true, force: true });

console.log("📦 Building frontend...");
execSync("pnpm --filter @workspace/sos-website build", {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env, PORT: "3000", BASE_PATH: "/", NODE_ENV: "production" },
});

console.log("📂 Copying static files...");
await mkdir(path.join(output, "static"), { recursive: true });
await cp(
  path.join(root, "artifacts/sos-website/dist/public"),
  path.join(output, "static"),
  { recursive: true }
);

console.log("⚡ Building serverless function...");
const funcDir = path.join(output, "functions/api.func");
await mkdir(funcDir, { recursive: true });

const result = await esbuild({
  entryPoints: [path.join(root, "artifacts/api-server/src/serverless.ts")],
  platform: "node",
  target: "node20",
  bundle: true,
  format: "esm",
  outfile: path.join(funcDir, "index.mjs"),
  logLevel: "warning",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  external: [
    "*.node",
    "pg-native",
    "sharp",
    "canvas",
    "bcrypt",
    "argon2",
    "fsevents",
    "re2",
    "bufferutil",
    "utf-8-validate",
    "lightningcss",
    "oracledb",
    "better-sqlite3",
    "sqlite3",
    "@aws-sdk/*",
    "@azure/*",
    "@google-cloud/*",
    "googleapis",
    "firebase-admin",
    "nodemailer",
    "handlebars",
    "knex",
    "typeorm",
    "sequelize",
    "prisma",
    "@prisma/client",
    "mysql2",
    "dd-trace",
    "newrelic",
    "snappy",
    "piscina",
    "electron",
    "puppeteer",
    "puppeteer-core",
    "playwright",
    "pino-pretty",
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

if (result.warnings.length > 0) {
  console.warn("⚠️  esbuild warnings:", result.warnings.map(w => w.text).join(", "));
}
console.log("✓ Serverless function built successfully");

await writeFile(
  path.join(funcDir, ".vc-config.json"),
  JSON.stringify({
    runtime: "nodejs20.x",
    handler: "index.mjs",
    launcherType: "Nodejs",
    shouldAddHelpers: true,
  })
);

console.log("🗺️ Writing routing config...");
await writeFile(
  path.join(output, "config.json"),
  JSON.stringify({
    version: 3,
    routes: [
      { src: "^/api(/.*)?$", dest: "/api" },
      { handle: "filesystem" },
      { src: "^/.*$", dest: "/index.html" },
    ],
  })
);

console.log("✅ Vercel output ready in .vercel/output/");
