"use client";
// reason: typewriter reveal, line cycling, and broadcasting the bear's
// "is talking" signal to the header all need client-side timers + state

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { setBearSpeaking } from "@/lib/bear-typing";
import { isPauseChar, pauseAfter } from "@/lib/typing";

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
const NEXT_LINE_START_DELAY_MS = 250;

export function BearSpeech() {
  const reduced = useReducedMotion();
  const [lineIdx, setLineIdx] = useState(0);
  const [shown, setShown] = useState(0);

  const currentLine = LINES[lineIdx % LINES.length] ?? "";

  useEffect(() => {
    if (reduced) {
      setShown(currentLine.length);
      setBearSpeaking(false);
      return;
    }

    setShown(0);
    setBearSpeaking(false);

    let i = 0;
    let timer: number | undefined;

    const typeNext = () => {
      i += 1;
      setShown(i);

      if (i >= currentLine.length) {
        // Sentence finished — close the mouth and hold before next line.
        setBearSpeaking(false);
        timer = window.setTimeout(() => {
          setLineIdx((idx) => idx + 1);
        }, HOLD_AFTER_TYPED_MS);
        return;
      }

      const justTyped = currentLine[i - 1] ?? "";
      const pausing = isPauseChar(justTyped);
      // Mouth closes during a punctuation pause, opens again as soon
      // as the next character starts typing.
      setBearSpeaking(!pausing);

      timer = window.setTimeout(typeNext, pauseAfter(justTyped, TYPE_INTERVAL_MS));
    };

    const startDelay =
      lineIdx === 0 ? INITIAL_DELAY_MS : NEXT_LINE_START_DELAY_MS;
    timer = window.setTimeout(() => {
      setBearSpeaking(true);
      typeNext();
    }, startDelay);

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      setBearSpeaking(false);
    };
  }, [reduced, lineIdx, currentLine]);

  const done = shown >= currentLine.length;

  return (
    <div className="inline-flex flex-col items-start">
      <div
        aria-hidden
        className="ml-[54px] h-12 w-[4px] sm:h-14"
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
