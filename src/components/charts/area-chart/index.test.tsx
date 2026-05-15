import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    path: (props: any) => <path {...props} />,
    circle: (props: any) => <circle {...props} />,
    rect: (props: any) => <rect {...props} />,
    g: ({ children, ...props }: any) => <g {...props}>{children}</g>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
    line: (props: any) => <line {...props} />,
    text: ({ children, ...props }: any) => <text {...props}>{children}</text>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

import { AreaChart } from './index';

const sampleData = [
  { month: 'Jan', revenue: 100, costs: 60 },
  { month: 'Feb', revenue: 150, costs: 80 },
  { month: 'Mar', revenue: 120, costs: 70 },
  { month: 'Apr', revenue: 180, costs: 90 },
];

beforeEach(() => {
  jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 800, height: 300, top: 0, left: 0, bottom: 300, right: 800, x: 0, y: 0, toJSON: () => {},
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AreaChart', () => {
  describe('Rendering', () => {
    it('renders with minimal props', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label', 'Area chart with 1 series and 4 data points');
    });

    it('renders multiple series', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y={['revenue', 'costs']} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-label', 'Area chart with 2 series and 4 data points');
    });

    it('applies custom height', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" height={500} />
      );
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.style.height).toBe('500px');
    });

    it('applies custom className', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" className="my-chart" />
      );
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.classList.contains('my-chart')).toBe(true);
    });
  });

  describe('Area Fill', () => {
    it('renders area fill by default', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" />
      );
      const paths = container.querySelectorAll('path');
      const areaPaths = Array.from(paths).filter(p => {
        const fill = p.getAttribute('fill');
        return fill && fill !== 'none' && fill !== 'transparent';
      });
      expect(areaPaths.length).toBeGreaterThan(0);
    });

    it('uses gradient fill by default', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" />
      );
      const gradients = container.querySelectorAll('linearGradient');
      expect(gradients.length).toBeGreaterThan(0);

      const areaPaths = Array.from(container.querySelectorAll('path')).filter(p => {
        const fill = p.getAttribute('fill');
        return fill && fill.startsWith('url(#area-grad-');
      });
      expect(areaPaths.length).toBeGreaterThan(0);
    });

    it('uses solid fill when gradient=false', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" gradient={false} />
      );
      const areaPaths = Array.from(container.querySelectorAll('path')).filter(p => {
        const fill = p.getAttribute('fill');
        return fill && fill !== 'none' && !fill.startsWith('url(');
      });
      expect(areaPaths.length).toBeGreaterThan(0);
    });

    it('respects areaOpacity prop', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" areaOpacity={0.6} />
      );
      const stops = container.querySelectorAll('stop');
      const firstStop = stops[0];
      expect(firstStop).toHaveAttribute('stop-opacity', '0.6');
    });
  });

  describe('Stacked', () => {
    it('renders stacked areas', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y={['revenue', 'costs']} stacked />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-label', 'Area chart with 2 series and 4 data points');
    });

    it('stacked series render correct number of area paths', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y={['revenue', 'costs']} stacked />
      );
      const paths = container.querySelectorAll('path');
      const areaPaths = Array.from(paths).filter(p => {
        const d = p.getAttribute('d');
        const fill = p.getAttribute('fill');
        return d && d.includes('Z') && fill && fill !== 'none';
      });
      expect(areaPaths.length).toBe(2);
    });
  });

  describe('States', () => {
    it('shows loading state', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" loading />
      );
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(container.querySelector('svg[role="img"]')).not.toBeInTheDocument();
    });

    it('shows error state', () => {
      render(
        <AreaChart data={sampleData} x="month" y="revenue" error="Something went wrong" />
      );
      expect(screen.getByText('Chart Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('shows empty state', () => {
      render(
        <AreaChart data={[]} x="month" y="revenue" />
      );
      expect(screen.getByText('No Data')).toBeInTheDocument();
    });
  });

  describe('Interactive', () => {
    it('does not render dots by default', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" />
      );
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(0);
    });

    it('renders dots when showDots is true', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" showDots />
      );
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(4);
    });

    it('renders grid when showGrid is true', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" showGrid />
      );
      const gridLines = container.querySelectorAll('line[stroke-dasharray]');
      expect(gridLines.length).toBeGreaterThan(0);
    });

    it('renders legend when showLegend is true with multiple series', () => {
      render(
        <AreaChart data={sampleData} x="month" y={['revenue', 'costs']} showLegend />
      );
      expect(screen.getByText('revenue')).toBeInTheDocument();
      expect(screen.getByText('costs')).toBeInTheDocument();
    });

    it('calls onPointClick', () => {
      const onClick = jest.fn();
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" onPointClick={onClick} />
      );
      const hitAreas = container.querySelectorAll('rect[fill="transparent"]');
      expect(hitAreas.length).toBe(4);
      fireEvent.click(hitAreas[0]!);
      expect(onClick).toHaveBeenCalledWith(sampleData[0], 0, 'revenue');
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label on SVG', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y={['revenue', 'costs']} />
      );
      const svg = container.querySelector('svg[role="img"]');
      expect(svg).toHaveAttribute('aria-label', 'Area chart with 2 series and 4 data points');
    });

    it('dots have tabIndex and aria-label when shown', () => {
      const { container } = render(
        <AreaChart data={sampleData} x="month" y="revenue" showDots />
      );
      const dots = container.querySelectorAll('circle[role="graphics-symbol"]');
      expect(dots.length).toBe(4);
      dots.forEach(dot => {
        expect(dot).toHaveAttribute('tabindex', '0');
        expect(dot).toHaveAttribute('aria-label');
      });
    });
  });
});
