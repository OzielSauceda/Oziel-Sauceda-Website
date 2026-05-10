"use client";
// reason: motion drives the one-time lid-open animation triggered after mount

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

const LAPTOP_W = 1000;
const LID_H = 680;
const BASE_H = 140;
const SCREEN_LEFT = 60;
const SCREEN_TOP = 36;
const SCREEN_W = 880;
const SCREEN_H = 550;
// VISUAL_W picked so the laptop fits on a 1366×768-class viewport with header.
const VISUAL_W = 940;
const SCALE = VISUAL_W / LAPTOP_W; // 0.94
const VISUAL_H = (LID_H + BASE_H) * SCALE;
const OPEN_DELAY_MS = 700;
const LID_OPEN_DUR_S = 1.6;
const LID_SETTLE_BUFFER_MS = 200;

const APPLE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Closed lid is rotated past flat (-100°) so the screen face is hidden
// behind the hinge plane until the rotation crosses -90° on the way up.
// Combined with backface-visibility: hidden, this makes the lid emerge
// dramatically from the hinge instead of just unfolding flat.
const LID_CLOSED_DEG = -100;
const LID_OVERSHOOT_DEG = 6;
// Two-stage cubic-bezier curves driving the rotation keyframes:
//   Stage 1 (closed → overshoot): heavy easeOut — the lid breaks free of
//   the latch fast and decelerates as it approaches upright.
//   Stage 2 (overshoot → settled): damped settle that absorbs the
//   overshoot like a real spring-loaded hinge.
const LID_RISE_EASE: [number, number, number, number] = [0.34, 0.18, 0.18, 1];
const LID_SETTLE_EASE: [number, number, number, number] = [0.42, 0, 0.58, 1];

const PERSPECTIVE_PX = 2400;

const COLORS = {
  bodyLight: "#f0dccb",
  bodyShade: "#c8924a",
  bodyDeep: "#8a5a3a",
  bezel: "#1a0828",
  screenOff: "#0a0212",
  hinge: "#6b1c24",
  hingeDark: "#3a1014",
  keyTop: "#d4ac6e",
  keyShade: "#8a5a3a",
  accent: "#facc15",
} as const;

// Module-level — boot sequence only plays once per page load. Subsequent
// re-mounts (e.g. navigating back to /) skip straight to the menu.
let hasBootedOnce = false;

// Xbox 360-inspired boot. Tech-flavored status lines that cycle as the
// progress bar fills. Order matters — they read as a real boot trace.
const BOOT_MESSAGES = [
  "POST OK ........ V1.0.7",
  "MOUNT /sauce",
  "LOAD MODULES.dll",
  "INIT WHEEL_OF_FORTUNE",
  "READY",
] as const;

const BOOT_DURATION_MS = 2800;
const BOOT_TICK_MS = 22;
const BOOT_HOLD_AFTER_MS = 320;

type Props = {
  children: ReactNode;
};

