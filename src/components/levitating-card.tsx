"use client";
// reason: nested motion components (lift + per-letter sine drift + rainbow cycle) need motion + useReducedMotion + parent hover propagation via variants

import { motion, useReducedMotion, type Variants } from "motion/react";

// Tuned to the magenta→violet ground: warm-led with two cool reliefs so the
// cycle feels like dusk over the gradient instead of a stock RGB wheel.
const RAINBOW = [
  "#fff3b0",
  "#facc15",
  "#ff9c5c",
  "#ff5d8f",
  "#ff5dd0",
  "#c084fc",
  "#86efac",
  "#7dd3fc",
] as const;

function rotateRainbow(letterIdx: number, itemCount: number): string[] {
  const n = RAINBOW.length;
  // Words shorter than the palette get an even spread across all 8 stops so
  // the full rainbow is visible at any moment, not just clumped-adjacent hues.
  // Words at or beyond palette length keep the 1-letter = 1-stop march.
  const k =
    itemCount >= n
      ? ((letterIdx % n) + n) % n
      : Math.round((letterIdx / itemCount) * n) % n;
  const arr = [...RAINBOW.slice(k), ...RAINBOW.slice(0, k)];
  arr.push(arr[0]); // close the loop seamlessly
  return arr;
}

type LevitatingCardProps = {
  label: string;
  title: string;
  href?: string;
  baseLift?: number;
  bobAmplitude?: number;
  bobDuration?: number;
  rainbowDuration?: number;
};

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Full sine sampled at 9 points — drifts above and below the hover height,
// returns to its phase origin so repeat: Infinity loops without a snap.
const BOB_TIMES = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
const BOB_SHAPE = [0, -0.707, -1, -0.707, 0, 0.707, 1, 0.707, 0] as const;

const LIFT_DURATION = 0.55;
const LIFT_STAGGER = 0.022;
// Wave starts while letters are still rising — composes cleanly with the
// lift (ease-out is ~70% complete by here) and skips the staged pause.
const BOB_START_OFFSET = 0.15;

export function LevitatingCard({
  label,
  title,
  href,
  baseLift = 8,
  bobAmplitude = 3,
  bobDuration = 1.7,
  rainbowDuration = 2.7,
}: LevitatingCardProps) {
  const reduced = useReducedMotion();

  const characters = title.split("");
  const items: Array<{ char: string; isArrow: boolean }> = characters.map(
    (c) => ({ char: c, isArrow: false }),
  );
  if (href) items.push({ char: "→", isArrow: true });

  // Phase-offset each letter across one full bob period so a soft wave rolls
  // through the word at the same pace regardless of its length.
  const bobStagger = bobDuration / items.length;
  const bobKeyframes = BOB_SHAPE.map((s) => bobAmplitude * s);

  const liftVariants: Variants = {
    rest: {
      y: 0,
      color: "var(--color-ink)",
      transition: { duration: 0.45, ease: EASE_OUT },
    },
    hover: (i: number) => ({
      y: reduced ? 0 : -baseLift,
      color: reduced ? "var(--color-accent)" : rotateRainbow(i, items.length),
      transition: reduced
        ? { duration: 0 }
        : {
            y: {
              duration: LIFT_DURATION,
              ease: EASE_OUT,
              delay: i * LIFT_STAGGER,
            },
            color: {
              duration: rainbowDuration,
              repeat: Infinity,
              ease: "linear",
            },
          },
    }),
  };

  const bobVariants: Variants = {
    rest: {
      y: 0,
      transition: { duration: 0.45, ease: EASE_OUT },
    },
    hover: (i: number) => ({
      y: reduced ? 0 : bobKeyframes,
      transition: reduced
        ? { duration: 0 }
        : {
            duration: bobDuration,
            delay: BOB_START_OFFSET + i * bobStagger,
            repeat: Infinity,
            times: BOB_TIMES,
            ease: "linear",
          },
    }),
  };

  const Tag = href ? motion.a : motion.div;

  return (
    <Tag
      {...(href ? { href } : {})}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      className="group relative inline-flex flex-col items-start no-underline outline-none"
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
        {label}
      </span>
      <span
        aria-label={title}
        className="mt-10 block whitespace-nowrap pt-2 font-pixel text-[2rem] font-normal leading-[1.2] tracking-normal sm:text-[3rem]"
      >
        {items.map((item, i) => {
          const outerClass = item.isArrow
            ? "ml-2 inline-block translate-y-[-0.05em] text-lg sm:ml-3 sm:text-xl"
            : "inline-block";
          return (
            <motion.span
              key={item.isArrow ? "arrow" : `${item.char}-${i}`}
              aria-hidden
              custom={i}
              variants={liftVariants}
              className={outerClass}
            >
              <motion.span
                custom={i}
                variants={bobVariants}
                className="inline-block"
              >
                {item.char === " " ? " " : item.char}
              </motion.span>
            </motion.span>
          );
        })}
      </span>
    </Tag>
  );
}
