#!/usr/bin/env node

// Smoke test for `mario-charts add`: installs every chart into a scratch
// project via the *built* CLI binary and asserts the written output has no
// unresolved monorepo-relative imports (`../_shared`, `../../../../lib/*`).
//
// This exists because of #61: the embedded fallback registry only ever
// shipped each chart's index.tsx, never `_shared`, sibling helper files, or
// lib/{utils,hooks} — so every `add` produced components that didn't
// compile. This test drives the real compiled artifact end to end so a
// regression here fails CI instead of shipping in the next `npm publish`.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const cliRoot = path.resolve(__dirname, '..');
const cliBin = path.join(cliRoot, 'dist', 'index.js');

if (!fs.existsSync(cliBin)) {
  console.error(`[smoke-test] Built CLI not found at ${cliBin}. Run \`npm run build\` first.`);
  process.exit(1);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mario-charts-smoke-'));

function run(args) {
  console.log(`[smoke-test] $ mario-charts ${args.join(' ')}`);
  execFileSync('node', [cliBin, ...args], {
    cwd: tmpDir,
    stdio: 'inherit',
    // Force the embedded fallback registry regardless of whether
    // mariocharts.com/registry happens to be up — this test exists
    // specifically to guard the fallback path (see #61), not the live one.
    env: { ...process.env, MARIO_CHARTS_OFFLINE: '1' },
  });
}

function walk(dir, results) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, results);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

try {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify(
      {
        name: 'mario-charts-smoke-test',
        version: '0.0.0',
        private: true,
        // Listed so init's project-type detection finds React + Tailwind
        // and skips its interactive "install Tailwind?" prompt.
        dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
        devDependencies: { tailwindcss: '^3.4.0' },
      },
      null,
      2
    )
  );

  run(['init', '--defaults', '--yes']);
  run(['add', '--all', '--yes']);

  const outputFiles = walk(tmpDir, []);

  if (outputFiles.length === 0) {
    throw new Error('No .ts/.tsx files were written — `add --all` appears to have produced nothing.');
  }

  const FORBIDDEN_PATTERNS = [
    { pattern: /from\s+['"]\.\.\/_shared/, label: 'unresolved ../_shared import' },
    { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\//, label: 'unresolved ../../../../lib import' },
  ];

  const violations = [];
  for (const file of outputFiles) {
    const content = fs.readFileSync(file, 'utf8');
    for (const { pattern, label } of FORBIDDEN_PATTERNS) {
      if (pattern.test(content)) {
        violations.push(`${path.relative(tmpDir, file)}: ${label}`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('[smoke-test] Unresolved internal imports found:');
    violations.forEach((v) => console.error(`  - ${v}`));
    throw new Error(`${violations.length} file(s) contain unresolved monorepo-relative imports.`);
  }

  // Every chart's index.tsx, plus the sibling/shared/lib files #61
  // specifically broke (multi-file charts and the shared/lib modules every
  // chart depends on). Listing all 12 charts explicitly so a future edit
  // that silently drops one from the generator's `charts` array fails here
  // instead of shipping unnoticed.
  const expectedFiles = [
    'lib/utils.ts',
    'lib/hooks.ts',
    'components/charts/_shared/index.ts',
    'components/charts/_shared/chart-tooltip.tsx',
    'components/charts/_shared/tooltip-types.ts',
    'components/charts/bar-chart/index.tsx',
    'components/charts/line-chart/index.tsx',
    'components/charts/scatter-plot/index.tsx',
    'components/charts/scatter-plot/regression.ts',
    'components/charts/scatter-plot/scales.ts',
    'components/charts/scatter-plot/types.ts',
    'components/charts/pie-chart/index.tsx',
    'components/charts/radar-chart/index.tsx',
    'components/charts/radar-chart/geometry.ts',
    'components/charts/radar-chart/scales.ts',
    'components/charts/radar-chart/types.ts',
    'components/charts/stacked-bar-chart/index.tsx',
    'components/charts/gauge-chart/index.tsx',
    'components/charts/gauge-chart/utils.ts',
    'components/charts/heatmap/index.tsx',
    'components/charts/funnel-chart/index.tsx',
    'components/charts/area-chart/index.tsx',
    'components/charts/treemap-chart/index.tsx',
    'components/charts/treemap-chart/layout.ts',
    'components/charts/waterfall-chart/index.tsx',
    'components/charts/waterfall-chart/utils.ts',
  ];

  const missing = expectedFiles.filter((f) => !fs.existsSync(path.join(tmpDir, f)));
  if (missing.length > 0) {
    throw new Error(`Expected files were not written:\n${missing.map((f) => `  - ${f}`).join('\n')}`);
  }

  // `add`'s npm-install step logs a warning and keeps going on failure
  // rather than aborting (matches shadcn's "best effort" behavior) — so a
  // broken install wouldn't otherwise fail this test. Confirm the runtime
  // packages every chart needs actually landed in node_modules.
  const expectedPackages = ['react', 'react-dom', 'framer-motion', 'clsx', 'tailwind-merge'];
  const missingPackages = expectedPackages.filter(
    (pkg) => !fs.existsSync(path.join(tmpDir, 'node_modules', pkg))
  );
  if (missingPackages.length > 0) {
    throw new Error(`npm install did not produce expected packages: ${missingPackages.join(', ')}`);
  }

  console.log(
    `[smoke-test] OK — ${outputFiles.length} files written, no unresolved imports, all expected files and packages present.`
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
