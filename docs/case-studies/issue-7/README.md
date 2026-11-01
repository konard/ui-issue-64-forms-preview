# Issue 7: release preflight fails on `main`

## Evidence (2026-11-01)

- After #3 the root package is `@link-foundation/ui` (version `0.11.31`) and
  is **not** private (`package.json` has no `"private": true`). There are no
  workspace packages yet (#9).
- `npm view @link-foundation/ui version` answers `404`: the package was never
  published.
- `gh secret list --repo link-foundation/ui` lists no `NPM_TOKEN`.
- The "Release Preflight" job on `main` (run 41326431642, merge of #77) still
  fails, now with the final name — see
  [`ci-logs/main-41326431642.log`](ci-logs/main-41326431642.log):

  ```text
  FAIL: npm has no package @link-foundation/ui yet, ... Add an NPM_TOKEN
  repository secret (a granular token allowed to publish @link-foundation/ui)
  ```

## Root cause

npm can configure trusted publishing only for a package that already exists.
The first publish of `@link-foundation/ui` therefore needs a token, which
only a maintainer can create. `scripts/preflight-credentials.sh` behaves as
designed and reports exactly that; the private-package branch of step 3 of
the issue does not apply because the root package is public.

## Maintainer actions (cannot be done by an agent)

1. Create a granular npm token that can publish `@link-foundation/ui` and
   store it as `NPM_TOKEN` at
   https://github.com/link-foundation/ui/settings/secrets/actions.
2. Re-run "Checks and release" on `main`; the preflight passes through the
   `NPM_TOKEN` bootstrap path and the release publishes.
3. Add a trusted publisher (repository `link-foundation/ui`, workflow
   `release.yml`) at https://www.npmjs.com/package/@link-foundation/ui/access.
4. Delete the `NPM_TOKEN` secret. The preflight then verifies the OIDC
   exchange instead.

Verify with:

```bash
gh run list --repo link-foundation/ui --workflow release.yml --branch main --limit 1
gh secret list --repo link-foundation/ui
npm view @link-foundation/ui version
```
