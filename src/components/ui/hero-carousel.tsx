"use client"

// A full-bleed editorial hero driven by a filmstrip.
//
// Every card shares one top edge. The focused card unfurls to full height while
// its neighbours stay clipped to half, so the strip reads as a row of cropped
// heads with one complete portrait standing in the middle of it. Changing the
// focus re-grades the whole background to that image.
//
// Geometry is measured, never hard-coded: one ResizeObserver reads the stage and
// every size below is a ratio of it, so the same component is pixel-identical in
// a 600px preview box and on a 4K display.
import * as React from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion"

import { cn } from "@/lib/utils"

export interface HeroCarouselItem {
  /** Stable key; falls back to the index. @default undefined */
  id?: string | number
  /** Headline for the active slide. Newlines become separate reveal lines. */
  title: string
  /** Image URL, used both in the card and as the graded background. */
  image: string
  /** Byline printed beside the headline, e.g. "BY AURELIA STUDIO." @default undefined */
  credit?: string
  /** Right-aligned facts, e.g. ["SAT NOV 15", "5-10 PM", "MIAMI"]. @default undefined */
  meta?: string[]
  /**
   * CSS colour the background is graded to. The photo keeps its luminance and
   * takes this hue, which is what makes the backdrop swing on every change.
   * @default "#8a8a8a"
   */
  accent?: string
}

export interface HeroCarouselProps {
  /** Slides, in strip order. */
  items: HeroCarouselItem[]
  /** Focused slide when controlled. Leave unset for internal state. @default undefined */
  index?: number
  /** Focused slide on mount when uncontrolled. @default 0 */
  defaultIndex?: number
  /** Fires on every focus change, from any input. @default undefined */
  onIndexChange?: (index: number) => void
  /** Wordmark in the middle of the top bar. @default undefined */
  brand?: React.ReactNode
  /** Renders the "Back" control when provided. @default undefined */
  onBack?: () => void
  /** Renders the "Menu" control when provided. @default undefined */
  onMenu?: () => void
  /** Advance on a timer. Pauses on hover, drag and focus. @default false */
  autoplay?: boolean
  /** Milliseconds between autoplay steps. @default 4000 */
  autoplayDelay?: number
  /** Extra classes for the stage. @default undefined */
  className?: string
}

/*
 * 寸法の比率。
 *
 * 上流は 3:4 の人物写真を全画面で見せる前提だったが、ここに載るのは
 * 横長のスクリーンショットで、しかもセクションの一部という限られた箱に入る。
 * そのままだと画像が縦に切り落とされ、文字も小さすぎて読めないので、
 * 縦横比と文字の比率をこの用途向けに取り直している。
 */
const CARD_AR = 1.6 // 横長のスクリーンショットに合わせる（上流は 0.75 の縦長）
const CARD_W = 0.3 // カード幅 ÷ ステージ幅
const CARD_H = 0.33 // カード高さの上限 ÷ ステージ高さ
const GAP = 0.05 // すき間 ÷ カード幅
const STRIP_TOP = 0.52 // 帯の上辺の位置
const TITLE = 0.088 // 見出し ÷ ステージ高さ
const LABEL = 0.019 // 小さいラベル ÷ ステージ高さ
const PAD = 0.03 // 左右の余白 ÷ ステージ幅
const RAIL = 0.18 // 位置バー ÷ ステージ幅

/** Wheel distance that commits to a step, and the lockout after one. */
const WHEEL_THRESHOLD = 60
const WHEEL_COOLDOWN = 420

