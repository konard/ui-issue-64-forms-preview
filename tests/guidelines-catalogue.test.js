/**
 * Checks the design guidelines digest in docs/guidelines: the LiNo
 * data parses with `links-notation` and agrees with the Markdown tables.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  guidelinesDir,
  loadRecords,
  renderAll,
} from '../scripts/guidelines-tables.mjs';

const read = (name) => readFileSync(join(guidelinesDir, name), 'utf8');
const catalogue = loadRecords('catalogue.lino');
const taxonomy = loadRecords('tokens-taxonomy.lino');
const components = catalogue.filter((r) => r.type === 'component-entry');
const tokens = taxonomy.filter((r) => r.type === 'token-entry');
const TOKEN_PATH = /^[a-z][a-z0-9-]*(\.[a-z0-9-]+)*$/;
const SYSTEMS = ['open-ui', 'material3', 'fluent', 'hig', 'mui'];

const allValues = (records) =>
  records.flatMap((r) => Object.values(r.fields).flat());

describe('docs/guidelines/catalogue.lino', () => {
  it('parses into at least 35 component entries', () => {
    assert.equal(components.length, catalogue.length);
    assert.ok(components.length >= 35, `${components.length} kinds`);
  });

  it('uses unique kebab-case kind names', () => {
    const ids = components.map((r) => r.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) {
      assert.match(id, /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
    }
  });

  it('lists every kind in component-catalogue.md', () => {
    const markdown = read('component-catalogue.md');
    for (const { id } of components) {
      assert.ok(markdown.includes(`| \`${id}\``), `${id} missing`);
    }
  });

  it('fills every system column with a linked name or —', () => {
    for (const record of components) {
      for (const system of [...SYSTEMS, 'aria', 'apg', 'keyboard', 'owner']) {
        assert.equal(
          record.fields[system]?.length,
          1,
          `${record.id}: ${system}`
        );
      }
      for (const system of SYSTEMS) {
        const [name] = record.fields[system];
        const hasUrl = Boolean(record.fields[`${system}-url`]);
        assert.equal(hasUrl, name !== '—', `${record.id}: ${system} link`);
      }
    }
  });

  it('keeps keyboard summaries within 15 words', () => {
    for (const record of components) {
      const words = record.fields.keyboard[0].split(/\s+/).length;
      assert.ok(words <= 15, `${record.id}: ${words} words`);
    }
  });
});

describe('docs/guidelines/tokens-taxonomy.lino', () => {
  it('parses three layers, at least 10 categories and 30 system tokens', () => {
    const count = (type) => taxonomy.filter((r) => r.type === type).length;
    assert.equal(count('token-layer'), 3);
    assert.ok(count('token-category') >= 10);
    assert.ok(tokens.length >= 30, `${tokens.length} tokens`);
  });

  it('names every token path by the naming rules', () => {
    for (const { id } of tokens) {
      assert.match(id, TOKEN_PATH);
    }
    const categories = new Set(
      taxonomy.filter((r) => r.type === 'token-category').map((r) => r.id)
    );
    for (const record of tokens) {
      const [category] = record.fields.category;
      assert.ok(categories.has(category), `${record.id}: ${category}`);
      assert.ok(record.id.startsWith(`${category}.`), record.id);
    }
  });

  it('maps every token to M3, Fluent, HIG and a DTCG $type', () => {
    const dtcg = new Set([
      'color',
      'dimension',
      'duration',
      'cubicBezier',
      'shadow',
      'typography',
      'number',
      'fontWeight',
    ]);
    for (const record of tokens) {
      for (const field of ['material3', 'fluent', 'hig', 'dtcg-type']) {
        assert.equal(record.fields[field]?.length, 1, `${record.id}.${field}`);
      }
      assert.ok(dtcg.has(record.fields['dtcg-type'][0]), record.id);
    }
  });

  it('lists every token in token-taxonomy.md', () => {
    const markdown = read('token-taxonomy.md');
    for (const { id } of tokens) {
      assert.ok(markdown.includes(`| \`${id}\``), `${id} missing`);
    }
  });
});

describe('docs/guidelines digest', () => {
  it('uses only https:// URLs', () => {
    for (const value of allValues([...catalogue, ...taxonomy])) {
      if (/^[a-z]+:\/\//i.test(value)) {
        assert.ok(value.startsWith('https://'), value);
      }
    }
    for (const record of catalogue) {
      for (const [key, [url]] of Object.entries(record.fields)) {
        if (key === 'apg' && url === '—') {
          continue;
        }
        if (key === 'apg' || key.endsWith('-url')) {
          assert.ok(url.startsWith('https://'), `${record.id}.${key}`);
        }
      }
    }
  });

  it('keeps the Markdown tables in sync with the LiNo data', async () => {
    for (const { file, expected, actual } of await renderAll()) {
      assert.equal(actual, expected, `${file} is stale`);
    }
  });
});
