import { useCallback, useRef, type ReactNode } from "react";
import { FaGithub } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { SiQiita } from "react-icons/si";
import note from "../../assets/note.png";

/** ホバー時に傾ける最大の角度 */
const MAX_TILT = 22;

type TileProps = {
  href: string;
  label: string;
  /** 静止時の向き。並べたときに単調にならないよう 1 枚ずつ変える */
  restX: number;
  restY: number;
  children: ReactNode;
};

/**
 * 各サービスへの導線を、厚みのある立体のタイルにする。
 *
 * 中身がアイコンなので WebGL は使わず、CSS の 3D 変形で組む
 * （Stack のカードと同じ作法。依存も増えない）。
 * 面は「表・裏・側面 4 枚」の 6 枚で、傾けたときに厚みが見える。
 *
 * 触っている位置に応じて傾け、離れたら静止時の角度へ戻る。
 * 角度は CSS 変数で渡すだけなので、React の再描画は起きない。
 */
const Tile = ({ href, label, restX, restY, children }: TileProps) => {
  const body = useRef<HTMLSpanElement>(null);

  const rest = useCallback(() => {
    const el = body.current;
    if (!el) return;
    el.style.setProperty("--rx", `${restX}deg`);
    el.style.setProperty("--ry", `${restY}deg`);
    el.style.setProperty("--lift", "0px");
  }, [restX, restY]);

  const track = useCallback((event: React.PointerEvent<HTMLAnchorElement>) => {
    const el = body.current;
    if (!el) return;

    const box = event.currentTarget.getBoundingClientRect();
    // 中心を 0 として -0.5〜0.5 に正規化する
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;

    el.style.setProperty("--rx", `${-y * MAX_TILT * 2}deg`);
    el.style.setProperty("--ry", `${x * MAX_TILT * 2}deg`);
    el.style.setProperty("--lift", "10px");
  }, []);

  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="social-tile"
      onPointerMove={track}
      onPointerLeave={rest}
      onBlur={rest}
    >
      <span
        ref={body}
        className="social-tile-body"
        style={
          {
            "--rest-rx": `${restX}deg`,
            "--rest-ry": `${restY}deg`,
          } as React.CSSProperties
        }
      >
        <span aria-hidden="true" className="social-tile-face social-tile-back" />
        <span aria-hidden="true" className="social-tile-face social-tile-left" />
        <span aria-hidden="true" className="social-tile-face social-tile-right" />
        <span aria-hidden="true" className="social-tile-face social-tile-top" />
        <span aria-hidden="true" className="social-tile-face social-tile-bottom" />

        {/* 表の面。アイコンはさらに手前へ浮かせて厚みを見せる */}
        <span className="social-tile-front">
          <span className="social-tile-icon">{children}</span>
        </span>
      </span>
    </a>
  );
};

export const SocialLinks = () => {
  return (
    <div className="social-scene flex items-center justify-center gap-5 md:mt-6 md:gap-8">
      <Tile href="https://github.com/fune6900" label="GitHub profile" restX={8} restY={-16}>
        <FaGithub />
      </Tile>
      <Tile href="https://x.com/fune_6900" label="X profile" restX={-6} restY={14}>
        <BsTwitterX />
      </Tile>
      <Tile href="https://note.com/fune_6900" label="note profile" restX={9} restY={16}>
        <img src={note} alt="" className="h-8 w-8 md:h-9 md:w-9" />
      </Tile>
      <Tile href="https://qiita.com/fune_6900" label="Qiita profile" restX={-8} restY={-14}>
        <SiQiita />
      </Tile>
    </div>
  );
};
