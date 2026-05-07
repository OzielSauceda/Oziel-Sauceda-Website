// Tiny shared "is the bear actively talking" signal. The bear sprite
// lives in <SiteHeader /> but the typewriter that drives it lives in
// <BearSpeech />, so we lift the boolean to a module-level store and
// subscribe via a hook.
import { useEffect, useState } from "react";

let speaking = false;
const listeners = new Set<(speaking: boolean) => void>();

export function setBearSpeaking(next: boolean): void {
  if (speaking === next) return;
  speaking = next;
  for (const listener of listeners) listener(next);
}

export function useBearSpeaking(): boolean {
  const [value, setValue] = useState(speaking);
  useEffect(() => {
    setValue(speaking);
    listeners.add(setValue);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
}
