const { extractPropsInterface, readPropsInterface } = require('./extract-props');

describe('extractPropsInterface', () => {
  it('extracts a non-exported generic interface', () => {
    const src = [
      'import React from "react";',
      'interface BarChartProps<T extends ChartDataItem> {',
      '  data: T[];',
      '  height?: number;',
      '}',
      'export const BarChart = () => null;',
    ].join('\n');
    const result = extractPropsInterface(src);
    expect(result.name).toBe('BarChartProps');
    expect(result.text).toContain('data: T[];');
    expect(result.text.trimEnd().endsWith('}')).toBe(true);
    expect(result.text).not.toContain('export const BarChart');
  });

  it('handles nested object braces without truncating', () => {
    const src = [
      'interface GaugeChartProps {',
      '  zones?: { from: number; to: number }[];',
      '  legend?: {',
      '    position: "top" | "bottom";',
      '  };',
      '}',
      'const x = 1;',
    ].join('\n');
    const result = extractPropsInterface(src);
    expect(result.text).toContain('position: "top" | "bottom";');
    expect(result.text.trimEnd().endsWith('}')).toBe(true);
    expect(result.text).not.toContain('const x = 1');
  });

  it('extracts an exported interface too', () => {
    const src = 'export interface TreeMapChartProps {\n  data: Node[];\n}\n';
    expect(extractPropsInterface(src).name).toBe('TreeMapChartProps');
  });

  it('returns null when there is no Props interface', () => {
    expect(extractPropsInterface('const a = 1;\n')).toBeNull();
  });

  // The positional "first interface ending in Props" strategy publishes the
  // wrong interface here, and an assertion on /Props$/ still passes — which is
  // why the lookup is by name.
  it('picks the named interface, not the first one that ends in Props', () => {
    const src = [
      'interface TooltipRendererProps {',
      '  label: string;',
      '}',
      'interface BarChartProps<T> {',
      '  data: T[];',
      '}',
    ].join('\n');
    const result = extractPropsInterface(src, 'BarChartProps');
    expect(result.name).toBe('BarChartProps');
    expect(result.text).toContain('data: T[];');
    expect(result.text).not.toContain('label: string;');
  });

  it('returns null when the named interface is absent despite other Props types', () => {
    const src = 'interface TooltipRendererProps {\n  label: string;\n}\n';
    expect(extractPropsInterface(src, 'BarChartProps')).toBeNull();
  });
});

describe('readPropsInterface', () => {
  const { CHARTS } = require('./manifest');

  it.each(CHARTS.map((c) => [c.name, c]))(
    'extracts a props interface for %s from its declared source file',
    (_name, chart) => {
      const result = readPropsInterface(chart);
      // Not /Props$/ — that passes for the wrong interface too.
      expect(result.name).toBe(`${chart.exportName}Props`);
      expect(result.text.length).toBeGreaterThan(0);
    }
  );

  it('names the interface it looked for when the lookup fails', () => {
    expect(() =>
      readPropsInterface({
        name: 'bar-chart',
        exportName: 'NotARealComponent',
        propsSourceFile: 'index.tsx',
      })
    ).toThrow('interface NotARealComponentProps');
  });
});
