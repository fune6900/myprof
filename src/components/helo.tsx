import { useEffect, useRef } from "react";
import { animate, scrambleText } from "animejs";
import { SocialLinks } from "../ui-component/SocialLinks/SocialLinks";
import fune from "../assets/fune6900.png";
import { FaChevronDown } from "react-icons/fa";
import { onBootDone } from "../lib/boot";

type HeloProps = {
  /** 次のセクションへ進む。アンカーの既定動作は使わない */
  onAdvance: () => void;
};

export const Helo = ({ onAdvance }: HeloProps) => {
  const name = useRef<HTMLHeadingElement>(null);

  /*
   * 名前をスクランブルから組み上げる。動きを減らす設定なら何もしない。
   * オープニングの裏で終わってしまわないよう、明けてから始める。
   */
  useEffect(() => {
    const el = name.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let animation: ReturnType<typeof animate> | null = null;

    const unsubscribe = onBootDone(() => {
      animation = animate(el, {
        textContent: scrambleText({ chars: "A-Za-z0-9!%#_", revealRate: 14 }),
        duration: 2600,
        delay: 400,
        ease: "linear",
      });
    });

    return () => {
      unsubscribe();
      animation?.revert();
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative flex min-h-dvh w-full flex-col items-center justify-center px-4 text-center md:h-full md:min-h-0"
    >
      <div>
        {/*
          アバターは「アイデンティティ・ディスク」に見立てた円盤。
          触ると裏返り、裏には同心円のリングと識別名が入っている。

          data-anim="title" は anime.js がセクションの立ち上がりで
          transform を触るので、外側の箱に付けたまま残す。
          回転はその内側で行い、2 つの transform がぶつからないようにする。
        */}
        <div
          data-anim="title"
          className="disc-scene mx-auto mb-4 h-24 w-24 md:h-32 md:w-32"
        >
          <div className="disc-coin">
            <img
              src={fune}
              alt="Riku Funagayama Icon"
              className="disc-face disc-front keep-round rounded-full border-neon border-neon-green"
            />

            {/* 裏面。表と同じ大きさの円盤に、リングと識別名を刻む */}
            <div
              aria-hidden="true"
              className="disc-face disc-back keep-round rounded-full border-neon border-neon-green"
            >
              <span className="disc-rings" />
              <span className="disc-tag">FUNE6900</span>
            </div>
          </div>
        </div>

        <h1
          ref={name}
          data-anim="title"
          className="neon-glow-soft text-3xl font-bold text-neon-white md:text-4xl lg:text-5xl"
        >
          Riku Funagayama
        </h1>

        {/*
          地平線の光の帯とちょうど重なる高さにあるので、オレンジだと沈む。
          パレットのもう一方（純白）で抜く。
        */}
        <p data-anim="item" className="mt-3 text-xl text-neon-white md:mt-4 md:text-3xl">
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
        className="text-neon-green-all absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce transition duration-300"
        aria-label="Go to next section"
      >
        <FaChevronDown className="text-3xl drop-shadow-[0_0_10px_rgba(255,85,0,0.85)] md:text-4xl" />
      </a>
    </section>
  );
};
