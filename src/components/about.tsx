import { Fragment, type ReactNode } from "react";
import { RiUserStarFill } from "react-icons/ri";
import fune from "../assets/fune.png";
import { SectionHeading } from "./SectionHeading";

type DocEntry = {
  /** JSDoc のタグとして出す名前 */
  tag: string;
  /** タグの右に添える日本語の見出し */
  label: string;
  body: string;
};

type InfoEntry = {
  key: string;
  /** 数値はそのまま、文字列は "..." で囲んで出す */
  value: string | number;
};

const DOC: DocEntry[] = [
  {
    tag: "motivation",
    label: "ものづくりへの原動力",
    body: "頭の中にあるアイデアが、コードを通じて実際に動くプロダクトへと形を成していく過程そのものが好きです。何もない白紙の状態から、人々の生活や業務を支える仕組みを作り上げる創作の楽しさが、エンジニアとしてのモチベーションの源泉です。",
  },
  {
    tag: "focus",
    label: "得意な領域・関心のある分野",
    body: "現在は特定の領域に絞り込まず、Web開発からAIツールの活用まで幅広く手を動かしながら自分のコアとなる強みを見定めている段階です。新しい技術に抵抗なく触れ、実際に動くものを作りながら領域を広げています。",
  },
  {
    tag: "value",
    label: "開発理念",
    body: "『シンプルに作って、シンプルに解決する』がモットー。無駄に複雑にせず、一番スマートな方法で課題をクリアします。",
  },
];

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

/**
 * 配列を 1 行に並べる数。
 * 全角の項目が多いので、狭い画面でも横に溢れない 2 つまでに抑える。
 */
const HOBBIES_PER_LINE = 2;

const chunk = <T,>(items: readonly T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
};

/*
 * 構文強調のトークン。
 * base の `*` が要素ごとに --neon-text-color を戻すので、
 * 色は入れ子で継がせず span ひとつずつに持たせる。
 */
const Punct = ({ children }: { children: ReactNode }) => (
  <span className="text-neon-green opacity-40">{children}</span>
);

const Str = ({ children }: { children: ReactNode }) => (
  <span className="text-neon-blue">&quot;{children}&quot;</span>
);

/** キーは幅を固定する。等幅なのでこれだけで値が縦に揃う */
const Key = ({ name }: { name: string }) => (
  <span className="inline-block min-w-[9ch]">
    <span className="text-neon-green">{name}</span>
    <Punct>:</Punct>
  </span>
);

const Value = ({ value }: { value: string | number }) =>
  typeof value === "number" ? (
    <span className="text-neon-orange">{value}</span>
  ) : (
    <Str>{value}</Str>
  );

/**
 * コメント行。行頭の ` * ` を独立した flex item にしておくと、
 * 本文が折り返しても字下げが揃う（エディタの折り返しと同じ見え方）。
 */
const CommentLine = ({ children }: { children: ReactNode }) => (
  <span className="flex min-w-0">
    <span className="shrink-0 text-neon-green opacity-40">{" * "}</span>
    {children}
  </span>
);

/**
 * 自身の基本情報だけを扱うセクション。
 * 経歴はターミナルのログとして Prof セクションに分けている。
 *
 * 中身は profile.ts の 1 ファイルとして読ませる。
 * 散文は JSDoc コメント、事実の列挙はオブジェクトリテラルに置いている。
 */
export const About = () => {
  /*
   * 行は flex（行番号 + 中身）なので、中身は必ず span 1 つにまとめる。
   * 直下にトークンを並べるとトークン同士が別々の flex item になり、
   * 間の空白が落ちて詰まって表示されてしまう。
   */
  const lines: ReactNode[] = [
    <Punct>/**</Punct>,

    ...DOC.flatMap((item, index) => [
      // 段落と段落のあいだの ` *`
      ...(index > 0 ? [<Punct>{" *"}</Punct>] : []),

      <CommentLine>
        <span className="shrink-0 text-neon-yellow">@{item.tag}</span>
        <span className="min-w-0 whitespace-normal pl-3 text-neon-green">
          {item.label}
        </span>
      </CommentLine>,

      <CommentLine>
        <span className="min-w-0 flex-1 whitespace-normal text-neon-white">
          {item.body}
        </span>
      </CommentLine>,
    ]),

    <Punct>{" */"}</Punct>,

    <span>
      <span className="text-neon-pink">const</span>{" "}
      <span className="text-neon-white">profile</span>
      <Punct>:</Punct> <span className="text-neon-yellow">Profile</span>{" "}
      <Punct>= {"{"}</Punct>
    </span>,

    ...PROFILE.map((item) => (
      <span className="pl-[2ch]">
        <Key name={item.key} />
        <Value value={item.value} />
        <Punct>,</Punct>
      </span>
    )),

    <span className="pl-[2ch]">
      <Key name="hobbies" />
      <Punct>[</Punct>
    </span>,

    ...chunk(HOBBIES, HOBBIES_PER_LINE).map((row) => (
      <span className="pl-[4ch]">
        {row.map((hobby, index) => (
          <Fragment key={hobby}>
            <Str>{hobby}</Str>
            <Punct>,</Punct>
            {index < row.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    )),

    <span className="pl-[2ch]">
      <Punct>],</Punct>
    </span>,

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

          {/* 右：profile.ts。1 段ずらして斜めの流れをつくる */}
          <div className="md:translate-x-6">
            <div
              data-anim="item"
              className="overflow-hidden rounded-lg border-neon border-neon-green bg-cyber-black"
            >
              {/* エディタのタブに見立てたファイル名 */}
              <div className="code-bar px-3 py-1.5 font-mono text-[0.65rem] text-neon-green md:px-4 md:text-xs">
                profile.ts
              </div>

              {/*
                広い画面はセクションの高さが 1 画面ぶんに固定されるので、
                入り切らないぶんはこの中でスクロールさせる。
                data-scrollable を付けておくと、斜め展開モードでも
                読み切るまでスクロールを横取りされない。
              */}
              <pre
                data-scrollable
                className="overflow-auto px-3 py-3 font-mono text-[0.68rem] leading-relaxed md:max-h-[calc(100dvh-11rem)] md:px-4 md:py-4 md:text-sm md:leading-normal"
              >
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
          </div>
        </div>
      </div>
    </section>
  );
};
