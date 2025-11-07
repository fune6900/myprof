import { FaGithub } from 'react-icons/fa'
import { BsTwitterX } from "react-icons/bs";
import note from '../../assets/note.png';
import { SiQiita } from "react-icons/si";

const SocialLinks = () => {
  return (
    <div className="flex justify-center items-center md:gap-6 gap-4 md:mt-6">
      <a href="https://github.com/fune6900" aria-label="GitHub profile" className="text-6xl hover:drop-shadow-[0_0_15px_rgba(1,255,194,1)] hover:scale-110 transition-all duration-300">
        <FaGithub className="text-6xl" />
      </a>
      <a href="https://x.com/fune_6900" aria-label="X profile" className="text-6xl hover:drop-shadow-[0_0_15px_rgba(1,255,194,1)] hover:scale-110 transition-all duration-300">
        <BsTwitterX className="text-5xl" />
      </a>
      <a href="https://note.com/fune_6900" aria-label="X profile" className="text-6xl hover:drop-shadow-[0_0_15px_rgba(1,255,194,1)] hover:scale-110 transition-all duration-300">
        <img src={note} alt="note logo" className="w-10 h-10 rounded-lg"/>
      </a>
      <a href="https://qiita.com/fune_6900" aria-label="X profile" className="text-6xl hover:drop-shadow-[0_0_15px_rgba(1,255,194,1)] hover:scale-110 transition-all duration-300">
      <SiQiita className="text-5xl"/>
      </a>
    </div>
  );
};

export default SocialLinks;