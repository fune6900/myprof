import { useState } from "react";
import { FaRocket, FaGithub } from "react-icons/fa";
import { SectionHeading } from "./SectionHeading";
import animeguru from "../assets/animeguru.png";
import profile from "../assets/fune's_prpfile.png";
import aniflix from "../assets/aniflix.png";
import dig from "../assets/dig.png";
import funeGallery from "../assets/fune-gallery.png";

type Project = {
  title: string;
  link: string;
  /** GitHub リポジトリ。カード右上のアイコンから開く */
  repo: string;
  img: string;
  /**
   * ホバー中に背景で流す操作動画。
   * 未指定なら img をそのまま背景に使う（動画を用意したら差し替える）。
   */
  video?: string;
  desc: string;
  /** 公開が止まっている作品に添える注記 */
  note?: string;
  badges: string[];
};

/*
 * 文言と技術スタックは各リポジトリの README / package.json / Gemfile に合わせている。
 */
const PROJECTS: Project[] = [
  {
    title: "アニめぐる",
    link: "https://animeguru.jp/",
    repo: "https://github.com/fune6900/Animeguru",
    img: animeguru,
    desc: "あなたの足で紡ぐ、作品と現実の交差点。聖地巡礼の思い出を「聖地メモ」として共有するプラットフォーム。",
    note: "サービス停止中",
    badges: ["Ruby on Rails", "PostgreSQL", "Hotwire", "Tailwind CSS", "S3"],
  },
  {
    title: "ANIFLIX",
    link: "https://aniflex-zeta.vercel.app/",
    repo: "https://github.com/fune6900/ANIFLIX",
    img: aniflix,
    desc: "NetflixのUI/UXを模倣したアニメ・声優発見プラットフォーム。TMDb API から日本語UIで探せる。",
    badges: ["Next.js", "React", "TypeScript", "Tailwind CSS", "TMDb API", "Docker"],
  },
  {
    title: "DIG",
    link: "https://d-i-g.vercel.app/",
    repo: "https://github.com/fune6900/DIG",
    img: dig,
    desc: "今日のコーデを掘り起こす、AI コーデ日記アプリ。撮って、読んで、探す。",
    badges: ["Next.js", "TypeScript", "Prisma", "Supabase", "Gemini", "Vitest"],
  },
  {
    title: "fune6900-gallery",
    link: "https://fune6900-gallery.vercel.app/",
    repo: "https://github.com/fune6900/fune6900-gallery",
    img: funeGallery,
    desc: "WordPress から脱却した、自身のイラスト作品を保管・公開するギャラリーサイト。",
    badges: ["Next.js", "TypeScript", "Supabase", "Cloudflare R2", "Vercel"],
  },
  {
    title: "myprof",
    link: "https://fune6900.github.io/myprof/",
    repo: "https://github.com/fune6900/myprof",
    img: profile,
    desc: "この個人サイト。プロフィールやスキル、ポートフォリオを紹介しています。",
    badges: ["TypeScript", "React", "anime.js", "Vite"],
  },
];

