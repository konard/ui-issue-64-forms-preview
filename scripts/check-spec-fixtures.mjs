#!/usr/bin/env node

/**
 * Check the ui-dialect/0 specification in docs/spec/.
 *
 * 1. Every fixture `.lino` parses with links-notation, except fixtures in
 *    `errors/` named `syntax-*`, which must be rejected by the parser.
 * 2. Every `.lino` has exactly one sibling JSON: `<name>.diagnostics.json` in
 *    `errors/`, `<name>.tree.json` everywhere else. No JSON is orphaned.
 * 3. Every JSON validates against docs/spec/element-tree.schema.json.
 * 4. All `shapes/<group>.*.tree.json` files of one group are byte-equal.
 * 5. There are at least 30 fixtures, and each sample of
 *    docs/case-studies/issue-1/samples/ has a byte-equal copy in `samples/`.
 * 6. Every fenced `lino` block in docs/spec/*.md parses.
 * 7. The non-normative reference projection reproduces every expected JSON
 *    (diagnostic order is not significant).
 *
 * Usage: node scripts/check-spec-fixtures.mjs [spec-dir]
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser } from 'links-notation';
import {
  MAX_DEPTH,
  MAX_INPUT_SIZE,
  projectText,
  readVocabulary,
  SPEC_VERSION,
} from './spec-reference-projection.mjs';

export const MIN_FIXTURES = 30;
const SAMPLES_DIR = 'docs/case-studies/issue-1/samples';

const TYPE_CHECKS = {
  string: (v) => typeof v === 'string',
  integer: (v) => Number.isInteger(v),
  number: (v) => typeof v === 'number',
  boolean: (v) => typeof v === 'boolean',
  null: (v) => v === null,
  array: (v) => Array.isArray(v),
  object: (v) => v !== null && typeof v === 'object' && !Array.isArray(v),
};

/**
 * Validate `value` against the JSON Schema subset used by
 * element-tree.schema.json: $ref (local), oneOf, type, const, enum, required,
 * properties, additionalProperties: false, items, minItems and minimum.
 * Returns a list of error strings.
 */
function resolveRef(ref, root) {
  return ref
    .replace(/^#\//, '')
    .split('/')
    .reduce((node, key) => node[key], root);
}

function oneOfErrors(schema, value, root, path) {
  const results = schema.oneOf.map((option) =>
    validateSchema(option, value, root, path)
  );
  const passing = results.filter((result) => result.length === 0);
  if (passing.length === 1) {
    return [];
  }
  const errors = [`${path}: matches ${passing.length} of oneOf, expected 1`];
  if (passing.length === 0) {
    // Explain the closest option.
    errors.push(...results.reduce((a, b) => (b.length < a.length ? b : a)));
  }
  return errors;
}

function scalarErrors(schema, value, path) {
  const errors = [];
  if ('const' in schema && value !== schema.const) {
    errors.push(`${path}: expected ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path}: ${JSON.stringify(value)} is not allowed`);
  }
  if (typeof schema.minimum === 'number' && value < schema.minimum) {
    errors.push(`${path}: below ${schema.minimum}`);
  }
  return errors;
}

function arrayErrors(schema, value, root, path) {
  const errors = [];
  if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
    errors.push(`${path}: fewer than ${schema.minItems} items`);
  }
  if (schema.items) {
    value.forEach((item, i) =>
      errors.push(...validateSchema(schema.items, item, root, `${path}[${i}]`))
    );
  }
  return errors;
}

function objectErrors(schema, value, root, path) {
  const errors = (schema.required ?? [])
    .filter((key) => !(key in value))
    .map((key) => `${path}: missing ${key}`);
  for (const [key, item] of Object.entries(value)) {
    const sub = schema.properties?.[key];
    if (sub) {
      errors.push(...validateSchema(sub, item, root, `${path}.${key}`));
    } else if (schema.additionalProperties === false) {
      errors.push(`${path}: unexpected ${key}`);
    }
  }
  return errors;
}

export function validateSchema(schema, value, root = schema, path = '$') {
  if (schema.$ref) {
    return validateSchema(resolveRef(schema.$ref, root), value, root, path);
  }
  const errors = schema.oneOf ? oneOfErrors(schema, value, root, path) : [];
  if (schema.type) {
    const types = [schema.type].flat();
    if (!types.some((type) => TYPE_CHECKS[type](value))) {
      return [`${path}: expected ${types.join(' or ')}`];
    }
  }
  errors.push(...scalarErrors(schema, value, path));
  if (Array.isArray(value)) {
    errors.push(...arrayErrors(schema, value, root, path));
  } else if (TYPE_CHECKS.object(value)) {
    errors.push(...objectErrors(schema, value, root, path));
  }
  return errors;
}

