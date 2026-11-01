#!/usr/bin/env node
// Check that every file under assets/ has exactly one record in
// assets/assets.lino, that every record follows the licence policy in
// docs/licensing.md, and that REUSE.toml matches the records.
//
//   node scripts/check-assets.mjs            # check, exit 1 on problems
//   node scripts/check-assets.mjs --write    # regenerate REUSE.toml
//   node scripts/check-assets.mjs --root DIR # check another checkout

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  generateReuseToml,
  listAssetFiles,
  parseAssetRecords,
  runCli,
  syncGeneratedFile,
  validateAssetRecords,
} from './lib/asset-records.mjs';

export const RECORDS_PATH = 'assets/assets.lino';
export const REUSE_PATH = 'REUSE.toml';

/**
 * @param {string} root repository root
 * @param {{write?: boolean}} [options]
 * @returns {{errors: string[], wrote: boolean}}
 */
export function checkAssets(root, { write = false } = {}) {
  const recordsFile = join(root, RECORDS_PATH);
  const text = existsSync(recordsFile) ? readFileSync(recordsFile, 'utf8') : '';
  const records = parseAssetRecords(text);
  const files = listAssetFiles(root);
  const { errors } = validateAssetRecords(records, files);
  const { stale } = syncGeneratedFile(
    join(root, REUSE_PATH),
    generateReuseToml(records),
    { write }
  );
  if (stale && !write) {
    errors.push(
      `${REUSE_PATH} is out of date; run: node scripts/check-assets.mjs --write`
    );
  }
  return { errors, wrote: stale && write };
}

function main(root, argv) {
  const { errors, wrote } = checkAssets(root, {
    write: argv.includes('--write'),
  });
  if (wrote) {
    console.log(`Wrote ${REUSE_PATH}`);
  }
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`::error::${error}`);
    }
    console.error(
      `\n${errors.length} asset licensing problem(s). See docs/licensing.md.`
    );
    return 1;
  }
  console.log('Asset records and REUSE.toml are consistent.');
  return 0;
}

runCli(import.meta.url, main);
