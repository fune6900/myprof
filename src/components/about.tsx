import { useEffect, useRef, useState } from "react";
import { animate, createScope, onScroll, stagger, utils, type Scope } from "animejs";
import { RiUserStarFill } from "react-icons/ri";
import { FiCopy, FiCheck } from "react-icons/fi";
import { SectionHeading } from "./SectionHeading";
import { LanyardBadge } from "../ui-component/LanyardBadge";
import { useMediaQuery } from "../hooks/useMediaQuery";

/** 画面に到達したときに打刻されるコマンド */
const PROMPT = "$ npx show-profile --riku";

type Message = {
  /** 小さく添える見出し */
  label: string;
  body: string;
};

const MESSAGES: Message[] = [
  {
    label: "motivation",
    body: "頭の中のアイデアが、コードを通じて動くものに変わる。その過程そのものが好きです。",
  },
  {
    label: "focus",
    body: "領域を絞らず、Web 開発から AI ツールまで手を動かしながらコアを見定めている段階です。",
  },
  {
    label: "value",
    body: "シンプルに作って、シンプルに解決する。",
  },
];

type Field = {
  key: string;
  /** 数値はそのまま、文字列は引用符で囲んで出す */
  value: string | number;
};

const FIELDS: Field[] = [
  { key: "name", value: "Riku Funagayama" },
  { key: "born", value: 2003 },
  { key: "from", value: "宮崎県" },
  { key: "based", value: "東京都" },
  { key: "role", value: "System Engineer" },
];

/** 趣味。ホバーで上にアイコンが浮かぶ */
const HOBBIES: { label: string; icon: string }[] = [
  { label: "古着屋巡り", icon: "👕" },
  { label: "レコード集め", icon: "💿" },
  { label: "ガジェット", icon: "🎧" },
  { label: "インテリア", icon: "🛋️" },
  { label: "観葉植物", icon: "🌱" },
  { label: "ゲーム", icon: "🎮" },
  { label: "アニメ", icon: "📺" },
  { label: "プログラミング", icon: "💻" },
];

type Mode = "ts" | "json";

/** コピー用の生テキスト。表示と同じ内容を組み立てる */
const toPlainText = (mode: Mode): string => {
  const indent = "  ";
  const q = (key: string) => (mode === "json" ? `"${key}"` : key);
  const fields = FIELDS.map(
    (f) =>
      `${indent}${q(f.key)}: ${typeof f.value === "number" ? f.value : `"${f.value}"`},`,
  );
  const hobbies = [
    `${indent}${q("hobbies")}: [`,
    ...HOBBIES.map((h) => `${indent}${indent}"${h.label}",`),
    `${indent}],`,
  ];
  const body = [...fields, ...hobbies].join("\n");

  return mode === "json"
    ? `{\n${body}\n}`
    : `const profile: Profile = {\n${body}\n};`;
};

/** 趣味 1 件。ホバーでアイコンが浮かび、文字が光る */
const Hobby = ({ label, icon }: { label: string; icon: string }) => (
  <span className="group relative inline-block">
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 scale-75 opacity-0 transition-all duration-300 group-hover:-top-7 group-hover:scale-100 group-hover:opacity-100"
    >
      {icon}
    </span>
    <span className="text-neon-blue transition-colors duration-300 group-hover:text-neon-green group-hover:drop-shadow-[0_0_12px_rgba(0,255,194,0.9)]">
      &quot;{label}&quot;
    </span>
  </span>
);

