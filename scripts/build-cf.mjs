import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

globalThis.require = createRequire(import.meta.url);

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');

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

console.log('Writing _redirects for SPA routing...');
await writeFile(path.join(dist, '_redirects'), '/* /index.html 200\n');

console.log('Build ready! Static files -> dist/');