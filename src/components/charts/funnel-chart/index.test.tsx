import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FunnelChart } from './index';

jest.mock('../_shared/ChartTooltip', () => ({
  ChartTooltip: ({ children, visible }: any) => {
    const React = require('react');
    return visible ? React.createElement('div', { 'data-testid': 'chart-tooltip' }, children) : null;
  },
}));

const sampleData = [
  { stage: 'Visitors', count: 1000 },
  { stage: 'Signups', count: 400 },
  { stage: 'Trials', count: 200 },
  { stage: 'Customers', count: 80 },
];

let resizeCallback: (() => void) | null = null;
const originalRAF = global.requestAnimationFrame;

beforeEach(() => {
  resizeCallback = null;

  // Make requestAnimationFrame synchronous so useContainerDimensions
  // sets the width immediately during useLayoutEffect.
  global.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  }) as typeof global.requestAnimationFrame;

  jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 800,
    height: 400,
    top: 0,
    left: 0,
    bottom: 400,
    right: 800,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

  (global as any).ResizeObserver = class {
    constructor(cb: () => void) {
      resizeCallback = cb;
    }
    observe() {
      if (resizeCallback) resizeCallback();
    }
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  global.requestAnimationFrame = originalRAF;
  jest.restoreAllMocks();
});

describe('FunnelChart', () => {
  it('renders SVG with minimal props', () => {
    const { container } = render(
      <FunnelChart data={sampleData} label="stage" value="count" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <FunnelChart data={sampleData} label="stage" value="count" loading={true} />
    );
    const svg = screen.queryByRole('img');
    expect(svg).not.toBeInTheDocument();
  });

  it('shows error state', () => {
    render(
      <FunnelChart data={sampleData} label="stage" value="count" error="Something went wrong" />
    );
    expect(screen.getByText('Chart Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows empty state when data={[]}', () => {
    render(
      <FunnelChart data={[]} label="stage" value="count" />
    );
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText("There's no data to display")).toBeInTheDocument();
  });

  it('renders with variant="tapered" (default) — check aria-label "Funnel chart"', () => {
    render(
      <FunnelChart data={sampleData} label="stage" value="count" variant="tapered" />
    );
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Funnel chart')
    );
  });

  it('renders with variant="straight"', () => {
    const { container } = render(
      <FunnelChart data={sampleData} label="stage" value="count" variant="straight" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const polygons = container.querySelectorAll('polygon');
    expect(polygons.length).toBeGreaterThan(0);
  });

  it('renders with variant="horizontal" — check aria-label "Horizontal funnel"', () => {
    render(
      <FunnelChart data={sampleData} label="stage" value="count" variant="horizontal" />
    );
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Horizontal funnel')
    );
  });

  it('calls onClick when stage is clicked', () => {
    const handleClick = jest.fn();
    const { container } = render(
      <FunnelChart data={sampleData} label="stage" value="count" onClick={handleClick} />
    );
    // Stage bars have role="graphics-symbol"; connectors do not
    const stageBars = container.querySelectorAll('polygon[role="graphics-symbol"]');
    expect(stageBars.length).toBeGreaterThan(0);
    fireEvent.click(stageBars[0]!);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(sampleData[0], 0);
  });

  it('has correct aria-label on SVG', () => {
    render(
      <FunnelChart data={sampleData} label="stage" value="count" />
    );
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute(
      'aria-label',
      expect.stringContaining(`${sampleData.length} stages`)
    );
  });
});
