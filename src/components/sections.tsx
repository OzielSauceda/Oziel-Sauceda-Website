"use client";
// reason: shared hover/focus state lifts above the section list so the cat companion can follow the active row

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { setActiveSection } from "@/lib/cat-state";
import { CAT_CENTER_Y, CatCompanion, type SectionId } from "./cat-companion";
import { LevitatingCard, type AlbumStamp } from "./levitating-card";
import { type AlbumKey } from "./album-sprite";

// Roughly the Y of the big title's center within each <li>:
// label (~14) + mt-10 (40) + pt-2 (8) + half of 48 px title ≈ 86 px.
const TITLE_CENTER_Y_IN_LI = 88;

// College Dropout stamp: pulled directly off the album cover — burgundy
// (bear's body and outer border), the ornate gold frame, the wooden-bench
// honey, the bear's buff-cream face mask, and the dark brown shadows. No
// purple, no blue — the cover is entirely warm tones. Cream text sits over
// a burgundy pixel-shadow with a gold glow that nods to the gilded frame.
// Deep umber sits between the taupe bridge and the dark brown to slow the
// descent into the deepest shadow — the cover has plenty of mid-dark wood
// tones (bench grain, bear's fur shading) that justify a stop there.
const ABOUT_STAMP = {
  baseColor: "#f5e9d3",
  textShadow: "3px 3px 0 #3a1014",
  glowColor: "rgba(212, 160, 64, 0.55)", // gold (frame)
  wipeColors: [
    "#6b1c24", // burgundy maroon (bear / outer border)
    "#a04828", // copper rust → gold
    "#d4a040", // rich frame gold
    "#c8924a", // amber → honey wood
    "#b97a3e", // honey wood (bleachers)
    "#d4ac6e", // warm tan → buff cream
    "#e8d4a8", // buff cream (bear's face mask)
    "#c89060", // caramel (mid-lightness step bridges cream → taupe)
    "#8a6850", // warm taupe → dark brown
    "#6a3a18", // deep umber (mid-dark wood shadow)
    "#3d2010", // dark wood brown (deepest shadows)
    "#5a1a18", // deep oxblood → burgundy (closes loop)
  ],
} as const;

// Yeezus stamp (Research): pulled from the actual album cover, which is
// intentionally minimal — red sticker, cool off-white jewel case, silver-
// chrome disc, black CD center, plus a subtle holographic icy-blue picked
// from the disc's rainbow shimmer. Two extra mid-tone stops (warm pewter,
// deeper holographic silver-blue) give the cool cluster more texture so
// the rotation doesn't read as flat grays. Charcoal stays lifted from
// pure black so it doesn't read as a hole sliding through the flow.
// Yeezus's stark, clinical, focused aesthetic fits Research.
const RESEARCH_STAMP = {
  baseColor: "#e8ecef",
  textShadow: "3px 3px 0 #14141a",
  glowColor: "rgba(230, 39, 24, 0.5)", // red (sticker)
  wipeColors: [
    "#e62718", // red sticker
    "#d68a82", // dusty rose → off-white
    "#e8ecef", // cool off-white (jewel case)
    "#c5d0d8", // pale silver-gray → silver
    "#a5b4be", // silver disc surface
    "#9aa0a8", // warm pewter (subtle warm-cool tilt in the disc)
    "#5a6068", // dark silver → charcoal
    "#2d2d2d", // deep charcoal (CD center, lifted from pure black)
    "#4a5870", // muted slate → holographic
    "#7a8a9a", // deeper holographic silver-blue
    "#a5c8d8", // icy blue (disc holographic shimmer)
    "#b87880", // dusty rose → red (closes loop)
  ],
} as const;

// MBDTF stamp (Projects, phoenix cover): the cover is dominantly warm —
// bold crimson field, gold frame, peach skin, dark brown wings — with a
// single cool accent (sky blue from the pixelated sky). Cycle order
// clusters the warm tones together and isolates the blue as a brief cool
// break, mirroring the cover's composition. Bridges only use tones
// actually visible on the cover (warm red-orange, honey, sienna, slate at
// the brown/blue boundary, burgundy in the wing edges) — no olive, no
// mauve. MBDTF's "magnum opus / masterpiece work" feel fits Projects.
const PROJECTS_STAMP = {
  baseColor: "#f0dccb",
  textShadow: "3px 3px 0 #4a0a08",
  glowColor: "rgba(214, 42, 42, 0.5)", // crimson (MBDTF's dominant field — the most iconic color of the cover)
  wipeColors: [
    "#d62a2a", // crimson red (background)
    "#d05828", // warm red-orange → gold
    "#d4a040", // frame gold
    "#dca678", // warm honey → peach
    "#d4a08c", // skin peach (figure)
    "#b88a5a", // warm tan (mid-lightness step bridges peach → sienna)
    "#8a5a3a", // burnt sienna → brown
    "#3d2418", // dark wood brown (wings)
    "#3a4858", // dark slate → blue (the brown/blue pixel boundary)
    "#3e6e9c", // sky blue (pixel sky)
    "#7a3030", // deep burgundy → red (closes loop)
  ],
} as const;

