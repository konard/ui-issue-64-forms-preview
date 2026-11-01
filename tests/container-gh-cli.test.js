import { describe, it, expect } from 'test-anywhere';
import { readFileSync, readdirSync } from 'node:fs';

// Container images such as the Playwright one do not ship the GitHub CLI, so
// a container job that runs `gh` must install it first.
const WORKFLOW_DIRECTORY = '.github/workflows';
const GH_COMMAND = /(^|[\s;&|(`$])gh\s+[a-z]/;
const GH_INSTALL = /apt-get install\b[^\n]*\sgh(\s|$)/;
const GH_VERSION = /(^|[\s;&|])gh --version\b/;

/**
 * Splits a workflow into jobs and each job into its steps, using indentation.
 * @param {string} workflow
 * @returns {{name: string, body: string, steps: string[]}[]}
 */
export function parseJobs(workflow) {
  const lines = workflow.replaceAll('\r\n', '\n').split('\n');
  const start = lines.findIndex((line) => line === 'jobs:');
  const jobs = [];
  for (const line of lines.slice(start + 1)) {
    const header = line.match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
    if (header) {
      jobs.push({ name: header[1], lines: [] });
    } else if (/^\S/.test(line)) {
      break;
    } else if (jobs.length > 0) {
      jobs.at(-1).lines.push(line);
    }
  }
  return jobs.map(({ name, lines: jobLines }) => {
    const steps = [];
    for (const line of jobLines) {
      if (/^ {6}- /.test(line)) {
        steps.push(line);
      } else if (steps.length > 0) {
        steps[steps.length - 1] += `\n${line}`;
      }
    }
    return { name, body: jobLines.join('\n'), steps };
  });
}

/**
 * Lists container jobs whose first `gh` call is not preceded by a step that
 * installs the GitHub CLI and prints its version.
 * @param {string} workflow
 * @returns {string[]}
 */
export function findContainerJobsMissingGh(workflow) {
  return parseJobs(workflow)
    .filter((job) => /^ {4}container:/m.test(job.body))
    .filter((job) => {
      const code = job.steps.map((step) =>
        step
          .split('\n')
          .filter((line) => !line.trimStart().startsWith('#'))
          .join('\n')
      );
      const firstUse = code.findIndex(
        (step) => GH_COMMAND.test(step) && !GH_INSTALL.test(step)
      );
      if (firstUse === -1) {
        return false;
      }
      return !code
        .slice(0, firstUse)
        .some((step) => GH_INSTALL.test(step) && GH_VERSION.test(step));
    })
    .map((job) => job.name);
}

function readWorkflows() {
  return readdirSync(WORKFLOW_DIRECTORY)
    .filter((fileName) => /\.ya?ml$/.test(fileName))
    .map((fileName) => ({
      fileName,
      workflow: readFileSync(`${WORKFLOW_DIRECTORY}/${fileName}`, 'utf8'),
    }));
}

describe('container jobs and the GitHub CLI', () => {
  it('installs gh before any container job runs it', () => {
    const missing = readWorkflows().flatMap(({ fileName, workflow }) =>
      findContainerJobsMissingGh(workflow).map((job) => `${fileName}:${job}`)
    );
    expect(missing).toEqual([]);
  });

  it('keeps the preview-regen install step', () => {
    const workflow = readFileSync(
      `${WORKFLOW_DIRECTORY}/example-app.yml`,
      'utf8'
    );
    const job = parseJobs(workflow).find((j) => j.name === 'preview-regen');
    expect(job.body.includes('gh auth setup-git')).toBe(true);
    const install = job.steps.find((step) => GH_INSTALL.test(step));
    expect(Boolean(install)).toBe(true);
    expect(install.includes("if: steps.drift.outputs.drift == 'true'")).toBe(
      true
    );
    expect(install.includes('gpg --show-keys')).toBe(true);
  });

  it('flags a container job that runs gh without installing it', () => {
    const workflow = [
      'jobs:',
      '  regen:',
      '    runs-on: ubuntu-24.04',
      '    container:',
      '      image: example',
      '    steps:',
      '      - name: Commit',
      '        run: |',
      '          gh auth setup-git',
      '  host:',
      '    runs-on: ubuntu-24.04',
      '    steps:',
      '      - run: gh pr list',
      '',
    ].join('\n');
    expect(findContainerJobsMissingGh(workflow)).toEqual(['regen']);
    const fixed = workflow.replace(
      '      - name: Commit',
      '      - run: apt-get install -y gh && gh --version\n      - name: Commit'
    );
    expect(findContainerJobsMissingGh(fixed)).toEqual([]);
  });
});
