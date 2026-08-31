import { cameraZ } from './cameraCurve';

/**
 * 街の配置を作る。seed 固定の擬似乱数なので、何度読み込んでも同じ街になる。
 *
 * 構造物は「経路上の位置 t」と「そこからの横ずれ」で置く。
 * 経路そのものは DiagonalStage と同じで、progress 1 につき画面 1 枚分だけ
 * 斜めに進む。ワールド Z は cameraZ(t) を基準に決めるので、
 * progress が t に達したときちょうどカメラの真横を通る。
 */

/** 構造物の種類 */
export type CityKind = 'tower' | 'sign' | 'skyline';

export type CityObject = {
  id: string;
  kind: CityKind;
  /** 経路上の位置。progress と同じ尺度 */
  t: number;
  /** 経路からの横ずれ (px) */
  dx: number;
  /** 地面からの浮き上がり (px)。0 なら地面に足が着く */
  dy: number;
  /** ワールド Z (px) */
  z: number;
  w: number;
  h: number;
  /** 側面の厚み (px) */
  depth: number;
  color: string;
  /** 窓グリッドの間隔 (px)。tower のみ */
  window: number;
  /** 縦書きの看板文字。sign のみ */
  text?: string;
  /**
   * 稜線を作るビルの列。skyline のみ。
   *
   * 1 つの要素の中に何棟も描くための仕掛け。中身は transform-style: flat に
   * するので、何棟あっても合成されるレイヤーは 1 枚で済む
   * （フレーム時間を決めているのは合成される 3D 要素の数なので、
   * ここを 1 枚に畳めるかどうかが効く）。
   */
  bars?: { w: number; h: number }[];
};

export type CityGate = {
  id: string;
  /** どのセクションの門か */
  index: number;
  label: string;
  color: string;
  /** ワールド Z (px) */
  z: number;
  /** 門の内側の半幅 (vw)。ここを潜る */
  halfWidth: number;
};

/**
 * セクションに着いた瞬間、門がいる effective Z。
 * perspective 900px なので 900/(900-650) = 3.6 倍に見える。
 * 柱が画面の外周まで広がって、セクションに額縁が付く。
 */
const GATE_ARRIVAL_Z = 650;

/**
 * 門の内側の半幅 (vw)。
 * 到着時に 3.6 倍まで拡大されるので、9.5vw が画面上では約 34vw になる。
 * 柱が画面の左右にちょうど収まって額縁になる幅として決めた。
 */
const GATE_HALF_WIDTH = 9.5;

/**
 * ネオンの色。
 *
 * 空・地平線・床・UI をすべて緑で通しているので、街も 1 色にする。
 * 色数で変化を付けるのはやめ、奥行きと窓の間隔で差を出す。
 * 配列のままにしてあるのは、色を足したくなったときの差し替え口として。
 */
const PALETTE = ['var(--neon-green)'];

/** 看板に流す文字。読ませるものではないので雰囲気優先 */
const SIGN_TEXTS = [
  '電脳都市',
  '不夜城',
  '回線接続',
  '無限軌道',
  '電気街',
  '夢幻',
  '第伍区',
  '接続中',
  '非常口',
  '未来',
];

/** セクションごとの門。label はその場所の名前として掲げる */
const GATE_LABELS = [
  'HOME',
  'ABOUT',
  'PROFILE',
  'STACK',
  'PROJECTS',
  'BLOG',
  'CONTACT',
];

/** 決定論的な擬似乱数。seed が同じなら必ず同じ列を返す */
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type CityLayout = {
  objects: CityObject[];
  gates: CityGate[];
};

export type BuildCityOptions = {
  sectionCount: number;
  /** 通路 1 本あたりに置く構造物の数 */
  perCorridor: number;
  /**
   * Z を動かさないモード（モバイル）。
   * カメラが前進しないので、構造物は固定の奥行きに散らす。
   */
  still: boolean;
  /**
   * 街全体の縮尺。
   *
   * 横ずれも大きさも px で持っているので、画面が狭いとそのままでは
   * 建物 1 棟が画面を覆ってしまう。狭い画面ではまとめて縮める。
   */
  spread: number;
  seed?: number;
};

