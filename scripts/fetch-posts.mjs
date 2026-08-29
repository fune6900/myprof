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

/** その URL が画像として実際に読めるか確かめる */
const loadable = async (url) => {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    return res.ok && (res.headers.get("content-type") ?? "").startsWith("image/");
  } catch {
    return false;
  }
};

/**
 * ページの og:image を読む。取れなければ null。
 *
 * Qiita の OGP は imgix の署名付き URL で、パラメータを触ると 404 になる。
 * 実際に読めたものだけ返し、駄目なら画面側で代替のタイルを出す。
 */
const ogImage = async (url) => {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(
      /<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']/i,
    );
    if (!match) return null;

    const src = match[1].replace(/&amp;/g, "&");
    return (await loadable(src)) ? src : null;
  } catch {
    return null;
  }
};

const fetchQiita = () =>
  safely("Qiita", async () => {
    const res = await fetch(
      `https://qiita.com/api/v2/users/${QIITA_USER}/items?per_page=100`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const items = await res.json();

    /*
     * Qiita の API は OGP 画像を返さないので、記事ページの meta から拾う。
     * 件数は多くないので 1 件ずつ順に取る。
     */
    const withImages = [];
    for (const item of items) {
      withImages.push({
        source: "qiita",
        title: item.title,
        url: item.url,
        publishedAt: item.created_at.slice(0, 10),
        likes: item.likes_count,
        image: await ogImage(item.url),
        tags: item.tags.map((tag) => tag.name).slice(0, 3),
      });
    }
    return withImages;
  });

const fetchNote = () =>
  safely("note", async () => {
    const items = [];

    // 1 ページ 6 件で返ってくるので、最後のページまで辿る
    for (let page = 1; page <= 20; page += 1) {
      const res = await fetch(
        `https://note.com/api/v2/creators/${NOTE_USER}/contents?kind=note&page=${page}`,
        { headers: { "User-Agent": "Mozilla/5.0" } },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { data } = await res.json();
      items.push(...(data?.contents ?? []));
      if (data?.isLastPage !== false) break;
    }

    return items.map((item) => ({
      source: "note",
      title: item.name,
      url: `https://note.com/${NOTE_USER}/n/${item.key}`,
      publishedAt: (item.publishAt ?? "").slice(0, 10),
      likes: item.likeCount ?? 0,
      image: item.eyecatch ?? null,
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
