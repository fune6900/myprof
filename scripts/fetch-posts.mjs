/*
 * Qiita と note の記事一覧を取り込んで src/data/posts.json に書き出す。
 *
 * ブラウザから直接叩かないのは note が CORS を許可していないため。
 * 生成物はコミットするので、ビルドはネットワークに依存しない。
 * 記事を書いたら `npm run posts` で更新する。
 */
import { writeFile } from "node:fs/promises";

const QIITA_USER = "fune_6900";
const NOTE_USER = "fune_6900";
const OUT = new URL("../src/data/posts.json", import.meta.url);

/** 失敗しても他方の取得は続けたいので、個別に握りつぶして空配列を返す */
const safely = async (label, run) => {
  try {
    return await run();
  } catch (error) {
    console.error(`× ${label} の取得に失敗しました:`, error.message);
    return [];
  }
};

const fetchQiita = () =>
  safely("Qiita", async () => {
    const res = await fetch(
      `https://qiita.com/api/v2/users/${QIITA_USER}/items?per_page=100`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    return (await res.json()).map((item) => ({
      source: "qiita",
      title: item.title,
      url: item.url,
      publishedAt: item.created_at.slice(0, 10),
      likes: item.likes_count,
      tags: item.tags.map((tag) => tag.name).slice(0, 3),
    }));
  });

const fetchNote = () =>
  safely("note", async () => {
    const res = await fetch(
      `https://note.com/api/v2/creators/${NOTE_USER}/contents?kind=note&page=1`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { data } = await res.json();
    return (data?.contents ?? []).map((item) => ({
      source: "note",
      title: item.name,
      url: `https://note.com/${NOTE_USER}/n/${item.key}`,
      publishedAt: (item.publishAt ?? "").slice(0, 10),
      likes: item.likeCount ?? 0,
      tags: (item.hashtags ?? []).map((h) => h.hashtag?.name ?? "").filter(Boolean).slice(0, 3),
    }));
  });

const [qiita, note] = await Promise.all([fetchQiita(), fetchNote()]);
const posts = [...qiita, ...note].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

if (posts.length === 0) {
  console.error("× 1 件も取得できなかったので、既存の posts.json は残します");
  process.exit(1);
}

await writeFile(OUT, `${JSON.stringify(posts, null, 2)}\n`);
console.log(`✓ ${posts.length} 件を書き出しました (Qiita ${qiita.length} / note ${note.length})`);
