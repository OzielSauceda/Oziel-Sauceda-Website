"use client";
// reason: shared hover/focus state lifts above the section list so the cat companion can follow the active row

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { setActiveSection } from "@/lib/cat-state";
import { CAT_CENTER_Y, CatCompanion, type SectionId } from "./cat-companion";
import { LevitatingCard } from "./levitating-card";

// Roughly the Y of the big title's center within each <li>:
// label (~14) + mt-10 (40) + pt-2 (8) + half of 48 px title ≈ 86 px.
const TITLE_CENTER_Y_IN_LI = 88;

const SECTIONS: Array<{
  id: Exclude<SectionId, "rest">;
  label: string;
  title: string;
  href: string;
}> = [
  { id: "about", label: "01", title: "About", href: "#about" },
  { id: "projects", label: "02", title: "Projects", href: "#projects" },
  { id: "research", label: "03", title: "Research", href: "#research" },
  { id: "hobbies", label: "04", title: "Hobbies", href: "#hobbies" },
  {
    id: "contact",
    label: "05",
    title: "Contact",
    href: "mailto:ozielutcs@gmail.com",
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
              <LevitatingCard label={s.label} title={s.title} href={s.href} />
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
