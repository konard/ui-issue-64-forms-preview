#!/usr/bin/env node
// Regenerate the expected JSON of docs/spec/fixtures with the non-normative
// reference projection. Review every diff by hand: the spec documents are the
// authority, the generated JSON is only a convenience.
//   node experiments/issue-11/generate-fixtures.mjs
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
} from 'node:fs';
import { join } from 'node:path';
import {
  loadVocabulary,
  projectText,
  SPEC_VERSION,
} from '../../scripts/spec-reference-projection.mjs';

const root = 'docs/spec/fixtures';
const vocabulary = loadVocabulary();
for (const area of readdirSync(root)) {
  for (const file of readdirSync(join(root, area)).filter((f) =>
    f.endsWith('.lino')
  )) {
    const base = join(root, area, file.slice(0, -'.lino'.length));
    const { tree, diagnostics } = projectText(
      readFileSync(`${base}.lino`, 'utf8'),
      vocabulary
    );
    for (const ext of ['.tree.json', '.diagnostics.json']) {
      if (existsSync(base + ext)) {
        rmSync(base + ext);
      }
    }
    const [ext, json] =
      area === 'errors'
        ? ['.diagnostics.json', { spec: SPEC_VERSION, diagnostics }]
        : ['.tree.json', tree];
    writeFileSync(base + ext, `${JSON.stringify(json, null, 2)}\n`);
  }
}
