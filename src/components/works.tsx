import { FaRocket } from "react-icons/fa";
import { SectionHeading } from "./SectionHeading";
import animeguru from "../assets/animeguru.png";
import profile from "../assets/fune's_prpfile.png";
import aniflix from "../assets/aniflix.png";
import dig from "../assets/dig.png";
import funeGallery from "../assets/fune-gallery.png";

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
    desc: "あなたの足で紡ぐ、作品と現実の交差点。アニメファン向けの聖地巡礼情報共有プラットフォームです。",
    badges: ["Ruby on Rails", "Tailwind CSS", "Hotwire", "S3"],
  },
  {
    title: "ANIFLIX",
    link: "https://aniflex-zeta.vercel.app/",
    img: aniflix,
    desc: "NetflixのUI/UXを模倣したアニメ・声優発見プラットフォーム。TMDb API で今期人気・トレンドを日本語で探せます。",
    badges: ["Next.js", "TypeScript", "TMDb API", "Docker"],
  },
  {
    title: "DIG",
    link: "https://d-i-g.vercel.app/",
    img: dig,
    desc: "AI 分析でスタイルを記録・振り返るコーデ日記アプリ。毎日の一着を、未来の自分のために残す。",
    badges: ["Next.js", "Prisma", "Supabase", "Gemini"],
  },
  {
    title: "Fune6900’s Gallery",
    link: "https://fune6900-gallery.vercel.app/",
    img: funeGallery,
    desc: "イラスト作品を保管・公開するギャラリーサイト。旧WordPressテーマを Next.js で再構築した作品アーカイブ。",
    badges: ["Next.js", "Supabase", "Cloudflare R2", "Vercel"],
  },
  {
    title: "fune's Profile",
    link: "https://fune6900.github.io/myprof/",
    img: profile,
    desc: "この個人サイト。プロフィールやスキル、ポートフォリオを紹介しています。",
    badges: ["TypeScript", "React", "anime.js", "Vite"],
  },
];

export const Works = () => {
  return (
    <section
      id="works"
      aria-labelledby="works-heading"
      className="flex h-full w-full flex-col px-3 py-6 md:px-10 md:py-10"
    >
      <SectionHeading id="works-heading" title="Works" icon={FaRocket} />

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <ul className="grid w-full max-w-6xl grid-cols-2 gap-2.5 md:gap-4 lg:grid-cols-3">
          {WORKS.map((item, index) => (
            <li
              key={item.title}
              data-anim="item"
              // 列ごとに少しずつ下げて斜めの流れをつくる
              className="lg:[margin-top:var(--step)]"
              style={{ "--step": `${(index % 3) * 1.25}rem` } as React.CSSProperties}
            >
              <a
                href={item.link}
                className="group block h-full rounded-lg border-neon border-neon-green bg-cyber-black p-2 text-left transition-transform duration-300 hover:scale-[1.03] md:p-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={item.img}
                  alt={`${item.title} トップページ`}
                  loading="lazy"
                  className="aspect-video w-full rounded object-cover object-top"
                />
                <h3 className="mt-1.5 text-sm font-bold text-neon-white md:mt-2 md:text-lg">{item.title}</h3>
                <p className="mt-1 hidden line-clamp-2 text-xs text-neon-white md:block">{item.desc}</p>

                <div className="mt-1.5 flex flex-wrap gap-1 md:mt-2">
                  {item.badges.map((badge) => (
                    <span key={badge} className="badge">
                      {badge}
                    </span>
                  ))}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="shrink-0 pt-3 text-center text-[0.65rem] text-neon-white md:pt-4 md:text-xs">
        © Riku Funagayama, All Rights Reserved.
      </p>
    </section>
  );
};
