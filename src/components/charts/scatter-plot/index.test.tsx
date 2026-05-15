import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ScatterPlot } from './index';

const sampleData = [
  { height: 170, weight: 70 },
  { height: 180, weight: 80 },
  { height: 160, weight: 55 },
];

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 800, height: 300, top: 0, left: 0, bottom: 300, right: 800, x: 0, y: 0, toJSON: () => {},
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function renderAndFlush(ui: React.ReactElement) {
  let result: ReturnType<typeof render>;
  act(() => {
    result = render(ui);
  });
  act(() => {
    jest.runAllTimers();
  });
  return result!;
}

describe('ScatterPlot', () => {
  it('renders SVG with minimal props', () => {
    const { container } = renderAndFlush(
      <ScatterPlot data={sampleData} x="height" y="weight" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders correct number of circle elements (points)', () => {
    const { container } = renderAndFlush(
      <ScatterPlot data={sampleData} x="height" y="weight" />
    );
    const circles = container.querySelectorAll('circle[role="button"]');
    expect(circles).toHaveLength(3);
  });

  it('shows loading state', () => {
    const { container } = renderAndFlush(
      <ScatterPlot data={sampleData} x="height" y="weight" loading={true} />
    );
    const pulsingElement = container.querySelector('.animate-pulse');
    expect(pulsingElement).toBeInTheDocument();
  });

  it('shows error state', () => {
    renderAndFlush(
      <ScatterPlot data={sampleData} x="height" y="weight" error="Data fetch failed" />
    );
    expect(screen.getByText('Chart Error')).toBeInTheDocument();
    expect(screen.getByText('Data fetch failed')).toBeInTheDocument();
  });

  it('shows empty state when data={[]}', () => {
    renderAndFlush(<ScatterPlot data={[]} x="height" y="weight" />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('calls onPointClick when point is clicked', () => {
    const handleClick = jest.fn();
    const { container } = renderAndFlush(
      <ScatterPlot data={sampleData} x="height" y="weight" onPointClick={handleClick} />
    );
    const pointButtons = container.querySelectorAll('circle[role="button"]');
    expect(pointButtons).toHaveLength(3);
    fireEvent.click(pointButtons[0]!);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({ height: 170, weight: 70 }),
      0,
      'default'
    );
  });

  it('renders with showTrendLine={true}', () => {
    const { container } = renderAndFlush(
      <ScatterPlot data={sampleData} x="height" y="weight" showTrendLine={true} />
    );
    const dashedLines = container.querySelectorAll('line[stroke-dasharray="6 4"]');
    expect(dashedLines.length).toBeGreaterThanOrEqual(1);
  });

  it('renders with showGrid={true}', () => {
    const { container } = renderAndFlush(
      <ScatterPlot data={sampleData} x="height" y="weight" showGrid={true} />
    );
    const gridLines = container.querySelectorAll('line[opacity="0.1"]');
    expect(gridLines.length).toBeGreaterThan(0);
  });

  it('renders with custom className', () => {
    const { container } = renderAndFlush(
      <ScatterPlot data={sampleData} x="height" y="weight" className="chart-scatter" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('chart-scatter');
  });

  it('has aria-labels on points', () => {
    const { container } = renderAndFlush(
      <ScatterPlot data={sampleData} x="height" y="weight" />
    );
    const pointButtons = container.querySelectorAll('circle[role="button"]');
    expect(pointButtons).toHaveLength(3);
    const firstLabel = pointButtons[0]!.getAttribute('aria-label') ?? '';
    expect(firstLabel).toContain('X');
    expect(firstLabel).toContain('Y');
  });
});
