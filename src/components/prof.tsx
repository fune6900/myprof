import { RiUserStarFill } from "react-icons/ri";
import fune from "../assets/fune.png";

export const Prof = () => {
  return (
    <section className="relative py-16 text-center border-neon- border-neon-green mx-auto px-4">
      {/* タイトル */}
      <div className="relative mb-10">
        <h3 className="absolute -top-4 inset-x-4 w-auto text-2xl font-bold flex items-center justify-center z-10">
          <span className="flex items-center justify-center gap-3 tracking-widest text-neon-green uppercase italic w-fit font-bold px-5 py-1 border-neon rounded-full bg-cyber-black neon-glow-soft">
            Profile
            <RiUserStarFill className="text-3xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
          </span>
        </h3>
        <div className="border-neon-b border-neon-green mt-6" />
      </div>

      {/* コンテンツ全体 */}
      <div className="flex flex-col items-center justify-center gap-16 mt-25">
        {/* --- 上段（画像＋ステータス・趣味） --- */}
        <div className="bg-cyber-black w-full max-w-[800px] p-6 border-neon border-neon-green rounded-lg transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* 左：画像 */}
            <div className="flex justify-center md:w-1/3 w-full">
              <img
                src={fune}
                alt="プロフィール画像"
                className="rounded-full w-32 h-32 md:w-40 md:h-40 object-cover border-2 border-neon-green"
              />
            </div>

            {/* 右：ステータス・趣味 */}
            <div className="md:w-2/3 w-full text-left mt-6 md:mt-0">
              <h4 className="text-2xl font-bold text-neon-white">ステータス</h4>
              <p className="mt-2 text-neon-white leading-relaxed">
                2003年生まれ、宮崎県出身。<br />
                現在は都内でエンジニアとして活動中。<br />
                <br />
                📧 riku.riku1019@icloud.com
              </p>

              <h4 className="mt-8 text-2xl font-bold text-neon-white">趣味</h4>
              <p className="mt-2 text-neon-white leading-relaxed">
                古着屋巡り、レコード集め、ガジェット、インテリア、<br />
                ゲーム、アニメ、プログラミング、etc...
              </p>
            </div>
          </div>
        </div>

        {/* --- 下段（経歴） --- */}
        <div className="bg-cyber-black w-full max-w-[800px] p-6 rounded-lg transition-all duration-300">
          <h3 className="mb-4 text-3xl text-neon-white font-bold text-left">経歴</h3>

          <div className="flex flex-col gap-4">
            {[
              { year: "2022年3月", text: "宮崎県立佐土原高等学校 卒業" },
              {
                year: "2022年4月",
                text:
                  "株式会社アドヴィックスに入社し、自動車用ブレーキの製造業務に従事しながらVBAなどを用いて業務効率化を推進",
              },
              {
                year: "2024年6月",
                text: "プログラミングスクールRUNTEQに入学して、Ruby on Railsを中心にWeb開発を学習",
              },
              { year: "2025年3月", text: "RUNTEQ 卒業!!" },
              { year: "2026年1月", text: "株式会社帆風（クレアテック）に入社" },
            ].map((item, index) => (
              <div
                key={index}
                className="border border-neon border-neon-green rounded-md p-3 text-neon-white text-left hover:bg-[#0a0a0a] transition-colors duration-300"
              >
                <span className="font-bold">{item.year}：</span> {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
