import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from 'react';
import { useNavigator } from './navigatorContext';

/**
 * シーンの見せ方。どれになっても中身が受け取る progress は 0→1 で同じなので、
 * 演出側はモードを意識せずに書ける。
 *
 * - `static` : 手動再生をやめ、組み上がった状態（progress = 1）で通常フローに置く。
 *              prefers-reduced-motion や、ピン留めをしない狭い画面のフォールバック。
 * - `pinned` : TunnelStage がすでに画面へ固定している。スクロールは横取り済みなので
 *              progress は navigator から取る。sticky は使わない（使えない）。
 * - `sticky` : ネイティブスクロールの上で position: sticky で固定し、
 *              トラックを流れた量から progress を測る。
 */
export type SceneMode = 'static' | 'pinned' | 'sticky';

export type Scene = {
  mode: SceneMode;
  /** 0→1 の進行度を購読する。登録時に現在値が 1 度流れる。返り値で解除 */
  subscribe: (listener: (progress: number) => void) => () => void;
  /** 現在の進行度を同期的に読む */
  getProgress: () => number;
};

export type ScrollSceneOptions = {
  /**
   * sticky モードでピン留めしておく長さ（画面高の倍数）。
   * 1 なら「1 画面ぶんスクロールするあいだ画面を固定したまま再生する」。
   */
  length?: number;
  /** 手動再生をやめて static に落とす */
  disabled?: boolean;
  /**
   * 入力を横取りしていない環境（スマホなど素のスクロールが生きている場所）でも
   * sticky でピン留めするか。
   *
   * 既定は false。スマホで画面を固定するとブラウザのアドレスバー開閉や
   * 慣性スクロールと噛み合わず操作しづらくなるので、既定では素直に流して
   * 通常のスクロール挙動へフォールバックする。
   */
  pinOnNativeScroll?: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** ステージ上での自分の並び順。TunnelStage / PlainStage どちらも DOM 順に並べている */
const sectionIndexOf = (node: HTMLElement): number => {
  const section = node.closest<HTMLElement>('[data-section]');
  if (!section) return -1;

  const all = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
  return all.indexOf(section);
};

/** シーンの購読口を子孫へ配る */
export const SceneContext = createContext<Scene | null>(null);

export const useScene = (): Scene => {
  const scene = useContext(SceneContext);

  if (!scene) {
    throw new Error('useScene は ScrollScene の内側で呼ぶ');
  }

  return scene;
};

/**
 * トラック要素のスクロール量を 0→1 の進行度に変換する。
 *
 * progress は毎フレーム動くので state には載せず、navigator と同じく
 * ref + 購読で配る。購読側は DOM を直接触る（= React の再描画は起きない）。
 */
export const useScrollScene = (
  trackRef: RefObject<HTMLElement | null>,
  { disabled = false, pinOnNativeScroll = false }: ScrollSceneOptions = {},
): Scene => {
  const {
    subscribe: subscribeNavigator,
    hijack,
    prefersReducedMotion,
  } = useNavigator();

  const mode: SceneMode =
    disabled || prefersReducedMotion
      ? 'static'
      : hijack
        ? 'pinned'
        : pinOnNativeScroll
          ? 'sticky'
          : 'static';

  const progressRef = useRef(mode === 'static' ? 1 : 0);
  const listenersRef = useRef(new Set<(progress: number) => void>());

  const publish = useCallback(() => {
    for (const listener of listenersRef.current) {
      listener(progressRef.current);
    }
  }, []);

  const subscribe = useCallback((listener: (progress: number) => void) => {
    listenersRef.current.add(listener);
    listener(progressRef.current);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getProgress = useCallback(() => progressRef.current, []);

  /* ---------- static : 組み上がった状態で置くだけ ---------- */
  useEffect(() => {
    if (mode !== 'static') return;
    progressRef.current = 1;
    publish();
  }, [mode, publish]);

  /* ---------- pinned : 横取り済みの progress を自分の区間に読み替える ---------- */
  useEffect(() => {
    if (mode !== 'pinned') return;

    const track = trackRef.current;
    if (!track) return;

    /*
     * ステージの progress は「セクション何番目にいるか」を実数で表す。
     * 自分が index 番なら、1 つ手前から自分に到達するまでが再生区間。
     * 到達後は 1 で保持されるので、通り過ぎても組み上がったまま残る。
     */
    const index = sectionIndexOf(track);
    if (index === -1) return;

    const render = (stageProgress: number) => {
      progressRef.current = clamp(stageProgress - (index - 1), 0, 1);
      publish();
    };

    return subscribeNavigator(render);
  }, [mode, publish, subscribeNavigator, trackRef]);

  /* ---------- sticky : トラックを流れた量から測る ---------- */
  useEffect(() => {
    if (mode !== 'sticky') return;

    let frame: number | null = null;

    const read = () => {
      frame = null;

      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      // ピン留めされている子は 1 画面ぶん。残りがピン留めのまま流せる距離
      const travel = rect.height - window.innerHeight;

      progressRef.current = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 1;
      publish();
    };

    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [mode, publish, trackRef]);

  return useMemo(
    () => ({ mode, subscribe, getProgress }),
    [mode, subscribe, getProgress],
  );
};
