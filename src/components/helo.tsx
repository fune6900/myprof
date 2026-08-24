import { SocialLinks } from "../ui-component/SocialLinks/SocialLinks";
import fune from "../assets/fune.png";
import { FaChevronDown } from "react-icons/fa";

type HeloProps = {
  /** 次のセクションへ進む。アンカーの既定動作は使わない */
  onAdvance: () => void;
};

export const Helo = ({ onAdvance }: HeloProps) => {
  return (
    <section
      id="hero"
      className="relative flex h-full w-full flex-col items-center justify-center bg-cyber-black px-4 text-center"
    >
      <div>
        <img
          data-anim="title"
          src={fune}
          alt="Riku Funagayama Icon"
          className="mx-auto mb-4 h-24 w-24 rounded-full border-neon border-neon-green md:h-32 md:w-32"
        />

        <h1
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
        href="#profile"
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
