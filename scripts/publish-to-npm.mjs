#!/usr/bin/env bun

/**
 * Publish to npm using OIDC trusted publishing
 * Usage: node scripts/publish-to-npm.mjs [--should-pull] [--js-root <path>]
 *   should_pull: Optional flag to pull latest changes before publishing (for release job)
 *
 * Configuration:
 * - CLI: --js-root <path> to explicitly set JavaScript root
 * - Environment: JS_ROOT=<path>
 *
 * Uses link-foundation libraries:
 * - Lockfile-installed command-stream and lino-arguments helpers
 * - command-stream: Modern shell command execution with streaming support
 * - lino-arguments: Unified configuration from CLI args, env vars, and .lenv files
 *
 * Supports both single and multi-language repository structures via a
 * configurable package root.
 */

import { appendFileSync } from 'fs';

import { getJsRoot, needsCd, parseJsRootConfig } from './js-paths.mjs';
import { isPackageVersionPublished } from './npm-registry.mjs';
import { readPackageInfo, readReleasePackages } from './package-info.mjs';
import {
  buildAuthFailureGuidance,
  isNonRetryableFailure,
} from './publish-failure-classifier.mjs';
import {
  isAlreadyPublishedError,
  publishWithRetry,
  sleep,
} from './publish-retry.mjs';
import { bootstrapDependencies } from './bootstrap-dependencies.mjs';
import { loadCommandStream, loadLinoArguments } from './use-module.mjs';

// Import link-foundation libraries
// Loaded through bootstrapDependencies: when installed helpers are unavailable,
// this script reports the failure and writes its outputs, and the process
// does not die inside module initialisation.
const [{ $ }, { makeConfig }] = await bootstrapDependencies(
  [loadCommandStream, loadLinoArguments],
  { outputs: { published: 'false' } }
);

// Parse CLI arguments using lino-arguments
const config = makeConfig({
  yargs: ({ yargs, getenv }) =>
    yargs
      .option('should-pull', {
        type: 'boolean',
        default: getenv('SHOULD_PULL', false),
        describe: 'Pull latest changes before publishing',
      })
      .option('js-root', {
        type: 'string',
        default: getenv('JS_ROOT', ''),
        describe:
          'JavaScript package root directory (auto-detected if not specified)',
      }),
});

const { shouldPull, jsRoot: jsRootArg } = config;

// Get JavaScript package root (auto-detect or use explicit config)
const jsRootConfig = jsRootArg || parseJsRootConfig();
const jsRoot = getJsRoot({ jsRoot: jsRootConfig, verbose: true });

const MAX_RETRIES = 3;
const RETRY_DELAY = 10000; // 10 seconds

// Store the original working directory to restore after cd commands
// IMPORTANT: command-stream's cd is a virtual command that calls process.chdir()
const originalCwd = process.cwd();

// Patterns that indicate publish failure in changeset output
// Guards against false positives in CI/CD output parsing.
const FAILURE_PATTERNS = [
  'packages failed to publish',
  'error occurred while publishing',
  'npm error code E',
  'npm error 404',
  'npm error 401',
  'npm error 403',
  'Access token expired',
  'ENEEDAUTH',
];

/**
 * Check if the output contains any failure patterns
 * @param {string} output - Combined stdout and stderr
 * @returns {string|null} - The matched failure pattern or null if no failure detected
 */
function detectPublishFailure(output) {
  const lowerOutput = output.toLowerCase();
  for (const pattern of FAILURE_PATTERNS) {
    if (lowerOutput.includes(pattern.toLowerCase())) {
      return pattern;
    }
  }
  return null;
}

/**
 * Verify that a package version is published on npm
 * @param {string} packageName
 * @param {string} version
 * @returns {Promise<boolean>}
 */
function verifyPublished(packageName, version) {
  return isPackageVersionPublished(packageName, version);
}

/**
 * Append to GitHub Actions output file
 * @param {string} key
 * @param {string} value
 */
function setOutput(key, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `${key}=${value}\n`);
  }
}

/**
 * Run changeset:publish command with output capture
 * @param {Function} shell
 * @param {string} jsRoot
 * @param {string} originalCwd
 * @returns {Promise<{result: object|null, error: Error|null}>}
 */
async function runChangesetPublish(shell, jsRoot, originalCwd) {
  try {
    // Run changeset:publish from the js directory where package.json with this script exists
    // IMPORTANT: Use .run({ capture: true }) to capture output for failure detection
    // IMPORTANT: cd is a virtual command that calls process.chdir(), so we restore after
    if (needsCd({ jsRoot })) {
      const result = await shell`cd ${jsRoot} && npm run changeset:publish`.run(
        {
          capture: true,
        }
      );
      process.chdir(originalCwd);
      return { result, error: null };
    }
    const result = await shell`npm run changeset:publish`.run({
      capture: true,
    });
    return { result, error: null };
  } catch (error) {
    // Restore cwd on error before retry
    if (needsCd({ jsRoot })) {
      process.chdir(originalCwd);
    }
    return { result: null, error };
  }
}

/**
 * Analyze publish result for failures using multi-layer detection
 * @param {object|null} publishResult - The result from runChangesetPublish
 * @param {Error|null} commandError - Error thrown by the command
 * @returns {Error|null} - Error if failure detected, null otherwise
 */