/* Film grain, as a self-contained SVG so the component carries no assets. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

export function HeroCarousel({
  items,
  index: controlled,
  defaultIndex = 0,
  onIndexChange,
  brand,
  onBack,
  onMenu,
  autoplay = false,
  autoplayDelay = 4000,
  className,
}: HeroCarouselProps) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState({ w: 0, h: 0 })
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex)
  const [dragging, setDragging] = React.useState(false)
  const reduced = useReducedMotion()

  const last = items.length - 1
  const index = clamp(controlled ?? uncontrolled, 0, Math.max(0, last))

  const go = React.useCallback(
    (next: number) => {
      const clamped = clamp(next, 0, Math.max(0, last))
      if (controlled === undefined) setUncontrolled(clamped)
      if (clamped !== index) onIndexChange?.(clamped)
    },
    [controlled, index, last, onIndexChange]
  )

  // One observer feeds every measurement below.
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const read = () =>
      setBox({ w: stage.clientWidth, h: stage.clientHeight })
    read()
    const ro = new ResizeObserver(read)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [])

  /*
   * カードの大きさは幅と高さの両方から決める。
   * 上流は高さだけを見ていたので、縦長の画面では横幅がステージを
   * 突き抜けてカードが見切れていた（スマホで顕著）。
   */
  const byWidth = clamp(box.w * CARD_W, 132, 460)
  const byHeight = clamp(box.h * CARD_H, 88, 290) * CARD_AR
  const cardW = Math.min(byWidth, byHeight)
  const fullH = cardW / CARD_AR
  const halfH = fullH / 2
  const gap = Math.max(6, Math.round(cardW * GAP))
  const step = cardW + gap
  const pad = Math.max(14, Math.round(box.w * PAD))
  const label = Math.max(11, Math.round(box.h * LABEL))
  const title = clamp(Math.round(box.h * TITLE), 20, 52)

  // Centre the focused card: the track slides, the card never moves itself.
  const xFor = React.useCallback(
    (i: number) => box.w / 2 - (i * step + cardW / 2),
    [box.w, step, cardW]
  )
  const x = useMotionValue(0)
  const target = xFor(index)

  /*
   * 自動送りの残り時間。0 → 1 で 1 周する。
   *
   * 送りの本体は下の setTimeout で、こちらは見せるためだけの値。
   * 依存を同じに揃えてあるので、止まれば一緒に止まり、
   * 再開すれば一緒に振り出しへ戻る（上流の autoplay も
   * 一時停止のたびに待ち時間を取り直す作りなので、それに合わせる）。
   */
  const wait = useMotionValue(0)

  const swing = reduced
    ? { duration: 0 }
    : { duration: 0.7, ease: "easeOut" as const }
  const spring = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 34, mass: 0.9 }

  // The track is driven by a motion value rather than an `animate` prop so a
  // drag that starts mid-spring reads the real position, not where the spring
  // was headed - otherwise the release snaps a card off.
  React.useEffect(() => {
    if (dragging) return
    const run = animate(x, target, spring)
    return () => run.stop()
    // `spring` is a literal, so `reduced` (all it derives from) stands in for it.
  }, [target, dragging, reduced, x]) // eslint-disable-line react-hooks/exhaustive-deps

  // Wheel and trackpad. Both axes step the strip.
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let acc = 0
    let until = 0

    const onWheel = (e: WheelEvent) => {
      // Trackpads report the dominant axis; take whichever is stronger.
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      // Scroll chaining: once the strip is against an end, hand the gesture
      // back to the page. Without this a full-height carousel is a scroll trap
      // with no way past it.
      const stuck = (delta > 0 && index === last) || (delta < 0 && index === 0)
      if (stuck) {
        acc = 0
        return
      }
      e.preventDefault()
      const now = e.timeStamp
      if (now < until) return
      acc += delta
      if (Math.abs(acc) < WHEEL_THRESHOLD) return
      go(index + Math.sign(acc))
      acc = 0
      until = now + WHEEL_COOLDOWN
    }

    stage.addEventListener("wheel", onWheel, { passive: false })
    return () => stage.removeEventListener("wheel", onWheel)
    // 上流は last を依存に入れていない。枚数が変わったとき端の判定が
    // 古いままになり、スクロールの受け渡しが壊れるので足してある。
  }, [go, index, last])

  /*
   * 自動送り。
   *
   * 上流はホバーとフォーカスでも止めていたが、このカルーセルは
   * セクションのほぼ全面を占めるので、見ているあいだ常にポインタが
   * 上にあり、実質ずっと止まったままになる。カードを 1 枚選ぶと
   * フォーカスもそこに残るので、以後まったく動かなくなっていた。
   *
   * 止めるのはドラッグ中だけにする。手で送ったときは index が変わって
   * この effect が張り直され、待ち時間が最初から数え直されるので、
   * 選んだ直後にすぐ送られてしまうこともない。
   */
  React.useEffect(() => {
    if (!autoplay || dragging || items.length < 2) return
    const id = window.setTimeout(
      () => go(index === last ? 0 : index + 1),
      autoplayDelay
    )
    return () => window.clearTimeout(id)
  }, [autoplay, autoplayDelay, dragging, go, index, items.length, last])

  /* ゲージ。上の setTimeout と同じ条件で回す */
  React.useEffect(() => {
    if (!autoplay || items.length < 2) return
    wait.set(0)
    if (dragging || reduced) return
    const run = animate(wait, 1, {
      duration: autoplayDelay / 1000,
      ease: "linear",
    })
    return () => run.stop()
  }, [autoplay, autoplayDelay, dragging, index, items.length, reduced, wait])

  const active = items[index]
  if (!active) return null

  const lines = active.title.split("\n")
  const accent = active.accent ?? "#8a8a8a"

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured looks"
      onKeyDown={(e) => {
        const keys: Record<string, number> = {
          ArrowLeft: index - 1,
          ArrowRight: index + 1,
          Home: 0,
          End: last,
        }
        if (!(e.key in keys)) return
        e.preventDefault()
        go(keys[e.key]!)
      }}
      className={cn(
        "relative h-full min-h-[24rem] w-full overflow-hidden bg-black text-white select-none",
        "outline-none focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-inset",
        className
      )}
    >
      {/* ── Background: the focused photo, blown up and re-hued to its accent ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={swing}
        >
          <motion.img
            src={active.image}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: reduced ? 1.28 : 1.42 }}
            animate={{ scale: 1.28 }}
            transition={reduced ? { duration: 0 } : { duration: 6, ease: "linear" }}
          />
          {/*
            色相を乗せる層。上流は不透明で完全に置き換えていたが、
            それだとサムネイルが何色のサービスか判らなくなる。
            半分だけ乗せて、元の色を透かす。
          */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{ backgroundColor: accent, mixBlendMode: "color" }}
          />
          {/*
            上流は 55% で焼き込んでいたが、色を乗せたうえに濃く掛けると
            サムネイルが色の塊になって何のサービスか判らない。
            背景として沈める程度に留める。
          */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundColor: accent, mixBlendMode: "multiply" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Legibility wash + grain, above the swap so they never flicker. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      {/*
        文字が乗る左側だけ、もう一枚敷いて下地を作る。
        色被せを薄くしてサムネを見せるようにしたぶん、背景の絵が
        そのまま文字の裏に来るので、ここが無いと題名が読めない。
      */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 from-0% via-black/15 via-30% to-transparent to-55%" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
      />

      {/* ── Top bar: a centred cluster, not edge-to-edge ── */}
      <div
        className="absolute inset-x-0 flex items-center justify-center"
        style={{ top: Math.max(16, box.h * 0.029), gap: `${Math.max(20, box.w * 0.06)}px` }}
      >
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="opacity-90 transition-opacity hover:opacity-100"
            style={{ fontSize: label * 1.15 }}
          >
            <span aria-hidden>↖</span> Back
          </button>
        ) : null}
        {brand ? (
          <div
            className="font-semibold tracking-[0.06em]"
            style={{ fontSize: label * 1.35 }}
          >
            {brand}
          </div>
        ) : null}
        {onMenu ? (
          <button
            type="button"
            onClick={onMenu}
            className="opacity-90 transition-opacity hover:opacity-100"
            style={{ fontSize: label * 1.15 }}
          >
            Menu <span aria-hidden>☰</span>
          </button>
        ) : null}
      </div>

      {/*
        ── 自動送りの待機ゲージ ──
        右上のリングが 1 周すると次のカードへ移る。
        触っているあいだ（ホバー・ドラッグ・フォーカス）は自動送りが
        止まるので、そのときは輪も止めて中に「一時停止」を出す。
      */}
      {autoplay && items.length > 1 ? (
        <div
          className="pointer-events-none absolute z-10 flex items-center justify-center"
          style={{
            top: Math.max(12, box.h * 0.03),
            right: pad,
            width: Math.max(34, Math.round(box.h * 0.062)),
            height: Math.max(34, Math.round(box.h * 0.062)),
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            {/* 背景の写真の上でも輪が読めるよう、下に暗い面を敷く */}
            <circle cx="18" cy="18" r="17" className="fill-cyber-black/70" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-neon-green opacity-30"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-neon-green drop-shadow-[0_0_4px_rgba(255,85,0,0.9)]"
              style={{ pathLength: wait }}
            />
          </svg>

          {/* 止まっているあいだの目印 */}
          {dragging ? (
            <span
              className="absolute flex gap-[2px]"
              style={{ height: Math.max(7, box.h * 0.012) }}
            >
              <i className="block w-[2px] bg-neon-green" />
              <i className="block w-[2px] bg-neon-green" />
            </span>
          ) : null}
        </div>
      ) : null}

      {/* ── 見出し・説明・使用技術。帯の上辺のすぐ上に積む ── */}
      <div
        className="absolute inset-x-0 top-0 flex flex-col justify-end"
        style={{
          height: `${STRIP_TOP * 100}%`,
          paddingLeft: pad,
          paddingRight: pad,
          paddingBottom: Math.round(box.h * 0.03),
        }}
      >
        {/*
          縦に積む。上流は見出しと添え書きを 1 行に flex-wrap で並べていたが、
          日本語の説明文が入ると行が潰れて読めなくなる。
        */}
        <div className="flex w-full flex-col gap-2 md:gap-3">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h3
              key={index}
              /*
                overflow-hidden は使わない。上流は行ごとに隠して下から
                せり上げていたが、日本語だと文字の上下が欠ける。
                動きは透明度と小さな移動だけで付ける。
              */
              className="font-bold leading-tight tracking-tight text-neon-white"
              style={{ fontSize: title }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              transition={reduced ? { duration: 0 } : { duration: 0.45 }}
            >
              {lines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </motion.h3>
          </AnimatePresence>

          {active.credit ? (
            <motion.p
              key={`credit-${index}`}
              /* 説明文。読ませたいので幅を絞って行長を抑える */
              className="max-w-[46ch] leading-relaxed text-neon-white opacity-90"
              style={{ fontSize: Math.max(13, label * 1.15) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 0.08 }}
            >
              {active.credit}
            </motion.p>
          ) : null}

          {active.meta?.length ? (
            /* 使用技術。見出しの下に並べる（上流は右端に小さく置いていた） */
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              {active.meta.map((fact, i) => (
                <motion.span
                  key={`${index}-${fact}`}
                  /* 背景がオレンジなので、下に黒を敷かないと枠ごと沈む */
                  className="border border-neon-green bg-cyber-black/80 px-2 py-0.5 font-mono uppercase tracking-widest text-neon-green"
                  style={{ fontSize: Math.max(10, label * 0.82) }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduced ? { duration: 0 } : { duration: 0.35, delay: 0.12 + i * 0.05 }
                  }
                >
                  {fact}
                </motion.span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── The strip: one shared top edge, the focused card twice as tall ── */}
      <div
        className="absolute inset-x-0"
        style={{ top: `${STRIP_TOP * 100}%`, height: fullH }}
      >
        <motion.div
          className="flex items-start"
          style={{ gap, x, cursor: dragging ? "grabbing" : "grab" }}
          drag="x"
          dragMomentum={false}
          dragElastic={0.08}
          dragConstraints={{ left: xFor(last), right: xFor(0) }}
          onDragStart={() => setDragging(true)}
          onDragEnd={(_, info) => {
            setDragging(false)
            // Land on whatever card the release sits nearest, nudged by throw
            // velocity so a flick clears more than one card.
            const thrown = x.get() + info.velocity.x * 0.12
            go(Math.round((box.w / 2 - thrown - cardW / 2) / step))
          }}
        >
          {items.map((item, i) => (
            <motion.button
              key={item.id ?? i}
              type="button"
              aria-label={item.title.replace(/\n/g, " ")}
              aria-current={i === index}
              onClick={() => go(i)}
              className="relative shrink-0 overflow-hidden rounded-none bg-white/5"
              style={{ width: cardW }}
              animate={{ height: i === index ? fullH : halfH }}
              transition={spring}
            >
              {/*
                開いている 1 枚は全体を見せる（contain）。スクリーンショットは
                端に情報があるので、切ると何のサービスか判らなくなる。
                半分に切られている隣のカードは cover で埋める。
              */}
              <img
                src={item.image}
                alt=""
                draggable={false}
                className={
                  i === index
                    ? "h-full w-full object-contain"
                    : "h-full w-full object-cover"
                }
                style={{ objectPosition: "50% 30%" }}
              />
              {/* Unfocused cards sit back a touch without going grey. */}
              <motion.span
                aria-hidden
                className="absolute inset-0 bg-black"
                animate={{ opacity: i === index ? 0 : 0.12 }}
                transition={spring}
              />
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* ── Position rail ── */}
      <div
        className="absolute"
        style={{ left: pad, bottom: Math.max(14, box.h * 0.022), width: box.w * RAIL }}
      >
        <div
          className="flex justify-between font-mono tabular-nums opacity-80"
          style={{ fontSize: label }}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{String(items.length).padStart(2, "0")}</span>
        </div>
        <div className="relative mt-2 h-px w-full bg-white/25">
          <motion.div
            className="absolute inset-y-0 bg-white"
            style={{ width: `${100 / items.length}%` }}
            animate={{ left: `${(index / items.length) * 100}%` }}
            transition={spring}
          />
        </div>
      </div>
    </div>
  )
}