export function RetroLaptop({ children }: Props) {
  const reduced = useReducedMotion();
  const duration = reduced ? 0 : LID_OPEN_DUR_S;
  const [open, setOpen] = useState(false);
  const [lidOpen, setLidOpen] = useState(false);
  // bootDone: true once the boot typewriter finishes — gates the section menu
  const [bootDone, setBootDone] = useState(hasBootedOnce);

  useEffect(() => {
    if (reduced) {
      setOpen(true);
      setLidOpen(true);
      setBootDone(true);
      return;
    }
    const t1 = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    const t2 = window.setTimeout(
      () => setLidOpen(true),
      OPEN_DELAY_MS + LID_OPEN_DUR_S * 1000 + LID_SETTLE_BUFFER_MS,
    );
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduced]);

  const handleBootDone = useCallback(() => {
    window.setTimeout(() => setBootDone(true), 800);
  }, []);

  return (
    <div
      className="pointer-events-none relative pixel-art"
      style={{
        width: VISUAL_W,
        height: VISUAL_H,
        perspective: PERSPECTIVE_PX,
        perspectiveOrigin: "center 65%",
      }}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          width: LAPTOP_W,
          height: LID_H + BASE_H,
          transformOrigin: "0 0",
          transform: `scale(${SCALE})`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Lid — pivots around the hinge in 3D for an impressive opening.
            backfaceVisibility: hidden makes the lid invisible while it's
            rotated past edge-on (closed state), so it appears to "emerge"
            from the hinge as the rotation crosses -90°. */}
        <motion.div
          className="absolute left-0"
          style={{
            width: LAPTOP_W,
            height: LID_H,
            bottom: BASE_H,
            transformOrigin: "center bottom",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
          initial={false}
          animate={{
            rotateX: open
              ? [LID_CLOSED_DEG, LID_OVERSHOOT_DEG, 0]
              : LID_CLOSED_DEG,
          }}
          transition={{
            duration,
            ease: open
              ? [LID_RISE_EASE, LID_SETTLE_EASE]
              : APPLE_EASE,
            times: open ? [0, 0.86, 1] : undefined,
          }}
        >
          <div
            className="absolute left-0 top-0"
            style={{ width: LAPTOP_W, height: LID_H }}
          >
            <LidChassis />

            {/* Screen content */}
            <div
              className="pointer-events-auto absolute overflow-hidden"
              style={{
                left: SCREEN_LEFT,
                top: SCREEN_TOP,
                width: SCREEN_W,
                height: SCREEN_H,
              }}
            >
              {/* Section menu — fades in after boot completes */}
              <AnimatePresence>
                {bootDone && (
                  <motion.div
                    key="menu"
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.5, ease: APPLE_EASE }}
                  >
                    {children}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Boot / welcome overlay */}
              <AnimatePresence>
                {lidOpen && !bootDone && (
                  <motion.div
                    key="boot-screen"
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: reduced ? 0 : 0.18,
                      ease: APPLE_EASE,
                    }}
                  >
                    <BootScreen reduced={reduced ?? false} onDone={handleBootDone} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CRT power-on streak — a single horizontal beam appears at
                the screen's vertical center, then expands vertically to
                fill the screen as it fades. Mimics the way a real CRT
                gun warms up. Only fires after the lid finishes opening. */}
            {!reduced && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: SCREEN_LEFT,
                  top: SCREEN_TOP + SCREEN_H / 2 - 1,
                  width: SCREEN_W,
                  height: 2,
                  background:
                    "linear-gradient(to right, transparent 0%, rgba(255, 245, 200, 0.95) 18%, rgba(255, 220, 100, 1) 50%, rgba(255, 245, 200, 0.95) 82%, transparent 100%)",
                  boxShadow:
                    "0 0 12px rgba(255, 220, 100, 0.9), 0 0 24px rgba(250, 204, 21, 0.55)",
                  transformOrigin: "center center",
                  mixBlendMode: "screen",
                }}
                initial={{ opacity: 0, scaleY: 1, scaleX: 0.2 }}
                animate={
                  lidOpen
                    ? {
                        opacity: [0, 1, 1, 0.45, 0],
                        scaleX: [0.2, 1, 1, 1, 1],
                        scaleY: [1, 1, SCREEN_H / 2, SCREEN_H / 2, SCREEN_H / 2],
                      }
                    : { opacity: 0, scaleY: 1, scaleX: 0.2 }
                }
                transition={{
                  duration: 0.75,
                  times: [0, 0.12, 0.18, 0.55, 1],
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            )}

            {/* Scanlines + glow — fade in once lid settles */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                left: SCREEN_LEFT,
                top: SCREEN_TOP,
                width: SCREEN_W,
                height: SCREEN_H,
                background:
                  "repeating-linear-gradient(0deg, rgba(232,212,168,0.04) 0 2px, transparent 2px 4px)",
                boxShadow: `inset 0 0 80px rgba(250, 204, 21, 0.18)`,
                mixBlendMode: "screen",
              }}
              initial={false}
              animate={{ opacity: lidOpen ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.5, ease: APPLE_EASE }}
            />
          </div>
        </motion.div>

        {/* Base — always visible. Wrapped in a motion.div so we can give
            the chassis a tiny "thud" shake when the lid lands open. */}
        <motion.div
          className="absolute bottom-0 left-0"
          style={{ width: LAPTOP_W, height: BASE_H }}
          initial={false}
          animate={
            !reduced && lidOpen
              ? { y: [0, -3, 2, -1, 0] }
              : { y: 0 }
          }
          transition={{
            duration: lidOpen ? 0.32 : 0,
            ease: "easeOut",
            times: lidOpen ? [0, 0.2, 0.5, 0.8, 1] : undefined,
          }}
        >
          <BaseChassis />

          {/* Power LED pulse — fires the moment the boot sequence starts.
              Sits exactly over the LED rect inside BaseChassis. */}
          {!reduced && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                left: LAPTOP_W - 36,
                top: 2,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(250,204,21,1) 28%, rgba(250,204,21,0.55) 50%, transparent 80%)",
                filter: "blur(1px)",
                mixBlendMode: "screen",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={
                open
                  ? {
                      opacity: [0, 1, 0.4, 1, 0.5, 0.9, 0.7],
                      scale: [0.6, 1.4, 1, 1.2, 1, 1.1, 1],
                    }
                  : { opacity: 0, scale: 0.6 }
              }
              transition={{
                duration: 1.6,
                times: [0, 0.1, 0.25, 0.45, 0.6, 0.8, 1],
                ease: "easeOut",
              }}
            />
          )}

          {/* Keyboard wake-up sweep — a warm light sweeps left→right across
              the keys while the lid rises. Makes the base feel as alive as
              the lid during the open sequence so the keyboard doesn't read
              as a tiny static stripe under a giant rotating screen. */}
          {!reduced && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{ mixBlendMode: "screen" }}
            >
              <motion.div
                className="absolute inset-y-0"
                style={{
                  width: "55%",
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(250,204,21,0.18) 35%, rgba(255,237,160,0.55) 50%, rgba(250,204,21,0.18) 65%, transparent 100%)",
                  filter: "blur(2px)",
                }}
                initial={{ x: "-90%" }}
                animate={open ? { x: "180%" } : { x: "-90%" }}
                transition={{
                  duration: 1.4,
                  ease: [0.45, 0.05, 0.55, 0.95],
                  delay: 0.1,
                }}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function BootScreen({ reduced, onDone }: { reduced: boolean; onDone: () => void }) {
  const [progress, setProgress] = useState(hasBootedOnce ? 100 : 0);
  const [textIdx, setTextIdx] = useState(
    hasBootedOnce ? BOOT_MESSAGES.length - 1 : 0,
  );

  useEffect(() => {
    if (hasBootedOnce || reduced) {
      setProgress(100);
      setTextIdx(BOOT_MESSAGES.length - 1);
      hasBootedOnce = true;
      onDone();
      return;
    }

    const startedAt = performance.now();
    let timer: number | undefined;
    let finished = false;

    const tick = () => {
      const elapsed = performance.now() - startedAt;
      const next = Math.min(100, (elapsed / BOOT_DURATION_MS) * 100);
      setProgress(next);
      const idx = Math.min(
        BOOT_MESSAGES.length - 1,
        Math.floor((next / 100) * BOOT_MESSAGES.length),
      );
      setTextIdx(idx);
      if (next >= 100) {
        if (!finished) {
          finished = true;
          hasBootedOnce = true;
          window.setTimeout(onDone, BOOT_HOLD_AFTER_MS);
        }
        return;
      }
      timer = window.setTimeout(tick, BOOT_TICK_MS);
    };

    timer = window.setTimeout(tick, BOOT_TICK_MS);
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [reduced, onDone]);

  const accent = "#facc15";
  const cream = "#fff7ed";

  const QUADRANTS: Array<{ d: string; delay: number }> = [
    { d: "M 50 6 A 44 44 0 0 1 94 50", delay: 0 },
    { d: "M 94 50 A 44 44 0 0 1 50 94", delay: 0.25 },
    { d: "M 50 94 A 44 44 0 0 1 6 50", delay: 0.5 },
    { d: "M 6 50 A 44 44 0 0 1 50 6", delay: 0.75 },
  ];

  return (
    <div className="flex h-full w-full items-center justify-center px-10">
      <div className="flex flex-col items-center gap-7">
        {/* Concentric rotating rings — Xbox 360 inspired ring stack */}
        <div className="relative" style={{ width: 156, height: 156 }} aria-hidden>
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-0"
            animate={reduced ? {} : { rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="50" cy="50" r="49" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="0.6" strokeDasharray="2 3" />
            <circle cx="50" cy="50" r="46" fill="none" stroke={accent} strokeOpacity="0.18" strokeWidth="0.4" />
          </motion.svg>

          <motion.svg
            viewBox="0 0 100 100"
            className="absolute"
            style={{ inset: 12 }}
            animate={reduced ? {} : { rotate: -360 }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="50" cy="50" r="44" fill="none" stroke={accent} strokeOpacity="0.16" strokeWidth="2" />
            {QUADRANTS.map((q, i) => (
              <motion.path
                key={i}
                d={q.d}
                fill="none"
                stroke={accent}
                strokeWidth="3.2"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px rgba(250,204,21,0.7))" }}
                initial={{ opacity: 0.18 }}
                animate={reduced ? { opacity: 1 } : { opacity: [0.18, 1, 0.18] }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 1.6, repeat: Infinity, delay: q.delay, ease: "easeInOut" }
                }
              />
            ))}
          </motion.svg>

          <motion.svg
            viewBox="0 0 100 100"
            className="absolute"
            style={{ inset: 30 }}
            animate={reduced ? {} : { rotate: 360 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="50" cy="50" r="38" fill="none" stroke={cream} strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="2 4" />
            <path d="M 50 12 A 38 38 0 0 1 88 50" fill="none" stroke={cream} strokeOpacity="0.85" strokeWidth="2" strokeLinecap="round" />
          </motion.svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="font-pixel"
              style={{
                fontSize: 26,
                color: accent,
                letterSpacing: "0.04em",
                textShadow: "0 0 12px rgba(250,204,21,0.75), 0 0 24px rgba(250,204,21,0.35)",
              }}
              animate={reduced ? {} : { opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
              }
            >
              /S/
            </motion.span>
          </div>
        </div>

        <div className="text-center" style={{ minHeight: 18 }} aria-live="polite">
          <motion.h2
            key={textIdx}
            className="font-pixel uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.32em",
              color: cream,
              textShadow: "var(--shadow-pixel-text)",
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.22, ease: APPLE_EASE }}
          >
            <span style={{ color: accent }}>&gt;_</span> {BOOT_MESSAGES[textIdx]}
          </motion.h2>
        </div>

        <div className="flex w-[300px] flex-col gap-2">
          <div
            className="relative h-[3px] overflow-hidden"
            style={{
              background: "rgba(255,247,237,0.12)",
              boxShadow: "inset 0 0 0 1px rgba(255,247,237,0.06)",
            }}
          >
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${progress}%`,
                background: accent,
                boxShadow: "0 0 8px rgba(250,204,21,0.85), 0 0 18px rgba(250,204,21,0.4)",
              }}
              transition={{ duration: 0 }}
            />
          </div>
          <div
            className="flex items-center justify-between font-mono uppercase"
            style={{
              fontSize: 9,
              letterSpacing: "0.22em",
              color: "rgba(255,247,237,0.55)",
            }}
          >
            <span>SAUCE_OS / V1.0</span>
            <span style={{ color: accent }}>
              {Math.floor(progress).toString().padStart(2, "0")}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LidChassis() {
  const HINGE_H = 20;
  const BODY_H = LID_H - HINGE_H;
  const SIDE_DEPTH = 6;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={LAPTOP_W}
      height={LID_H}
      viewBox={`0 0 ${LAPTOP_W} ${LID_H}`}
      shapeRendering="crispEdges"
      className="block"
    >
      <rect x="0" y="4" width={LAPTOP_W - SIDE_DEPTH} height={BODY_H - 8} fill={COLORS.bodyLight} />
      <rect x={LAPTOP_W - SIDE_DEPTH} y="8" width={SIDE_DEPTH} height={BODY_H - 12} fill={COLORS.bodyShade} />
      <rect x="6" y="0" width={LAPTOP_W - 12} height="4" fill={COLORS.bodyLight} />
      <rect x="0" y={BODY_H - 4} width={LAPTOP_W} height="4" fill={COLORS.bodyShade} />

      <rect x="18" y="12" width={LAPTOP_W - 36} height={BODY_H - 24} fill={COLORS.bodyShade} />
      <rect x="22" y="16" width={LAPTOP_W - 44} height={BODY_H - 32} fill={COLORS.bezel} />

      <rect x={SCREEN_LEFT} y={SCREEN_TOP} width={SCREEN_W} height={SCREEN_H} fill={COLORS.screenOff} />

      <g fill={COLORS.bodyLight} opacity="0.7">
        <rect x={LAPTOP_W / 2 - 10} y={BODY_H - 14} width="4" height="4" />
        <rect x={LAPTOP_W / 2 - 2} y={BODY_H - 14} width="4" height="4" />
        <rect x={LAPTOP_W / 2 + 6} y={BODY_H - 14} width="4" height="4" />
      </g>

      <rect x="0" y={BODY_H} width={LAPTOP_W} height={HINGE_H} fill={COLORS.hinge} />
      <rect x="6" y={BODY_H + 4} width={LAPTOP_W - 12} height="2" fill={COLORS.hingeDark} />
      <rect x="6" y={BODY_H + 12} width={LAPTOP_W - 12} height="2" fill={COLORS.hingeDark} />
      <rect x="40" y={BODY_H + 6} width="6" height="6" fill={COLORS.hingeDark} />
      <rect x={LAPTOP_W - 46} y={BODY_H + 6} width="6" height="6" fill={COLORS.hingeDark} />
    </svg>
  );
}

function BaseChassis() {
  const KEY_W = 36;
  const KEY_H = 11;
  const KEY_GAP = 5;
  const COLS = 16;
  const ROWS = 5;
  const KEYBOARD_W = COLS * (KEY_W + KEY_GAP) - KEY_GAP;
  const KEYBOARD_LEFT = Math.round((LAPTOP_W - KEYBOARD_W) / 2);
  const KEYBOARD_TOP = 18;

  const DECK_H = 120;
  const LIP_H = 8;

  const keys: Array<{ x: number; y: number; w: number; h: number; key: string }> = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      keys.push({
        x: KEYBOARD_LEFT + col * (KEY_W + KEY_GAP),
        y: KEYBOARD_TOP + row * (KEY_H + KEY_GAP),
        w: KEY_W,
        h: KEY_H,
        key: `${row}-${col}`,
      });
    }
  }

  const SPACE_Y = KEYBOARD_TOP + ROWS * (KEY_H + KEY_GAP);
  const SPACE_W = Math.round(LAPTOP_W * 0.36);
  const SPACE_X = Math.round((LAPTOP_W - SPACE_W) / 2);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={LAPTOP_W}
      height={BASE_H}
      viewBox={`0 0 ${LAPTOP_W} ${BASE_H}`}
      shapeRendering="crispEdges"
      className="block"
    >
      <rect x="0" y="0" width={LAPTOP_W - 6} height={DECK_H} fill={COLORS.bodyLight} />
      <rect x={LAPTOP_W - 6} y="0" width="6" height={DECK_H} fill={COLORS.bodyShade} />
      <rect x="0" y="0" width={LAPTOP_W} height="2" fill={COLORS.bodyShade} />

      <rect x="0" y={DECK_H} width={LAPTOP_W} height={LIP_H} fill={COLORS.hingeDark} />
      <rect
        x="20"
        y={DECK_H + LIP_H + 2}
        width={LAPTOP_W - 40}
        height="4"
        fill="#000"
        opacity="0.32"
      />

      {keys.map(({ x, y, w, h, key }) => (
        <g key={key}>
          <rect x={x} y={y + 1} width={w} height={h} fill={COLORS.keyShade} />
          <rect x={x} y={y} width={w} height={h - 2} fill={COLORS.keyTop} />
        </g>
      ))}

      <rect x={SPACE_X} y={SPACE_Y + 1} width={SPACE_W} height={KEY_H} fill={COLORS.keyShade} />
      <rect x={SPACE_X} y={SPACE_Y} width={SPACE_W} height={KEY_H - 2} fill={COLORS.keyTop} />

      <rect x={LAPTOP_W - 32} y="6" width="6" height="6" fill={COLORS.accent} />
    </svg>
  );
}
