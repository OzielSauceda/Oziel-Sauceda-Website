"use client";
// reason: AnimatePresence + motion crossfades preview content as the active section changes

import { AnimatePresence, motion } from "motion/react";

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

const PREVIEWS: Record<SectionId, Preview> = {
  rest: {
    label: "// now",
    title: "Currently",
    body: "* Building this site\n* Reading on motion design\n* Brewing too much coffee",
    meta: "Available for new work",
  },
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

const TRANSITION = {
  duration: 0.32,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

export function SectionPreview({ active }: { active: SectionId }) {
  const preview = PREVIEWS[active];

  return (
    <div className="relative h-[320px] w-full max-w-sm">
      <AnimatePresence mode="sync">
        <motion.article
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={TRANSITION}
          className="pixel-box absolute inset-0 flex flex-col p-7"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone/55">
            {preview.label}
          </div>
          <h3 className="mt-4 font-pixel text-[1.4rem] leading-[1.15] text-bone">
            {preview.title}
          </h3>
          <p className="mt-5 max-w-[34ch] flex-1 whitespace-pre-line text-[13px] leading-[1.7] text-bone/85">
            {preview.body}
          </p>
          <div className="mt-6 border-t border-bone/15 pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/55">
            {preview.meta}
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