export const Projects = () => {
  /* ホバー中のカード。背景に流す映像を決める */
  const [active, setActive] = useState<Project | null>(null);

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      data-anim-from="top-right"
      className="relative flex min-h-dvh w-full flex-col overflow-hidden px-3 pb-6 pt-20 md:h-full md:min-h-0 md:px-10 md:py-8"
    >
      {/*
        ホバー中の作品を背景に大きく流す。
        カードの可読性を保つため暗く落とし、指ではホバーできないので
        hover を持つ環境だけで有効にする。
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden overflow-hidden [@media(hover:hover)]:block"
      >
        {PROJECTS.map((work) => {
          const isActive = active?.title === work.title;
          return work.video ? (
            <video
              key={work.title}
              src={work.video}
              muted
              loop
              playsInline
              // 見えていないものを再生し続けない
              autoPlay={isActive}
              className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ${
                isActive ? "opacity-25" : ""
              }`}
            />
          ) : (
            <img
              key={work.title}
              src={work.img}
              alt=""
              className={`absolute inset-0 h-full w-full scale-105 object-cover opacity-0 blur-[2px] transition-opacity duration-500 ${
                isActive ? "opacity-20" : ""
              }`}
            />
          );
        })}
      </div>

      <SectionHeading id="projects-heading" title="Projects" icon={FaRocket} />

      {/*
        行数を固定したグリッド。1 行の高さが画面から決まるので、
        画面が低くても見出しへせり上がって重なることがない。
      */}
      {/*
        狭い画面は 1 列。ページ全体が普通にスクロールするので、
        ここで内側にスクロール領域を作る必要はない。
        md 以上は 1 画面に収まる固定グリッド。
      */}
      <ul className="relative mt-5 flex flex-col gap-6 md:mt-7 md:grid md:min-h-0 md:flex-1 md:grid-cols-2 md:grid-rows-3 md:gap-7 lg:grid-cols-3 lg:grid-rows-2 lg:gap-8">
        {PROJECTS.map((item) => (
          <li
            key={item.title}
            data-anim="item"
            className="relative shrink-0 md:min-h-0 md:shrink"
            onMouseEnter={() => setActive(item)}
            onMouseLeave={() => setActive((current) => (current === item ? null : current))}
          >
            <a
              href={item.link}
              onFocus={() => setActive(item)}
              onBlur={() => setActive((current) => (current === item ? null : current))}
              className="spotlight-card relative flex flex-col overflow-hidden rounded-lg border-neon border-neon-green bg-cyber-black/80 p-2 text-left transition-transform duration-300 hover:scale-[1.03] md:h-full md:min-h-0 md:p-3"
              target="_blank"
              rel="noopener noreferrer"
              onMouseMove={(event) => {
                // カーソル位置を CSS 変数に流して ::after の光を動かす
                const rect = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
                event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
              }}
            >
              {/*
                画像だけが伸縮して余りを吸収する。文字側は潰さない。

                object-contain なのは、作品ごとに画像の縦横比が違うため。
                cover にすると枠に合わせて切り取られ、下側が見切れてしまう
                （縦長の myprof は半分以上が切れる）。
              */}
              <img
                src={item.img}
                alt={`${item.title} トップページ`}
                loading="lazy"
                className="aspect-video w-full rounded object-contain md:aspect-auto md:flex-1 md:[min-height:3.5rem]"
              />

              <h3 className="mt-1.5 flex shrink-0 flex-wrap items-baseline gap-x-2 text-sm font-bold text-neon-white md:text-lg">
                {item.title}
                {item.note && (
                  <span className="text-[0.6rem] font-normal text-neon-green md:text-xs">
                    （{item.note}）
                  </span>
                )}
              </h3>

              {/*
                1 列でスクロールできる狭い画面では全文を出す。
                md 以上は 1 画面に収める都合があるので、低い画面では省く。
              */}
              <p className="mt-1 shrink-0 text-[0.65rem] leading-snug text-neon-white md:hidden">
                {item.desc}
              </p>
              <p className="mt-1 hidden shrink-0 text-xs leading-snug text-neon-white md:[@media(min-height:700px)]:line-clamp-2">
                {item.desc}
              </p>

              <div className="badge-row mt-1.5 flex shrink-0 flex-wrap gap-1">
                {item.badges.map((badge) => (
                  <span key={badge} className="badge">
                    {badge}
                  </span>
                ))}
              </div>
            </a>

            {/* リポジトリへの導線。カード全体のリンクとは分ける */}
            <a
              href={item.repo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.title} のリポジトリ`}
              className="absolute right-3 top-3 z-10 text-neon-white transition duration-300 hover:scale-110 hover:text-neon-green md:right-4 md:top-4"
            >
              <FaGithub className="text-base md:text-xl" />
            </a>
          </li>
        ))}
      </ul>

      <p className="shrink-0 pt-3 text-center text-[0.65rem] text-neon-white md:pt-4 md:text-xs">
        © Riku Funagayama, All Rights Reserved.
      </p>
    </section>
  );
};
