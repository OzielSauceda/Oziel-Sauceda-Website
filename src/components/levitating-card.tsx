"use client";
// reason: per-letter motion (the wave + per-letter color cycle for the rainbow flow) requires motion components + useReducedMotion hook + parent hover state propagation via variants

import { motion, useReducedMotion, type Variants } from "motion/react";

const RAINBOW = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
] as const;

function rotateRainbow(startIndex: number): string[] {
  const n = RAINBOW.length;
  const k = ((startIndex % n) + n) % n;
  const arr = [...RAINBOW.slice(k), ...RAINBOW.slice(0, k)];
  arr.push(arr[0]); // close the loop seamlessly
  return arr;
}

type LevitatingCardProps = {
  label: string;
  title: string;
  href?: string;
  amplitude?: number;
  cycleDuration?: number;
  rainbowDuration?: number;
};

// Half-sine sample points: smooth rise → natural lingering peak → smooth descend.
// No flat hold means no stiffness; the slow apex velocity *is* the hover feel.
const SINE_FRACTIONS = [0, 0.383, 0.707, 0.924, 1, 0.924, 0.707, 0.383, 0];
const SINE_TIMES = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];

export function LevitatingCard({
  label,
  title,
  href,
  amplitude = 12,
  cycleDuration = 0.95,
  rainbowDuration = 2.7,
}: LevitatingCardProps) {
  const reduced = useReducedMotion();

  const characters = title.split("");
  const items: Array<{ char: string; isArrow: boolean }> = characters.map(
    (c) => ({ char: c, isArrow: false }),
  );
  if (href) items.push({ char: "→", isArrow: true });

  // Stagger derived so every word completes a full wave in `cycleDuration`,
  // regardless of letter count — keeps the pace identical across sections.
  const letterStagger = cycleDuration / items.length;
  const yKeyframes = SINE_FRACTIONS.map((f) => -amplitude * f);

  const variants: Variants = {
    rest: {
      y: 0,
      color: "var(--color-ink)",
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    hover: (i: number) => ({
      y: reduced ? 0 : yKeyframes,
      color: reduced ? "var(--color-accent)" : rotateRainbow(i),
      transition: reduced
        ? { duration: 0 }
        : {
            y: {
              duration: cycleDuration,
              delay: i * letterStagger,
              repeat: Infinity,
              times: SINE_TIMES,
              ease: "linear",
            },
            color: {
              duration: rainbowDuration,
              repeat: Infinity,
              ease: "linear",
            },
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
        className="mt-10 block whitespace-nowrap pt-2 text-[3.25rem] font-medium leading-[1.05] tracking-[-0.045em] sm:text-[4.5rem]"
      >
        {items.map((item, i) => {
          if (item.isArrow) {
            return (
              <motion.span
                key="arrow"
                aria-hidden
                custom={i}
                variants={variants}
                className="ml-3 inline-block translate-y-[-0.14em] text-3xl sm:ml-4 sm:text-4xl"
              >
                {item.char}
              </motion.span>
            );
          }

          return (
            <motion.span
              key={`${item.char}-${i}`}
              aria-hidden
              custom={i}
              variants={variants}
              className="inline-block"
            >
              {item.char === " " ? " " : item.char}
            </motion.span>
          );
        })}
      </span>
    </Tag>
  );
}
