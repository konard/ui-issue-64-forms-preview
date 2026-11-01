/**
 * Entry point tests. Works with Node.js, Bun, and Deno.
 */

import { describe, it, expect } from 'test-anywhere';
import { readFileSync } from 'node:fs';
import * as entry from '../src/index.js';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

describe('package entry point', () => {
  it('exports the package version', () => {
    expect(entry.version).toBe(packageJson.version);
  });

  it('exports nothing else', () => {
    expect(Object.keys(entry)).toEqual(['version']);
  });
});
