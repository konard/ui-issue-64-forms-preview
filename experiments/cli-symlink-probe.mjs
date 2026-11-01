// Usage: node experiments/cli-symlink-probe.mjs
//        deno run -A experiments/cli-symlink-probe.mjs
//
// Probes whether a package bin runs through an npm-style symlink. The package
// has no CLI yet, so the probe prints that fact and exits; it runs the first
// `bin` entry with `--help` when package.json declares one.
import { mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const { bin } = JSON.parse(readFileSync('package.json', 'utf8'));
const entries =
  typeof bin === 'string' ? [['bin', bin]] : Object.entries(bin ?? {});

if (entries.length === 0) {
  console.log({ status: 'skipped', reason: 'package.json declares no bin' });
} else {
  const [name, path] = entries[0];
  const fixture = mkdtempSync(join(tmpdir(), 'cli-symlink-probe-'));
  try {
    const link = join(fixture, name);
    symlinkSync(resolve(path), link);
    const result = spawnSync(
      process.execPath,
      [...(globalThis.Deno ? ['run', '-A', '--ext=js'] : []), link, '--help'],
      { encoding: 'utf8', timeout: 15000 }
    );
    console.log({
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}
