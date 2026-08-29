import { useRef, type CSSProperties, type PointerEvent } from "react";
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

/** 傾きの上限 (deg) */
const MAX_TILT = 17;
/** 影をずらす量の上限 (px) */
const MAX_SHADOW = 26;

/** 静止時の角度。左右の列で内側を向かせて、置かれている感じを出す */
const restingAngles = (column: number) => ({
  rx: 7,
  ry: column === 0 ? 13 : -13,
});

type GroupProps = StackGroup & { column: number };

const Group = ({ index, title, items, column }: GroupProps) => {
  const card = useRef<HTMLDivElement>(null);
  const rest0 = restingAngles(column);

  /** カード上のカーソル位置を傾きに変える。中心が 0、端で最大 */
  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    const el = card.current;
    if (!el) return;
    // 指では傾けない。スクロール中に触れて傾いたまま残るのを避ける
    if (event.pointerType !== "mouse") return;

    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    el.dataset.tilting = "true";
    el.style.setProperty("--rx", `${-y * MAX_TILT * 2}deg`);
    el.style.setProperty("--ry", `${x * MAX_TILT * 2}deg`);
    el.style.setProperty("--lift", "26px");
    el.style.setProperty("--sx", `${x * MAX_SHADOW * 2}px`);
    el.style.setProperty("--sy", `${y * MAX_SHADOW * 2}px`);
    // 光沢の位置。カード内の相対位置をそのまま渡す
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };

  const rest = () => {
    const el = card.current;
    if (!el) return;
    el.dataset.tilting = "false";
    // 真正面には戻さない。厚みが見える角度が既定の姿勢
    el.style.setProperty("--rx", `${rest0.rx}deg`);
    el.style.setProperty("--ry", `${rest0.ry}deg`);
    el.style.setProperty("--lift", "12px");
    el.style.setProperty("--sx", "8px");
    el.style.setProperty("--sy", "-6px");
  };

  return (
    <div className="text-left">
      <h3
        data-anim="item"
        className="mb-1.5 flex items-baseline gap-2 text-sm tracking-widest text-neon-white md:text-base"
      >
        <span className="text-neon-green opacity-60">{index}</span>
        {title}
      </h3>

      <div
        ref={card}
        onPointerMove={tilt}
        onPointerLeave={rest}
        style={
          {
            "--rest-rx": `${rest0.rx}deg`,
            "--rest-ry": `${rest0.ry}deg`,
          } as CSSProperties
        }
        className="stack-card rounded-lg border-neon border-neon-green bg-cyber-black p-3"
      >
        {/* 傾きに合わせて動く光沢 */}
        <span aria-hidden="true" className="stack-card-sheen" />

        <div className="stack-card-lift flex flex-wrap gap-x-4 gap-y-1">
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
        <div className="stack-scene grid w-full max-w-5xl gap-4 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-6">
          {GROUPS.map((group, i) => (
            <div
              key={group.title}
              // 右の列だけ少し下げる。漂いが transform を使うので margin で付ける
              className="stack-float lg:[margin-top:var(--step)]"
              style={{ "--step": `${(i % 2) * 2}rem` } as CSSProperties}
            >
              <Group {...group} column={i % 2} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
