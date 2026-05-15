import '@testing-library/jest-dom';
const React = require('react');

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as any;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.requestAnimationFrame = (cb) => setTimeout(cb, 0) as unknown as number;
global.cancelAnimationFrame = (id) => clearTimeout(id);

jest.mock('framer-motion', () => {
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
