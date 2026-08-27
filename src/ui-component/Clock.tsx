import { useEffect, useState } from "react";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * ヘッダー左に置く現在時刻。
 * ターミナル調のサイトに合わせて等幅・24 時間表記で出す。
 */
export const Clock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const date = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;
  /** <time> に持たせる機械可読な値 */
  const iso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${time}`;

  return (
    <time
      dateTime={iso}
      className="text-neon-green-all flex items-center gap-2 rounded-md border-neon border-neon-green bg-cyber-black px-2.5 py-1 font-mono leading-none md:gap-3 md:px-3.5 md:py-1.5"
    >
      {/* 動いていることを示すランプ */}
      <span aria-hidden="true" className="clock-lamp shrink-0" />

      <span className="flex flex-col gap-0.5">
        <span className="text-sm tracking-widest md:text-lg">{time}</span>
        <span className="text-[0.55rem] tracking-wider opacity-60 md:text-[0.65rem]">
          {date} {WEEKDAYS[now.getDay()]}
        </span>
      </span>
    </time>
  );
};
