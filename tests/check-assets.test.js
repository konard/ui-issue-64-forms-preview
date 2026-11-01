import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { URL } from 'node:url';
import { checkAssets } from '../scripts/check-assets.mjs';
import { updateAttributions } from '../scripts/render-attributions.mjs';

const OWN = `(links-ui-logo: asset (kind image) (files 'assets/links-ui-logo.svg') (license CC0-1.0) (copyright none))\n`;

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'check-assets-'));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

test('accepts consistent records and REUSE.toml, ignoring the description files', (t) => {
  const root = fixture({
    'assets/assets.lino': OWN,
    'assets/README.md': '# Assets\n',
    'assets/links-ui-logo.svg': '<svg/>',
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(checkAssets(root, { write: true }).wrote, true);
  assert.deepEqual(checkAssets(root).errors, []);
});

test('fails naming a file without a record, and a stale REUSE.toml', (t) => {
  const root = fixture({
    'assets/assets.lino': OWN,
    'assets/links-ui-logo.svg': '<svg/>',
    'assets/tmp.svg': '<svg/>',
    'REUSE.toml': 'version = 1\n',
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const errors = checkAssets(root).errors.join('\n');
  assert.match(errors, /assets\/tmp.svg: no record/);
  assert.match(errors, /REUSE.toml is out of date/);
});

test('the CLI exits 1 and names the file without a record', (t) => {
  const root = fixture({
    'assets/assets.lino': OWN,
    'assets/links-ui-logo.svg': '<svg/>',
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const script = new URL('../scripts/check-assets.mjs', import.meta.url)
    .pathname;
  const run = (...args) =>
    spawnSync(process.execPath, [script, '--root', root, ...args], {
      encoding: 'utf8',
    });
  assert.equal(run('--write').status, 0);
  writeFileSync(join(root, 'assets/tmp.svg'), '<svg/>');
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /assets\/tmp.svg/);
});

test('render-attributions --check reports a stale ATTRIBUTIONS.md', (t) => {
  const root = fixture({ 'assets/assets.lino': OWN });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(updateAttributions(root, { check: true }).stale, true);
  assert.equal(updateAttributions(root).stale, true);
  assert.equal(updateAttributions(root, { check: true }).stale, false);
  writeFileSync(join(root, 'assets/ATTRIBUTIONS.md'), '# old\n');
  assert.equal(updateAttributions(root, { check: true }).stale, true);
  assert.equal(
    readFileSync(join(root, 'assets/ATTRIBUTIONS.md'), 'utf8'),
    '# old\n'
  );
});

test('the repository itself passes both checks', () => {
  const root = new URL('..', import.meta.url).pathname;
  assert.deepEqual(checkAssets(root).errors, []);
  assert.equal(updateAttributions(root, { check: true }).stale, false);
});
