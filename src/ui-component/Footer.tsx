/**
 * ページ全体の著作権表示。
 *
 * もとは Projects セクションの末尾に直接書かれていたが、
 * 特定のセクションの持ち物ではないので切り出した。
 * 最後のセクション（Contact）の下に置いて締めにする。
 */
export const Footer = () => {
  return (
    <footer className="shrink-0 pt-4 text-center text-[0.65rem] text-neon-white md:pt-6 md:text-xs">
      © Riku Funagayama, All Rights Reserved.
    </footer>
  );
};
