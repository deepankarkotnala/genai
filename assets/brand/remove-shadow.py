"""Remove the ground shadow and halo around the Learn GenAI glyph.

The door and side panel end in a clear bottom outline; everything under it is
the baked-in ground shadow. Each column is scanned down from mid-height to the
first strong edge (that outline), and everything below the edge is erased.
Right of the panel only the arrow is glyph, so pale pixels there are erased,
and any stray speck left anywhere is dropped as a tiny detached component.

usage: python deshadow.py <in.png> <out.png> [preview.png]
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
a = np.asarray(im).astype(np.float32)
rgb, alpha = a[..., :3], a[..., 3]
h, w = alpha.shape
lum = np.where(alpha < 128, 0, rgb @ np.array([0.299, 0.587, 0.114]))
mx, mn = rgb.max(-1), rgb.min(-1)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
grad = np.hypot(ndimage.sobel(lum, 0), ndimage.sobel(lum, 1)) / 8

EDGE = 6.0                 # outline strength; face texture and shadow ramp sit below ~3
Y0 = int(h * 0.72)         # start scanning below the text, inside the door and panel
keep = alpha > 0

# glyph columns: the silhouette's horizontal extent at the scan start row
cols = np.flatnonzero(alpha[Y0] > 128)
x_left, x_right = cols.min(), cols.max()
MAX_OUTLINE = 4            # px of outline kept below the first edge
cut = np.full(w, np.nan)
for x in range(x_left, x_right + 1):
    col = grad[Y0:, x]
    hits = np.flatnonzero(col > EDGE)
    # no edge, or an edge right at the scan row (the column runs along a
    # vertical side of the glyph): no bottom outline of its own - borrow one
    if not len(hits) or hits[0] <= 3:
        continue
    y = hits[0]
    run = 0
    while y + 1 < len(col) and col[y + 1] > EDGE and run < MAX_OUTLINE:
        y += 1
        run += 1
    cut[x] = Y0 + y + 1
xs = np.arange(x_left, x_right + 1)
span = cut[x_left:x_right + 1]
ok = ~np.isnan(span)
span = np.interp(xs, xs[ok], span[ok])          # borrowed cuts: nearest measured columns
# a column whose scan slipped past the outline cuts lower than its neighbours
# and leaves a sliver; hold each cut near the local median
cut[x_left:x_right + 1] = np.minimum(span, ndimage.median_filter(span, size=11, mode="nearest") + 3)
# The door's bottom edge slopes down from its rounded left corner, so nothing
# left of that corner can sit lower than the column beside it; this trims the
# flat halo strip hugging the door's left side.
for x in range(x_left + int(0.25 * (x_right - x_left)), x_left - 1, -1):
    cut[x] = min(cut[x], cut[x + 1])
for x in range(x_left, x_right + 1):
    keep[int(cut[x]):, x] = False

# outside the glyph columns below the scan row there is only shadow
keep[Y0:, :x_left] = False
keep[Y0:, x_right + 1:] = False
# right of the panel, only the saturated arrow is glyph
arrow_zone = np.zeros_like(keep)
arrow_zone[:, x_right + 1:] = True
keep &= ~(arrow_zone & (sat < 0.30))

# drop specks: keep only substantial connected pieces
lab, n = ndimage.label(keep & (alpha > 60))
sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
keep = np.isin(lab, 1 + np.flatnonzero(sizes > 500))
keep = ndimage.binary_fill_holes(keep)
# round off 1-2px notches the column scan leaves on corners
disk = ndimage.generate_binary_structure(2, 1)
keep = ndimage.binary_closing(ndimage.binary_opening(keep, disk, iterations=2), disk, iterations=2)

soft = ndimage.gaussian_filter(keep.astype(np.float32), 0.6)
new_alpha = np.minimum(alpha, soft * 255)
out = np.dstack([rgb, new_alpha]).astype(np.uint8)
Image.fromarray(out, "RGBA").save(dst)

if len(sys.argv) > 3:
    after = Image.fromarray(out, "RGBA")
    p = Image.new("RGBA", (1044, 522), (255, 255, 255, 255))
    p.alpha_composite(Image.new("RGBA", (522, 522), (27, 27, 27, 255)), (522, 0))
    p.alpha_composite(after, (5, 5))
    p.alpha_composite(after, (527, 5))
    p.save(sys.argv[3])
print("columns", x_left, x_right, "- removed", int((alpha > 128).sum() - (new_alpha > 128).sum()), "px")
