import { useCallback, useEffect, useRef } from "react";
import { useNavigator } from "../hooks/navigatorContext";
import { HORIZON, PERSPECTIVE, groundOffset } from "../scene/synthwave";
import { SignBoard } from "./SignBoard";
import type { PostGroup } from "./postGroups";

/** 建物 1 棟ぶんの奥行き。1 スクロールでこれだけ進む */
const DEPTH = 620;

/** 通りの中心からの振り幅 (px)。左右へ交互に振る */
const LANE = 190;

/**
 * 建物ごとの特徴。並べたとき同じ形が続かないよう、
 * 幅・躯体の丈・窓の細かさ・屋上の作りを 1 棟ずつ変える。
 * 棟数より多く用意して、記事が増えても繰り返しが目立たないようにする。
 *
 * 幅と躯体の丈は対で決める。掲示板は OGP を切り抜かずに全部映すので、
 * 幅を広げるとその比率ぶん掲示板も背が伸びる（1 枚あたり幅の約 0.53 倍）。
 * 広い棟ほど躯体を詰めておかないと、建物が画面の上へ突き抜けて
 * いちばん上の掲示板が見出しの裏に隠れる。
 * GROUP_PATTERN の並び（2, 2, 1）に合わせ、掲示板 1 枚で済む
 * 3 番目と 6 番目に、幅広で背の高い躯体を割り当ててある。
 */
const FACADES = [
  { width: 22, body: 6, window: 15, crown: "antenna" },
  { width: 19, body: 10, window: 11, crown: "beacon" },
  { width: 25, body: 17, window: 19, crown: "none" },
  { width: 20, body: 9, window: 13, crown: "beacon" },
  { width: 24, body: 4, window: 17, crown: "antenna" },
  { width: 18, body: 20, window: 12, crown: "none" },
] as const;

/**
 * 屋上の飾りのぶん、棟の上に空けておく余白 (px)。
 * いちばん高いアンテナ（2.4rem）が入る値。
 */
const CROWN_ROOM = 44;

/** これより奥は描かない */
const FAR = -1.9;
/** ここまで来れば完全に見える */
const NEAR = -0.16;
/** 通り過ぎてからこれだけで消える。伸ばすと拡大しすぎて画面を覆う */
const PASSED = 0.72;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** 奥行きを見かけの倍率に直す。床・街と同じ PERSPECTIVE を使う */
const scaleAt = (z: number) => PERSPECTIVE / (PERSPECTIVE - z);

/** 1 フレームあたり target へ詰める割合。navigator と同じ手触りに揃える */
const EASE_FACTOR = 0.105;
/** これ以下の差は収束とみなす */
const SETTLE_EPSILON = 0.0015;

type BlogCityProps = {
  groups: PostGroup[];
  /** 行き先。0 = 1 棟目が正面。1 進むごとに次の棟が正面に来る */
  target: number;
  /** 舞台の高さ (px)。実測値が来るまでは 0 */
  stageH: number;
  /**
   * 奥行きを使わず縦に積むだけにする。
   * スクロールを横取りできない狭い画面と、動きを減らす設定で使う。
   */
  flat: boolean;
};

/**
 * 通りの左右に建物が並び、スクロールすると奥から手前へ流れていく。
 *
 * perspective は使わず 2D の scale だけで奥行きを作る。画面と平行な面なら
 * 両者は数学的に同値で、かつ perspective の内側に置くと Chromium が
 * 中身の当たり判定を落とすことがあるため（掲示板はリンクなので致命的）。
 * TunnelStage が同じ理由で同じ手を採っている。
 *
 * 足元は synthwave.ts の地面の式に載せてあるので、背景の床グリッドや
 * CyberCity の建物と同じ線の上に立つ。
 *
 * 毎フレームの位置はスタイルへ直接書く。React の再描画は起こさない。
 */
