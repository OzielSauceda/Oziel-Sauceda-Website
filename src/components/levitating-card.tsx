"use client";
// reason: nested motion components (lift + per-letter sine drift + per-letter color wipe) need motion + useReducedMotion + parent hover propagation via variants

import { motion, useReducedMotion, type Variants } from "motion/react";
import { AlbumSprite, type AlbumKey } from "./album-sprite";

// Default palette for sections without an album stamp — warm-led with two
// cool reliefs so the cycle feels like dusk over the magenta ground.
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

function rotateRainbow(
  letterIdx: number,
  itemCount: number,
  palette: readonly string[],
): string[] {
  const n = palette.length;
  const k =
    itemCount >= n
      ? ((letterIdx % n) + n) % n
      : Math.round((letterIdx / itemCount) * n) % n;
  const arr = [...palette.slice(k), ...palette.slice(0, k)];
  arr.push(arr[0]); // close the loop seamlessly
  // Reverse so each letter walks backward through the palette — combined
  // with letter i starting at palette[i], this makes the color bands flow
  // left-to-right across the word instead of right-to-left.
  arr.reverse();
  return arr;
}

export type AlbumStamp = {
  // Settled text color — used at rest and after the hover wipe lands.
  baseColor: string;
  // Pixel-art hard offset shadow only. Always rendered. Glow lives on a
  // separate animated layer so it can be hover-only.
  textShadow: string;
  // Soft glow color applied via drop-shadow filter on hover. Same value
  // across all sections gets a consistent on-hover behavior; per-album
  // colors keep each section's identity in the glow.
  glowColor: string;
  // Each letter receives wipeColors[i % length] during the hover cascade.
  wipeColors: readonly string[];
};

type LevitatingCardProps = {
  title: string;
  href?: string;
  baseLift?: number;
  bobAmplitude?: number;
  bobDuration?: number;
  rainbowDuration?: number;
  stamp?: AlbumStamp;
  album?: AlbumKey;
  /** Optional numeric prefix rendered ahead of the album sprite (e.g. "01"). */
  label?: string;
  /** Inline pill layout (album + title on one row, smaller type) for use
      in the sticky header nav. Preserves the same lift / bob / glow /
      color-wipe behavior, just at a compact scale. */
  compact?: boolean;
};

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const BOB_TIMES = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
const BOB_SHAPE = [0, -0.707, -1, -0.707, 0, 0.707, 1, 0.707, 0] as const;

const LIFT_DURATION = 0.55;
const LIFT_STAGGER = 0.022;
const BOB_START_OFFSET = 0.15;

// Shared pixel-art shadow for sections without a custom album stamp.
// Definition lives in globals.css (`--shadow-pixel-text`) so the hero h1
// and the non-album section titles render the same exact shadow.
const DEFAULT_TEXT_SHADOW = "var(--shadow-pixel-text)";
const DEFAULT_GLOW_COLOR = "rgba(217, 70, 239, 0.45)";

export function LevitatingCard({
  title,
  href,
  baseLift,
  bobAmplitude,
  bobDuration = 1.7,
  rainbowDuration = 2.7,
  stamp,
  album,
  label,
  compact = false,
}: LevitatingCardProps) {
  const reduced = useReducedMotion();
  const useStamp = stamp !== undefined;
  const lift = baseLift ?? (compact ? 5 : 8);
  const bobAmp = bobAmplitude ?? (compact ? 1.8 : 3);

  const items = title.split("");

  const bobStagger = bobDuration / items.length;
  const bobKeyframes = BOB_SHAPE.map((s) => bobAmp * s);

  // Compact (header-nav) titles default to plain ink/white at rest — the
  // album palette only appears on hover via the wipe animation. The big
  // section-list variant still uses the stamp's tinted base color.
  const restColor = !compact && useStamp ? stamp.baseColor : "var(--color-ink)";

  const liftVariants: Variants = {
    rest: {
      y: 0,
      color: restColor,
      transition: { duration: 0.45, ease: EASE_OUT },
    },
    hover: (i: number) => {
      if (reduced) {
        return {
          y: 0,
          color: useStamp ? stamp.baseColor : "var(--color-accent)",
          transition: { duration: 0 },
        };
      }

      if (useStamp) {
        return {
          y: -lift,
          // Same rotating-rainbow flow as the non-stamp sections, but using
          // the album's wipeColors. Each letter starts at a different stop
          // so the whole palette is visible across the word at any moment
          // and continuously rolls through.
          color: rotateRainbow(i, items.length, stamp.wipeColors),
          transition: {
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
        };
      }

      return {
        y: -lift,
        color: rotateRainbow(i, items.length, RAINBOW),
        transition: {
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
      };
    },
  };

  // Glow lives on the title span as an animated drop-shadow filter so it's
  // hover-only and consistent across every section. The hard pixel offset
  // (textShadow) stays static on the inline style.
  const glowColor = useStamp ? stamp.glowColor : DEFAULT_GLOW_COLOR;
  const glowBlur = compact ? 4 : 9;
  const titleVariants: Variants = {
    rest: {
      filter: "drop-shadow(0 0 0 rgba(0,0,0,0))",
      transition: reduced
        ? { duration: 0 }
        : { duration: 0.3, ease: EASE_OUT },
    },
    hover: {
      filter: reduced
        ? "drop-shadow(0 0 0 rgba(0,0,0,0))"
        : `drop-shadow(0 0 ${glowBlur}px ${glowColor})`,
      transition: reduced
        ? { duration: 0 }
        : { duration: 0.35, ease: EASE_OUT },
    },
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

  const wrapperClass = compact
    ? "group relative inline-flex flex-row items-center gap-3 no-underline outline-none"
    : "group relative inline-flex flex-row items-center gap-5 no-underline outline-none sm:gap-6";
  const titleClass = compact
    ? "block whitespace-nowrap font-display text-[24px] font-normal uppercase leading-none tracking-[0.02em]"
    : "block whitespace-nowrap font-pixel text-[1.5rem] font-normal uppercase leading-[1.1] tracking-[0.04em] sm:text-[1.75rem] xl:text-[2rem]";
  const albumSize = compact ? 22 : 32;

  return (
    <Tag
      {...(href ? { href } : {})}
      initial="rest"
      animate="rest"
      whileHover="hover"
      {...(compact ? {} : { whileFocus: "hover" })}
      className={wrapperClass}
    >
      {label ? (
        <span
          aria-hidden
          className={
            compact
              ? "font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
              : "font-mono text-[12px] uppercase tracking-[0.22em] text-muted sm:text-[13px]"
          }
        >
          {label}
        </span>
      ) : null}
      {album ? <AlbumSprite album={album} size={albumSize} /> : null}
      <motion.span
        aria-label={title}
        variants={titleVariants}
        className={titleClass}
        style={{
          textShadow: useStamp ? stamp.textShadow : DEFAULT_TEXT_SHADOW,
        }}
      >
        {items.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            aria-hidden
            custom={i}
            variants={liftVariants}
            className="inline-block"
          >
            <motion.span
              custom={i}
              variants={bobVariants}
              className="inline-block"
            >
              {char === " " ? " " : char}
            </motion.span>
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
