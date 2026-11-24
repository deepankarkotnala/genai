#!/usr/bin/env python3
"""Build review.html - spaced-review flashcards - from the topic pages.

Single source of truth: every topic page's "Check yourself" questions
(<details class="recall">) and its Memory hook box
(<div class="callout key memory-hook">). This script copies them into
review.html as ordinary static HTML, grouped by topic. The page's inline
script turns those same elements into a flashcard deck, so there is exactly
one copy of each card and the page still reads fine with JavaScript off.

Nothing is fetched at run time, so review.html works when opened by
double-click (file://). Nothing is stored in the browser either: the
schedule (1, 3, 7, 21 days) is something the learner follows, not something
the page tracks.

Usage:
  python tools/make-review.py          rewrite review.html
  python tools/make-review.py --check  exit 1 if review.html is out of date
"""
import argparse
import html
import json
import os
import posixpath
import re
import subprocess
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "review.html")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "source", "track", "wbr"}


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()


# ------------------------------------------------------------- topic order
def topics():
    """Basics preflight, then the 15 GenAI Mastery topics in reading order."""
    proc = subprocess.run(["node", os.path.join(ROOT, "tools", "curriculum-export.js")],
                          capture_output=True, text=True, encoding="utf-8")
    if proc.returncode != 0:
        sys.exit("make-review: curriculum-export.js failed\n" + proc.stderr)
    man = json.loads(proc.stdout)
    ids = list(man["routes"]["full"].get("preflight", [])) + man["collections"]["mastery"]["members"]

    # Display number, short title and track come from the sidebar registry,
    # which is what the learner sees in the navigation.
    nav = {}
    for m in re.finditer(r'\{ path: "([^"]+)", title: "([^"]+)", num: "([^"]+)", track: "([^"]+)"',
                         read("assets/sitenav.js")):
        nav[m.group(1)] = {"title": m.group(2), "num": m.group(3), "track": m.group(4)}

    out = []
    for pid in ids:
        path = man["pages"][pid]["path"]
        meta = nav.get(path, {"title": "The Basics", "num": "00", "track": "Start here"})
        out.append({"id": pid, "path": path, **meta})
    return out


# ---------------------------------------------------------- page parsing
class Elements(HTMLParser):
    """Record every element's tag, classes and source offsets."""

    def __init__(self, src):
        super().__init__(convert_charrefs=False)
        self.src = src
        self.line_starts = [0]
        for i, ch in enumerate(src):
            if ch == "\n":
                self.line_starts.append(i + 1)
        self.stack, self.els = [], []

    def _off(self):
        line, col = self.getpos()
        return self.line_starts[line - 1] + col

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        start = self._off()
        a = dict(attrs)
        el = {"tag": tag, "cls": (a.get("class") or "").split(), "attrs": a,
              "start": start, "inner": start + len(self.get_starttag_text())}
        self.stack.append(el)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]["tag"] == tag:
                el = self.stack[i]
                end_tag_at = self._off()
                el["inner_end"] = end_tag_at
                el["end"] = self.src.index(">", end_tag_at) + 1
                self.els.append(el)
                del self.stack[i:]
                return


def rebase_links(fragment, page_path):
    """Make relative hrefs in copied HTML work from the site root."""
    base = posixpath.dirname(page_path)

    def fix(m):
        href = m.group(1)
        if re.match(r"^(?:[a-z]+:|#|/)", href) or not base:
            return m.group(0)
        return 'href="%s"' % posixpath.normpath(posixpath.join(base, href))

    return re.sub(r'href="([^"]*)"', fix, fragment)


def clean(fragment, page_path):
    fragment = re.sub(r'\s(?:id|data-reveal)="[^"]*"', "", fragment)
    return rebase_links(fragment.strip(), page_path)