// Jesus Is King stamp (cobalt vinyl variant): the iconic identity is bold
// cobalt blue, with the cream label, gold "JESUS IS KING" text, and deep
// navy shadows as accents. Cycle order clusters the blues and lets the
// cream + gold be a brief warm break before returning through navy.
const CONTACT_STAMP = {
  baseColor: "#e8d8b8",
  textShadow: "3px 3px 0 #10204a",
  glowColor: "rgba(200, 160, 64, 0.5)", // gold ("JESUS IS KING" text — pops against the dark purple page bg cobalt would blend into)
  wipeColors: [
    "#1e44e8", // cobalt blue (vinyl)
    "#3258e8", // brighter cobalt → sky
    "#5a8ae8", // sky blue (vinyl rim highlight)
    "#a8b4c5", // cool silver-gray → cream
    "#e8d8b8", // cream (label)
    "#d8c080", // pale honey → gold
    "#c8a040", // gold ("JESUS IS KING" text)
    "#7a6840", // dark bronze (mid-lightness step bridges gold → olive-bronze)
    "#48483a", // dark olive-bronze → navy
    "#0a1850", // deep navy (label shadows / center hole)
    "#1830a8", // rich blue → cobalt (closes loop)
  ],
} as const;

// The Life of Pablo stamp: famously orange + black — the construction-orange
// field is the dominant identity, the black text the second pillar. The two
// photo insets contribute sepia cream + warm tan (wedding photo) and pool
// blue (bottom photo) as supporting accents. Cycle order walks from the
// dominant orange through the warm photo tones, dips into the cool pool
// blue, drops into charcoal, then bridges back through dark sienna. Bridges
// stay inside the cover's actual tonal vocabulary.
const HOBBIES_STAMP = {
  baseColor: "#f0dccb",
  textShadow: "3px 3px 0 #1a1a1a",
  glowColor: "rgba(232, 136, 48, 0.55)", // construction orange (TLOP field)
  wipeColors: [
    "#e88830", // construction orange (background)
    "#dca068", // warm honey → sepia
    "#e0d0a8", // sepia cream (vintage photo)
    "#b89860", // warm khaki → tan
    "#a8784a", // warm tan (photo skin/clothing)
    "#6a7888", // dusty teal → blue
    "#5a96b4", // pool blue (water)
    "#4a6878", // dusty cool blue (mid-lightness step bridges blue → slate)
    "#384858", // dark slate → charcoal
    "#2d2d2d", // charcoal black (text, lifted from pure black)
    "#7a4828", // dark sienna → orange (closes loop)
  ],
} as const;

const SECTIONS: Array<{
  id: Exclude<SectionId, "rest">;
  label: string;
  title: string;
  href: string;
  stamp?: AlbumStamp;
  album?: AlbumKey;
}> = [
  {
    id: "about",
    label: "01",
    title: "About",
    href: "#about",
    stamp: ABOUT_STAMP,
    album: "college-dropout",
  },
  {
    id: "projects",
    label: "02",
    title: "Projects",
    href: "#projects",
    stamp: PROJECTS_STAMP,
    album: "mbdtf",
  },
  {
    id: "research",
    label: "03",
    title: "Research",
    href: "#research",
    stamp: RESEARCH_STAMP,
    album: "yeezus",
  },
  {
    id: "hobbies",
    label: "04",
    title: "Hobbies",
    href: "#hobbies",
    stamp: HOBBIES_STAMP,
    album: "tlop",
  },
  {
    id: "contact",
    label: "05",
    title: "Contact",
    href: "mailto:ozielutcs@gmail.com",
    stamp: CONTACT_STAMP,
    album: "jik",
  },
];

export function Sections() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<SectionId>("rest");
  const [activeY, setActiveY] = useState(0);
  const liRefs = useRef<Array<HTMLLIElement | null>>([]);

  const focusSection = (id: SectionId, idx: number) => {
    setActive(id);
    setActiveSection(id);
    const el = liRefs.current[idx];
    if (el) {
      // Anchor the cat companion so the cat's center sits on the title's center.
      setActiveY(el.offsetTop + TITLE_CENTER_Y_IN_LI - CAT_CENTER_Y);
    }
  };

  const blurSection = () => {
    setActive("rest");
    setActiveSection("rest");
  };

  return (
    <section
      id="sections"
      aria-label="Site sections"
      className="relative px-10 pb-40 sm:px-16 md:pl-32"
    >
      <div className="grid grid-cols-1 gap-16 md:grid-cols-[auto_minmax(0,1fr)] md:gap-24 lg:gap-32">
        <ul className="flex flex-col items-start gap-14 sm:gap-16">
          {SECTIONS.map((s, idx) => (
            <li
              key={s.id}
              ref={(el) => {
                liRefs.current[idx] = el;
              }}
              onMouseEnter={() => focusSection(s.id, idx)}
              onMouseLeave={blurSection}
              onFocus={() => focusSection(s.id, idx)}
              onBlur={blurSection}
            >
              <LevitatingCard
                label={s.label}
                title={s.title}
                href={s.href}
                stamp={s.stamp}
                album={s.album}
              />
            </li>
          ))}
        </ul>
        <aside aria-hidden className="relative hidden md:block">
          <motion.div
            className="absolute left-0 top-0 w-full"
            animate={{ y: activeY }}
            transition={
              reduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 240, damping: 28, mass: 0.9 }
            }
          >
            <CatCompanion active={active} />
          </motion.div>
        </aside>
      </div>
    </section>
  );
}
