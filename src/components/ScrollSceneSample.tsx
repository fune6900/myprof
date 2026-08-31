import { useCallback, useEffect, useRef } from 'react';
import { createTimeline, stagger, utils } from 'animejs';
import { RiScrollToBottomLine } from 'react-icons/ri';
import { ScrollScene } from './ScrollScene';
import { SectionHeading } from './SectionHeading';
import { useScene } from '../hooks/useScrollScene';
import { useSceneTimeline } from '../hooks/useSceneTimeline';

const STEPS = [
  { key: 'observe', body: 'スクロール量を 0→1 に正規化する' },
  { key: 'pin', body: '再生しているあいだは画面に貼り付けておく' },
  { key: 'seek', body: '時間ではなく進行度で再生ヘッドを動かす' },
  { key: 'fallback', body: '無理な環境では素直に諦めて素の挙動へ戻す' },
];

/**
 * 進行度をそのまま使う例。
 * タイムラインを挟まず、購読した値で DOM を直接書き換える。
 * React の state を経由しないので毎フレーム動かしても再描画は起きない。
 */
const SceneMeter = () => {
  const bar = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const { subscribe, mode } = useScene();

  useEffect(
    () =>
      subscribe((progress) => {
        if (bar.current) {
          bar.current.style.transform = `scaleX(${progress})`;
        }
        if (readout.current) {
          readout.current.textContent = `${Math.round(progress * 100)}%`;
        }
      }),
    [subscribe],
  );

  return (
    <div className="mt-10 w-full max-w-md shrink-0">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-neon-green opacity-70">
        <span>progress</span>
        <span>
          <span ref={readout}>0%</span>
          <span className="ml-2 opacity-50">[{mode}]</span>
        </span>
      </div>

      <div className="mt-2 h-px w-full bg-neon-green/25">
        <div
          ref={bar}
          className="h-px w-full origin-left scale-x-0 bg-neon-green shadow-[0_0_10px_rgba(255,85,0,0.9)]"
        />
      </div>
    </div>
  );
};

/**
 * タイムラインを進行度で seek する例。
 * autoplay: false で組んでおき、再生は useSceneTimeline に任せる。
 */
const Steps = () => {
  const build = useCallback((root: HTMLDivElement) => {
    const title = root.querySelector<HTMLElement>('[data-scene="title"]');
    const cards = root.querySelectorAll<HTMLElement>('[data-scene="card"]');

    /*
     * anime.js は開始時刻に達していない子要素を描画しないので、
     * seek しただけではスタガーの後半が素の CSS のまま見えてしまう。
     * 開始前の状態を先に置いておく。
     */
    if (title) utils.set(title, { opacity: 0, y: -28 });
    if (cards.length) utils.set(cards, { opacity: 0, y: 28, scale: 0.94 });

    const timeline = createTimeline({
      autoplay: false,
      defaults: { ease: 'out(3)', duration: 600 },
    });

    if (title) {
      timeline.add(title, { opacity: [0, 1], y: [-28, 0] }, 0);
    }

    if (cards.length) {
      timeline.add(
        cards,
        { opacity: [0, 1], y: [28, 0], scale: [0.94, 1] },
        stagger(160, { start: 200 }),
      );
    }

    return timeline;
  }, []);

  const root = useSceneTimeline<HTMLDivElement>(build);

  return (
    <div
      ref={root}
      className="flex h-full w-full flex-col items-center justify-center overflow-hidden px-6"
    >
      <p
        data-scene="title"
        className="font-mono text-sm uppercase tracking-[0.3em] text-neon-green"
      >
        scroll-driven
      </p>

      <ul className="mt-6 flex w-full max-w-md flex-col gap-3 md:mt-8 md:gap-4">
        {STEPS.map((step, index) => (
          <li
            key={step.key}
            data-scene="card"
            className="flex items-baseline gap-4 border-l border-neon-green/40 pl-4"
          >
            <span className="font-mono text-xs text-neon-green opacity-60">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-sm leading-snug text-neon-white md:text-lg">
              {step.body}
            </span>
          </li>
        ))}
      </ul>

      <SceneMeter />
    </div>
  );
};

/**
 * スクロール連動セクションのサンプル。
 * App の sections 配列にそのまま渡せる形にしてある。
 */
export const ScrollSceneSample = () => (
  <section
    id="scene"
    aria-labelledby="scene-heading"
    className="flex min-h-dvh w-full flex-col px-4 pb-10 pt-20 md:h-full md:min-h-0 md:px-10 md:pt-24"
  >
    <SectionHeading id="scene-heading" title="Scene" icon={RiScrollToBottomLine} />

    {/*
      length={1.5} … sticky モードのとき、1.5 画面ぶん流れるあいだ画面を固定して再生する。
      pinOnNativeScroll … スマホでもピン留めしたい場合だけ true にする。
                          既定（false）ならスマホは static へ落ちて素のスクロールになる。
    */}
    <ScrollScene
      length={1.5}
      pinOnNativeScroll
      className="min-h-0 flex-1"
      pinClassName="flex items-center justify-center"
    >
      <Steps />
    </ScrollScene>
  </section>
);
