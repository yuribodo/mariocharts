import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LineChart } from './index';

const sampleData = [
  { month: 'Jan', sales: 100, profit: 30 },
  { month: 'Feb', sales: 150, profit: 45 },
  { month: 'Mar', sales: 120, profit: 36 },
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

describe('LineChart', () => {
  it('renders SVG with minimal props', () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y="sales" />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('shows loading state when loading={true}', () => {
    const { container } = render(
      <LineChart data={sampleData} x="month" y="sales" loading={true} />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows error state with error message', () => {
    render(
      <LineChart data={sampleData} x="month" y="sales" error="Something went wrong" />
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows empty state when data={[]}', () => {
    render(<LineChart data={[]} x="month" y="sales" />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('renders with multi-series y={["sales", "profit"]}', () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y={['sales', 'profit']} />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(2);
  });

  it('renders dots when showDots={true} (default)', () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y="sales" />
    );
    const dots = container.querySelectorAll('[role="graphics-symbol"]');
    expect(dots.length).toBe(sampleData.length);
  });

  it('has correct aria-label on SVG', () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y="sales" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute('aria-label')).toContain('Line chart');
  });

  it('renders with custom className', () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y="sales" className="my-custom-class" />
    );
    expect(container.firstElementChild).toHaveClass('my-custom-class');
  });

  it('renders with showGrid={true}', () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y="sales" showGrid={true} />
    );
    const gridLines = Array.from(container.querySelectorAll('line')).filter(
      (l) => l.getAttribute('opacity') === '0.1'
    );
    expect(gridLines.length).toBeGreaterThan(0);
  });

  it('renders with showLegend={true} and multi-series', () => {
    renderAndFlush(
      <LineChart data={sampleData} x="month" y={['sales', 'profit']} showLegend={true} />
    );
    expect(screen.getByText('sales')).toBeInTheDocument();
    expect(screen.getByText('profit')).toBeInTheDocument();
  });

  it('renders with showArea={true}', () => {
    const { container } = renderAndFlush(
      <LineChart data={sampleData} x="month" y="sales" showArea={true} />
    );
    const areaPaths = Array.from(container.querySelectorAll('path')).filter((p) => {
      const fill = p.getAttribute('fill');
      return fill && fill.startsWith('url(#area-gradient-');
    });
    expect(areaPaths.length).toBeGreaterThanOrEqual(1);
  });
});
