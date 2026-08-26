import { useEffect, useRef } from 'react';
import type { SectionNavigator } from '../hooks/useSectionNavigator';

/** ステージに対する背景の移動比。小さいほど遠くに見える */
const PARALLAX = 0.28;

type NeonGridProps = {
  navigator: SectionNavigator;
};

/**
 * 斜めに流れる背景グリッド。
 * ステージより遅い速度で動かすことで視差が生まれ、
 * 「広い空間を斜めに移動している」感覚を補強する。
 */
export const NeonGrid = ({ navigator }: NeonGridProps) => {
  const layer = useRef<HTMLDivElement>(null);
  const { subscribe } = navigator;

  useEffect(
    () =>
      subscribe((progress) => {
        if (!layer.current) return;
        const x = -progress * window.innerWidth * PARALLAX;
        const y = -progress * window.innerHeight * PARALLAX;
        layer.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }),
    [subscribe],
  );

  // z-index は付けない。負の値にすると body の不透明な背景より下に
  // 描画されて見えなくなるため、DOM 順で DiagonalStage の下に敷く
  return (
    <div
      className="neon-grid-viewport pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* 動かしても端が途切れないよう、画面より大きく取る */}
      <div ref={layer} className="neon-grid absolute -inset-full will-change-transform" />
    </div>
  );
};
