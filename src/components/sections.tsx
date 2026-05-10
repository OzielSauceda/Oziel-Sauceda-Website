"use client";
// reason: a motion-value-driven cylindrical wheel — the centered slot is
// the spotlight (full size + opacity), siblings recede with falloff. Wheel
// + arrow keys + click-to-center rotate it. Initial wheel-of-fortune spin
// slides the reel from a spun-up start into rest.

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { setActiveSection } from "@/lib/cat-state";
import { CatCompanion, type SectionId } from "./cat-companion";
import { LevitatingCard, type AlbumStamp } from "./levitating-card";
import { type AlbumKey } from "./album-sprite";
import { RetroLaptop } from "./retro-laptop";

// Geometry — mirrors SCREEN_H in retro-laptop.tsx so a slot is sized to fit
// 5 sections exactly within the laptop screen.
const SCREEN_H = 550;
const SCREEN_HALF = SCREEN_H / 2;
const SLOT_HEIGHT = 110;
const N_SECTIONS = 5;
// CYCLES copies of the section list are stacked into one tall column. The
// reel translates within this column; when the user advances past
// REAL_CYCLE ± snap_threshold cycles, we silently re-anchor to REAL_CYCLE so
// the wheel feels infinite without DOM growth.
const CYCLES = 21;
const REAL_CYCLE = 10;
const SNAP_THRESHOLD = 3;

const itemColumnY = (cycle: number, idx: number) =>
  (cycle * N_SECTIONS + idx) * SLOT_HEIGHT + SLOT_HEIGHT / 2;

const reelYToCenter = (cycle: number, idx: number) =>
  SCREEN_HALF - itemColumnY(cycle, idx);

// Initial reel position — a few cycles above the resting position so the
// intro animation slides items past the screen before settling.
const INTRO_OFFSET_CYCLES = 4;
const INTRO_DURATION_S = 2.5;
const INTRO_EASE: [number, number, number, number] = [0.05, 0.7, 0.1, 1];

const STEP_SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.7,
} as const;

const WHEEL_LOCK_MS = 70;
// Drag-throw projection: how many seconds of post-release velocity to honor
// before snapping. Higher = flicks travel further before settling.
const DRAG_PROJECTION_S = 0.18;


const ABOUT_STAMP: AlbumStamp = {
  baseColor: "#f5e9d3",
  textShadow: "3px 3px 0 #3a1014",
  glowColor: "rgba(212, 160, 64, 0.55)",
  wipeColors: [
    "#6b1c24",
    "#a04828",
    "#d4a040",
    "#c8924a",
    "#d4ac6e",
    "#e8d4a8",
    "#8a6850",
    "#3d2010",
  ],
};

const PROJECTS_STAMP: AlbumStamp = {
  baseColor: "#f6e2c8",
  textShadow: "3px 3px 0 #4a0a08",
  glowColor: "rgba(214, 42, 42, 0.55)",
  wipeColors: [
    "#d62a2a",
    "#d05828",
    "#d4a040",
    "#dca678",
    "#d4a08c",
    "#8a5a3a",
    "#3d2418",
    "#3e6e9c",
  ],
};

const RESEARCH_STAMP: AlbumStamp = {
  baseColor: "#e8ecef",
  textShadow: "3px 3px 0 #14141a",
  glowColor: "rgba(230, 39, 24, 0.5)",
  wipeColors: [
    "#e62718",
    "#e8ecef",
    "#c5d0d8",
    "#a5b4be",
    "#5a6068",
    "#2d2d2d",
    "#4a5870",
    "#a5c8d8",
  ],
};

const HOBBIES_STAMP: AlbumStamp = {
  baseColor: "#f4d6a8",
  textShadow: "3px 3px 0 #1a1a1a",
  glowColor: "rgba(232, 136, 48, 0.55)",
  wipeColors: [
    "#e88830",
    "#dca068",
    "#e0d0a8",
    "#a8784a",
    "#5a96b4",
    "#384858",
    "#2d2d2d",
    "#7a4828",
  ],
};

const CONTACT_STAMP: AlbumStamp = {
  baseColor: "#e8d8b8",
  textShadow: "3px 3px 0 #10204a",
  glowColor: "rgba(200, 160, 64, 0.5)",
  wipeColors: [
    "#1e44e8",
    "#3258e8",
    "#5a8ae8",
    "#a8b4c5",
    "#e8d8b8",
    "#c8a040",
    "#48483a",
    "#0a1850",
  ],
};

