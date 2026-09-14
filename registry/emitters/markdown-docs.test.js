const fs = require('fs');
const path = require('path');
const { buildAllItems } = require('../manifest');
const { emitMarkdownDocs } = require('./markdown-docs');

const outputs = emitMarkdownDocs(buildAllItems());

describe('emitMarkdownDocs', () => {
  it('emits one markdown file per chart and none for internals', () => {
    expect(outputs).toHaveLength(12);
    const names = outputs.map((o) => path.basename(o.path));
    expect(names).toContain('bar-chart.md');
    expect(names).not.toContain('chart-shared.md');
  });

  it('writes into public/docs/components so Next serves them statically', () => {
    for (const output of outputs) {
      expect(output.path.replace(/\\/g, '/')).toContain('/public/docs/components/');
    }
  });

  it('leads with an H1 and the answer, before any prose', () => {
    const bar = outputs.find((o) => o.path.endsWith('bar-chart.md')).content;
    const lines = bar.split('\n');
    expect(lines[0]).toBe('# Bar Chart');
    expect(bar.indexOf('npx shadcn@latest add')).toBeLessThan(600);
  });

  it('includes the real props interface', () => {
    const bar = outputs.find((o) => o.path.endsWith('bar-chart.md')).content;
    expect(bar).toContain('interface BarChartProps');
  });

  it('links back to the markdown docs, HTML docs, and the registry item', () => {
    const bar = outputs.find((o) => o.path.endsWith('bar-chart.md')).content;
    expect(bar).toContain('https://mariocharts.com/docs/components/bar-chart.md');
    expect(bar).toContain('https://mariocharts.com/docs/components/bar-chart');
    expect(bar).toContain('https://mariocharts.com/r/bar-chart.json');
  });

  // Guards against the treemap defect: docsSlug can differ from name (the
  // treemap-chart docs route on disk is app/docs/components/treemap, not
  // treemap-chart). Filename and URL must both use docsSlug so append-.md works.
  it('names files and docs URLs with docsSlug, not chart name', () => {
    const names = outputs.map((o) => path.basename(o.path));
    expect(names).toContain('treemap.md');
    expect(names).not.toContain('treemap-chart.md');

    const docsComponentsDir = path.resolve(__dirname, '..', '..', 'app', 'docs', 'components');
    const onDisk = new Set(
      fs
        .readdirSync(docsComponentsDir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    );
    const urlPattern = /https:\/\/mariocharts\.com\/docs\/components\/([a-z0-9-]+)/g;
    const slugs = outputs.flatMap((o) => [...o.content.matchAll(urlPattern)].map((m) => m[1]));
    expect(slugs.length).toBeGreaterThan(0);
    const missing = slugs.filter((slug) => !onDisk.has(slug));
    expect(missing).toEqual([]);

    for (const output of outputs) {
      const slug = path.basename(output.path, '.md');
      expect(onDisk.has(slug)).toBe(true);
    }
  });
});
