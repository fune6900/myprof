import type { IconType } from "react-icons";
import { DiRuby } from "react-icons/di";
import {
  SiTypescript,
  SiRubyonrails,
  SiJavascript,
  SiTailwindcss,
  SiBootstrap,
  SiMysql,
} from "react-icons/si";
import {
  FaHtml5,
  FaCss3Alt,
  FaReact,
  FaPhp,
  FaLaravel,
  FaDocker,
  FaGithub,
  FaCode,
} from "react-icons/fa";
import { TbBrandNextjs } from "react-icons/tb";
import { RiSupabaseFill } from "react-icons/ri";
import { BiLogoPostgresql } from "react-icons/bi";
import { SectionHeading } from "./SectionHeading";

type StackItem = {
  icon: IconType;
  label: string;
};

type StackGroup = {
  /** 見出しの通し番号 */
  index: string;
  title: string;
  items: StackItem[];
};

/*
 * 4 つの領域に分けて並べる。
 * 分類の基準は「どこで使う技術か」で、言語かフレームワークかでは分けない。
 * 例えば TypeScript は言語だが使い所は画面側なので FRONTEND に置く。
 */
const GROUPS: StackGroup[] = [
  {
    index: "01",
    title: "FRONTEND TECHNOLOGIES",
    items: [
      { icon: SiTypescript, label: "TypeScript" },
      { icon: SiJavascript, label: "JavaScript" },
      { icon: FaReact, label: "React" },
      { icon: TbBrandNextjs, label: "Next.js" },
      { icon: FaHtml5, label: "HTML" },
      { icon: FaCss3Alt, label: "CSS" },
      { icon: SiTailwindcss, label: "Tailwind CSS" },
      { icon: SiBootstrap, label: "Bootstrap" },
    ],
  },
  {
    index: "02",
    title: "BACKEND TECHNOLOGIES",
    items: [
      { icon: DiRuby, label: "Ruby" },
      { icon: SiRubyonrails, label: "Ruby on Rails" },
      { icon: FaPhp, label: "PHP" },
      { icon: FaLaravel, label: "Laravel" },
    ],
  },
  {
    index: "03",
    title: "DATABASES & ORMS",
    items: [
      { icon: BiLogoPostgresql, label: "PostgreSQL" },
      { icon: SiMysql, label: "MySQL" },
      { icon: RiSupabaseFill, label: "Supabase" },
    ],
  },
  {
    index: "04",
    title: "TOOLS & INFRASTRUCTURE",
    items: [
      { icon: FaDocker, label: "Docker" },
      { icon: FaGithub, label: "GitHub" },
    ],
  },
];

const Group = ({ index, title, items }: StackGroup) => {
  return (
    <div className="text-left">
      <h3
        data-anim="item"
        className="mb-1.5 flex items-baseline gap-2 text-sm tracking-widest text-neon-white md:text-base"
      >
        <span className="text-neon-green opacity-60">{index}</span>
        {title}
      </h3>

      <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg border-neon border-neon-green p-3">
        {items.map((item) => (
          <div
            key={item.label}
            data-anim="item"
            className="flex w-full items-center gap-2 p-1 sm:w-[calc(50%-0.5rem)]"
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

export const Stack = () => {
  return (
    <section
      id="stack"
      aria-labelledby="stack-heading"
      className="flex min-h-dvh w-full flex-col px-4 pb-10 pt-20 md:h-full md:min-h-0 md:px-10 md:py-10"
    >
      <SectionHeading id="stack-heading" title="Stack" icon={FaCode} />

      <div className="flex min-h-0 flex-1 items-center justify-center">
        {/* 4 グループ。広い画面は 2 列に組み、1 列ずつ下げて斜めの流れをつくる */}
        <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-6">
          {GROUPS.map((group, i) => (
            <div
              key={group.title}
              // 右の列だけ少し下げる
              className="lg:[transform:translateY(var(--step))]"
              style={{ "--step": `${(i % 2) * 2}rem` } as React.CSSProperties}
            >
              <Group {...group} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
