# -*- coding: utf-8 -*-
"""Regenerate all site/home-screen icons from one source image.

USAGE
    1. Save the SWITCH JOB illustration into this folder as:  source-icon.png
    2. Run:  python make-icons.py
It overwrites apple-touch-icon.png, icon-192/512, icon-maskable-512,
favicon-16/32, favicon.ico, and mstile-150x150.png in place.
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "source-icon.png")
BG = (245, 247, 251, 255)   # manifest background_color #f5f7fb (opaque icons)

def load_square():
    im = Image.open(SRC).convert("RGBA")
    # crop away fully-transparent margin (the checkerboard area), if any
    bbox = im.getbbox()
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

def main():
    if not os.path.exists(SRC):
        raise SystemExit("Put the image at assets/brand/source-icon.png first.")
    sq = load_square()

    opaque(sq, 180).save(os.path.join(HERE, "apple-touch-icon.png"))          # iOS home screen
    opaque(sq, 192).save(os.path.join(HERE, "icon-192.png"))                   # Android/PWA
    opaque(sq, 512).save(os.path.join(HERE, "icon-512.png"))
    opaque(sq, 512, pad_frac=0.11).save(os.path.join(HERE, "icon-maskable-512.png"))  # safe zone
    opaque(sq, 150).save(os.path.join(HERE, "mstile-150x150.png"))             # Windows tile
    transparent(sq, 32).save(os.path.join(HERE, "favicon-32.png"))             # tab (keeps alpha)
    transparent(sq, 16).save(os.path.join(HERE, "favicon-16.png"))
    # multi-resolution .ico for legacy/browser tabs
    transparent(sq, 256).save(os.path.join(HERE, "favicon.ico"),
                              sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Icons regenerated in", HERE)

if __name__ == "__main__":
    main()
