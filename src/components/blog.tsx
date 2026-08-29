import { FaRegNewspaper } from "react-icons/fa";
import { SiQiita } from "react-icons/si";
import { SectionHeading } from "./SectionHeading";
import noteLogo from "../assets/note.png";
import posts from "../data/posts.json";

type Post = {
  source: string;
  title: string;
  url: string;
  publishedAt: string;
  likes: number;
  tags: string[];
};

/** 出典ごとの見せ方 */
const SOURCES: Record<string, { label: string; badge: string }> = {
  qiita: { label: "Qiita", badge: "text-neon-green" },
  note: { label: "note", badge: "text-neon-white" },
};

/** note のタグは先頭に # が付いてくるので落とす */
const cleanTag = (tag: string) => tag.replace(/^#/, "");

const SourceMark = ({ source }: { source: string }) =>
  source === "note" ? (
    <img src={noteLogo} alt="" className="h-4 w-4 shrink-0 rounded" />
  ) : (
    <SiQiita className="h-4 w-4 shrink-0" />
  );

export const Blog = () => {
  const list = posts as Post[];

  return (
    <section
      id="blog"
      aria-labelledby="blog-heading"
      className="flex min-h-dvh w-full flex-col px-4 pb-10 pt-20 md:h-full md:min-h-0 md:px-10 md:py-10"
    >
      <SectionHeading id="blog-heading" title="Blog" icon={FaRegNewspaper} />

      <div className="flex min-h-0 flex-1 items-center justify-center">
        {/* 記事が増えても 1 画面に収まるよう、広い画面は 2 列に流す */}
        <ul className="grid w-full max-w-5xl gap-2.5 md:gap-3 lg:grid-cols-2 lg:gap-x-6">
          {list.map((post) => {
            const source = SOURCES[post.source] ?? { label: post.source, badge: "" };

            return (
              <li key={post.url} data-anim="item">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spotlight-card relative block overflow-hidden rounded-lg border-neon border-neon-green bg-cyber-black/80 p-2.5 transition-transform duration-300 hover:scale-[1.02] md:p-3"
                  onMouseMove={(event) => {
                    // カーソル位置を CSS 変数に流して ::after の光を動かす
                    const rect = event.currentTarget.getBoundingClientRect();
                    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
                    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
                  }}
                >
                  <div className={`flex items-center gap-2 text-[0.65rem] md:text-xs ${source.badge}`}>
                    <SourceMark source={post.source} />
                    <span className="uppercase tracking-widest">{source.label}</span>
                    <span className="opacity-50">{post.publishedAt}</span>
                    <span className="ml-auto shrink-0 opacity-70">♥ {post.likes}</span>
                  </div>

                  <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-neon-white md:text-base">
                    {post.title}
                  </h3>

                  {post.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span key={tag} className="badge">
                          {cleanTag(tag)}
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