const SECTIONS: ReadonlyArray<{
  id: Exclude<SectionId, "rest">;
  title: string;
  href: string;
  stamp: AlbumStamp;
  album: AlbumKey;
  label: string;
}> = [
  {
    id: "about",
    title: "About",
    href: "/about",
    stamp: ABOUT_STAMP,
    album: "college-dropout",
    label: "01",
  },
  {
    id: "projects",
    title: "Projects",
    href: "/projects",
    stamp: PROJECTS_STAMP,
    album: "mbdtf",
    label: "02",
  },
  {
    id: "research",
    title: "Research",
    href: "/research",
    stamp: RESEARCH_STAMP,
    album: "yeezus",
    label: "03",
  },
  {
    id: "hobbies",
    title: "Hobbies",
    href: "/hobbies",
    stamp: HOBBIES_STAMP,
    album: "tlop",
    label: "04",
  },
  {
    id: "contact",
    title: "Contact",
    href: "/contact",
    stamp: CONTACT_STAMP,
    album: "jik",
    label: "05",
  },
];

type Position = { cycle: number; idx: number };

export function Sections() {
  const reduced = useReducedMotion();
  const [position, setPosition] = useState<Position>({
    cycle: REAL_CYCLE,
    idx: 0,
  });
  const [introDone, setIntroDone] = useState(false);
  // Until the user actually rotates the wheel, the global active-section
  // stays at "rest" so the header IdleCat keeps her chat. Engaging with the
  // wheel hands the spotlight to the laptop-side CatCompanion.
  const [userEngaged, setUserEngaged] = useState(false);
  const reelY = useMotionValue(
    reelYToCenter(REAL_CYCLE - INTRO_OFFSET_CYCLES, 0),
  );
  const wheelLockRef = useRef(false);

  // Intro spin — runs once on mount. Does NOT publish an active section so
  // the header IdleCat keeps her chat going until the user rotates.
  useEffect(() => {
    if (reduced) {
      reelY.set(reelYToCenter(REAL_CYCLE, 0));
      setIntroDone(true);
      return;
    }
    const controls = animate(reelY, reelYToCenter(REAL_CYCLE, 0), {
      duration: INTRO_DURATION_S,
      ease: INTRO_EASE,
    });
    controls.then(() => {
      setIntroDone(true);
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate reel into the new position whenever the centered item changes.
  useEffect(() => {
    if (!introDone) return;
    const target = reelYToCenter(position.cycle, position.idx);
    if (reduced) {
      reelY.set(target);
    } else {
      const controls = animate(reelY, target, STEP_SPRING);
      return () => controls.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.cycle, position.idx, introDone]);

  // Mirror centered idx into global state, but only after engagement.
  useEffect(() => {
    if (!userEngaged) return;
    setActiveSection(SECTIONS[position.idx]!.id);
  }, [position.idx, userEngaged]);

  // Reset header cat when this view unmounts.
  useEffect(() => () => setActiveSection("rest"), []);

  const advance = useCallback(
    (dir: 1 | -1) => {
      if (!introDone) return;
      setUserEngaged(true);
      setPosition(({ cycle, idx }) => {
        let newIdx = idx + dir;
        let newCycle = cycle;
        if (newIdx >= N_SECTIONS) {
          newIdx = 0;
          newCycle += 1;
        } else if (newIdx < 0) {
          newIdx = N_SECTIONS - 1;
          newCycle -= 1;
        }
        // Silently re-anchor to REAL_CYCLE if we're drifting too far so we
        // never scroll out of the rendered cycles.
        if (Math.abs(newCycle - REAL_CYCLE) > SNAP_THRESHOLD) {
          reelY.set(reelYToCenter(REAL_CYCLE, newIdx));
          newCycle = REAL_CYCLE;
        }
        return { cycle: newCycle, idx: newIdx };
      });
    },
    [introDone, reelY],
  );

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 5) return;
    if (wheelLockRef.current) return;
    wheelLockRef.current = true;
    advance(e.deltaY > 0 ? 1 : -1);
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, WHEEL_LOCK_MS);
  };

  // Snap-to-nearest-slot after a drag/swipe. Throw velocity gets projected
  // forward so a flick advances multiple slots, while a small release just
  // snaps back to the closest one.
  const handleDragEnd = useCallback(
    (velocity: number) => {
      if (!introDone) return;
      setUserEngaged(true);
      const projectedY = reelY.get() + velocity * DRAG_PROJECTION_S;
      const targetColumnCenterY = SCREEN_HALF - projectedY;
      const slotN = Math.round(
        (targetColumnCenterY - SLOT_HEIGHT / 2) / SLOT_HEIGHT,
      );
      let newCycle = Math.floor(slotN / N_SECTIONS);
      let newIdx =
        ((slotN % N_SECTIONS) + N_SECTIONS) % N_SECTIONS;
      if (Math.abs(newCycle - REAL_CYCLE) > SNAP_THRESHOLD) {
        reelY.set(reelYToCenter(REAL_CYCLE, newIdx));
        newCycle = REAL_CYCLE;
      }
      setPosition({ cycle: newCycle, idx: newIdx });
    },
    [introDone, reelY],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        advance(1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        advance(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  return (
    <section
      id="sections"
      aria-label="Site sections"
      className="relative flex justify-center px-4 pt-6 pb-12"
    >
      {/* Side cat shows up only after the user actually rotates the wheel —
          before then the header IdleCat owns the chat slot, so we don't
          fight for attention or kick her out mid-line. z-20 keeps the
          companion + her bubble painted on top of the laptop chassis no
          matter what's happening on the wheel. */}
      {userEngaged && (
        <div
          aria-hidden
          className="cat-static pointer-events-none absolute right-6 z-20 hidden lg:block xl:right-12"
          style={{ top: "calc(50% - 180px)", width: 510, height: 360 }}
        >
          <CatCompanion active={SECTIONS[position.idx]!.id} />
        </div>
      )}
      <RetroLaptop>
        <div
          className="relative h-full overflow-hidden focus-visible:outline-none"
          onWheel={handleWheel}
          tabIndex={0}
          role="listbox"
          aria-label="Section wheel — scroll, swipe, or arrow keys to rotate"
        >
          <motion.div
            className="absolute inset-x-0 top-0 cursor-grab active:cursor-grabbing"
            style={{ y: reelY }}
            drag={introDone ? "y" : false}
            dragMomentum={false}
            dragElastic={0.08}
            onDragEnd={(_, info) => handleDragEnd(info.velocity.y)}
          >
            {Array.from({ length: CYCLES }).map((_, cycle) =>
              SECTIONS.map((s, idx) => {
                const slotOffset =
                  cycle * N_SECTIONS + idx -
                  (position.cycle * N_SECTIONS + position.idx);
                const isCenter = slotOffset === 0;
                const clickable = Math.abs(slotOffset) <= 2;
                return (
                  <WheelItem
                    key={`${cycle}-${idx}`}
                    section={s}
                    rowY={itemColumnY(cycle, idx)}
                    reelY={reelY}
                    isCenter={isCenter}
                    clickable={clickable}
                    onActivate={() => {
                      setUserEngaged(true);
                      setPosition({ cycle, idx });
                    }}
                  />
                );
              }),
            )}
          </motion.div>
        </div>
      </RetroLaptop>
    </section>
  );
}

type WheelItemProps = {
  section: (typeof SECTIONS)[number];
  rowY: number;
  reelY: MotionValue<number>;
  isCenter: boolean;
  clickable: boolean;
  onActivate: () => void;
};

function WheelItem({
  section,
  rowY,
  reelY,
  isCenter,
  clickable,
  onActivate,
}: WheelItemProps) {
  // Distance, in column coords, from this row's center to the visible
  // window's center. Drives both scale and opacity falloff.
  const distance = useTransform(reelY, (ry) =>
    Math.abs(rowY + ry - SCREEN_HALF),
  );
  const scale = useTransform(
    distance,
    [0, SLOT_HEIGHT, SLOT_HEIGHT * 2, SLOT_HEIGHT * 3],
    [1.0, 0.78, 0.55, 0.4],
  );
  const opacity = useTransform(
    distance,
    [0, SLOT_HEIGHT * 0.6, SLOT_HEIGHT * 1.6, SLOT_HEIGHT * 2.5],
    [1.0, 0.55, 0.18, 0],
  );

  return (
    <motion.div
      className="absolute left-0 right-0 flex items-center pl-8"
      style={{
        top: rowY - SLOT_HEIGHT / 2,
        height: SLOT_HEIGHT,
        scale,
        opacity,
        transformOrigin: "left center",
        pointerEvents: clickable ? "auto" : "none",
      }}
      role="option"
      aria-selected={isCenter}
      onClick={(e) => {
        if (!isCenter) {
          e.preventDefault();
          onActivate();
        }
      }}
    >
      <LevitatingCard
        title={section.title}
        href={isCenter ? section.href : undefined}
        stamp={section.stamp}
        album={section.album}
        label={section.label}
      />
    </motion.div>
  );
}
