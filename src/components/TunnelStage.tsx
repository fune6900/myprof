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

type TunnelStageProps = {
  sections: readonly StageSection[];
  navigator: SectionNavigator;
};

/** セクション 1 つ分の奥行き (px)。PERSPECTIVE より小さくすること */
const DEPTH = 900;

/**
 * 仮想的な焦点距離 (px)。奥行きを見かけの倍率に直すのに使う。
 *
 *   倍率 = PERSPECTIVE / (PERSPECTIVE - z)
 *
 * 画面と平行な平面を perspective で奥へ動かしたときの見え方は、
 * 中心から一様に拡縮するのと数学的に同じ。つまり translateZ と
 * perspective を使わなくても、この式の scale だけで同じ絵になる。
 *
 * あえて 3D を使わないのは当たり判定のため。perspective の内側に
 * セクションを置くと、Chromium が中身の当たり判定を落とすことがあり、
 * 見た目は正しいのにセクション内のスクロールもクリックも効かなくなる。
 * 2D の scale なら普通の要素と同じように扱われる。
 */
const PERSPECTIVE = 1400;

/** 奥行きを見かけの倍率に直す */
const scaleAt = (z: number) => PERSPECTIVE / (PERSPECTIVE - z);

/** これより奥にあるセクションは描かない */
const FAR = -1.05;
/** ここまで近づいたら完全に見える */
const NEAR = -0.18;
/** 通り過ぎてからこれだけで消える。伸ばすと拡大しすぎて画面を覆う */
const PASSED = 0.6;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * セクションを奥行き方向に一列に並べ、カメラが前へ進んでいく。
 *
 *   セクション i の奥行き z = (progress - i) * DEPTH
 *   見かけの倍率           = PERSPECTIVE / (PERSPECTIVE - z)
 *
 * progress が i に達したときセクション i がちょうど等倍で正面に来る。
 * 下へ送れば次のセクションが奥から迫り、上へ戻せば逆に遠ざかる。
 * 背景の街と床も同じ向きに Z を進めているので、全体が 1 つの前進になる。
 *
 * 通り過ぎたセクションは倍率が急に伸びるので、手前に来る前に消す。
 * 透明にするだけでは 3D の合成に乗り続けるため visibility でも落とす。
 *
 * progress の平滑化は useSectionNavigator の rAF ループが済ませているので、
 * ここでは受け取った値をそのまま反映する（二重にイージングを掛けない）。
 */
export const TunnelStage = ({ sections, navigator }: TunnelStageProps) => {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);

  const { subscribe, getProgress, activeIndex, prefersReducedMotion } = navigator;

  /*
   * activeIndex は毎フレームの描画で参照するが、effect の依存には入れない。
   * 依存に入れるとセクションが切り替わるたびに effect が張り直され、
   * 7 本のタイムラインを遷移の真っ最中に作り直すことになる（実測でここが
   * フレーム落ちの主因だった）。値は ref 経由で読む。
   */
  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return;

    let timelines: ReturnType<typeof createTimeline>[] = [];
    let sectionEls: HTMLElement[] = [];
    /** 「いま描いているか」の記憶。切り替わった瞬間だけ visibility を書く */
    const shown: boolean[] = [];
    /** 直近で seek した進み具合。0 のまま動かないタイムラインを飛ばすのに使う */
    const seeked: number[] = [];

    scope.current = createScope({ root }).add(() => {
      sectionEls = Array.from(
        rootEl.querySelectorAll<HTMLElement>('[data-section]'),
      );

      /*
       * セクションごとの内部タイムライン。autoplay: false で作っておき、
       * そのセクションへの近さ (0..1) で seek する。
       * これで「送った分だけ中身が組み上がる」挙動になる。
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
      // hash によるブラウザ既定のジャンプで固定コンテナがずれることがあるため戻す
      if (rootEl.scrollTop !== 0) rootEl.scrollTop = 0;
      if (rootEl.scrollLeft !== 0) rootEl.scrollLeft = 0;

      for (let i = 0; i < sectionEls.length; i += 1) {
        const el = sectionEls[i];
        const d = progress - i;

        /*
         * 動きを減らす設定なら、現在地だけを等倍・不透明で置く。
         * 迫ってくる演出はやめて、切り替わりだけにする。
         */
        const alpha = prefersReducedMotion
          ? (i === activeRef.current ? 1 : 0)
          : d < 0
            ? smoothstep(FAR, NEAR, d)
            : 1 - smoothstep(0, PASSED, d);

        const visible = alpha > 0.004;

        if (visible !== shown[i]) {
          el.style.visibility = visible ? 'visible' : 'hidden';
          shown[i] = visible;
        }

        if (visible) {
          el.style.opacity = `${alpha}`;
          el.style.transform = `scale(${scaleAt(d * DEPTH)})`;
        }

        const tl = timelines[i];
        if (!tl?.duration) continue;

        /*
         * 見えていないセクションのタイムラインは触らない。
         *
         * seek はタイムラインの子要素をすべて評価し直すので、7 本ぶんを
         * 毎フレーム回すと遷移中のフレーム落ちの原因になる。実際に動いて
         * いるのは高々 2 本なので、残りは見えるようになった時点で
         * 追いつかせれば足りる。
         */
        const nearness = prefersReducedMotion
          ? 1
          : clamp(1 - Math.abs(d), 0, 1);

        if (!visible && seeked[i] === 0 && nearness === 0) continue;

        tl.seek(nearness * tl.duration, true);
        seeked[i] = nearness;
      }
    };

    const unsubscribe = subscribe(render);
    render(getProgress());

    return () => {
      unsubscribe();
      scope.current?.revert();
      scope.current = null;
    };
  }, [sections, subscribe, getProgress, prefersReducedMotion]);

  return (
    <div
      ref={root}
      className="tunnel-scene fixed inset-0 z-30 overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    >
      <div ref={stage} className="tunnel-world absolute inset-0">
        {sections.map((section, index) => (
          <div
            key={section.id}
            data-section={section.id}
            // 画面外のセクションはフォーカスを受け取らない
            inert={index !== activeIndex}
            className="tunnel-section absolute inset-0 h-full w-full overflow-hidden"
            style={{
              transform: `scale(${scaleAt(-index * DEPTH)})`,
              opacity: 0,
              visibility: 'hidden',
            }}
          >
            {section.content}
          </div>
        ))}
      </div>
    </div>
  );
};
