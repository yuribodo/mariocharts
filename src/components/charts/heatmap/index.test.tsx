import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { HeatmapChart } from './index';

const sampleData = [
  { day: 'Mon', hour: '9am', value: 10 },
  { day: 'Mon', hour: '10am', value: 25 },
  { day: 'Tue', hour: '9am', value: 15 },
  { day: 'Tue', hour: '10am', value: 30 },
];

const stockData = [
  { ticker: 'AAPL', change: 2.5, marketCap: 3000 },
  { ticker: 'GOOGL', change: -1.2, marketCap: 1800 },
  { ticker: 'MSFT', change: 0.8, marketCap: 2800 },
];

function renderWithDimensions(ui: React.ReactElement) {
  const originalGetBCR = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 800,
    height: 320,
    top: 0,
    left: 0,
    bottom: 320,
    right: 800,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));

  jest.useFakeTimers();
  const result = render(ui);
  act(() => {
    jest.runAllTimers();
  });
  jest.useRealTimers();
  Element.prototype.getBoundingClientRect = originalGetBCR;
  return result;
}

describe('HeatmapChart', () => {
  it('renders SVG with minimal props', () => {
    const { container } = renderWithDimensions(
      <HeatmapChart data={sampleData} x="hour" y="day" value="value" />
    );
    const svg = container.querySelector('svg[aria-label*="Heatmap chart"]');
    expect(svg).toBeInTheDocument();
  });

  it('renders grid cells', () => {
    const { container } = renderWithDimensions(
      <HeatmapChart data={sampleData} x="hour" y="day" value="value" />
    );
    const gridCells = container.querySelectorAll('[role="gridcell"]');
    expect(gridCells.length).toBeGreaterThan(0);
  });

  it('shows loading state', () => {
    render(
      <HeatmapChart data={sampleData} x="hour" y="day" value="value" loading />
    );
    const loadingEl = document.querySelector('.animate-pulse');
    expect(loadingEl).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(
      <HeatmapChart data={sampleData} x="hour" y="day" value="value" error="Something broke" />
    );
    expect(screen.getByText('Chart Error')).toBeInTheDocument();
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<HeatmapChart data={[]} x="hour" y="day" value="value" />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('renders with variant="grid" (default)', () => {
    const { container } = renderWithDimensions(
      <HeatmapChart data={sampleData} x="hour" y="day" value="value" variant="grid" />
    );
    const svg = container.querySelector('svg[aria-label*="Heatmap chart"]');
    expect(svg).toBeInTheDocument();
  });

  it('renders with variant="radial"', () => {
    const { container } = renderWithDimensions(
      <HeatmapChart data={sampleData} x="hour" y="day" value="value" variant="radial" />
    );
    const svg = container.querySelector('svg[aria-label="Radial heatmap chart"]');
    expect(svg).toBeInTheDocument();
  });

  it('renders with variant="stock"', () => {
    const { container } = renderWithDimensions(
      <HeatmapChart
        data={stockData}
        x="ticker"
        y="ticker"
        value="change"
        weight="marketCap"
        variant="stock"
      />
    );
    const svg = container.querySelector('svg[aria-label="Stock treemap heatmap"]');
    expect(svg).toBeInTheDocument();
  });

  it('renders labels when showLabels is true (default)', () => {
    const { container } = renderWithDimensions(
      <HeatmapChart data={sampleData} x="hour" y="day" value="value" />
    );
    const textElements = container.querySelectorAll('text');
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('has correct aria-label on SVG', () => {
    const { container } = renderWithDimensions(
      <HeatmapChart data={sampleData} x="hour" y="day" value="value" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label');
    expect(svg!.getAttribute('aria-label')).toContain('Heatmap chart');
  });

  it('renders with custom className', () => {
    const { container } = renderWithDimensions(
      <HeatmapChart data={sampleData} x="hour" y="day" value="value" className="my-custom-class" />
    );
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass('my-custom-class');
  });
});
