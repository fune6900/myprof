import type { FC } from 'react';
import { useScroll } from './useScroll';
import fune from '../../assets/favicon.png';

const ScrollComponent: FC = () => {
  const [ref, scrollToTop] = useScroll();

  return (
    <div className="md:px-7 px-2 md:pt-7 pt-2" ref={ref}>
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed z-50 md:w-16 w-10 md:h-16 h-10 rounded-full border-neon border-neon-green cursor-pointer hover:opacity-60 transform hover:scale-105 transition duration-300 ease-in-out"
      >
        <img src={fune} alt="" className="w-full h-full rounded-full object-cover" />
      </button>
    </div>
  );
};

export default ScrollComponent;
