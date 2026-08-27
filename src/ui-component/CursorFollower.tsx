import { useEffect, useRef } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";

/** 1 フレームでカーソルへ詰める割合。小さいほど大きく遅れる */
const EASE_FACTOR = 0.18;
/** これ以下の差は追いついたとみなしてループを止める */
const SETTLE_EPSILON = 0.1;

/** この中にカーソルが入ったらリングを開く */
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, summary';

/**
 * カーソルを遅れて追いかけるリング。
 *
 * 既定のカーソルは消さない（消すと選択やリンク先の判別がしづらくなる）。
 * リングは装飾なので pointer-events は持たせない。
 *
 * 指で操作する端末と、動きを減らす設定では出さない。
 */
export const CursorFollower = () => {
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = finePointer && !reducedMotion;

  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const ringEl = ring.current;
    if (!ringEl) return;

    /** カーソルの現在地 */
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    /** リングの現在地。pointer を追いかける */
    let ringX = pointerX;
    let ringY = pointerY;
    let frame: number | null = null;

    const tick = () => {
      const dx = pointerX - ringX;
      const dy = pointerY - ringY;

      ringX += dx * EASE_FACTOR;
      ringY += dy * EASE_FACTOR;
      ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      // 追いついたら止める。動いていない間まで回し続けない
      if (Math.abs(dx) < SETTLE_EPSILON && Math.abs(dy) < SETTLE_EPSILON) {
        frame = null;
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame === null) frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      // 指やペンでの操作にはついていかない
      if (event.pointerType !== "mouse") return;

      pointerX = event.clientX;
      pointerY = event.clientY;
      ringEl.dataset.visible = "true";

      const target = event.target as HTMLElement | null;
      ringEl.dataset.active = target?.closest(INTERACTIVE) ? "true" : "false";

      start();
    };

    /* 画面の外へ出たら消す。戻ってきたら onPointerMove が復帰させる */
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget !== null) return;
      ringEl.dataset.visible = "false";
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ring}
      aria-hidden="true"
      data-visible="false"
      data-active="false"
      className="cursor-ring pointer-events-none fixed left-0 top-0 z-[100]"
    />
  );
};
