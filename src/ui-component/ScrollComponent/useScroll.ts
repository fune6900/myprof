import { useRef, useCallback } from 'react';
import type { RefObject } from 'react';

export const useScroll = (): [RefObject<HTMLDivElement | null>, () => void] => {
  const ref = useRef<HTMLDivElement | null>(null);

  const scrollToTop = useCallback(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return [ref, scrollToTop];
};
