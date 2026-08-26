import { useEffect, useRef, type ReactNode } from 'react';
import { createScope, createTimeline, stagger, utils, type Scope } from 'animejs';
import type { SectionNavigator } from '../hooks/useSectionNavigator';
import { TITLE_FROM, TITLE_TO, isItemDirection, itemStates } from './animStates';

export type StageSection = {
  /** URL の hash とアンカーリンクに使う */
  id: string;
  /** 現在地表示に出すラベル */
  label: string;
  content: ReactNode;
};

type DiagonalStageProps = {
  sections: readonly StageSection[];
  navigator: SectionNavigator;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * セクションを仮想キャンバス上の斜め線に並べ、ステージ全体を逆向きに動かす。
 * progress が i のときセクション i がちょうど画面に収まる。
 *
 *   セクション i の位置 : ( i * 100vw, i * 100vh )
 *   ステージの移動量    : ( -progress * 100vw, -progress * 100vh )
 *
 * progress の平滑化は useDiagonalNavigator の rAF ループが済ませているので、
 * ここでは受け取った値をそのまま反映する（二重にイージングを掛けない）。
 */
export const DiagonalStage = ({ sections, navigator }: DiagonalStageProps) => {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);

  const { subscribe, getProgress, activeIndex, prefersReducedMotion } = navigator;

  useEffect(() => {
    const rootEl = root.current;
    const stageEl = stage.current;
    if (!rootEl || !stageEl) return;

    let stepX = window.innerWidth;
    let stepY = window.innerHeight;
    let timelines: ReturnType<typeof createTimeline>[] = [];

    scope.current = createScope({ root }).add(() => {
      const sectionEls = Array.from(
        rootEl.querySelectorAll<HTMLElement>('[data-section]'),
      );

      /*
       * セクションごとの内部タイムライン。autoplay: false で作っておき、
       * そのセクションへの近さ (0..1) で seek する。
       * これで「スワイプした分だけ中身が組み上がる」挙動になる。
       */
      timelines = sectionEls.map((sectionEl) => {
        const titles = sectionEl.querySelectorAll('[data-anim="title"]');
        const items = sectionEl.querySelectorAll('[data-anim="item"]');

        /*
         * anime.js は「まだ開始時刻に達していない子要素」を描画しないため、
         * seek しただけでは素の CSS（opacity: 1）のまま残ってしまう。
         * スタガーの後半が最初から見えてしまうので、開始前の状態を先に置く。
         */
        const rawDirection = sectionEl.querySelector<HTMLElement>('[data-anim-from]')
          ?.dataset.animFrom;
        const { from: itemFrom, to: itemTo } = itemStates(
          isItemDirection(rawDirection) ? rawDirection : 'bottom-right',
        );

        utils.set(titles, TITLE_FROM);
        utils.set(items, itemFrom);

        const tl = createTimeline({
          autoplay: false,
          defaults: { ease: 'out(3)', duration: 900 },
        });

        if (titles.length) {
          tl.add(titles, TITLE_TO, 0);
        }

        if (items.length) {
          tl.add(items, itemTo, stagger(70, { start: 150 }));
        }

        return tl;
      });
    });

    const render = (progress: number) => {
      utils.set(stageEl, { x: -progress * stepX, y: -progress * stepY });

      // hash によるブラウザ既定のジャンプで固定コンテナがずれることがあるため戻す
      if (rootEl.scrollTop !== 0) rootEl.scrollTop = 0;
      if (rootEl.scrollLeft !== 0) rootEl.scrollLeft = 0;

      for (let i = 0; i < timelines.length; i += 1) {
        const tl = timelines[i];
        if (!tl.duration) continue;

        // アニメーションを減らす設定なら、組み上がった状態で固定する
        const nearness = prefersReducedMotion
          ? 1
          : clamp(1 - Math.abs(progress - i), 0, 1);

        tl.seek(nearness * tl.duration, true);
      }
    };

    const onResize = () => {
      stepX = window.innerWidth;
      stepY = window.innerHeight;
      render(getProgress());
    };

    // scope.add() の戻り値によるクリーンアップは公式に保証されていないので自前で解除する
    const unsubscribe = subscribe(render);
    window.addEventListener('resize', onResize);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', onResize);
      scope.current?.revert();
      scope.current = null;
    };
  }, [sections, subscribe, getProgress, prefersReducedMotion]);

  return (
    <div
      ref={root}
      className="fixed inset-0 overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    >
      <div ref={stage} className="absolute inset-0 will-change-transform">
        {sections.map((section, index) => (
          <div
            key={section.id}
            data-section={section.id}
            // 画面外のセクションはフォーカスを受け取らない
            inert={index !== activeIndex}
            className="absolute inset-0 h-screen w-screen overflow-hidden"
            style={{
              transform: `translate(${index * 100}vw, ${index * 100}vh)`,
            }}
          >
            {section.content}
          </div>
        ))}
      </div>
    </div>
  );
};
