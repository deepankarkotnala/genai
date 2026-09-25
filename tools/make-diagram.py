#!/usr/bin/env python3
"""Emit `.bd-svg` diagrams in the markup the rewritten pages already use.

Why this exists
---------------
The rewrite calls for a minimum of three animated diagrams per page (plan §4),
across seven fixed types. Hand-writing that many SVGs by hand drifts: the boxes
land on different baselines, the `.b2/.b3` stagger classes get skipped so the
animation stops telling the story in order, and `<title>`/`<desc>` go missing --
which is the part a screen reader depends on.

Every function here emits the same idiom as `modules/12_langgraph.html`: design
tokens only (so dark mode needs no extra rules), the shared 6-second clock, and
`role="img"` with `aria-labelledby` pointing at a real title and description.

Geometry is computed, never typed. Box centres are derived from the box, so a
label cannot drift off its box when a stage is added or a width changes.

Usage as a library:

    from importlib.machinery import SourceFileLoader
    d = SourceFileLoader("d", "tools/make-diagram.py").load_module()
    svg = d.flow("tk", "Title", "Description.", ["input", "model", "answer"])
"""
from __future__ import annotations

# The stagger classes the CSS defines. A stage beyond the fifth reuses the last
# one rather than silently animating with no delay.
_LIT = ["b1", "b2", "b3", "b4", "b5"]

# One shared geometry so every diagram on a page sits on the same baseline.
_W = 900          # viewBox width, matching the existing pages
_BOX_H = 56
_GAP = 22         # horizontal space between boxes, where the arrow lives


def _esc(text: str) -> str:
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def _lit(index: int) -> str:
    return _LIT[min(index, len(_LIT) - 1)]


def _marker(tag: str, colour: str = "var(--text-muted)") -> str:
    return ('<marker id="ah-%s" markerWidth="9" markerHeight="9" refX="8" refY="3.2" '
            'orient="auto"><path d="M0 0 L8 3.2 L0 6.4 z" fill="%s"></path></marker>'
            % (tag, colour))


def _labels(cx: float, cy: float, lines: list[str], cls: str = "lbl") -> list[str]:
    """Centre one or two lines of text on a box.

    One line sits on the centre; two straddle it. Hand-written diagrams got this
    wrong often enough to be worth computing.

    A third line is refused rather than dropped. Silently truncating turned
    "two refunds | if not idempotent" into a box reading "two effects", which is
    a wrong diagram that still validates -- the worst kind.
    """
    if len(lines) > 2:
        raise ValueError("a box holds at most two lines, got %d: %r" % (len(lines), lines))
    out = []
    if len(lines) == 1:
        out.append('<text class="%s" x="%g" y="%g">%s</text>'
                   % (cls, cx, cy + 5, _esc(lines[0])))
    else:
        for i, line in enumerate(lines):
            out.append('<text class="%s" x="%g" y="%g">%s</text>'
                       % (cls, cx, cy - 4 + i * 18, _esc(line)))
    return out


def _row(stages: list[str], top: float, tag: str, *, fail_at: int | None = None,
         pad: float = 12.0) -> tuple[list[str], list[float]]:
    """Lay `stages` out left to right across the full width.

    Returns the markup and each box's centre x, so a caller can hang a loop arc
    or an x-mark off a specific stage without re-deriving the arithmetic.
    """
    n = len(stages)
    box_w = (_W - 2 * pad - _GAP * (n - 1)) / n
    parts, centres = [], []
    for i, text in enumerate(stages):
        x = pad + i * (box_w + _GAP)
        cx = x + box_w / 2
        centres.append(cx)
        if fail_at is not None and i == fail_at:
            cls = "box fail"
        elif fail_at is not None and i > fail_at:
            cls = "box after %s" % _lit(i)
        else:
            cls = "box %s" % _lit(i)
        parts.append('<rect class="%s" x="%g" y="%g" width="%g" height="%g" rx="12"></rect>'
                     % (cls, x, top, box_w, _BOX_H))
        if i:
            parts.append('<path class="arw" d="M%g %g H%g" marker-end="url(#ah-%s)"></path>'
                         % (x - _GAP + 3, top + _BOX_H / 2, x - 4, tag))
    for i, text in enumerate(stages):
        parts.extend(_labels(centres[i], top + _BOX_H / 2, text.split("|")))
    return parts, centres


