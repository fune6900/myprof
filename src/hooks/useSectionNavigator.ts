import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** ホイールでセクション 1 つ分を進めるのに必要な deltaY の量 */
const WHEEL_UNIT = 600;
/** タッチでセクション 1 つ分を進めるのに必要なドラッグ量 (px) */
const TOUCH_UNIT = 420;
/** 入力が途切れてからスナップを開始するまでの時間 (ms) */
const SNAP_IDLE_MS = 140;
/**
 * 動かした量がこれを超えたら、進んだ方向のセクションへ確定させる。
 * 「半分まで動かさないと戻される」と操作していて引っかかるので、
 * 軽く回した程度でも意図どおり次へ進むようにしている。
 * ホイールなら約 90、スワイプなら約 63px 分。
 */
const COMMIT_RATIO = 0.15;
/** 1 フレームあたり target へ詰める割合 */
const EASE_FACTOR = 0.12;
/** これ以下の差は収束とみなす */
const SETTLE_EPSILON = 0.0005;

/**
 * セクション間の移動を司る。
 *
 * hijack が true のとき（広い画面）は入力を横取りして斜めに展開する。
 * false のとき（スマホ）は普通の縦スクロールに任せ、進行度だけを
 * スクロール位置から読み取る。どちらのモードでも progress の意味は同じで、
 * 1.4 ならセクション 1 と 2 のあいだ 40% 地点を表す。
 *
 * progress は毎フレーム変わるので React state には置かず ref + 購読で配る。
 * 整数の activeIndex だけが state（現在地表示と inert に使う）。
 */
export type SectionNavigator = {
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
  /** 入力を横取りしているか（斜め展開モードか） */
  hijack: boolean;
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

export const useSectionNavigator = (
  ids: readonly string[],
  hijack: boolean,
): SectionNavigator => {
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

  /* ---------- 斜め展開モード（入力を横取りする） ---------- */

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

  /**
   * 入力が途切れたところで行き先を確定させる。
   *
   * 最寄りへ丸めるのではなく「どちらへ動かしたか」で決める。
   * 丸めると半分を超えるまで戻され続けて、少し回しただけでは
   * 進めないという操作感になってしまうため。
   */
  const snap = useCallback(() => {
    const anchor = anchorRef.current;
    const traveled = targetRef.current - anchor;

    const settled =
      Math.abs(traveled) >= COMMIT_RATIO
        ? clamp(anchor + Math.sign(traveled), 0, count - 1)
        : anchor;

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

  /* ---------- 共通 ---------- */

  const goTo = useCallback(
    (index: number) => {
      const next = clamp(Math.round(index), 0, count - 1);

      if (!hijack) {
        // 普通のスクロールに任せる。
        // 要素の scrollIntoView だと、直後の再描画で要素の状態が変わった
        // ときにスムーススクロールが取り消されることがあるため、
        // ビューポート基準で指示する
        const el = document.getElementById(ids[next]);
        if (el) {
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY,
            behavior: reducedMotionRef.current ? 'auto' : 'smooth',
          });
        }
        setActiveIndex(next);
        return;
      }

      if (snapTimerRef.current !== null) {
        window.clearTimeout(snapTimerRef.current);
        snapTimerRef.current = null;
      }
      targetRef.current = next;
      anchorRef.current = next;
      setActiveIndex(next);
      runLoop();
    },
    [count, hijack, ids, runLoop],
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

  /* ---------- 斜め展開モードの入力ジャック ---------- */
  useEffect(() => {
    if (!hijack) return;

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

    /*
     * スクロールを横取りしている間はブラウザ標準のキー操作も効かなくなるので、
     * 自前で用意する。通常スクロール側では不要（ブラウザに任せる）。
     */
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // 入力中のキーは奪わない
      if (target?.closest('input, textarea, select, [contenteditable]')) return;

      const current = anchorRef.current;

      /*
       * 縦キーはホイールと同じく、内側にまだ送れるスクロール領域があれば
       * ブラウザ既定の動きに任せる。横キーは常にセクション移動なので、
       * 内側を読んでいる途中でも隣のセクションへ抜けられる。
       */
      const defersToInner = (direction: number) =>
        scrollableAncestor(target, direction) !== null;

      switch (event.key) {
        case 'ArrowDown':
        case 'PageDown':
          if (defersToInner(1)) return;
          event.preventDefault();
          goTo(current + 1);
          break;
        case 'ArrowUp':
        case 'PageUp':
          if (defersToInner(-1)) return;
          event.preventDefault();
          goTo(current - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          goTo(current + 1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goTo(current - 1);
          break;
        case ' ':
          // リンクやボタンの上ではその要素の操作を優先する
          if (target?.closest('a, button')) return;
          if (defersToInner(event.shiftKey ? -1 : 1)) return;
          event.preventDefault();
          goTo(event.shiftKey ? current - 1 : current + 1);
          break;
        case 'Home':
          if (defersToInner(-1)) return;
          event.preventDefault();
          goTo(0);
          break;
        case 'End':
          if (defersToInner(1)) return;
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
  }, [applyDelta, count, goTo, hijack, runLoop, scheduleSnap]);

  /* ---------- 通常スクロールモードの進行度 ---------- */
  useEffect(() => {
    if (hijack) return;

    let frame: number | null = null;

    const read = () => {
      frame = null;

      const y = window.scrollY;
      const tops = ids.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + y : 0;
      });

      // y がどのセクションの範囲にいるかを探し、その中での進み具合を足す
      let index = 0;
      while (index < tops.length - 1 && y >= tops[index + 1]) index += 1;

      const span = (tops[index + 1] ?? tops[index]) - tops[index];
      const fraction = span > 0 ? clamp((y - tops[index]) / span, 0, 1) : 0;

      progressRef.current = clamp(index + fraction, 0, count - 1);
      publish();

      const nearest = Math.round(progressRef.current);
      setActiveIndex((current) => (current === nearest ? current : nearest));
    };

    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [count, hijack, ids, publish]);

  /* 起動時の hash へ移動する（通常スクロールはブラウザ任せにしない） */
  useEffect(() => {
    if (hijack || start === 0) return;
    const el = document.getElementById(ids[start]);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY });
    }
  }, [hijack, ids, start]);

  /* アンマウント時に走っているものを止める */
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (snapTimerRef.current !== null) window.clearTimeout(snapTimerRef.current);
    },
    [],
  );

  return useMemo(
    () => ({
      activeIndex,
      goTo,
      subscribe,
      getProgress,
      prefersReducedMotion,
      hijack,
    }),
    [activeIndex, goTo, subscribe, getProgress, prefersReducedMotion, hijack],
  );
};
