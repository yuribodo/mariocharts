import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { GaugeChart } from './index';

const zones = [
  { from: 0, to: 60, color: '#22c55e' },
  { from: 60, to: 80, color: '#f59e0b' },
  { from: 80, to: 100, color: '#ef4444' },
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

describe('GaugeChart', () => {
  it('renders SVG with minimal props', () => {
    const { container } = renderAndFlush(<GaugeChart value={65} zones={zones} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows loading state when loading={true}', () => {
    const { container } = renderAndFlush(<GaugeChart value={65} zones={zones} loading={true} />);
    const pulsingElement = container.querySelector('.animate-pulse');
    expect(pulsingElement).toBeInTheDocument();
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('shows error state with error message', () => {
    renderAndFlush(<GaugeChart value={65} zones={zones} error="Something went wrong" />);
    expect(screen.getByText('Chart Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows empty state when zones={[]}', () => {
    renderAndFlush(<GaugeChart value={65} zones={[]} />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('Configure zones to display the gauge')).toBeInTheDocument();
  });

  it('displays the value text', () => {
    const { container } = renderAndFlush(<GaugeChart value={65} zones={zones} />);
    expect(container.textContent).toContain('65');
  });

  it('displays unit when provided', () => {
    const { container } = renderAndFlush(<GaugeChart value={65} zones={zones} unit="%" />);
    expect(container.textContent).toContain('%');
  });

  it('displays label when provided', () => {
    renderAndFlush(<GaugeChart value={65} zones={zones} label="Performance" />);
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('has correct aria-label on SVG', () => {
    const { container } = renderAndFlush(<GaugeChart value={65} zones={zones} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label');
    expect(svg!.getAttribute('aria-label')).toContain('Gauge showing 65');
  });

  it('clamps value to min/max range', () => {
    const { container } = renderAndFlush(<GaugeChart value={150} zones={zones} min={0} max={100} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute('aria-label')).toContain('Gauge showing 100');
    expect(container.textContent).toContain('100');
  });

  it('renders with custom className', () => {
    const { container } = renderAndFlush(
      <GaugeChart value={65} zones={zones} className="my-custom-class" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('my-custom-class');
  });
});
