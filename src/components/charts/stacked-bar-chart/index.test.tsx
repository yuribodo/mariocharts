import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { StackedBarChart } from './index';

const sampleData = [
  { quarter: 'Q1', desktop: 100, mobile: 50, tablet: 30 },
  { quarter: 'Q2', desktop: 120, mobile: 60, tablet: 40 },
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
  act(() => { result = render(ui); });
  act(() => { jest.runAllTimers(); });
  return result!;
}

describe('StackedBarChart', () => {
  it('renders SVG with minimal props', () => {
    const { container } = renderAndFlush(
      <StackedBarChart data={sampleData} x="quarter" y={['desktop', 'mobile', 'tablet']} />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <StackedBarChart data={sampleData} x="quarter" y={['desktop', 'mobile', 'tablet']} loading={true} />
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows error state', () => {
    render(
      <StackedBarChart data={sampleData} x="quarter" y={['desktop', 'mobile', 'tablet']} error="Something went wrong" />
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows empty state when data={[]}', () => {
    render(
      <StackedBarChart data={[]} x="quarter" y={['desktop', 'mobile', 'tablet']} />
    );
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('renders with variant="outline"', () => {
    const { container } = renderAndFlush(
      <StackedBarChart data={sampleData} x="quarter" y={['desktop', 'mobile', 'tablet']} variant="outline" />
    );
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(0);
  });

  it('renders with orientation="horizontal"', () => {
    const { container } = renderAndFlush(
      <StackedBarChart data={sampleData} x="quarter" y={['desktop', 'mobile', 'tablet']} orientation="horizontal" />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('shows legend when showLegend={true}', () => {
    renderAndFlush(
      <StackedBarChart data={sampleData} x="quarter" y={['desktop', 'mobile', 'tablet']} showLegend={true} />
    );
    expect(screen.getByText('desktop')).toBeInTheDocument();
    expect(screen.getByText('mobile')).toBeInTheDocument();
    expect(screen.getByText('tablet')).toBeInTheDocument();
  });

  it('calls onSegmentClick', () => {
    const handleClick = jest.fn();
    const { container } = renderAndFlush(
      <StackedBarChart data={sampleData} x="quarter" y={['desktop', 'mobile', 'tablet']} onSegmentClick={handleClick} />
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
    fireEvent.click(rects[0]!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label on SVG', () => {
    const { container } = renderAndFlush(
      <StackedBarChart data={sampleData} x="quarter" y={['desktop', 'mobile', 'tablet']} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute('aria-label')).toBe('Stacked bar chart');
  });
});
