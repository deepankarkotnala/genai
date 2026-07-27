# -*- coding: utf-8 -*-
"""Cut the door-and-arrow glyph out of the supplied app-tile artwork.

The icon as delivered is an app tile: a white rounded square, a pale plate
inside it, then the glyph on top. Colour alone cannot separate them -- the door
panel reads rgb(237,240,253) and the plate rgb(250,249,255), and the plate's
own gradient passes straight through the door's value further down, so any
threshold that erases the plate also erases the door.

The glyph is separable by its *outline* instead: the plate is almost perfectly
flat (Sobel magnitude under 2) while every glyph boundary carries a shadow ramp
above that. So: find edges, grow the background inward from seeds placed in the
plate corners, and keep whatever the background cannot reach.

USAGE
    python cut-tile.py            # rewrites source-icon.png, keeps the original
    python make-icons.py          # then regenerate every icon from it
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "source-icon.png")
TILE_BACKUP = os.path.join(HERE, "source-icon-tile.png")

EDGE_THRESHOLD = 6.0        # Sobel magnitude; plate noise sits below 2
SEED_POINTS = [             # points known to be plate/tile, never glyph
    (60, 60), (60, 256), (60, 450), (256, 50), (256, 470),
    (450, 60), (450, 256), (450, 450), (120, 110), (120, 400),
    (440, 120), (440, 400), (100, 256), (470, 256),
]
MAX_SPAN = 0.85             # components wider/taller than this are tile rings
MIN_SOLIDITY = 0.25         # area / bounding box; rings score near zero
MIN_AREA = 400              # drop speckle
ERODE = 1                   # pull the cut inside the shadow ramp
FEATHER = 0.9


def glyph_mask(arr):
    gray = arr[:, :, :3].mean(axis=2)
    smooth = ndimage.gaussian_filter(gray, 1.0)
    magnitude = np.hypot(ndimage.sobel(smooth, axis=1), ndimage.sobel(smooth, axis=0))
    edges = ndimage.binary_closing(magnitude > EDGE_THRESHOLD, structure=np.ones((3, 3)))

    labels, _ = ndimage.label(~edges)
    background_ids = {labels[y, x] for y, x in SEED_POINTS}
    background_ids |= set(labels[0, :]) | set(labels[-1, :])
    background_ids |= set(labels[:, 0]) | set(labels[:, -1])
    background_ids.discard(0)
    mask = ~np.isin(labels, list(background_ids)) & (arr[:, :, 3] >= 8)

    # The tile border and the plate border are edges too, so both survive as
    # thin rings. Rings enclose a large empty area, so they are rejected on
    # solidity; filling their holes instead would paint the plate back in.
    height, width = mask.shape
    labels, _ = ndimage.label(mask)
    keep = np.zeros_like(mask)
    for index, box in enumerate(ndimage.find_objects(labels), start=1):
        rows, cols = box
        span_h, span_w = rows.stop - rows.start, cols.stop - cols.start
        area = (labels[box] == index).sum()
        solidity = area / float(span_h * span_w)
        if area < MIN_AREA:
            continue
        if span_h > MAX_SPAN * height or span_w > MAX_SPAN * width:
            continue
        if solidity < MIN_SOLIDITY:
            continue
        keep |= (labels == index)

    # The cut follows a shadow ramp, which leaves a ragged border. Close, then
    # median-filter, to get a silhouette that survives downscaling to 16px.
    keep = ndimage.binary_closing(keep, structure=np.ones((5, 5)))
    keep = ndimage.median_filter(keep, size=5)
    keep = ndimage.binary_fill_holes(keep)
    if ERODE:
        keep = ndimage.binary_erosion(keep, structure=np.ones((3, 3)), iterations=ERODE)
    return keep


def main():
    image = Image.open(SRC).convert("RGBA")
    arr = np.asarray(image).astype(float)

    if not os.path.exists(TILE_BACKUP):
        image.save(TILE_BACKUP)

    mask = glyph_mask(arr)
    soft = ndimage.gaussian_filter(mask.astype(float), FEATHER)
    out = arr.copy()
    out[:, :, 3] = np.clip(arr[:, :, 3] * soft, 0, 255)

    cut = Image.fromarray(out.astype("uint8"), "RGBA")
    bbox = cut.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    cut = cut.crop(bbox)
    side = max(cut.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(cut, ((side - cut.size[0]) // 2, (side - cut.size[1]) // 2), cut)
    square.save(SRC)
    print("glyph cut out: %s -> %dx%d (tile kept as source-icon-tile.png)"
          % (os.path.basename(SRC), side, side))


if __name__ == "__main__":
    main()
