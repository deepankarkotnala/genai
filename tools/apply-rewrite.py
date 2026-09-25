"""Splice a rewritten body into a live page, keeping its shell.

Every wave page is assembled the same way, so the assembly is a script rather
than a hand-edit repeated 58 times:

    shell (head, sidebar, topbar)  <- kept from the live page
    body sections 1-14             <- the new file
    section 15                     <- docs/carryover/interview/<id>.html
    section 16                     <- the new file, or --short
    page-nav + script tail         <- kept from the live page

Old <dialog class="term-dialog"> blocks are dropped: they were opened by
.term-link buttons in prose the rewrite deletes, so they would be unreachable.

    python tools/apply-rewrite.py <page.html> <body.html> <carryover-id> [--desc-old X --desc-new Y]
"""

import argparse
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CARRY_NOTE = ('<div class="carry"><b>Carried over</b> from the previous version of '
              'this page, unchanged.</div>')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("page")
    ap.add_argument("body")
    ap.add_argument("carryover_id", nargs="?", default=None,
                    help="stem under docs/carryover/interview/; omit if the page had none")
    ap.add_argument("--desc-old")
    ap.add_argument("--desc-new")
    args = ap.parse_args()

    page = os.path.join(ROOT, args.page)
    live = io.open(page, encoding="utf-8").read()
    body = io.open(args.body, encoding="utf-8").read().rstrip()

    # Section 16 has to land after the carried-over section 15, so the body file
    # keeps it below a marker and it is spliced back on at the end.
    section16 = ""
    if "<!-- SECTION16 -->" in body:
        body, section16 = body.split("<!-- SECTION16 -->", 1)
        body, section16 = body.rstrip(), section16.strip()

    # --- section 15, from the archive ------------------------------------
    interview = ""
    if args.carryover_id:
        frag = os.path.join(ROOT, "docs", "carryover", "interview", args.carryover_id + ".html")
        if not os.path.exists(frag):
            sys.exit("FATAL: no carry-over fragment at %s" % frag)
        interview = io.open(frag, encoding="utf-8").read().strip()

        # Some pages kept interview content under two headings -- the
        # neural-networks page has `interview-checklist` and `questions`. Both
        # were archived, and both belong in section 15, so the first heading
        # becomes the section and any later one is demoted to a subheading.
        # Without this the page keeps 17 sections and the carry-over check
        # measures only the first fragment.
        def demote(m):
            attrs, text = m.group(1), m.group(2)
            return "<h3%s>%s</h3>" % (attrs, re.sub(r"^\s*\d+\s*&middot;\s*|^\s*\d+\s*·\s*", "", text))

        heads = list(re.finditer(r"<h2([^>]*)>(.*?)</h2>", interview, re.S))
        if len(heads) > 1:
            head, rest = interview[:heads[1].start()], interview[heads[1].start():]
            rest = re.sub(r"<h2([^>]*)>(.*?)</h2>", demote, rest, flags=re.S)
            interview = head + rest

        interview = re.sub(r'<h2 id="[^"]*"[^>]*>.*?</h2>',
                           '<h2 id="interview">15 &middot; Interview preparation</h2>',
                           interview, count=1, flags=re.S)
        interview = CARRY_NOTE + "\n" + interview

    # --- the live shell ---------------------------------------------------
    # Matched as a pattern, not a literal: interview-prep pages open with
    # <main class="content prep-content"> and the modules use <main class="content">.
    open_main = re.search(r'<main class="content[^"]*">', live)
    if not open_main:
        sys.exit("FATAL: %s has no opening <main class=\"content...\">" % args.page)
    shell = live[:open_main.end()]
    shell = re.sub(r'(?s)<dialog class="term-dialog"[^>]*>.*?</dialog>\s*', "", shell)

    nav_m = re.search(r'(?s)<div class="page-nav" data-page-nav>.*?</div>\s*(?=</main>)', live)
    nav = nav_m.group(0) if nav_m else ""
    tail = live[live.index("</main>"):]

    if args.desc_old and args.desc_new:
        n = shell.count(args.desc_old)
        shell = shell.replace(args.desc_old, args.desc_new)
        print("  description replaced in %d place(s)" % n)

    parts = [shell, "", body]
    if interview:
        parts += ["", interview]
    if section16:
        parts += ["", section16]
    out = "\n".join(parts) + "\n\n" + nav + "\n" + tail

    # Structural guard. A carry-over fragment that accidentally included the
    # page tail once produced a document with three </main> and three </body>,
    # which the splice then preserved on every re-run. Refuse to write rather
    # than corrupt the page; validate.py would catch it, but only after the
    # damage is on disk and the clean tail is gone.
    for tag, want in (("</main>", 1), ("</body>", 1), ("</html>", 1)):
        got = out.count(tag)
        if got != want:
            sys.exit("FATAL: refusing to write %s -- %d x %s, expected %d. "
                     "Check the carry-over fragment for page-tail markup."
                     % (args.page, got, tag, want))

    # Outbound-link guard. Three separate waves shipped a rewrite that silently
    # dropped a cross-page link the live page carried -- twice it was the
    # Release 3.1 canonical middleware anchor, which turned a validator check
    # amber days later. A rewrite legitimately drops most old links, so this
    # warns rather than refusing, but it names them so the decision is made
    # rather than discovered.
    def outbound(html):
        return {h for h in re.findall(r'href="([^"#]*#[^"]+)"', html)
                if not h.startswith(("http", "mailto"))}

    dropped = sorted(outbound(live) - outbound(out))
    if dropped:
        print("  WARNING: %d cross-page link(s) present before, absent now:" % len(dropped))
        for href in dropped:
            print("    - %s" % href)

    ids = re.findall(r'\sid="([^"]+)"', out)
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        sys.exit("FATAL: refusing to write %s -- duplicate id(s): %s"
                 % (args.page, ", ".join(dupes)))

    # newline="\n" on purpose: the repo is LF throughout, and Python's default
    # translation on Windows would rewrite every line in the file.
    io.open(page, "w", encoding="utf-8", newline="\n").write(out)

    new = body + interview + section16
    print("wrote %s" % args.page)
    print("  sections: %d" % len(re.findall(r'<h2 id="', new)))
    print("  diagrams: %d" % len(re.findall(r'<svg class="bd-svg"', new)))
    # Count any <details>, not just class="collapse": pages carry questions as
    # .collapse, .recall or .prep-question, and counting one class reported 0
    # for a page that had six.
    print("  questions carried: %d" % new.count("<details"))


if __name__ == "__main__":
    main()
