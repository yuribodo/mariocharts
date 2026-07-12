#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..', '..');
const cliUtilsDir = path.resolve(__dirname, '..', 'src', 'utils');
const outputPath = path.join(cliUtilsDir, 'fallback-generated.ts');
const chartsSrcDir = path.join(rootDir, 'src', 'components', 'charts');

// Every chart's index.tsx, plus any sibling source files it actually imports
// (excluding *.test.*). Keep this in sync with each chart's own imports —
// see #61: the CLI's fallback registry must embed every file a chart needs
// to compile standalone in a consumer's project, not just index.tsx.
const charts = [
  {
    name: 'bar-chart',
    description: 'A customizable bar chart component with animations, hover effects, responsive design, and support for both vertical and horizontal orientations with filled or outline variants',
    meta: { importName: 'BarChart', exportName: 'BarChart', displayName: 'Bar Chart' },
    siblingFiles: [],
  },
  {
    name: 'line-chart',
    description: 'A sophisticated line chart component with triangular markers, textured area fills, multiple series support, gap handling, curve interpolation, and advanced animations',
    meta: { importName: 'LineChart', exportName: 'LineChart', displayName: 'Line Chart' },
    siblingFiles: [],
  },
  {
    name: 'scatter-plot',
    description: 'A versatile scatter plot and bubble chart component with multi-series support, trend lines, dynamic bubble sizing, responsive design, and smooth animations',
    meta: { importName: 'ScatterPlot', exportName: 'ScatterPlot', displayName: 'Scatter Plot' },
    siblingFiles: ['types.ts', 'scales.ts', 'regression.ts'],
  },
  {
    name: 'pie-chart',
    description: 'A customizable pie and donut chart component with animated segments, interactive hover effects, center labels, and responsive design',
    meta: { importName: 'PieChart', exportName: 'PieChart', displayName: 'Pie Chart' },
    siblingFiles: [],
  },
  {
    name: 'radar-chart',
    description: 'A multi-axis radar chart component with multi-series support, animated fills, interactive tooltips, and responsive design',
    meta: { importName: 'RadarChart', exportName: 'RadarChart', displayName: 'Radar Chart' },
    siblingFiles: ['types.ts', 'geometry.ts', 'scales.ts'],
  },
  {
    name: 'stacked-bar-chart',
    description: 'A stacked bar chart component with multiple segment support, animated stacking, interactive tooltips, and both vertical and horizontal orientations',
    meta: { importName: 'StackedBarChart', exportName: 'StackedBarChart', displayName: 'Stacked Bar Chart' },
    siblingFiles: [],
  },
  {
    name: 'gauge-chart',
    description: 'A 3/4 arc gauge chart component with configurable color zones, animated needle, center value display, and responsive design',
    meta: { importName: 'GaugeChart', exportName: 'GaugeChart', displayName: 'Gauge Chart' },
    siblingFiles: ['utils.ts'],
  },
  {
    name: 'heatmap',
    description: 'A heatmap chart component with configurable color schemes, animated cells, interactive tooltips, row/column labels, and multiple layout variants',
    meta: { importName: 'HeatmapChart', exportName: 'HeatmapChart', displayName: 'Heatmap Chart' },
    siblingFiles: [],
  },
  {
    name: 'funnel-chart',
    description: 'A funnel chart component with vertical trapezoid and horizontal diminishing bar variants, animated segments, conversion rates, and interactive tooltips',
    meta: { importName: 'FunnelChart', exportName: 'FunnelChart', displayName: 'Funnel Chart' },
    siblingFiles: [],
  },
  {
    name: 'area-chart',
    description: 'A layered area chart component with multiple curve interpolations, gradient fills, multi-series support, and responsive design',
    meta: { importName: 'AreaChart', exportName: 'AreaChart', displayName: 'Area Chart' },
    siblingFiles: [],
  },
  {
    name: 'treemap-chart',
    description: 'A squarified treemap chart component for hierarchical data with nested rectangles, animated layout, interactive tooltips, and responsive design',
    meta: { importName: 'TreemapChart', exportName: 'TreemapChart', displayName: 'Treemap Chart' },
    siblingFiles: ['layout.ts'],
  },
  {
    name: 'waterfall-chart',
    description: 'A waterfall chart component visualizing cumulative increases, decreases, and running totals with animated floating bars and connectors',
    meta: { importName: 'WaterfallChart', exportName: 'WaterfallChart', displayName: 'Waterfall Chart' },
    siblingFiles: ['utils.ts'],
  },
];

// Charts that import from `../_shared` (all except area-chart, which only
// pulls `cn` and `useIsomorphicLayoutEffect` directly from lib/*).
const CHARTS_WITHOUT_SHARED = new Set(['area-chart']);

function readContent(absPath) {
  if (!fs.existsSync(absPath)) {
    throw new Error(`Source file not found at ${absPath}`);
  }
  return fs.readFileSync(absPath, 'utf8');
}

