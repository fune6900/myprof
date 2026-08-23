import { FaGithub } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { SiQiita } from "react-icons/si";
import note from "../../assets/note.png";

const linkClass =
  "hover:drop-shadow-[0_0_15px_rgba(1,255,194,1)] hover:scale-110 transition-all duration-300";

export const SocialLinks = () => {
  return (
    <div className="flex justify-center items-center md:gap-6 gap-4 md:mt-6">
      <a
        href="https://github.com/fune6900"
        aria-label="GitHub profile"
        className={linkClass}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub className="text-5xl" />
      </a>
      <a
        href="https://x.com/fune_6900"
        aria-label="X profile"
        className={linkClass}
        target="_blank"
        rel="noopener noreferrer"
      >
        <BsTwitterX className="text-5xl" />
      </a>
      <a
        href="https://note.com/fune_6900"
        aria-label="note profile"
        className={linkClass}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={note} alt="" className="w-11 h-11 rounded-lg" />
      </a>
      <a
        href="https://qiita.com/fune_6900"
        aria-label="Qiita profile"
        className={linkClass}
        target="_blank"
        rel="noopener noreferrer"
      >
        <SiQiita className="text-5xl" />
      </a>
    </div>
  );
};
