const { emitSiteMarkdown } = require('./site-markdown');

function publicTail(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  const idx = normalized.lastIndexOf('/public/');
  return idx === -1 ? normalized : normalized.slice(idx + '/public/'.length);
}

describe('emitSiteMarkdown', () => {
  it('copies every content/agent-md file into public/ with the same relative path', () => {
    const outputs = emitSiteMarkdown();
    expect(outputs.length).toBeGreaterThanOrEqual(7);

    const tails = new Set(outputs.map((o) => publicTail(o.path)));
    expect(tails.has('index.md')).toBe(true);
    expect(tails.has('docs.md')).toBe(true);
    expect(tails.has('docs/installation.md')).toBe(true);
    expect(tails.has('docs/components.md')).toBe(true);
    expect(tails.has('examples.md')).toBe(true);
    expect(tails.has('examples/dashboards/sales.md')).toBe(true);
    expect(tails.has('examples/dashboards/analytics.md')).toBe(true);
  });

  it('preserves markdown content from the source files', () => {
    const outputs = emitSiteMarkdown();
    const home = outputs.find((o) => publicTail(o.path) === 'index.md');
    expect(home.content).toContain('# Mario Charts');
    expect(home.content).toContain('Accept: text/markdown');
  });
});
