import { HiCpuChip } from "react-icons/hi2";
import { DiRuby } from "react-icons/di";
import { SiTypescript, SiRubyonrails } from "react-icons/si";
import { FaHtml5, FaCss3Alt, FaReact, FaPhp, FaLaravel, FaDocker } from "react-icons/fa";
import { TbBrandNextjs } from "react-icons/tb";
import { RiSupabaseFill } from "react-icons/ri";
import { BiLogoPostgresql } from "react-icons/bi";

export const Skill = () => {
  return (
    <section className="py-16 text-center border-neon- border-neon-green mx-auto px-4">
      {/* 見出し */}
      <div className="relative mb-10">
        <h3 className="z-10 absolute -top-4 left-0 right-0 w-full text-2xl font-bold flex items-center justify-center">
          <span className="flex items-center justify-center gap-3 tracking-widest text-neon-green uppercase italic w-fit font-bold px-5 py-1 border-neon rounded-full bg-cyber-black neon-glow-soft">
            SKILL
            <HiCpuChip className="text-3xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
          </span>
        </h3>
        <div className="border-neon-b border-neon-green mt-6" />
      </div>

      {/* 言語 */}
      <div className="mt-25 text-left">
        <h3 className="mb-2 text-3xl text-neon-white">言語</h3>
        <div className="flex flex-wrap gap-4 p-4 border-4 border-neon border-neon-green rounded-lg">
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <DiRuby className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">Ruby</p>
          </div>
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <FaPhp className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">PHP</p>
          </div>
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <SiTypescript className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">TypeScript</p>
          </div>
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <FaHtml5 className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">HTML</p>
          </div>
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <FaCss3Alt className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">CSS</p>
          </div>
        </div>
      </div>

      {/* フレームワーク・ライブラリ */}
      <div className="mt-10 text-left">
        <h3 className="mb-2 text-3xl text-neon-white">フレームワーク・ライブラリ</h3>
        <div className="flex flex-wrap gap-4 p-4 border-4 border-neon border-neon-green rounded-lg">
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <SiRubyonrails className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">Ruby on Rails</p>
          </div>
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <FaLaravel className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">Laravel</p>
          </div>
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <FaReact className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">React</p>
          </div>
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <TbBrandNextjs className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">Next.js</p>
          </div>
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <RiSupabaseFill className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">Supabase</p>
          </div>
        </div>
      </div>

      {/* その他 */}
      <div className="mt-10 mb-16 text-left">
        <h3 className="mb-2 text-3xl text-neon-white">その他</h3>
        <div className="flex flex-wrap gap-4 p-4 border-4 border-neon border-neon-green rounded-lg">
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <FaDocker className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">Docker</p>
          </div>
          <div className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3">
            <BiLogoPostgresql className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
            <p className="text-xl">PostgreSQL</p>
          </div>
        </div>
      </div>
    </section>
  );
};
