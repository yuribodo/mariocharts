import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    path: (props: any) => React.createElement('path', props),
    rect: (props: any) => React.createElement('rect', props),
    circle: (props: any) => React.createElement('circle', props),
    g: ({ children, ...props }: any) => React.createElement('g', props, children),
    svg: ({ children, ...props }: any) => React.createElement('svg', props, children),
    polygon: (props: any) => React.createElement('polygon', props),
    line: (props: any) => React.createElement('line', props),
    text: ({ children, ...props }: any) => React.createElement('text', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  useReducedMotion: () => false,
}));

import { BarChart } from './index';

const sampleData = [
  { category: 'A', value: 10 },
  { category: 'B', value: 25 },
  { category: 'C', value: 15 },
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

describe('BarChart', () => {
  it('renders SVG with minimal props', () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders correct number of rect elements (bars)', () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" />
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThanOrEqual(sampleData.length);
  });

  it('shows loading state when loading={true}', () => {
    const { container } = render(
      <BarChart data={sampleData} x="category" y="value" loading={true} />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows error state with error message', () => {
    render(
      <BarChart data={sampleData} x="category" y="value" error="Something went wrong" />
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows empty state when data={[]}', () => {
    render(<BarChart data={[]} x="category" y="value" />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('calls onBarClick when bar is clicked', () => {
    const handleClick = jest.fn();
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" onBarClick={handleClick} />
    );
    const rects = container.querySelectorAll('rect');
    const clickableRect = Array.from(rects).find(
      (r) => Number(r.getAttribute('height')) > 0
    );
    expect(clickableRect).toBeDefined();
    fireEvent.click(clickableRect!);
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders with variant="outline"', () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" variant="outline" />
    );
    const rects = container.querySelectorAll('rect');
    const outlineBar = Array.from(rects).find(
      (r) => r.getAttribute('fill') === 'none' && r.getAttribute('stroke')
    );
    expect(outlineBar).toBeDefined();
  });

  it('renders with orientation="horizontal"', () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" orientation="horizontal" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute('aria-label')).toContain('horizontal');
  });

  it('has correct aria-label on SVG', () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute('aria-label')).toContain('Bar chart');
  });

  it('renders with custom className', () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" className="my-custom-class" />
    );
    expect(container.firstElementChild).toHaveClass('my-custom-class');
  });

  it('renders with showGrid={true}', () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" showGrid={true} />
    );
    const gridLines = Array.from(container.querySelectorAll('line')).filter(
      (l) => l.getAttribute('opacity') === '0.1'
    );
    expect(gridLines.length).toBeGreaterThan(0);
  });

  it('renders with showValues={true}', () => {
    const { container } = renderAndFlush(
      <BarChart data={sampleData} x="category" y="value" showValues={true} />
    );
    const valueTexts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(valueTexts.some((t) => t === '10' || t === '25' || t === '15')).toBe(true);
  });
});