function buildChartComponent(chart) {
  const chartDir = path.join(chartsSrcDir, chart.name);

  const files = [
    { name: `${chart.name}/index.tsx`, content: readContent(path.join(chartDir, 'index.tsx')) },
    ...chart.siblingFiles.map((fileName) => ({
      name: `${chart.name}/${fileName}`,
      content: readContent(path.join(chartDir, fileName)),
    })),
  ];

  const registryDependencies = CHARTS_WITHOUT_SHARED.has(chart.name)
    ? ['lib-utils', 'lib-hooks']
    : ['lib-utils', 'chart-shared'];

  return {
    name: chart.name,
    type: 'chart',
    category: 'charts',
    subcategory: 'basic',
    description: chart.description,
    dependencies: ['framer-motion'],
    devDependencies: [],
    registryDependencies,
    peerDependencies: ['react', 'react-dom'],
    files,
    meta: chart.meta,
  };
}

function buildSupportComponents() {
  const libDir = path.join(rootDir, 'lib');
  const sharedDir = path.join(chartsSrcDir, '_shared');

  const libUtils = {
    name: 'lib-utils',
    type: 'lib',
    category: 'lib',
    subcategory: 'internal',
    description: 'Internal `cn` classname helper shared by every chart component.',
    dependencies: ['clsx', 'tailwind-merge'],
    devDependencies: [],
    registryDependencies: [],
    peerDependencies: [],
    files: [{ name: 'utils.ts', content: readContent(path.join(libDir, 'utils.ts')) }],
    meta: {},
  };

  const libHooks = {
    name: 'lib-hooks',
    type: 'lib',
    category: 'lib',
    subcategory: 'internal',
    description: 'Internal isomorphic layout effect hook shared by chart components.',
    dependencies: [],
    devDependencies: [],
    registryDependencies: [],
    peerDependencies: ['react'],
    files: [{ name: 'hooks.ts', content: readContent(path.join(libDir, 'hooks.ts')) }],
    meta: {},
  };

  // CLI writes go through sanitizeFileName(), which lowercases every path
  // segment — a PascalCase source file like ChartTooltip.tsx would land on
  // disk as charttooltip.tsx and break the barrel's `./ChartTooltip` import
  // on case-sensitive filesystems. Rename it to kebab-case for the embedded
  // copy only, and rewrite the one barrel import line to match.
  const sharedFileNames = ['index.ts', 'types.ts', 'utils.ts', 'hooks.ts', 'tooltip-types.ts'];

  const chartShared = {
    name: 'chart-shared',
    type: 'internal',
    category: 'charts',
    subcategory: 'internal',
    description: 'Internal shared module (types, formatting, tooltip, resize hook) used by every chart component.',
    dependencies: ['framer-motion'],
    devDependencies: [],
    registryDependencies: ['lib-hooks'],
    peerDependencies: ['react', 'react-dom'],
    files: [
      ...sharedFileNames.map((fileName) => {
        const content = readContent(path.join(sharedDir, fileName));
        return {
          name: `_shared/${fileName}`,
          content: fileName === 'index.ts'
            ? content.replace('./ChartTooltip', './chart-tooltip')
            : content,
        };
      }),
      {
        name: '_shared/chart-tooltip.tsx',
        content: readContent(path.join(sharedDir, 'ChartTooltip.tsx')),
      },
    ],
    meta: {},
  };

  return [libUtils, libHooks, chartShared];
}

function buildGeneratedContent() {
  const components = [...charts.map(buildChartComponent), ...buildSupportComponents()];

  const fallbackIndex = [];
  const fallbackComponents = {};

  for (const component of components) {
    fallbackIndex.push({
      name: component.name,
      type: component.type,
      category: component.category,
      subcategory: component.subcategory,
      description: component.description,
      dependencies: component.dependencies,
      devDependencies: component.devDependencies,
      registryDependencies: component.registryDependencies,
      peerDependencies: component.peerDependencies,
      meta: component.meta,
    });

    fallbackComponents[component.name] = component;
  }

  return { fallbackIndex, fallbackComponents };
}

function generateFile() {
  const { fallbackIndex, fallbackComponents } = buildGeneratedContent();

  const banner = [
    '/* eslint-disable */',
    '// This file is auto-generated by scripts/generate-fallback-registry.js',
    '// Do not edit this file directly. Update the source components instead.',
    '',
  ].join('\n');

  const imports = "import type { RegistryIndex, RegistryItem } from './types.js';\n\n";

  const body = [
    `export const FALLBACK_REGISTRY_INDEX: RegistryIndex = ${JSON.stringify(fallbackIndex, null, 2)};`,
    '',
    `export const FALLBACK_COMPONENTS: Record<string, RegistryItem> = ${JSON.stringify(fallbackComponents, null, 2)};`,
    '',
  ].join('\n');

  const content = `${banner}${imports}${body}`;
  const existingContent = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
  const hasChanges = existingContent !== content;

  fs.writeFileSync(outputPath, content);

  if (hasChanges) {
    console.log('[fallback] Embedded registry updated from source components.');
  } else {
    console.log('[fallback] Embedded registry is up to date.');
  }
}

generateFile();
