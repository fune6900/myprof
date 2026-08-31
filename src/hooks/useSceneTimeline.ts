import { useEffect, useRef, type RefObject } from 'react';
import type { createTimeline } from 'animejs';
import { useScene } from './useScrollScene';

type Timeline = ReturnType<typeof createTimeline>;

/**
 * autoplay: false のタイムラインを組み、シーンの進行度で seek する。
 * これが「手動再生」の実体で、時間ではなくスクロール量が再生ヘッドを動かす。
 *
 * build は useCallback で包んで渡すこと。毎描画で新しい関数を渡すと
 * タイムラインを作り直してしまう。
 *
 * @param build ルート要素を受け取り、autoplay: false のタイムラインを返す
 * @returns 演出のルートに付ける ref
 */
export const useSceneTimeline = <T extends HTMLElement>(
  build: (root: T) => Timeline | null,
): RefObject<T | null> => {
  const root = useRef<T>(null);
  const scene = useScene();
  const { subscribe } = scene;

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const timeline = build(el);
    if (!timeline) return;

    const render = (progress: number) => {
      /*
       * duration 0 のタイムライン（対象が 1 つも無いなど）を seek すると
       * 0 除算で NaN が混ざるので触らない。
       */
      if (!timeline.duration) return;
      // muteCallbacks: 行ったり来たりで onComplete 系が何度も鳴るのを止める
      timeline.seek(progress * timeline.duration, true);
    };

    const unsubscribe = subscribe(render);

    return () => {
      unsubscribe();
      timeline.revert();
    };
  }, [build, subscribe]);

  return root;
};
