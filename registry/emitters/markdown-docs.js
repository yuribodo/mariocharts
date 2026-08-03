'use strict';

const path = require('path');
const { ROOT_DIR, SITE_URL } = require('../manifest');
const { readPropsInterface } = require('../extract-props');

const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'docs', 'components');

// Generated from the same source files the registry ships, so the documented
// API cannot drift from the installed component. Deliberately not scraped from
// app/docs/components/*/**-content.tsx — those are 700+ line React components,
// and parsing them would be both fragile and pointless for this audience.
function renderChart(chart) {
  const props = readPropsInterface(chart);
  const npm = chart.npmDependencies.join(', ');

  return [
    `# ${chart.title}`,
    '',
    chart.description,
    '',
    '## Install',
    '',
    '```bash',
    `npx shadcn@latest add ${SITE_URL}/r/${chart.name}.json`,
    '```',
    '',
    'This copies the component source into your project and resolves its internal',
    'dependencies automatically. No Mario Charts package is added to your',
    'dependency tree.',
    '',
    '## Import',
    '',
    '```tsx',
    `import { ${chart.meta.exportName} } from "@/components/charts/${chart.name}";`,
    '```',
    '',
    '## Props',
    '',
    '```ts',
    props.text,
    '```',
    '',
    '## Dependencies',
    '',
    `npm packages added: ${npm}`,
    '',
    `Peer dependencies: ${chart.peerDependencies.join(', ')}`,
    '',
    '## Links',
    '',
    // docsSlug, not name: the docs route on disk can differ from the chart
    // name (treemap-chart's docs route is /docs/components/treemap). See
    // the comment above CHARTS in registry/manifest.js.
    `- Full documentation with live examples: ${SITE_URL}/docs/components/${chart.docsSlug}`,
    `- Registry item (complete source): ${SITE_URL}/r/${chart.name}.json`,
    `- All charts: ${SITE_URL}/llms.txt`,
    '',
  ].join('\n');
}

function emitMarkdownDocs(items) {
  return items
    .filter((item) => item.kind === 'chart')
    .map((chart) => ({
      path: path.join(OUTPUT_DIR, `${chart.name}.md`),
      content: renderChart(chart),
    }));
}

module.exports = { emitMarkdownDocs, OUTPUT_DIR };
