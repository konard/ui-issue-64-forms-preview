import { Parser } from 'links-notation';
const p = new Parser();
const dump = (l) =>
  l.values?.length || l.values
    ? { id: l.id, values: (l.values || []).map(dump) }
    : l.id;
for (const s of [
  "(ok: button (label 'OK') (on press (navigate home)))",
  "(ok: button\n  (label 'OK')\n  (on press (navigate home)))",
  "ok: button\n  label 'OK'\n  on press\n    navigate home",
  "(t 1 '1')",
  "(x '#6750A4')",
  '(a: b)\n(a: c)',
  "(g: text 'Hello, links')",
  '(a: b c)',
  'a: b c\n  d e',
  "(x 'it''s')",
  '(x "q")',
]) {
  console.log(JSON.stringify(s));
  console.log(' ', JSON.stringify(p.parse(s).map(dump)));
}
for (const s of ['(x #6750A4)', '(t a:b)']) {
  try {
    p.parse(s);
    console.log(s, 'ok');
  } catch (e) {
    console.log(s, 'THROWS', e.message.split('\n')[0]);
  }
}
