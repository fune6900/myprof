import type { ReactNode } from "react";
import { RiUserStarFill } from "react-icons/ri";
import fune from "../assets/fune.png";
import { SectionHeading } from "./SectionHeading";

type InfoEntry = {
  key: string;
  /** 数値はそのまま、文字列は "..." で囲んで出す */
  value: string | number;
};

const PROFILE: InfoEntry[] = [
  { key: "name", value: "Riku Funagayama" },
  { key: "born", value: 2003 },
  { key: "from", value: "宮崎県" },
  { key: "based", value: "東京都" },
  { key: "role", value: "Engineer" },
  { key: "status", value: "都内でエンジニアとして活動中" },
  { key: "contact", value: "riku.riku1019@icloud.com" },
];

const HOBBIES = [
  "古着屋巡り",
  "レコード集め",
  "ガジェット",
  "インテリア",
  "ゲーム",
  "アニメ",
  "プログラミング",
];

/*
 * 構文強調のトークン。
 * base の `*` が要素ごとに --neon-text-color を戻すので、
 * 色は入れ子で継がせず span ひとつずつに持たせる。
 */
const Punct = ({ children }: { children: ReactNode }) => (
  <span className="text-neon-green opacity-40">{children}</span>
);

const Value = ({ value }: { value: string | number }) =>
  typeof value === "number" ? (
    <span className="text-neon-orange">{value}</span>
  ) : (
    <span className="text-neon-blue">&quot;{value}&quot;</span>
  );

/**
 * 自身の基本情報だけを扱うセクション。
 * 経歴はターミナルのログとして Prof セクションに分けている。
 *
 * 基本情報は TypeScript のオブジェクトリテラルの体裁で見せる。
 * 等幅なので、キーの幅を 9ch に固定するだけで値が縦に揃う。
 */
export const About = () => {
  /*
   * 行は flex（行番号 + 中身）なので、中身は必ず span 1 つにまとめる。
   * 直下にトークンを並べるとトークン同士が別々の flex item になり、
   * 間の空白が落ちて詰まって表示されてしまう。
   */
  const lines: ReactNode[] = [
    <span>
      <span className="text-neon-pink">const</span>{" "}
      <span className="text-neon-white">profile</span>
      <Punct>:</Punct> <span className="text-neon-yellow">Profile</span>{" "}
      <Punct>= {"{"}</Punct>
    </span>,
    ...PROFILE.map((item) => (
      <span className="pl-[2ch]">
        <span className="inline-block min-w-[9ch]">
          <span className="text-neon-green">{item.key}</span>
          <Punct>:</Punct>
        </span>
        <Value value={item.value} />
        <Punct>,</Punct>
      </span>
    )),
    <Punct>{"};"}</Punct>,
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="flex min-h-dvh w-full flex-col px-4 pb-10 pt-20 md:h-full md:min-h-0 md:px-10 md:py-10"
    >
      <SectionHeading id="about-heading" title="About" icon={RiUserStarFill} />

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:items-center lg:gap-10">
          {/* 左：顔と肩書き */}
          <div
            data-anim="item"
            className="flex flex-col items-center rounded-lg border-neon border-neon-green bg-cyber-black p-6 text-center"
          >
            <img
              src={fune}
              alt="プロフィール画像"
              className="h-28 w-28 shrink-0 rounded-full border-2 border-neon-green object-cover md:h-40 md:w-40"
            />
            <h3 className="mt-4 text-xl font-bold text-neon-white md:text-2xl">
              Riku Funagayama
            </h3>
            <p className="mt-1 text-sm text-neon-green md:text-base">Engineer</p>
          </div>

          {/* 右：基本情報と趣味。1 段ずらして斜めの流れをつくる */}
          <div className="flex flex-col gap-5 md:translate-x-6">
            <div
              data-anim="item"
              className="overflow-hidden rounded-lg border-neon border-neon-green bg-cyber-black"
            >
              {/* エディタのタブに見立てたファイル名 */}
              <div className="code-bar px-3 py-1.5 font-mono text-[0.65rem] text-neon-green md:px-4 md:text-xs">
                profile.ts
              </div>

              <pre className="overflow-x-auto px-3 py-3 font-mono text-[0.68rem] leading-relaxed md:px-4 md:py-4 md:text-sm">
                <ol>
                  {lines.map((line, index) => (
                    <li key={index} className="flex">
                      {/* 行番号はコピーに混ざらないよう選択させない */}
                      <span className="w-5 shrink-0 select-none pr-3 text-right text-neon-green opacity-25 md:w-6">
                        {index + 1}
                      </span>
                      {line}
                    </li>
                  ))}
                </ol>
              </pre>
            </div>

            <div
              data-anim="item"
              className="rounded-lg border-neon border-neon-green bg-cyber-black p-5"
            >
              <h3 className="text-lg font-bold text-neon-white md:text-xl">趣味</h3>
              <ul className="badge-row mt-3 flex flex-wrap gap-2">
                {HOBBIES.map((hobby) => (
                  <li key={hobby} className="badge">
                    {hobby}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
