export type Post = {
  source: string;
  title: string;
  url: string;
  publishedAt: string;
  likes: number;
  image: string | null;
  tags: string[];
};

/**
 * 1 棟あたりに載せる記事の数。この順に繰り返す。
 * 掲示板の枚数が毎回変わることで、建物の見た目にリズムが出る。
 *
 * 上限を 2 枚にしてあるのは、掲示板が OGP を切り抜かずに全部映すようになり
 * 1 枚が背高になったため。3 枚積むと建物が画面の上へ突き抜けて、
 * いちばん上の掲示板が見出しの裏に隠れる。
 */
export const GROUP_PATTERN = [2, 2, 1] as const;

export type PostGroup = {
  /** React の key。先頭記事の URL を使う（記事が増えても衝突しない） */
  id: string;
  posts: Post[];
};

/**
 * 記事を建物ごとの束に切り分ける。
 *
 * GROUP_PATTERN を周回しながら先頭から取り、最後の棟は余りを受け取る。
 * 記事 10 件なら 2, 2, 1, 2, 2, 1 の 6 棟になる。
 *
 * 副作用を持たせないのは、割り振りだけを単体で確かめられるようにするため。
 */
export const groupPosts = (posts: readonly Post[]): PostGroup[] => {
  const groups: PostGroup[] = [];
  let cursor = 0;

  while (cursor < posts.length) {
    const size = GROUP_PATTERN[groups.length % GROUP_PATTERN.length];
    const slice = posts.slice(cursor, cursor + size);
    groups.push({ id: slice[0].url, posts: slice });
    cursor += size;
  }

  return groups;
};
