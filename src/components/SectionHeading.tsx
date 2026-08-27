import type { IconType } from "react-icons";

type SectionHeadingProps = {
  /** 見出しの id。親 section の aria-labelledby から参照される */
  id: string;
  title: string;
  icon: IconType;
};

/**
 * Profile / Skills / Projects で共通のネオンバッジ見出し。
 * 3 セクションで同じ markup を持っていたのでまとめた。
 */
export const SectionHeading = ({ id, title, icon: Icon }: SectionHeadingProps) => {
  return (
    <div className="relative flex shrink-0 items-center justify-center">
      {/*
        横線はバッジの中心を通す。
        border-neon-b は要素の下辺に線を描くので、高さ 0 の箱を
        ちょうど中央に置いて、その位置に線を出している。
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2"
      >
        <div className="border-neon-b border-neon-green" />
      </div>

      <h2 id={id} data-anim="title" className="relative z-10 text-2xl font-bold">
        <span className="neon-glow-soft flex w-fit items-center justify-center gap-3 rounded-full border-neon bg-cyber-black px-5 py-1 font-bold uppercase italic tracking-widest text-neon-green">
          {title}
          <Icon className="text-3xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
        </span>
      </h2>
    </div>
  );
};
