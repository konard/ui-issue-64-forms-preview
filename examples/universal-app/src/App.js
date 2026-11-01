import { createElement as h } from 'react';
import { UI_DIALECT_VERSION } from '../../../packages/ui-core/src/index.js';

const repositoryUrl =
  import.meta.env.VITE_REPOSITORY_URL ??
  'https://github.com/link-foundation/ui';

const desktopTargets = [
  {
    label: 'Windows',
    detail: 'Installer or portable package from the latest desktop build.',
  },
  {
    label: 'macOS',
    detail: 'Signed archive when Apple credentials are configured.',
  },
  {
    label: 'Linux',
    detail: 'Zip, deb, or rpm output from Electron Forge.',
  },
];

function ResultTile({ label, value, tone }) {
  return h(
    'div',
    { className: `result-tile result-tile-${tone}` },
    h('span', { className: 'result-label' }, label),
    h('strong', null, String(value))
  );
}

function DownloadTarget({ label, detail }) {
  return h('li', null, h('span', null, label), h('small', null, detail));
}

export function App() {
  return h(
    'main',
    { className: 'app-shell' },
    h(
      'section',
      { className: 'workspace', 'aria-labelledby': 'calculator-title' },
      h(
        'div',
        { className: 'calculator-panel' },
        h('p', { className: 'eyebrow' }, 'Associative UI framework'),
        h('h1', { id: 'calculator-title' }, 'link-foundation/ui'),
        h(
          'div',
          { className: 'results-grid', 'aria-live': 'polite' },
          h(ResultTile, {
            label: 'UI dialect version',
            value: UI_DIALECT_VERSION,
            tone: 'green',
          })
        )
      ),
      h(
        'aside',
        { className: 'distribution-panel', 'aria-labelledby': 'desktop-title' },
        h('h2', { id: 'desktop-title' }, 'Desktop builds'),
        h(
          'p',
          null,
          'The same React bundle is used by GitHub Pages, Electron, Android, and iOS.'
        ),
        h(
          'ul',
          { className: 'target-list' },
          desktopTargets.map((target) =>
            h(DownloadTarget, { key: target.label, ...target })
          )
        ),
        h(
          'a',
          {
            className: 'download-link',
            href: `${repositoryUrl}/releases/latest`,
            target: '_blank',
            rel: 'noreferrer',
          },
          'Open desktop downloads'
        )
      )
    )
  );
}
