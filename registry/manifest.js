'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CHARTS_SRC_DIR = path.join(ROOT_DIR, 'src', 'components', 'charts');
const LIB_DIR = path.join(ROOT_DIR, 'lib');
const SHARED_DIR = path.join(CHARTS_SRC_DIR, '_shared');

const SITE_URL = 'https://mariocharts.com';
const AUTHOR = 'Yuri Bodo';

// The single source of truth for what ships. Every generated artifact — the CLI
// fallback, public/r/*.json, llms.txt, the sitemap, the markdown docs — derives
// from this list. Adding a chart directory without adding an entry here fails
// the manifest test.
// docsSlug is the directory name under app/docs/components/. It equals
// `name` for every chart except treemap-chart, whose docs route on disk is
// app/docs/components/treemap (no "-chart" suffix) because that URL is
// already live, indexed, and self-canonical — renaming the route would need
// a redirect. Do not "simplify" this back to `name`; the mismatch is real.
const CHARTS = [
  {
    name: 'bar-chart',
    docsSlug: 'bar-chart',
    title: 'Bar Chart',
    description: 'A customizable bar chart component with animations, hover effects, responsive design, and support for both vertical and horizontal orientations with filled or outline variants',
    importName: 'BarChart',
    exportName: 'BarChart',
    siblingFiles: [],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'index.tsx',
  },
  {
    name: 'line-chart',
    docsSlug: 'line-chart',
    title: 'Line Chart',
    description: 'A sophisticated line chart component with triangular markers, textured area fills, multiple series support, gap handling, curve interpolation, and advanced animations',
    importName: 'LineChart',
    exportName: 'LineChart',
    siblingFiles: [],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'index.tsx',
  },
  {
    name: 'scatter-plot',
    docsSlug: 'scatter-plot',
    title: 'Scatter Plot',
    description: 'A versatile scatter plot and bubble chart component with multi-series support, trend lines, dynamic bubble sizing, responsive design, and smooth animations',
    importName: 'ScatterPlot',
    exportName: 'ScatterPlot',
    siblingFiles: ['types.ts', 'scales.ts', 'regression.ts'],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'types.ts',
  },
  {
    name: 'pie-chart',
    docsSlug: 'pie-chart',
    title: 'Pie Chart',
    description: 'A customizable pie and donut chart component with animated segments, interactive hover effects, center labels, and responsive design',
    importName: 'PieChart',
    exportName: 'PieChart',
    siblingFiles: [],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'index.tsx',
  },
  {
    name: 'radar-chart',
    docsSlug: 'radar-chart',
    title: 'Radar Chart',
    description: 'A multi-axis radar chart component with multi-series support, animated fills, interactive tooltips, and responsive design',
    importName: 'RadarChart',
    exportName: 'RadarChart',
    siblingFiles: ['types.ts', 'geometry.ts', 'scales.ts'],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'types.ts',
  },
  {
    name: 'stacked-bar-chart',
    docsSlug: 'stacked-bar-chart',
    title: 'Stacked Bar Chart',
    description: 'A stacked bar chart component with multiple segment support, animated stacking, interactive tooltips, and both vertical and horizontal orientations',
    importName: 'StackedBarChart',
    exportName: 'StackedBarChart',
    siblingFiles: [],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'index.tsx',
  },
  {
    name: 'gauge-chart',
    docsSlug: 'gauge-chart',
    title: 'Gauge Chart',
    description: 'A 3/4 arc gauge chart component with configurable color zones, animated needle, center value display, and responsive design',
    importName: 'GaugeChart',
    exportName: 'GaugeChart',
    siblingFiles: ['utils.ts'],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'index.tsx',
  },
  {
    name: 'heatmap',
    docsSlug: 'heatmap',
    title: 'Heatmap Chart',
    description: 'A heatmap chart component with configurable color schemes, animated cells, interactive tooltips, row/column labels, and multiple layout variants',
    importName: 'HeatmapChart',
    exportName: 'HeatmapChart',
    siblingFiles: [],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'index.tsx',
  },
  {
    name: 'funnel-chart',
    docsSlug: 'funnel-chart',
    title: 'Funnel Chart',
    description: 'A funnel chart component with vertical trapezoid and horizontal diminishing bar variants, animated segments, conversion rates, and interactive tooltips',
    importName: 'FunnelChart',
    exportName: 'FunnelChart',
    siblingFiles: [],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'index.tsx',
  },
  {
    name: 'area-chart',
    docsSlug: 'area-chart',
    title: 'Area Chart',
    description: 'A layered area chart component with multiple curve interpolations, gradient fills, multi-series support, and responsive design',
    importName: 'AreaChart',
    exportName: 'AreaChart',
    siblingFiles: [],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'index.tsx',
  },
  {
    name: 'treemap-chart',
    // The docs route on disk is app/docs/components/treemap, not
    // treemap-chart — see the comment above CHARTS.
    docsSlug: 'treemap',
    title: 'Treemap Chart',
    description: 'A squarified treemap chart component for hierarchical data with nested rectangles, animated layout, interactive tooltips, and responsive design',
    // TreeMapChart, with a capital M — the component and the barrel in
    // src/components/index.ts both spell it that way, even though the
    // directory is treemap-chart. Every published import example is built
    // from this string, so a mismatch ships a non-compiling copy-paste.
    importName: 'TreeMapChart',
    exportName: 'TreeMapChart',
    siblingFiles: ['layout.ts'],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'index.tsx',
  },
  {
    name: 'waterfall-chart',
    docsSlug: 'waterfall-chart',
    title: 'Waterfall Chart',
    description: 'A waterfall chart component visualizing cumulative increases, decreases, and running totals with animated floating bars and connectors',
    importName: 'WaterfallChart',
    exportName: 'WaterfallChart',
    siblingFiles: ['utils.ts'],
    categories: ['charts', 'dashboard'],
    propsSourceFile: 'index.tsx',
  },
];

