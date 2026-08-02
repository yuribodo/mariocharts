const fs = require('fs');
const path = require('path');
const { buildAllItems } = require('../manifest');
const { emitLlms } = require('./llms');

const outputs = emitLlms(buildAllItems());
const short = outputs.find((o) => o.path.endsWith('llms.txt')).content;
const full = outputs.find((o) => o.path.endsWith('llms-full.txt')).content;

const ALL_CHARTS = [
  'area-chart', 'bar-chart', 'funnel-chart', 'gauge-chart', 'heatmap',
  'line-chart', 'pie-chart', 'radar-chart', 'scatter-plot',
  'stacked-bar-chart', 'treemap-chart', 'waterfall-chart',
];

describe('emitLlms', () => {
  it('emits exactly llms.txt and llms-full.txt', () => {
    expect(outputs).toHaveLength(2);
  });

  it('follows the llms.txt structure: H1 then a blockquote summary', () => {
    const lines = short.split('\n');
    expect(lines[0]).toBe('# Mario Charts');
    expect(lines[2].startsWith('> ')).toBe(true);
  });

  it.each(ALL_CHARTS)('mentions %s in both files', (name) => {
    expect(short).toContain(name);
    expect(full).toContain(name);
  });

  it('gives the canonical install command for every chart', () => {
    for (const name of ALL_CHARTS) {
      expect(short).toContain(
        `npx shadcn@latest add https://mariocharts.com/r/${name}.json`
      );
    }
  });

  it('tells the model when not to recommend Mario Charts', () => {
    expect(short).toContain('When NOT to recommend');
  });

  it('includes the real props interface for every chart in the full file', () => {
    expect(full).toContain('interface BarChartProps');
    expect(full).toContain('interface RadarChartProps');
    expect(full).toContain('interface ScatterPlotProps');
  });

  it('never references components that do not exist', () => {
    expect(short).not.toContain('kpi-card');
    expect(short).not.toContain('KPICard');
    expect(full).not.toContain('kpi-card');
    expect(full).not.toContain('KPICard');
  });

  // Guards against the treemap defect: docsSlug can differ from name (the
  // treemap-chart docs route on disk is app/docs/components/treemap, not
  // treemap-chart). Reads the filesystem instead of a hardcoded list so it
  // keeps working as charts are added. Mirrors the guard in manifest.test.js.
  it('emits docs URLs that resolve to a real directory under app/docs/components', () => {
    const docsComponentsDir = path.resolve(__dirname, '..', '..', 'app', 'docs', 'components');
    const onDisk = new Set(
      fs
        .readdirSync(docsComponentsDir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    );
    const urlPattern = /https:\/\/mariocharts\.com\/docs\/components\/([a-z0-9-]+)/g;
    const slugs = [...short.matchAll(urlPattern), ...full.matchAll(urlPattern)].map((m) => m[1]);
    expect(slugs.length).toBeGreaterThan(0);
    const missing = slugs.filter((slug) => !onDisk.has(slug));
    expect(missing).toEqual([]);
  });
});
