import { FaHistory } from "react-icons/fa";
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

/**
 * 経歴だけを扱うセクション。基本情報は About セクションに分けている。
 * 年月と出来事の 2 列を揃えた年号表として並べる。
 */
export const Prof = () => {
  return (
    <section
      id="profile"
      aria-labelledby="profile-heading"
      className="flex min-h-dvh w-full flex-col px-4 py-10 md:h-full md:min-h-0 md:px-10"
    >
      <SectionHeading id="profile-heading" title="Profile" icon={FaHistory} />

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="w-full max-w-4xl">
          <h3 className="mb-3 text-xl font-bold text-neon-white md:text-2xl">経歴</h3>

          <div className="overflow-hidden rounded-lg border-neon border-neon-green bg-cyber-black">
            {/* 表の見出し行。年号表であることを示す */}
            <div className="year-table-head grid grid-cols-[6rem_1fr] gap-x-3 px-4 py-2 text-xs font-bold uppercase tracking-widest text-neon-green md:grid-cols-[9rem_1fr] md:gap-x-6 md:px-6 md:text-sm">
              <span>年月</span>
              <span>出来事</span>
            </div>

            <ol>
              {CAREER.map((item) => (
                <li
                  key={item.year}
                  data-anim="item"
                  className="year-table-row grid grid-cols-[6rem_1fr] gap-x-3 px-4 py-3 text-left transition-colors duration-300 hover:bg-[#0a0a0a] md:grid-cols-[9rem_1fr] md:gap-x-6 md:px-6 md:py-4"
                >
                  <span className="text-sm font-bold text-neon-green md:text-base">
                    {item.year}
                  </span>
                  <span className="text-sm leading-relaxed text-neon-white md:text-base">
                    {item.text}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};
