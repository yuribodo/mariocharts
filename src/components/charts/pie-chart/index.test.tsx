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

import { PieChart } from './index';

const sampleData = [
  { name: 'A', amount: 40 },
  { name: 'B', amount: 30 },
  { name: 'C', amount: 20 },
  { name: 'D', amount: 10 },
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

describe('PieChart', () => {
  it('renders SVG with minimal props', () => {
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders correct number of path elements (slices)', () => {
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" />
    );
    expect(container.querySelectorAll('path')).toHaveLength(sampleData.length);
  });

  it('shows loading state', () => {
    render(
      <PieChart data={sampleData} value="amount" label="name" loading={true} />
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows error state', () => {
    render(
      <PieChart data={sampleData} value="amount" label="name" error="Something went wrong" />
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows empty state when data={[]}', () => {
    render(<PieChart data={[]} value="amount" label="name" />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('shows error for negative values', () => {
    const negativeData = [
      { name: 'A', amount: 40 },
      { name: 'B', amount: -10 },
    ];
    render(<PieChart data={negativeData} value="amount" label="name" />);
    expect(screen.getByText('Pie charts cannot display negative values')).toBeInTheDocument();
  });

  it('calls onSliceClick when slice is clicked', () => {
    const handleClick = jest.fn();
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" onSliceClick={handleClick} />
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
    fireEvent.click(paths[0]!);
    expect(handleClick).toHaveBeenCalledWith(sampleData[0], 0);
  });

  it('renders with variant="pie"', () => {
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" variant="pie" />
    );
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('renders with variant="donut" (default)', () => {
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" variant="donut" />
    );
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('renders with variant="semi"', () => {
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" variant="semi" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute('aria-label')).toContain('Semi-circle');
  });

  it('has correct aria-label on SVG', () => {
    const { container } = renderAndFlush(
      <PieChart data={sampleData} value="amount" label="name" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute('aria-label')).toContain(`${sampleData.length} segments`);
  });
});