export const buildCity = ({
  sectionCount,
  perCorridor,
  still,
  spread,
  seed = 20260829,
}: BuildCityOptions): CityLayout => {
  const rand = mulberry32(seed);
  const objects: CityObject[] = [];

  const corridors = Math.max(sectionCount - 1, 1);

  for (let c = 0; c < corridors; c += 1) {
    for (let k = 0; k < perCorridor; k += 1) {
      /*
       * 一様乱数 2 つの平均は 0.5 を頂点とする三角分布になる。
       * これで「通路の中央ほど密集する」配置が乱数 1 行で作れる。
       */
      const f = (rand() + rand()) / 2;
      const t = c + f;

      /*
       * 稜線を主役にする。
       *
       * フレーム時間を決めるのは「合成される要素の数」なので、1 要素あたりに
       * 建物を詰め込めるほど得になる。稜線は中身が transform-style: flat で
       * 何棟並べてもレイヤー 1 枚で済むため、街の密度をここで稼ぐ。
       * 単体の塔は近景のアクセントとして少しだけ混ぜる。
       */
      const kindRoll = rand();
      const kind: CityKind =
        kindRoll < 0.68 ? 'skyline' : kindRoll < 0.9 ? 'tower' : 'sign';

      // 経路の左右に振り分ける。中央は通り道として空けておく
      const side = rand() < 0.5 ? -1 : 1;
      const dx = side * (470 + rand() * 900) * spread;

      /*
       * 通過する瞬間の奥行き。0 ならカメラの真横をかすめ、
       * 負なら遠くを、正なら通り過ぎたあとに来る。
       */
      const passZ = -760 + rand() * 700;
      const z = still ? -360 - rand() * 1500 : passZ - cameraZ(t);

      const color = PALETTE[Math.floor(rand() * PALETTE.length)];

      if (kind === 'skyline') {
        const count = 9 + Math.floor(rand() * 9);
        const bars = Array.from({ length: count }, () => ({
          w: 46 + rand() * 150,
          h: 22 + rand() * 78,
        }));
        const h = 520 + rand() * 820;

        objects.push({
          id: `k-${c}-${k}`,
          kind,
          t,
          // 通りの両脇に並べる。足元は地面
          dx: side * (520 + rand() * 1000) * spread,
          dy: 0,
          z,
          w: (760 + rand() * 900) * spread,
          h: h * spread,
          depth: 0,
          color,
          window: 9 + rand() * 7,
          bars,
        });
        continue;
      }

      if (kind === 'tower') {
        /*
         * 見上げるほど高くしたいが、丈はそのままラスタする面積になる。
         * 最大 2100px あれば、通過直前（1.9 倍）で画面の上下に突き抜ける。
         */
        const h = 700 + rand() * 1400;
        objects.push({
          id: `t-${c}-${k}`,
          kind,
          t,
          dx,
          // 建物は地面に立つ
          dy: 0,
          z,
          w: (190 + rand() * 330) * spread,
          h: h * spread,
          depth: (110 + rand() * 190) * spread,
          color,
          window: 11 + rand() * 11,
        });
        continue;
      }

      if (kind === 'sign') {
        objects.push({
          id: `s-${c}-${k}`,
          kind,
          t,
          dx,
          // 看板は空中に吊る。地平線より上へ出ないよう控えめに
          dy: (90 + rand() * 190) * spread,
          z,
          w: (62 + rand() * 34) * spread,
          h: (240 + rand() * 320) * spread,
          depth: 22 * spread,
          color,
          window: 0,
          text: SIGN_TEXTS[Math.floor(rand() * SIGN_TEXTS.length)],
        });
        continue;
      }

      objects.push({
        id: `s2-${c}-${k}`,
        kind: 'sign',
        t,
        dx,
        dy: (90 + rand() * 190) * spread,
        z,
        w: (58 + rand() * 30) * spread,
        h: (220 + rand() * 300) * spread,
        depth: 20 * spread,
        color,
        window: 0,
        text: SIGN_TEXTS[Math.floor(rand() * SIGN_TEXTS.length)],
      });
    }
  }

  /*
   * 門はセクションと同じ経路位置に置く。
   * ワールド Z は「そのセクションに着いたとき GATE_ARRIVAL_Z にいる」ように逆算する。
   * Z を動かさないモードでは潜れないので、少し先に据えた書き割りとして置く。
   */
  const gates: CityGate[] = Array.from({ length: sectionCount }, (_, index) => ({
    id: `gate-${index}`,
    index,
    label: GATE_LABELS[index] ?? `SECTOR ${index}`,
    color: PALETTE[index % PALETTE.length],
    z: still ? -900 : GATE_ARRIVAL_Z - cameraZ(index),
    halfWidth: still ? 34 : GATE_HALF_WIDTH,
  }));

  return { objects, gates };
};
