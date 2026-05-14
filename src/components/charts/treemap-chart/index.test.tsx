import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

jest.mock('framer-motion', () => {
  const React = require('react');
  const ce = React.createElement;
  return {
    motion: {
      div: ({ children, ...props }: any) => ce('div', props, children),
      path: (props: any) => ce('path', props),
      rect: (props: any) => ce('rect', props),
      circle: (props: any) => ce('circle', props),
      g: ({ children, ...props }: any) => ce('g', props, children),
      svg: ({ children, ...props }: any) => ce('svg', props, children),
      polygon: (props: any) => ce('polygon', props),
      line: (props: any) => ce('line', props),
      text: ({ children, ...props }: any) => ce('text', props, children),
      button: ({ children, ...props }: any) => ce('button', props, children),
    },
    AnimatePresence: ({ children }: any) => ce(React.Fragment, null, children),
    useReducedMotion: () => false,
  };
});

import { TreeMapChart } from './index';

const sampleData = [
  { name: 'Group A', value: 100 },
  { name: 'Group B', value: 80 },
  {
    name: 'Group C',
    children: [
      { name: 'C1', value: 30 },
      { name: 'C2', value: 20 },
    ],
  },
];

function renderWithDimensions(ui: React.ReactElement) {
  const originalGetBCR = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 800,
    height: 400,
    top: 0,
    left: 0,
    bottom: 400,
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

describe('TreeMapChart', () => {
  it('renders SVG with minimal props', () => {
    const { container } = renderWithDimensions(
      <TreeMapChart data={sampleData} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders rect elements for leaf nodes', () => {
    const { container } = renderWithDimensions(
      <TreeMapChart data={sampleData} />
    );
    const rects = container.querySelectorAll('[role="graphics-symbol"]');
    expect(rects.length).toBeGreaterThan(0);
  });

  it('shows loading state', () => {
    render(<TreeMapChart data={sampleData} loading />);
    const loadingEl = document.querySelector('.animate-pulse');
    expect(loadingEl).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<TreeMapChart data={sampleData} error="Failed to load" />);
    expect(screen.getByText('Chart Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<TreeMapChart data={[]} />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('shows empty state when all values are 0', () => {
    render(<TreeMapChart data={[{ name: 'A', value: 0 }]} />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('calls onClick when rect is clicked', () => {
    const handleClick = jest.fn();
    const { container } = renderWithDimensions(
      <TreeMapChart data={sampleData} onClick={handleClick} />
    );
    const rects = container.querySelectorAll('[role="graphics-symbol"]');
    expect(rects.length).toBeGreaterThan(0);
    fireEvent.click(rects[0]!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label on SVG', () => {
    const { container } = renderWithDimensions(
      <TreeMapChart data={sampleData} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label');
    const label = svg!.getAttribute('aria-label')!;
    expect(label).toMatch(/^Treemap chart with \d+ segments$/);
  });

  it('renders with custom className', () => {
    const { container } = renderWithDimensions(
      <TreeMapChart data={sampleData} className="custom-treemap" />
    );
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass('custom-treemap');
  });

  it('renders labels inside rectangles', () => {
    const { container } = renderWithDimensions(
      <TreeMapChart data={sampleData} />
    );
    const textElements = container.querySelectorAll('text');
    const textContents = Array.from(textElements).map(el => el.textContent);
    expect(textContents).toEqual(
      expect.arrayContaining([expect.stringContaining('Group A')])
    );
  });
});
