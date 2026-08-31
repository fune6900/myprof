import { useRef, type ReactNode } from 'react';
import {
  SceneContext,
  useScrollScene,
  type ScrollSceneOptions,
} from '../hooks/useScrollScene';

type ScrollSceneProps = ScrollSceneOptions & {
  /** トラック（外枠）に付けるクラス */
  className?: string;
  /** ピン留めされる中身に付けるクラス。sticky モードでのみ効く */
  pinClassName?: string;
  children: ReactNode;
};

/**
 * スクロール量に合わせて手動再生させたい演出を包む。
 * 中身は useScene / useSceneTimeline で 0→1 の進行度を受け取る。
 *
 * sticky モードのときだけ、
 *
 *   トラック : 高さ (1 + length) 画面ぶん   ← ここを流れた量が進行度になる
 *     └ ピン : 高さ 1 画面ぶん / sticky top-0 ← 再生中はここが画面に貼り付く
 *
 * という二重構造を作る。トラックの残り length 画面ぶんを消化するあいだ、
 * ピンは画面に留まったままなので「止まって見えるのに進行度だけ進む」。
 *
 * pinned（奥行き移動）モードでは TunnelStage がすでに画面を固定しているので
 * トラックは要らない。static では通常フローにそのまま置く。
 * どのモードでも子が受け取る値は 0→1 なので、演出側は書き分け不要。
 */
export const ScrollScene = ({
  className,
  pinClassName,
  children,
  ...options
}: ScrollSceneProps) => {
  const track = useRef<HTMLDivElement>(null);
  const scene = useScrollScene(track, options);

  const { length = 1 } = options;

  return (
    <SceneContext.Provider value={scene}>
      {scene.mode === 'sticky' ? (
        <div
          ref={track}
          className={className}
          /*
           * トラックの丈はインラインで固定する。呼び出し側の className に
           * flex-1 のような指定が入っていると、flex コンテナの中でトラックが
           * 1 画面ぶんまで潰され、「流せる距離」が 0 になって進行度が動かなくなる。
           *
           * flex: none（= 0 0 auto）まで指定するのが要点。flex-1 は
           * flex-basis: 0% も立てるので、grow と shrink だけ潰しても
           * 主軸の丈は height ではなく basis で決まってしまう。
           */
          style={{ height: `${(1 + length) * 100}dvh`, flex: 'none' }}
        >
          <div
            className={`sticky top-0 h-dvh overflow-hidden ${pinClassName ?? ''}`}
          >
            {children}
          </div>
        </div>
      ) : (
        <div ref={track} className={className}>
          {children}
        </div>
      )}
    </SceneContext.Provider>
  );
};
