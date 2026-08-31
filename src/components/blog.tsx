import { useEffect, useMemo, useRef, useState } from "react";
import { FaRegNewspaper } from "react-icons/fa";
import { SectionHeading } from "./SectionHeading";
import { BlogCity } from "./BlogCity";
import { groupPosts, type Post } from "./postGroups";
import { useNavigator } from "../hooks/navigatorContext";
import posts from "../data/posts.json";

/**
 * 記事を「通りを進みながら建物の電工掲示板で読む」形にしたセクション。
 *
 * 中身は data-scrollable な縦スクロール + scroll-snap で、1 スクロールで
 * 建物 1 棟ぶん進む。端まで読み切ると useSectionNavigator 側が
 * スクロールを引き取って次のセクションへ進む（Profile と同じ仕組み）。
 *
 * 舞台はスクロール領域の「内側」に貼り付ける。外に出すと、掲示板を
 * 押せるようにするために舞台へ pointer-events: none が要り、そうすると
 * ホイールの event.target が data-scrollable を辿れなくなる。
 */
/**
 * ホイールが途切れたとみなす間隔 (ms)。
 * これより短い間隔で続けて飛んでくるものは、同じ一振りの続きとして扱う。
 */
const GESTURE_GAP_MS = 130;

/**
 * 同じ一振りが続いていても、これだけ経ったら次の 1 棟を許す (ms)。
 * トラックパッドで指を止めずに送り続けたときに、止まってしまわないように。
 */
const COOLDOWN_MS = 500;