def extract(topic):
    src = read(topic["path"])
    p = Elements(src)
    p.feed(src)
    els = sorted(p.els, key=lambda e: e["start"])

    def inside(outer, pred):
        return [e for e in els if outer["start"] < e["start"] and e["end"] <= outer["end"] and pred(e)]

    # "Check yourself" headings give each card its level.
    checks = [(m.start(), m.group(1) or "")
              for m in re.finditer(r"<h3[^>]*>\s*Check yourself(?::\s*(Level \d))?\s*</h3>", src)]

    cards = []
    for d in els:
        if d["tag"] != "details" or "recall" not in d["cls"]:
            continue
        summ = inside(d, lambda e: e["tag"] == "summary")
        ans = inside(d, lambda e: e["tag"] == "div" and "a" in e["cls"])
        if not summ or not ans:
            continue
        q = src[summ[0]["inner"]:summ[0]["inner_end"]]
        q = re.sub(r'<span class="q-ico">.*?</span>|<span class="chev">.*?</span>', "", q).strip()
        a = src[ans[0]["inner"]:ans[0]["inner_end"]]
        level = ""
        for pos, lv in checks:
            if pos < d["start"]:
                level = lv
        cards.append({"q": clean(q, topic["path"]), "a": clean(a, topic["path"]), "level": level})

    hook = ""
    for h in els:
        if h["tag"] == "div" and "memory-hook" in h["cls"]:
            body = inside(h, lambda e: e["tag"] == "div" and "c-body" in e["cls"])
            if body:
                inner = src[body[0]["inner"]:body[0]["inner_end"]]
                inner = re.sub(r'<div class="c-title">.*?</div>', "", inner, flags=re.S)
                hook = clean(inner, topic["path"])
            break
    return cards, hook


# --------------------------------------------------------------- render
def render(data):
    total = sum(len(t["cards"]) for t in data)
    hooks = sum(1 for t in data if t["hook"])

    rows, sections = [], []
    for t in data:
        label = "%s · %s" % (t["num"], t["title"])
        rows.append(
            '<tr><td><a href="#t-%s">%s</a></td><td>%s</td></tr>'
            % (t["id"], html.escape(label), t["hook"] or "<em>No hook yet.</em>"))
        cards = "\n".join(
            '<details class="recall"%s><summary><span class="q-ico">Q</span> %s <span class="chev">›</span></summary><div class="a">%s</div></details>'
            % (' data-level="%s"' % c["level"] if c["level"] else "", c["q"], c["a"])
            for c in t["cards"])
        sections.append(
            '<section class="rv-topic" id="t-%(id)s" data-topic="%(id)s" data-num="%(num)s" '
            'data-title="%(title)s" data-track="%(track)s" data-href="%(path)s">\n'
            '<h3>%(label)s <a class="rv-open" href="%(path)s">open topic →</a></h3>\n'
            '<div class="rv-hook">%(hook)s</div>\n%(cards)s\n</section>'
            % {"id": t["id"], "num": html.escape(t["num"]), "title": html.escape(t["title"], quote=True),
               "track": html.escape(t["track"], quote=True), "path": t["path"],
               "label": html.escape(label), "hook": t["hook"], "cards": cards})

    return TEMPLATE.replace("{{TOTAL}}", str(total)) \
                   .replace("{{TOPICS}}", str(len(data))) \
                   .replace("{{HOOKS}}", str(hooks)) \
                   .replace("{{HOOK_ROWS}}", "\n".join(rows)) \
                   .replace("{{SECTIONS}}", "\n\n".join(sections))


def build():
    data = []
    for t in topics():
        cards, hook = extract(t)
        data.append({**t, "cards": cards, "hook": hook})
    return render(data), data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="exit 1 if review.html is stale")
    args = ap.parse_args()
    page, data = build()
    if args.check:
        current = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
        if current != page:
            print("review.html is out of date - run: python tools/make-review.py")
            return 1
        print("review.html is up to date (%d cards, %d topics)"
              % (sum(len(t["cards"]) for t in data), len(data)))
        return 0
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(page)
    for t in data:
        flag = "" if t["cards"] and t["hook"] else "   <- missing %s" % (
            "cards" if not t["cards"] else "hook")
        print("  %s %-34s %2d cards%s" % (t["num"], t["title"][:34], len(t["cards"]), flag))
    print("wrote review.html: %d cards across %d topics"
          % (sum(len(t["cards"]) for t in data), len(data)))
    return 0


