/**
 * オープニングが明けたことを伝えるだけの小さな仕組み。
 *
 * Hero の文字組み立ては、オープニングの裏で進んでしまうと見せ場が消える。
 * かといって props で降ろすと App の sections が作り直されて、
 * ステージのアニメーションまで組み直しになってしまう。
 * 参照を変えずに一度きりの合図だけを配りたいので、イベントで済ませている。
 */
const BOOT_DONE_EVENT = "myprof:boot-done";

let done = false;

/** オープニングが明けたことを知らせる。二重に呼んでも一度しか流れない */
export const markBootDone = () => {
  if (done) return;
  done = true;
  window.dispatchEvent(new Event(BOOT_DONE_EVENT));
};

/**
 * オープニングが明けたら listener を呼ぶ。返り値で購読を解除する。
 * すでに明けていればその場で呼ぶ。
 */
export const onBootDone = (listener: () => void): (() => void) => {
  if (done) {
    listener();
    return () => {};
  }

  window.addEventListener(BOOT_DONE_EVENT, listener, { once: true });
  return () => window.removeEventListener(BOOT_DONE_EVENT, listener);
};
