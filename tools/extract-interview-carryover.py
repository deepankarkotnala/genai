"""Archive every existing interview section before the portal rewrite.

The rewrite discards all page content except the interview questions. That makes
the extraction the one irreversible step in the whole project: once a page is
rewritten, the questions are only recoverable from git. This script pulls them
out first, writes one fragment per page under docs/carryover/interview/, and
writes an index so `validate.py --check interview-carryover` can prove that
every rewritten page still carries its questions.

Run it once, before wave 1. Re-running is safe: it overwrites the fragments and
rebuilds the index, and it refuses to overwrite a fragment with an empty one.

    python tools/extract-interview-carryover.py
    python tools/extract-interview-carryover.py --verify
"""

import argparse
import io
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "carryover", "interview")
INDEX = os.path.join(ROOT, "docs", "carryover", "index.json")

# Section ids holding interview content. Collected by survey, not assumed, and
# widened twice after the survey found cases an obvious pattern would drop:
#
#   `interview-checklist`  -- an exact match on "interview" as an id would miss it
#   `questions`            -- interview-prep/00-neural-networks.html keeps its
#                             whole question bank under a plain id="questions",
#                             with the word "interview" only in the heading text
#
# Quiz, active recall and exercises are deliberately NOT matched: they test page
# content that the rewrite replaces, so they are rewritten rather than carried.
ID_RE = re.compile(
    r'<h2 id="((?:[^"]*interview[^"]*)|(?:questions))"[^>]*>', re.I)


def load_manifest():
    proc = subprocess.run(["node", os.path.join(ROOT, "tools", "curriculum-export.js")],
                          capture_output=True, text=True, encoding="utf-8")
    if proc.returncode != 0:
        sys.exit("FATAL: curriculum-export.js failed:\n" + (proc.stderr or "")[:2000])
    return json.loads(proc.stdout)


def section_after(src, start):
    """The h2 and everything up to the next section boundary.

    "Next h2" alone is not a boundary: when the interview section is the LAST
    one on a page there is no following h2, and the fragment then runs to the
    end of the file -- swallowing the page-nav block, </main>, the script tags
    and </body></html>. Splicing that into a rewritten page produced a second
    </main> and duplicate element ids. So the closing markup counts as a
    boundary too, and whichever comes first wins.
    """
    rest = src[start + 4:]
    ends = [m.start() for m in (
        re.search(r"<h2[ >]", rest),
        re.search(r'<div class="page-nav"', rest),
        re.search(r"</main>", rest),
        re.search(r"<dialog\b", rest),
    ) if m]
    end = start + 4 + min(ends) if ends else len(src)
    frag = src[start:end]
    # Drop the section-divider comment that belongs to the *next* section.
    return re.sub(r"(?s)<!--\s*=+\s*\d+\..*?-->\s*$", "", frag).rstrip() + "\n"


def word_count(html):
    text = re.sub(r"<[^>]+>", " ", html)
    return len([w for w in re.split(r"\s+", text) if w.strip()])


def extract(verify_only=False):
    man = load_manifest()
    rows, problems = [], []

    if not verify_only:
        os.makedirs(OUT, exist_ok=True)

    for pid, page in sorted(man["pages"].items()):
        path = os.path.join(ROOT, page["path"])
        if not os.path.exists(path):
            continue
        src = io.open(path, encoding="utf-8").read()
        hits = list(ID_RE.finditer(src))
        if not hits:
            continue

        frags = [section_after(src, h.start()) for h in hits]
        frag = "\n".join(frags)
        words = word_count(frag)
        # Count any <details> block, not just class="collapse": pages carry their
        # questions as .collapse, .recall or .prep-question, and counting one class
        # reported 0 questions for pages that plainly had six. The archived words
        # were always correct -- only this number was wrong.
        # Pages carry questions in three different shapes: <details> blocks
        # (.collapse / .recall / .prep-question), "Q &middot;" callouts, or plain
        # <h3> headings. Counting only one shape reported 0 questions for pages
        # that plainly had several. The archived words were always right -- only
        # this number was wrong.
        questions = (frag.count("<details")
                     or len(re.findall(r"Q\s*(?:&middot;|·|\.)\s", frag))
                     or len(re.findall(r"<h3[ >]", frag)))

        if words < 20:
            problems.append("%s: extracted only %d words" % (page["path"], words))
            continue

        dest = os.path.join(OUT, pid + ".html")
        if not verify_only:
            io.open(dest, "w", encoding="utf-8", newline="\n").write(frag)

        rows.append({
            "id": pid,
            "path": page["path"],
            "title": page.get("title", ""),
            "sectionIds": [h.group(1) for h in hits],
            "questions": questions,
            "words": words,
            "fragment": os.path.relpath(dest, ROOT).replace(os.sep, "/"),
        })

    if not verify_only:
        # newline="\n": the repo is LF throughout and Python would otherwise
        # write CRLF on Windows, turning every rewrite into a whole-file diff.
        io.open(INDEX, "w", encoding="utf-8", newline="\n").write(
            json.dumps({"pages": rows}, indent=2) + "\n")

    return rows, problems


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--verify", action="store_true",
                    help="report what would be extracted without writing")
    args = ap.parse_args()

    rows, problems = extract(verify_only=args.verify)

    print("interview carry-over %s" % ("check" if args.verify else "extraction"))
    print("-" * 70)
    for r in rows:
        print("  %-22s %-46s %3d q  %4d w" % (r["id"], r["path"], r["questions"], r["words"]))
    print("-" * 70)
    print("  %d page(s), %d question(s), %d word(s)"
          % (len(rows), sum(r["questions"] for r in rows), sum(r["words"] for r in rows)))
    for p in problems:
        print("  PROBLEM: %s" % p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
