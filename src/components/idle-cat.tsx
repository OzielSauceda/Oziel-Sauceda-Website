"use client";
// reason: client-side typewriter timers + AnimatePresence drive Michi's
// cycling chat and the Mario-pipe sink/rise on his sprite

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useActiveSection } from "@/lib/cat-state";
import { isPauseChar, pauseAfter } from "@/lib/typing";

const LINES = [
  "* hi! i'm michi.",
  "* this is my owner's site.",
  "* hover a section title.",
  "* i'll come tell you about it.",
  "* meow.",
] as const;

const TYPE_INTERVAL_MS = 50;
const HOLD_AFTER_TYPED_MS = 2800;
const INITIAL_DELAY_MS = 900;
const NEXT_LINE_DELAY_MS = 320;
const CAT_SIZE = 96;
const PIPE_DURATION = 0.45;
// Snappy ease-in-out so the slide reads as a sprite swap, not a smooth fade.
const PIPE_EASE: [number, number, number, number] = [0.4, 0, 0.6, 1];

export function IdleCat() {
  const reduced = useReducedMotion();
  const active = useActiveSection();
  const visible = active === "rest";

  const [lineIdx, setLineIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const currentLine = LINES[lineIdx % LINES.length] ?? "";

  useEffect(() => {
    if (!visible) return;
    if (reduced) {
      setShown(currentLine.length);
      return;
    }
    setShown(0);
    let i = 0;
    let timer: number | undefined;

    const typeNext = () => {
      i += 1;
      setShown(i);
      if (i >= currentLine.length) {
        timer = window.setTimeout(() => {
          setLineIdx((idx) => idx + 1);
        }, HOLD_AFTER_TYPED_MS);
        return;
      }
      const justTyped = currentLine[i - 1] ?? "";
      timer = window.setTimeout(
        typeNext,
        pauseAfter(justTyped, TYPE_INTERVAL_MS),
      );
    };

    const startDelay = lineIdx === 0 ? INITIAL_DELAY_MS : NEXT_LINE_DELAY_MS;
    timer = window.setTimeout(typeNext, startDelay);

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [visible, reduced, lineIdx, currentLine]);

  const isDone = shown >= currentLine.length;
  const lastTypedChar = shown > 0 ? (currentLine[shown - 1] ?? "") : "";
  const speaking =
    visible && shown > 0 && !isDone && !isPauseChar(lastTypedChar);

  return (
    <div className="pointer-events-none absolute right-[360px] top-7 z-10 hidden flex-col items-end md:flex sm:top-9">
      <div className="flex items-center gap-4">
        <span className="font-pixel text-base font-normal tracking-normal text-ink sm:text-lg">
          Michi Tobi Anderson
        </span>

        {/* Cat sprite. The overflow-hidden box is the "pipe mouth" — the
            sprite slides down through it on exit and rises out of it on
            entry. Glow is intentionally dropped so there's no leftover
            rectangle when the sprite is gone. */}
        <div
          className="relative overflow-hidden"
          style={{ width: CAT_SIZE, height: CAT_SIZE }}
        >
          <AnimatePresence>
            {visible && (
              <motion.div
                key="idle-cat-pipe"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: PIPE_DURATION, ease: PIPE_EASE }
                }
                className="absolute inset-0"
              >
                <span
                  className={`talk-stack bear-float block ${
                    speaking ? "is-speaking" : ""
                  }`}
                  style={{ width: CAT_SIZE, height: CAT_SIZE }}
                >
                  <Image
                    src="/cat-closed.png"
                    alt=""
                    width={CAT_SIZE}
                    height={CAT_SIZE}
                    sizes={`${CAT_SIZE}px`}
                    className="pixel-art talk-base"
                  />
                  <Image
                    src="/cat-talking-v4.png"
                    alt=""
                    aria-hidden
                    width={CAT_SIZE}
                    height={CAT_SIZE}
                    sizes={`${CAT_SIZE}px`}
                    className="pixel-art talk-mouth"
                  />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {visible && (
          <motion.div
            key="idle-cat-chat"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.28, ease: PIPE_EASE, delay: 0.18 }
            }
            className="mt-2 flex flex-col items-end"
          >
            <div
              aria-hidden
              className="mr-12 h-12 w-[4px] sm:h-14"
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
              {!isDone && (
                <span aria-hidden className="ml-[2px] inline-block animate-pulse">
                  ▎
                </span>
              )}
              {isDone && (
                <span
                  aria-hidden
                  className="ml-[6px] inline-block translate-y-[-1px] animate-pulse text-accent"
                >
                  ▼
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