def _open(tag: str, title: str, desc: str, height: float) -> list[str]:
    return ['<svg class="bd-svg" viewBox="0 0 %d %g" role="img" aria-labelledby="%s-t %s-d">'
            % (_W, height, tag, tag),
            '<title id="%s-t">%s</title>' % (tag, _esc(title)),
            '<desc id="%s-d">%s</desc>' % (tag, _esc(desc))]


def flow(tag: str, title: str, desc: str, stages: list[str],
         caption: str = "") -> str:
    """Linear stages, lit in sequence, with a packet travelling between them.

    Use `"first|second"` in a stage to get two centred lines.
    """
    height = 116 + (22 if caption else 0)
    top = 40
    parts = _open(tag, title, desc, height)
    parts.append("<defs>%s</defs>" % _marker(tag))
    row, centres = _row(stages, top, tag)
    parts += row
    parts.append('<circle class="pkt" cx="%g" cy="%g" r="7"></circle>' % (centres[0], top - 22))
    if caption:
        parts.append('<text class="cap" x="%d" y="%g">%s</text>'
                     % (_W // 2, height - 8, _esc(caption)))
    parts.append("</svg>")
    return "\n".join(parts)


def cycle(tag: str, title: str, desc: str, stages: list[str], loop_label: str,
          back_from: int = -2, back_to: int = 1, caption: str = "") -> str:
    """A flow with a dashed animated return arc, for anything that repeats."""
    height = 146 + (22 if caption else 0)
    top = 62
    parts = _open(tag, title, desc, height)
    parts.append("<defs>%s%s</defs>"
                 % (_marker(tag), _marker(tag + "p", "var(--accent)")))
    row, centres = _row(stages, top, tag)
    a = centres[back_from % len(centres)]
    b = centres[back_to % len(centres)]
    # Arc up over the row and back, clearing the labels.
    parts.append('<path class="loop" d="M%g %g C%g 16, %g 16, %g %g" '
                 'marker-end="url(#ah-%sp)"></path>' % (a, top, a, b, b, top - 8, tag))
    parts.append('<text class="loop-lbl" x="%g" y="14">%s</text>'
                 % ((a + b) / 2, _esc(loop_label)))
    parts += row
    if caption:
        parts.append('<text class="cap" x="%d" y="%g">%s</text>'
                     % (_W // 2, height - 8, _esc(caption)))
    parts.append("</svg>")
    return "\n".join(parts)


def _fit(*groups: list[str]) -> float:
    """Width needed for the longest line in `groups`, at the .lbl font size.

    `.lbl` is 11.5px; 6.1px per character is a safe average advance for this
    mixed-case text. Fixed exit-column widths let "model too dear -- route easy
    work to small" render flush against both box edges, so the column is sized
    from its content instead.
    """
    longest = max((len(line) for g in groups for line in g), default=0)
    return longest * 6.1 + 26


def branch(tag: str, title: str, desc: str, source: str, test: str,
           exits: list[str], caption: str = "") -> str:
    """One input, a routing test, several exits. Only the taken path lights."""
    n = len(exits)
    height = 58 + n * 74 + (22 if caption else 0)
    mid = 58 + (n * 74) / 2 - 37
    # Right column first: it holds the longest text, so it decides the budget
    # left over for the source and the test.
    exit_w = min(_fit(*[e.split("|") for e in exits]), 430.0)
    exit_x = _W - 12 - exit_w
    # Grow the left two boxes to fill the space the exits leave, rather than
    # sitting at their minimum with a long empty arrow between them.
    avail = exit_x - 12 - 52          # 52 = gap for the fan-out arrows
    src_w = max(_fit(source.split("|")), 168.0)
    test_w = max(_fit(test.split("|")), 186.0)
    slack = avail - 44 - src_w - test_w   # 44 = gap for the first arrow
    if slack < 0:
        scale = (avail - 44) / (src_w + test_w)
        src_w, test_w = src_w * scale, test_w * scale
    else:
        src_w += slack * 0.5
        test_w += slack * 0.5
    test_x = 12 + src_w + 44
    parts = _open(tag, title, desc, height)
    parts.append("<defs>%s</defs>" % _marker(tag))
    parts.append('<rect class="box b1" x="12" y="%g" width="%g" height="%g" rx="12"></rect>'
                 % (mid, src_w, _BOX_H))
    parts += _labels(12 + src_w / 2, mid + _BOX_H / 2, source.split("|"))
    parts.append('<rect class="box b2" x="%g" y="%g" width="%g" height="%g" rx="12"></rect>'
                 % (test_x, mid, test_w, _BOX_H))
    parts += _labels(test_x + test_w / 2, mid + _BOX_H / 2, test.split("|"))
    parts.append('<path class="arw" d="M%g %g H%g" marker-end="url(#ah-%s)"></path>'
                 % (12 + src_w + 5, mid + _BOX_H / 2, test_x - 4, tag))
    for i, text in enumerate(exits):
        y = 58 + i * 74
        parts.append('<rect class="box %s" x="%g" y="%g" width="%g" height="%g" rx="12"></rect>'
                     % (_lit(i + 2), exit_x, y, exit_w, _BOX_H))
        parts += _labels(exit_x + exit_w / 2, y + _BOX_H / 2, text.split("|"))
        bend = test_x + test_w + (exit_x - test_x - test_w) / 2
        parts.append('<path class="arw" d="M%g %g C%g %g, %g %g, %g %g" '
                     'marker-end="url(#ah-%s)"></path>'
                     % (test_x + test_w + 3, mid + _BOX_H / 2, bend, mid + _BOX_H / 2,
                        bend, y + _BOX_H / 2, exit_x - 4, y + _BOX_H / 2, tag))
    if caption:
        parts.append('<text class="cap" x="%d" y="%g">%s</text>'
                     % (_W // 2, height - 6, _esc(caption)))
    parts.append("</svg>")
    return "\n".join(parts)


def parallel(tag: str, title: str, desc: str, source: str, branches: list[str],
             merge: str, caption: str = "") -> str:
    """Fan out to N branches that light together, then a merge that lights last."""
    n = len(branches)
    height = 58 + n * 74 + (26 if caption else 0)
    mid = 58 + (n * 74) / 2 - 37
    parts = _open(tag, title, desc, height)
    parts.append("<defs>%s</defs>" % _marker(tag))
    parts.append('<rect class="box b1" x="12" y="%g" width="176" height="%g" rx="12"></rect>'
                 % (mid, _BOX_H))
    parts += _labels(100, mid + _BOX_H / 2, source.split("|"))
    for i, text in enumerate(branches):
        y = 58 + i * 74
        # All branches share one delay class: they are concurrent, so they must
        # light at the same time.
        parts.append('<rect class="box par" x="298" y="%g" width="286" height="%g" rx="12"></rect>'
                     % (y, _BOX_H))
        parts += _labels(441, y + _BOX_H / 2, text.split("|"))
        parts.append('<path class="arw" d="M191 %g C250 %g, 250 %g, 294 %g" '
                     'marker-end="url(#ah-%s)"></path>'
                     % (mid + _BOX_H / 2, mid + _BOX_H / 2, y + _BOX_H / 2,
                        y + _BOX_H / 2, tag))
        parts.append('<path class="arw" d="M587 %g C650 %g, 650 %g, 700 %g" '
                     'marker-end="url(#ah-%s)"></path>'
                     % (y + _BOX_H / 2, y + _BOX_H / 2, mid + _BOX_H / 2,
                        mid + _BOX_H / 2, tag))
    parts.append('<rect class="box b5" x="704" y="%g" width="184" height="%g" rx="12"></rect>'
                 % (mid, _BOX_H))
    parts += _labels(796, mid + _BOX_H / 2, merge.split("|"))
    if caption:
        parts.append('<text class="cap" x="%d" y="%g">%s</text>'
                     % (_W // 2, height - 8, _esc(caption)))
    parts.append("</svg>")
    return "\n".join(parts)


def state_trace(tag: str, title: str, desc: str, fields: list[str],
                steps: list[tuple[str, list[str]]], caption: str = "") -> str:
    """A state object's fields after each step. Rows fill in as steps run.

    `steps` is [(step name, [value per field])]; "" leaves a cell blank, which
    is how you show a field that step did not touch.

    Field names and cell values are single-line: a row is one line tall. A "|"
    is therefore a mistake rather than a line break here, and rendering it
    literally put a box reading "what we know|about the customer" on the page --
    so it is refused.
    """
    for label in list(fields) + [v for _, vs in steps for v in vs]:
        if "|" in label:
            raise ValueError("state_trace rows are single-line; '|' is not a break: %r" % label)
    rows = len(fields)
    col_w = (_W - 210) / len(steps)
    height = 44 + rows * 34 + 20 + (26 if caption else 0)
    parts = _open(tag, title, desc, height)
    for j, (name, _) in enumerate(steps):
        parts.append('<text class="cap" x="%g" y="24">%s</text>'
                     % (200 + col_w * j + col_w / 2, _esc(name)))
    for i, field in enumerate(fields):
        y = 44 + i * 34
        parts.append('<text class="mono" x="12" y="%g" style="text-anchor:start">%s</text>'
                     % (y + 20, _esc(field)))
        for j, (_, values) in enumerate(steps):
            value = values[i] if i < len(values) else ""
            if not value:
                continue
            x = 200 + col_w * j + 6
            cls = "snap s%d" % min(j + 1, 3)
            parts.append('<rect class="%s" x="%g" y="%g" width="%g" height="26" rx="7"></rect>'
                         % (cls, x, y + 2, col_w - 12))
            parts.append('<text class="mono snap-txt" x="%g" y="%g">%s</text>'
                         % (x + (col_w - 12) / 2, y + 20, _esc(value)))
    if caption:
        parts.append('<text class="cap" x="%d" y="%g">%s</text>'
                     % (_W // 2, height - 8, _esc(caption)))
    parts.append("</svg>")
    return "\n".join(parts)


def layers(tag: str, title: str, desc: str, tiers: list[str],
           caption: str = "", both_ways: bool = True) -> str:
    """Stacked tiers, top to bottom.

    `both_ways` draws the descending request and the ascending response, which
    is right for application -> client -> server -> external system. Set it
    False for a one-way stack -- a trust hierarchy or a serialisation step --
    where a return arrow would claim a round trip that does not happen.
    """
    n = len(tiers)
    height = 20 + n * 66 + (22 if caption else 0)
    parts = _open(tag, title, desc, height)
    parts.append("<defs>%s</defs>" % _marker(tag))
    for i, text in enumerate(tiers):
        y = 16 + i * 66
        parts.append('<rect class="layer %s" x="150" y="%g" width="600" height="50" rx="11"></rect>'
                     % (_lit(i), y))
        parts += _labels(450, y + 25, text.split("|"))
        if i:
            down_x, up_x = (420, 480) if both_ways else (450, None)
            parts.append('<path class="arw" d="M%d %g V%g" marker-end="url(#ah-%s)"></path>'
                         % (down_x, y - 16, y - 3, tag))
            if up_x is not None:
                parts.append('<path class="arw" d="M%d %g V%g" marker-end="url(#ah-%s)"></path>'
                             % (up_x, y - 3, y - 16, tag))
    if caption:
        parts.append('<text class="cap" x="%d" y="%g">%s</text>'
                     % (_W // 2, height - 6, _esc(caption)))
    parts.append("</svg>")
    return "\n".join(parts)


def failure(tag: str, title: str, desc: str, stages: list[str], fail_at: int,
            caption: str = "") -> str:
    """The same flow with one stage failing red; later stages dim."""
    height = 152 + (22 if caption else 0)
    top = 52
    parts = _open(tag, title, desc, height)
    parts.append("<defs>%s</defs>" % _marker(tag))
    row, centres = _row(stages, top, tag, fail_at=fail_at)
    parts += row
    cx = centres[fail_at]
    parts.append('<path class="xmark" d="M%g %g L%g %g M%g %g L%g %g"></path>'
                 % (cx - 18, top + _BOX_H + 14, cx + 18, top + _BOX_H + 42,
                    cx + 18, top + _BOX_H + 14, cx - 18, top + _BOX_H + 42))
    if caption:
        parts.append('<text class="cap rescue" x="%d" y="%g">%s</text>'
                     % (_W // 2, height - 8, _esc(caption)))
    parts.append("</svg>")
    return "\n".join(parts)
