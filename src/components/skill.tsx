import type { IconType } from "react-icons";
import { DiRuby } from "react-icons/di";
import { SiTypescript, SiRubyonrails } from "react-icons/si";
import { FaHtml5, FaCss3Alt, FaReact, FaPhp, FaLaravel, FaDocker, FaCode } from "react-icons/fa";
import { TbBrandNextjs } from "react-icons/tb";
import { RiSupabaseFill } from "react-icons/ri";
import { BiLogoPostgresql } from "react-icons/bi";
import { SectionHeading } from "./SectionHeading";

type SkillItem = {
  icon: IconType;
  label: string;
};

type SkillGroupProps = {
  title: string;
  items: SkillItem[];
  /** 斜めの構図をつくるための段差 (rem) */
  offset: number;
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

const SkillGroup = ({ title, items, offset }: SkillGroupProps) => {
  return (
    <div
      className="text-left md:[transform:translateX(var(--offset))]"
      style={{ "--offset": `${offset}rem` } as React.CSSProperties}
    >
      <h3 data-anim="item" className="mb-1 text-lg text-neon-white md:text-2xl">
        {title}
      </h3>

      <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg border-neon border-neon-green p-3">
        {items.map((item) => (
          <div
            key={item.label}
            data-anim="item"
            className="flex w-full items-center gap-2 p-1 sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]"
          >
            <div className="text-2xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)] md:text-3xl">
              <item.icon />
            </div>
            <p className="text-base text-neon-white md:text-lg">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Skill = () => {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="flex h-full w-full flex-col px-4 py-10 md:px-10"
    >
      <SectionHeading id="skills-heading" title="Skills" icon={FaCode} />

      <div className="flex min-h-0 flex-1 items-center justify-center">
        {/* 3 グループを右下がりに配置して斜めの流れをつくる */}
        <div className="flex w-full max-w-4xl flex-col gap-4">
          <SkillGroup title="言語" items={LANGUAGES} offset={0} />
          <SkillGroup title="フレームワーク・ライブラリ" items={FRAMEWORKS} offset={3} />
          <SkillGroup title="その他" items={OTHERS} offset={6} />
        </div>
      </div>
    </section>
  );
};
