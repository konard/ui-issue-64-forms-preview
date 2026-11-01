#!/usr/bin/env node

/**
 * Non-normative reference projection for the UI dialect `ui-dialect/0`
 * (docs/spec/). It turns Links Notation text into the element tree JSON that
 * docs/spec/element-tree.schema.json describes, and reports the diagnostics
 * that docs/spec/*.md define.
 *
 * It exists only so that scripts/check-spec-fixtures.mjs can prove that every
 * expected fixture JSON follows the written rules. The production
 * implementation and the typed value reader belong to ui-core.
 *
 * Usage: node scripts/spec-reference-projection.mjs <file.lino>
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Link, Parser } from 'links-notation';

export const SPEC_VERSION = 'ui-dialect/0';
export const MAX_DEPTH = 64;
export const MAX_INPUT_SIZE = 1024 * 1024;

const DIMENSION = /^-?(\d+(\.\d+)?|\.\d+)(px|rem|em|%|vw|vh)$/;
const NUMBER = /^-?(\d+(\.\d+)?|\.\d+)([eE][-+]?\d+)?$/;
const DURATION = /^(\d+(\.\d+)?|\.\d+)(ms|s)$/;
const HEX_COLOR = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const TOKEN_NAME = /^[a-z0-9-]+(\.[a-z0-9-]+)*$/;

const isAtom = (link) => link.values.length === 0;
const atomText = (link) => link.id;

/** JSON form of a value: atom -> string, anonymous link -> array. */
export function valueJson(link) {
  if (isAtom(link)) {
    return atomText(link);
  }
  const values = link.values.map(valueJson);
  return link.id === null ? values : { id: link.id, values };
}

/**
 * Read docs/spec/vocabulary.lino into { kinds, actions, multi }.
 * The vocabulary is itself a ui-dialect/0 document whose elements have the
 * kind `kind` or `action`, so it is projected with a bootstrap vocabulary.
 */
export function readVocabulary(text) {
  const bootstrap = {
    kinds: new Map([
      [
        'kind',
        {
          positional: [],
          properties: new Map([
            ['description', { type: 'string' }],
            ['positional', { type: 'any' }],
            ['property', { type: 'any', multi: true }],
            ['children', { type: 'any' }],
          ]),
        },
      ],
      [
        'action',
        {
          positional: [],
          properties: new Map([
            ['description', { type: 'string' }],
            ['argument', { type: 'any', multi: true }],
          ]),
        },
      ],
      [
        'dialect',
        {
          positional: [],
          properties: new Map([
            ['version', { type: 'string' }],
            ['multi-valued', { type: 'any' }],
            ['reserved-sigil', { type: 'any' }],
            ['reserved-property', { type: 'any', multi: true }],
          ]),
        },
      ],
    ]),
    actions: new Set(),
  };
  const { tree, diagnostics } = projectText(text, bootstrap);
  if (diagnostics.length > 0) {
    throw new Error(`vocabulary: ${JSON.stringify(diagnostics)}`);
  }
  const vocabulary = { kinds: new Map(), actions: new Map() };
  const prop = (element, name) =>
    element.properties.filter((p) => p.name === name);
  for (const element of tree.elements) {
    if (element.kind === 'kind') {
      const properties = new Map();
      for (const { values } of prop(element, 'property')) {
        const [name, type, ...flags] = values;
        properties.set(name, { type, multi: flags.includes('multi') });
      }
      const [children] = prop(element, 'children').map((p) => p.values[0]);
      vocabulary.kinds.set(element.id, {
        positional: prop(element, 'positional').flatMap((p) => p.values),
        properties,
        children: children ?? 'any',
      });
    } else if (element.kind === 'action') {
      vocabulary.actions.set(
        element.id,
        prop(element, 'argument').map((p) => p.values)
      );
    }
  }
  return vocabulary;
}

class Projector {
  constructor(vocabulary) {
    this.vocabulary = vocabulary;
    this.diagnostics = [];
    this.ids = new Set();
    this.global = new Map();
    this.root = { elements: [], local: new Map() };
  }

  warn(code, at) {
    this.diagnostics.push({ code, severity: 'warning', at });
  }

  error(code, at) {
    this.diagnostics.push({ code, severity: 'error', at });
  }

