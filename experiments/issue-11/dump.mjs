// Print parse() output of a .lino file in LiNo form, one top-level link per line.
import { readFileSync } from 'node:fs';
import { Parser } from 'links-notation';
const p = new Parser();
const src = readFileSync(process.argv[2], 'utf8');
for (const l of p.parse(src)) {
  if (l.id === null && l.values.every((v) => v.values.length)) {
    console.log('WRAP[');
    for (const v of l.values) {
      console.log('  ', v.format());
    }
    console.log(']');
  } else {
    console.log(l.format());
  }
}
