import type { FC } from 'react';
import { FaChevronUp } from 'react-icons/fa';

type ScrollComponentProps = {
  /** 先頭セクションへ戻る */
  onBackToTop: () => void;
  /** すでに先頭にいるか。押せなくはせず、控えめに見せるだけにする */
  atTop: boolean;
};

/*
 * disabled にはしない。押した直後に activeIndex が 0 になって disabled が
 * 付くと、開始したばかりのスムーススクロールが取り消されてしまうため。
 * 先頭にいるときは薄く見せるだけにして、操作は常に受け付ける。
 *
 * 以前はアイコン画像を貼っていたが、写真がひとつ混ざるだけで
 * 線と発光だけで組んだ画面から浮いてしまう。矢印と TOP の字だけの
 * 発光パネルに置き換えた。
 */
const ScrollComponent: FC<ScrollComponentProps> = ({ onBackToTop, atTop }) => {
  return (
    <button
      type="button"
      onClick={onBackToTop}
      aria-label="Back to top"
      /*
       * 画面上部はヘッダー（時計とセクション導線）に譲って下へ下ろす。
       * 左下ではなく右下なのは、Projects のグリッドが左下までカードで
       * 埋まっていて重なるため。右下は最終行が余るので空いている。
       */
      className={`fixed bottom-4 right-3 z-50 flex h-11 w-11 flex-col items-center justify-center gap-0.5 border-neon border-neon-green bg-cyber-black/70 text-neon-green transition duration-300 ease-in-out hover:scale-105 md:bottom-7 md:right-7 md:h-14 md:w-14 ${
        atTop ? 'opacity-35' : ''
      }`}
    >
      <FaChevronUp className="text-base md:text-lg" aria-hidden="true" />
      <span className="font-mono text-[0.5rem] leading-none tracking-widest md:text-[0.6rem]">
        TOP
      </span>
    </button>
  );
};

export default ScrollComponent;
