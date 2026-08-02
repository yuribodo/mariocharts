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
});

describe('readPropsInterface', () => {
  const { CHARTS } = require('./manifest');

  it.each(CHARTS.map((c) => [c.name, c]))(
    'extracts a props interface for %s from its declared source file',
    (_name, chart) => {
      const result = readPropsInterface(chart);
      expect(result.name).toMatch(/Props$/);
      expect(result.text.length).toBeGreaterThan(0);
    }
  );

});
