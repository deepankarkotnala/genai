# -*- coding: utf-8 -*-
"""Regenerate all site/home-screen icons from one source image.

USAGE
    1. Save the SWITCH JOB illustration into this folder as:  source-icon.png
    2. Run:  python make-icons.py
It overwrites apple-touch-icon.png, icon-192/512, icon-maskable-512,
favicon-16/32, favicon.ico, and mstile-150x150.png in place.
"""
import base64
import io
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "source-icon.png")
BG = (245, 247, 251, 255)   # manifest background_color #f5f7fb (opaque icons)

ALPHA_FLOOR = 10            # ignore the near-invisible drop shadow when cropping

def load_square():
    im = Image.open(SRC).convert("RGBA")
    # Crop away the empty margin. Plain getbbox() keeps the full canvas whenever
    # a soft shadow bleeds to the edges at alpha 1-2, which leaves the artwork
    # looking small in a 16px tab, so measure against a low alpha floor instead.
    mask = im.getchannel("A").point(lambda value: 255 if value > ALPHA_FLOOR else 0)
    bbox = mask.getbbox() or im.getbbox()
    if bbox:
        im = im.crop(bbox)
    # pad to a centered square on transparency
    w, h = im.size
    side = max(w, h)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(im, ((side - w) // 2, (side - h) // 2), im)
    return canvas

def opaque(img, size, pad_frac=0.0):
    """Resize onto an opaque background; pad_frac adds a safe margin (maskable)."""
    base = Image.new("RGBA", (size, size), BG)
    inner = int(size * (1 - 2 * pad_frac))
    icon = img.resize((inner, inner), Image.LANCZOS)
    off = (size - inner) // 2
    base.paste(icon, (off, off), icon)
    return base.convert("RGB")

def transparent(img, size):
    return img.resize((size, size), Image.LANCZOS)

def svg_wrapper(img, size, name):
    """Write an SVG that embeds the artwork as a base64 PNG.

    The tab icon and the in-page brand mark are served as SVG so one file
    covers every display density; keeping them generated here means they never
    drift from the raster icons.
    """
    buffer = io.BytesIO()
    transparent(img, size).save(buffer, format="PNG", optimize=True)
    data = base64.b64encode(buffer.getvalue()).decode("ascii")
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {0} {0}">'
           '<image width="{0}" height="{0}" href="data:image/png;base64,{1}"/>'
           '</svg>').format(size, data)
    with open(os.path.join(HERE, name), "w", encoding="utf-8") as handle:
        handle.write(svg)

def main():
    if not os.path.exists(SRC):
        raise SystemExit("Put the image at assets/brand/source-icon.png first.")
    sq = load_square()

    # The source is the bare glyph on transparency, so the opaque platform
    # icons supply their own breathing room; iOS and Windows both crop or
    # round the square, and a glyph touching the edge looks clipped.
    opaque(sq, 180, pad_frac=0.10).save(os.path.join(HERE, "apple-touch-icon.png"))   # iOS home screen
    opaque(sq, 192, pad_frac=0.08).save(os.path.join(HERE, "icon-192.png"))            # Android/PWA
    opaque(sq, 512, pad_frac=0.08).save(os.path.join(HERE, "icon-512.png"))
    opaque(sq, 512, pad_frac=0.18).save(os.path.join(HERE, "icon-maskable-512.png"))   # safe zone
    opaque(sq, 150, pad_frac=0.14).save(os.path.join(HERE, "mstile-150x150.png"))      # Windows tile
    transparent(sq, 32).save(os.path.join(HERE, "favicon-32.png"))             # tab (keeps alpha)
    transparent(sq, 16).save(os.path.join(HERE, "favicon-16.png"))
    # multi-resolution .ico for legacy/browser tabs
    transparent(sq, 256).save(os.path.join(HERE, "favicon.ico"),
                              sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    transparent(sq, 256).save(os.path.join(HERE, "switch-job-logo.png"))       # sidebar brand mark
    svg_wrapper(sq, 96, "favicon.svg")                                          # scalable tab icon
    svg_wrapper(sq, 128, "switch-job-logo.svg")                                 # legacy vector mark
    svg_wrapper(sq, 128, "logo-glass.svg")
    print("Icons regenerated in", HERE)

if __name__ == "__main__":
    main()