TEMPLATE = r"""<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#f4f5f8">
<title>Review cards | GenAI Learning Path</title>
<meta name="description" content="Flashcards for spaced review: every topic's recall questions and memory hook, to run 1, 3, 7 and 21 days after reading.">
<!-- GENERATED by tools/make-review.py from the topic pages. Do not edit by hand:
     change the "Check yourself" questions or the Memory hook on the topic page,
     then re-run the script. -->
<link rel="icon" href="assets/brand/favicon.svg?v=20260925b" type="image/svg+xml">
<link href="assets/brand/favicon-32.png?v=20260925b" rel="icon" sizes="32x32" type="image/png"/>
<link href="assets/brand/favicon-16.png?v=20260925b" rel="icon" sizes="16x16" type="image/png"/>
<link href="assets/brand/favicon.ico?v=20260925b" rel="shortcut icon"/>
<link href="assets/brand/apple-touch-icon.png?v=20260925c" rel="apple-touch-icon" sizes="180x180"/>
<link href="assets/brand/site.webmanifest?v=20260925b" rel="manifest"/>
<meta content="Learn GenAI" name="application-name"/>
<script>(function(){try{var d=document.documentElement;var t=localStorage.getItem("gp.theme")||"dark";d.setAttribute("data-theme",t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==="dark"?"#1b1b1b":"#f4f6fb";var r={};try{r=JSON.parse(localStorage.getItem("gp.reading"))||{};}catch(e2){}var sz=["xs","s","m","l","xl"].indexOf(r.size)>=0?r.size:(matchMedia("(max-width:860px)").matches?"m":"s");var isF=localStorage.getItem("genai-focus-mode")==="1";var wp=isF?r.focusWidth:r.width;var wd=["default","wide","full"].indexOf(wp)>=0?wp:(isF?"default":"wide");if(!isF&&wd==="full")wd="wide";var al=r.align==="left"?"left":"justify";d.setAttribute("data-reading-size",sz);d.setAttribute("data-reading-width",wd);d.setAttribute("data-reading-align",al);}catch(e){}})();</script>
<link rel="stylesheet" href="assets/styles.css?v=20261124a">
<link href="assets/office-theme.css?v=20260925c" rel="stylesheet"/>
<link href="assets/genai-motion.css?v=20260804c" rel="stylesheet"/>
<script defer src="assets/curriculum.js?v=20261124a"></script>
<script defer src="assets/page-nav.js?v=20261124a"></script>
<link href="assets/ir-theme.css?v=20261124a" rel="stylesheet"/>
<style>
/* Review page only. Tokens come from the site theme, so light and dark both work. */
.rv-app { margin: 18px 0 28px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-elevated); }
.rv-app[hidden] { display: none; }
.rv-controls { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: center; }
.rv-controls label { display: inline-flex; gap: 6px; align-items: center; color: var(--text-secondary); font-size: .92em; }
.rv-controls select { max-width: 100%; padding: 7px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font: inherit; }
.rv-stage { margin-top: 16px; }
.rv-progress { display: flex; justify-content: space-between; gap: 10px; color: var(--text-muted); font-size: .85em; margin-bottom: 8px; }
.rv-bar { height: 4px; border-radius: 4px; background: var(--border); overflow: hidden; margin-bottom: 12px; }
.rv-bar span { display: block; height: 100%; width: 0; background: var(--accent); transition: width .2s; }
.rv-card { padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg); min-height: 150px; }
.rv-tag { display: inline-block; font-size: .78em; color: var(--text-muted); margin-bottom: 8px; }
.rv-q { font-size: 1.08em; font-weight: 650; color: var(--text); line-height: 1.45; }
.rv-a { margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--border); color: var(--text); line-height: 1.55; }
.rv-a[hidden] { display: none; }
.rv-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.rv-actions .btn { min-width: 130px; justify-content: center; }
.rv-keys { color: var(--text-muted); font-size: .8em; margin-top: 10px; }
.rv-done { text-align: center; padding: 10px 0; }
.rv-hook { margin: 4px 0 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--accent-soft); color: var(--text); }
.rv-hook p { margin: 0; }
.rv-hook:empty { display: none; }
.rv-topic { margin-top: 22px; }
.rv-topic h3 { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; }
.rv-open { font-size: .78em; font-weight: 500; }
.rv-hooks td:first-child { white-space: nowrap; }
@media (max-width: 600px) { .rv-hooks td:first-child { white-space: normal; } .rv-actions .btn { flex: 1 1 40%; min-width: 0; } }
</style>
</head>
<body data-curriculum-id="review" data-page="review" data-no-concept-lab>
<div class="app">
  <aside class="sidebar">
    <div class="brand">
<a class="brand-link" href="index.html" aria-label="Learn GenAI home">
<span class="brand-mark" aria-hidden="true"><img src="assets/brand/switch-job-logo.png?v=20260925b" alt=""/></span>
<div class="brand-text"><strong>Learn GenAI</strong><span>Learning Platform</span></div>
</a>
</div>
    <div class="search-wrap">
      <div class="search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" data-search placeholder="Search everything…  ( / )">
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
      <div class="crumbs"><b>Review cards</b> <span>/ Remember it</span></div>
      <button class="icon-btn" data-theme-toggle aria-label="Toggle theme"></button>
    </header>

    <div class="content-wrap">
      <main class="content">
        <h1>Review cards</h1>
        <p class="lead">{{TOTAL}} cards from the "Check yourself" questions and memory hooks of {{TOPICS}} topics. Say each answer out loud before you reveal it - pulling it out of memory is what makes it stay there.</p>

        <div class="callout tip">
          <div class="c-ico">🔁</div>
          <div class="c-body"><div class="c-title">When to review</div>
            <p>Run a topic's cards <b>1, 3, 7 and 21 days</b> after you first read it. Each gap is longer because each review makes the memory last longer. Ten minutes a day on the topics that are due beats an evening of re-reading. Mark a card <b>Again</b> if you hesitated - it comes back a few cards later in the same session.</p>
            <p>This page saves nothing. Keep your own dates - a line in a notebook or calendar per topic is enough.</p>
          </div>
        </div>

        <div class="rv-app" data-review-app hidden>
          <div class="rv-controls">
            <label>Topic <select data-rv-topic></select></label>
            <label><input type="checkbox" data-rv-shuffle checked> Shuffle</label>
            <label><input type="checkbox" data-rv-hooks checked> Start with the memory hook</label>
            <button class="btn primary" type="button" data-rv-start>Start</button>
          </div>
          <div class="rv-stage" data-rv-stage aria-live="polite"></div>
        </div>

        <h2 id="hooks">All memory hooks</h2>
        <p>One line per topic. If you can say a topic's hook and explain it, you still have the topic.</p>
        <div class="table-wrap"><table class="rv-hooks">
          <thead><tr><th>Topic</th><th>Memory hook</th></tr></thead>
          <tbody>
{{HOOK_ROWS}}
          </tbody>
        </table></div>

        <h2 id="cards">All cards, by topic</h2>
        <p>The same cards as the deck above, to browse. Open a question only after you have answered it.</p>

{{SECTIONS}}

        <div class="page-nav" data-page-nav>
          <a class="prev" href="index.html"><div class="dir">← Hub</div><div class="ttl">Learning Hub Overview</div></a>
          <a class="next" href="study-plan.html"><div class="dir">Study plan →</div><div class="ttl">Global Study Plan</div></a>
        </div>
      </main>
      <div class="toc-rail"><nav class="toc"></nav></div>
    </div>
  </div>
</div>
<script src="assets/app.js?v=20261123b"></script>
<script src="assets/sitenav.js?v=20261124a"></script>
<script src="assets/enhance.js?v=20260925c"></script>
<script src="assets/genai-motion.js?v=20260728a"></script>
<script>
/* Flashcard deck built from the static cards below. No storage, no fetch. */
(function () {
  "use strict";
  var app = document.querySelector("[data-review-app]");
  if (!app) return;
  var topicSel = app.querySelector("[data-rv-topic]");
  var shuffleBox = app.querySelector("[data-rv-shuffle]");
  var hooksBox = app.querySelector("[data-rv-hooks]");
  var stage = app.querySelector("[data-rv-stage]");

  var topics = Array.prototype.map.call(document.querySelectorAll(".rv-topic"), function (sec) {
    var hookEl = sec.querySelector(".rv-hook");
    return {
      id: sec.getAttribute("data-topic"),
      num: sec.getAttribute("data-num"),
      title: sec.getAttribute("data-title"),
      track: sec.getAttribute("data-track"),
      hook: hookEl ? hookEl.innerHTML.trim() : "",
      cards: Array.prototype.map.call(sec.querySelectorAll("details.recall"), function (d) {
        var s = d.querySelector("summary").cloneNode(true);
        Array.prototype.forEach.call(s.querySelectorAll(".q-ico, .chev"), function (x) { x.parentNode.removeChild(x); });
        return { q: s.innerHTML.trim(), a: d.querySelector(".a").innerHTML, level: d.getAttribute("data-level") || "" };
      })
    };
  });
  if (!topics.length) return;

  // topic picker, grouped by track
  var all = document.createElement("option");
  all.value = "all"; all.textContent = "All topics";
  topicSel.appendChild(all);
  var group = null, lastTrack = null;
  topics.forEach(function (t) {
    if (t.track !== lastTrack) {
      group = document.createElement("optgroup"); group.label = t.track;
      topicSel.appendChild(group); lastTrack = t.track;
    }
    var o = document.createElement("option");
    o.value = t.id; o.textContent = t.num + " · " + t.title + " (" + t.cards.length + ")";
    group.appendChild(o);
  });

  var queue = [], pos = 0, again = 0, seen = 0, revealed = false, done = false;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }

  function deckFor(id) {
    var chosen = id === "all" ? topics : topics.filter(function (t) { return t.id === id; });
    var cards = [], hooks = [];
    chosen.forEach(function (t) {
      var label = t.num + " · " + t.title;
      if (hooksBox.checked && t.hook) {
        hooks.push({ q: "Say the memory hook for <b>" + label + "</b>, then explain it in one sentence.",
                     a: t.hook, tag: label + " · Memory hook" });
      }
      t.cards.forEach(function (c) {
        cards.push({ q: c.q, a: c.a, tag: label + (c.level ? " · " + c.level : "") });
      });
    });
    if (shuffleBox.checked) { shuffle(cards); shuffle(hooks); }
    return hooks.concat(cards);
  }

  function start() {
    queue = deckFor(topicSel.value);
    pos = 0; again = 0; seen = 0; done = false;
    show();
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function show() {
    revealed = false;
    stage.innerHTML = "";
    if (pos >= queue.length) return finish();
    var c = queue[pos];
    var prog = el("div", "rv-progress");
    prog.appendChild(el("span", "", "Card " + (pos + 1) + " of " + queue.length));
    prog.appendChild(el("span", "", again ? again + " marked Again" : ""));
    var bar = el("div", "rv-bar", "<span></span>");
    bar.firstChild.style.width = Math.round(pos / queue.length * 100) + "%";
    var card = el("div", "rv-card");
    card.appendChild(el("div", "rv-tag", c.tag));
    card.appendChild(el("div", "rv-q", c.q));
    var ans = el("div", "rv-a", c.a); ans.hidden = true;
    card.appendChild(ans);
    var acts = el("div", "rv-actions");
    var showBtn = el("button", "btn primary", "Show answer"); showBtn.type = "button";
    showBtn.addEventListener("click", reveal);
    acts.appendChild(showBtn);
    stage.appendChild(prog); stage.appendChild(bar); stage.appendChild(card); stage.appendChild(acts);
    stage.appendChild(el("div", "rv-keys", "Keys: Space shows the answer · 1 = Again · 2 = Got it"));
    showBtn.focus({ preventScroll: true });
  }

  function reveal() {
    if (revealed || done) return;
    revealed = true;
    stage.querySelector(".rv-a").hidden = false;
    var acts = stage.querySelector(".rv-actions");
    acts.innerHTML = "";
    var a = el("button", "btn ghost", "Again"); a.type = "button";
    var g = el("button", "btn primary", "Got it"); g.type = "button";
    a.addEventListener("click", function () { grade(false); });
    g.addEventListener("click", function () { grade(true); });
    acts.appendChild(a); acts.appendChild(g);
    g.focus({ preventScroll: true });
  }

  function grade(ok) {
    if (!revealed || done) return;
    seen++;
    if (!ok) {
      again++;
      // bring it back a few cards later in this session
      var c = queue[pos];
      queue.splice(Math.min(pos + 4, queue.length), 0, c);
    }
    pos++;
    show();
  }

  function finish() {
    done = true;
    stage.innerHTML = "";
    var box = el("div", "rv-card rv-done");
    box.appendChild(el("p", "rv-q", "Done - " + seen + " answers, " + again + " needed a second go."));
    box.appendChild(el("p", "", again ? "Come back to this topic tomorrow; the cards you marked Again are the ones to look at first."
                                      : "Clean run. Next review of this topic: at the next gap in 1, 3, 7, 21 days."));
    var acts = el("div", "rv-actions");
    acts.style.justifyContent = "center";
    var r = el("button", "btn primary", "Run it again"); r.type = "button";
    r.addEventListener("click", start);
    acts.appendChild(r);
    box.appendChild(acts);
    stage.appendChild(box);
  }

  document.addEventListener("keydown", function (e) {
    if (!queue.length || done) return;
    var t = e.target;
    if (t && (t.tagName === "SELECT" || t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (e.key === " " || e.key === "Enter") {
      if (!revealed) { e.preventDefault(); reveal(); }
    } else if (e.key === "1") { grade(false); }
    else if (e.key === "2") { grade(true); }
  });

  app.querySelector("[data-rv-start]").addEventListener("click", start);
  app.hidden = false;

  // review.html?topic=<id> (the link at the end of every topic page) opens that deck
  var m = /[?&]topic=([a-z0-9-]+)/.exec(location.search);
  if (m && topics.some(function (t) { return t.id === m[1]; })) {
    topicSel.value = m[1];
    start();
  } else {
    stage.innerHTML = '<p class="rv-keys">Pick a topic - or all of them - and press Start.</p>';
  }
})();
</script>
</body>
</html>
"""

if __name__ == "__main__":
    sys.exit(main())
