import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { execSync, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

globalThis.require = createRequire(import.meta.url);

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');
const apiServerDir = path.join(root, 'artifacts/api-server');

console.log('Cleaning previous output...');
await rm(dist, { recursive: true, force: true });

console.log('Building API server...');
execSync('pnpm --filter @workspace/api-server run build', {
  stdio: 'inherit',
  cwd: root,
  env: { ...process.env, NODE_ENV: 'production' },
});

console.log('Building frontend...');
execSync('pnpm --filter @workspace/sos-website build', {
  stdio: 'inherit',
  cwd: root,
  env: { ...process.env, PORT: '3000', BASE_PATH: '/', NODE_ENV: 'production' },
});

console.log('Copying static files...');
await mkdir(dist, { recursive: true });
await cp(
  path.join(root, 'artifacts/sos-website/dist/public'),
  dist,
  { recursive: true }
);

console.log('Bundling _worker.js for Cloudflare Pages...');
const workerOut = path.join(dist, '_worker.js');

// Create an isolated temp dir so esbuild can resolve serverless-http without
// fighting pnpm workspace symlinks.
const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'worker-build-'));
await cp(path.join(apiServerDir, 'worker.mjs'), path.join(tmpDir, 'worker.mjs'));
await cp(path.join(apiServerDir, 'dist'), path.join(tmpDir, 'dist'), { recursive: true });
await writeFile(
  path.join(tmpDir, 'package.json'),
  JSON.stringify({ type: 'module', dependencies: { 'serverless-http': '4.0.0' } })
);

console.log('Installing serverless-http in isolated dir...');
execSync('npm install --prefer-offline', { stdio: 'inherit', cwd: tmpDir });

const NODE_BUILTINS = [
  'assert','async_hooks','buffer','child_process','cluster','console',
  'constants','crypto','dgram','dns','domain','events','fs','http',
  'http2','https','inspector','module','net','os','path','perf_hooks',
  'process','punycode','querystring','readline','repl','stream',
  'string_decoder','sys','timers','tls','tty','url','util','v8','vm',
  'wasi','worker_threads','zlib',
];
const aliasFlags = NODE_BUILTINS.map(m => '--alias:' + m + '=node:' + m);
const esbuildBin = path.join(root, 'node_modules/.bin/esbuild');
const esbuildArgs = [
  esbuildBin,
  'worker.mjs',
  '--bundle',
  '--format=esm',
  '--platform=neutral',
  '--target=es2022',
  '--outfile=' + workerOut,
  ...aliasFlags,
  '--external:node:*',
  '--log-level=info',
].join(' ');

execSync(esbuildArgs, { stdio: 'inherit', cwd: tmpDir });

await rm(tmpDir, { recursive: true, force: true });

console.log('Build ready!  Static: dist/   Worker: dist/_worker.js');
