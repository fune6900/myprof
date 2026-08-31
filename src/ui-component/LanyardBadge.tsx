import { useEffect, useRef } from 'react';
import { animate, spring, utils } from 'animejs';
import fune from '../assets/fune6900.png';

/** 吊り元からカードの留め具までの、力のかかっていない状態の長さ (px) */
const REST_LENGTH = 190;
/** どれだけ引き離せるか (px) */
const MAX_PULL = 260;
/** 横のずれをどれだけ傾きに変えるか */
const TILT_PER_PX = 0.16;
/** 傾きの上限 (deg) */
const MAX_TILT = 26;

/**
 * ストラップで吊るした社員証。掴んで引っ張ったり振ったりできる。
 *
 * 物理エンジンは持ち込まない。掴んでいる間の位置は自前のポインタ処理で持ち、
 * 手を離したときの戻りだけ anime.js のばねに任せている。
 * anime.js の draggable は独自の基準点を持っていて、戻り先を指定すると
 * ずれが蓄積して発散したので使っていない。
 *
 * 紐は SVG の 2 次ベジェ。引くほど弛みが減って張っていくように描く。
 */
export const LanyardBadge = () => {
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const cord = useRef<SVGPathElement>(null);

  useEffect(() => {
    const rootEl = root.current;
    const cardEl = card.current;
    const tiltEl = tilt.current;
    const cordEl = cord.current;
    if (!rootEl || !cardEl || !tiltEl || !cordEl) return;

    /** 吊り下がった位置からのずれ。これだけが状態 */
    const offset = { x: 0, y: 0 };
    let width = rootEl.clientWidth;

    /** ずれから、カード・紐・傾きをまとめて描き直す */
    const apply = () => {
      cardEl.style.transform = `translate(${offset.x}px, ${offset.y}px)`;

      const ax = width / 2;
      const px = ax + offset.x;
      const py = REST_LENGTH + offset.y;
      const distance = Math.hypot(px - ax, py);

      // 縮んでいるぶんだけ弛ませる。伸ばすと真っ直ぐになる
      const slack = Math.max(0, REST_LENGTH - distance) * 0.55 + 6;

      cordEl.setAttribute(
        'd',
        `M ${ax} 0 Q ${(ax + px) / 2} ${py / 2 + slack} ${px} ${py}`,
      );

      tiltEl.style.rotate = `${utils.clamp(offset.x * TILT_PER_PX, -MAX_TILT, MAX_TILT)}deg`;
    };

    let dragging = false;
    let originX = 0;
    let originY = 0;
    let settle: ReturnType<typeof animate> | null = null;

    const onPointerDown = (event: PointerEvent) => {
      // 主ボタン以外では掴まない
      if (event.button !== 0) return;
      settle?.pause();
      dragging = true;
      originX = event.clientX - offset.x;
      originY = event.clientY - offset.y;
      cardEl.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      offset.x = utils.clamp(event.clientX - originX, -MAX_PULL, MAX_PULL);
      offset.y = utils.clamp(event.clientY - originY, -REST_LENGTH * 0.6, MAX_PULL);
      apply();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (cardEl.hasPointerCapture(event.pointerId)) {
        cardEl.releasePointerCapture(event.pointerId);
      }

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        offset.x = 0;
        offset.y = 0;
        apply();
        return;
      }

      // 吊り下がった位置へ、少し揺り返しながら戻る
      settle = animate(offset, {
        x: 0,
        y: 0,
        ease: spring({ mass: 1, stiffness: 120, damping: 10 }),
        onUpdate: apply,
      });
    };

    const onResize = () => {
      width = rootEl.clientWidth;
      apply();
    };

    cardEl.addEventListener('pointerdown', onPointerDown);
    cardEl.addEventListener('pointermove', onPointerMove);
    cardEl.addEventListener('pointerup', onPointerUp);
    cardEl.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('resize', onResize);

    apply();

    return () => {
      settle?.pause();
      cardEl.removeEventListener('pointerdown', onPointerDown);
      cardEl.removeEventListener('pointermove', onPointerMove);
      cardEl.removeEventListener('pointerup', onPointerUp);
      cardEl.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      ref={root}
      // 掴む操作が前提なので、指しか使えない画面には出さない
      className="relative hidden h-full min-h-[26rem] w-full select-none md:block"
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <path
          ref={cord}
          fill="none"
          stroke="var(--neon-green)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* 吊り元の金具 */}
        <circle cx="50%" cy="0" r="5" fill="none" stroke="var(--neon-green)" strokeWidth="2" />
      </svg>

      <div
        ref={card}
        style={{ top: `${REST_LENGTH}px`, touchAction: 'none' }}
        className="absolute left-1/2 -ml-[5.5rem] cursor-grab active:cursor-grabbing"
      >
        <div ref={tilt} className="origin-top">
          {/* 留め具 */}
          <div className="mx-auto h-2.5 w-2.5 rounded-full border-2 border-neon-green bg-cyber-black" />

          <div className="mt-1 w-44 rounded-xl border-neon border-neon-green bg-cyber-black p-4 text-center">
            <img
              src={fune}
              alt=""
              draggable={false}
              className="mx-auto h-20 w-20 rounded-full border-2 border-neon-green object-cover"
            />
            <p className="mt-3 text-sm font-bold tracking-widest text-neon-white">RIKU</p>
            <p className="mt-0.5 text-[0.65rem] tracking-wider text-neon-green">
              SYSTEM ENGINEER
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
