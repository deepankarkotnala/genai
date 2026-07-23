/* ATS Agent Build Lab — course progress and small interactions. Offline-safe. */
(function () {
  "use strict";
  var KEY = "genai.ats-agent-lab.completed.v1";
  var TOTAL = 7;

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch (e) { return []; }
  }
  function write(value) {
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch (e) {}
  }
  function update() {
    var done = read().filter(function (x, i, a) { return /^0[1-7]$/.test(x) && a.indexOf(x) === i; });
    var pct = Math.round(done.length / TOTAL * 100);
    document.querySelectorAll("[data-ats-progress-pct]").forEach(function (el) { el.textContent = pct + "%"; });
    document.querySelectorAll("[data-ats-progress-count]").forEach(function (el) { el.textContent = done.length + " / " + TOTAL + " lessons"; });
    document.querySelectorAll("[data-ats-progress-fill]").forEach(function (el) { el.style.width = pct + "%"; });

    var lesson = document.body.getAttribute("data-ats-lesson");
    var button = document.querySelector("[data-ats-complete]");
    if (button && lesson) {
      var complete = done.indexOf(lesson) > -1;
      button.textContent = complete ? "✓ Completed — click to undo" : "Mark lesson complete";
      button.classList.toggle("ghost", complete);
      button.setAttribute("aria-pressed", complete ? "true" : "false");
    }
  }

  function init() {
    var button = document.querySelector("[data-ats-complete]");
    if (button) button.addEventListener("click", function () {
      var lesson = document.body.getAttribute("data-ats-lesson");
      var done = read();
      var at = done.indexOf(lesson);
      if (at > -1) done.splice(at, 1); else done.push(lesson);
      write(done); update();
    });
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
