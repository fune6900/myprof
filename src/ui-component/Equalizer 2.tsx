import { useEffect, useMemo, useRef } from 'react';
import type { SectionNavigator } from '../hooks/useSectionNavigator';

type EqualizerProps = {
  navigator: SectionNavigator;
};

/** 棒の数 */
const BARS = 44;

/** 速度がこの値でブーストが最大になる (progress / 秒) */
const FULL_SPEED = 1.4;

/** 決定論的な擬似乱数。読み込むたびに波形が変わらないように */
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * 画面下のイコライザー。
 *
 * 波打ちは CSS のキーフレームに任せる。JS で毎フレーム 64 本の高さを
 * 書き換えると、何もしていない時間にまで負荷が乗るため。
 * スクロールしたときだけ、振れ幅の係数 (--eq-boost) を 1 つ書き足す。
 */
export const Equalizer = ({ navigator }: EqualizerProps) => {
  const root = useRef<HTMLDivElement>(null);
  const { subscribe, prefersReducedMotion } = navigator;

  const bars = useMemo(() => {
    const rand = mulberry32(777);
    return Array.from({ length: BARS }, (_, i) => {
      // 中央ほど高くして、山なりの波形にする
      const center = 1 - Math.abs(i / (BARS - 1) - 0.5) * 2;
      return {
        id: i,
        base: 0.18 + center * 0.42 + rand() * 0.16,
        duration: 1.1 + rand() * 1.5,
        delay: -rand() * 3,
      };
    });
  }, []);

  /* 動かした速さを振れ幅に流す。止まれば静かな待機の波に戻る */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = root.current;
    if (!el) return;

    let previous: number | null = null;
    let lastTime = performance.now();
    let boost = 0;

    return subscribe((progress) => {
      const now = performance.now();
      const dt = Math.max((now - lastTime) / 1000, 1 / 240);
      lastTime = now;

      const speed =
        previous === null ? 0 : Math.abs(progress - previous) / dt;
      previous = progress;

      const target = Math.min(speed / FULL_SPEED, 1);
      // 立ち上がりは速く、収まりはゆっくり
      boost += (target - boost) * (target > boost ? 0.35 : 0.06);

      el.style.setProperty('--eq-boost', boost.toFixed(3));
    });
  }, [subscribe, prefersReducedMotion]);

  return (
    <div ref={root} className="equalizer pointer-events-none" aria-hidden="true">
      {bars.map((bar) => (
        <i
          key={bar.id}
          className="equalizer-bar"
          style={{
            '--eq-base': bar.base.toFixed(3),
            animationDuration: `${bar.duration.toFixed(2)}s`,
            animationDelay: `${bar.delay.toFixed(2)}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
