// Per-character delays (ms) so typing pauses on punctuation the way
// a person would when reading aloud. Anything not in the map types at
// the caller's base interval.
export const PUNCT_PAUSE: Record<string, number> = {
  ",": 200,
  ";": 240,
  ":": 240,
  ".": 360,
  "!": 360,
  "?": 360,
  "\n": 400,
};

export function pauseAfter(ch: string, base: number): number {
  return PUNCT_PAUSE[ch] ?? base;
}

export function isPauseChar(ch: string): boolean {
  return PUNCT_PAUSE[ch] !== undefined;
}
