#!/usr/bin/env python3
"""Generate the "Understanding AI Agents - CampusX" section.

Fifteen pages, one per lesson of the hands-on course, each written to the
literal sixteen-section template in claude_plan.md §2. Where the hands-on
lesson teaches a build step, these pages teach the *idea* behind it: what the
problem is, what one technology does about it, what the honest alternative is,
and when to pick which.

Voice: claude_plan.md §1.2 -- simple, literal, short sentences, no metaphor and
no analogy, keeping the technology's own vocabulary and defining each term once
at first use. Same voice as the fourteen rewritten module pages.

Every page carries the block (§3), at least three generated diagrams (§4), and
a section 15 of interview questions. These pages are new, so their questions
are authored rather than carried over -- the standing rule from `hermes.html`.

    python tools/make-agents-section.py            # write all fifteen
    python tools/make-agents-section.py --check    # report, write nothing
"""
from __future__ import annotations

import argparse
import io
import os
import re
from importlib.machinery import SourceFileLoader

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = SourceFileLoader("d", os.path.join(ROOT, "tools", "make-diagram.py")).load_module()

OUT_DIR = os.path.join(ROOT, "teach-agents", "campusx")
REL = "teach-agents/campusx"

SECTIONS = [
    ("known", "What you already know"),
    ("breaks", "What breaks now"),
    ("breakdown", "Simple breakdown"),
    ("without", "Without the technology"),
    ("mechanics", "Runtime mechanics"),
    ("smallest", "Smallest working version"),
    ("components", "The components, one at a time"),
    ("state", "State and data flow"),
    ("assembly", "Full code, in assembly order"),
    ("trace", "Trace"),
    ("break", "Break it"),
    ("fix", "Fix it"),
    ("production", "Production version"),
    ("comparison", "Comparison"),
    ("interview", "Interview preparation"),
    ("short", "In short, and what comes next"),
]

BD_LABELS = ["What it is.", "Core purpose.", "Execution model.",
             "Architecture under the hood.", "State handling.",
             "Limitations and advanced features."]


# --------------------------------------------------------------- the shell ---
HEAD = """<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#f4f5f8">
<title>{n:02d} · {title} | Understanding AI Agents</title>
<meta name="description" content="{desc}">
<link rel="icon" href="../../assets/brand/favicon.svg?v=20260727c" type="image/svg+xml">
<link rel="icon" href="../../assets/brand/favicon-32.png?v=20260727c" sizes="32x32" type="image/png">
<link rel="shortcut icon" href="../../assets/brand/favicon.ico?v=20260727c">
<link rel="apple-touch-icon" href="../../assets/brand/apple-touch-icon.png?v=20260727c" sizes="180x180">
<link rel="manifest" href="../../assets/brand/site.webmanifest?v=20260727c">
<link rel="mask-icon" href="../../assets/brand/safari-pinned-tab.svg?v=20260727c" color="#6f47f5">
<meta name="application-name" content="Interview Preparation">
<meta name="apple-mobile-web-app-title" content="Interview Prep">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<script>(function(){{try{{var d=document.documentElement;var t=localStorage.getItem("gp.theme")||"light";d.setAttribute("data-theme",t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==="dark"?"#17191e":"#f3f4f6";var r={{}};try{{r=JSON.parse(localStorage.getItem("gp.reading"))||{{}};}}catch(e2){{}}var mob=!!(window.matchMedia&&window.matchMedia("(max-width:860px)").matches);var sz=["xs","s","m","l","xl"].indexOf(r.size)>=0?r.size:(mob?"s":"xs");var wd=["default","wide","full"].indexOf(r.width)>=0?r.width:"wide";var al=r.align==="justify"?"justify":"left";d.setAttribute("data-reading-size",sz);d.setAttribute("data-reading-width",wd);d.setAttribute("data-reading-align",al);if("PageRevealEvent" in window){{d.classList.add("xvt");window.addEventListener("pagereveal",function(ev){{if(!ev.viewTransition)return;d.classList.add("vt-in");var off=function(){{d.classList.remove("vt-in")}};ev.viewTransition.finished.then(off,off);}});}}}}catch(e){{}}}})();</script>
<link rel="stylesheet" href="../../assets/styles.css?v=20260805a">
<link href="../../assets/office-theme.css?v=20260805c" rel="stylesheet"/>
<link href="../../assets/genai-motion.css?v=20260804c" rel="stylesheet"/>
<link href="../../assets/glossary.css?v=20260802b" rel="stylesheet"/>
</head>
<body data-curriculum-id="cx-{n:02d}" data-page="cx-{n:02d}">
<div class="app">
  <aside class="sidebar">
    <div class="brand">
<a class="brand-link" href="../../index.html" aria-label="Learn GenAI home">
<span class="brand-mark" aria-hidden="true"><img src="../../assets/brand/switch-job-logo.png?v=20260727c" alt=""/></span>
<div class="brand-text"><strong>Learn GenAI</strong><span>Learning Platform</span></div>
</a>
</div>
    <div class="search-wrap">
      <div class="search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" data-search placeholder="Search this section…  ( / )">
      </div>
      <div class="search-results"></div>
    </div>
    <nav class="nav"></nav>
  </aside>
  <div class="backdrop"></div>

  <div class="main">
    <header class="topbar">
      <button class="icon-btn menu-btn" aria-label="Menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>
      <div class="crumbs">Understanding AI Agents · CampusX / <b>{n:02d} · {title}</b></div>
      <button class="icon-btn" data-theme-toggle aria-label="Toggle theme"></button>
    </header>

    <div class="content-wrap">
      <main class="content">
        <div class="eyebrow"><span class="dot"></span> {n:02d} · {phase}</div>
        <h1>{h1}</h1>
        <div class="meta-row">
          <span class="pill blue">⏱ ~{mins} min read</span>
          <span class="pill purple">Pairs with · <a href="../lessons/{lesson}">{lesson_title}</a></span>
        </div>
"""

