import type { FC } from 'react';
import fune from '../../assets/favicon.png';

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
      className={`fixed bottom-4 right-3 z-50 h-10 w-10 rounded-full border-neon border-neon-green transition duration-300 ease-in-out hover:scale-105 hover:opacity-60 md:bottom-7 md:right-7 md:h-16 md:w-16 ${
        atTop ? "opacity-40" : ""
      }`}
    >
      <img src={fune} alt="" className="h-full w-full rounded-full object-cover" />
    </button>
  );
};

export default ScrollComponent;
