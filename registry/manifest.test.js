const path = require('path');
const fs = require('fs');
const { CHARTS, buildAllItems } = require('./manifest');

describe('registry manifest', () => {
  it('declares all 12 shipped charts', () => {
    expect(CHARTS.map((c) => c.name).sort()).toEqual([
      'area-chart',
      'bar-chart',
      'funnel-chart',
      'gauge-chart',
      'heatmap',
      'line-chart',
      'pie-chart',
      'radar-chart',
      'scatter-plot',
      'stacked-bar-chart',
      'treemap-chart',
      'waterfall-chart',
    ]);
  });

  it('declares a chart for every directory under src/components/charts', () => {
    const chartsDir = path.resolve(__dirname, '..', 'src', 'components', 'charts');
    const onDisk = fs
      .readdirSync(chartsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
      .map((e) => e.name)
      .sort();
    expect(CHARTS.map((c) => c.name).sort()).toEqual(onDisk);
  });

  it('builds 15 items: 12 charts plus 3 support items', () => {
    const items = buildAllItems();
    expect(items).toHaveLength(15);
    expect(items.filter((i) => i.kind === 'chart')).toHaveLength(12);
    expect(items.map((i) => i.name)).toEqual(
      expect.arrayContaining(['lib-utils', 'lib-hooks', 'chart-shared'])
    );
  });

  it('embeds non-empty content for every declared file', () => {
    for (const item of buildAllItems()) {
      expect(item.files.length).toBeGreaterThan(0);
      for (const file of item.files) {
        expect(typeof file.content).toBe('string');
        expect(file.content.length).toBeGreaterThan(0);
      }
    }
  });

  it('resolves every registryDependency to another item in the manifest', () => {
    const items = buildAllItems();
    const names = new Set(items.map((i) => i.name));
    for (const item of items) {
      for (const dep of item.registryDependencies) {
        expect(names.has(dep)).toBe(true);
      }
    }
  });
});

const { emitSiteData } = require('./emitters/site-data');

describe('site data emitter', () => {
  it('emits one typed entry per chart', () => {
    const [output] = emitSiteData(buildAllItems());
    expect(output.path.endsWith('registry/generated/charts.ts')).toBe(true);
    const names = [...output.content.matchAll(/name: "([^"]+)"/g)].map((m) => m[1]);
    expect(names).toHaveLength(12);
    expect(names).toContain('waterfall-chart');
    expect(names).not.toContain('chart-shared');
  });

  it('marks the file as generated so nobody hand-edits it', () => {
    const [output] = emitSiteData(buildAllItems());
    expect(output.content).toContain('AUTO-GENERATED');
  });

  it('emits docs paths and registry URLs that agree with each other', () => {
    const [output] = emitSiteData(buildAllItems());
    expect(output.content).toContain('docsPath: "/docs/components/bar-chart"');
    expect(output.content).toContain(
      'registryUrl: "https://mariocharts.com/r/bar-chart.json"'
    );
  });
});