export const About = () => {
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const prompt = useRef<HTMLSpanElement>(null);
  const code = useRef<HTMLPreElement>(null);
  const scope = useRef<Scope | null>(null);

  const [mode, setMode] = useState<Mode>("ts");
  const [copied, setCopied] = useState(false);

  // 広い画面ではセクションが 1 画面ぶんに固定されるので、この中でスクロールする
  const isWide = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (!root.current || !prompt.current) return;

    const promptEl = prompt.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      promptEl.textContent = PROMPT;
      return;
    }

    // 内側でスクロールするときはそちらを、しないときは画面のスクロールを見る
    const container = isWide ? scroller.current ?? undefined : undefined;

    scope.current = createScope({ root }).add(() => {
      // 1. 到達したら 1 文字ずつ打つ
      const typing = { chars: 0 };
      promptEl.textContent = "";

      animate(typing, {
        chars: PROMPT.length,
        duration: PROMPT.length * 55,
        ease: "linear",
        autoplay: onScroll({ container, enter: "bottom-=40 top", sync: "play" }),
        onUpdate: () => {
          promptEl.textContent = PROMPT.slice(0, Math.floor(typing.chars));
        },
      });

      // 2. メッセージを 1 行ずつ、下から浮かせて光らせる
      const messages = root.current?.querySelectorAll('[data-reveal="message"]');
      if (messages?.length) {
        utils.set(messages, { opacity: 0, y: 40 });
        animate(messages, {
          opacity: [0, 1],
          y: [40, 0],
          duration: 900,
          ease: "out(3)",
          delay: stagger(120),
          autoplay: onScroll({ container, enter: "bottom-=60 top", sync: "play" }),
        });
      }

      // 3. 生コードは 1 行ずつ立ち上げる
      const lines = root.current?.querySelectorAll('[data-reveal="line"]');
      if (lines?.length) {
        utils.set(lines, { opacity: 0, x: 24 });
        animate(lines, {
          opacity: [0, 1],
          x: [24, 0],
          duration: 600,
          ease: "out(3)",
          delay: stagger(35),
          autoplay: onScroll({ container, enter: "bottom-=40 top", sync: "play" }),
        });
      }
    });

    return () => {
      scope.current?.revert();
      scope.current = null;
    };
  }, [isWide]);

  /* 表示を切り替えたら、行がすっと入れ替わるように見せる */
  useEffect(() => {
    const el = code.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lines = el.querySelectorAll("[data-line]");
    if (!lines.length) return;

    const animation = animate(lines, {
      opacity: [0, 1],
      y: [10, 0],
      duration: 420,
      ease: "out(3)",
      delay: stagger(18),
    });

    return () => {
      animation.revert();
    };
  }, [mode]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(mode));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // クリップボードが使えない環境では何もしない
    }
  };

  const quote = (key: string) =>
    mode === "json" ? (
      <span className="text-neon-green">&quot;{key}&quot;</span>
    ) : (
      <span className="text-neon-green">{key}</span>
    );

  return (
    <section
      ref={root}
      id="about"
      aria-labelledby="about-heading"
      className="flex min-h-dvh w-full flex-col px-4 pb-10 pt-20 md:h-full md:min-h-0 md:px-10 md:pb-10 md:pt-24"
    >
      <SectionHeading id="about-heading" title="About" icon={RiUserStarFill} />

      <div className="grid min-h-0 flex-1 gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] md:gap-10">
        {/* 左：掴んで振れるストラップ。狭い画面では出さない */}
        <LanyardBadge />

        {/* 右：到達 → 展開 → 生コード の順に読ませる */}
        <div
          ref={scroller}
          data-scrollable
          className="relative min-h-0 md:overflow-y-auto md:pr-2"
        >
          {/* 右上に浮かせる最小限の操作 */}
          <div className="sticky top-0 z-10 flex justify-end gap-2 bg-cyber-black/70 py-1 backdrop-blur-sm">
            <div className="flex gap-1 text-[0.7rem] md:text-xs">
              {(["ts", "json"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  aria-pressed={mode === value}
                  className={`px-2 py-0.5 uppercase tracking-widest transition-colors duration-300 ${
                    mode === value
                      ? "text-neon-green"
                      : "text-neon-white opacity-40 hover:opacity-80"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={copy}
              aria-label="プロフィールをコピー"
              className="flex items-center gap-1 px-2 py-0.5 text-[0.7rem] text-neon-white transition-colors duration-300 hover:text-neon-green md:text-xs"
            >
              {copied ? <FiCheck /> : <FiCopy />}
              {copied ? "Copied!" : null}
            </button>
          </div>

          {/* 1. プロンプト */}
          <p className="mt-2 font-mono text-2xl leading-tight text-neon-green md:text-4xl lg:text-5xl">
            <span ref={prompt} />
            <span className="ml-0.5 inline-block w-[0.6ch] animate-pulse bg-neon-green align-middle text-transparent">
              _
            </span>
          </p>

          {/* 2. メッセージ */}
          <div className="mt-10 flex flex-col gap-8 md:mt-14 md:gap-12">
            {MESSAGES.map((message) => (
              <div key={message.label} data-reveal="message">
                <p className="font-mono text-xs uppercase tracking-widest text-neon-green opacity-60 md:text-sm">
                  @{message.label}
                </p>
                <p className="mt-2 text-xl leading-snug text-neon-white drop-shadow-[0_0_18px_rgba(255,255,255,0.25)] md:text-3xl lg:text-4xl">
                  {message.body}
                </p>
              </div>
            ))}
          </div>

          {/* 3. 枠なしの生コード */}
          <pre
            ref={code}
            className="mt-12 min-w-0 [overflow-wrap:anywhere] whitespace-pre-wrap font-mono text-sm leading-loose md:mt-16 md:text-base lg:text-lg"
          >
            {mode === "ts" ? (
              <span data-line data-reveal="line" className="block">
                <span className="text-neon-pink">const</span>{" "}
                <span className="text-neon-white">profile</span>
                <span className="text-neon-green opacity-40">:</span>{" "}
                <span className="text-neon-yellow">Profile</span>{" "}
                <span className="text-neon-green opacity-40">= {"{"}</span>
              </span>
            ) : (
              <span data-line data-reveal="line" className="block">
                <span className="text-neon-green opacity-40">{"{"}</span>
              </span>
            )}

            {FIELDS.map((field) => (
              <span key={field.key} data-line data-reveal="line" className="block pl-[2ch]">
                {quote(field.key)}
                <span className="text-neon-green opacity-40">:</span>{" "}
                {typeof field.value === "number" ? (
                  <span className="text-neon-orange">{field.value}</span>
                ) : (
                  <span className="text-neon-blue">&quot;{field.value}&quot;</span>
                )}
                <span className="text-neon-green opacity-40">,</span>
              </span>
            ))}

            <span data-line data-reveal="line" className="block pl-[2ch]">
              {quote("hobbies")}
              <span className="text-neon-green opacity-40">: [</span>
            </span>

            {HOBBIES.map((hobby) => (
              <span key={hobby.label} data-line data-reveal="line" className="block pl-[4ch]">
                <Hobby label={hobby.label} icon={hobby.icon} />
                <span className="text-neon-green opacity-40">,</span>
              </span>
            ))}

            <span data-line data-reveal="line" className="block pl-[2ch]">
              <span className="text-neon-green opacity-40">],</span>
            </span>

            <span data-line data-reveal="line" className="block">
              <span className="text-neon-green opacity-40">
                {mode === "ts" ? "};" : "}"}
              </span>
            </span>
          </pre>
        </div>
      </div>
    </section>
  );
};
