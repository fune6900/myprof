import { DiRuby } from "react-icons/di";
import { SiTypescript, SiRubyonrails } from "react-icons/si";
import { FaHtml5, FaCss3Alt, FaReact, FaPhp, FaLaravel, FaDocker } from "react-icons/fa";
import { TbBrandNextjs } from "react-icons/tb";
import { RiSupabaseFill } from "react-icons/ri";
import { BiLogoPostgresql } from "react-icons/bi";
import { motion } from "framer-motion";

export const Skill = () => {
  return (
    <section className="py-16 text-center border-neon- border-neon-green mx-auto px-4">
      {/* 見出し */}
      {/* 言語 */}
      <motion.div
        className="mt-10 text-left"
        initial={{ opacity: 0, x: -80 }} // ← 左から出てくる
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }} // 一度だけ再生
      >
        <h3 className="mb-2 text-3xl text-neon-white">言語</h3>

        <motion.div
          className="flex flex-wrap gap-4 p-4 border-4 border-neon border-neon-green rounded-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {[
            { icon: <DiRuby />, label: "Ruby" },
            { icon: <FaPhp />, label: "PHP" },
            { icon: <SiTypescript />, label: "TypeScript" },
            { icon: <FaHtml5 />, label: "HTML" },
            { icon: <FaCss3Alt />, label: "CSS" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1, // 順番にスライド
                ease: "easeOut",
              }}
              whileHover={{ x: 6, scale: 1.03 }} // ホバーで少し右に浮く
            >
              <div className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]">
                {item.icon}
              </div>
              <p className="text-xl text-neon-white">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* フレームワーク・ライブラリ */}
      <motion.div
        className="mt-10 text-left"
        initial={{ opacity: 0, x: -80 }} // ← 左からスライドイン
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }} // 一度だけ発火
      >
        <h3 className="mb-2 text-3xl text-neon-white">フレームワーク・ライブラリ</h3>

        <motion.div
          className="flex flex-wrap gap-4 p-4 border-4 border-neon border-neon-green rounded-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {[
            { icon: <SiRubyonrails />, label: "Ruby on Rails" },
            { icon: <FaLaravel />, label: "Laravel" },
            { icon: <FaReact />, label: "React" },
            { icon: <TbBrandNextjs />, label: "Next.js" },
            { icon: <RiSupabaseFill />, label: "Supabase" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1, // 順番にふわっと出現
                ease: "easeOut",
              }}
              whileHover={{ x: 6, scale: 1.03 }} // ホバー時に少し動く
            >
              <div className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]">
                {item.icon}
              </div>
              <p className="text-xl text-neon-white">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* その他 */}
      <motion.div
        className="mt-10 mb-16 text-left"
        initial={{ opacity: 0, x: -80 }} // 同じ左スライド演出
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <h3 className="mb-2 text-3xl text-neon-white">その他</h3>

        <motion.div
          className="flex flex-wrap gap-4 p-4 border-4 border-neon border-neon-green rounded-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {[
            { icon: <FaDocker />, label: "Docker" },
            { icon: <BiLogoPostgresql />, label: "PostgreSQL" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-3 p-3 w-full sm:w-1/2 lg:w-1/3"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{ x: 6, scale: 1.03 }}
            >
              <div className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]">
                {item.icon}
              </div>
              <p className="text-xl text-neon-white">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
