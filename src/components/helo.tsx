import { useEffect, useRef } from "react";
import { animate, scrambleText } from "animejs";
import { SocialLinks } from "../ui-component/SocialLinks/SocialLinks";
import fune from "../assets/fune.png";
import { FaChevronDown } from "react-icons/fa";

type HeloProps = {
  /** 次のセクションへ進む。アンカーの既定動作は使わない */
  onAdvance: () => void;
};

export const Helo = ({ onAdvance }: HeloProps) => {
  const name = useRef<HTMLHeadingElement>(null);

  /* 名前をスクランブルから組み上げる。動きを減らす設定なら何もしない */
  useEffect(() => {
    const el = name.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animation = animate(el, {
      textContent: scrambleText({ chars: "A-Za-z0-9!%#_", revealRate: 14 }),
      duration: 2600,
      delay: 400,
      ease: "linear",
    });

    return () => {
      animation.revert();
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative flex min-h-dvh w-full flex-col items-center justify-center px-4 text-center md:h-full md:min-h-0"
    >
      <div>
        <img
          data-anim="title"
          src={fune}
          alt="Riku Funagayama Icon"
          className="mx-auto mb-4 h-24 w-24 rounded-full border-neon border-neon-green md:h-32 md:w-32"
        />

        <h1
          ref={name}
          data-anim="title"
          className="neon-glow-soft text-3xl font-bold text-neon-white md:text-4xl lg:text-5xl"
        >
          Riku Funagayama
        </h1>

        <p data-anim="item" className="mt-3 text-xl text-neon-green md:mt-4 md:text-3xl">
          Stand Out Fit In !!
        </p>

        <div data-anim="item" className="mt-4 md:mt-6">
          <SocialLinks />
        </div>
      </div>

      {/* 下スクロールテキスト */}
      <p className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs text-neon-white md:text-sm">
        Scroll Down
      </p>

      {/* 次セクションへ。hash によるブラウザ既定のスクロールは打ち消す */}
      <a
        href="#about"
        onClick={(event) => {
          event.preventDefault();
          onAdvance();
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-neon-green transition duration-300 hover:text-neon-white"
        aria-label="Go to next section"
      >
        <FaChevronDown className="text-3xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)] md:text-4xl" />
      </a>
    </section>
  );
};
