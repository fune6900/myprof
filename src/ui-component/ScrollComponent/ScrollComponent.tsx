import type { FC } from 'react';
import fune from '../../assets/favicon.png';

type ScrollComponentProps = {
  /** 先頭セクションへ戻る */
  onBackToTop: () => void;
  /** すでに先頭にいるか */
  disabled: boolean;
};

const ScrollComponent: FC<ScrollComponentProps> = ({ onBackToTop, disabled }) => {
  return (
    <button
      type="button"
      onClick={onBackToTop}
      disabled={disabled}
      aria-label="Back to top"
      className="fixed left-2 top-2 z-50 h-10 w-10 rounded-full border-neon border-neon-green transition duration-300 ease-in-out hover:scale-105 hover:opacity-60 disabled:pointer-events-none disabled:opacity-30 md:left-7 md:top-7 md:h-16 md:w-16"
    >
      <img src={fune} alt="" className="h-full w-full rounded-full object-cover" />
    </button>
  );
};

export default ScrollComponent;