  /** Create an element node from a link with an id (or an anonymous kind). */
  makeElement(link, id) {
    const values = link.values;
    const [kindLink, ...rest] = values;
    const kind = kindLink && isAtom(kindLink) ? atomText(kindLink) : null;
    const element = {
      node: 'element',
      json: {
        id,
        kind,
        positional: [],
        properties: [],
        children: [],
        unknown: [],
      },
      local: new Map(),
    };
    if (id !== null) {
      if (this.ids.has(id)) {
        this.error('duplicate-id', { element: id });
      }
      this.ids.add(id);
    }
    if (kind === null) {
      this.error('missing-kind', { element: id });
    } else if (!this.vocabulary.kinds.has(kind)) {
      this.warn('unknown-kind', { element: id, kind });
    }
    const head = new Link(id, values.filter(isAtom));
    if (id !== null) {
      this.global.set(head.format(), element);
    }
    for (const value of rest) {
      this.append(element, value);
    }
    return element;
  }

  /** Append one value of the source to an element or property node. */
  append(node, value) {
    if (node.node === 'property') {
      this.appendToProperty(node, value);
      return null;
    }
    if (!isAtom(value) && value.id === null && !isAtom(value.values[0])) {
      return this.fold(node, value);
    }
    const element = node.json;
    if (isAtom(value)) {
      this.checkSigil(atomText(value), element.id);
      element.positional.push(atomText(value));
      return null;
    }
    if (value.id !== null) {
      const child = this.makeElement(value, value.id);
      element.children.push(child.json);
      node.local.set(value.format(), child);
      return child;
    }
    const head = atomText(value.values[0]);
    const spec = this.vocabulary.kinds.get(element.kind);
    if (spec?.properties.has(head)) {
      return this.addProperty(node, value, head, spec.properties.get(head));
    }
    if (this.vocabulary.kinds.has(head)) {
      const child = this.makeElement(value, null);
      element.children.push(child.json);
      node.local.set(value.format(), child);
      return child;
    }
    this.warn('unknown-sublink', { element: element.id, head });
    element.unknown.push(valueJson(value));
    return null;
  }

  addProperty(node, link, name, spec) {
    const element = node.json;
    const values = [];
    const property = { node: 'property', json: { name, values } };
    // A multi-line property value folds back onto the property head.
    property.local = new Map([[link.format(), values]]);
    property.owner = element;
    property.spec = spec;
    if (!spec.multi) {
      const index = element.properties.findIndex((p) => p.name === name);
      if (index !== -1) {
        this.warn('duplicate-property', {
          element: element.id,
          property: name,
        });
        element.properties.splice(index, 1);
      }
    }
    element.properties.push(property.json);
    node.local.set(link.format(), property);
    for (const value of link.values.slice(1)) {
      this.appendToProperty(property, value);
    }
    return property;
  }

  appendToProperty(property, value) {
    if (!isAtom(value) && value.id === null && !isAtom(value.values[0])) {
      const key = value.values[0].format();
      if (property.local?.has(key)) {
        // A path inside a multi-line property value, e.g. ((track a) (key 0 1)).
        for (const rest of value.values.slice(1)) {
          property.local.get(key).push(valueJson(rest));
        }
        return;
      }
    }
    const json = valueJson(value);
    this.walkSigils(json, property.owner.id, property.json.name);
    property.json.values.push(json);
    if (Array.isArray(json)) {
      property.local ??= new Map();
      property.local.set(value.format(), json);
    }
  }

  /** Path folding: (P v1 v2 ...) where P is a head or a known path. */
  fold(context, link) {
    const [first, ...rest] = link.values;
    const key = first.format();
    let target = context.local?.get(key) ?? this.global.get(key);
    if (!target) {
      target = this.append(context, first);
    }
    if (!target) {
      // Not foldable: keep it verbatim on the context element.
      this.warn('unknown-sublink', { element: context.json.id, head: null });
      context.json.unknown?.push(valueJson(link));
      return null;
    }
    for (const value of rest) {
      const created = this.append(target, value);
      if (created) {
        this.global.set(new Link(null, [first, value]).format(), created);
      } else if (target.node === 'property' && !isAtom(value)) {
        this.global.set(new Link(null, [first, value]).format(), target);
      }
    }
    return target;
  }

