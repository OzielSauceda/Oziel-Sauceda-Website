// Shared "which section is the cat being summoned to" signal.
// IdleCat (sitting in the hero corner) listens to this so it can
// sink out of view when a section claims the cat, and pop back when
// the section is dismissed. Sections.tsx writes to it on hover/focus.
import { useEffect, useState } from "react";
import type { SectionId } from "@/components/cat-companion";

let active: SectionId = "rest";
const listeners = new Set<(a: SectionId) => void>();

export function setActiveSection(next: SectionId): void {
  if (active === next) return;
  active = next;
  for (const l of listeners) l(next);
}

export function useActiveSection(): SectionId {
  const [value, setValue] = useState(active);
  useEffect(() => {
    setValue(active);
    listeners.add(setValue);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
}