export const Blog = () => {
  const box = useRef<HTMLDivElement>(null);
  /** いま正面に置きたい棟。scrollTop から導く */
  const [target, setTarget] = useState(0);
  const [stageH, setStageH] = useState(0);

  const { hijack, prefersReducedMotion, activeIndex } = useNavigator();

  /*
   * 奥行きを使うのは、スクロールを横取りできる広い画面かつ
   * 動きを減らす設定でないときだけ。それ以外は積んで並べる。
   */
  const flat = !hijack || prefersReducedMotion;

  const groups = useMemo(() => groupPosts(posts as Post[]), []);

  /*
   * 入ってきた向きに合わせて着地点を決める。
   *
   * 後ろ（Contact）から戻ってきたのに 1 棟目に着地すると、次の 1 回で
   * そのまま Projects へ抜けてしまい、5 棟すべてを飛ばすことになる。
   * 手前から来たら先頭、奥から来たら末尾に置く。
   */
  const wasActive = useRef(false);
  const prevActive = useRef(activeIndex);

  useEffect(() => {
    const el = box.current;
    if (!el || flat) return;

    const section = el.closest("[data-section]");
    const all = Array.from(document.querySelectorAll("[data-section]"));
    const myIndex = all.indexOf(section as Element);
    if (myIndex === -1) return;

    const isActive = activeIndex === myIndex;

    if (isActive && !wasActive.current && el.clientHeight > 0) {
      const cameFromLater = prevActive.current > myIndex;
      el.scrollTop = cameFromLater ? (groups.length - 1) * el.clientHeight : 0;
    }

    wasActive.current = isActive;
    prevActive.current = activeIndex;
  }, [activeIndex, flat, groups.length, stageH]);

  /*
   * ホイールを 1 回受けるごとに 1 棟だけ送る。
   *
   * scroll-snap は使わない。Chromium はジェスチャの終端に最も近い吸着点へ
   * 寄せるので、ホイール 1 ノッチ（約 200px）では 1 棟ぶん（画面 1 枚 ≒ 700px）
   * に届かず原点へ引き戻され、マウスでは永久に進めなかった（実測）。
   *
   * React の onWheel は passive で登録されるので preventDefault が効かない。
   * ここは自前で passive: false のリスナを張る必要がある。
   *
   * 端まで来たら preventDefault しない。素のスクロールもこれ以上動かないので、
   * navigator が引き取って次のセクションへ進む。
   */
  useEffect(() => {
    const el = box.current;
    if (!el || flat) return;

    /*
     * 直近に確定した時刻。これを過ぎるまで次へ進めない。
     *
     * マウスの 1 回転もトラックパッドの一振りも、wheel イベントは
     * 数十 ms のあいだに何発も飛んでくる。1 イベント = 1 棟にすると
     * 一振りで最後まで飛び、1 棟目と最後の棟にしか留まれなくなる。
     */
    let lastCommit = -Infinity;
    let lastEvent = -Infinity;
    /** この一振りで棟を送ったか。端で navigator に譲るかの判断に使う */
    let movedInGesture = false;
    /** この一振りは端で navigator に明け渡したか */
    let handedOff = false;

    const onWheel = (event: WheelEvent) => {
      const step = el.clientHeight;
      if (step <= 0) return;

      const now = event.timeStamp;
      const current = Math.round(el.scrollTop / step);
      const next = current + Math.sign(event.deltaY);

      /*
       * 間が空いていれば新しい一振りの 1 発目。続けて飛んできていれば
       * 同じ一振りの続き。同じ一振りでも冷却を過ぎたら次の 1 棟を許す
       * （送り続けても止まらないように）。
       */
      const starting = now - lastEvent > GESTURE_GAP_MS;
      const fresh = starting || now - lastCommit > COOLDOWN_MS;
      lastEvent = now;

      if (starting) {
        movedInGesture = false;
        handedOff = false;
      }

      if (next < 0 || next > groups.length - 1) {
        /*
         * 端。ここは navigator に譲ってセクションを送る。
         *
         * 飲み込むのは「この一振りで棟を送っていた」ときだけ。最後の棟に
         * 着いた勢いでそのまま次のセクションへ抜けるのを防ぐためで、
         * 端から始まった一振りは最後まで navigator へ通す。
         *
         * ここで一振りまるごと飲み込むと、トラックパッドでは端から出られない。
         * 一振りの 1 発目は deltaY が数 px しかなく（macOS の立ち上がり）、
         * それだけでは navigator の確定閾値（WHEEL_UNIT × COMMIT_RATIO ＝ 90）
         * に遠く届かないため、続きを渡さないと永久に溜まらない（実測）。
         */
        if (movedInGesture) event.preventDefault();
        else handedOff = true;
        return;
      }

      // 明け渡した一振りは、途中で向きが変わっても navigator に任せきる
      if (handedOff) return;

      // 素のスクロールと navigator の両方をここで止める
      event.preventDefault();

      if (!fresh) return;

      // scrollTop を真実の置き場にする。端の判定を navigator と揃えるため
      // 即座に書く（見た目の補間は BlogCity 側で行う）
      el.scrollTop = next * step;
      lastCommit = now;
      movedInGesture = true;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [flat, groups.length]);

  /*
   * 舞台と仕切りの高さは実測する。
   * flex で高さが決まる親に対して子の height: 100% は解決しないため
   * （同じ罠を Projects のカルーセルで踏んでいる）。
   */
  useEffect(() => {
    const el = box.current;
    if (!el) return;

    const read = () => setStageH(el.clientHeight);
    read();

    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="blog"
      aria-labelledby="blog-heading"
      className="flex min-h-dvh w-full flex-col px-4 pb-10 pt-20 md:h-full md:min-h-0 md:px-10 md:pb-10 md:pt-24"
    >
      <SectionHeading id="blog-heading" title="Blog" icon={FaRegNewspaper} />

      <div
        ref={box}
        data-scrollable
        onScroll={(event) => {
          const el = event.currentTarget;
          if (el.clientHeight <= 0) return;
          setTarget(el.scrollTop / el.clientHeight);
        }}
        className="relative mt-3 min-h-0 flex-1 md:overflow-y-auto"
      >
        {/*
          舞台。スクロールしても貼り付いたまま、中の奥行きだけが変わる。

          高さを 0 にして中身を absolute で浮かせるのが要点。舞台自体が
          1 画面ぶんの高さを持つと、その分だけ吸着点が後ろへずれて
          1 棟目が正面に来られなくなる（scrollTop 0 が吸着点にならない）。
        */}
        {!flat && (
          <div className="sticky top-0 z-10 h-0">
            <div
              className="absolute inset-x-0 top-0"
              style={{ height: stageH || undefined }}
            >
              <BlogCity
                groups={groups}
                target={target}
                stageH={stageH}
                flat={false}
              />
            </div>
          </div>
        )}

        {/* 狭い画面・動きを減らす設定では、積んで並べるだけ */}
        {flat && <BlogCity groups={groups} target={0} stageH={stageH} flat />}

        {/*
          スクロールできる長さを作るためだけの仕切り。
          1 棟につき 1 画面ぶん。これがあるおかげで scrollTop が
          「何棟目か」をそのまま表し、navigator の端判定とも一致する。
        */}
        {!flat &&
          groups.map((group) => (
            <div
              key={group.id}
              aria-hidden="true"
              style={{ height: stageH || undefined }}
            />
          ))}
      </div>

      {/*
        全記事への経路。
        奥行きシーンでは遠い建物を visibility: hidden で落としているため、
        そのままではキーボードと読み上げに 1〜3 件しか届かない。
        見た目には隠しつつフォーカスは受け取れる一覧を別に置き、
        タブで入ってきたときだけ実体として現れるようにする。
      */}
      <nav aria-label="記事の一覧" className="blog-index">
        <ul>
          {groups.flatMap((group) => group.posts).map((post) => (
            <li key={post.url}>
              <a href={post.url} target="_blank" rel="noopener noreferrer">
                {post.title}
                <span className="blog-index-meta">
                  {" "}
                  — {post.publishedAt}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
};
