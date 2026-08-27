import { RiUserStarFill } from "react-icons/ri";
import fune from "../assets/fune.png";
import { SectionHeading } from "./SectionHeading";

type InfoEntry = {
  label: string;
  value: string;
};

const INFO: InfoEntry[] = [
  { label: "名前", value: "Riku Funagayama" },
  { label: "生年", value: "2003年" },
  { label: "出身", value: "宮崎県" },
  { label: "拠点", value: "東京都（都内でエンジニアとして活動中）" },
  { label: "連絡先", value: "riku.riku1019@icloud.com" },
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
 * 自身の基本情報だけを扱うセクション。
 * 経歴はターミナルのログとして Prof セクションに分けている。
 */
export const About = () => {
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
            <dl
              data-anim="item"
              className="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-2 rounded-lg border-neon border-neon-green bg-cyber-black p-5 md:grid-cols-[6rem_1fr] md:gap-y-3"
            >
              {INFO.map((item) => (
                <div key={item.label} className="contents">
                  <dt className="text-sm font-bold text-neon-green md:text-base">
                    {item.label}
                  </dt>
                  <dd className="break-all text-sm text-neon-white md:text-base">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

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
