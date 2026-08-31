import { useCallback, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import type { SectionNavigator } from '../hooks/useSectionNavigator';
import { cameraZ } from './cameraCurve';
import { PERSPECTIVE, groundOffset } from '../scene/synthwave';
import { buildCity, type CityGate, type CityObject } from './cityLayout';

type CyberCityProps = {
  navigator: SectionNavigator;
  sectionCount: number;
};

/**
 * 通路 1 本あたりの構造物の数。
 *
 * 6 通路 × 7 = 42 個から 6 個へ、およそ 1/10 に落としてある。
 * 1 個あたりに稜線として 9〜17 棟を詰めているので、棟数としては
 * 数十棟が残る。合成される要素の数だけが減る。
 *
 *
 * ここはケチる。計測すると、フレーム時間を決めているのは box-shadow でも
 * グラデーションでもマスクでもなく「毎フレーム合成される 3D 要素の数」だった。
 * 同時に見える数を抑えると、街が無いときと同じ滑らかさに戻る。
 *
 * 間引きは React ではなく visibility で行う。activeIndex で DOM から
 * 出し入れすると、ちょうど通路を走っている最中に再マウントの山ができる。
 */
const PER_CORRIDOR_WIDE = 1;
const PER_CORRIDOR_NARROW = 1;

/** 横ずれの倍率。狭い画面では詰めないと街が画面の外に出てしまう */
const SPREAD_WIDE = 1;
const SPREAD_NARROW = 0.4;

/**
 * 奥行きによる濃さ。
 *
 * 遠くから滲み出て、通り過ぎる手前で消える。
 * 消さずに放っておくと、perspective が 900px なので通過直前に 4〜9 倍まで
 * 拡大され、窓のグリッドが粗いワイヤーフレームになって画面を覆ってしまう。
 * 手前で消すことで、それを避けつつ距離感（霧）も出す。
 */
/*
 * 奥は深く取る。遠くの建物ほど小さく、ラスタも小さいので安い。
 * ここを浅くすると手前の数棟しか出ず、「遠くに街がある」絵にならない。
 */
const FAR_OUT = -4600;
const FAR_IN = -3600;
const NEAR_IN = 150;
/*
 * 430 まで来たら消す。900/(900-430) = 1.9 倍で、窓のグリッドが
 * 粗いワイヤーフレームに見え始める手前で引き上げられる。
 * 同時に、合成される要素数も抑えられる。
 */
const NEAR_OUT = 430;

/** 門は「潜る」ものなので、到着位置 (650) を越えてから消す */
const GATE_NEAR_IN = 700;
const GATE_NEAR_OUT = 830;

const fade = (z: number, nearIn: number, nearOut: number): number => {
  if (z <= FAR_OUT || z >= nearOut) return 0;
  if (z < FAR_IN) return (z - FAR_OUT) / (FAR_IN - FAR_OUT);
  if (z > nearIn) return 1 - (z - nearIn) / (nearOut - nearIn);
  return 1;
};

/**
 * 濃さを更新するために覚えておく、要素とそのワールド Z。
 * shown は「いま描いているか」の記憶で、切り替わった瞬間だけ
 * visibility を書くために持つ（毎フレーム書くと無駄な作業が増える）。
 */
type Piece = {
  el: HTMLElement;
  z: number;
  gate: boolean;
  /** 画面中央からどれだけ外れているか。門は柱までの距離を使う */
  spreadX: number;
  spreadY: number;
  /** 門の spreadX は vw なので、px に直してから使う */
  spreadInVw: boolean;
  shown: boolean;
};

/**
 * 画面中央をよける度合い。0 なら消し、1 ならそのまま。
 *
 * perspective は遠くのものほど消失点＝画面中央へ集める。放っておくと
 * 遠景がちょうどセクションの文字の上に溜まって読めなくなる。
 * 全画面のマスクでも同じことはできるが、動き続ける中身にマスクを掛けると
 * 毎フレーム全面を合成し直すことになって高くつくので、
 * すでに毎フレーム回しているこのループの中で 1 つずつ濃さを決める。
 *
 * @param r 画面中心からの距離。1.0 で画面の端
 */
const clearCenter = (r: number): number => {
  /*
   * 中央は空けるが、空けすぎない。
   * 遠景は消失点＝画面中央付近に集まるので、ここを広く取ると
   * 遠くの街並みごと消えてしまう。本文の可読性は .scene-scrim が
   * 受け持っているので、こちらは芯を抜く程度に留める。
   */
  const IN = 0.3;
  const OUT = 0.92;
  if (r <= IN) return 0;
  if (r >= OUT) return 1;
  const k = (r - IN) / (OUT - IN);
  // 端を滑らかにする（smoothstep）
  return k * k * (3 - 2 * k);
};

/**
 * 斜めの経路に沿って建つサイバーパンクの街。
 *
 * セクションは TunnelStage が別の 3D 空間で動かす。ここは背景の層。
 * 文字のグローを 3D の中で動かすと毎フレーム別スケールでラスタ化されて
 * ぼける・重くなるので、街とセクションは意図的に分けてある。
 *
 * カメラは x/y を一定速度で斜めに進みつつ、Z だけ通路で加速する（cameraCurve）。
 * 横方向の視差は perspective が自動で付けるので、レイヤーごとの速度を
 * 手で決める必要はない。
 */
export const CyberCity = ({ navigator, sectionCount }: CyberCityProps) => {
  const world = useRef<HTMLDivElement>(null);
  const pieces = useRef(new Map<string, Piece>());

  const { subscribe, getProgress, activeIndex, prefersReducedMotion, hijack } =
    navigator;

  /*
   * TunnelStage と同じ理由で、activeIndex は ref 経由で読む。
   * 依存に入れるとセクションが切り替わるたびに購読を張り直してしまう。
   */
  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  /*
   * 入力を横取りしていない狭い画面では Z を動かさない。
   * 画面を固定できないうえ、慣性スクロールと噛み合うと速度が暴れるため、
   * 静かな視差だけに留める。
   */
  const still = !hijack || prefersReducedMotion;

  const layout = useMemo(
    () =>
      buildCity({
        sectionCount,
        perCorridor: hijack ? PER_CORRIDOR_WIDE : PER_CORRIDOR_NARROW,
        spread: hijack ? SPREAD_WIDE : SPREAD_NARROW,
        still,
      }),
    [sectionCount, hijack, still],
  );

  /** 描かれている要素を覚えておく。外れたら忘れる */
  const register = useCallback(
    (
        id: string,
        z: number,
        gate: boolean,
        spreadX: number,
        spreadY: number,
      ) =>
      (el: HTMLElement | null) => {
        if (el) {
          pieces.current.set(id, {
            el,
            z,
            gate,
            spreadX,
            spreadY,
            spreadInVw: gate,
            shown: false,
          });
        } else {
          pieces.current.delete(id);
        }
      },
    [],
  );

  useEffect(() => {
    const el = world.current;
    if (!el) return;

    const render = (progress: number) => {
      /*
       * 動きを減らす設定なら、街は出すが動かさない。
       * このサイトの他の演出と同じで「消す」ではなく「止める」に揃える。
       */
      const p = prefersReducedMotion ? activeRef.current : progress;
      const camera = still ? 0 : cameraZ(p);

      // 斜めには動かさない。カメラは奥へ進むだけ（TunnelStage と同じ向き）
      el.style.transform = `translateZ(${camera}px)`;

      /*
       * Z を動かさないモードでも濃さは一度当てる必要がある。
       * 初期値は 0 にしてあるので（遠くから滲み出させるため）、
       * ここを飛ばすと街がまるごと透明のままになる。
       */
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ground = groundOffset(vh);

      for (const piece of pieces.current.values()) {
        const z = piece.z + camera;
        let alpha = piece.gate
          ? fade(z, GATE_NEAR_IN, GATE_NEAR_OUT)
          : fade(z, NEAR_IN, NEAR_OUT);

        if (alpha > 0) {
          // 投影後の画面上の位置を出して、中央に居るぶんだけ引く
          const scale = PERSPECTIVE / (PERSPECTIVE - z);
          const offsetX = piece.spreadInVw ? (piece.spreadX * vw) / 100 : piece.spreadX;
          const sx = offsetX * scale;
          // 基準は地平線。地面までの距離から浮き上がりを引いたぶんが縦のずれ
          const sy = (ground - piece.spreadY) * scale;
          const r = Math.hypot(sx / (vw * 0.5), sy / (vh * 0.5));
          alpha *= clearCenter(r);
        }

        const shown = alpha > 0.01;

        /*
         * 透明なだけの要素も 3D の投影と合成には乗ってしまう。
         * visibility で落とすと描画から外れる。display だとレイアウトごと
         * 無効化されて、切り替わるたびに余計な計算が走った（実測で p95 が
         * 33ms → 40ms に悪化）。切り替わった瞬間だけ書く。
         */
        if (shown !== piece.shown) {
          piece.el.style.visibility = shown ? 'visible' : 'hidden';
          piece.shown = shown;
        }

        if (shown) piece.el.style.opacity = `${alpha}`;
      }
    };

    render(getProgress());
    return subscribe(render);
  }, [subscribe, getProgress, prefersReducedMotion, still]);

  return (
    /*
     * マスクは動かない外枠に掛ける。perspective はその内側に置く
     * （NeonGrid の viewport / grid と同じ二段構え）。
     */
    <div
      className="city-viewport pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="city-scene absolute inset-0">
        <div ref={world} className="city-world absolute inset-0">
          {layout.objects.map((object) => (
            <CityPiece
              key={object.id}
              object={object}
              innerRef={register(object.id, object.z, false, object.dx, object.dy)}
            />
          ))}
          {layout.gates.map((gate) => (
            <Gate
              key={gate.id}
              gate={gate}
              innerRef={register(gate.id, gate.z, true, gate.halfWidth, 0)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * ワールド座標への transform。
 *
 * 基準は地平線の消失点。そこから --sw-ground 下ろした面が地面で、
 * translate(-50%, -100%) によって要素の足元がその面に載る。
 * dy は地面からの浮き上がり（正で上）。
 */
const placement = (dx: number, dy: number, z: number) =>
  `translate3d(${dx}px, calc(var(--sw-ground) - ${dy}px), ${z}px) translate(-50%, -100%)`;

type PieceProps = {
  object: CityObject;
  innerRef: (el: HTMLElement | null) => void;
};

const CityPiece = ({ object, innerRef }: PieceProps) => {
  const style = {
    transform: placement(object.dx, object.dy, object.z),
    width: `${object.w}px`,
    height: `${object.h}px`,
    // Piece.shown の初期値 (false) と揃える。ここが visible のままだと、
    // 一度も現れない構造物に hidden が書かれず、透明なのに合成され続ける
    opacity: 0,
    visibility: 'hidden',
    '--city-color': object.color,
    '--city-depth': `${object.depth}px`,
    '--city-window': `${object.window}px`,
  } as CSSProperties;

  if (object.kind === 'sign') {
    return (
      <div ref={innerRef} className="city-object" style={style}>
        <span className="city-sign">{object.text}</span>
        <span className="city-face-side" />
      </div>
    );
  }

  if (object.kind === 'skyline') {
    return (
      <div ref={innerRef} className="city-object" style={style}>
        <span className="city-skyline">
          {object.bars?.map((bar, i) => (
            <i
              key={i}
              className="city-skyline-bar"
              style={{ width: `${bar.w}px`, height: `${bar.h}%` }}
            />
          ))}
        </span>
      </div>
    );
  }

  return (
    <div ref={innerRef} className="city-object" style={style}>
      <span className="city-tower" />
      <span className="city-face-side" />
      <span className="city-tower-crown" />
    </div>
  );
};

/**
 * セクションの門。到着したときちょうど画面の外周へ広がり、
 * セクションに額縁が付く位置に据えてある（cityLayout の GATE_ARRIVAL_Z）。
 */
const Gate = ({
  gate,
  innerRef,
}: {
  gate: CityGate;
  innerRef: (el: HTMLElement | null) => void;
}) => {
  const style = {
    transform: placement(0, 0, gate.z),
    opacity: 0,
    visibility: 'hidden',
    '--city-color': gate.color,
    '--gate-half': `${gate.halfWidth}vw`,
  } as CSSProperties;

  return (
    <div ref={innerRef} className="city-object city-gate" style={style}>
      {/*
        ラベルは柱に縦書きで乗せる。梁の上に置くと、到着して拡大したとき
        画面の外へ出てしまううえ、中央を抜くマスクにも掛かって読めない。
      */}
      <span className="city-gate-post city-gate-post-left">
        <span className="city-gate-label">{gate.label}</span>
      </span>
      <span className="city-gate-post city-gate-post-right">
        <span className="city-gate-label">{gate.label}</span>
      </span>
      <span className="city-gate-beam" />
    </div>
  );
};
