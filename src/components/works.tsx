import { FaRocket } from "react-icons/fa";
import animeguru from "../assets/animeguru.png";
import profile from "../assets/fune's_prpfile.png"; 

export const Works = () => {
  return (
    <section className="pt-16 text-center border-neon-green mx-auto px-4">
      {/* タイトル */}
      <div className="relative mb-10">
        <h3 className="absolute -top-4 left-0 right-0 w-full text-2xl font-bold flex items-center justify-center z-10">
          <span className="flex items-center justify-center gap-3 tracking-widest text-neon-green uppercase italic w-fit font-bold px-5 py-1 border-neon rounded-full bg-cyber-black neon-glow-soft">
            Works
            <FaRocket className="text-3xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
          </span>
        </h3>
        <div className="border-neon-b border-neon-green mt-6" />
      </div>

      {/* カードたち */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 justify-items-center mt-25 w-full">
          {/* --- アニめぐる --- */}
          <div className="bg-cyber-black hover:bg-cyber-black hover:border-neon w-full max-w-[500px] p-4 border-neon border-neon-green rounded-lg text-left hover:scale-105 transition-all duration-300">
            <a
              href="https://animeguru.jp/"
              aria-label="animeguru"
              className="block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={animeguru}
                alt="アニめぐる トップページ"
                className="rounded-lg w-full h-auto"
              />
              <h4 className="mt-4 text-2xl font-bold text-neon-white">
                アニめぐる
              </h4>
              <p className="mt-2 text-neon-green break-words">
                https://animeguru.jp/
              </p>
              <p className="mt-2 text-neon-white">
                あなたの足で紡ぐ、作品と現実の交差点。アニめぐるは、アニメファン向けの聖地巡礼情報共有プラットフォームです。聖地巡礼の思い出を聖地メモとして共有しよう。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="badge">Ruby</span>
                <span className="badge">Ruby on Rails</span>
                <span className="badge">Tailwind CSS</span>
                <span className="badge">Render</span>
                <span className="badge">Hotwire</span>
                <span className="badge">S3</span>
              </div>
            </a>
            
          </div>

          {/* --- fune's Profile --- */}
          <div className="bg-cyber-black hover:bg-cyber-black hover:border-neon w-full max-w-[500px] p-4 border-neon border-neon-green rounded-lg text-left hover:scale-105 transition-all duration-300">
            <a
              href="https://fune6900.github.io/myprof/"
              aria-label="fune profile site"
              className="block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={profile}
                alt="fune's Profile サイトキャプチャ"
                className="rounded-lg w-full h-auto"
              />
              <h4 className="mt-4 text-2xl font-bold text-neon-white">
                fune&apos;s Profile
              </h4>
              <p className="mt-2 text-neon-green break-words">
                https://fune6900.github.io/myprof/
              </p>
              <p className="mt-2 text-neon-white">
                個人サイトです。自身のプロフィールやスキル、ポートフォリオを紹介しています。今後も更新を続け、成長の軌跡を記録していきます。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="badge">TypeScript</span>
                <span className="badge">React</span>
                <span className="badge">Tailwind CSS</span>
                <span className="badge">Github Pages</span>
                <span className="badge">Vite</span>
              </div>
            </a>
            
          </div>
        </div>
      </div>
      <div className="border-neon-b border-neon-green mt-20"></div>
      <p className="text-center py-8">© Riku Funagayama, All Rights Reserved.</p>
    </section>
  );
};
