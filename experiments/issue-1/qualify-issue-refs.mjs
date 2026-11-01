#!/usr/bin/env node
// Rewrites bare `#N` issue references in a roadmap issue file to
// `owner/repo#N`. In an issue of link-foundation/ui a bare `#N` links to
// link-foundation/ui itself. `#1` is left alone because it usually means the
// planning issue of this repository; check the remaining ones by hand.
//
// Usage:
//   node experiments/issue-1/qualify-issue-refs.mjs <file> <owner/repo> \
//     [label=owner/repo ...]
//
// A label (for example `deepcase-app=deep-foundation/deepcase-app`) switches
// the repository for the references that follow it, until `;`, `)` or the end
// of the list item. The label word itself is dropped because the qualified
// reference already names the repository. Code spans and fenced blocks are
// left untouched.
import { readFileSync, writeFileSync } from 'node:fs';

const [file, defaultRepo, ...labelArgs] = process.argv.slice(2);
if (!file || !defaultRepo) {
  console.error(
    'usage: qualify-issue-refs.mjs <file> <owner/repo> [label=repo]'
  );
  process.exit(2);
}
const labels = new Map(labelArgs.map((arg) => arg.split('=')));
// Longest label first, so `deepcase-app` wins over `deepcase`.
const labelNames = [...labels.keys()].sort((a, b) => b.length - a.length);
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const token = new RegExp(
  [
    '`[^`\\n]*`',
    ...labelNames.map((name) => `\\b${escape(name)} (?=#\\d)`),
    '[;)]',
    '(?<![\\w&[])#\\d+\\b',
  ].join('|'),
  'g'
);

let fenced = false;
let current = defaultRepo;
let changes = 0;
const lines = readFileSync(file, 'utf8').split('\n');
const output = lines.map((line) => {
  if (line.trimStart().startsWith('```')) {
    fenced = !fenced;
    return line;
  }
  // A new paragraph or list item resets the repository; an indented
  // continuation line keeps it.
  if (fenced || !/^\s+\S/.test(line) || /^\s*[-*\d]+[.)]?\s/.test(line)) {
    current = defaultRepo;
  }
  if (fenced) {
    return line;
  }
  return line.replace(token, (match) => {
    if (match.startsWith('`')) {
      return match;
    }
    if (match === ';' || match === ')') {
      current = defaultRepo;
      return match;
    }
    const label = labelNames.find((name) => match === `${name} `);
    if (label) {
      current = labels.get(label);
      return '';
    }
    // `#1` is ambiguous (usually the planning issue here): fix it by hand.
    if (match === '#1') {
      return match;
    }
    changes += 1;
    return `${current}${match}`;
  });
});
writeFileSync(file, output.join('\n'));
console.log(`${file}: ${changes} references qualified`);
