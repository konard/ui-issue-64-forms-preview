/**
 * ui-core entry point tests. Works with Node.js, Bun and Deno.
 *
 * The package is imported by its npm name, so the test also proves that the
 * npm workspace links `@link-foundation/ui-core` into node_modules.
 */

import { describe, it, expect } from 'test-anywhere';
import * as core from '@link-foundation/ui-core';

describe('@link-foundation/ui-core', () => {
  it('exports the UI dialect version', () => {
    expect(core.UI_DIALECT_VERSION).toBe('ui-dialect/0');
  });

  it('exports nothing else', () => {
    expect(Object.keys(core)).toEqual(['UI_DIALECT_VERSION']);
  });
});
