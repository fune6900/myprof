import { createContext, useContext } from 'react';
import type { SectionNavigator } from './useSectionNavigator';

/**
 * 進行度の配り先。
 *
 * navigator は App が 1 つだけ持つが、スクロール連動を仕込みたいのは
 * セクションの奥にある個々の演出なので、props で降ろすと全段が中継役になる。
 * context に置くのは購読口そのもの（毎フレーム変わる progress ではない）なので、
 * ここを経由しても再描画は起きない。
 */
export const NavigatorContext = createContext<SectionNavigator | null>(null);

export const useNavigator = (): SectionNavigator => {
  const navigator = useContext(NavigatorContext);

  if (!navigator) {
    throw new Error('useNavigator は NavigatorContext.Provider の内側で呼ぶ');
  }

  return navigator;
};
