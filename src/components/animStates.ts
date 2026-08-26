/** 見出しの開始状態と着地状態 */
export const TITLE_FROM = { opacity: 0, y: -32, scale: 0.92 };
export const TITLE_TO = { opacity: [0, 1], y: [-32, 0], scale: [0.92, 1] };

/**
 * アイテムがどの方向から入ってくるか。
 * セクションの data-anim-from で切り替える（既定は右下）。
 */
export const ITEM_DIRECTIONS = {
  'bottom-right': { x: 56, y: 56 },
  'top-right': { x: 72, y: -72 },
  'bottom-left': { x: -56, y: 56 },
  'top-left': { x: -72, y: -72 },
} as const;

export type ItemDirection = keyof typeof ITEM_DIRECTIONS;

export const isItemDirection = (value: string | undefined): value is ItemDirection =>
  value !== undefined && value in ITEM_DIRECTIONS;

export const itemStates = (direction: ItemDirection) => {
  const { x, y } = ITEM_DIRECTIONS[direction];
  return {
    from: { opacity: 0, x, y, scale: 0.94 },
    to: { opacity: [0, 1], x: [x, 0], y: [y, 0], scale: [0.94, 1] },
  };
};