/** Fenced ```lino blocks of a Markdown text. */
export function linoBlocks(markdown) {
  const blocks = [];
  const pattern = /^```lino[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm;
  for (const match of markdown.matchAll(pattern)) {
    blocks.push(match[1]);
  }
  return blocks;
}

function parses(parser, text) {
  try {
    parser.parse(text);
    return null;
  } catch (error) {
    return error.message.split('\n')[0];
  }
}

const canonical = (json) => {
  const sorted = (list) =>
    list.map((d) => JSON.stringify(d)).sort((a, b) => a.localeCompare(b));
  return JSON.stringify({ ...json, diagnostics: sorted(json.diagnostics) });
};

function orphanErrors(area, files) {
  return files
    .filter((file) => file.endsWith('.json'))
    .filter((file) => {
      const stem = file.replace(/\.(tree|diagnostics)\.json$/, '');
      return !files.includes(`${stem}.lino`);
    })
    .map((file) => `${area}/${file}: no sibling .lino`);
}

function parseErrors(ctx, area, file, text) {
  const name = `${area}/${file}`;
  const failure = parses(ctx.parser, text);
  const mustThrow = area === 'errors' && file.startsWith('syntax-');
  if (mustThrow && failure === null) {
    return [`${name}: syntax-* fixture parsed without an error`];
  }
  if (!mustThrow && failure !== null) {
    return [`${name}: does not parse: ${failure}`];
  }
  return [];
}

/** Check one fixture and return its errors. */
function checkFixture(ctx, area, file) {
  const name = `${area}/${file}`;
  const stem = join(ctx.fixturesDir, area, file.slice(0, -'.lino'.length));
  const text = readFileSync(`${stem}.lino`, 'utf8');
  const errors = parseErrors(ctx, area, file, text);

  const expectedExt = area === 'errors' ? '.diagnostics.json' : '.tree.json';
  const siblings = ['.tree.json', '.diagnostics.json'].filter((ext) =>
    existsSync(stem + ext)
  );
  if (siblings.length !== 1 || siblings[0] !== expectedExt) {
    return [...errors, `${name}: needs exactly one sibling ${expectedExt}`];
  }
  const raw = readFileSync(stem + expectedExt, 'utf8');
  const json = JSON.parse(raw);
  for (const error of validateSchema(ctx.schema, json)) {
    errors.push(`${name}${expectedExt}: ${error}`);
  }
  if (area === 'shapes') {
    const group = file.split('.')[0];
    ctx.shapes.set(group, [...(ctx.shapes.get(group) ?? []), { name, raw }]);
  }

  const { tree, diagnostics } = projectText(text, ctx.vocabulary);
  const actual = area === 'errors' ? { spec: SPEC_VERSION, diagnostics } : tree;
  if (canonical(actual) !== canonical(json)) {
    errors.push(
      `${name}: reference projection gives ${JSON.stringify(actual)}`
    );
  }
  return errors;
}

function shapeErrors(shapes) {
  const errors = shapes.size === 0 ? ['shapes/: no fixtures'] : [];
  for (const [group, members] of shapes) {
    if (members.length < 3) {
      errors.push(`shapes/${group}: needs one-line, multi-line and indented`);
    }
    for (const member of members.slice(1)) {
      if (member.raw !== members[0].raw) {
        errors.push(`${member.name}: tree differs from ${members[0].name}`);
      }
    }
  }
  return errors;
}

function sampleErrors(fixturesDir, samplesDir) {
  if (!samplesDir || !existsSync(samplesDir)) {
    return [];
  }
  return readdirSync(samplesDir)
    .filter((f) => f.endsWith('.lino'))
    .filter((sample) => {
      const copy = join(fixturesDir, 'samples', sample);
      return (
        !existsSync(copy) ||
        readFileSync(copy, 'utf8') !==
          readFileSync(join(samplesDir, sample), 'utf8')
      );
    })
    .map(
      (sample) => `samples/${sample}: missing or differs from ${samplesDir}`
    );
}

function documentErrors(specDir, parser) {
  const errors = [];
  for (const doc of readdirSync(specDir).filter((f) => f.endsWith('.md'))) {
    linoBlocks(readFileSync(join(specDir, doc), 'utf8')).forEach((block, i) => {
      const failure = parses(parser, block);
      if (failure !== null) {
        errors.push(`${doc}: lino block ${i + 1} does not parse: ${failure}`);
      }
    });
  }
  return errors;
}

/** Run all checks. Returns { errors, fixtures } for the spec directory. */
export function checkSpec(specDir = 'docs/spec', samplesDir = SAMPLES_DIR) {
  const ctx = {
    fixturesDir: join(specDir, 'fixtures'),
    parser: new Parser({ maxDepth: MAX_DEPTH, maxInputSize: MAX_INPUT_SIZE }),
    schema: JSON.parse(
      readFileSync(join(specDir, 'element-tree.schema.json'), 'utf8')
    ),
    vocabulary: readVocabulary(
      readFileSync(join(specDir, 'vocabulary.lino'), 'utf8')
    ),
    shapes: new Map(),
  };
  const errors = [];
  let fixtures = 0;
  for (const area of readdirSync(ctx.fixturesDir).sort()) {
    const files = readdirSync(join(ctx.fixturesDir, area)).sort();
    errors.push(...orphanErrors(area, files));
    for (const file of files.filter((f) => f.endsWith('.lino'))) {
      fixtures += 1;
      errors.push(...checkFixture(ctx, area, file));
    }
  }
  errors.push(...shapeErrors(ctx.shapes));
  if (fixtures < MIN_FIXTURES) {
    errors.push(`only ${fixtures} fixtures, expected at least ${MIN_FIXTURES}`);
  }
  errors.push(...sampleErrors(ctx.fixturesDir, samplesDir));
  errors.push(...documentErrors(specDir, ctx.parser));
  return { errors, fixtures };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const specDir = process.argv[2] ?? 'docs/spec';
  const { errors, fixtures } = checkSpec(specDir);
  for (const error of errors) {
    console.error(`check-spec: ${error}`);
  }
  if (errors.length > 0) {
    console.error(
      `check-spec: ${errors.length} problem(s) in ${basename(specDir)}`
    );
    process.exit(1);
  }
  console.log(`check-spec: ${fixtures} fixtures conform to ${SPEC_VERSION}`);
}
