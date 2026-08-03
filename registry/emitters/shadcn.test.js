const { buildAllItems } = require('../manifest');
const { emitShadcn, toShadcnItem, targetFor } = require('./shadcn');

const items = buildAllItems();
const byName = Object.fromEntries(items.map((i) => [i.name, i]));

describe('targetFor', () => {
  it('maps chart files under the components alias, preserving nesting', () => {
    expect(targetFor(byName['bar-chart'], 'bar-chart/index.tsx'))
      .toBe('@components/charts/bar-chart/index.tsx');
  });

  it('maps shared internals under the charts directory', () => {
    expect(targetFor(byName['chart-shared'], '_shared/chart-tooltip.tsx'))
      .toBe('@components/charts/_shared/chart-tooltip.tsx');
  });

  it('maps lib items under the lib alias', () => {
    expect(targetFor(byName['lib-utils'], 'utils.ts')).toBe('@lib/utils.ts');
    expect(targetFor(byName['lib-hooks'], 'hooks.ts')).toBe('@lib/hooks.ts');
  });
});

describe('toShadcnItem', () => {
  const barChart = toShadcnItem(byName['bar-chart']);

  it('declares the shadcn registry-item schema', () => {
    expect(barChart.$schema).toBe('https://ui.shadcn.com/schema/registry-item.json');
  });

  it('uses an allowed registry type', () => {
    const allowed = new Set(['registry:component', 'registry:lib']);
    for (const item of items) {
      expect(allowed.has(toShadcnItem(item).type)).toBe(true);
    }
  });

  it('carries every required field on every item', () => {
    for (const item of items) {
      const doc = toShadcnItem(item);
      expect(typeof doc.name).toBe('string');
      expect(doc.name.length).toBeGreaterThan(0);
      expect(typeof doc.title).toBe('string');
      expect(doc.title.length).toBeGreaterThan(0);
      expect(typeof doc.description).toBe('string');
      expect(doc.description.length).toBeGreaterThan(0);
      expect(doc.author).toBe('Yuri Bodo');
      expect(Array.isArray(doc.files)).toBe(true);
      expect(doc.files.length).toBeGreaterThan(0);
      for (const file of doc.files) {
        expect(typeof file.path).toBe('string');
        expect(typeof file.type).toBe('string');
        expect(typeof file.target).toBe('string');
        expect(file.content.length).toBeGreaterThan(0);
      }
    }
  });

  it('expresses registry dependencies as absolute URLs that this build emits', () => {
    const emitted = new Set(
      emitShadcn(items)
        .map((o) => o.path.split('/').pop())
        .filter((f) => f !== 'registry.json')
        .map((f) => `https://mariocharts.com/r/${f}`)
    );
    for (const item of items) {
      for (const url of toShadcnItem(item).registryDependencies ?? []) {
        expect(url.startsWith('https://mariocharts.com/r/')).toBe(true);
        expect(emitted.has(url)).toBe(true);
      }
    }
  });

  it('points charts at their docs page and omits docs for support items', () => {
    expect(barChart.docs).toBe('https://mariocharts.com/docs/components/bar-chart');
    expect(toShadcnItem(byName['lib-utils']).docs).toBeUndefined();
  });

  // treemap-chart's docs route on disk is app/docs/components/treemap (no
  // "-chart" suffix); the item name itself must stay treemap-chart.
  it('points treemap-chart at its docs slug, not its item name', () => {
    const treemap = toShadcnItem(byName['treemap-chart']);
    expect(treemap.name).toBe('treemap-chart');
    expect(treemap.docs).toBe('https://mariocharts.com/docs/components/treemap');
  });
});

describe('emitShadcn', () => {
  const outputs = emitShadcn(items);

  it('emits one file per item plus the index', () => {
    expect(outputs).toHaveLength(items.length + 1);
  });

  it('emits valid parseable JSON for every output', () => {
    for (const output of outputs) {
      expect(() => JSON.parse(output.content)).not.toThrow();
    }
  });

  it('lists only the 12 charts in the index, not the internals', () => {
    const index = JSON.parse(
      outputs.find((o) => o.path.endsWith('/registry.json')).content
    );
    expect(index.$schema).toBe('https://ui.shadcn.com/schema/registry.json');
    expect(index.name).toBe('mario-charts');
    expect(index.homepage).toBe('https://mariocharts.com');
    expect(index.items).toHaveLength(12);
    expect(index.items.map((i) => i.name)).not.toContain('chart-shared');
  });

  it('omits file content from the index to keep it small', () => {
    const index = JSON.parse(
      outputs.find((o) => o.path.endsWith('/registry.json')).content
    );
    for (const item of index.items) {
      for (const file of item.files) {
        expect(file.content).toBeUndefined();
        expect(typeof file.path).toBe('string');
      }
    }
  });

  it('rewrites relative imports to canonical @/ aliases in all items', () => {
    for (const output of outputs) {
      if (output.path.endsWith('/registry.json')) continue;
      const doc = JSON.parse(output.content);
      for (const file of doc.files) {
        expect(file.content).not.toMatch(/from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\//);
        expect(file.content).not.toMatch(/from\s+['"]\.\.\/\_shared/);
      }
    }
  });

  it('rewrites bar-chart imports to @/lib and @/components/charts/_shared', () => {
    const barDoc = JSON.parse(
      outputs.find((o) => o.path.endsWith('/bar-chart.json')).content
    );
    const content = barDoc.files[0].content;
    expect(content).toContain('from "@/lib/utils"');
    expect(content).toContain('from "@/components/charts/_shared"');
  });

  it('rewrites chart-shared imports to @/lib/hooks', () => {
    const sharedDoc = JSON.parse(
      outputs.find((o) => o.path.endsWith('/chart-shared.json')).content
    );
    const hooksFile = sharedDoc.files.find((f) => f.path === '_shared/hooks.ts');
    expect(hooksFile.content).toContain('from "@/lib/hooks"');
  });
});