export const BlogCity = ({ groups, target, stageH, flat }: BlogCityProps) => {
  const stage = useRef<HTMLDivElement>(null);
  const towers = useRef(new Map<string, HTMLElement>());
  /** いま表示している位置。target へ向かって毎フレーム詰める */
  const depthRef = useRef(target);
  const { prefersReducedMotion: reduced } = useNavigator();

  const register = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) towers.current.set(id, el);
      else towers.current.delete(id);
    },
    [],
  );

  useEffect(() => {
    if (flat) return;

    const box = stage.current;
    if (!box) return;

    const width = box.clientWidth;
    const height = box.clientHeight;
    if (!width || !height) return;

    const horizonY = height * HORIZON;
    const ground = groundOffset(height);

    /*
     * いちばん高い棟が舞台に収まる倍率。
     *
     * 棟の丈は rem で決まっていて画面の高さを見ないので、背の低い画面だと
     * 上の掲示板が切れる。実測して足りないぶんだけ全体を縮める。
     * 位置の計算（足元・通りの振り幅）には掛けない。掛けると足元が
     * 床の格子から浮いてしまう。見た目の大きさだけを詰める。
     */
    const tallest = groups.reduce((max, group) => {
      const el = towers.current.get(group.id);
      return el ? Math.max(max, el.offsetHeight) : max;
    }, 0);
    const fit =
      tallest > 0 ? Math.min(1, (height - CROWN_ROOM) / tallest) : 1;

    /** 1 棟ぶんの見え方を書き込む */
    const place = (depth: number) => {
      groups.forEach((group, i) => {
        const el = towers.current.get(group.id);
        if (!el) return;

        const d = depth - i;
        const z = d * DEPTH;

        const alpha =
          d < 0 ? smoothstep(FAR, NEAR, d) : 1 - smoothstep(0, PASSED, d);
        const visible = alpha > 0.01;

        // 透明なだけの要素も合成には乗るので visibility で落とす。
        // display にするとレイアウトごと無効化されて却って重くなる。
        el.style.visibility = visible ? "visible" : "hidden";
        // 正面の 1 棟だけが押せる。半分消えた棟がクリックを奪わないように
        el.style.pointerEvents = Math.abs(d) < 0.5 ? "auto" : "none";
        if (!visible) return;

        const scale = scaleAt(z);
        // 通りの左右へ交互に。奥行きに応じて外へ開いていく
        const side = (i % 2 === 0 ? -1 : 1) * LANE;
        const x = width / 2 + side * scale;
        const y = horizonY + ground * scale;

        el.style.opacity = `${alpha}`;
        // 足元を掴んでから動かす。地面の線にそのまま載る
        el.style.transform = `translate(${x}px, ${y}px) scale(${scale * fit}) translate(-50%, -100%)`;
        el.style.zIndex = `${Math.round(d * 100) + 1000}`;
      });
    };

    /*
     * 行き先へ滑らかに寄せる。
     * scrollTop は段ごとに飛ぶので、そのまま反映すると建物が瞬間移動する。
     * 表示だけを ref で追わせ、React の再描画は起こさない（navigator と同じ方針）。
     */
    let frame: number | null = null;

    const tick = () => {
      const diff = target - depthRef.current;

      if (Math.abs(diff) < SETTLE_EPSILON) {
        depthRef.current = target;
        place(target);
        frame = null;
        return;
      }

      depthRef.current += diff * (reduced ? 1 : EASE_FACTOR);
      place(depthRef.current);
      frame = requestAnimationFrame(tick);
    };

    place(depthRef.current);
    frame = requestAnimationFrame(tick);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
    };
    // stageH は「実測が入った瞬間に組み直す」ための依存。
    // これが無いと初回の高さ 0 で早期 return したまま二度と描かれない。
  }, [groups, target, flat, stageH, reduced]);

  if (flat) {
    /*
     * 積んで並べるだけの表示。
     * 奥行きを動かさないので、掲示板はそのまま読めてリンクも効く。
     */
    return (
      <div className="blog-flat">
        {groups.map((group) => (
          <div
            key={group.id}
            className="blog-tower is-flat"
            style={
              {
                "--tower-window": `${FACADES[groups.indexOf(group) % FACADES.length].window}px`,
              } as React.CSSProperties
            }
            data-crown={FACADES[groups.indexOf(group) % FACADES.length].crown}
          >
            <div className="blog-tower-boards">
              {group.posts.map((post) => (
                <SignBoard key={post.url} post={post} dormant={false} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={stage} className="blog-city">
      {groups.map((group, i) => (
        <div
          key={group.id}
          ref={register(group.id)}
          className="blog-tower"
          style={
            {
              opacity: 0,
              visibility: "hidden",
              "--tower-w": `${FACADES[i % FACADES.length].width}rem`,
              "--tower-body": `${FACADES[i % FACADES.length].body}rem`,
              "--tower-window": `${FACADES[i % FACADES.length].window}px`,
            } as React.CSSProperties
          }
          data-crown={FACADES[i % FACADES.length].crown}
        >
          <div className="blog-tower-boards">
            {group.posts.map((post) => (
              <SignBoard
                key={post.url}
                post={post}
                // 正面付近の 1 棟だけタブで辿れるようにする
                dormant={Math.abs(target - i) > 0.5}
              />
            ))}
          </div>
          {/* 掲示板の下に続く躯体。窓だけの壁で建物の丈を作る */}
          <div aria-hidden="true" className="blog-tower-body" />
        </div>
      ))}
    </div>
  );
};
