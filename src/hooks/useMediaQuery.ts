import { useEffect, useState } from 'react';

/**
 * メディアクエリの一致状態を購読する。
 * 初期値も同期的に読むので、初回描画から正しいモードで組める。
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const list = window.matchMedia(query);
    const sync = () => setMatches(list.matches);

    sync();
    list.addEventListener('change', sync);
    return () => list.removeEventListener('change', sync);
  }, [query]);

  return matches;
};
