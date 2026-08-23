import { useRef, useCallback } from 'react';
import type { RefObject } from 'react';

export const useScroll = (): [RefObject<HTMLDivElement | null>, () => void] => {
  const ref = useRef<HTMLDivElement | null>(null);

  const scrollToTop = useCallback(() => {
    // 明示的な 'smooth' は CSS の scroll-behavior を上書きしてしまうため、
    // reduced-motion 設定をここでも見る
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    ref.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, []);

  return [ref, scrollToTop];
};
