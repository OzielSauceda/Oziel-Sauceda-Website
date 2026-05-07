"""Remove the white background from bear.png via edge-seeded flood fill.
Preserves internal whites (eye highlights) since they aren't edge-connected."""
from PIL import Image, ImageDraw
from pathlib import Path

src = Path(__file__).parent.parent / "public" / "bear-sticker-v3.png"
img = Image.open(src).convert("RGBA")
w, h = img.size

# Seed from many edge points so each connected white region gets caught
seeds = []
for x in range(0, w, max(1, w // 24)):
    seeds.append((x, 0))
    seeds.append((x, h - 1))
for y in range(0, h, max(1, h // 24)):
    seeds.append((0, y))
    seeds.append((w - 1, y))

for sx, sy in seeds:
    px = img.getpixel((sx, sy))
    if px[3] == 0:
        continue  # already filled
    if px[0] < 220 or px[1] < 220 or px[2] < 220:
        continue  # not white-ish; skip
    ImageDraw.floodfill(img, (sx, sy), (0, 0, 0, 0), thresh=60)

img.save(src, "PNG", optimize=True)
print(f"Saved transparent {src.name} ({src.stat().st_size:,} bytes)")
