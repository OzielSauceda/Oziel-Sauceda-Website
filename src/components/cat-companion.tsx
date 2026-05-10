"use client";
// reason: AnimatePresence drives cat pop-in/out + diagonal connector draw-in; client timers type the bubble content one char at a time

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { isPauseChar, pauseAfter } from "@/lib/typing";

export type SectionId =
  | "rest"
  | "about"
  | "projects"
  | "research"
  | "hobbies"
  | "contact";

type Preview = {
  label: string;
  title: string;
  body: string;
  meta: string;
};

const PREVIEWS: Record<Exclude<SectionId, "rest">, Preview> = {
  about: {
    label: "// 01 about",
    title: "Oziel",
    body: "Designer-engineer making interfaces that are quiet at rest and expressive on demand. Big on type, motion, and the line between tool and toy.",
    meta: "Since 2017",
  },
  projects: {
    label: "// 02 projects",
    title: "Selected projects",
    body: "Shipped products, case studies, and the occasional side bet. Each entry inside has its own story.",
    meta: "12 entries · last shipped Apr 2026",
  },
  research: {
    label: "// 03 research",
    title: "Notes & papers",
    body: "Half-formed ideas on motion design, perception, and where toys end and tools begin.",
    meta: "Updated weekly",
  },
  hobbies: {
    label: "// 04 hobbies",
    title: "Off-screen",
    body: "Pixel art, routes I shouldn't try, slow pour-overs, and a stack of keyboards I'll never type on.",
    meta: "Slow-burn pursuits",
  },
  contact: {
    label: "// 05 contact",
    title: "Say hi",
    body: "ozielutcs@gmail.com\n\nDrop a line. I read every message and answer within a day or two.",
    meta: "< 24h response",
  },
};

const APPLE: [number, number, number, number] = [0.16, 1, 0.3, 1];
// Mario-pipe slide: snappy ease-in-out so the cat sprite reads as
// teleporting through a pipe rather than smoothly easing in.
const PIPE_DURATION = 0.45;
const PIPE_EASE: [number, number, number, number] = [0.4, 0, 0.6, 1];

const CAT_SIZE = 112;
const CAT_LEFT = 4;
// Cat sits near the bottom of its 360-px container so the bubble can
// stack above it (top-right). The container as a whole gets nudged
// upward by sections.tsx so the cat lands on the active title.
const CAT_TOP = 240;

const LINE_LEFT = CAT_LEFT + CAT_SIZE + 8;
const LINE_TOP = CAT_TOP + 14;
const LINE_LENGTH = 68;
const LINE_ANGLE_DEG = -42;
const LINE_ANGLE_RAD = (LINE_ANGLE_DEG * Math.PI) / 180;

const BUBBLE_LEFT = LINE_LEFT + Math.cos(LINE_ANGLE_RAD) * LINE_LENGTH;
const BUBBLE_TOP = 0;

// Vertical offset of the cat's CENTER inside the container — used by
// the row-tracker in sections.tsx to align cat-center with title-center.
export const CAT_CENTER_Y = CAT_TOP + CAT_SIZE / 2;

const TYPE_INTERVAL_MS = 16;

export function CatCompanion({ active }: { active: SectionId }) {
  const reduced = useReducedMotion();
  const visible = active !== "rest";
  const preview = visible ? PREVIEWS[active] : null;

  const segments = preview
    ? [preview.label, preview.title, preview.body, preview.meta]
    : [];
  const totalChars = segments.reduce((n, s) => n + s.length, 0);
  const fullText = segments.join("");

  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!preview) {
      setShown(0);
      return;
    }
    if (reduced) {
      setShown(totalChars);
      return;
    }
    setShown(0);
    let i = 0;
    let timer: number | undefined;

    const typeNext = () => {
      i += 1;
      setShown(i);
      if (i >= totalChars) return;
      const justTyped = fullText[i - 1] ?? "";
      timer = window.setTimeout(
        typeNext,
        pauseAfter(justTyped, TYPE_INTERVAL_MS),
      );
    };

    timer = window.setTimeout(typeNext, TYPE_INTERVAL_MS);

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [active, preview, totalChars, reduced, fullText]);

  // Walk the typed cursor across each segment so the four lines fill in
  // continuously instead of all-at-once.
  let cursor = shown;
  const sliced = segments.map((text) => {
    const v = Math.max(0, Math.min(text.length, cursor));
    cursor -= text.length;
    return v;
  });
  const isDone = preview != null && shown >= totalChars;
  const lastTypedChar = shown > 0 ? (fullText[shown - 1] ?? "") : "";
  const speaking = shown > 0 && !isDone && !isPauseChar(lastTypedChar);

  // Render every char as its own span — color is the only thing that
  // changes per tick, so the line-wrap geometry is locked from the first
  // frame to the last and the bubble can't reflow during typing.
  const renderSeg = (idx: number) => {
    const text = segments[idx] ?? "";
    const v = sliced[idx] ?? 0;
    return Array.from(text).map((c, i) => (
      <span
        key={i}
        aria-hidden={i >= v || undefined}
        className={i >= v ? "text-transparent" : undefined}
      >
        {c}
      </span>
    ));
  };

  return (
    <div className="relative h-[360px] w-full max-w-lg">
      <AnimatePresence>
        {preview && (
          <motion.div
            key="cat-stack"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: PIPE_DURATION, ease: PIPE_EASE }}
            className="absolute inset-0"
          >
            <div
              className="absolute overflow-hidden"
              style={{
                left: CAT_LEFT,
                top: CAT_TOP,
                width: CAT_SIZE,
                height: CAT_SIZE,
              }}
            >
              <motion.div
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
                    priority
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
            </div>

            <motion.div
              aria-hidden
              initial={{ width: 0 }}
              animate={{ width: LINE_LENGTH }}
              exit={{ width: 0 }}
              transition={{
                duration: reduced ? 0 : 0.32,
                ease: APPLE,
                delay: reduced ? 0 : 0.1,
              }}
              className="absolute h-[4px]"
              style={{
                left: LINE_LEFT,
                top: LINE_TOP,
                transformOrigin: "left top",
                transform: `rotate(${LINE_ANGLE_DEG}deg)`,
                background:
                  "repeating-linear-gradient(to right, var(--color-ink) 0 6px, transparent 6px 12px)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{
                duration: reduced ? 0 : 0.28,
                ease: APPLE,
                delay: reduced ? 0 : 0.28,
              }}
              className="absolute"
              style={{
                left: BUBBLE_LEFT,
                top: BUBBLE_TOP,
                width: 320,
              }}
            >
              <div
                role="status"
                aria-live="polite"
                className="relative border-[3px] border-ink bg-[#0a0212] px-4 py-4 font-pixel text-[10px] leading-[1.7] text-ink shadow-[6px_6px_0_0_rgba(10,2,18,0.55)] sm:text-[10.5px]"
                style={{ minHeight: 200 }}
              >
                <div className="text-ink/55">{renderSeg(0)}</div>
                <div className="mt-3 text-[12px] leading-[1.3] text-accent sm:text-[13px]">
                  {renderSeg(1)}
                </div>
                <p className="mt-3 whitespace-pre-line">{renderSeg(2)}</p>
                <div className="mt-3 border-t border-ink/15 pt-2 text-ink/55">
                  {renderSeg(3)}
                </div>
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-2 right-3 animate-pulse text-accent"
                >
                  {isDone ? "▼" : "▎"}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
