"use client";
// reason: uses motion for the page-load reveal + subscribes to the bear's typing signal so the mouth animates while text is streaming

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useBearSpeaking } from "@/lib/bear-typing";

export function SiteHeader() {
  const reduced = useReducedMotion();
  const speaking = useBearSpeaking();
  const initial = reduced ? false : { opacity: 0, y: -8 };
  const animate = { opacity: 1, y: 0 };
  const transition = {
    duration: 0.9,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  };

  return (
    <motion.header
      initial={initial}
      animate={animate}
      transition={transition}
      className="relative z-20 flex items-center justify-between px-10 pt-7 sm:px-16 sm:pt-9"
    >
      <a
        href="/"
        className="flex items-center gap-4"
        aria-label="Oziel — home"
      >
        <span className="bear-stage shrink-0">
          <span
            className={`talk-stack sticker bear-float block ${speaking ? "is-speaking" : ""}`}
            style={{ width: 112, height: 112 }}
          >
            <Image
              src="/oziel-closed-v5.png"
              alt=""
              width={112}
              height={112}
              sizes="112px"
              priority
              className="pixel-art talk-base"
            />
            <Image
              src="/oziel-talking-v5.png"
              alt=""
              aria-hidden
              width={112}
              height={112}
              sizes="112px"
              priority
              className="pixel-art talk-mouth"
            />
          </span>
        </span>
        <span className="font-pixel text-base font-normal tracking-normal text-ink sm:text-lg">
          Oziel
        </span>
      </a>

      <div className="flex items-center gap-3 sm:gap-5">
        <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:flex">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
            <span className="relative size-1.5 rounded-full bg-accent" />
          </span>
          Available for work
        </span>
        <a
          href="mailto:ozielutcs@gmail.com"
          className="rounded-full border border-hairline bg-cream px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:border-ink"
        >
          Contact
        </a>
      </div>
    </motion.header>
  );
}
