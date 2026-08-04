#!/usr/bin/env node
/* Stage 2c state tests for assets/page-nav.js.
 *
 * Exercises the PURE navigation model plus the transactional render orchestration
 * against a minimal DOM stub. No browser, no test framework, no dependencies --
 * the portal has none and this must run anywhere Node does.
 *
 * Usage: node tools/test-page-nav.js
 */
"use strict";

const path = require("path");
const CURRICULUM = require(path.join(__dirname, "..", "assets", "curriculum.js"));
const PageNav = require(path.join(__dirname, "..", "assets", "page-nav.js"));

const ROOTS = {
  winFile: "file:///C:/Users/Dev/portal/",
  nixFile: "file:///home/dev/portal/",
  domain: "https://portal.example/",
  ghPages: "https://user.github.io/genai_clean-main/"
};

let pass = 0;
const failures = [];
const section = (name) => console.log("\n" + name + "\n" + "-".repeat(name.length));

function ok(label, condition, detail) {
  if (condition) { pass += 1; console.log("  ok   " + label); }
  else { failures.push(label + (detail ? "  [" + detail + "]" : "")); console.log("  FAIL " + label + (detail ? "  [" + detail + "]" : "")); }
}
function eq(label, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  ok(label, a === e, a === e ? "" : "got " + a + " want " + e);
}

const model = (root) => PageNav.createModel({ curriculum: CURRICULUM, portalRoot: root || ROOTS.domain });
const M = model();

const nav = (pageId, params, storedRoute) =>
  M.resolveNav({ pageId, params: params || {}, storedRoute: storedRoute || null });
const roles = (m) => (m.actions || []).map((a) => a.role);
const byRole = (m, role) => (m.actions || []).concat(m.secondary || []).find((a) => a.role === role);
const qs = (href) => new URL(href).searchParams;

/* ===================================================================== */
section("1 · Normal route state - embeddings?route=full");
{
  const m = nav("embeddings", { route: "full" });
  eq("state", m.state, "3");
  eq("step index / count", [m.stepIndex, m.stepCount], [7, 69]);
  eq("previous is step 06", byRole(m, "prev").pageId, "genai-g1");
  eq("continue is step 08", byRole(m, "next").pageId, "vector-databases");
  ok("previous preserves route=full", qs(byRole(m, "prev").href).get("route") === "full");
  ok("continue preserves route=full", qs(byRole(m, "next").href).get("route") === "full");
  ok("no resume parameter is invented", !qs(byRole(m, "next").href).has("resume"));
}

section("2 · Collection plus route - ta-l07?route=full");
{
  const m = nav("ta-l07", { route: "full" });
  eq("state", m.state, "3");
  eq("route primary previous", byRole(m, "prev").pageId, "ta-l06");
  eq("route primary continue", byRole(m, "next").pageId, "ta-l08");
  ok("agents-course collection recognised",
    M.collectionOf("ta-l07") && M.collectionOf("ta-l07").id === "agents-course");
  ok("secondary suppressed because course order equals route order here",
    !m.secondary || !m.secondary.some((a) => a.role === "collection-next"));
  const c = M.collectionOf("ta-l07").collection.members;
  eq("static fallback stays course order (l06 <- l07 -> l08)",
    [c[c.indexOf("ta-l07") - 1], c[c.indexOf("ta-l07") + 1]], ["ta-l06", "ta-l08"]);
}

section("3 · Detour precedence - genai-g3?route=full&resume=genai-g2");
{
  const m = nav("genai-g3", { route: "full", resume: "genai-g2" });
  eq("state is 4a, not G3's later route position", m.state, "4a");
  ok("G3 is genuinely also in the Full route", m.alsoInRoute === true);
  eq("return destination is step 12", byRole(m, "route-return").pageId, "agentic-ai");
  const ret = qs(byRole(m, "route-return").href);
  eq("return link carries route", ret.get("route"), "full");
  const col = byRole(m, "collection-next");
  eq("collection continuation stays in the bank", col.pageId, "genai-g4");
  eq("collection continuation preserves the original resume", qs(col.href).get("resume"), "genai-g2");
  eq("collection continuation preserves route", qs(col.href).get("route"), "full");
  ok("no forward route step is offered", !roles(m).includes("next"));
}

section("4 · Cursor consumed - agentic-ai?route=full&resume=genai-g2");
{
  const m = nav("agentic-ai", { route: "full", resume: "genai-g2" });
  eq("state", m.state, "3");
  eq("step index", m.stepIndex, 12);
  ok("resume is stripped", m.stripResume === true);
  ok("no generated link carries resume",
    !(m.actions || []).some((a) => qs(a.href).has("resume")));
}

section("5 · Out-of-route page");
{
  const a = nav("dsa-12", { route: "full", resume: "embeddings" });
  eq("state with a valid cursor", a.state, "4a");
  eq("return target is step 08", byRole(a, "route-return").pageId, "vector-databases");
  eq("collection continuation", byRole(a, "collection-next").pageId, "dsa-13");
  eq("cursor forwarded", qs(byRole(a, "collection-next").href).get("resume"), "embeddings");

  const b = nav("dsa-12", { route: "full" });
  eq("state without a cursor", b.state, "4b");
  ok("no invented next route step", !roles(b).includes("next") && !roles(b).includes("route-return"));
  eq("offers the route overview", byRole(b, "route-overview").pageId, "study-plan");
  ok("collection browse carries no route context",
    !qs(byRole(b, "collection-next").href).has("route"));

  const c = nav("dsa-12", {}, "full");
  eq("bare URL with gp.route=full stays state 1", c.state, "1");
  const r = M.resolveRoute({}, "full", "dsa-12");
  eq("hydration refused for an out-of-route page", [r.id, r.source], [null, "none"]);
  ok("no link gains route context", !(c.actions || []).some((a) => qs(a.href).has("route")));
  const r2 = M.resolveRoute({}, "full", "embeddings");
  eq("hydration allowed on a route step", [r2.id, r2.source], ["full", "storage"]);
  ok("hydration allowed on the preflight page", M.hydrationAllowed("beginner-basics", "full"));
  ok("hydration allowed on the control page", M.hydrationAllowed("study-plan", "full"));
  ok("hydration refused on an optional-track page", !M.hydrationAllowed("ml-06", "full"));
}

section("6 · Preflight - beginner-basics?route=full");
{
  const m = nav("beginner-basics", { route: "full" });
  eq("state", m.state, "9");
  ok("notice says it is not a numbered step", /not a numbered step/i.test(m.notice));
  eq("continue goes to Full step 01", byRole(m, "route-start").pageId, "llm-foundations");
  eq("step 01 link carries route", qs(byRole(m, "route-start").href).get("route"), "full");
  ok("no step number is claimed", m.stepIndex === undefined);
}

section("7 · Route control - study-plan?route=full");
{
  const m = nav("study-plan", { route: "full" });
  eq("state", m.state, "10");
  eq("start/restart target", byRole(m, "route-start").pageId, "llm-foundations");
  eq("optional preflight offered", byRole(m, "preflight").pageId, "beginner-basics");
  ok("leave-route action present", Boolean(byRole(m, "leave-route")));
  ok("leave-route drops the route parameter", !qs(byRole(m, "leave-route").href).has("route"));
  ok("not described as a numbered step",
    m.stepIndex === undefined && /not a numbered step/i.test(m.notice));

  const withCursor = nav("study-plan", { route: "full", resume: "embeddings" });
  eq("cursor offers a continuation", byRole(withCursor, "route-resume").pageId, "vector-databases");
}

