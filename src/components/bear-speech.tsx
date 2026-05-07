"use client";
// reason: typewriter reveal + line cycling needs client-side timers + state

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const LINES = [
  "* hi! welcome to my site.",
  "* feel free to look around.",
  "* try hovering the section names.",
  "* the contact button is up top.",
  "* scroll down to see more.",
  "* glad you stopped by.",
] as const;

const TYPE_INTERVAL_MS = 55;
const HOLD_AFTER_TYPED_MS = 3200;
const INITIAL_DELAY_MS = 600;

export function BearSpeech() {
  const reduced = useReducedMotion();
  const [lineIdx, setLineIdx] = useState(0);
  const [shown, setShown] = useState(0);

  const currentLine = LINES[lineIdx % LINES.length] ?? "";

  useEffect(() => {
    if (reduced) {
      setShown(currentLine.length);
      return;
    }
    setShown(0);
    let i = 0;
    let typeTick: number | undefined;
    let holdTimer: number | undefined;
    const isFirstLine = lineIdx === 0;
    const startDelay = isFirstLine ? INITIAL_DELAY_MS : 250;

    const startTimer = window.setTimeout(() => {
      typeTick = window.setInterval(() => {
        i += 1;
        setShown(i);
        if (i >= currentLine.length) {
          if (typeTick !== undefined) window.clearInterval(typeTick);
          holdTimer = window.setTimeout(() => {
            setLineIdx((idx) => idx + 1);
          }, HOLD_AFTER_TYPED_MS);
        }
      }, TYPE_INTERVAL_MS);
    }, startDelay);

    return () => {
      window.clearTimeout(startTimer);
      if (typeTick !== undefined) window.clearInterval(typeTick);
      if (holdTimer !== undefined) window.clearTimeout(holdTimer);
    };
  }, [reduced, lineIdx, currentLine]);

  const done = shown >= currentLine.length;

  return (
    <div className="inline-flex flex-col items-start">
      <div
        aria-hidden
        className="ml-7 h-12 w-[4px] sm:ml-8 sm:h-14"
        style={{
          background:
            "repeating-linear-gradient(to bottom, var(--color-ink) 0 6px, transparent 6px 12px)",
        }}
      />
      <div
        role="status"
        aria-live="polite"
        aria-label={currentLine}
        className="inline-block max-w-md border-[3px] border-ink bg-[#0a0212] px-4 py-3 font-pixel text-[10px] leading-[1.6] text-ink shadow-[6px_6px_0_0_rgba(10,2,18,0.55)] sm:text-[11px]"
      >
        <span aria-hidden>{currentLine.slice(0, shown)}</span>
        {!done && (
          <span aria-hidden className="ml-[2px] inline-block animate-pulse">
            ▎
          </span>
        )}
        {done && (
          <span
            aria-hidden
            className="ml-[6px] inline-block translate-y-[-1px] animate-pulse text-accent"
          >
            ▼
          </span>
        )}
      </div>
    </div>
  );
}
