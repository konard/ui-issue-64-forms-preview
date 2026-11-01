#!/usr/bin/env node
// Experiment (issue-1 case study): check that the proposed UI dialect samples in
// docs/ARCHITECTURE.md are valid Links Notation and survive parse -> format.
//
// Usage (links-notation is not a dependency of this repository yet):
//   npm install --prefix /tmp/lino links-notation@0.27.1
//   LINKS_NOTATION=/tmp/lino/node_modules/links-notation/dist/index.js \
//     node experiments/issue-1/lino-ui-dialect-roundtrip.mjs docs/case-studies/issue-1/samples/*.lino

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const modulePath = process.env.LINKS_NOTATION;
if (!modulePath) {
  console.error('Set LINKS_NOTATION to the links-notation dist/index.js path.');
  process.exit(2);
}
const { Parser } = await import(pathToFileURL(modulePath).href);
const parser = new Parser();

const describe = (link, depth = 0) => {
  const pad = '  '.repeat(depth);
  const id = link.id === null ? '·' : JSON.stringify(link.id);
  const lines = [`${pad}${id}`];
  for (const value of link.values ?? []) {
    lines.push(describe(value, depth + 1));
  }
  return lines.join('\n');
};

let failures = 0;
for (const file of process.argv.slice(2)) {
  const source = readFileSync(file, 'utf8');
  try {
    const links = parser.parse(source);
    const formatted = links.map((link) => link.format()).join('\n');
    const reparsed = parser.parse(formatted);
    const stable =
      reparsed.length === links.length &&
      reparsed.every((link, index) => link.equals(links[index]));
    console.log(
      `# ${file}: ${links.length} top-level link(s), round-trip ${stable ? 'stable' : 'CHANGED'}`
    );
    if (process.env.VERBOSE) {
      for (const link of links) {
        console.log(describe(link));
      }
      console.log(formatted);
    }
    if (!stable) {
      failures += 1;
    }
  } catch (error) {
    failures += 1;
    console.log(`# ${file}: PARSE ERROR ${error.message}`);
  }
}
process.exit(failures === 0 ? 0 : 1);
