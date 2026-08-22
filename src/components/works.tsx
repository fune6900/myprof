import { FaRocket } from "react-icons/fa";
import { motion } from "framer-motion";
import animeguru from "../assets/animeguru.png";
import profile from "../assets/fune's_prpfile.png";

type Work = {
  title: string;
  link: string;
  img: string;
  desc: string;
  badges: string[];
};

const WORKS: Work[] = [
  {
    title: "アニめぐる",
    link: "https://animeguru.jp/",
    img: animeguru,
    desc: "あなたの足で紡ぐ、作品と現実の交差点。アニめぐるは、アニメファン向けの聖地巡礼情報共有プラットフォームです。聖地巡礼の思い出を聖地メモとして共有しよう。",
    badges: ["Ruby", "Ruby on Rails", "Tailwind CSS", "Render", "Hotwire", "S3"],
  },
  {
    title: "fune's Profile",
    link: "https://fune6900.github.io/myprof/",
    img: profile,
    desc: "個人サイトです。自身のプロフィールやスキル、ポートフォリオを紹介しています。今後も更新を続け、成長の軌跡を記録していきます。",
    badges: ["TypeScript", "React", "Tailwind CSS", "Github Pages", "Vite"],
  },
];

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
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, x: 100 }} // ← 右からスライドイン
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }} // 一度だけ再生
      >
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 justify-items-center mt-25 w-full"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {WORKS.map((item, index) => (
            <motion.div
              key={item.title}
              className="bg-cyber-black w-full max-w-[500px] p-4 border-neon border-neon-green rounded-lg text-left transition-all duration-300"
              initial={{ opacity: 0, x: 80 }} // ← 各カードも右から
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.2, // 順にスライド表示
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.05, y: -4 }} // ホバーで浮かぶ
              viewport={{ once: true, amount: 0.3 }}
            >
              <a
                href={item.link}
                aria-label={item.title}
                className="block"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={item.img} alt={`${item.title} トップページ`} className="rounded-lg w-full h-auto" />
                <h4 className="mt-4 text-2xl font-bold text-neon-white">{item.title}</h4>
                <p className="mt-2 text-neon-green break-words">{item.link}</p>
                <p className="mt-2 text-neon-white">{item.desc}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.badges.map((badge) => (
                    <span key={badge} className="badge">
                      {badge}
                    </span>
                  ))}
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      <div className="border-neon-b border-neon-green mt-20" />
      <p className="text-center py-8">© Riku Funagayama, All Rights Reserved.</p>
    </section>
  );
};
