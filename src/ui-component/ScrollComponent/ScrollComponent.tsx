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
      className={`fixed left-2 top-2 z-50 h-10 w-10 rounded-full border-neon border-neon-green transition duration-300 ease-in-out hover:scale-105 hover:opacity-60 md:left-7 md:top-7 md:h-16 md:w-16 ${
        atTop ? "opacity-40" : ""
      }`}
    >
      <img src={fune} alt="" className="h-full w-full rounded-full object-cover" />
    </button>
  );
};

export default ScrollComponent;
