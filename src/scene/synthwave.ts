/**
 * Synthwave の風景を組むための共通の数値。
 *
 * 空・床・都市が同じ地平線と同じ投影を見ていないと、面の境界が繋がらず
 * 「遠くに街がある」ように見えない。ここ 1 箇所で持つ。
 */

/** 地平線の画面上の位置（0 = 上端, 1 = 下端）。CSS の --sw-horizon-pos と揃える */
export const HORIZON = 0.58;

/**
 * 都市の perspective (px)。CSS の .city-scene と揃える。
 * 床もこの値で投影するので、両者の遠近が一致する。
 */
export const PERSPECTIVE = 900;

/**
 * 地平線から画面下端までの距離を「カメラの高さ」とみなす。
 *
 * 奥行き z の地面は
 *   画面 y = 地平線 + 地面までの距離 × PERSPECTIVE / (PERSPECTIVE - z)
 * に落ちる。z = 0 でちょうど画面下端、z → -∞ で地平線に収束する。
 * 建物の足元をこの面に置けば、床の格子と同じ線の上に立つ。
 */
export const groundOffset = (viewportHeight: number) =>
  viewportHeight * (1 - HORIZON);

/** 床の格子の奥行き方向の間隔 (px) */
export const GRID_CELL = 260;

/** 床の格子の横方向の間隔 (px) */
export const GRID_CELL_X = 130;

/** 奥へ引く線の本数 */
export const GRID_ROWS = 44;

/** 左右に引く線の本数（中央から片側） */
export const GRID_COLUMNS = 22;