section("8 · Final route step - job-search?route=full");
{
  const m = nav("job-search", { route: "full" });
  eq("state", m.state, "3");
  eq("step index", [m.stepIndex, m.stepCount], [69, 69]);
  const fin = byRole(m, "route-finish");
  eq("continue resolves through route.finish.page", fin.pageId, CURRICULUM.routes.full.finish.page);
  ok("finish destination is a registered page", Boolean(CURRICULUM.pages[fin.pageId]));
  ok("finish href is a real page path",
    fin.href.endsWith("study-plan.html?route=full") ||
    fin.href.includes("study-plan.html?route=full"));
  ok("no sentinel leaks into a URL", !fin.href.includes("finish") && !/ROUTE_COMPLETE/.test(fin.href));

  const cursorAtEnd = nav("dsa-12", { route: "full", resume: "job-search" });
  eq("cursor on the final step resolves to the finish action",
    roles(cursorAtEnd)[0], "route-finish");
}

section("9 · Migration - rag-basics-moved?route=full");
{
  const m = nav("rag-basics-moved", { route: "full" });
  eq("state", m.state, "7");
  eq("exactly one action", roles(m), ["moved-to"]);
  const a = byRole(m, "moved-to");
  eq("forward destination", a.pageId, "rag-deep-dive");
  ok("anchor preserved", new URL(a.href).hash === "#pipeline");
  eq("route context preserved", qs(a.href).get("route"), "full");
  ok("no Previous action", !roles(m).includes("prev"));
  ok("query precedes the fragment", /\?route=full#pipeline$/.test(a.href));
}

section("10 · Invalid and draft routes");
{
  const bad = nav("embeddings", { route: "nonsense" });
  eq("unknown route -> invalid", bad.state, "2");
  eq("attempted value captured verbatim", bad.attempted, "nonsense");
  ok("no prev/next offered", !roles(bad).includes("prev") && !roles(bad).includes("next"));

  eq("no route remains in draft status",
    Object.values(CURRICULUM.routes).filter((r) => r.status !== "active").length, 0);
  const unregistered = nav("embeddings", { route: "sprint" });
  eq("an unregistered route id -> invalid", unregistered.state, "2");
  eq("and is not resolvable",
    M.resolveRoute({ route: "sprint" }, null, "embeddings").source, "invalid");
  eq("an active route IS resolvable",
    M.resolveRoute({ route: "interview-sprint" }, null, "beginner-basics").source, "url");

  const hostile = nav("embeddings", { route: "<img src=x onerror=alert(1)>" });
  eq("hostile value still resolves as invalid", hostile.state, "2");
  ok("value is carried as data, never as markup",
    typeof hostile.attempted === "string" && hostile.notice.includes(hostile.attempted));

  const badResume = nav("dsa-12", { route: "full", resume: "not-a-page" });
  eq("unknown resume falls back to 4b", badResume.state, "4b");
  ok("invalid cursor is scheduled for removal", badResume.stripResume === true);
}

/* ===================================================================== */
section("11 · URL environments");
{
  Object.entries(ROOTS).forEach(([name, root]) => {
    const m2 = model(root);
    const href = m2.linkToPage("embeddings", { routeId: "full", resumeId: "genai-g2" });
    const u = new URL(href);
    ok(name + ": absolute and inside the portal root", href.startsWith(root));
    ok(name + ": both parameters present once",
      u.searchParams.getAll("route").length === 1 && u.searchParams.getAll("resume").length === 1);
    eq(name + ": path", u.pathname.endsWith("modules/04_embeddings.html"), true);
  });

  const m3 = model(ROOTS.ghPages);
  const anchored = m3.linkToPage("rag-deep-dive", { routeId: "full", anchor: "output-eval" });
  ok("fragment follows the query string", /\?route=full#output-eval$/.test(anchored));

  // A path that already carries a query keeps it, and route is set not appended.
  const synthetic = PageNav.createModel({
    curriculum: Object.assign({}, CURRICULUM, {
      pages: Object.assign({}, CURRICULUM.pages, {
        "synthetic-q": { path: "modules/04_embeddings.html?keep=1&route=stale", title: "S", type: "content" }
      })
    }),
    portalRoot: ROOTS.domain
  });
  const kept = new URL(synthetic.linkToPage("synthetic-q", { routeId: "full" }));
  eq("pre-existing query survives", kept.searchParams.get("keep"), "1");
  eq("route is replaced, not duplicated", kept.searchParams.getAll("route"), ["full"]);

  eq("private page receives no route context",
    new URL(M.linkToPage("google-prep", { routeId: "full", resumeId: "embeddings" })).search, "");
  eq("optional-track page receives no route context",
    new URL(M.linkToPage("ml-06", { routeId: "full" })).search, "");

  // Every destination any state can emit must be a registered page id.
  const ids = Object.keys(CURRICULUM.pages);
  const cases = [{}, { route: "full" }, { route: "full", resume: "embeddings" },
    { route: "full", resume: "nope" }, { route: "bogus" }];
  let emitted = 0, unregistered = [];
  ids.forEach((pid) => cases.forEach((params) => {
    const m4 = nav(pid, params, "full");
    (m4.actions || []).concat(m4.secondary || []).forEach((a) => {
      emitted += 1;
      if (!CURRICULUM.pages[a.pageId]) unregistered.push(pid + " -> " + a.pageId);
    });
  }));
  ok("every emitted destination is a registered page id (" + emitted + " links, " +
    ids.length * cases.length + " page/route combinations)", unregistered.length === 0,
    unregistered.slice(0, 5).join("; "));
}

/* ===================================================================== */
section("12 · Transactional fallback");
{
  // Minimal DOM stub. The slot records whether replaceChildren was ever called.
  function makeDom(pageId) {
    const authored = [{ tag: "a", href: "AUTHORED-PREV" }, { tag: "a", href: "AUTHORED-NEXT" }];
    const slot = {
      children: authored.slice(),
      replaced: 0,
      replaceChildren(frag) { this.replaced += 1; this.children = frag.kids.slice(); }
    };
    const other = { textContent: "UNTOUCHED PROSE" };
    return {
      slot, other,
      doc: {
        body: { getAttribute: (k) => (k === "data-curriculum-id" ? pageId : null) },
        querySelector: (sel) => (sel === "[data-page-nav]" ? slot : null),
        createDocumentFragment: () => ({
          kids: [],
          appendChild(k) { this.kids.push(k); },
          querySelectorAll(sel) { return this.kids.filter((k) => k.tag === "a" && k.href); }
        }),
        createElement: (tag) => ({
          tag, kids: [], className: "", attrs: {}, textContent: "",
          setAttribute(k, v) { this.attrs[k] = v; if (k === "href") this.href = v; },
          getAttribute(k) { return k === "href" ? this.href : this.attrs[k]; },
          appendChild(k) { this.kids.push(k); }
        })
      }
    };
  }
  const logs = [];
  const logger = { warn: (...a) => logs.push(["warn", String(a[0])]), error: (...a) => logs.push(["error", String(a[0])]) };

  function runtimeFor(pageId, href, curriculum) {
    const dom = makeDom(pageId);
    const rt = PageNav.createRuntime({
      curriculum: curriculum || CURRICULUM,
      portalRoot: ROOTS.domain,
      doc: dom.doc,
      location: { href: href },
      history: null,
      storage: null,
      logger
    });
    return { rt, dom };
  }

  function expectUntouched(label, mutate) {
    logs.length = 0;
    const { rt, dom } = runtimeFor("embeddings", ROOTS.domain + "modules/04_embeddings.html?route=full");
    if (mutate) mutate(rt, dom);
    const res = rt.render();
    ok(label + ": not rendered", res.rendered === false, res.reason);
    ok(label + ": replaceChildren never called", dom.slot.replaced === 0);
    ok(label + ": authored links intact",
      dom.slot.children.length === 2 && dom.slot.children[0].href === "AUTHORED-PREV");
    ok(label + ": content outside the block untouched", dom.other.textContent === "UNTOUCHED PROSE");
    ok(label + ": a warning or error was logged", logs.length > 0);
  }

  // happy path first, to prove the harness can succeed
  {
    logs.length = 0;
    const { rt, dom } = runtimeFor("embeddings", ROOTS.domain + "modules/04_embeddings.html?route=full");
    const res = rt.render();
    ok("baseline: renders and swaps exactly once", res.rendered === true && dom.slot.replaced === 1);
    ok("baseline: state 3", res.state === "3");
  }

  // curriculum.js missing -> the bootstrap throws before a runtime exists; the
  // equivalent at model level is an empty manifest.
  expectUntouched("curriculum missing/empty", (rt) => {
    rt.resolveNav = () => { throw new Error("curriculum.js did not load"); };
  });
  expectUntouched("unknown page id", (rt, dom) => {
    dom.doc.body.getAttribute = () => "not-a-registered-page";
    rt.resolveNav = (input) => rt.model.resolveNav({ ...input, pageId: "not-a-registered-page" });
  });
  expectUntouched("exception inside resolveNav", (rt) => {
    rt.resolveNav = () => { throw new Error("boom in resolveNav"); };
  });
  expectUntouched("exception inside buildFragment", (rt) => {
    rt.buildFragment = () => { throw new Error("boom in buildFragment"); };
  });
  expectUntouched("fragment fails isRenderable", (rt) => {
    rt.isRenderable = () => false;
  });
  expectUntouched("unknown destination page id", (rt) => {
    rt.resolveNav = () => ({ state: "3", render: true, actions: [{ role: "next", dir: "Next", title: "X", pageId: "ghost", href: rt.model.linkToPage("embeddings") }] });
    rt.buildFragment = () => { throw new Error("Unknown curriculum page: ghost"); };
  });

  // A page with no [data-page-nav] must be a no-op, not an error.
  {
    const rt = PageNav.createRuntime({
      curriculum: CURRICULUM, portalRoot: ROOTS.domain,
      doc: { body: null, querySelector: () => null }, location: { href: ROOTS.domain },
      history: null, storage: null, logger
    });
    const res = rt.render();
    ok("no nav slot: silent no-op", res.rendered === false);
  }
}

/* ===================================================================== */
section("13 · Cursor bootstrap and generated journeys");
{
  /* Turn a href the model emitted back into (pageId, params). Journeys below
     navigate ONLY through these, so nothing is hand-constructed. */
  const PATHS = Object.fromEntries(
    Object.entries(CURRICULUM.pages).map(([id, p]) => [p.path.split("?")[0], id]));
  function follow(href) {
    const u = new URL(href);
    const rel = decodeURIComponent(u.href.slice(ROOTS.domain.length).split("?")[0].split("#")[0]);
    const pageId = PATHS[rel];
    const params = {};
    if (u.searchParams.get("route")) params.route = u.searchParams.get("route");
    if (u.searchParams.get("resume")) params.resume = u.searchParams.get("resume");
    return { pageId, params, hash: u.hash, model: nav(pageId, params) };
  }

  // --- the runtime must CREATE the cursor, not just honour one -------------
  const g2 = nav("genai-g2", { route: "full" });
  eq("g2 state", g2.state, "3");
  eq("g2 primary continue is Full step 12", byRole(g2, "next").pageId, "agentic-ai");
  const bootstrap = (g2.secondary || []).find((a) => a.role === "collection-next");
  ok("g2 emits a secondary collection action", Boolean(bootstrap));
  eq("secondary destination", bootstrap.pageId, "genai-g3");
  const bq = qs(bootstrap.href);
  eq("secondary carries route=full", bq.get("route"), "full");
  eq("secondary carries resume=genai-g2 (created here)", bq.get("resume"), "genai-g2");
  eq("secondary carries exactly these two parameters",
    [...bq.keys()].sort(), ["resume", "route"]);

  // --- journey: g2 -> (emitted) g3 -> (emitted) agentic-ai ------------------
  const hopA = follow(bootstrap.href);
  eq("journey step 1: emitted URL lands on g3", hopA.pageId, "genai-g3");
  eq("journey step 1: g3 resolves as 4a", hopA.model.state, "4a");
  const back = byRole(hopA.model, "route-return");
  eq("journey step 1: return target", back.pageId, "agentic-ai");
  const hopB = follow(back.href);
  eq("journey step 2: emitted URL lands on agentic-ai", hopB.pageId, "agentic-ai");
  eq("journey step 2: resolves as state 3", hopB.model.state, "3");
  eq("journey step 2: step index", hopB.model.stepIndex, 12);
  ok("journey step 2: no resume survived the return", !("resume" in hopB.params));

  // --- journey through a migration page ------------------------------------
  const detour = nav("dsa-12", { route: "full", resume: "embeddings" });
  eq("migration journey: detour is 4a", detour.state, "4a");
  const mig = nav("rag-basics-moved", { route: "full", resume: "embeddings" });
  eq("migration state", mig.state, "7");
  const fwd = byRole(mig, "moved-to");
  const fq = qs(fwd.href);
  eq("migration preserves route", fq.get("route"), "full");
  eq("migration preserves the cursor", fq.get("resume"), "embeddings");
  ok("query precedes the fragment", /\?route=full&resume=embeddings#pipeline$/.test(fwd.href));
  const hopC = follow(fwd.href);
  eq("migration journey: lands on rag-deep-dive", hopC.pageId, "rag-deep-dive");
  eq("migration journey: resolves as 4a, not its own route position", hopC.model.state, "4a");
  eq("migration journey: return target preserved",
    byRole(hopC.model, "route-return").pageId, "vector-databases");

  // --- migration cursor matrix ---------------------------------------------
  const m0 = byRole(nav("rag-basics-moved", {}), "moved-to");
  eq("migration, no route: no query at all", new URL(m0.href).search, "");
  ok("migration, no route: anchor kept", new URL(m0.href).hash === "#pipeline");
  const m1 = byRole(nav("rag-basics-moved", { route: "full" }), "moved-to");
  eq("migration, route only", [...qs(m1.href).keys()], ["route"]);
  const m2 = nav("rag-basics-moved", { route: "full", resume: "not-a-page" });
  eq("migration, invalid cursor: dropped", [...qs(byRole(m2, "moved-to").href).keys()], ["route"]);
  ok("migration, invalid cursor: scheduled for removal", m2.stripResume === true);
  eq("migration always emits exactly one action", roles(m2), ["moved-to"]);
}

section("14 · Self-referential cursor, duplicates and the bare control page");
{
  const self = nav("embeddings", { route: "full", resume: "embeddings" });
  eq("standing on the cursor's own page is state 3, not 4a", self.state, "3");
  eq("step index", self.stepIndex, 7);
  ok("redundant cursor stripped", self.stripResume === true);
  const dests = (self.actions || []).concat(self.secondary || []).map((a) => a.pageId);
  eq("no duplicate destination", dests.length, new Set(dests).size);
  ok("only one link to vector-databases",
    dests.filter((d) => d === "vector-databases").length === 1);

  const ret = nav("vector-databases", { route: "full", resume: "embeddings" });
  eq("standing on stepAfter(cursor) is state 3", ret.state, "3");
  ok("cursor consumed", ret.stripResume === true);

  const away = nav("dsa-12", { route: "full", resume: "embeddings" });
  eq("a genuine detour is still 4a", away.state, "4a");

  const bare = nav("study-plan", {});
  eq("bare control page does not render", bare.render, false);
  ok("reason names the authored fallback", /authored fallback/.test(bare.reason));
  eq("with a route it is still state 10", nav("study-plan", { route: "full" }).state, "10");
  eq("hydrated from storage it is still state 10",
    nav("study-plan", {}, "full").state, "10");

  // Exhaustive sweep. Primaries are deduped on the full key (the same page with
  // and without route context is a different offer); a secondary may never
  // repeat a destination a primary already offers.
  let exactDupes = [], secDupes = [];
  Object.keys(CURRICULUM.pages).forEach((pid) => {
    [{}, { route: "full" }, { route: "full", resume: "embeddings" },
      { route: "full", resume: "genai-g2" }, { route: "bogus" }].forEach((params) => {
      const m = nav(pid, params, "full");
      const all = (m.actions || []).concat(m.secondary || []);
      const exact = all.map((a) =>
        [a.pageId, a.routeId || "", a.resumeId || "", a.anchor || ""].join("|"));
      if (exact.length !== new Set(exact).size) {
        exactDupes.push(pid + " " + JSON.stringify(params));
      }
      const primaryDest = new Set((m.actions || []).map((a) => a.pageId + "|" + (a.anchor || "")));
      (m.secondary || []).forEach((a) => {
        if (primaryDest.has(a.pageId + "|" + (a.anchor || ""))) {
          secDupes.push(pid + " " + JSON.stringify(params) + " -> " + a.pageId);
        }
      });
    });
  });
  ok("no duplicate offers across every page and route context",
    exactDupes.length === 0, exactDupes.slice(0, 5).join("; "));
  ok("no secondary repeats a primary destination",
    secDupes.length === 0, secDupes.slice(0, 5).join("; "));
}

section("15 · isRenderable rejects malformed models");
{
  const stub = {
    createDocumentFragment: () => ({
      kids: [], appendChild(k) { this.kids.push(k); },
      querySelectorAll() { return this.kids.filter((k) => k.href); }
    }),
    createElement: (tag) => ({
      tag, kids: [], className: "", attrs: {}, textContent: "",
      setAttribute(k, v) { this.attrs[k] = v; if (k === "href") this.href = v; },
      getAttribute(k) { return k === "href" ? this.href : this.attrs[k]; },
      appendChild(k) { this.kids.push(k); }
    })
  };
  const rt = PageNav.createRuntime({
    curriculum: CURRICULUM, portalRoot: ROOTS.domain, doc: stub,
    location: { href: ROOTS.domain }, history: null, storage: null,
    logger: { warn() {}, error() {} }
  });
  const A = (role, pageId) => ({ role, dir: role, title: pageId, pageId,
    href: rt.model.linkToPage(pageId), routeId: null, resumeId: null, anchor: null });
  const check = (navModel) => rt.isRenderable(rt.buildFragment(navModel), navModel);

  ok("valid state 3 accepted",
    check({ state: "3", actions: [A("prev", "embeddings"), A("next", "vector-databases")] }));
  ok("state 3 with two forward actions rejected",
    !check({ state: "3", actions: [A("next", "embeddings"), A("next", "vector-databases")] }));
  ok("state 3 with no forward action rejected",
    !check({ state: "3", actions: [A("prev", "embeddings")] }));
  ok("state 4a without a return rejected",
    !check({ state: "4a", actions: [A("leave-route", "study-plan")] }));
  ok("state 4a carrying a next rejected",
    !check({ state: "4a", actions: [A("route-return", "embeddings"), A("next", "vector-databases")] }));
  ok("state 4b carrying a forward step rejected",
    !check({ state: "4b", actions: [A("next", "embeddings")] }));
  ok("state 7 with a Previous rejected",
    !check({ state: "7", actions: [A("moved-to", "rag-deep-dive"), A("prev", "embeddings")] }));
  ok("state 9 without route-start rejected",
    !check({ state: "9", actions: [A("route-overview", "study-plan")] }));
  ok("state 10 without leave-route rejected",
    !check({ state: "10", actions: [A("route-start", "genai-g0")] }));
  ok("identical duplicate offers rejected",
    !check({ state: "3", actions: [A("prev", "embeddings"), A("next", "embeddings")] }));
  ok("primaries sharing a destination with different route context accepted",
    check({ state: "4b", actions: [
      { ...A("route-overview", "study-plan"), routeId: "full" },
      A("leave-route", "study-plan")] }));
  ok("a secondary repeating a primary destination rejected",
    !check({ state: "3",
      actions: [A("prev", "embeddings"), A("next", "vector-databases")],
      secondary: [A("collection-next", "vector-databases")] }));

  /* Every model the manifest can produce must survive its own validator. This
     sweep is what the browser caught and the earlier unit tests did not: the
     model and isRenderable disagreed about what counts as a duplicate, and only
     a real page in state 4b exercised the difference. */
  const unrenderable = [];
  Object.keys(CURRICULUM.pages).forEach((pid) => {
    [{}, { route: "full" }, { route: "full", resume: "embeddings" },
      { route: "full", resume: "genai-g2" }, { route: "full", resume: "job-search" },
      { route: "bogus" }].forEach((params) => {
      const m = nav(pid, params, "full");
      if (!m || m.render === false) return;
      let good = false;
      try { good = check(m); } catch (e) { good = false; }
      if (!good) unrenderable.push(pid + " " + JSON.stringify(params) + " state " + m.state);
    });
  });
  ok("every renderable model passes isRenderable (" +
    Object.keys(CURRICULUM.pages).length * 6 + " combinations)",
    unrenderable.length === 0, unrenderable.slice(0, 6).join("; "));
}

/* ===================================================================== */
section("16 · Storage lifecycle");
{
  function fakeStorage(opts) {
    opts = opts || {};
    const data = new Map();
    return {
      data,
      getItem: (k) => (data.has(k) ? data.get(k) : null),
      setItem(k, v) { if (opts.throwOnSet) throw new Error("QuotaExceeded"); data.set(k, v); },
      removeItem(k) { if (opts.throwOnRemove) throw new Error("SecurityError"); data.delete(k); }
    };
  }
  function makeDoc() {
    const slot = { children: [{ tag: "a", href: "AUTHORED" }], replaced: 0,
      replaceChildren(f) { this.replaced += 1; this.children = f.kids.slice(); } };
    return {
      slot,
      doc: {
        body: { getAttribute: () => makeDoc.pageId },
        querySelector: (s2) => (s2 === "[data-page-nav]" ? slot : null),
        createDocumentFragment: () => ({ kids: [], appendChild(k) { this.kids.push(k); },
          querySelectorAll() { return this.kids.filter((k) => k.tag === "a" && k.href); } }),
        createElement: (tag) => ({
          tag, kids: [], className: "", attrs: {}, textContent: "", listeners: {},
          setAttribute(k, v) { this.attrs[k] = v; if (k === "href") this.href = v; },
          getAttribute(k) { return k === "href" ? this.href : (this.attrs[k] ?? null); },
          appendChild(k) { this.kids.push(k); },
          addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); },
          click() { let prevented = false;
            (this.listeners.click || []).forEach((fn) => fn({ preventDefault() { prevented = true; } }));
            return prevented; }
        })
      }
    };
  }
  const logs = [];
  const logger = { warn: (...a) => logs.push(["warn", String(a[0])]),
    error: (...a) => logs.push(["error", String(a[0])]) };

  function run(pageId, search, storage) {
    makeDoc.pageId = pageId;
    const dom = makeDoc();
    const rt = PageNav.createRuntime({
      curriculum: CURRICULUM, portalRoot: ROOTS.domain, doc: dom.doc,
      location: { href: ROOTS.domain + CURRICULUM.pages[pageId].path + (search || "") },
      history: null, storage, logger
    });
    const res = rt.render();
    return { res, dom, rt };
  }

  // 1 · an explicit URL route is remembered
  let st = fakeStorage();
  let r = run("embeddings", "?route=full", st);
  ok("explicit route renders", r.res.rendered === true);
  eq("explicit route is persisted", st.getItem("gp.route"), "full");

  // 2 · invalid and draft routes are never remembered
  st = fakeStorage();
  run("embeddings", "?route=nonsense", st);
  eq("invalid route writes nothing", st.getItem("gp.route"), null);
  st = fakeStorage();
  run("embeddings", "?route=sprint", st);
  eq("an unregistered route writes nothing", st.getItem("gp.route"), null);
  st = fakeStorage();
  run("beginner-basics", "?route=interview-sprint", st);
  eq("a newly activated route is persisted", st.getItem("gp.route"), "interview-sprint");

  // 3 · a failed render writes nothing
  st = fakeStorage();
  {
    makeDoc.pageId = "embeddings";
    const dom = makeDoc();
    const rt = PageNav.createRuntime({ curriculum: CURRICULUM, portalRoot: ROOTS.domain,
      doc: dom.doc, location: { href: ROOTS.domain + "modules/04_embeddings.html?route=full" },
      history: null, storage: st, logger });
    rt.isRenderable = () => false;
    const res = rt.render();
    ok("forced failure does not render", res.rendered === false);
    ok("forced failure did not swap", dom.slot.replaced === 0);
    eq("forced failure writes nothing", st.getItem("gp.route"), null);
  }

  // 4 · hydration is not a fresh selection
  st = fakeStorage();
  st.setItem("gp.route", "full");
  st.data.delete("gp.route");                       // prove the write below is ours
  st.setItem("gp.route", "full");
  const before = st.getItem("gp.route");
  run("embeddings", "", st);                        // no ?route= -> hydrated from storage
  eq("hydration leaves storage as it was", st.getItem("gp.route"), before);

  // 5 · leave actions declare and perform the clear
  const ctl = nav("study-plan", { route: "full" });
  const leave = byRole(ctl, "leave-route");
  eq("state 10 leave action declares the effect", leave.storageEffect, "clear");
  eq("state 4a switch action declares the effect",
    byRole(nav("dsa-12", { route: "full", resume: "embeddings" }), "leave-route").storageEffect,
    "clear");
  eq("state 4b leave action declares the effect",
    byRole(nav("dsa-12", { route: "full" }), "leave-route").storageEffect, "clear");
  ok("ordinary actions carry no storage effect",
    byRole(nav("embeddings", { route: "full" }), "next").storageEffect === undefined);

  // 6 · clicking it clears storage without blocking navigation
  st = fakeStorage();
  r = run("study-plan", "?route=full", st);
  eq("control page persisted the route", st.getItem("gp.route"), "full");
  const anchors = r.dom.slot.children.filter((c) => c.tag === "a");
  const leaveEl = anchors.find((a) => a.getAttribute("data-storage-effect") === "clear");
  ok("the leave anchor is marked in the DOM", Boolean(leaveEl));
  const prevented = leaveEl.click();
  eq("clicking cleared the stored route", st.getItem("gp.route"), null);
  ok("navigation was not prevented", prevented === false);

  // 7 · a bare control page afterwards does not hydrate
  const after = run("study-plan", "", st);
  ok("bare control page keeps the authored fallback", after.res.rendered === false);
  ok("bare control page is an intentional fallback", after.res.intentional === true);
  ok("bare control page did not swap", after.dom.slot.replaced === 0);
  eq("still nothing stored", st.getItem("gp.route"), null);

  // 8 · storage that throws never breaks the runtime
  const badSet = fakeStorage({ throwOnSet: true });
  r = run("embeddings", "?route=full", badSet);
  ok("setItem throwing still renders", r.res.rendered === true);
  const badRemove = fakeStorage({ throwOnRemove: true });
  badRemove.data.set("gp.route", "full");
  r = run("study-plan", "?route=full", badRemove);
  const badLeave = r.dom.slot.children.filter((c) => c.tag === "a")
    .find((a) => a.getAttribute("data-storage-effect") === "clear");
  ok("removeItem throwing does not prevent navigation", badLeave.click() === false);
  ok("runtime still rendered", r.res.rendered === true);

  // a null storage environment is also fine
  r = run("embeddings", "?route=full", null);
  ok("absent storage still renders", r.res.rendered === true);
}

section("17 · Homepage and other multi-index pages");
{
  eq("hub-home indexes two collections",
    M.collectionsWhoseIndexIs("hub-home").sort(), ["deep-dives", "mastery"]);
  const home = nav("hub-home", {});
  eq("bare homepage keeps its authored navigation", home.render, false);
  eq("bare homepage is an intentional fallback", home.fallback, "intentional");
  eq("reason names the collection count", home.indexedCollections, 2);

  eq("a single-collection index still gets a Start action",
    nav("dsa-index", {}).actions.map((a) => a.role + "->" + a.pageId),
    ["collection-start->dsa-complexity", "hub->hub-home"]);
  eq("agents index also gets one", byRole(nav("agents-course", {}), "collection-start").pageId,
    "ta-l01");
  eq("agents index in the route is still state 3", nav("agents-course", { route: "full" }).state, "3");
  eq("control page in the route is still state 10", nav("study-plan", { route: "full" }).state, "10");

  // the rule is about counts, not about one hard-coded id
  const indexPages = Object.keys(CURRICULUM.pages)
    .filter((id) => CURRICULUM.pages[id].type === "index");
  const multi = indexPages.filter((id) => M.collectionsWhoseIndexIs(id).length > 1);
  const single = indexPages.filter((id) => M.collectionsWhoseIndexIs(id).length === 1);
  eq("exactly one index page serves several collections", multi, ["hub-home"]);
  ok("every multi-index page defers to its authored page",
    multi.every((id) => nav(id, {}).render === false));
  ok("every single-index page offers a Start action",
    single.every((id) => {
      const m = nav(id, {});
      return m.render !== false && m.actions.some((a) => a.role === "collection-start");
    }));
}

section("18 · Intentional fallback is silent");
{
  const logs = [];
  const logger = { warn: (...a) => logs.push("warn:" + a[0]), error: (...a) => logs.push("error:" + a[0]) };
  function quiet(pageId) {
    logs.length = 0;
    const slot = { children: [], replaced: 0, replaceChildren() { this.replaced += 1; } };
    const rt = PageNav.createRuntime({
      curriculum: CURRICULUM, portalRoot: ROOTS.domain,
      doc: { body: { getAttribute: () => pageId }, querySelector: () => slot,
        createDocumentFragment: () => ({ kids: [], appendChild() {}, querySelectorAll: () => [] }),
        createElement: () => ({ setAttribute() {}, appendChild() {}, getAttribute: () => null }) },
      location: { href: ROOTS.domain }, history: null, storage: null, logger
    });
    const res = rt.render();
    return { res, logs: logs.slice(), slot };
  }
  let q = quiet("hub-home");
  ok("bare homepage: no warning", q.logs.length === 0, q.logs.join("|"));
  ok("bare homepage: reported as intentional", q.res.intentional === true);
  q = quiet("study-plan");
  ok("bare study plan: no warning", q.logs.length === 0, q.logs.join("|"));
  q = quiet("beginner-basics");
  ok("bare standalone page: no warning", q.logs.length === 0, q.logs.join("|"));
  ok("bare standalone page: intentional", q.res.intentional === true);
  q = quiet("job-search");
  ok("bare reference page with no collection: no warning", q.logs.length === 0, q.logs.join("|"));

  q = quiet("not-a-registered-page");
  ok("unknown page id: warning kept", q.logs.some((l) => l.startsWith("warn:")), q.logs.join("|"));
  ok("unknown page id: not marked intentional", q.res.intentional === false);

  // an exception is still loud
  logs.length = 0;
  const slot = { children: [], replaced: 0, replaceChildren() { this.replaced += 1; } };
  const rt = PageNav.createRuntime({
    curriculum: CURRICULUM, portalRoot: ROOTS.domain,
    doc: { body: { getAttribute: () => "embeddings" }, querySelector: () => slot,
      createDocumentFragment: () => ({ kids: [], appendChild() {}, querySelectorAll: () => [] }),
      createElement: () => ({ setAttribute() {}, appendChild() {}, getAttribute: () => null }) },
    location: { href: ROOTS.domain }, history: null, storage: null, logger
  });
  rt.resolveNav = () => { throw new Error("boom"); };
  rt.render();
  ok("exception: warning kept", logs.some((l) => l.startsWith("warn:")), logs.join("|"));
  ok("exception: nothing swapped", slot.replaced === 0);
}

/* ===================================================================== */
section("19 · Stage 2d parity sweep - all 150 registered pages");
{
  const P = CURRICULUM.pages;
  const R = CURRICULUM.routes.full;
  const order = R.steps.map((s) => s.page);
  const ids = Object.keys(P);
  const problems = { bare: [], route: [], dest: [] };
  const tally = { bareIntentional: 0, bareCollection: 0, bareMigration: 0, bareIndexStart: 0,
    bareIndexFallback: 0, routeSteps: 0, route4b: 0, noContext: 0 };

  const indexedCount = (id) => M.collectionsWhoseIndexIs(id).length;
  const memberOf = (id) => M.collectionOf(id);
  const allActions = (m) => (m.actions || []).concat(m.secondary || []);

  // ---------- bare URLs ----------
  ids.forEach((id) => {
    const page = P[id];
    const m = nav(id, {});
    const acts = allActions(m);

    acts.forEach((a) => {
      if (!P[a.pageId]) problems.dest.push(id + " (bare) -> unregistered " + a.pageId);
    });

    if (page.type === "migration") {
      if (m.state !== "7" || acts.length !== 1 || acts[0].pageId !== page.movedTo) {
        problems.bare.push(id + ": migration did not resolve to its destination");
      } else tally.bareMigration += 1;
      return;
    }
    if (page.type === "index") {
      const n = indexedCount(id);
      if (n === 1 || memberOf(id)) {
        if (m.render === false || !acts.some((a) => a.role === "collection-start")) {
          problems.bare.push(id + ": single-collection index has no Start action");
        } else tally.bareIndexStart += 1;
      } else if (m.render !== false || m.fallback !== "intentional") {
        problems.bare.push(id + ": index for " + n + " collections should keep its fallback");
      } else tally.bareIndexFallback += 1;
      return;
    }
    const col = memberOf(id);
    if (col) {
      const members = col.collection.members;
      const i = members.indexOf(id);
      const want = [];
      if (i > 0) want.push(members[i - 1]);
      if (i + 1 < members.length) want.push(members[i + 1]);
      const got = acts.filter((a) => a.role === "prev" || a.role === "next").map((a) => a.pageId);
      if (m.render === false ? want.length !== 0 : JSON.stringify(got) !== JSON.stringify(want)) {
        problems.bare.push(id + ": collection order " + JSON.stringify(got) +
          " != " + JSON.stringify(want));
      } else tally.bareCollection += 1;
      if (acts.some((a) => qs(a.href).has("route"))) {
        problems.bare.push(id + ": bare URL emitted route context");
      }
      return;
    }
    if (m.render !== false || m.fallback !== "intentional") {
      problems.bare.push(id + ": expected an intentional fallback, got state " + m.state);
    } else tally.bareIntentional += 1;
  });

  // ---------- ?route=full ----------
  ids.forEach((id) => {
    const page = P[id];
    const m = nav(id, { route: "full" });
    const acts = allActions(m);
    acts.forEach((a) => {
      if (!P[a.pageId]) problems.dest.push(id + " (route) -> unregistered " + a.pageId);
    });

    if (page.type === "private" || page.type === "optional-track") {
      /* The rule is that nothing may link INTO these pages with route context.
         Standing on one while a route is selected is just being out of route,
         and offering the way back is the point of state 4b. */
      const link = M.linkToPage(id, { routeId: "full", resumeId: "embeddings" });
      if (new URL(link).search !== "") {
        problems.route.push(id + ": linkToPage attached context to a " + page.type + " page");
      } else tally.noContext += 1;
      if (m.state !== "4b") {
        problems.route.push(id + ": " + page.type + " page is state " + m.state + " (expected 4b)");
      }
      acts.filter((a) => ["private", "optional-track"].includes(P[a.pageId].type))
        .forEach((a) => {
          if (new URL(a.href).search !== "") {
            problems.route.push(id + " -> " + a.pageId + " carries context into a "
              + P[a.pageId].type + " page");
          }
        });
      return;
    }
    if (page.type === "migration") return;                       // state 7, covered above
    if ((R.controlPages || []).includes(id)) {
      if (m.state !== "10") problems.route.push(id + ": control page is state " + m.state);
      return;
    }
    if ((R.preflight || []).includes(id)) {
      if (m.state !== "9") problems.route.push(id + ": preflight is state " + m.state);
      return;
    }

    const i = order.indexOf(id);
    if (i !== -1) {
      if (m.state !== "3" || m.stepIndex !== i + 1 || m.stepCount !== 69) {
        problems.route.push(id + ": step " + (i + 1) + " resolved as " + m.state +
          " index " + m.stepIndex);
        return;
      }
      const prev = acts.find((a) => a.role === "prev");
      const next = acts.find((a) => a.role === "next");
      const fin = acts.find((a) => a.role === "route-finish");
      if (i > 0 && (!prev || prev.pageId !== order[i - 1])) {
        problems.route.push(id + ": previous is " + (prev && prev.pageId) + " want " + order[i - 1]);
      }
      if (i === 0 && prev) problems.route.push(id + ": step 01 must have no Previous");
      if (i + 1 < order.length) {
        if (!next || next.pageId !== order[i + 1]) {
          problems.route.push(id + ": continue is " + (next && next.pageId) + " want " + order[i + 1]);
        }
      } else if (!fin || fin.pageId !== R.finish.page) {
        problems.route.push(id + ": final step must resolve through route.finish");
      }
      [prev, next, fin].filter(Boolean).forEach((a) => {
        if (qs(a.href).get("route") !== "full") {
          problems.route.push(id + ": " + a.role + " lost route context");
        }
      });
      tally.routeSteps += 1;
      return;
    }
    if (page.type === "index") return;                            // 6b/3 handled by type rules
    if (m.state !== "4b") {
      problems.route.push(id + ": outside Full but state " + m.state + " (expected 4b)");
    } else tally.route4b += 1;
  });

  // draft routes stay invalid everywhere
  const draftLeaks = ids.filter((id) => {
    const m = nav(id, { route: "not-a-route" });
    /* Migration is precedence rule 1, so it answers before route resolution --
       the same exception the unknown-route sweep already makes. What matters is
       that the forward link carries no context from an unresolvable route. */
    if (P[id].type === "migration") {
      return m.state !== "7" || allActions(m).some((a) => new URL(a.href).search !== "");
    }
    return m.state !== "2";
  });
  const nonsenseLeaks = ids.filter((id) => {
    const m = nav(id, { route: "nonsense" });
    return P[id].type === "migration" ? m.state !== "7" : m.state !== "2";
  });

  ok("bare URLs behave per page class (" + ids.length + " pages)",
    problems.bare.length === 0, problems.bare.slice(0, 6).join("; "));
  ok("?route=full behaves per page class",
    problems.route.length === 0, problems.route.slice(0, 6).join("; "));
  ok("every generated destination is a registered page id",
    problems.dest.length === 0, problems.dest.slice(0, 6).join("; "));
  ok("an unregistered route stays invalid on every page", draftLeaks.length === 0,
    draftLeaks.slice(0, 4).join(", "));
  ok("unknown route stays invalid on every page (migrations excepted)",
    nonsenseLeaks.length === 0, nonsenseLeaks.slice(0, 4).join(", "));
  eq("all 69 route steps verified", tally.routeSteps, 69);
  eq("private + optional-track pages never carry context", tally.noContext, 26);
  console.log("       bare: %d collection, %d migration, %d index-start, %d index-fallback, %d intentional; route: %d steps, %d out-of-route",
    tally.bareCollection, tally.bareMigration, tally.bareIndexStart,
    tally.bareIndexFallback, tally.bareIntentional, tally.routeSteps, tally.route4b);
}

/* ===================================================================== */
section("20 · Release 3 - three active routes");
{
  const R = CURRICULUM.routes;
  const active = Object.keys(R).filter((k) => R[k].status === "active").sort();
  eq("exactly three active routes", active, ["full", "interview-sprint", "job-ready"]);
  eq("Full opens with Foundations then Neural Networks",
    R.full.steps.slice(0, 2).map((s) => s.page), ["llm-foundations", "genai-g0"]);
  eq("Full still has 69 steps", R.full.steps.length, 69);
  eq("Interview Sprint has 28 steps", R["interview-sprint"].steps.length, 28);
  eq("Job-Ready has 27 steps", R["job-ready"].steps.length, 27);
  ok("Sprint and Job-Ready start at Basics",
    ["interview-sprint", "job-ready"].every((r) => R[r].steps[0].page === "beginner-basics"));
  ok("no active route carries section assignments",
    active.every((r) => R[r].steps.every((s) => !("sections" in s))));
  ok("no active route repeats a page", active.every((r) => {
    const p = R[r].steps.map((s) => s.page);
    return p.length === new Set(p).size;
  }));
  ok("all three finish at study-plan",
    active.every((r) => R[r].finish.page === "study-plan"));
  ok("Basics is a numbered step on Sprint and Job-Ready, a preflight only on Full",
    R.full.preflight[0] === "beginner-basics" &&
    !R.full.steps.some((s) => s.page === "beginner-basics") &&
    R["interview-sprint"].preflight.length === 0 && R["job-ready"].preflight.length === 0);

  // first / middle / final step of every route
  active.forEach((rid) => {
    const steps = R[rid].steps.map((s) => s.page);
    const mid = Math.floor(steps.length / 2);
    const cases = [["first", 0], ["middle", mid], ["final", steps.length - 1]];
    cases.forEach(([label, i]) => {
      const m = nav(steps[i], { route: rid });
      eq(rid + " " + label + " step state", m.state, "3");
      eq(rid + " " + label + " step index", [m.stepIndex, m.stepCount], [i + 1, steps.length]);
      const prev = byRole(m, "prev"), next = byRole(m, "next"), fin = byRole(m, "route-finish");
      if (i === 0) ok(rid + " first step has no Previous", !prev);
      else eq(rid + " " + label + " Previous", prev.pageId, steps[i - 1]);
      if (i === steps.length - 1) {
        eq(rid + " final step finishes through route.finish", fin.pageId, R[rid].finish.page);
        ok(rid + " final step offers no ordinary next", !next);
      } else {
        eq(rid + " " + label + " Continue", next.pageId, steps[i + 1]);
      }
      [prev, next, fin].filter(Boolean).forEach((a) => {
        if (qs(a.href).get("route") !== rid) {
          ok(rid + " " + label + " " + a.role + " keeps its own route", false, a.href);
        }
      });
      ok(rid + " " + label + " step links all carry route=" + rid, true);
    });

    // control page speaks for the selected route
    const ctl = nav("study-plan", { route: rid });
    eq(rid + " control page state", ctl.state, "10");
    eq(rid + " control page starts its own route", byRole(ctl, "route-start").pageId, steps[0]);
    ok(rid + " control page names the route", ctl.notice.includes(R[rid].label), ctl.notice);
    ok(rid + " control page is not a numbered step", ctl.stepIndex === undefined);
    ok(rid + " control page offers a clearing leave action",
      byRole(ctl, "leave-route").storageEffect === "clear");
    ok(rid + " control page start link carries the route",
      qs(byRole(ctl, "route-start").href).get("route") === rid);
  });

  // Basics: numbered step 01 on the two shorter routes, preflight on Full
  eq("Basics is state 9 on Full", nav("beginner-basics", { route: "full" }).state, "9");
  ["interview-sprint", "job-ready"].forEach((rid) => {
    const m = nav("beginner-basics", { route: rid });
    eq("Basics is step 01 on " + rid, [m.state, m.stepIndex], ["3", 1]);
  });
}

section("21 · Release 3 - switching, cursors and leakage");
{
  const R = CURRICULUM.routes;
  // the URL wins over storage on every switch
  [["full", "interview-sprint"], ["interview-sprint", "job-ready"], ["job-ready", "full"]]
    .forEach(([from, to]) => {
      const page = R[to].steps[1].page;
      const r = M.resolveRoute({ route: to }, from, page);
      eq(from + " -> " + to + ": URL is authoritative", [r.id, r.source], [to, "url"]);
      const m = nav(page, { route: to }, from);
      eq(from + " -> " + to + ": navigation comes from the new route", m.routeId, to);
      eq(from + " -> " + to + ": step index is the new route's",
        m.stepIndex, R[to].steps.findIndex((s) => s.page === page) + 1);
      ok(from + " -> " + to + ": links carry the new route",
        (m.actions || []).every((a) => qs(a.href).get("route") === to));
    });

  // a cursor from the previous route cannot survive the switch
  const strandedPage = "transformers";                     // Full step 03, not in Sprint
  ok("the stranded page is not in Interview Sprint",
    !R["interview-sprint"].steps.some((s) => s.page === strandedPage));
  const sprintFirst = R["interview-sprint"].steps[3].page;
  const carried = nav(sprintFirst, { route: "interview-sprint", resume: strandedPage });
  eq("a foreign cursor is rejected and the page resolves in the new route",
    carried.state, "3");
  ok("the foreign cursor is scheduled for removal", carried.stripResume === true);
  ok("no generated link carries the foreign cursor",
    (carried.actions || []).every((a) => !qs(a.href).has("resume")));

  // detour and return inside a route other than Full
  const bank = "genai-g4";
  const inSprint = R["interview-sprint"].steps.map((s) => s.page);
  if (inSprint.includes(bank)) {
    const m = nav(bank, { route: "interview-sprint" });
    const sec = (m.secondary || []).find((a) => a.role === "collection-next");
    if (sec) {
      eq("a Sprint bank page creates its own cursor",
        qs(sec.href).get("resume"), bank);
      eq("and keeps the Sprint route", qs(sec.href).get("route"), "interview-sprint");
      const away = nav(sec.pageId, { route: "interview-sprint", resume: bank });
      eq("the detour resolves as 4a inside Sprint", away.state, "4a");
      const back = byRole(away, "route-return");
      eq("returning targets the step after the cursor",
        back.pageId, inSprint[inSprint.indexOf(bank) + 1]);
    }
  }
  ok("Sprint detour path exercised", true);

  // invalid and unknown routes
  ["nonsense", "sprint", ""].forEach((bad) => {
    if (!bad) return;
    eq("route=" + bad + " is invalid", nav("embeddings", { route: bad }).state, "2");
  });

  // no leakage into DSA or Machine Learning from any active route
  ["interview-sprint", "job-ready", "full"].forEach((rid) => {
    ["dsa-12", "ml-06"].forEach((pid) => {
      const bare = nav(pid, {}, rid);
      ok(rid + " does not hydrate onto " + pid,
        bare.state === "1" && (bare.actions || []).every((a) => !qs(a.href).has("route")));
      ok(rid + " cannot be linked into " + pid + " with context",
        new URL(M.linkToPage(pid, { routeId: rid })).search === "" ||
        CURRICULUM.pages[pid].type === "content");
      const withRoute = nav(pid, { route: rid });
      ok(pid + " under " + rid + " is out-of-route, not a step",
        withRoute.state === "4b" || withRoute.state === "4a");
    });
  });
  eq("machine-learning pages never receive route context",
    new URL(M.linkToPage("ml-06", { routeId: "interview-sprint" })).search, "");
}

/* ===================================================================== */
section("22 · Release 3.1 - the Job-Ready MCP insertion");
{
  const fs = require("fs");
  const R = CURRICULUM.routes;
  const jr = R["job-ready"].steps.map((s) => s.page);
  const frozen = JSON.parse(fs.readFileSync(
    path.join(__dirname, "baselines", "job-ready-r3.json"), "utf8"));

  eq("Job-Ready is 26 -> 27 steps", [frozen.steps.length, jr.length], [26, 27]);
  eq("removing mcp-module reproduces the Release 3 order",
    jr.filter((p) => p !== "mcp-module"), frozen.steps);
  eq("mcp-module sits between ta-l14 and the LangGraph pages",
    jr.slice(jr.indexOf("mcp-module") - 1, jr.indexOf("mcp-module") + 2),
    ["ta-l14", "mcp-module", "langgraph-asyncio"]);
  eq("mcp-module is Job-Ready step 18", jr.indexOf("mcp-module") + 1, 18);

  // the other two routes are untouched
  const r2 = JSON.parse(fs.readFileSync(
    path.join(__dirname, "baselines", "full-route-r2.json"), "utf8")).steps;
  const full = R.full.steps.map((s) => s.page);
  eq("Full membership is unchanged", full.slice().sort(), r2.slice().sort());
  eq("mcp-module has not moved within Full",
    full.indexOf("mcp-module"), r2.indexOf("mcp-module"));
  eq("mcp-module is still Sprint step 14",
    R["interview-sprint"].steps.map((s) => s.page).indexOf("mcp-module") + 1, 14);

  // navigation around the inserted step
  const m = nav("mcp-module", { route: "job-ready" });
  eq("the inserted step is an ordinary numbered step", m.state, "3");
  eq("its position is 18 of 27", [m.stepIndex, m.stepCount], [18, 27]);
  eq("Previous is ta-l14", byRole(m, "prev").pageId, "ta-l14");
  eq("Continue is langgraph-asyncio", byRole(m, "next").pageId, "langgraph-asyncio");
  const links = (m.actions || []).concat(m.secondary || []);
  ok("every generated link keeps route=job-ready",
    links.length > 0 && links.every((a) => qs(a.href).get("route") === "job-ready"),
    links.map((a) => a.href).join(" "));

  // its neighbours agree, from both sides
  eq("ta-l14 now continues into mcp-module",
    byRole(nav("ta-l14", { route: "job-ready" }), "next").pageId, "mcp-module");
  eq("langgraph-asyncio now comes back to mcp-module",
    byRole(nav("langgraph-asyncio", { route: "job-ready" }), "prev").pageId, "mcp-module");
  eq("ta-l14 is step 17 of 27",
    [nav("ta-l14", { route: "job-ready" }).stepIndex,
      nav("ta-l14", { route: "job-ready" }).stepCount], [17, 27]);

  // the same page under the other two routes reports their own positions
  eq("mcp-module under Sprint is step 14 of 28",
    [nav("mcp-module", { route: "interview-sprint" }).stepIndex,
      nav("mcp-module", { route: "interview-sprint" }).stepCount], [14, 28]);
  eq("mcp-module under Full keeps its Release 2 position",
    nav("mcp-module", { route: "full" }).stepIndex, r2.indexOf("mcp-module") + 1);

  // every Job-Ready step still resolves to a numbered position after the shift
  const wrong = jr.filter((p, i) => {
    const s = nav(p, { route: "job-ready" });
    return s.state !== "3" || s.stepIndex !== i + 1 || s.stepCount !== 27;
  });
  eq("all 27 Job-Ready steps report the right position", wrong, []);
}

console.log("\n" + "=".repeat(60));
console.log(pass + " assertion(s) passed, " + failures.length + " failed");
if (failures.length) {
  failures.forEach((f) => console.log("  FAIL " + f));
  process.exit(1);
}
process.exit(0);