  checkSigil(text, element, property) {
    if (text.startsWith('@') || text.startsWith('$')) {
      this.warn(
        'reserved-sigil',
        property ? { element, property } : { element }
      );
    }
  }

  walkSigils(json, element, property) {
    if (typeof json === 'string') {
      this.checkSigil(json, element, property);
    } else if (Array.isArray(json)) {
      json.forEach((v) => this.walkSigils(v, element, property));
    } else {
      json.values.forEach((v) => this.walkSigils(v, element, property));
    }
  }

  top(link) {
    if (!isAtom(link) && link.id === null && !isAtom(link.values[0])) {
      this.fold(
        { node: 'element', json: this.rootView(), local: this.root.local },
        link
      );
      return;
    }
    if (link.id !== null) {
      const element = this.makeElement(link, link.id);
      this.root.elements.push(element.json);
      return;
    }
    const head = isAtom(link) ? atomText(link) : atomText(link.values[0]);
    if (!isAtom(link) && this.vocabulary.kinds.has(head)) {
      this.root.elements.push(this.makeElement(link, null).json);
      return;
    }
    this.warn('unknown-sublink', { element: null, head });
    this.root.unknown ??= [];
    this.root.unknown.push(valueJson(link));
  }

  /** The document root behaves as an element whose children are elements. */
  rootView() {
    const root = this.root;
    return {
      id: null,
      kind: null,
      get children() {
        return root.elements;
      },
      positional: [],
      properties: [],
      unknown: (root.unknown ??= []),
    };
  }
}

/** Value checks that need the vocabulary types (values.md, behaviour.md). */
function checkValues(tree, vocabulary, diagnostics) {
  const visit = (element) => {
    const spec = vocabulary.kinds.get(element.kind);
    for (const property of element.properties) {
      const type = spec?.properties.get(property.name)?.type;
      checkProperty(element, property, type, vocabulary, diagnostics);
    }
    if (spec && spec.children === 'none' && element.children.length > 0) {
      diagnostics.push({
        code: 'unexpected-child',
        severity: 'warning',
        at: { element: element.id },
      });
    }
    element.children.forEach(visit);
  };
  tree.elements.forEach(visit);
}

function isTypedReference(value) {
  return Array.isArray(value) && ['token', 'param', 'or'].includes(value[0]);
}

const STRING_CHECKS = {
  number: (v) => NUMBER.test(v),
  dimension: (v) => DIMENSION.test(v) || v === '0',
  duration: (v) => DURATION.test(v),
  color: (v) => HEX_COLOR.test(v),
  url: (v) => /^(https?:|mailto:|\/|\.)/.test(v) || !v.includes(':'),
  'token-name': (v) => TOKEN_NAME.test(v),
};

function isFunctionalColor(value) {
  const [space, ...channels] = value;
  return (
    ['oklch', 'rgb'].includes(space) &&
    [3, 4].includes(channels.length) &&
    channels.every(
      (c) => typeof c === 'string' && NUMBER.test(c.replace(/%$/, ''))
    )
  );
}

function linkMatches(type, value) {
  if (type === 'color' && Array.isArray(value)) {
    return isFunctionalColor(value);
  }
  return type === 'any' || type === 'action';
}

export function valueMatches(type, value) {
  if (typeof value === 'string' && /^[@$]/.test(value)) {
    return true; // already reported as reserved-sigil
  }
  if (isTypedReference(value)) {
    return value[0] === 'or'
      ? value.slice(1).every((v) => valueMatches(type, v))
      : value.length === 2 && typeof value[1] === 'string';
  }
  if (Array.isArray(type)) {
    return type[0] === 'enum' && type.slice(1).includes(value);
  }
  if (typeof value !== 'string') {
    return linkMatches(type, value);
  }
  return STRING_CHECKS[type]?.(value) ?? true;
}

function checkProperty(element, property, type, vocabulary, diagnostics) {
  const at = { element: element.id, property: property.name };
  if (type === 'action') {
    checkHandler(property.values, vocabulary, diagnostics, at);
    return;
  }
  if (type === undefined || type === 'any' || type === 'string') {
    return;
  }
  for (const value of property.values) {
    if (!valueMatches(type, value)) {
      diagnostics.push({ code: 'invalid-value', severity: 'error', at });
    }
  }
}

