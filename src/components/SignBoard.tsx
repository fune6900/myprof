import { SiQiita } from "react-icons/si";
import noteLogo from "../assets/note.png";
import type { Post } from "./postGroups";

/** 出典ごとの表示名 */
const SOURCES: Record<string, string> = {
  qiita: "Qiita",
  note: "note",
};

export const SourceMark = ({ source }: { source: string }) =>
  source === "note" ? (
    <img src={noteLogo} alt="" className="h-3.5 w-3.5 shrink-0 rounded" />
  ) : (
    <SiQiita className="h-3.5 w-3.5 shrink-0" />
  );

type SignBoardProps = {
  post: Post;
  /**
   * 建物が奥にいて読めないあいだは true。
   * リンク自体は DOM に残したまま、タブ移動の対象から外す
   * （読み上げからは消さないので aria-hidden は付けない）。
   */
  dormant: boolean;
};

/**
 * 記事 1 件ぶんの電工掲示板。
 *
 * 建物の壁に貼られた光る板という見立てで、これ自体がリンク。
 * 文字を光らせすぎないのは、掲示板が何枚も並ぶため。
 * 広い text-shadow を多数の要素に掛けると描画が跳ねる実績がある。
 */
export const SignBoard = ({ post, dormant }: SignBoardProps) => {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={dormant ? -1 : undefined}
      className="signboard"
    >
      {/*
        記事の絵。note は OGP がそのまま読める。
        Qiita は og:image タグはあるが署名付き imgix で外部からは 404 になる
        （取得スクリプトが null にしているのはそのため）。
        代わりに出典の印を大きく置いたタイルを出し、枠は必ず埋める。
      */}
      <span className="signboard-shot">
        {post.image ? (
          <img src={post.image} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="signboard-shot-fallback">
            <SourceMark source={post.source} />
          </span>
        )}
      </span>

      <span className="signboard-meta">
        <SourceMark source={post.source} />
        <span className="signboard-source">
          {SOURCES[post.source] ?? post.source}
        </span>
        <span className="signboard-date">{post.publishedAt}</span>
        <span className="signboard-likes">♥ {post.likes}</span>
      </span>

      <span className="signboard-title">{post.title}</span>
    </a>
  );
};
