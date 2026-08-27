import { useEffect, useId, useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import type { SectionNavigator } from "../hooks/useSectionNavigator";
import { Clock } from "./Clock";

type SiteHeaderProps = {
  sections: readonly { id: string; label: string }[];
  navigator: SectionNavigator;
};

/**
 * 画面上部に固定するヘッダー。左に時刻、右にセクションへの導線を置く。
 * 狭い画面はハンバーガーメニューに畳む。
 *
 * 中央は空けてある。セクション見出しのバッジが中央に来るので、
 * そこへ被せないための余白。
 */
export const SiteHeader = ({ sections, navigator }: SiteHeaderProps) => {
  const { activeIndex, goTo } = navigator;
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  /* 開いている間だけ、外側の操作で閉じる */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menu.current?.contains(target) || toggle.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const jumpTo = (index: number) => {
    setOpen(false);
    goTo(index);
  };

  return (
    // 帯そのものはクリックを拾わない。中身だけが操作対象
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-4 py-3 pl-14 pr-3 md:py-6 md:pl-40 md:pr-8">
      <div className="pointer-events-auto">
        <Clock />
      </div>

      {/* 広い画面はそのまま並べる */}
      <nav aria-label="セクション" className="pointer-events-auto hidden md:block">
        <ul className="text-neon-green-all flex items-center gap-1.5 rounded-full border-neon border-neon-green bg-cyber-black px-2 py-1.5">
          {sections.map((section, index) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => goTo(index)}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`rounded-full px-3 py-1 font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
                  index === activeIndex
                    ? "text-neon-none bg-[var(--neon-green)] text-[var(--cyber-black)]"
                    : "text-neon-green opacity-60 hover:opacity-100"
                }`}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 狭い画面はハンバーガーに畳む */}
      <div className="pointer-events-auto relative md:hidden">
        <button
          ref={toggle}
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          className="text-neon-green-all flex h-10 w-10 items-center justify-center rounded-md border-neon border-neon-green bg-cyber-black transition duration-300 hover:scale-105"
        >
          {open ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
        </button>

        {open && (
          <div
            ref={menu}
            id={menuId}
            className="text-neon-green-all absolute right-0 top-full mt-2 w-44 rounded-lg border-neon border-neon-green bg-cyber-black p-2"
          >
            <nav aria-label="セクション">
              <ul className="flex flex-col gap-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(index)}
                      aria-current={index === activeIndex ? "true" : undefined}
                      className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left font-mono text-sm uppercase tracking-widest transition-colors duration-300 ${
                        index === activeIndex
                          ? "text-neon-none bg-[var(--neon-green)] text-[var(--cyber-black)]"
                          : "text-neon-green opacity-70"
                      }`}
                    >
                      <span aria-hidden="true" className="text-[0.65rem]">
                        {index === activeIndex ? "▶" : "-"}
                      </span>
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
