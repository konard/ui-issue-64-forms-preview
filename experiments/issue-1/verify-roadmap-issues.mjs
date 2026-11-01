#!/usr/bin/env node
// Checks that the GitHub issues created by create-roadmap-issues.mjs match
// their source files: title, type, labels, "blocked by" dependencies and
// sub-issues of the tracking task. Read-only; prints one line per mismatch.
//
// Usage: node experiments/issue-1/verify-roadmap-issues.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { loadIssues } from './create-roadmap-issues.mjs';

const REPO = process.env.REPO ?? 'link-foundation/ui';
const STATE = JSON.parse(
  readFileSync('docs/case-studies/issue-1/roadmap/created-issues.json', 'utf8')
);
// `jq` keeps the output small: list endpoints embed full issue bodies.
const api = (path, jq) =>
  execFileSync('gh', ['api', '--paginate', path, '--jq', jq], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
const numbers = (path) =>
  api(path, '.[].number')
    .split('\n')
    .filter(Boolean)
    .map((line) => numberToKey.get(Number(line)) ?? `#${line}`);
const sameSet = (a, b) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

const issues = loadIssues();
const numberToKey = new Map(
  Object.entries(STATE).map(([key, entry]) => [entry.number, key])
);
const problems = [];
let links = 0;
for (const issue of issues) {
  const entry = STATE[issue.key];
  if (!entry) {
    problems.push(`${issue.key}: not created`);
    continue;
  }
  const remote = JSON.parse(
    api(
      `repos/${REPO}/issues/${entry.number}`,
      '{title, body, type: {name: .type.name}, labels: [.labels[] | {name}]}'
    )
  );
  if (remote.title !== issue.title) {
    problems.push(`${issue.key}: title differs`);
  }
  if (remote.type?.name !== issue.type) {
    problems.push(`${issue.key}: type ${remote.type?.name}`);
  }
  const labels = remote.labels.map((label) => label.name);
  if (!sameSet(labels, issue.labels)) {
    problems.push(`${issue.key}: labels ${labels}`);
  }
  if (/\{\{[A-Z]\d+\}\}/.test(remote.body)) {
    problems.push(`${issue.key}: unresolved {{KEY}} in body`);
  }
  const blockers = numbers(
    `repos/${REPO}/issues/${entry.number}/dependencies/blocked_by`
  );
  links += blockers.length;
  if (!sameSet(blockers, issue.blocked_by)) {
    problems.push(
      `${issue.key}: blocked by ${blockers} (expected ${issue.blocked_by})`
    );
  }
}
const tracking = issues.find((issue) => issue.type === 'Task');
const subIssues = numbers(
  `repos/${REPO}/issues/${STATE[tracking.key].number}/sub_issues`
);
const expectedSubs = issues
  .filter((issue) => issue !== tracking)
  .map((issue) => issue.key);
if (!sameSet(subIssues, expectedSubs)) {
  problems.push(`${tracking.key}: sub-issues ${subIssues.length}`);
}
console.log(
  `${issues.length} issues, ${links} blocked-by links, ${subIssues.length} sub-issues of #${STATE[tracking.key].number}`
);
console.log(problems.length ? problems.join('\n') : 'all match');
process.exit(problems.length ? 1 : 0);
