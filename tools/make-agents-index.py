#!/usr/bin/env python3
"""Write teach-agents/campusx/index.html from the section specs.

The index is generated rather than hand-written so a page cannot be added
without appearing here, and the card copy cannot drift from the page it
points at.
"""
import io
import os
import importlib.util

spec = importlib.util.spec_from_file_location("c", "tools/agents_section_content.py")
content = importlib.util.module_from_spec(spec)
spec.loader.exec_module(content)

PHASES = [
    ("Foundations", "What a model is, the loop around it, and the tools it can ask for."),
    ("Knowledge", "Giving the loop information it was never trained on, and managing the budget."),
    ("Safety", "The controls that make an agent safe to point at a real system."),
    ("Operations", "Measuring whether it works, and seeing inside one run."),
    ("Scale", "Sharing tools, delegating to peers, and shipping it as a service."),
    ("Integration", "Holding all of it at once, and saying it out loud."),
]

HEAD = """<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#f4f5f8">
<title>Understanding AI Agents · CampusX | section index</title>
<meta name="description" content="Fifteen pages explaining how AI agents work, in the CampusX shape: the problem first, the mechanism next, the failure before the fix, and the honest alternative at the end.">
<link rel="icon" href="../../assets/brand/favicon.svg?v=20260727c" type="image/svg+xml">
<link rel="icon" href="../../assets/brand/favicon-32.png?v=20260727c" sizes="32x32" type="image/png">
<link rel="shortcut icon" href="../../assets/brand/favicon.ico?v=20260727c">
<link rel="apple-touch-icon" href="../../assets/brand/apple-touch-icon.png?v=20260727c" sizes="180x180">
<link rel="manifest" href="../../assets/brand/site.webmanifest?v=20260727c">
<meta name="application-name" content="Interview Preparation">
<meta name="apple-mobile-web-app-title" content="Interview Prep">
<script>(function(){try{var d=document.documentElement;var t=localStorage.getItem("gp.theme")||"light";d.setAttribute("data-theme",t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==="dark"?"#17191e":"#f3f4f6";var r={};try{r=JSON.parse(localStorage.getItem("gp.reading"))||{};}catch(e2){}var mob=!!(window.matchMedia&&window.matchMedia("(max-width:860px)").matches);var sz=["xs","s","m","l","xl"].indexOf(r.size)>=0?r.size:(mob?"s":"xs");var wd=["default","wide","full"].indexOf(r.width)>=0?r.width:"wide";var al=r.align==="justify"?"justify":"left";d.setAttribute("data-reading-size",sz);d.setAttribute("data-reading-width",wd);d.setAttribute("data-reading-align",al);}catch(e){}})();</script>
<link rel="stylesheet" href="../../assets/styles.css?v=20260805a">
<link href="../../assets/office-theme.css?v=20260805c" rel="stylesheet"/>
<link href="../../assets/genai-motion.css?v=20260804c" rel="stylesheet"/>
</head>
<body data-curriculum-id="cx-index" data-page="cx-index">
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
      <div class="crumbs">Understanding AI Agents · <b>CampusX section</b></div>
      <button class="icon-btn" data-theme-toggle aria-label="Toggle theme"></button>
    </header>

    <div class="content-wrap">
      <main class="content">
        <div class="eyebrow"><span class="dot"></span> Understanding AI Agents</div>
        <h1>The CampusX section</h1>
        <div class="meta-row">
          <span class="pill blue">⏱ ~4.5 h read</span>
          <span class="pill">15 pages · 45 diagrams · 90 interview questions</span>
        </div>

        <div class="callout key">
          <div class="c-ico">🎯</div>
          <div class="c-body"><div class="c-title">What this section is, and how it differs from the course</div>
          <p>Fifteen pages, one per lesson of the hands-on course, each written to the same
          sixteen-section shape: what you already know, what breaks, a comparison of two real
          technologies, the manual version, the mechanics, the smallest working code, the
          components, state, full assembly, a trace, a failure, the fix, production concerns,
          alternatives, interview questions, and what comes next.</p>
          <p><b>This section explains why each mechanism exists. The
          <a href="../index.html">hands-on course</a> makes you build it</b> against a working
          codebase with 190 passing tests. Read a page here, then build it there - or the
          other way round.</p></div>
        </div>
"""

TAIL = """
        <h2 id="how">How to use it</h2>
        <p>Every page is self-contained, so you can start anywhere. If you are working through
        the hands-on course, read the page here that pairs with the lesson you are on: each one
        links to its lesson at the top.</p>
        <p>Each page ends with six interview questions at four levels, and a <b>one idea to
        remember</b> box. If you can state that idea and name the failure it prevents, the page
        has done its job.</p>

        <div class="page-nav" data-page-nav>
          <a href="../index.html"><div class="dir">← Course</div><div class="ttl">Understanding AI Agents</div></a>
          <a class="next" href="01-what-a-model-does.html"><div class="dir">Start →</div><div class="ttl">01 · What a model does</div></a>
        </div>

      </main>
      <div class="toc-rail"><nav class="toc"></nav></div>
    </div>
  </div>
</div>
<script src="../../assets/app.js?v=20260731b"></script>
<script src="../../assets/sitenav.js?v=20260804b"></script>
<script src="../../assets/enhance.js?v=20260804a"></script>
<script src="../../assets/genai-motion.js?v=20260728a"></script>
</body>
</html>
"""


def main():
    by_phase = {}
    for s in content.SPECS:
        by_phase.setdefault(s["phase"], []).append(s)

    parts = [HEAD]
    for phase, blurb in PHASES:
        pages = by_phase.get(phase, [])
        if not pages:
            continue
        anchor = phase.lower()
        parts.append('\n        <h2 id="%s">%s</h2>' % (anchor, phase))
        parts.append('        <p>%s</p>' % blurb)
        parts.append('        <div class="module-grid">')
        for s in pages:
            # The card copy is the page's own comparison and reading time, so it
            # cannot drift from what the page actually contains.
            parts.append(
                '          <a class="card hover module-card" data-reveal href="%s">\n'
                '            <div class="mc-num">Page %02d</div>\n'
                '            <h3>%s</h3>\n'
                '            <span class="pill">%s · ~%d min</span>\n'
                '            <p>%s</p>\n'
                '          </a>' % (s["file"], s["n"], s["title"],
                                    s["bd_title"], s["mins"], s["desc"]))
        parts.append('        </div>')
    parts.append(TAIL)

    out = os.path.join("teach-agents", "campusx", "index.html")
    io.open(out, "w", encoding="utf-8", newline="\n").write("\n".join(parts))
    print("wrote", out, "with", len(content.SPECS), "cards")


if __name__ == "__main__":
    main()
