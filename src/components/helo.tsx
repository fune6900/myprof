import { SocialLinks } from "../ui-component/SocialLinks/SocialLinks";
import fune from "../assets/fune.png";
import { FaChevronDown } from "react-icons/fa";

export const Helo = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen text-center bg-cyber-black mx-auto px-4">
      <img
        src={fune}
        alt="Riku Funagayama Icon"
        className="mx-auto w-24 h-24 md:w-32 md:h-32 rounded-full mb-4 border-4 border-neon border-neon-green"
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neon-white neon-glow-soft">
        Riku Funagayama
      </h1>

      <h2 className="text-xl md:text-3xl mt-3 md:mt-4 text-neon-green">
        Stand Out Fit In !!
      </h2>

      <div className="mt-4 md:mt-6">
        <SocialLinks />
      </div>

      {/* 下スクロールテキスト */}
      <p className="absolute bottom-20 text-xs md:text-sm text-neon-white">
        Scroll Down
      </p>

      {/* 下スクロールアイコン */}
      <button
        className="absolute bottom-8 animate-bounce text-neon-green hover:text-neon-white transition duration-300"
        aria-label="Scroll to next section"
      >
        <FaChevronDown className="text-3xl md:text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
      </button>
    </section>
  );
};
