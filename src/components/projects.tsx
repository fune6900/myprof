import { useMemo, useState } from "react";
import { FaRocket, FaGithub, FaExternalLinkAlt, FaBan } from "react-icons/fa";
import { SectionHeading } from "./SectionHeading";
import { HeroCarousel, type HeroCarouselItem } from "./ui/hero-carousel";
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
 * カルーセルの背景に被せる色。
 *
 * この色は写真の輝度を保ったまま色相を乗せる（color）うえに、
 * さらに 55% で multiply される。作品のスクリーンショットは
 * 明るい図版が多いので、鮮やかなオレンジをそのまま渡すと
 * 背景が主役になって本文も作品も読めなくなる。
 * 同系のまま暗い側を選び、あくまで背景に留める。
 */
const ACCENTS = ["#8a3000", "#a34400", "#732600", "#b85200", "#5c1d00"];

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
    desc: "NetflixのUI/UXを模倣したアニメ・声優発見プラットフォーム。",
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
    title: "Fune6900’s Gallery",
    link: "https://fune6900-gallery.vercel.app/",
    repo: "https://github.com/fune6900/fune6900-gallery",
    img: funeGallery,
    desc: "自身のイラスト作品を保管・公開するギャラリーサイト。",
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
  /*
   * 焦点の当たっている作品。カルーセル本体は上流のまま触っていないので、
   * 外側で index を受け取って導線（公開先 / リポジトリ）をこちらで出す。
   */
  const [index, setIndex] = useState(0);

  /*
   * 作品データをカルーセルの形に写す。
   *
   * accent は背景の色被せに使われる。サイト全体がオレンジ 1 色なので、
   * 同系の中で振り幅だけ持たせて、切り替わりが分かる程度に留める。
   */
  const slides = useMemo<HeroCarouselItem[]>(
    () =>
      PROJECTS.map((work, i) => ({
        id: work.title,
        title: work.title,
        image: work.img,
        // サイト名の下は常に説明文。停止中の告知は導線側で出す
        credit: work.desc,
        meta: work.badges.slice(0, 3),
        accent: ACCENTS[i % ACCENTS.length],
      })),
    [],
  );

  const current = PROJECTS[index] ?? PROJECTS[0];

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      data-anim-from="top-right"
      className="relative flex min-h-dvh w-full flex-col overflow-hidden px-3 pb-6 pt-20 md:h-full md:min-h-0 md:px-10 md:pb-8 md:pt-24"
    >
      <SectionHeading id="projects-heading" title="Projects" icon={FaRocket} />

      {/*
        カルーセルは自前で全面を使う作りなので、見出しの下の余りを
        そのまま渡す。min-h-0 を挟まないと flex の子が縮まずに溢れる。
      */}
      {/*
        カルーセルは自前で全面を使う作りなので、見出しの下の余りを渡す。
        スマホは縦に詰まって箱が潰れるため、最低の高さを持たせる。
      */}
      <div
        data-anim="item"
        className="relative mt-4 min-h-[26rem] flex-1 md:mt-6 md:min-h-0"
      >
        {/* brand は出さない。セクション見出しと二重になるため */}
        <HeroCarousel
          items={slides}
          autoplay
          autoplayDelay={5000}
          onIndexChange={setIndex}
          /*
            absolute inset-0 で親いっぱいに広げる。
            コンポーネントは h-full で伸びる想定だが、親が flex で
            高さを決めているとこの割合が解決されず、min-h-[24rem] の
            384px で止まってしまう（スマホで下に余白が出ていた）。
          */
          className="absolute inset-0 border-neon border-neon-green bg-cyber-black"
        />
      </div>

      {/*
        公開先とリポジトリへの導線。
        VISIT / SOURCE だけでは初見で何が起きるか判らないので、
        行き先（サービス名・GitHub）と「別タブで開く」ことまで文言に出す。
      */}
      <div
        data-anim="item"
        className="mt-3 flex shrink-0 flex-col items-center justify-center gap-2 md:mt-4 md:flex-row md:gap-4"
      >
        {/*
          公開が止まっている作品はリンクにしない。
          押せる見た目のまま飛ばせないほうが分かりにくいので、
          要素ごと span に変えて「開けない」ことを文言で示す。
        */}
        {current.note ? (
          <span
            className="flex w-full max-w-xs cursor-not-allowed items-center justify-center gap-2 border-neon border-neon-green px-4 py-2 text-xs text-neon-white opacity-45 md:w-auto md:max-w-none md:text-sm"
          >
            <FaBan aria-hidden="true" className="shrink-0" />
            {/* JSX の改行が空白になるので 1 行で組む */}
            <span>{`${current.title}は${current.note}`}</span>
          </span>
        ) : (
          <a
            href={current.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full max-w-xs items-center justify-center gap-2 border-neon border-neon-green px-4 py-2 text-xs text-neon-green transition duration-300 hover:scale-[1.03] md:w-auto md:max-w-none md:text-sm"
          >
            <FaExternalLinkAlt aria-hidden="true" className="shrink-0" />
            <span>{current.title} を開く</span>
          </a>
        )}

        <a
          href={current.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full max-w-xs items-center justify-center gap-2 border-neon border-neon-green px-4 py-2 text-xs text-neon-white transition duration-300 hover:scale-[1.03] md:w-auto md:max-w-none md:text-sm"
        >
          <FaGithub aria-hidden="true" className="shrink-0" />
          <span>GitHub でソースを見る</span>
        </a>
      </div>
    </section>
  );
};
