import { useEffect, useRef } from 'react';
import type { SectionNavigator } from '../hooks/useSectionNavigator';
import { cameraZ } from '../city/cameraCurve';
import {
  GRID_CELL,
  GRID_CELL_X,
  GRID_COLUMNS,
  GRID_ROWS,
  HORIZON,
  PERSPECTIVE,
  groundOffset,
} from './synthwave';

type GridFloorProps = {
  navigator: SectionNavigator;
};

/** 待機中に床が流れる速さ (px / 秒)。止まって見えないための最低限 */
const IDLE_SPEED = 90;

/**
 * 線の色は CSS 変数から読む。
 *
 * canvas は CSS の HMR で描き直されないので、ここに色を直書きすると
 * パレットを変えたとき床だけ前の色のまま残る。単一の出どころにしておく。
 */
const LINE_VAR = '--sw-grid';
const LINE_FAR_VAR = '--sw-grid-far';

/** CSS の色指定を canvas 用の "r, g, b" に直す */
const toRgb = (
  ctx: CanvasRenderingContext2D,
  color: string,
  fallback: string,
): string => {
  if (!color) return fallback;

  // canvas に一度通すと #rrggbb か rgb(...) に正規化される
  ctx.fillStyle = '#000000';
  ctx.fillStyle = color;
  const normalized = ctx.fillStyle;

  if (typeof normalized === 'string' && normalized.startsWith('#')) {
    const n = Number.parseInt(normalized.slice(1), 16);
    if (Number.isNaN(n)) return fallback;
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  const match = /rgba?\(([^)]+)\)/.exec(String(normalized));
  return match ? match[1].split(',').slice(0, 3).join(',') : fallback;
};

/**
 * 手前から地平線へ続くネオンの床。
 *
 * 都市とまったく同じ投影で描く。奥行き z の地面は
 *   倍率  = PERSPECTIVE / (PERSPECTIVE - z)
 *   画面 y = 地平線 + 地面までの距離 × 倍率
 * に落ちる。街の建物は足元をこの面に置いてあるので、床の格子と同じ線の上に
 * 立ち、遠ざかるほど地平線へ収束する。カメラの前進量も cameraZ を共有する。
 *
 * CSS 3D で平面を寝かせる手もあるが、地平線まで届く大きさの要素を
 * rotateX すると数千万ピクセルのラスタになり、毎フレーム作り直される。
 * Canvas なら描くのは数十本の線だけで済む。
 */
export const GridFloor = ({ navigator }: GridFloorProps) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { subscribe, getProgress, prefersReducedMotion } = navigator;

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;

    const ctx = el.getContext('2d');
    if (!ctx) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const LINE = toRgb(ctx, rootStyle.getPropertyValue(LINE_VAR).trim(), '0, 255, 194');
    const LINE_FAR = toRgb(
      ctx,
      rootStyle.getPropertyValue(LINE_FAR_VAR).trim(),
      '0, 170, 190',
    );

    let width = 0;
    let height = 0;
    let horizonY = 0;
    let ground = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      horizonY = height * HORIZON;
      ground = groundOffset(height);

      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = buildColumns(dpr);
    };

    /**
     * 1 本の線を太さを変えて 3 回引き、光が滲んで見えるようにする。
     * canvas の shadowBlur は 1 本ごとにぼかし直すので高くつく。
     * 太い線を薄く重ねるほうが、見た目が近いわりにずっと安い。
     */
    const glowLine = (
      target: CanvasRenderingContext2D,
      draw: (c: CanvasRenderingContext2D) => void,
      alpha: number,
      color: string,
    ) => {
      target.strokeStyle = `rgba(${color}, ${alpha * 0.1})`;
      target.lineWidth = 7;
      draw(target);
      target.stroke();

      target.strokeStyle = `rgba(${color}, ${alpha * 0.3})`;
      target.lineWidth = 3;
      draw(target);
      target.stroke();

      target.strokeStyle = `rgba(${color}, ${alpha})`;
      target.lineWidth = 1.1;
      draw(target);
      target.stroke();
    };

    /*
     * 左右へ開く線はカメラが進んでも動かない。
     * 地面の x = j * GRID_CELL_X を消失点と結ぶ直線は、奥行きに依らず
     * 同じ位置に落ちるため。毎フレーム 45 本 × 3 度引くのは無駄なので、
     * 一度だけ別の canvas に描いて、以後は 1 枚の転写で済ませる。
     */
    let columns: HTMLCanvasElement | null = null;

    const buildColumns = (dpr: number) => {
      const layer = document.createElement('canvas');
      layer.width = el.width;
      layer.height = el.height;
      const lc = layer.getContext('2d');
      if (!lc) return null;
      lc.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (let j = -GRID_COLUMNS; j <= GRID_COLUMNS; j += 1) {
        if (j === 0) continue;
        const nearX = width / 2 + j * GRID_CELL_X;
        const alpha = 0.4 * (1 - Math.min(Math.abs(j) / GRID_COLUMNS, 1) * 0.6);
        glowLine(
          lc,
          (c) => {
            c.beginPath();
            c.moveTo(width / 2, horizonY);
            c.lineTo(nearX, height);
          },
          alpha,
          LINE,
        );
      }
      return layer;
    };

    /** 奥行き z の地面が落ちる画面上の y と、そこでの倍率 */
    const project = (z: number) => {
      const scale = PERSPECTIVE / (PERSPECTIVE - z);
      return { scale, y: horizonY + ground * scale };
    };

    const render = (camera: number) => {
      ctx.clearRect(0, 0, width, height);

      // 動かない縦線は焼いてある 1 枚を転写するだけ
      if (columns) ctx.drawImage(columns, 0, 0, width, height);

      /*
       * 奥へ向かって並ぶ横線。カメラが進むぶんだけ手前へ流れる。
       * z が 0 を超えた線は画面より手前なので描かない。
       */
      const first = Math.ceil(camera / GRID_CELL);
      for (let k = 0; k < GRID_ROWS; k += 1) {
        const z = camera - (first + k) * GRID_CELL;
        const { scale, y } = project(z);
        if (y > height + 4 || y < horizonY + 0.4) continue;

        // 手前ほど明るく。地平線際は霧に溶かす
        const alpha = Math.min(scale * 1.1, 1) * 0.72;
        const color = scale < 0.22 ? LINE_FAR : LINE;

        glowLine(
          ctx,
          (c) => {
            c.beginPath();
            c.moveTo(0, y);
            c.lineTo(width, y);
          },
          alpha,
          color,
        );
      }
    };

    let frame: number | null = null;
    let idle = 0;
    let lastTime = performance.now();
    let progress = getProgress();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      idle += dt * IDLE_SPEED;
      render(cameraZ(progress) + idle);
      frame = requestAnimationFrame(loop);
    };

    resize();

    /*
     * 動きを減らす設定なら、床は出すが流さない。
     * 常時 rAF も止めるので、待機中の負荷はゼロになる。
     */
    if (prefersReducedMotion) {
      const draw = () => render(cameraZ(getProgress()));
      draw();
      const onResize = () => {
        resize();
        draw();
      };
      window.addEventListener('resize', onResize);
      const stop = subscribe(draw);
      return () => {
        window.removeEventListener('resize', onResize);
        stop();
      };
    }

    const stop = subscribe((p) => {
      progress = p;
    });
    frame = requestAnimationFrame(loop);

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      stop();
    };
  }, [subscribe, getProgress, prefersReducedMotion]);

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="grid-floor pointer-events-none fixed inset-0"
    />
  );
};
