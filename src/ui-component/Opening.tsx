import { useEffect, useRef, useState } from "react";
import { createScope, createTimeline, stagger, type Scope } from "animejs";
import { markBootDone } from "../lib/boot";

/** 起動ログとして流す行 */
const LINES = [
  "> booting myprof ...",
  "> loading profile.dat ......... OK",
  "> loading career.log .......... OK",
  "> mounting /dev/neon .......... OK",
  "> ready.",
] as const;

/**
 * 読み込み直後に一度だけ流すオープニング。
 * サイト全体がターミナル調なので、起動ログの体裁で立ち上げる。
 *
 * クリックでもキー操作でも飛ばせる。
 * 動きを減らす設定なら、そもそも出さずにすぐ本編へ渡す。
 */
export const Opening = () => {
  const [visible, setVisible] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);

  /* 出さないと決めた場合は、待たせずに本編へ渡す */
  useEffect(() => {
    if (visible) return;
    markBootDone();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const rootEl = root.current;
    if (!rootEl) return;

    /** 二重に呼ばれても安全。閉じたうえで本編へ渡す */
    const finish = () => {
      markBootDone();
      setVisible(false);
    };

    scope.current = createScope({ root }).add(() => {
      createTimeline({ defaults: { ease: "out(3)" } })
        .add(
          '[data-boot="line"]',
          { opacity: [0, 1], y: [10, 0], duration: 260 },
          stagger(200),
        )
        .add(
          '[data-boot="title"]',
          { opacity: [0, 1], scale: [0.92, 1], duration: 560 },
          "+=140",
        )
        .add(
          rootEl,
          { opacity: [1, 0], duration: 460, ease: "in(2)", onComplete: finish },
          "+=420",
        );
    });

    /*
     * どの入力でも飛ばせるようにする。
     * キャプチャ段階で止めるのは、飛ばすための一打で
     * 裏のセクション移動まで動いてしまわないようにするため。
     */
    const skip = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      finish();
    };

    const options = { capture: true } as const;
    window.addEventListener("pointerdown", skip, options);
    window.addEventListener("keydown", skip, options);

    return () => {
      window.removeEventListener("pointerdown", skip, options);
      window.removeEventListener("keydown", skip, options);
      scope.current?.revert();
      scope.current = null;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center gap-8 bg-cyber-black px-6"
    >
      {/* 走査線は経歴のターミナルと同じものを敷く */}
      <div className="terminal-scanlines pointer-events-none absolute inset-0" />

      <div className="text-neon-green-all w-full max-w-md font-mono text-xs leading-loose md:text-sm">
        {LINES.map((line) => (
          <p key={line} data-boot="line" className="opacity-0">
            {line}
          </p>
        ))}
      </div>

      <p
        data-boot="title"
        className="neon-glow-soft text-center text-2xl font-bold uppercase italic tracking-widest text-neon-green opacity-0 md:text-4xl"
      >
        Riku Funagayama
      </p>

      <p className="terminal-cursor absolute bottom-8 font-mono text-[0.65rem] text-neon-green opacity-50 md:text-xs">
        press any key to skip{" "}
      </p>
    </div>
  );
};
