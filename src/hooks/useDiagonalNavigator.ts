import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** ホイールでセクション 1 つ分を進めるのに必要な deltaY の量 */
const WHEEL_UNIT = 900;
/** タッチでセクション 1 つ分を進めるのに必要なドラッグ量 (px) */
const TOUCH_UNIT = 420;
/** 入力が途切れてからスナップを開始するまでの時間 (ms) */
const SNAP_IDLE_MS = 140;
/** 1 フレームあたり target へ詰める割合 */
const EASE_FACTOR = 0.12;
/** これ以下の差は収束とみなす */
const SETTLE_EPSILON = 0.0005;

/**
 * 斜め展開ナビゲーションの中核。
 *
 * progress は「0 から count-1 までの小数」で、1.4 ならセクション 1 と 2 の
 * あいだの 40% 地点を意味する。毎フレーム変化するので React state には置かず、
 * ref + 購読で配る。整数の activeIndex だけが state（inert と現在地表示に使う）。
 */
export type DiagonalNavigator = {
  /** 現在アクティブなセクション。再描画を伴う */
  activeIndex: number;
  /** 指定セクションへ移動する */
  goTo: (index: number) => void;
  /** progress の変化を購読する。返り値で解除 */
  subscribe: (listener: (progress: number) => void) => () => void;
  /** 現在の progress を同期的に読む */
  getProgress: () => number;
  /** ユーザーがアニメーション減少を希望しているか */
  prefersReducedMotion: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * まだその方向へ動かせるスクロール領域を祖先から探す。
 * 見つかった場合はハイジャックせず、そちらに委ねる。
 *
 * @param deltaY 正なら下方向（コンテンツを先へ送る）
 */
const scrollableAncestor = (
  node: EventTarget | null,
  deltaY: number,
): HTMLElement | null => {
  let el = node instanceof HTMLElement ? node : null;

  while (el) {
    if (el.dataset.scrollable !== undefined) {
      // overflow が visible のままだと scrollTop は常に 0 で動かせない。
      // 実際にスクロールできる指定かどうかを見てから判断する
      const overflowY = getComputedStyle(el).overflowY;
      const canScroll = overflowY === 'auto' || overflowY === 'scroll';
      const max = el.scrollHeight - el.clientHeight;

      if (canScroll && max > 1) {
        const top = el.scrollTop;
        if (deltaY > 0 && top < max - 1) return el;
        if (deltaY < 0 && top > 1) return el;
      }
    }
    el = el.parentElement;
  }

  return null;
};

/** location.hash からセクション index を引く。該当しなければ null */
const indexFromHash = (ids: readonly string[]): number | null => {
  const id = window.location.hash.replace(/^#/, '');
  if (!id) return null;
  const index = ids.indexOf(id);
  return index === -1 ? null : index;
};

export const useDiagonalNavigator = (
  ids: readonly string[],
): DiagonalNavigator => {
  const count = ids.length;

  /** 起動時の URL が指すセクション。effect より前に確定させる */
  const initialIndex = useRef<number | null>(null);
  if (initialIndex.current === null) {
    initialIndex.current = indexFromHash(ids) ?? 0;
  }
  const start = initialIndex.current;

  const [activeIndex, setActiveIndex] = useState(start);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  /** 表示されている progress */
  const progressRef = useRef(start);
  /** progress が向かう先 */
  const targetRef = useRef(start);
  /** 直近で落ち着いたセクション。ここから ±1 までしか動かさない */
  const anchorRef = useRef(start);
  const listenersRef = useRef(new Set<(progress: number) => void>());
  const frameRef = useRef<number | null>(null);
  const snapTimerRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const publish = useCallback(() => {
    for (const listener of listenersRef.current) {
      listener(progressRef.current);
    }
  }, []);

  /** rAF ループ。収束したら自分で止まる */
  const runLoop = useCallback(() => {
    if (frameRef.current !== null) return;

    const tick = () => {
      const diff = targetRef.current - progressRef.current;

      if (Math.abs(diff) < SETTLE_EPSILON) {
        progressRef.current = targetRef.current;
        publish();
        frameRef.current = null;
        return;
      }

      progressRef.current += diff * (reducedMotionRef.current ? 1 : EASE_FACTOR);
      publish();
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [publish]);

  /** 最寄りのセクションへ吸着させる */
  const snap = useCallback(() => {
    const settled = Math.round(clamp(targetRef.current, 0, count - 1));
    targetRef.current = settled;
    anchorRef.current = settled;
    setActiveIndex(settled);
    runLoop();
  }, [count, runLoop]);

  const scheduleSnap = useCallback(() => {
    if (snapTimerRef.current !== null) {
      window.clearTimeout(snapTimerRef.current);
    }
    snapTimerRef.current = window.setTimeout(snap, SNAP_IDLE_MS);
  }, [snap]);

  const goTo = useCallback(
    (index: number) => {
      const next = clamp(Math.round(index), 0, count - 1);
      if (snapTimerRef.current !== null) {
        window.clearTimeout(snapTimerRef.current);
        snapTimerRef.current = null;
      }
      targetRef.current = next;
      anchorRef.current = next;
      setActiveIndex(next);
      runLoop();
    },
    [count, runLoop],
  );

  /**
   * 連続入力を progress に流し込む。
   * anchor から ±1 に制限することで、1 回のスワイプで複数セクションを
   * 飛び越さないようにしている。
   */
  const applyDelta = useCallback(
    (sections: number) => {
      const anchor = anchorRef.current;
      const next = clamp(
        clamp(targetRef.current + sections, anchor - 1, anchor + 1),
        0,
        count - 1,
      );
      targetRef.current = next;
      runLoop();
      scheduleSnap();
    },
    [count, runLoop, scheduleSnap],
  );

  const subscribe = useCallback((listener: (progress: number) => void) => {
    listenersRef.current.add(listener);
    listener(progressRef.current);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getProgress = useCallback(() => progressRef.current, []);

  /* prefers-reduced-motion の監視 */
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reducedMotionRef.current = query.matches;
      setPrefersReducedMotion(query.matches);
    };
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  /* 戻る/進むやアンカーによる hash 変更に追従する */
  useEffect(() => {
    const onHashChange = () => {
      const index = indexFromHash(ids);
      if (index !== null) goTo(index);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [ids, goTo]);

  /* activeIndex を URL に反映する。履歴は汚さない */
  useEffect(() => {
    const id = ids[activeIndex];
    if (!id || window.location.hash === `#${id}`) return;
    window.history.replaceState(null, '', `#${id}`);
  }, [ids, activeIndex]);

  /* 入力のジャック */
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      // 内側にまだ動かせるスクロール領域があるならそちらを優先する
      if (scrollableAncestor(event.target, event.deltaY)) return;

      event.preventDefault();
      applyDelta(event.deltaY / WHEEL_UNIT);
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchLastY = 0;
    let touchStartTarget = 0;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchLastY = touch.clientY;
      touchStartTarget = targetRef.current;
      if (snapTimerRef.current !== null) {
        window.clearTimeout(snapTimerRef.current);
        snapTimerRef.current = null;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      // 指を上へ動かした分だけコンテンツを先へ送る向きを正とする
      const step = touchLastY - touch.clientY;
      touchLastY = touch.clientY;

      if (scrollableAncestor(event.target, step)) {
        /*
         * 内側がまだスクロールできる間は触らない。
         * 端に達して引き継ぐときに progress が飛ばないよう、
         * ここで基準を現在地に更新し続ける。
         */
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTarget = targetRef.current;
        return;
      }

      event.preventDefault();

      // 斜めに動く画面に合わせ、縦を主・横を従として斜め軸に射影する
      const travel =
        (touchStartY - touch.clientY) * 0.7 +
        (touchStartX - touch.clientX) * 0.3;

      const anchor = anchorRef.current;
      targetRef.current = clamp(
        clamp(touchStartTarget + travel / TOUCH_UNIT, anchor - 1, anchor + 1),
        0,
        count - 1,
      );
      runLoop();
    };

    const onTouchEnd = () => scheduleSnap();

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // 入力中やリンク操作中のキーは奪わない
      if (target?.closest('input, textarea, select, [contenteditable]')) return;

      const current = anchorRef.current;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case 'PageDown':
          event.preventDefault();
          goTo(current + 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          goTo(current - 1);
          break;
        case ' ':
          if (target?.closest('a, button')) return;
          event.preventDefault();
          goTo(event.shiftKey ? current - 1 : current + 1);
          break;
        case 'Home':
          event.preventDefault();
          goTo(0);
          break;
        case 'End':
          event.preventDefault();
          goTo(count - 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [applyDelta, count, goTo, runLoop, scheduleSnap]);

  /* アンマウント時に走っているものを止める */
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (snapTimerRef.current !== null) window.clearTimeout(snapTimerRef.current);
    },
    [],
  );

  return useMemo(
    () => ({ activeIndex, goTo, subscribe, getProgress, prefersReducedMotion }),
    [activeIndex, goTo, subscribe, getProgress, prefersReducedMotion],
  );
};
