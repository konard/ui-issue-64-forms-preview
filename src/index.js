/**
 * Entry point of the associative UI framework `@link-foundation/ui`.
 *
 * The framework is being built according to docs/ARCHITECTURE.md and
 * docs/ROADMAP.md. Until the first packages land, the entry point exports
 * only the package version so smoke and package tests have something to load.
 */

import packageJson from '../package.json' with { type: 'json' };

/**
 * Version of the `@link-foundation/ui` package, read from package.json.
 * @type {string}
 */
export const version = packageJson.version;
