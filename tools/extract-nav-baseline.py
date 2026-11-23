#!/usr/bin/env python3
"""Extract the current page navigation of every managed page.

This is the regression oracle for the Release 2 navigation migration and the
per-page undo for the stage that replaces authored blocks with rendered ones.
It only reads; it never writes to a page.

Output is deterministic so that re-running it on an unchanged repository
produces a byte-identical file:

  * files sorted by normalised POSIX path
  * JSON keys sorted
  * "/" separators regardless of platform
  * explicit null for a page with no navigation block
  * verbatim fallback HTML under "fallbackHtml", parsed destinations under
    "parsed" -- never interleaved
  * two-space indent, trailing newline

Usage:  python tools/extract-nav-baseline.py [--check]

  --check  verify that extraction is deterministic -- build the document twice
           and compare -- without reading or writing the committed fixture.

The committed fixture is the IMMUTABLE Release 1 baseline: it records the
navigation as it stood before Stage 2b annotated the blocks, and it is the
rollback source for the stage that replaces authored links with rendered ones.
Neither mode overwrites it once it exists; regenerating it requires deleting it
first, deliberately.
"""
from __future__ import annotations

import argparse
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "tools", "baselines", "nav-baseline.json")

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".pytest_cache", "tools", "docs"}

# The authored block. Non-greedy to the first closing div at the same nesting
# level: every page-nav in this portal contains anchors only, no nested divs
# beyond the two <div class="dir"/"ttl"> pairs, so a bounded scan is exact.
NAV_OPEN = re.compile(r'<div class="page-nav"[^>]*>')


def read(path: str) -> str:
    with io.open(path, encoding="utf-8", errors="ignore", newline="") as fh:
        return fh.read()


def html_pages(root: str) -> list[str]:
    found = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for name in sorted(filenames):
            if name.endswith(".html"):
                rel = os.path.relpath(os.path.join(dirpath, name), root)
                found.append(rel.replace(os.sep, "/"))
    return sorted(found)


def extract_block(source: str) -> str | None:
    """Return the verbatim page-nav element, or None."""
    match = NAV_OPEN.search(source)
    if not match:
        return None
    start = match.start()
    depth = 0
    index = start
    while index < len(source):
        if source.startswith("<div", index):
            depth += 1
            index += 4
            continue
        if source.startswith("</div>", index):
            depth -= 1
            index += 6
            if depth == 0:
                return source[start:index]
            continue
        index += 1
    return source[start:]


def parse_links(block: str) -> dict:
    """Split the block into a previous and a next destination.

    `class="next"` marks the forward link on every page in this portal; the
    other anchor, when present, is the backward one. Labels are captured so a
    restored block can be compared for text as well as target.
    """
    anchors = re.findall(r"<a\b([^>]*)>([\s\S]*?)</a>", block)
    prev_link, next_link = None, None
    for attrs, inner in anchors:
        href = re.search(r'href="([^"]*)"', attrs)
        title = re.search(r'<div class="ttl">([\s\S]*?)</div>', inner)
        direction = re.search(r'<div class="dir">([\s\S]*?)</div>', inner)
        entry = {
            "href": href.group(1) if href else None,
            "dir": _text(direction.group(1)) if direction else None,
            "title": _text(title.group(1)) if title else None,
        }
        if 'class="next"' in attrs:
            next_link = entry
        elif prev_link is None:
            prev_link = entry
    return {"prev": prev_link, "next": next_link, "anchorCount": len(anchors)}


def _text(raw: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", raw)).strip()


def build() -> dict:
    pages = {}
    with_block = 0
    for rel in html_pages(ROOT):
        source = read(os.path.join(ROOT, rel))
        block = extract_block(source)
        if block is None:
            pages[rel] = None
            continue
        with_block += 1
        pages[rel] = {"fallbackHtml": block, "parsed": parse_links(block)}
    return {
        "_comment": (
            "Verbatim page-navigation baseline. Tooling data, not learner "
            "documentation. Regenerate with tools/extract-nav-baseline.py."
        ),
        "generator": "tools/extract-nav-baseline.py",
        "pageCount": len(pages),
        "pagesWithNavBlock": with_block,
        "pagesWithoutNavBlock": len(pages) - with_block,
        "pages": pages,
    }


def serialise(data: dict) -> str:
    return json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true",
                        help="verify deterministic extraction; do not touch the committed fixture")
    args = parser.parse_args()

    if args.check:
        # Determinism only. The fixture is immutable and is deliberately NOT
        # compared against the current repository: Stage 2b annotated every
        # block, so the two are expected to differ. Drift against the fixture is
        # checked by tools/validate.py, which compares inner HTML and permits
        # only the approved differences.
        first, second = serialise(build()), serialise(build())
        if first != second:
            print("extraction is NOT deterministic - two runs differ")
            return 1
        print("extraction is deterministic (%d bytes, two identical runs)" % len(first))
        if os.path.exists(OUT):
            print("committed fixture left untouched: %s"
                  % os.path.relpath(OUT, ROOT).replace(os.sep, "/"))
        return 0

    if os.path.exists(OUT):
        print("refusing to overwrite the immutable Release 1 baseline: %s"
              % os.path.relpath(OUT, ROOT).replace(os.sep, "/"))
        print("delete it first if you genuinely intend to re-baseline.")
        return 1

    text = serialise(build())
    with io.open(OUT, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    data = json.loads(text)
    print("wrote %s" % os.path.relpath(OUT, ROOT).replace(os.sep, "/"))
    print("  pages                 : %d" % data["pageCount"])
    print("  with a nav block      : %d" % data["pagesWithNavBlock"])
    print("  without a nav block   : %d" % data["pagesWithoutNavBlock"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
