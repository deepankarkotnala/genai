#!/usr/bin/env python3
"""Build rewrite body fragments for tools/apply-rewrite.py.

A body holds sections 1-14; section 16 sits below the SECTION16 marker so it
lands after the carried section 15. `apply-rewrite.py` keeps the page's live
shell and splices the archive's questions in between.

Used from wave 5 onwards. Wave 4's pages were whole new files and used
tools/make-agents-section.py instead.

Voice: claude_plan.md 1.2 -- literal, short sentences, no metaphor, keep the
technology's own vocabulary and define each term once at first use.
"""
import io
import os
import sys
from importlib.machinery import SourceFileLoader

ROOT = "d:/Learning/genai-main"
d = SourceFileLoader("d", os.path.join(ROOT, "tools", "make-diagram.py")).load_module()

BD_LABELS = ["What it is.", "Core purpose.", "Execution model.",
             "Architecture under the hood.", "State handling.",
             "Limitations and advanced features."]


def block(a_name, a_items, b_name, b_items, diffs, short, exec_svg, third=None):
    out = ['<section class="breakdown">', '',
           '<h3 class="bd-tech"><span class="bd-tag">A</span> %s</h3>' % a_name, '']
    for label, body in zip(BD_LABELS, a_items):
        if label == "Execution model.":
            out += ['<p class="bd-item"><b class="no-jargon">%s</b></p>' % label,
                    '', exec_svg, '']
        else:
            out.append('<p class="bd-item"><b class="no-jargon">%s</b> %s</p>' % (label, body))
    out += ['', '<h3 class="bd-tech"><span class="bd-tag">B</span> %s</h3>' % b_name, '']
    for label, body in zip(BD_LABELS, b_items):
        out.append('<p class="bd-item"><b class="no-jargon">%s</b> %s</p>' % (label, body))
    out += ['', '<h3 class="bd-diff">The core differences</h3>',
            '<div class="table-wrap">', '<table>']
    head = '<thead><tr><th></th><th>%s</th><th>%s</th>' % (a_name, b_name)
    if third:
        head += '<th>%s</th>' % third
    out.append(head + '</tr></thead>')
    out.append('<tbody>')
    for row in diffs:
        cells = "".join("<td>%s</td>" % c for c in row[1:])
        out.append('<tr><th>%s</th>%s</tr>' % (row[0], cells))
    out += ['</tbody>', '</table>', '</div>', '',
            '<h3 class="bd-short">In short - which one to choose</h3>', '<ul>']
    for line in short:
        out.append('<li>%s</li>' % line)
    out += ['</ul>', '</section>']
    return "\n".join(out)


SECTIONS = [("known", "What you already know"), ("breaks", "What breaks now"),
            ("breakdown", None), ("without", "Without the technology"),
            ("mechanics", "Runtime mechanics"), ("smallest", "Smallest working version"),
            ("components", "The components, one at a time"),
            ("state", "State and data flow"), ("assembly", "Full code, in assembly order"),
            ("trace", "Trace"), ("break", "Break it"), ("fix", "Fix it"),
            ("production", "Production version"), ("comparison", "Comparison")]


def _check_closed(spec):
    """Refuse a section body that ends mid-paragraph.

    A body ending in prose rather than a tag is a <p> that was never closed.
    The page still renders, because browsers close it, but the source no longer
    matches the output -- which silently broke anchor matching in wave 5.
    """
    bad = []
    for sid, body in spec["sections"].items():
        end = body.rstrip()[-6:]
        if not end.endswith((">", "-->")):
            bad.append("%s: section %r ends mid-paragraph: ...%s"
                       % (spec["slug"], sid, end))
    if bad:
        raise ValueError(chr(10).join(bad))


def build(spec):
    _check_closed(spec)
    parts = []
    for i, (sid, title) in enumerate(SECTIONS, 1):
        parts.append("\n<!-- ================= %d ================= -->" % i)
        if sid == "breakdown":
            parts.append('<h2 id="breakdown">3 · Simple breakdown - %s</h2>' % spec["bd_title"])
            parts.append(spec["block"])
            continue
        parts.append('<h2 id="%s">%d · %s</h2>' % (sid, i, title))
        parts.append(spec["sections"][sid])
    parts.append("\n<!-- SECTION16 -->")
    parts.append('<!-- ================= 16 ================= -->')
    parts.append('<h2 id="short">16 · In short, and what comes next</h2>')
    parts.append(spec["sections"]["short"])
    return "\n".join(parts) + "\n"


def write(spec, out_dir=None):
    """Write the body fragment.

    `out_dir` defaults to $REWRITE_BODY_DIR, then the current directory -- never
    next to this module, which would drop generated fragments into tools/.
    """
    out_dir = out_dir or os.environ.get("REWRITE_BODY_DIR") or os.getcwd()
    out = os.path.join(out_dir, "%s.body.html" % spec["slug"])
    io.open(out, "w", encoding="utf-8", newline="\n").write(build(spec))
    print("wrote", out)
