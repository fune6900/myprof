import { useState } from "react";
import { FaHistory } from "react-icons/fa";
import { SectionHeading } from "./SectionHeading";

type CareerEntry = {
  /** YYYY-MM。ログのファイル名と見出しの両方をここから組み立てる */
  date: string;
  text: string;
};

const CAREER: CareerEntry[] = [
  { date: "2022-03", text: "宮崎県立佐土原高等学校 卒業" },
  {
    date: "2022-04",
    text: "株式会社アドヴィックスに入社し、自動車用ブレーキの製造業務に従事しながらVBAなどを用いて業務効率化を推進",
  },
  {
    date: "2024-06",
    text: "プログラミングスクールRUNTEQに入学して、Ruby on Railsを中心にWeb開発を学習",
  },
  { date: "2025-03", text: "RUNTEQ 卒業!!" },
  { date: "2026-01", text: "株式会社帆風（クレアテック）に入社" },
];

const PROMPT = "riku@myprof:~/career$";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * 経歴だけを扱うセクション。基本情報は About セクションに分けている。
 *
 * ターミナルのログを 1 件ずつ読み進める見せ方にしている。
 * 中身は data-scrollable な縦スクロール + scroll-snap で、
 * 1 件がちょうど 1 画面に収まる。端まで読み切ると
 * useSectionNavigator 側がスクロールを引き取って次のセクションへ進む。
 */
export const Prof = () => {
  /** いま表示している経歴。ステータスバーの表示に使う */
  const [index, setIndex] = useState(0);

  const last = CAREER.length - 1;

  return (
    <section
      id="profile"
      aria-labelledby="profile-heading"
      className="flex min-h-dvh w-full flex-col px-4 py-10 md:h-full md:min-h-0 md:px-10"
    >
      <SectionHeading id="profile-heading" title="Profile" icon={FaHistory} />

      <div className="flex min-h-0 flex-1 items-center justify-center pt-5 md:pt-7">
        {/*
          高さは必ず確定させる。内側の 1 件が min-h-full で 1 画面ぶんに
          広がるのは、この箱の高さが決まっていることが前提になる。
          （スマホ側は min-h-dvh の伸縮に任せると高さが不定になる）
        */}
        <div className="flex h-[70dvh] max-h-[36rem] w-full max-w-4xl flex-col overflow-hidden rounded-lg border-neon border-neon-green bg-cyber-black md:h-full">
          {/* ウィンドウのタイトルバー */}
          <div className="terminal-bar flex shrink-0 items-center gap-3 px-3 py-2 md:px-4">
            <span aria-hidden="true" className="flex shrink-0 gap-1.5">
              <span className="terminal-dot" />
              <span className="terminal-dot" />
              <span className="terminal-dot" />
            </span>
            <h3 className="truncate font-mono text-xs text-neon-green md:text-sm">
              career.log — 経歴
            </h3>
          </div>

          {/*
            1 件ずつ読み進めるログ本文。
            data-scrollable を付けておくと、斜め展開モードでも
            ここが端に達するまではスクロールを横取りされない。
          */}
          <ol
            data-scrollable
            tabIndex={0}
            aria-label="経歴のログ"
            onScroll={(event) => {
              const el = event.currentTarget;
              if (el.clientHeight <= 0) return;
              setIndex(clamp(Math.round(el.scrollTop / el.clientHeight), 0, last));
            }}
            className="terminal-scanlines relative min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto"
          >
            {CAREER.map((item) => (
              <li
                key={item.date}
                className="flex min-h-full snap-start flex-col justify-center px-5 py-8 md:px-10 md:py-10"
              >
                <div data-anim="item">
                  <p className="font-mono text-[0.7rem] text-neon-green md:text-sm">
                    <span className="opacity-60">{PROMPT}</span> cat {item.date}.log
                  </p>

                  <p className="mt-6 font-mono text-5xl font-bold leading-none text-neon-green md:mt-10 md:text-6xl">
                    {item.date.replace("-", ".")}
                  </p>

                  <p className="mt-5 text-lg leading-loose text-neon-white md:mt-7 md:text-xl">
                    {item.text}
                  </p>

                  <p className="terminal-cursor mt-8 font-mono text-[0.7rem] text-neon-green opacity-60 md:mt-10 md:text-sm">
                    {PROMPT}{" "}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* ステータスバー。何件目を読んでいるかと、続きがあることを示す */}
          <div className="terminal-status flex shrink-0 items-center justify-between px-3 py-1.5 font-mono text-[0.65rem] text-neon-green md:px-4 md:text-xs">
            <span>
              -- {index + 1}/{CAREER.length} --
            </span>
            <span aria-hidden="true" className={index === last ? "opacity-30" : ""}>
              {index === last ? "EOF" : "▼ scroll"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
