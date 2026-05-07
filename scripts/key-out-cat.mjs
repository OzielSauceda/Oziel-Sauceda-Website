import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require(
  resolve("node_modules/.pnpm/sharp@0.34.5/node_modules/sharp"),
);

const JOBS = [
  ["MichiImages/PixelMichi.png", "public/cat-closed.png"],
  ["MichiImages/TalkingMichi4.png", "public/cat-talking-v4.png"],
  ["BearImages/SubtleSmileBear.png", "public/bear-closed.png"],
  ["BearImages/TalkingBear.png", "public/bear-talking.png"],
];

async function key(srcPath, outPath) {
  const src = resolve(srcPath);
  const out = resolve(outPath);
  const meta = await sharp(src).metadata();
  const { width, height } = meta;
  if (!width || !height) throw new Error(`missing dims for ${srcPath}`);

  const { data } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = new Uint8ClampedArray(data);

  const idx = (x, y) => (y * width + x) * 4;
  const isWhiteish = (i) =>
    px[i] >= 245 && px[i + 1] >= 245 && px[i + 2] >= 245;

  // Flood-fill from every border pixel that's white-ish — wipes the
  // exterior background but preserves any interior whites.
  const visited = new Uint8Array(width * height);
  const stack = [];
  const seed = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const v = y * width + x;
    if (visited[v]) return;
    if (!isWhiteish(idx(x, y))) return;
    visited[v] = 1;
    stack.push(x, y);
  };
  for (let x = 0; x < width; x++) {
    seed(x, 0);
    seed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    seed(0, y);
    seed(width - 1, y);
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    px[idx(x, y) + 3] = 0;
    seed(x + 1, y);
    seed(x - 1, y);
    seed(x, y + 1);
    seed(x, y - 1);
  }

  await sharp(Buffer.from(px), {
    raw: { width, height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(out);

  console.log(`keyed ${width}x${height} → ${out}`);
}

for (const [srcPath, outPath] of JOBS) {
  await key(srcPath, outPath);
}
