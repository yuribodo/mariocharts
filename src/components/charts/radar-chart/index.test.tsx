import React from 'react';
import { render, screen, act } from '@testing-library/react';

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

import { RadarChart } from './index';

const axes = [
  { key: 'speed', label: 'Speed' },
  { key: 'power', label: 'Power' },
  { key: 'defense', label: 'Defense' },
];

const series = [
  { id: 'player1', name: 'Player 1', data: { speed: 80, power: 60, defense: 90 } },
];

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 800, height: 400, top: 0, left: 0, bottom: 400, right: 800, x: 0, y: 0, toJSON: () => {},
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

describe('RadarChart', () => {
  it('renders SVG with minimal props', () => {
    const { container } = renderAndFlush(<RadarChart axes={axes} series={series} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const { container } = renderAndFlush(<RadarChart axes={axes} series={series} loading={true} />);
    const pulsingElement = container.querySelector('.animate-pulse');
    expect(pulsingElement).toBeInTheDocument();
  });

  it('shows error state', () => {
    renderAndFlush(<RadarChart axes={axes} series={series} error="Network failure" />);
    expect(screen.getByText('Chart Error')).toBeInTheDocument();
    expect(screen.getByText('Network failure')).toBeInTheDocument();
  });

  it('shows empty state when series={[]}', () => {
    renderAndFlush(<RadarChart axes={axes} series={[]} />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('shows error when axes < 3', () => {
    renderAndFlush(
      <RadarChart
        axes={[{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }]}
        series={series}
      />
    );
    expect(screen.getByText(/at least 3 axes/i)).toBeInTheDocument();
  });

  it('renders axis labels when showAxisLabels={true} (default)', () => {
    renderAndFlush(<RadarChart axes={axes} series={series} />);
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('Power')).toBeInTheDocument();
    expect(screen.getByText('Defense')).toBeInTheDocument();
  });

  it('renders with gridType="circular" without error', () => {
    const { container } = renderAndFlush(
      <RadarChart axes={axes} series={series} gridType="circular" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with multiple series', () => {
    const multiSeries = [
      { id: 'player1', name: 'Player 1', data: { speed: 80, power: 60, defense: 90 } },
      { id: 'player2', name: 'Player 2', data: { speed: 70, power: 85, defense: 60 } },
    ];
    const { container } = renderAndFlush(<RadarChart axes={axes} series={multiSeries} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has correct aria-label on SVG', () => {
    const { container } = renderAndFlush(<RadarChart axes={axes} series={series} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label', 'Radar chart with 1 series and 3 axes');
  });

  it('renders legend when multiple series', () => {
    const multiSeries = [
      { id: 'player1', name: 'Player 1', data: { speed: 80, power: 60, defense: 90 } },
      { id: 'player2', name: 'Player 2', data: { speed: 70, power: 85, defense: 60 } },
    ];
    renderAndFlush(<RadarChart axes={axes} series={multiSeries} />);
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
  });
});