function analyzePublishResult(publishResult, commandError) {
  if (commandError) {
    return commandError;
  }

  const combinedOutput = publishResult
    ? `${publishResult.stdout || ''}\n${publishResult.stderr || ''}`
    : '';

  // command-stream mirrors captured output live; retain it for failure analysis.
  // Check for failure patterns in output (most reliable for changeset)
  const failurePattern = detectPublishFailure(combinedOutput);
  if (failurePattern) {
    console.error(`Detected publish failure: "${failurePattern}"`);
    return new Error(`Publish failed: detected "${failurePattern}" in output`);
  }

  // Check exit code (if available and non-zero)
  if (publishResult && publishResult.code !== 0) {
    console.error(`Changeset exited with code ${publishResult.code}`);
    return new Error(`Publish failed with exit code ${publishResult.code}`);
  }

  return null;
}

/**
 * Run a single publish command invocation (no verification).
 * Verification is a separate failure domain handled by publishWithRetry.
 * @param {Function} shell
 * @param {string} jsRoot
 * @param {string} originalCwd
 * @returns {Promise<{success: boolean, error: Error|null, output: string}>}
 */
async function runPublishCommand(shell, jsRoot, originalCwd) {
  const { result, error } = await runChangesetPublish(
    shell,
    jsRoot,
    originalCwd
  );
  const analysisError = analyzePublishResult(result, error);
  const output = [
    analysisError?.message || '',
    result?.stdout || '',
    result?.stderr || '',
  ].join('\n');

  if (analysisError) {
    // Mark authentication / registry-configuration failures as non-retryable so
    // the retry loop can fail fast with actionable guidance without burning
    // through MAX_RETRIES.
    if (!isAlreadyPublishedError(output) && isNonRetryableFailure(output)) {
      analysisError.nonRetryable = true;
    }
    return { success: false, error: analysisError, output };
  }

  return { success: true, error: null, output };
}

/**
 * The package whose version the release job reports (published_version).
 * With several publishable packages and no RELEASE_PACKAGE there is none.
 * @returns {{name: string, version: string} | null}
 */
function readPrimaryPackage() {
  try {
    return readPackageInfo({ jsRoot });
  } catch (error) {
    console.log(`No single release package: ${error.message}`);
    return null;
  }
}

/**
 * The release packages npm does not have yet.
 * @param {{name: string, version: string}[]} packages
 */
async function findUnpublishedPackages(packages) {
  const pending = [];
  for (const pkg of packages) {
    console.log(
      `Checking if ${pkg.name}@${pkg.version} is already published...`
    );
    if (await isPackageVersionPublished(pkg.name, pkg.version)) {
      console.log(`${pkg.name}@${pkg.version} is already published to npm`);
    } else {
      pending.push(pkg);
    }
  }
  return pending;
}

/**
 * @param {{name: string, version: string}[]} packages
 * @returns {Promise<boolean>} whether every package is visible on npm
 */
async function verifyAllPublished(packages) {
  for (const pkg of packages) {
    if (!(await verifyPublished(pkg.name, pkg.version))) {
      return false;
    }
  }
  return true;
}

async function main() {
  try {
    if (shouldPull) {
      // Pull the latest changes we just pushed
      await $`git pull origin main`;
    }

    // Every publishable package (the root package in a single-package
    // repository, every non-private workspace package in a monorepo).
    // `changeset publish` publishes all of them that npm does not have yet.
    const packages = readReleasePackages({ jsRoot });
    const primary = readPrimaryPackage();
    for (const pkg of packages) {
      console.log(`Package to publish: ${pkg.name}@${pkg.version}`);
    }

    const pending = await findUnpublishedPackages(packages);

    setOutput(
      'published_packages',
      packages.map((pkg) => `${pkg.name}@${pkg.version}`).join(',')
    );
    if (pending.length === 0) {
      setOutput('published', 'true');
      setOutput('published_version', primary?.version ?? '');
      setOutput('already_published', 'true');
      return;
    }

    // Version not found on npm (E404), proceed with publish
    console.log(
      `Not on npm yet, proceeding with publish: ${pending.map((pkg) => `${pkg.name}@${pkg.version}`).join(', ')}`
    );

    // Publish to npm using OIDC trusted publishing with retry logic
    // Multi-layer failure detection guards against a publish command that
    // reports success without actually publishing.
    //
    // The publish command is retried only when the publish itself failed.
    // A verification miss is handled by bounded polling and never triggers a
    // republish.
    const { success, error } = await publishWithRetry({
      publish: () => runPublishCommand($, jsRoot, originalCwd),
      verify: () => verifyAllPublished(pending),
      maxRetries: MAX_RETRIES,
      retryDelay: RETRY_DELAY,
      sleepFn: sleep,
      log: (message) => console.log(message),
    });

    if (success) {
      setOutput('published', 'true');
      setOutput('published_version', primary?.version ?? '');
      for (const pkg of pending) {
        console.log(`\u2705 Published ${pkg.name}@${pkg.version} to npm`);
      }
      return;
    }

    console.error(`\u274C Publish failed: ${error.message}`);
    // Authentication / registry-configuration errors will not be fixed by
    // retrying, so print actionable guidance for the operator.
    if (error?.nonRetryable && !error?.verificationFailed) {
      console.error(
        buildAuthFailureGuidance(pending.map((pkg) => pkg.name).join(', '))
      );
    }
    process.exit(1);
  } catch (error) {
    // Restore cwd on error
    process.chdir(originalCwd);
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
