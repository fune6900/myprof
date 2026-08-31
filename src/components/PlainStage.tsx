import { Fragment, useEffect, useRef } from 'react';
import { animate, createScope, onScroll, stagger, utils, type Scope } from 'animejs';
import type { SectionNavigator } from '../hooks/useSectionNavigator';
import type { StageSection } from './TunnelStage';
import { ITEM_DIRECTIONS, TITLE_FROM, TITLE_TO, itemStates } from './animStates';
import { Marquee } from '../ui-component/Marquee';

type PlainStageProps = {
  sections: readonly StageSection[];
  navigator: SectionNavigator;
};

/**
 * スマホ向けの通常スクロール表示。
 * セクションを普通に縦に積み、中身は画面に入ったところで組み上げる。
 * スクロールが生きているので anime.js の onScroll をそのまま使える。
 */
export const PlainStage = ({ sections, navigator }: PlainStageProps) => {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);

  const { prefersReducedMotion } = navigator;

  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return;

    scope.current = createScope({ root }).add(() => {
      const sectionEls = Array.from(
        rootEl.querySelectorAll<HTMLElement>('[data-section]'),
      );

      for (const sectionEl of sectionEls) {
        const titles = sectionEl.querySelectorAll('[data-anim="title"]');
        const items = sectionEl.querySelectorAll('[data-anim="item"]');

        const rawDirection = sectionEl.querySelector<HTMLElement>('[data-anim-from]')
          ?.dataset.animFrom;
        const direction =
          rawDirection && rawDirection in ITEM_DIRECTIONS
            ? (rawDirection as keyof typeof ITEM_DIRECTIONS)
            : 'bottom-right';
        const { from: itemFrom, to: itemTo } = itemStates(direction);

        if (prefersReducedMotion) {
          // 動きを減らす設定なら、組み上がった状態で置くだけにする
          utils.set(titles, { opacity: 1, x: 0, y: 0, scale: 1 });
          utils.set(items, { opacity: 1, x: 0, y: 0, scale: 1 });
          continue;
        }

        utils.set(titles, TITLE_FROM);
        utils.set(items, itemFrom);

        if (titles.length) {
          animate(titles, {
            ...TITLE_TO,
            ease: 'out(3)',
            duration: 700,
            autoplay: onScroll({ enter: 'bottom-=60 top', sync: 'play' }),
          });
        }

        if (items.length) {
          animate(items, {
            ...itemTo,
            ease: 'out(3)',
            duration: 700,
            delay: stagger(60),
            autoplay: onScroll({ enter: 'bottom-=60 top', sync: 'play' }),
          });
        }
      }
    });

    return () => {
      scope.current?.revert();
      scope.current = null;
    };
  }, [sections, prefersReducedMotion]);

  return (
    <div ref={root} className="relative z-30">
      {sections.map((section, index) => (
        <Fragment key={section.id}>
          {/* セクションの継ぎ目に、次のセクション名を流す帯を挟む */}
          {index > 0 && (
            <Marquee text={section.label} reverse={index % 2 === 1} />
          )}

          <div data-section={section.id}>{section.content}</div>
        </Fragment>
      ))}
    </div>
  );
};