/** (on <event> <action>...): actions are data, never code. */
function checkHandler(values, vocabulary, diagnostics, at) {
  const [event, ...actions] = values;
  if (typeof event !== 'string' || actions.length === 0) {
    diagnostics.push({ code: 'invalid-handler', severity: 'error', at });
    return;
  }
  for (const action of actions) {
    if (!Array.isArray(action)) {
      diagnostics.push({ code: 'invalid-handler', severity: 'error', at });
      continue;
    }
    if (!vocabulary.actions.has(action[0])) {
      diagnostics.push({ code: 'unknown-action', severity: 'warning', at });
      continue;
    }
    if (action[0] === 'navigate') {
      const target = String(action[1] ?? '');
      if (/^\s*(javascript|data|vbscript):/i.test(target)) {
        diagnostics.push({ code: 'unsafe-url', severity: 'error', at });
      }
    }
  }
}

/** reference-cycle: token values that refer to each other along a theme chain. */
function checkTokenCycles(tree, diagnostics) {
  const themes = new Map();
  for (const element of tree.elements) {
    if (element.kind !== 'theme') {
      continue;
    }
    const tokens = new Map();
    let base = null;
    for (const property of element.properties) {
      if (property.name === 'token') {
        tokens.set(property.values[0], property.values[1]);
      }
      if (property.name === 'extends') {
        base = property.values[0];
      }
    }
    themes.set(element.id, { tokens, base });
  }
  const lookup = (theme, name, seen = new Set()) => {
    for (
      let t = theme;
      t && themes.has(t) && !seen.has(t);
      t = themes.get(t).base
    ) {
      seen.add(t);
      if (themes.get(t).tokens.has(name)) {
        return themes.get(t).tokens.get(name);
      }
    }
    return undefined;
  };
  const refs = (value) =>
    Array.isArray(value)
      ? value[0] === 'token'
        ? [value[1]]
        : value.flatMap(refs)
      : [];
  for (const [theme, { tokens }] of themes) {
    for (const name of tokens.keys()) {
      const stack = [name];
      const visiting = new Set();
      let cycle = false;
      const walk = (n) => {
        if (visiting.has(n)) {
          cycle = n === name || cycle;
          return;
        }
        visiting.add(n);
        refs(lookup(theme, n)).forEach(walk);
        visiting.delete(n);
      };
      walk(stack[0]);
      if (cycle) {
        diagnostics.push({
          code: 'reference-cycle',
          severity: 'error',
          at: { element: theme, property: 'token', token: name },
        });
      }
    }
  }
}

/** Project LiNo text into { tree, diagnostics } (see docs/spec/). */
export function projectText(text, vocabulary) {
  const parser = new Parser({
    maxDepth: MAX_DEPTH,
    maxInputSize: MAX_INPUT_SIZE,
  });
  const empty = { spec: SPEC_VERSION, elements: [], diagnostics: [] };
  if (text.length > MAX_INPUT_SIZE) {
    const diagnostics = [
      { code: 'input-too-large', severity: 'error', at: {} },
    ];
    return { tree: { ...empty, diagnostics }, diagnostics };
  }
  let links;
  try {
    links = parser.parse(text);
  } catch (error) {
    const code = error.maxDepth ? 'depth-exceeded' : 'syntax-error';
    const at = error.line ? { line: error.line, column: error.column } : {};
    const diagnostics = [{ code, severity: 'error', at }];
    return { tree: { ...empty, diagnostics }, diagnostics };
  }
  const projector = new Projector(vocabulary);
  links.forEach((link) => projector.top(link));
  const tree = { spec: SPEC_VERSION, elements: projector.root.elements };
  if (projector.root.unknown?.length) {
    tree.unknown = projector.root.unknown;
  }
  const diagnostics = projector.diagnostics;
  if (vocabulary.actions.size > 0) {
    checkValues(tree, vocabulary, diagnostics);
    checkTokenCycles(tree, diagnostics);
  }
  tree.diagnostics = diagnostics;
  return { tree, diagnostics };
}

export function loadVocabulary(path = 'docs/spec/vocabulary.lino') {
  return readVocabulary(readFileSync(path, 'utf8'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const vocabulary = loadVocabulary();
  const { tree } = projectText(
    readFileSync(process.argv[2], 'utf8'),
    vocabulary
  );
  console.log(JSON.stringify(tree, null, 2));
}
