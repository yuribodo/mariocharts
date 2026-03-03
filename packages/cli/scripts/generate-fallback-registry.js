#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..', '..');
const cliUtilsDir = path.resolve(__dirname, '..', 'src', 'utils');
const outputPath = path.join(cliUtilsDir, 'fallback-generated.ts');

const components = [
  {
    name: 'bar-chart',
    type: 'chart',
    category: 'charts',
    subcategory: 'basic',
    description: 'A customizable bar chart component with animations, hover effects, responsive design, and support for both vertical and horizontal orientations with filled or outline variants',
    dependencies: ['framer-motion'],
    devDependencies: [],
    registryDependencies: [],
    peerDependencies: ['react', 'react-dom'],
    meta: {
      importName: 'BarChart',
      exportName: 'BarChart',
      displayName: 'Bar Chart',
    },
    fileName: 'bar-chart/index.tsx',
    sourcePath: path.join(rootDir, 'src', 'components', 'charts', 'bar-chart', 'index.tsx'),
  },
  {
    name: 'line-chart',
    type: 'chart',
    category: 'charts',
    subcategory: 'basic',
    description: 'A sophisticated line chart component with triangular markers, textured area fills, multiple series support, gap handling, curve interpolation, and advanced animations',
    dependencies: ['framer-motion'],
    devDependencies: [],
    registryDependencies: [],
    peerDependencies: ['react', 'react-dom'],
    meta: {
      importName: 'LineChart',
      exportName: 'LineChart',
      displayName: 'Line Chart',
    },
    fileName: 'line-chart/index.tsx',
    sourcePath: path.join(rootDir, 'src', 'components', 'charts', 'line-chart', 'index.tsx'),
  },
  {
    name: 'scatter-plot',
    type: 'chart',
    category: 'charts',
    subcategory: 'basic',
    description: 'A versatile scatter plot and bubble chart component with multi-series support, trend lines, dynamic bubble sizing, responsive design, and smooth animations',
    dependencies: ['framer-motion'],
    devDependencies: [],
    registryDependencies: [],
    peerDependencies: ['react', 'react-dom'],
    meta: {
      importName: 'ScatterPlot',
      exportName: 'ScatterPlot',
      displayName: 'Scatter Plot',
    },
    fileName: 'scatter-plot/index.tsx',
    sourcePath: path.join(rootDir, 'src', 'components', 'charts', 'scatter-plot', 'index.tsx'),
  },
  {
    name: 'pie-chart',
    type: 'chart',
    category: 'charts',
    subcategory: 'basic',
    description: 'A customizable pie and donut chart component with animated segments, interactive hover effects, center labels, and responsive design',
    dependencies: ['framer-motion'],
    devDependencies: [],
    registryDependencies: [],
    peerDependencies: ['react', 'react-dom'],
    meta: {
      importName: 'PieChart',
      exportName: 'PieChart',
      displayName: 'Pie Chart',
    },
    fileName: 'pie-chart/index.tsx',
    sourcePath: path.join(rootDir, 'src', 'components', 'charts', 'pie-chart', 'index.tsx'),
  },
  {
    name: 'radar-chart',
    type: 'chart',
    category: 'charts',
    subcategory: 'basic',
    description: 'A multi-axis radar chart component with multi-series support, animated fills, interactive tooltips, and responsive design',
    dependencies: ['framer-motion'],
    devDependencies: [],
    registryDependencies: [],
    peerDependencies: ['react', 'react-dom'],
    meta: {
      importName: 'RadarChart',
      exportName: 'RadarChart',
      displayName: 'Radar Chart',
    },
    fileName: 'radar-chart/index.tsx',
    sourcePath: path.join(rootDir, 'src', 'components', 'charts', 'radar-chart', 'index.tsx'),
  },
  {
    name: 'stacked-bar-chart',
    type: 'chart',
    category: 'charts',
    subcategory: 'basic',
    description: 'A stacked bar chart component with multiple segment support, animated stacking, interactive tooltips, and both vertical and horizontal orientations',
    dependencies: ['framer-motion'],
    devDependencies: [],
    registryDependencies: [],
    peerDependencies: ['react', 'react-dom'],
    meta: {
      importName: 'StackedBarChart',
      exportName: 'StackedBarChart',
      displayName: 'Stacked Bar Chart',
    },
    fileName: 'stacked-bar-chart/index.tsx',
    sourcePath: path.join(rootDir, 'src', 'components', 'charts', 'stacked-bar-chart', 'index.tsx'),
  },
  {
    name: 'gauge-chart',
    type: 'chart',
    category: 'charts',
    subcategory: 'basic',
    description: 'A 3/4 arc gauge chart component with configurable color zones, animated needle, center value display, and responsive design',
    dependencies: ['framer-motion'],
    devDependencies: [],
    registryDependencies: [],
    peerDependencies: ['react', 'react-dom'],
    meta: {
      importName: 'GaugeChart',
      exportName: 'GaugeChart',
      displayName: 'Gauge Chart',
    },
    fileName: 'gauge-chart/index.tsx',
    sourcePath: path.join(rootDir, 'src', 'components', 'charts', 'gauge-chart', 'index.tsx'),
  },
  {
    name: 'heatmap',
    type: 'chart',
    category: 'charts',
    subcategory: 'basic',
    description: 'A heatmap chart component with configurable color schemes, animated cells, interactive tooltips, row/column labels, and multiple layout variants',
    dependencies: ['framer-motion'],
    devDependencies: [],
    registryDependencies: [],
    peerDependencies: ['react', 'react-dom'],
    meta: {
      importName: 'HeatmapChart',
      exportName: 'HeatmapChart',
      displayName: 'Heatmap Chart',
    },
    fileName: 'heatmap/index.tsx',
    sourcePath: path.join(rootDir, 'src', 'components', 'charts', 'heatmap', 'index.tsx'),
  },
  {
    name: 'funnel-chart',
    type: 'chart',
    category: 'charts',
    subcategory: 'basic',
    description: 'A funnel chart component with vertical trapezoid and horizontal diminishing bar variants, animated segments, conversion rates, and interactive tooltips',
    dependencies: ['framer-motion'],
    devDependencies: [],
    registryDependencies: [],
    peerDependencies: ['react', 'react-dom'],
    meta: {
      importName: 'FunnelChart',
      exportName: 'FunnelChart',
      displayName: 'Funnel Chart',
    },
    fileName: 'funnel-chart/index.tsx',
    sourcePath: path.join(rootDir, 'src', 'components', 'charts', 'funnel-chart', 'index.tsx'),
  },
];

function readSourceContent(component) {
  if (!fs.existsSync(component.sourcePath)) {
    throw new Error(`Source file not found for ${component.name} at ${component.sourcePath}`);
  }

  return fs.readFileSync(component.sourcePath, 'utf8');
}

function buildGeneratedContent() {
  const fallbackIndex = [];
  const fallbackComponents = {};

  for (const component of components) {
    const content = readSourceContent(component);

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

    fallbackComponents[component.name] = {
      name: component.name,
      type: component.type,
      category: component.category,
      subcategory: component.subcategory,
      description: component.description,
      dependencies: component.dependencies,
      devDependencies: component.devDependencies,
      registryDependencies: component.registryDependencies,
      peerDependencies: component.peerDependencies,
      files: [
        {
          name: component.fileName,
          content,
        },
      ],
      meta: component.meta,
    };
  }

  return {
    fallbackIndex,
    fallbackComponents,
  };
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
