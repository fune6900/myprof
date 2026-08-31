import { useMemo } from 'react';

/** 星の数 */
const STARS = 90;
/** 地平線の摩天楼の棟数 */
const TOWERS = 46;

/** 決定論的な擬似乱数。読み込むたびに空が変わらないように seed を固定する */
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * 地平線より上。空のグラデーション、星、レトロサン、遠景の摩天楼。
 *
 * ここは完全な静止画。カメラは奥へ進むだけなので、遠景の空が横へ
 * 流れると前進感を打ち消してしまう。合成も一度で済む。
 */
export const SynthwaveSky = () => {

  /* 星は 1 つの要素の background-image にまとめる。要素を 90 個作らない */
  const stars = useMemo(() => {
    const rand = mulberry32(4242);
    return Array.from({ length: STARS }, () => {
      const x = rand() * 100;
      // 上ほど密に。地平線際は霞んで見えないので置かない
      const y = rand() * rand() * 46;
      const size = rand() < 0.15 ? 2 : 1;
      const alpha = 0.35 + rand() * 0.5;
      return `radial-gradient(${size}px ${size}px at ${x.toFixed(2)}% ${y.toFixed(2)}%, rgba(255,255,255,${alpha.toFixed(2)}) 0, transparent 100%)`;
    }).join(',');
  }, []);

  /* 地平線に並ぶ摩天楼のシルエット */
  const towers = useMemo(() => {
    const rand = mulberry32(90210);
    return Array.from({ length: TOWERS }, (_, i) => ({
      id: i,
      w: 1.1 + rand() * 3.4,
      h: 12 + rand() * rand() * 88,
      lit: rand() < 0.55,
    }));
  }, []);

  return (
    <div className="sky-viewport pointer-events-none fixed inset-0" aria-hidden="true">
      {/* 空のグラデーション。上は夜、地平線に向かって紫から桃色へ */}
      <div className="sky-gradient" />

      {/* 星。1 要素に 90 個ぶんのグラデーションを畳んである */}
      <div className="sky-stars" style={{ backgroundImage: stars }} />

      <div className="sky-drift">
        {/* レトロサン。横縞は下half ほど太くする */}
        <div className="sky-sun">
          <span className="sky-sun-stripes" />
        </div>

        {/* 地平線の摩天楼 */}
        <div className="sky-skyline">
          {towers.map((tower) => (
            <i
              key={tower.id}
              className={`sky-tower${tower.lit ? ' is-lit' : ''}`}
              style={{ width: `${tower.w}%`, height: `${tower.h}%` }}
            />
          ))}
        </div>
      </div>

      {/*
        床への映り込み。
        地平線を境に上下反転した同じ絵を、薄く歪ませて敷く。
        黒いガラスの床に反射しているように見せるためのもの。
      */}
      <div className="sky-mirror" aria-hidden="true">
        <div className="sky-sun">
          <span className="sky-sun-stripes" />
        </div>
        <div className="sky-skyline">
          {towers.map((tower) => (
            <i
              key={tower.id}
              className={`sky-tower${tower.lit ? ' is-lit' : ''}`}
              style={{ width: `${tower.w}%`, height: `${tower.h}%` }}
            />
          ))}
        </div>
      </div>

      {/* 磨いた床が光を拾っているように見せる帯 */}
      <div className="sky-gloss" />

      {/* 地平線の光。ここが一番明るく、上下へ滲む */}
      <div className="sky-horizon" />
    </div>
  );
};