// Charts that import from `../_shared` (all except area-chart, which only
// pulls `cn` and `useIsomorphicLayoutEffect` directly from lib/*).
const CHARTS_WITHOUT_SHARED = new Set(['area-chart']);

function readSource(absPath) {
  if (!fs.existsSync(absPath)) {
    throw new Error(`Source file not found at ${absPath}`);
  }
  return fs.readFileSync(absPath, 'utf8');
}

function buildChartItem(chart) {
  const chartDir = path.join(CHARTS_SRC_DIR, chart.name);

  const files = [
    { name: `${chart.name}/index.tsx`, content: readSource(path.join(chartDir, 'index.tsx')) },
    ...chart.siblingFiles.map((fileName) => ({
      name: `${chart.name}/${fileName}`,
      content: readSource(path.join(chartDir, fileName)),
    })),
  ];

  const registryDependencies = CHARTS_WITHOUT_SHARED.has(chart.name)
    ? ['lib-utils', 'lib-hooks']
    : ['lib-utils', 'chart-shared'];

  return {
    name: chart.name,
    kind: 'chart',
    legacy: { type: 'chart', category: 'charts', subcategory: 'basic' },
    title: chart.title,
    description: chart.description,
    npmDependencies: ['framer-motion'],
    devDependencies: [],
    peerDependencies: ['react', 'react-dom'],
    registryDependencies,
    files,
    meta: {
      importName: chart.importName,
      exportName: chart.exportName,
      displayName: chart.title,
    },
    categories: chart.categories,
    propsSourceFile: chart.propsSourceFile,
    docsSlug: chart.docsSlug,
  };
}

function buildSupportItems() {
  const libUtils = {
    name: 'lib-utils',
    kind: 'lib',
    legacy: { type: 'lib', category: 'lib', subcategory: 'internal' },
    title: 'Class Name Helper',
    description: 'Internal `cn` classname helper shared by every chart component.',
    npmDependencies: ['clsx', 'tailwind-merge'],
    devDependencies: [],
    peerDependencies: [],
    registryDependencies: [],
    files: [{ name: 'utils.ts', content: readSource(path.join(LIB_DIR, 'utils.ts')) }],
    meta: {},
    categories: ['lib'],
    propsSourceFile: null,
  };

  const libHooks = {
    name: 'lib-hooks',
    kind: 'lib',
    legacy: { type: 'lib', category: 'lib', subcategory: 'internal' },
    title: 'Isomorphic Layout Effect Hook',
    description: 'Internal isomorphic layout effect hook shared by chart components.',
    npmDependencies: [],
    devDependencies: [],
    peerDependencies: ['react'],
    registryDependencies: [],
    files: [{ name: 'hooks.ts', content: readSource(path.join(LIB_DIR, 'hooks.ts')) }],
    meta: {},
    categories: ['lib'],
    propsSourceFile: null,
  };

  // CLI writes go through sanitizeFileName(), which lowercases every path
  // segment — a PascalCase source file like ChartTooltip.tsx would land on
  // disk as charttooltip.tsx and break the barrel's `./ChartTooltip` import
  // on case-sensitive filesystems. Rename it to kebab-case for the embedded
  // copy only, and rewrite the one barrel import line to match.
  const sharedFileNames = ['index.ts', 'types.ts', 'utils.ts', 'hooks.ts', 'tooltip-types.ts'];

  const chartShared = {
    name: 'chart-shared',
    kind: 'internal',
    legacy: { type: 'internal', category: 'charts', subcategory: 'internal' },
    title: 'Chart Shared Internals',
    description: 'Internal shared module (types, formatting, tooltip, resize hook) used by every chart component.',
    npmDependencies: ['framer-motion'],
    devDependencies: [],
    peerDependencies: ['react', 'react-dom'],
    registryDependencies: ['lib-hooks'],
    files: [
      ...sharedFileNames.map((fileName) => {
        const content = readSource(path.join(SHARED_DIR, fileName));
        return {
          name: `_shared/${fileName}`,
          content: fileName === 'index.ts'
            ? content.replace('./ChartTooltip', './chart-tooltip')
            : content,
        };
      }),
      {
        name: '_shared/chart-tooltip.tsx',
        content: readSource(path.join(SHARED_DIR, 'ChartTooltip.tsx')),
      },
    ],
    meta: {},
    categories: ['lib'],
    propsSourceFile: null,
  };

  return [libUtils, libHooks, chartShared];
}

function buildAllItems() {
  return [...CHARTS.map(buildChartItem), ...buildSupportItems()];
}

module.exports = {
  ROOT_DIR,
  SITE_URL,
  AUTHOR,
  CHARTS,
  CHARTS_WITHOUT_SHARED,
  buildAllItems,
};
