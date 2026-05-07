"use client";
// reason: shared hover/focus state lifts above the section list so the preview rail can react to which section is active

import { useState } from "react";
import { LevitatingCard } from "./levitating-card";
import { SectionPreview, type SectionId } from "./section-preview";

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
  const [active, setActive] = useState<SectionId>("rest");

  return (
    <section
      id="sections"
      aria-label="Site sections"
      className="relative px-10 pb-40 sm:px-16 md:pl-32"
    >
      <div className="grid grid-cols-1 gap-16 md:grid-cols-[auto_minmax(0,1fr)] md:gap-24 lg:gap-32">
        <ul className="flex flex-col items-start gap-14 sm:gap-16">
          {SECTIONS.map((s) => (
            <li
              key={s.id}
              onMouseEnter={() => setActive(s.id)}
              onMouseLeave={() => setActive("rest")}
              onFocus={() => setActive(s.id)}
              onBlur={() => setActive("rest")}
            >
              <LevitatingCard
                label={s.label}
                title={s.title}
                href={s.href}
              />
            </li>
          ))}
        </ul>
        <aside aria-hidden className="hidden md:block">
          <div className="sticky top-32">
            <SectionPreview active={active} />
          </div>
        </aside>
      </div>
    </section>
  );
}
