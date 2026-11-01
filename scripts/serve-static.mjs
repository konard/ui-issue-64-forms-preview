#!/usr/bin/env node
/**
 * Static server for the Playwright UI tests (playwright.config.mjs).
 *
 * Mounts:
 *   /tests/ui/pages/          -> tests/ui/pages/
 *   /packages/<name>/e2e/pages/ -> packages/<name>/e2e/pages/ (when present)
 *   /example-app/             -> examples/universal-app/dist/
 *
 * Usage: node scripts/serve-static.mjs [--port 4173] [--host 127.0.0.1]
 */
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { startStaticServer } from './lib/static-server.mjs';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

/**
 * @param {string} root repository root
 * @returns {{prefix: string, dir: string}[]}
 */
export function defaultMounts(root) {
  const mounts = [
    {
      prefix: '/tests/ui/pages/',
      dir: path.join(root, 'tests', 'ui', 'pages'),
    },
    {
      prefix: '/example-app/',
      dir: path.join(root, 'examples', 'universal-app', 'dist'),
    },
  ];
  const packagesDir = path.join(root, 'packages');
  if (existsSync(packagesDir)) {
    for (const name of readdirSync(packagesDir).sort()) {
      const dir = path.join(packagesDir, name, 'e2e', 'pages');
      if (existsSync(dir)) {
        mounts.push({ prefix: `/packages/${name}/e2e/pages/`, dir });
      }
    }
  }
  return mounts;
}

function parseArgs(argv) {
  const args = { port: 4173, host: '127.0.0.1' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--port') {
      args.port = Number(argv[(i += 1)]);
    } else if (argv[i] === '--host') {
      args.host = argv[(i += 1)];
    } else {
      throw new Error(`Unknown argument: ${argv[i]}`);
    }
  }
  return args;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { port, host } = parseArgs(process.argv.slice(2));
  const server = await startStaticServer({
    mounts: defaultMounts(repoRoot),
    port,
    host,
  });
  console.log(`[serve-static] listening on ${server.url}`);
}