TAIL = """
<div class="page-nav" data-page-nav>
{nav}
</div>

</main>
<div class="toc-rail"><nav class="toc"></nav></div>
</div>
</div>
</div>
<script>
window.__pageNav = {{
  navLabel: "Understanding AI Agents · CampusX",
  here: "campusx/{file}",
  base: "../",
  pages: [
    {{ file: "campusx/index.html", title: "Section index", num: "✦", kw: "campusx agents index" }}
  ]
}};
</script>
<script src="../../assets/app.js?v=20260731b"></script>
<script src="../../assets/sitenav.js?v=20260804b"></script>
<script src="../../assets/enhance.js?v=20260804a"></script>
<script src="../../assets/genai-motion.js?v=20260728a"></script>
<script src="../../assets/glossary.js?v=20260802b"></script>
</body>
</html>
"""


def qa(level, question, answer):
    pill = {"Beginner": "green", "Intermediate": "blue",
            "Senior": "amber", "Staff · design": "purple"}[level]
    return ('<details class="collapse"><summary><span class="pill %s">%s</span>  %s '
            '<span class="chev">›</span></summary>\n'
            '<div class="collapse-body"><p>%s</p></div></details>'
            % (pill, level, question, answer))


def page(spec):
    """Assemble one page from its spec dict."""
    parts = [HEAD.format(**spec)]
    body = spec["sections"]
    for i, (sid, title) in enumerate(SECTIONS, 1):
        heading = title if sid != "short" else "In short, and what comes next"
        parts.append('\n<!-- ================= %d ================= -->' % i)
        if sid == "breakdown":
            parts.append('<h2 id="breakdown">3 · Simple breakdown - %s</h2>' % spec["bd_title"])
            parts.append(spec["block"])
            continue
        if sid == "interview":
            parts.append('<div class="carry"><b>New questions</b> written for this page: '
                         'it is new, so there was nothing to carry over.</div>')
            parts.append('<h2 id="interview">15 &middot; Interview preparation</h2>')
            parts.append("\n".join(qa(*q) for q in spec["questions"]))
            continue
        parts.append('<h2 id="%s">%d · %s</h2>' % (sid, i, heading))
        parts.append(body[sid])
    parts.append(TAIL.format(nav=spec["nav"], file=spec["file"]))
    return "\n".join(parts)


from agents_section_content import SPECS  # noqa: E402  (data lives beside this)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="report only, write nothing")
    args = ap.parse_args()

    if not args.check:
        os.makedirs(OUT_DIR, exist_ok=True)
    problems = []
    for spec in SPECS:
        html = page(spec)
        have = set(re.findall(r'<h2 id="([^"]+)"', html))
        for sid, title in SECTIONS:
            if sid not in have:
                problems.append("%s: missing section %s" % (spec["file"], sid))
        svgs = re.findall(r'(?s)<svg class="bd-svg".*?</svg>', html)
        if len(svgs) < 3:
            problems.append("%s: %d diagram(s), minimum 3" % (spec["file"], len(svgs)))
        for label in BD_LABELS:
            if html.count(">%s<" % label) < 2:
                problems.append("%s: label %r not on both technologies" % (spec["file"], label))
        if not args.check:
            path = os.path.join(OUT_DIR, spec["file"])
            io.open(path, "w", encoding="utf-8", newline="\n").write(html)
        print("%-34s %2d sections  %d diagrams  %d questions"
              % (spec["file"], len(have), len(svgs), len(spec["questions"])))
    if problems:
        print("\nPROBLEMS")
        for p in problems:
            print("  -", p)
        return 1
    print("\n%d page(s) %s" % (len(SPECS), "checked" if args.check else "written"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
