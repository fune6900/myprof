type MarqueeProps = {
  /** 帯に流す文字列。繰り返して敷き詰める */
  text: string;
  /** 右へ流す */
  reverse?: boolean;
  /** 1 周にかける秒数 */
  duration?: number;
  className?: string;
};

/** 1 コピーあたりの繰り返し数。画面幅より長くなればよい */
const REPEAT = 6;

/**
 * セクションの合間に流す文字列の帯。
 *
 * 同じ内容を 2 つ並べて -50% まで動かすことで、継ぎ目なく回る。
 * 読み上げる意味はないので aria-hidden にしてある。
 */
export const Marquee = ({
  text,
  reverse = false,
  duration = 22,
  className = "",
}: MarqueeProps) => {
  return (
    <div aria-hidden="true" className={`marquee-band ${className}`}>
      <div
        className="marquee-track"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[0, 1].map((copy) => (
          <span key={copy} className="flex shrink-0">
            {Array.from({ length: REPEAT }, (_, index) => (
              <span key={index} className="flex shrink-0 items-center gap-6 pr-6">
                {text}
                <span className="text-[0.6em] opacity-50">◆</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
};
