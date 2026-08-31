/**
 * カメラの Z 位置を progress から求める。
 *
 * 速度は「通路で加速・セクションで減速」させたいので、
 *
 *   v(p) = BASE + BOOST * sin²(π * frac(p))
 *
 * とする。sin² は整数のところで 0、通路の中央（半端値）で 1 になるので、
 * セクションに近づくほど静まり、通路の真ん中で最も速くなる。
 *
 * Z 位置はその積分。∫₀ᵗ sin²(πu) du = t/2 − sin(2πt)/(4π) が閉じた形で
 * 出せるので、毎フレーム数値積分せずに済む。
 */

/** セクション上でも進み続ける最低速度 (px / progress 1) */
const BASE = 320;
/** 通路の中央で上乗せされる速度 (px / progress 1) */
const BOOST = 2400;

/** 1 セクション分の移動量。BASE + BOOST/2 = 1520px */
export const TRAVEL_PER_SECTION = BASE + BOOST / 2;

/**
 * progress 地点でのカメラの Z 位置 (px)。単調増加する。
 * 数値は「これまでに進んだ距離」なので、構造物の配置にもそのまま使う。
 */
export const cameraZ = (progress: number): number => {
  const whole = Math.floor(progress);
  const f = progress - whole;

  // ∫₀^progress sin²(π·frac(u)) du
  const shape = whole * 0.5 + (f / 2 - Math.sin(2 * Math.PI * f) / (4 * Math.PI));

  return BASE * progress + BOOST * shape;
};

/**
 * progress 地点での速度 (px / progress 1)。
 * 速度に応じた演出（流れる線など）を足したくなったとき用。
 */
export const cameraSpeed = (progress: number): number => {
  const f = progress - Math.floor(progress);
  const s = Math.sin(Math.PI * f);
  return BASE + BOOST * s * s;
};
