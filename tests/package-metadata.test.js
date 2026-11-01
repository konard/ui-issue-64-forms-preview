import { describe, it, expect } from 'test-anywhere';
import { existsSync, readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const lockJson = JSON.parse(readFileSync('package-lock.json', 'utf8'));

describe('publishable package metadata', () => {
  it('identifies itself as the associative UI framework', () => {
    expect(packageJson.name).toBe('@link-foundation/ui');
    expect(packageJson.publishConfig).toEqual({ access: 'public' });
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
    expect(packageJson.keywords).toEqual([
      'ui',
      'links-notation',
      'associative',
      'design-system',
      'wysiwyg',
    ]);
  });

  it('does not ship the template CLI', () => {
    expect(packageJson.bin).toBeUndefined();
    expect(lockJson.packages[''].bin).toBeUndefined();
    expect(existsSync('bin')).toBe(false);
  });

  it('publishes only the package runtime surface', () => {
    expect(packageJson.files).toEqual([
      'src/',
      'CHANGELOG.md',
      'LICENSE',
      'README.md',
    ]);
  });
});
