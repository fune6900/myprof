import { useScroll } from './useScroll';
import fune from '../../assets/fune.png'; 

const ScrollComponent: React.FC = () => {
  const [ref, scrollToTop] = useScroll();

  return (
    <div className='md:px-7 px-2 md:pt-7 pt-2' ref={ref}>
      <img src={fune}  alt="Scroll to top" 
        className="fixed z-50 md:w-16 w-10 md:h-16 h-10 rounded-full border border-black cursor-pointer hover:opacity-60 transform hover:scale-105 transition duration-300 ease-in-out title"
        onClick={scrollToTop}
      />
    </div>
  );
};

export default ScrollComponent;
