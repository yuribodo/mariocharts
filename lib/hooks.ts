import { useEffect, useLayoutEffect } from 'react';

/**
 * Isomorphic useLayoutEffect that falls back to useEffect on the server.
 * Use for DOM measurements that may run during SSR.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
