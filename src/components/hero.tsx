"use client";
// reason: per-letter falling-in animation on page load uses motion + useReducedMotion

import { motion, useReducedMotion } from "motion/react";

const HEADLINE = "Welcome to the Sauce Site";

type RenderItem =
  | {
      type: "word";
      isAccent: boolean;
      chars: { char: string; idx: number }[];
      key: string;
    }
  | { type: "space"; idx: number; key: string };

// Build the render plan once at module load: each letter and each inter-word
// space gets a global index used to stagger its drop-in delay in DOM order.
const RENDER: RenderItem[] = (() => {
  const out: RenderItem[] = [];
  let g = 0;
  const words = HEADLINE.split(" ");
  words.forEach((word, wordIdx) => {
    const chars = [...word].map((c) => ({ char: c, idx: g++ }));
    out.push({
      type: "word",
      isAccent: word === "Sauce",
      chars,
      key: `w${wordIdx}`,
    });
    if (wordIdx < words.length - 1) {
      out.push({ type: "space", idx: g++, key: `s${wordIdx}` });
    }
  });
  return out;
})();

const FALL_DISTANCE = 140;
const PER_LETTER_STAGGER = 0.04;
const LANDING_DURATION = 0.6;
const INITIAL_DELAY = 0.2;

export function Hero() {
  const reduced = useReducedMotion();

  function fallProps(idx: number) {
    if (reduced) return {};
    return {
      initial: { opacity: 0, y: -FALL_DISTANCE },
      animate: { opacity: 1, y: 0 },
      transition: {
        delay: INITIAL_DELAY + idx * PER_LETTER_STAGGER,
        duration: LANDING_DURATION,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    };
  }

  return (
    <section className="relative px-10 pt-20 pb-24 sm:px-16 sm:pt-28 sm:pb-32 md:pl-32">
      <h1 className="max-w-5xl font-pixel text-[clamp(1.75rem,4.5vw,3.75rem)] font-normal leading-[1.35] tracking-normal text-ink">
        {RENDER.map((item) => {
          if (item.type === "word") {
            return (
              <span
                key={item.key}
                className="inline-block whitespace-nowrap"
              >
                {item.chars.map(({ char, idx }) => (
                  <motion.span
                    key={idx}
                    {...fallProps(idx)}
                    className={`inline-block ${item.isAccent ? "text-accent" : ""}`}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            );
          }
          return (
            <motion.span
              key={item.key}
              {...fallProps(item.idx)}
              className="inline-block"
            >
              {" "}
            </motion.span>
          );
        })}
      </h1>
    </section>
  );
}
