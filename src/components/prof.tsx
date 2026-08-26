import { RiUserStarFill } from "react-icons/ri";
import fune from "../assets/fune.png";
import { SectionHeading } from "./SectionHeading";

type CareerEntry = {
  year: string;
  text: string;
};

const CAREER: CareerEntry[] = [
  { year: "2022年3月", text: "宮崎県立佐土原高等学校 卒業" },
  {
    year: "2022年4月",
    text: "株式会社アドヴィックスに入社し、自動車用ブレーキの製造業務に従事しながらVBAなどを用いて業務効率化を推進",
  },
  {
    year: "2024年6月",
    text: "プログラミングスクールRUNTEQに入学して、Ruby on Railsを中心にWeb開発を学習",
  },
  { year: "2025年3月", text: "RUNTEQ 卒業!!" },
  { year: "2026年1月", text: "株式会社帆風（クレアテック）に入社" },
];

export const Prof = () => {
  return (
    <section
      id="profile"
      aria-labelledby="profile-heading"
      className="flex min-h-dvh w-full flex-col px-4 py-10 md:h-full md:min-h-0 md:px-10"
    >
      <SectionHeading id="profile-heading" title="Profile" icon={RiUserStarFill} />

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          {/* 左：プロフィール */}
          <div
            data-anim="item"
            className="rounded-lg border-neon border-neon-green bg-cyber-black p-5"
          >
            <div className="flex items-center gap-5">
              <img
                src={fune}
                alt="プロフィール画像"
                className="h-24 w-24 shrink-0 rounded-full border-2 border-neon-green object-cover md:h-28 md:w-28"
              />
              <div className="text-left">
                <h3 className="text-xl font-bold text-neon-white md:text-2xl">
                  ステータス
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neon-white md:text-base">
                  2003年生まれ、宮崎県出身。
                  <br />
                  現在は都内でエンジニアとして活動中。
                </p>
              </div>
            </div>

            <p className="mt-4 break-all text-sm text-neon-white md:text-base">
              📧 riku.riku1019@icloud.com
            </p>

            <h3 className="mt-5 text-xl font-bold text-neon-white md:text-2xl">趣味</h3>
            <p className="mt-1 text-sm leading-relaxed text-neon-white md:text-base">
              古着屋巡り、レコード集め、ガジェット、インテリア、
              <br />
              ゲーム、アニメ、プログラミング、etc...
            </p>
          </div>

          {/* 右：経歴。1 件ずつ右へずらして斜めの流れをつくる */}
          <div className="text-left">
            <h3 className="mb-3 text-xl font-bold text-neon-white md:text-2xl">経歴</h3>

            <ol className="flex flex-col gap-2">
              {CAREER.map((item, index) => (
                <li
                  key={item.year}
                  className="md:[transform:translateX(var(--step))]"
                  style={{ "--step": `${index * 1.5}rem` } as React.CSSProperties}
                >
                  <div
                    data-anim="item"
                    className="rounded-md border-neon border-neon-green p-2.5 text-sm text-neon-white transition-colors duration-300 hover:bg-[#0a0a0a] md:p-3 md:text-base"
                  >
                    <span className="font-bold">{item.year}：</span> {item.text}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};
