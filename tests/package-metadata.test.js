import { describe, it, expect } from 'test-anywhere';
import { existsSync, readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const lockJson = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const corePackageJson = JSON.parse(
  readFileSync('packages/ui-core/package.json', 'utf8')
);

describe('workspace root metadata', () => {
  it('is a private npm workspaces root named after the framework', () => {
    expect(packageJson.name).toBe('@link-foundation/ui');
    expect(packageJson.private).toBe(true);
    expect(packageJson.workspaces).toEqual(['packages/*']);
    expect(lockJson.name).toBe('@link-foundation/ui');
    expect(lockJson.packages[''].name).toBe('@link-foundation/ui');
  });

  it('points repository, homepage and bugs at link-foundation/ui', () => {
    expect(packageJson.repository).toEqual({
      type: 'git',
      url: 'git+https://github.com/link-foundation/ui.git',
    });
    expect(packageJson.homepage).toBe(
      'https://github.com/link-foundation/ui#readme'
    );
    expect(packageJson.bugs).toEqual({
      url: 'https://github.com/link-foundation/ui/issues',
    });
  });

  it('ships nothing from the root', () => {
    expect(packageJson.bin).toBeUndefined();
    expect(packageJson.main).toBeUndefined();
    expect(packageJson.files).toBeUndefined();
    expect(lockJson.packages[''].bin).toBeUndefined();
    expect(existsSync('bin')).toBe(false);
    expect(existsSync('src/index.js')).toBe(false);
  });
});

describe('@link-foundation/ui-core metadata', () => {
  it('is a public package linked into the workspace', () => {
    expect(corePackageJson.name).toBe('@link-foundation/ui-core');
    expect(corePackageJson.private).toBeUndefined();
    expect(corePackageJson.publishConfig).toEqual({ access: 'public' });
    expect(corePackageJson.license).toBe('Unlicense');
    expect(lockJson.packages['packages/ui-core'].name).toBe(
      '@link-foundation/ui-core'
    );
    expect(lockJson.packages['node_modules/@link-foundation/ui-core']).toEqual({
      resolved: 'packages/ui-core',
      link: true,
    });
  });

  it('publishes only the package runtime surface', () => {
    expect(corePackageJson.files).toEqual(['src/', 'README.md', 'LICENSE']);
    expect(corePackageJson.repository.directory).toBe('packages/ui-core');
  });
});
