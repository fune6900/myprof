import type { IconType } from "react-icons";
import { FaGithub, FaEnvelope, FaPaperPlane } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { SiQiita } from "react-icons/si";
import { SectionHeading } from "./SectionHeading";
import noteLogo from "../assets/note.png";

type Channel = {
  label: string;
  /** 画面に出す宛先。メールはアドレス、それ以外はアカウント名 */
  handle: string;
  href: string;
  icon?: IconType;
  /** アイコンが用意されていない note 用 */
  image?: string;
};

const CHANNELS: Channel[] = [
  {
    label: "GitHub",
    handle: "@fune6900",
    href: "https://github.com/fune6900",
    icon: FaGithub,
  },
  {
    label: "X",
    handle: "@fune_6900",
    href: "https://x.com/fune_6900",
    icon: BsTwitterX,
  },
  {
    label: "Email",
    handle: "riku.riku1019@icloud.com",
    href: "mailto:riku.riku1019@icloud.com",
    icon: FaEnvelope,
  },
  {
    label: "Qiita",
    handle: "@fune_6900",
    href: "https://qiita.com/fune_6900",
    icon: SiQiita,
  },
  {
    label: "note",
    handle: "@fune_6900",
    href: "https://note.com/fune_6900",
    image: noteLogo,
  },
];

export const Contact = () => {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="flex min-h-dvh w-full flex-col px-4 pb-10 pt-20 md:h-full md:min-h-0 md:px-10 md:py-10"
    >
      <SectionHeading id="contact-heading" title="Contact" icon={FaPaperPlane} />

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8">
        <p data-anim="item" className="text-center text-sm text-neon-white md:text-base">
          お気軽にご連絡ください。
        </p>

        <ul className="grid w-full max-w-3xl gap-3 sm:grid-cols-2">
          {CHANNELS.map((channel, index) => (
            <li
              key={channel.label}
              data-anim="item"
              // 最後の 1 つは 2 列のとき余るので、中央に置いて収まりを揃える
              className={index === CHANNELS.length - 1 ? "sm:col-span-2 sm:mx-auto sm:w-1/2" : ""}
            >
              <a
                href={channel.href}
                target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={channel.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="spotlight-card relative flex items-center gap-4 overflow-hidden rounded-lg border-neon border-neon-green bg-cyber-black/80 p-4 transition-transform duration-300 hover:scale-[1.03]"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
                  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
                }}
              >
                <span className="shrink-0 text-3xl drop-shadow-[0_0_10px_rgba(16,255,110,0.8)] md:text-4xl">
                  {channel.image ? (
                    <img src={channel.image} alt="" className="h-8 w-8 rounded md:h-9 md:w-9" />
                  ) : (
                    channel.icon && <channel.icon />
                  )}
                </span>

                <span className="min-w-0">
                  <span className="block text-sm uppercase tracking-widest text-neon-green md:text-base">
                    {channel.label}
                  </span>
                  <span className="block truncate text-xs text-neon-white md:text-sm">
                    {channel.handle}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
