#!/usr/bin/env node
// Experiment (issue-1 case study): compare how links-notation 0.27.1 shapes the same
// UI element written as one line, as multi-line parentheses, and as an
// indented block read through parseGroups(). The answer decides how the UI
// core must project parsed links into an element tree (see
// docs/case-studies/issue-1/README.md, "Links Notation parse shapes").
//
//   npm install --prefix /tmp/lino links-notation@0.27.1
//   LINKS_NOTATION=/tmp/lino/node_modules/links-notation/dist/index.js \
//     node experiments/issue-1/lino-parse-shapes.mjs

import { pathToFileURL } from 'node:url';

const modulePath = process.env.LINKS_NOTATION;
if (!modulePath) {
  console.error('Set LINKS_NOTATION to the links-notation dist/index.js path.');
  process.exit(2);
}
const { Parser } = await import(pathToFileURL(modulePath).href);
const parser = new Parser();
const format = (links) => links.map((link) => link.format());

const singleLine = "(ok: button (label 'OK') (on press (navigate home)))";
const multiLine = "(ok: button\n  (label 'OK')\n  (on press (navigate home)))";
const indented = "ok: button\n  label 'OK'\n  on press\n    navigate home";

console.log('single line      ->', format(parser.parse(singleLine)));
console.log('multi-line parens ->', format(parser.parse(multiLine)));
console.log('indented parse()  ->', format(parser.parse(indented)));

const groupTree = (group) => ({
  element: group.element.format(),
  children: group.children.map(groupTree),
});
console.log(
  'indented parseGroups() ->',
  JSON.stringify(parser.parseGroups(indented).map(groupTree), null, 2)
);
