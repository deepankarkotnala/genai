/* Study time guidance + topic-level progress tracker. Static-hosting friendly. */
(function () {
  "use strict";

  var DATA = window.GenAIStudyData;
  if (!DATA || !Array.isArray(DATA.modules)) return;

  var TOPIC_KEY = "gp.topicProgress.v1";
  var MODULE_KEY = "gp.completed";

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function topicState() {
    var value = readJSON(TOPIC_KEY, {});
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function moduleState() {
    var value = readJSON(MODULE_KEY, []);
    return Array.isArray(value) ? value : [];
  }

  function topicKey(moduleId, sectionId) { return moduleId + ":" + sectionId; }

  function hasExplicitTopicState(module, topics) {
    var prefix = module.id + ":";
    return Object.keys(topics).some(function (key) { return key.indexOf(prefix) === 0; });
  }

  function isTopicDone(module, section, topics, modulesDone) {
    var key = topicKey(module.id, section.id);
    if (Object.prototype.hasOwnProperty.call(topics, key)) return !!topics[key];
    return modulesDone.indexOf(module.id) !== -1 && !hasExplicitTopicState(module, topics);
  }

  function formatMinutes(minutes, approximate) {
    var prefix = approximate === false ? "" : "~";
    if (minutes < 60) return prefix + minutes + " min";
    var hours = Math.floor(minutes / 60);
    var remaining = minutes % 60;
    return prefix + hours + " hr" + (hours === 1 ? "" : "s") + (remaining ? " " + remaining + " min" : "");
  }

  function setAllTopics(module, done, topics) {
    module.sections.forEach(function (section) {
      topics[topicKey(module.id, section.id)] = !!done;
    });
  }

  function syncModuleCompletion(module, topics, completed) {
    var allDone = module.sections.every(function (section) {
      return !!topics[topicKey(module.id, section.id)];
    });
    var index = completed.indexOf(module.id);
    if (allDone && index === -1) completed.push(module.id);
    if (!allDone && index !== -1) completed.splice(index, 1);
    return allDone;
  }

  function saveTopicToggle(module, section) {
    var topics = topicState();
    var completed = moduleState();

    if (completed.indexOf(module.id) !== -1 && !hasExplicitTopicState(module, topics)) {
      setAllTopics(module, true, topics);
    }

    var key = topicKey(module.id, section.id);
    topics[key] = !topics[key];
    syncModuleCompletion(module, topics, completed);
    writeJSON(TOPIC_KEY, topics);
    writeJSON(MODULE_KEY, completed);
    window.dispatchEvent(new CustomEvent("genai-progress-change", { detail: { source: "topic-toggle", moduleId: module.id } }));
  }

  function insertModuleStudyGuide() {
    var moduleId = document.body && document.body.getAttribute("data-page");
    var module = DATA.modules.find(function (item) { return item.id === moduleId; });
    if (!module) return;

    var meta = document.querySelector("main.content .meta-row");
    if (meta && !meta.querySelector("[data-ideal-study-time]")) {
      var pill = document.createElement("span");
      pill.className = "pill study-time-pill";
      pill.setAttribute("data-ideal-study-time", "");
      pill.textContent = "🎯 Ideal study · " + formatMinutes(module.minutes, false);
      meta.insertBefore(pill, meta.firstChild);
    }

    if (meta && !document.querySelector(".study-commitment")) {
      var guide = document.createElement("div");
      guide.className = "study-commitment";
      guide.innerHTML = '<div class="study-commitment-copy"><span class="study-commitment-icon" aria-hidden="true">◷</span><div><strong>Recommended study pace</strong><p>Aim for at least <b>2–4 focused hours daily</b>, with an <b>8-hour weekend block</b>. This module is planned for ' + formatMinutes(module.minutes, false) + ' including notes, practice and recall.</p></div></div><a class="study-progress-link" href="../progress.html">Open progress tracker →</a>';
      meta.insertAdjacentElement("afterend", guide);
    }

    function render() {
      var topics = topicState();
      var completed = moduleState();
      module.sections.forEach(function (section) {
        var heading = document.getElementById(section.id);
        if (!heading) return;
        var done = isTopicDone(module, section, topics, completed);
        heading.classList.toggle("topic-complete", done);
        var button = heading.querySelector("[data-topic-check]");
        if (button) {
          button.classList.toggle("checked", done);
          button.setAttribute("aria-pressed", done ? "true" : "false");
          button.setAttribute("aria-label", (done ? "Mark incomplete: " : "Mark complete: ") + section.title);
          button.title = done ? "Mark this topic incomplete" : "Mark this topic complete";
          button.innerHTML = done ? "✓" : "";
        }
      });
    }

    module.sections.forEach(function (section) {
      var heading = document.getElementById(section.id);
      if (!heading || heading.querySelector(".section-study-meta")) return;
      var controls = document.createElement("span");
      controls.className = "section-study-meta";
      controls.innerHTML = '<button type="button" class="topic-check" data-topic-check aria-pressed="false"></button><span class="section-time">' + formatMinutes(section.minutes) + '</span>';
      controls.querySelector("button").addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        saveTopicToggle(module, section);
        render();
      });
      heading.appendChild(controls);
    });

    window.addEventListener("genai-progress-change", function (event) {
      var detail = event.detail || {};
      if (detail.source === "module-toggle" && detail.moduleId === module.id) {
        var topics = topicState();
        setAllTopics(module, !!detail.done, topics);
        writeJSON(TOPIC_KEY, topics);
      }
      render();
    });
    window.addEventListener("storage", render);
    render();
  }

  function progressSnapshot() {
    var topics = topicState();
    var completed = moduleState();
    var totalMinutes = 0;
    var doneMinutes = 0;
    var totalTopics = 0;
    var doneTopics = 0;
    var moduleRows = DATA.modules.map(function (module) {
      var moduleMinutesDone = 0;
      var moduleTopicsDone = 0;
      module.sections.forEach(function (section) {
        totalMinutes += section.minutes;
        totalTopics += 1;
        if (isTopicDone(module, section, topics, completed)) {
          doneMinutes += section.minutes;
          moduleMinutesDone += section.minutes;
          doneTopics += 1;
          moduleTopicsDone += 1;
        }
      });
      return {
        module: module,
        doneMinutes: moduleMinutesDone,
        doneTopics: moduleTopicsDone,
        percent: Math.round(moduleMinutesDone / module.minutes * 100)
      };
    });
    return {
      topics: topics,
      completed: completed,
      totalMinutes: totalMinutes,
      doneMinutes: doneMinutes,
      remainingMinutes: Math.max(0, totalMinutes - doneMinutes),
      totalTopics: totalTopics,
      doneTopics: doneTopics,
      percent: Math.round(doneMinutes / totalMinutes * 100),
      moduleRows: moduleRows
    };
  }

  function trackSummary(snapshot, track) {
    var rows = snapshot.moduleRows.filter(function (row) { return row.module.track === track; });
    var total = rows.reduce(function (sum, row) { return sum + row.module.minutes; }, 0);
    var done = rows.reduce(function (sum, row) { return sum + row.doneMinutes; }, 0);
    return { track: track, total: total, done: done, percent: total ? Math.round(done / total * 100) : 0 };
  }

  function renderDashboard() {
    var host = document.querySelector("[data-progress-dashboard]");
    if (!host) return;

    var snapshot = progressSnapshot();
    var remainingHours = snapshot.remainingMinutes / 60;
    var fastWeeks = remainingHours ? Math.max(.1, Math.ceil((remainingHours / 28) * 10) / 10) : 0;
    var steadyWeeks = remainingHours ? Math.max(.1, Math.ceil((remainingHours / 18) * 10) / 10) : 0;
    var tracks = ["Foundations", "Retrieval", "Agents", "Frameworks", "Production"].map(function (track) {
      return trackSummary(snapshot, track);
    });

    host.innerHTML = '' +
      '<section class="tracker-overview" aria-label="Overall study progress">' +
        '<div class="tracker-ring" style="--tracker-progress:' + snapshot.percent + '%"><div><strong>' + snapshot.percent + '%</strong><span>complete</span></div></div>' +
        '<div class="tracker-summary"><span class="eyebrow"><span class="dot"></span> Study progress</span><h1>Your AI Engineer learning plan</h1><p class="lead">Track every topic, not just page visits. The full GenAI Mastery curriculum is planned for <strong>' + formatMinutes(DATA.totalMinutes, false) + '</strong> of focused learning and hands-on practice.</p><div class="tracker-stats"><div><strong>' + formatMinutes(snapshot.doneMinutes, false) + '</strong><span>completed</span></div><div><strong>' + formatMinutes(snapshot.remainingMinutes, false) + '</strong><span>remaining</span></div><div><strong>' + snapshot.doneTopics + ' / ' + snapshot.totalTopics + '</strong><span>topics covered</span></div></div></div>' +
      '</section>' +
      '<section class="study-target-card"><div><span class="study-target-kicker">Your minimum commitment</span><h2>Study 2–4 focused hours daily and reserve 8 hours for the weekend.</h2><p>At that pace, your remaining plan is approximately <strong>' + fastWeeks + '–' + steadyWeeks + ' weeks</strong>. Use the topic checkboxes below after you can explain the concept aloud or complete its practical task.</p></div><div class="study-target-badges"><span>Weekdays<br><b>2–4 h/day</b></span><span>Weekend<br><b>8 h</b></span></div></section>' +
      '<section><div class="tracker-section-head"><div><span class="tracker-kicker">Curriculum view</span><h2>Progress by track</h2></div></div><div class="track-progress-grid">' + tracks.map(function (row) {
        return '<div class="track-progress-card"><div><strong>' + row.track + '</strong><span>' + formatMinutes(row.done, false) + ' / ' + formatMinutes(row.total, false) + '</span></div><div class="track-progress-bar"><span style="width:' + row.percent + '%"></span></div><small>' + row.percent + '% complete</small></div>';
      }).join('') + '</div></section>' +
      '<section><div class="tracker-section-head"><div><span class="tracker-kicker">Topic checklist</span><h2>Modules and topics</h2><p>Open a module to see the ideal time for each section. Checking a topic here updates the same checkbox inside the lesson.</p></div><button type="button" class="btn ghost" data-expand-modules>Expand all</button></div><div class="tracker-module-list">' + snapshot.moduleRows.map(function (row) {
        var module = row.module;
        return '<details class="tracker-module"' + (row.percent > 0 && row.percent < 100 ? ' open' : '') + '><summary><span class="tracker-module-no">' + module.id + '</span><span class="tracker-module-title"><strong>' + module.title + '</strong><small>' + module.track + ' · ' + row.doneTopics + '/' + module.sections.length + ' topics</small></span><span class="tracker-module-time">' + formatMinutes(row.doneMinutes, false) + ' / ' + formatMinutes(module.minutes, false) + '</span><span class="tracker-module-pct">' + row.percent + '%</span></summary><div class="tracker-module-progress"><span style="width:' + row.percent + '%"></span></div><div class="tracker-topic-list">' + module.sections.map(function (section) {
          var checked = isTopicDone(module, section, snapshot.topics, snapshot.completed);
          return '<label class="tracker-topic' + (checked ? ' checked' : '') + '"><input type="checkbox" data-dashboard-topic="' + module.id + ':' + section.id + '"' + (checked ? ' checked' : '') + '><span class="tracker-topic-check" aria-hidden="true">' + (checked ? '✓' : '') + '</span><span class="tracker-topic-name">' + section.title + '</span><span class="tracker-topic-time">' + formatMinutes(section.minutes) + '</span></label>';
        }).join('') + '<a class="tracker-open-module" href="' + module.path + '">Open module ' + module.id + ' →</a></div></details>';
      }).join('') + '</div></section>' +
      '<section class="storage-card" id="storage"><div><span class="tracker-kicker">Progress storage</span><h2>Private in this browser by default</h2><p>This static Git-hosted build stores progress in <code>localStorage</code>. Each browser profile gets independent data, so multiple visitors do not overwrite one another. It does <strong>not</strong> sync across devices, private windows, cleared browser data, or different users sharing the same browser profile.</p><p>For account-based cross-device sync, connect this UI to an authenticated backend such as Supabase or Firebase. Git hosting alone cannot safely write personal progress back to the repository.</p></div><div class="storage-actions"><button type="button" class="btn" data-export-progress>Export backup</button><button type="button" class="btn ghost" data-import-progress>Import backup</button><button type="button" class="btn ghost danger-text" data-reset-study-progress>Reset progress</button><input type="file" accept="application/json" hidden data-import-file></div></section>';

    host.querySelectorAll("[data-dashboard-topic]").forEach(function (input) {
      input.addEventListener("change", function () {
        var parts = input.getAttribute("data-dashboard-topic").split(":");
        var module = DATA.modules.find(function (item) { return item.id === parts[0]; });
        var section = module && module.sections.find(function (item) { return item.id === parts.slice(1).join(":"); });
        if (module && section) saveTopicToggle(module, section);
        renderDashboard();
      });
    });

    var expand = host.querySelector("[data-expand-modules]");
    if (expand) expand.addEventListener("click", function () {
      var details = Array.prototype.slice.call(host.querySelectorAll(".tracker-module"));
      var shouldOpen = details.some(function (item) { return !item.open; });
      details.forEach(function (item) { item.open = shouldOpen; });
      expand.textContent = shouldOpen ? "Collapse all" : "Expand all";
    });

    var exportButton = host.querySelector("[data-export-progress]");
    if (exportButton) exportButton.addEventListener("click", function () {
      var payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        completedModules: moduleState(),
        completedTopics: topicState()
      };
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "genai-study-progress.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });

    var importButton = host.querySelector("[data-import-progress]");
    var importFile = host.querySelector("[data-import-file]");
    if (importButton && importFile) {
      importButton.addEventListener("click", function () { importFile.click(); });
      importFile.addEventListener("change", function () {
        var file = importFile.files && importFile.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var payload = JSON.parse(reader.result);
            if (!Array.isArray(payload.completedModules) || !payload.completedTopics || typeof payload.completedTopics !== "object") throw new Error("Invalid backup");
            writeJSON(MODULE_KEY, payload.completedModules);
            writeJSON(TOPIC_KEY, payload.completedTopics);
            renderDashboard();
          } catch (error) {
            window.alert("That file is not a valid GenAI study-progress backup.");
          }
          importFile.value = "";
        };
        reader.readAsText(file);
      });
    }

    var resetButton = host.querySelector("[data-reset-study-progress]");
    if (resetButton) resetButton.addEventListener("click", function () {
      if (!window.confirm("Reset all GenAI Mastery module and topic progress in this browser?")) return;
      try {
        localStorage.removeItem(MODULE_KEY);
        localStorage.removeItem(TOPIC_KEY);
      } catch (error) {}
      renderDashboard();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    insertModuleStudyGuide();
    renderDashboard();
  });
  window.addEventListener("storage", renderDashboard);
  window.addEventListener("genai-progress-change", function () {
    if (document.querySelector("[data-progress-dashboard]")) renderDashboard();
  });
})();
