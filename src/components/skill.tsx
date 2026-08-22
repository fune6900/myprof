import type { IconType } from "react-icons";
import { DiRuby } from "react-icons/di";
import { SiTypescript, SiRubyonrails } from "react-icons/si";
import { FaHtml5, FaCss3Alt, FaReact, FaPhp, FaLaravel, FaDocker } from "react-icons/fa";
import { TbBrandNextjs } from "react-icons/tb";
import { RiSupabaseFill } from "react-icons/ri";
import { BiLogoPostgresql } from "react-icons/bi";
import { motion } from "framer-motion";

type SkillItem = {
  icon: IconType;
  label: string;
};

type SkillGroupProps = {
  title: string;
  items: SkillItem[];
  className?: string;
};

const LANGUAGES: SkillItem[] = [
  { icon: DiRuby, label: "Ruby" },
  { icon: FaPhp, label: "PHP" },
  { icon: SiTypescript, label: "TypeScript" },
  { icon: FaHtml5, label: "HTML" },
  { icon: FaCss3Alt, label: "CSS" },
];

const FRAMEWORKS: SkillItem[] = [
  { icon: SiRubyonrails, label: "Ruby on Rails" },
  { icon: FaLaravel, label: "Laravel" },
  { icon: FaReact, label: "React" },
  { icon: TbBrandNextjs, label: "Next.js" },
  { icon: RiSupabaseFill, label: "Supabase" },
];

const OTHERS: SkillItem[] = [
  { icon: FaDocker, label: "Docker" },
  { icon: BiLogoPostgresql, label: "PostgreSQL" },
];

const SkillGroup = ({ title, items, className = "" }: SkillGroupProps) => {
  return (
    <motion.div
      className={`mt-10 text-left ${className}`}
      initial={{ opacity: 0, x: -80 }} // ← 左から出てくる
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }} // 一度だけ再生
    >
      <h3 className="mb-2 text-3xl text-neon-white">{title}</h3>

      <motion.div
        className="flex flex-wrap gap-4 p-4 border-neon border-neon-green rounded-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        {items.map((item, index) => (
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
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ x: 6, scale: 1.03 }} // ホバーで少し右に浮く
          >
            <div className="text-4xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]">
              <item.icon />
            </div>
            <p className="text-xl text-neon-white">{item.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export const Skill = () => {
  return (
    <section className="py-16 text-center border-neon-green mx-auto px-4">
      <SkillGroup title="言語" items={LANGUAGES} />
      <SkillGroup title="フレームワーク・ライブラリ" items={FRAMEWORKS} />
      <SkillGroup title="その他" items={OTHERS} className="mb-16" />
    </section>
  );
};
