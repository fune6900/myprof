import type { IconType } from "react-icons";

type SectionHeadingProps = {
  /** 見出しの id。親 section の aria-labelledby から参照される */
  id: string;
  title: string;
  icon: IconType;
};

/**
 * Profile / Skills / Works で共通のネオンバッジ見出し。
 * 3 セクションで同じ markup を持っていたのでまとめた。
 */
export const SectionHeading = ({ id, title, icon: Icon }: SectionHeadingProps) => {
  return (
    <div className="relative shrink-0">
      <h2
        id={id}
        data-anim="title"
        className="absolute inset-x-0 -top-4 z-10 flex w-full items-center justify-center text-2xl font-bold"
      >
        <span className="neon-glow-soft flex w-fit items-center justify-center gap-3 rounded-full border-neon bg-cyber-black px-5 py-1 font-bold uppercase italic tracking-widest text-neon-green">
          {title}
          <Icon className="text-3xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)]" />
        </span>
      </h2>
      <div className="mt-6 border-neon-b border-neon-green" />
    </div>
  );
};
