import { useEffect, useRef } from 'react';
import type { SectionNavigator } from '../hooks/useSectionNavigator';

type SectionIndicatorProps = {
  sections: readonly { id: string; label: string }[];
  navigator: SectionNavigator;
};

/**
 * 現在地の表示と各セクションへのジャンプ。
 * スクロールバーが無くなった代わりに、今どこにいるかを示す役割を持つ。
 */
export const SectionIndicator = ({ sections, navigator }: SectionIndicatorProps) => {
  const { activeIndex, goTo, subscribe } = navigator;
  const bar = useRef<HTMLDivElement>(null);

  /* progress は毎フレーム変わるので state を介さず直接反映する */
  useEffect(() => {
    const last = sections.length - 1;
    return subscribe((progress) => {
      if (!bar.current) return;
      const ratio = last > 0 ? progress / last : 0;
      bar.current.style.transform = `scaleX(${ratio})`;
    });
  }, [subscribe, sections.length]);

  return (
    <>
      {/*
        min-h-1 と p-0 も要る。プラグインの .progress は min-height: 16px と
        padding: 4px を持っていて、h-1 だけでは 16px のまま残り、
        ヘッダーの時計や戻るボタンに被ってしまう。
      */}
      <div
        ref={bar}
        className="progress fixed inset-x-0 top-0 z-50 h-1 min-h-1 origin-left p-0"
        style={{ transform: 'scaleX(0)' }}
      />

      <nav
        aria-label="セクション"
        className="fixed right-3 top-1/2 z-50 -translate-y-1/2 md:right-6"
      >
        <ul className="flex flex-col gap-3">
          {sections.map((section, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={section.label}
                  aria-current={isActive ? 'true' : undefined}
                  className={`block h-3 w-3 rounded-full border-neon border-neon-green transition-all duration-300 hover:scale-125 ${
                    isActive ? 'scale-125 bg-neon-green' : 'opacity-50'
                  }`}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
