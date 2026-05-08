// Tiny pixel-art album-cover icons that sit next to each section's label.
// Each sprite is a 16×16 abstract composition pulled from its album cover —
// not a faithful reproduction, but enough silhouette + palette so anyone
// who knows the album recognizes it. Inline SVG with shape-rendering
// crispEdges keeps the pixel grid sharp at any display size.

import type { ReactElement } from "react";

export type AlbumKey =
  | "college-dropout"
  | "yeezus"
  | "mbdtf"
  | "tlop"
  | "jik";

type AlbumSpriteProps = {
  album: AlbumKey;
  size?: number;
  className?: string;
};

export function AlbumSprite({
  album,
  size = 28,
  className,
}: AlbumSpriteProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden
      className={className}
      style={{ imageRendering: "pixelated", display: "block" }}
    >
      {SPRITES[album]}
    </svg>
  );
}

const SPRITES: Record<AlbumKey, ReactElement> = {
  // College Dropout: gold-framed burgundy panel with the bear silhouette.
  "college-dropout": (
    <>
      <rect width="16" height="16" fill="#6b1c24" />
      <rect width="16" height="2" fill="#d4a040" />
      <rect y="14" width="16" height="2" fill="#d4a040" />
      <rect width="2" height="16" fill="#d4a040" />
      <rect x="14" width="2" height="16" fill="#d4a040" />
      <rect x="5" y="4" width="6" height="2" fill="#3d2010" />
      <rect x="4" y="6" width="8" height="6" fill="#3d2010" />
      <rect x="5" y="7" width="2" height="2" fill="#e8d4a8" />
      <rect x="9" y="7" width="2" height="2" fill="#e8d4a8" />
      <rect x="7" y="9" width="2" height="2" fill="#e8d4a8" />
      <rect x="6" y="12" width="4" height="2" fill="#3d2010" />
    </>
  ),
  // Yeezus: off-white case with the silver disc and the iconic red sticker.
  yeezus: (
    <>
      <rect width="16" height="16" fill="#e8ecef" />
      <rect x="1" y="3" width="11" height="10" fill="#a5b4be" />
      <rect x="2" y="2" width="9" height="1" fill="#a5b4be" />
      <rect x="2" y="13" width="9" height="1" fill="#a5b4be" />
      <rect x="6" y="7" width="2" height="2" fill="#2d2d2d" />
      <rect x="11" y="6" width="4" height="4" fill="#e62718" />
    </>
  ),
  // MBDTF (phoenix cover): red field with the gold-framed pixelated panel.
  mbdtf: (
    <>
      <rect width="16" height="16" fill="#d62a2a" />
      <rect x="4" y="4" width="8" height="8" fill="#d4a040" />
      <rect x="5" y="5" width="2" height="2" fill="#d4a08c" />
      <rect x="7" y="5" width="2" height="2" fill="#3e6e9c" />
      <rect x="9" y="5" width="2" height="2" fill="#3a4858" />
      <rect x="5" y="7" width="2" height="2" fill="#8a5a3a" />
      <rect x="7" y="7" width="2" height="2" fill="#d4a08c" />
      <rect x="9" y="7" width="2" height="2" fill="#3e6e9c" />
      <rect x="5" y="9" width="2" height="2" fill="#3d2418" />
      <rect x="7" y="9" width="2" height="2" fill="#8a5a3a" />
      <rect x="9" y="9" width="2" height="2" fill="#3d2418" />
    </>
  ),
  // The Life of Pablo: orange field with the repeating "THE LIFE OF / PABLO"
  // text rows + a small photo inset block in the lower right.
  tlop: (
    <>
      <rect width="16" height="16" fill="#e88830" />
      <rect x="1" y="2" width="6" height="1" fill="#1a1a1a" />
      <rect x="9" y="2" width="5" height="1" fill="#1a1a1a" />
      <rect x="1" y="5" width="6" height="1" fill="#1a1a1a" />
      <rect x="9" y="5" width="5" height="1" fill="#1a1a1a" />
      <rect x="1" y="8" width="6" height="1" fill="#1a1a1a" />
      <rect x="9" y="8" width="5" height="1" fill="#1a1a1a" />
      <rect x="3" y="11" width="4" height="3" fill="#a8784a" />
      <rect x="9" y="11" width="5" height="3" fill="#5a96b4" />
    </>
  ),
  // Jesus Is King (cobalt vinyl): blue disc with the cream center label,
  // gold "JESUS IS KING" hint, and the dark center hole.
  jik: (
    <>
      <rect x="3" y="2" width="10" height="12" fill="#1e44e8" />
      <rect x="2" y="3" width="12" height="10" fill="#1e44e8" />
      <rect x="1" y="5" width="14" height="6" fill="#1e44e8" />
      <rect x="5" y="6" width="6" height="4" fill="#e8d8b8" />
      <rect x="5" y="6" width="6" height="1" fill="#c8a040" />
      <rect x="5" y="9" width="6" height="1" fill="#c8a040" />
      <rect x="7" y="7" width="2" height="2" fill="#0a1850" />
    </>
  ),
};
