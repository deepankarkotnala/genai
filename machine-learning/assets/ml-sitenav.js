/* =========================================================================
   Machine Learning Interview Portal — site navigation
   STANDALONE portal. This file is the ML portal's own navigation and is
   completely independent of the GenAI portal: it contains only the Machine
   Learning curriculum groups, and nothing outside this folder.

   This module owns the sidebar (.nav) and the portal search box. It builds
   from a central registry of GROUPS (the six curriculum Parts) → pages, each
   page path being relative to this portal's root. SITE_ROOT is resolved from
   this script's own URL as one level up from /assets/, so the ML portal root
   is this folder and the whole directory can be moved or deployed anywhere.

   app.js still handles theme, right-rail TOC, copy buttons and the mobile
   drawer — it defers sidebar building to this file via window.SiteNav.
   Pure vanilla JS, no deps, offline-safe.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- Central registry (paths are relative to the SITE ROOT) ---------- */
  var GROUPS = [
    {
      id: "mlcontents",
      label: "Contents",
      mark: "✦",
      blurb: "Curriculum map and study tracks",
      home: "index.html",
      direct: true,
      pages: [
        { path: "index.html", title: "Contents", num: "✦", kw: "machine learning ml interview preparation curriculum contents overview map classical algorithms supervised 2026 question bank study track sprint standard deep" }
      ]
    },
    {
      id: "mlparta",
      label: "Part A · Foundations",
      mark: "A",
      blurb: "Setup, math, data & validation",
      home: "00-interview-landscape.html",
      pages: [
        { path: "00-interview-landscape.html", title: "Interview Landscape & Setup", num: "00", track: "Foundations", kw: "ml interview landscape rounds role weighting data scientist ml engineer applied scientist answer ladder 30 second portfolio project brief environment setup why not llm tabular" },
        { path: "01-math-statistics.html", title: "Math & Statistics", num: "01", track: "Foundations", kw: "linear algebra dot product matrix eigenvalue covariance gradient chain rule convexity probability bayes theorem distributions expectation variance maximum likelihood mle map estimator bias p value confidence interval central limit theorem bootstrap simpson paradox correlation causation" },
        { path: "02-algorithm-taxonomy.html", title: "Algorithm Taxonomy", num: "02", track: "Foundations", kw: "supervised unsupervised reinforcement parametric non parametric discriminative generative instance based lazy eager linear non linear ensemble batch online no free lunch feature scaling which algorithms need scaling" },
        { path: "03-classification-vs-regression.html", title: "Classification vs Regression", num: "03", track: "Foundations", kw: "classification regression continuous categorical target binary multiclass multilabel ordinal quantile survival censoring threshold decision loss link function metric binning discretizing ranking" },
        { path: "04-data-prep-feature-engineering.html", title: "Data Prep & Feature Engineering", num: "04", track: "Data discipline", kw: "eda exploratory data analysis missing values mcar mar mnar imputation outliers winsorize scaling standardization skew log box cox categorical encoding one hot target encoding out of fold high cardinality datetime cyclical text tfidf interaction data leakage target temporal group duplicate pipeline columntransformer feature selection multicollinearity vif" },
        { path: "05-bias-variance-cross-validation.html", title: "Bias–Variance & Cross-Validation", num: "05", track: "Data discipline", kw: "generalization overfitting underfitting bias variance decomposition irreducible noise learning curve train validation test k fold stratified groupkfold timeseriessplit walk forward embargo nested cross validation regularization double descent reproducibility" }
      ]
    },
    {
      id: "mlpartb",
      label: "Part B · Linear Models",
      mark: "B",
      blurb: "Regression, log odds & optimization",
      home: "06-linear-regression.html",
      pages: [
        { path: "06-linear-regression.html", title: "Linear Regression", num: "06", track: "Linear models", kw: "ordinary least squares ols normal equation pseudo inverse svd gauss markov blue assumptions homoscedasticity heteroscedasticity normality residuals multicollinearity vif r squared adjusted negative coefficient interpretation polynomial huber ransac quantile regression" },
        { path: "07-logistic-regression-log-odds.html", title: "Logistic Regression & Log Odds", num: "07", track: "Linear models", kw: "logistic regression log odds logit sigmoid odds ratio why log odds canonical link bernoulli glm exponential family log loss binary cross entropy maximum likelihood derivation gradient convex hessian why not mse vanishing gradient perfect separation regularized C inverse softmax multinomial calibration platt scaling proper scoring rule lda gaussian shared covariance" },
        { path: "08-regularization.html", title: "Regularization", num: "08", track: "Linear models", kw: "ridge lasso elastic net l1 l2 penalty sparsity exact zeros geometric diamond corner subgradient soft thresholding coordinate descent svd shrinkage bayesian prior gaussian laplace map alpha lambda C regularization path standardize intercept early stopping dropout" },
        { path: "09-gradient-descent-optimization.html", title: "Gradient Descent & Optimization", num: "09", track: "Optimization", kw: "gradient descent batch stochastic sgd mini batch learning rate schedule warmup convex non convex saddle point condition number feature scaling momentum nesterov adagrad rmsprop adam adamw decoupled weight decay newton raphson lbfgs irls coordinate descent vanishing exploding gradient epoch iteration function space" }
      ]
    },
    {
      id: "mlpartc",
      label: "Part C · Evaluation",
      mark: "C",
      blurb: "Metrics, imbalance & baselines",
      home: "10-classification-metrics.html",
      pages: [
        { path: "10-classification-metrics.html", title: "Classification Metrics", num: "10", track: "Evaluation", kw: "confusion matrix true positive false positive precision recall sensitivity specificity accuracy paradox f1 harmonic mean f beta roc curve auc probabilistic interpretation precision recall curve pr auc average precision log loss brier score calibration reliability diagram platt isotonic mcc matthews cohen kappa balanced accuracy threshold cost matrix expected cost macro micro weighted ndcg precision at k" },
        { path: "11-regression-metrics.html", title: "Regression Metrics", num: "11", track: "Evaluation", kw: "mse rmse mae mape smape wape mase rmsle r squared huber quantile pinball loss conditional mean median quantile asymmetric cost over prediction under prediction residual analysis baseline seasonal naive" },
        { path: "12-imbalanced-data.html", title: "Imbalanced Data", num: "12", track: "Evaluation", kw: "class imbalance rare positive fraud class weight balanced scale pos weight focal loss smote borderline adasyn tomek links undersampling oversampling resampling inside fold imblearn pipeline leakage calibration distortion balanced random forest easyensemble threshold moving anomaly detection isolation forest two stage cascade" },
        { path: "13-knn-naive-bayes.html", title: "KNN, Naive Bayes & LDA", num: "13", track: "Baselines", kw: "k nearest neighbours lazy learning distance metric euclidean manhattan minkowski cosine curse of dimensionality distance concentration kd tree ball tree approximate nearest neighbour hnsw ivf naive bayes conditional independence gaussian multinomial bernoulli laplace smoothing zero frequency dirichlet prior linear discriminant analysis qda lda vs pca" }
      ]
    },
    {
      id: "mlpartd",
      label: "Part D · Trees & Ensembles",
      mark: "D",
      blurb: "Margins, trees, bagging & boosting",
      home: "14-svm-kernels.html",
      pages: [
        { path: "14-svm-kernels.html", title: "SVM & Kernels", num: "14", track: "Margins", kw: "support vector machine maximum margin hard soft margin slack variables hinge loss C parameter dual lagrange kernel trick mercer condition linear polynomial rbf gaussian gamma svr epsilon insensitive tube one vs one nystrom random fourier features platt scaling probability" },
        { path: "15-decision-trees.html", title: "Decision Trees", num: "15", track: "Trees", kw: "decision tree greedy recursive binary splitting gini impurity entropy information gain gain ratio cart id3 c45 variance reduction max depth min samples leaf pruning pre post cost complexity ccp alpha weakest link surrogate splits no scaling needed high variance axis aligned extrapolation feature importance bias" },
        { path: "16-bagging-random-forest.html", title: "Bagging & Random Forest", num: "16", track: "Ensembles", kw: "bootstrap aggregating bagging 63.2 percent out of bag oob error random forest max features sqrt decorrelation correlated variance identity rho extra trees extremely randomized bagging vs boosting parallel variance reduction feature importance mdi permutation importance" },
        { path: "17-boosting-gradient-boosting.html", title: "Boosting I: AdaBoost & GBM", num: "17", track: "Ensembles", kw: "boosting weak learner adaboost exponential loss sample reweighting alpha learner weight gradient boosting pseudo residuals negative gradient functional gradient descent shrinkage learning rate n estimators early stopping stochastic subsample shallow trees interaction order label noise sensitivity huber quantile poisson" },
        { path: "18-xgboost-lightgbm-catboost.html", title: "Boosting II: XGBoost & LightGBM", num: "18", track: "Ensembles", kw: "xgboost regularized objective second order taylor gradient hessian optimal leaf weight similarity score split gain gamma lambda min child weight sparsity aware missing default direction weighted quantile sketch histogram lightgbm leaf wise num leaves goss efb catboost ordered boosting prediction shift ordered target statistics oblivious symmetric trees tuning order tabular foundation model tabpfn" }
      ]
    },
    {
      id: "mlparte",
      label: "Part E · Unsupervised & Tuning",
      mark: "E",
      blurb: "Clustering, tuning & explainability",
      home: "19-clustering-dimensionality-reduction.html",
      pages: [
        { path: "19-clustering-dimensionality-reduction.html", title: "Clustering & Dimensionality Reduction", num: "19", track: "Unsupervised", kw: "k means within cluster sum of squares wcss elbow method silhouette score kmeans plus plus local optimum spherical voronoi hierarchical agglomerative dendrogram ward linkage dbscan hdbscan eps min samples density noise gaussian mixture model em algorithm soft assignment pca eigenvector covariance spectral theorem explained variance svd t-sne umap perplexity autoencoder isolation forest" },
        { path: "20-hyperparameter-tuning.html", title: "Hyperparameter Tuning", num: "20", track: "Model selection", kw: "hyperparameter grid search random search bergstra bengio bayesian optimization gaussian process surrogate acquisition expected improvement tpe optuna successive halving hyperband early stopping log uniform search space nested cross validation multiple comparisons tuning overfits one standard error mlflow experiment tracking" },
        { path: "21-interpretability-explainability.html", title: "Interpretability & Explainability", num: "21", track: "Model selection", kw: "interpretability explainability global local intrinsic post hoc gam ebm permutation importance shap shapley values additivity treeshap waterfall beeswarm lime partial dependence plot pdp ice counterfactual correlation causation monotonic constraints fairness demographic parity equal opportunity equalized odds impossibility model card eu ai act" }
      ]
    },
    {
      id: "mlpartf",
      label: "Part F · Production & Mocks",
      mark: "F",
      blurb: "Deployment, GenAI bridge & drills",
      home: "22-ml-system-design.html",
      pages: [
        { path: "22-ml-system-design.html", title: "ML System Design & Monitoring", num: "22", track: "Production", kw: "ml system design framework clarify frame baseline batch online inference latency budget feature store training serving skew retraining cadence model registry shadow deployment canary blue green a/b test rollback kill switch data drift covariate concept drift label shift psi population stability kolmogorov smirnov monitoring delayed labels feedback loop cost per prediction" },
        { path: "23-bridge-neural-networks-genai.html", title: "Bridge to Neural Nets & GenAI", num: "23", track: "Production", kw: "classical ml to deep learning bridge logistic regression one layer neural network softmax cross entropy mle llm pretraining next token representation learning benchmark contamination data leakage embeddings as features hybrid architecture rag retrieval knn vector search calibration when to use classical ml instead of llm" },
        { path: "24-mocks-revision.html", title: "Mocks & Revision", num: "24", track: "Revision", kw: "mock interview rapid fire 60 questions theory round applied case study coding round debugging round system design round cheat sheet formulas one liners 48 hour plan revision checklist churn precision at k uplift" }
      ]
    }
  ];

  /* ---------- Resolve the repository root from this script URL ---------- */
  // This makes navigation independent of the GitHub repository name. It works
  // at username.github.io/repository/, on a custom domain, and from local files.
  var navScript = document.currentScript;
  if (!navScript || !/\/sitenav\.js(?:[?#].*)?$/.test(navScript.src || "")) {
    var scripts = document.getElementsByTagName("script");
    for (var si = scripts.length - 1; si >= 0; si -= 1) {
      if (/\/sitenav\.js(?:[?#].*)?$/.test(scripts[si].src || "")) { navScript = scripts[si]; break; }
    }
  }
  var SITE_ROOT = navScript && navScript.src
    ? new URL("../", navScript.src)
    : new URL("./", document.baseURI);

  function pageURL(pagePath) { return new URL(pagePath, SITE_ROOT); }
  function href(pagePath) { return pageURL(pagePath).href; }
  function normalizedPath(pathname) {
    var p = decodeURIComponent(pathname || "").replace(/\\/g, "/");
    if (p.endsWith("/")) p += "index.html";
    return p.replace(/\/{2,}/g, "/");
  }

  var currentPath = normalizedPath(location.pathname);
  var current = null, currentGroup = null;
  function isCurrent(pagePath) {
    return currentPath === normalizedPath(pageURL(pagePath).pathname);
  }
  GROUPS.forEach(function (g) {
    g.pages.forEach(function (p) {
      if (isCurrent(p.path)) { current = p; currentGroup = g; }
    });
  });

  /* ---------- Build the grouped sidebar ---------- */
  function trackChunks(pages) {
    // group a section's pages by their optional `track`, preserving order
    var out = [], seen = {};
    pages.forEach(function (p) {
      var t = p.track || "";
      if (!seen[t]) { seen[t] = { track: t, items: [] }; out.push(seen[t]); }
      seen[t].items.push(p);
    });
    return out;
  }

  function buildSidebar() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var html = "";
    GROUPS.forEach(function (g) {
      var open = (g === currentGroup);
      if (g.direct) {
        html += '<div class="navgroup navgroup-direct' + (open ? " open" : "") + '" data-group="' + g.id + '">' +
                '<a class="navgroup-head" href="' + href(g.pages[0].path) + '">' +
                '<span class="ng-mk">' + g.mark + '</span>' +
                '<span class="ng-copy"><span class="ng-label">' + g.label + '</span><span class="ng-blurb">' + g.blurb + '</span></span>' +
                '</a></div>';
        return;
      }
      html += '<div class="navgroup' + (open ? " open" : "") + '" data-group="' + g.id + '">';
      html += '<button class="navgroup-head" aria-expanded="' + (open ? "true" : "false") + '">' +
                '<span class="ng-mk">' + g.mark + '</span>' +
                '<span class="ng-copy"><span class="ng-label">' + g.label + '</span><span class="ng-blurb">' + g.blurb + '</span></span>' +
                '<svg class="ng-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>' +
                '</button>';
      html += '<div class="navgroup-body">';
      trackChunks(g.pages).forEach(function (chunk) {
        if (chunk.track) html += '<div class="nav-track">' + chunk.track + '</div>';
        chunk.items.forEach(function (p) {
          var active = isCurrent(p.path) ? " active" : "";
          html += '<a class="nav-item' + active + '" href="' + href(p.path) + '">' +
                  '<span class="num">' + p.num + '</span><span class="nt">' + p.title + '</span></a>';
        });
      });
      html += '</div></div>';
    });
    nav.innerHTML = html;
    nav.classList.add("sitenav");

    // collapse/expand
    nav.querySelectorAll(".navgroup:not(.navgroup-direct) > .navgroup-head").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var grp = btn.closest(".navgroup");
        var nowOpen = grp.classList.toggle("open");
        btn.setAttribute("aria-expanded", nowOpen ? "true" : "false");
      });
    });

    // close mobile drawer when a link is chosen (app.js/portal-page.js read .app.nav-open)
    var app = document.querySelector(".app");
    if (app) nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { app.classList.remove("nav-open"); });
    });
  }

  /* ---------- Mobile drawer chrome ---------- */
  function buildMobileDrawerChrome() {
    var sidebar = document.querySelector(".sidebar");
    var brand = sidebar && sidebar.querySelector(".brand");
    if (!sidebar || !brand || sidebar.querySelector(".mobile-nav-intro")) return;

    var close = document.createElement("button");
    close.className = "mobile-nav-close";
    close.type = "button";
    close.setAttribute("aria-label", "Close navigation");
    close.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    brand.appendChild(close);

    var intro = document.createElement("section");
    intro.className = "mobile-nav-intro";
    var currentLabel = currentGroup ? currentGroup.label : "Switch job Learning Platform";
    var currentCount = currentGroup ? currentGroup.pages.length : GROUPS.length;
    var countLabel = currentGroup ? (currentCount + (currentCount === 1 ? " page" : " pages") + " in this path") : (currentCount + " learning paths");
    intro.innerHTML =
      '<span class="mobile-nav-eyebrow"><i></i> Learning workspace</span>' +
      '<strong>' + currentLabel + '</strong>' +
      '<p>Jump between focused lessons, labs and interview practice without losing your place.</p>' +
      '<div class="mobile-nav-meta"><span>' + countLabel + '</span><span>Search ready</span></div>';
    brand.insertAdjacentElement("afterend", intro);
  }

  /* ---------- Cross-site search (searches ALL groups) ---------- */
  function setupSearch() {
    var input = document.querySelector("[data-search]") || document.querySelector("[data-secsearch]");
    var out = document.querySelector(".search-results") || document.querySelector("[data-secresults]");
    if (!input || !out) return;
    input.placeholder = "Find chapter or topic…  ( / )";
    input.setAttribute("aria-label", "Find a chapter or topic");
    // flatten registry for searching, remembering each page's group label
    var index = [];
    GROUPS.forEach(function (g) {
      g.pages.forEach(function (p) { index.push({ p: p, group: g.label }); });
    });
    function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
    function render(q) {
      q = q.trim().toLowerCase();
      if (!q) { out.innerHTML = ""; return; }
      var hits = index.map(function (rec) {
        var hay = (rec.p.title + " " + rec.group + " " + (rec.p.kw || "")).toLowerCase();
        var score = 0;
        if (rec.p.title.toLowerCase().indexOf(q) > -1) score += 10;
        q.split(/\s+/).forEach(function (w) { if (w && hay.indexOf(w) > -1) score += 1; });
        return { rec: rec, score: score };
      }).filter(function (x) { return x.score > 0; })
        .sort(function (a, b) { return b.score - a.score; }).slice(0, 8);
      if (!hits.length) { out.innerHTML = '<div class="search-empty">No results for "' + q + '"</div>'; return; }
      out.innerHTML = hits.map(function (h) {
        var p = h.rec.p;
        var t = p.title.replace(new RegExp("(" + esc(q) + ")", "i"), "<b>$1</b>");
        return '<a class="search-result" href="' + href(p.path) + '">' +
               '<span class="sr-group">' + h.rec.group + '</span>' + t + "</a>";
      }).join("");
    }
    input.addEventListener("input", function (e) { render(e.target.value); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault(); input.focus();
      }
      if (e.key === "Escape") { input.blur(); out.innerHTML = ""; }
    });
  }

  /* ---------- Brand link → this section's home (or hub root) ---------- */
  function fixBrand() {
    var brandLink = document.querySelector(".brand a, a.brand");
    if (brandLink) brandLink.setAttribute("href", href("index.html"));
  }

  /* ---------- Footer credit (subtle, on every page) ---------- */
  function injectFooter() {
    var content = document.querySelector(".content");
    if (!content || content.querySelector(".site-footer")) return;
    var year = new Date().getFullYear();
    var f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML =
      '<span>© ' + year + ' Switch job</span>' +
      '<span class="sep">·</span>' +
      '<span>Developed by Deepankar Kotnala</span>';
    content.appendChild(f);
  }

  /* ---------- ☰ button: collapse the sidebar on desktop, open the drawer on
     mobile. The desktop collapse choice is remembered across pages/visits. ---- */
  var LS_SIDEBAR = "gp.sidebar";        // "collapsed" | "open"
  var MOBILE_BP = 860;                  // matches the CSS breakpoint

  function isMobile() { return window.matchMedia("(max-width: " + MOBILE_BP + "px)").matches; }

  function setupSidebarToggle() {
    var app = document.querySelector(".app");
    var menu = document.querySelector(".menu-btn");
    var sidebar = document.querySelector(".sidebar");
    var backdrop = document.querySelector(".backdrop");
    var close = document.querySelector(".mobile-nav-close");
    if (!app) return;

    function setMobileDrawer(open, restoreFocus) {
      open = Boolean(open && isMobile());
      app.classList.toggle("nav-open", open);
      document.body.classList.toggle("nav-drawer-open", open);
      if (menu) menu.setAttribute("aria-expanded", open ? "true" : "false");
      if (sidebar) {
        var hidden = !open && isMobile();
        sidebar.setAttribute("aria-hidden", hidden ? "true" : "false");
        sidebar.inert = hidden;
      }
      if (!open && restoreFocus && menu) menu.focus();
    }

    // Restore the saved desktop state (only affects desktop; mobile uses the drawer).
    try {
      if (localStorage.getItem(LS_SIDEBAR) === "collapsed") app.classList.add("sidebar-collapsed");
    } catch (e) {}

    if (sidebar && !sidebar.id) sidebar.id = "site-navigation";
    if (menu) {
      menu.setAttribute("aria-label", "Toggle navigation");
      menu.setAttribute("aria-controls", sidebar ? sidebar.id : "site-navigation");
      menu.setAttribute("aria-expanded", "false");
      menu.addEventListener("click", function () {
        if (isMobile()) {
          setMobileDrawer(!app.classList.contains("nav-open"));
        } else {
          var collapsed = app.classList.toggle("sidebar-collapsed");
          try { localStorage.setItem(LS_SIDEBAR, collapsed ? "collapsed" : "open"); } catch (e) {}
        }
      });
    }

    if (backdrop) backdrop.addEventListener("click", function () { setMobileDrawer(false); });
    if (close) close.addEventListener("click", function () { setMobileDrawer(false, true); });
    if (sidebar) sidebar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMobileDrawer(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && app.classList.contains("nav-open")) setMobileDrawer(false, true);
    });

    // Keep drawer state and accessibility attributes correct across the breakpoint.
    window.addEventListener("resize", function () {
      setMobileDrawer(isMobile() && app.classList.contains("nav-open"));
    });
    setMobileDrawer(false);
  }

  /* ---------- Resizable navigation drawer ----------
     The existing width is the minimum. Users can drag wider, shrink back to
     that baseline, use the arrow keys, or double-click the handle to reset. */
  var LS_SIDEBAR_WIDTH = "gp.sidebar.width";
  var LS_MOBILE_SIDEBAR_WIDTH = "gp.sidebar.mobile.width";
  var SIDEBAR_MAX_WIDTH = 480;
  var SIDEBAR_KEY_STEP = 16;

  function setupSidebarResize() {
    var app = document.querySelector(".app");
    var sidebar = document.querySelector(".sidebar");
    if (!app || !sidebar || app.querySelector(".sidebar-resizer")) return;

    var handle = document.createElement("div");
    handle.className = "sidebar-resizer";
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-orientation", "vertical");
    handle.setAttribute("aria-label", "Resize navigation drawer");
    handle.setAttribute("aria-controls", sidebar.id || "site-navigation");
    handle.setAttribute("title", "Drag to resize navigation. Double-click to reset.");
    handle.tabIndex = 0;
    app.appendChild(handle);

    function desktopMinimum() {
      // Mirrors the compact desktop --sidebar-w token in styles.css.
      return Math.round(Math.max(220, Math.min(252, window.innerWidth * 0.15)));
    }

    function mobileMinimum() {
      var ratio = window.innerWidth <= 430 ? 0.94 : 0.91;
      return Math.round(Math.min(window.innerWidth * ratio, 344));
    }

    var desktopCurrent = desktopMinimum();
    var mobileCurrent = mobileMinimum();
    var dragging = false;
    var startX = 0;
    var startWidth = 0;

    function activeMinimum() {
      return isMobile() ? mobileMinimum() : desktopMinimum();
    }

    function activeMaximum() {
      var minimum = activeMinimum();
      if (isMobile()) return Math.max(minimum, Math.floor(window.innerWidth * 0.98));
      // Keep a useful reading area even on smaller desktop windows.
      return Math.max(minimum, Math.min(SIDEBAR_MAX_WIDTH, window.innerWidth - 560));
    }

    function activeCurrent() {
      return isMobile() ? mobileCurrent : desktopCurrent;
    }

    function clamp(value) {
      return Math.max(activeMinimum(), Math.min(activeMaximum(), Math.round(value)));
    }

    function apply(value, persist) {
      var next = clamp(value);
      if (isMobile()) {
        mobileCurrent = next;
        document.documentElement.style.setProperty("--mobile-sidebar-w", next + "px");
        if (persist) {
          try { localStorage.setItem(LS_MOBILE_SIDEBAR_WIDTH, String(next)); } catch (e) {}
        }
      } else {
        desktopCurrent = next;
        document.documentElement.style.setProperty("--sidebar-w", next + "px");
        if (persist) {
          try { localStorage.setItem(LS_SIDEBAR_WIDTH, String(next)); } catch (e) {}
        }
      }
      handle.setAttribute("aria-valuemin", String(activeMinimum()));
      handle.setAttribute("aria-valuemax", String(activeMaximum()));
      handle.setAttribute("aria-valuenow", String(next));
      handle.setAttribute("aria-valuetext", next + " pixels wide");
    }

    try {
      var savedDesktop = parseInt(localStorage.getItem(LS_SIDEBAR_WIDTH), 10);
      var savedMobile = parseInt(localStorage.getItem(LS_MOBILE_SIDEBAR_WIDTH), 10);
      if (Number.isFinite(savedDesktop)) desktopCurrent = savedDesktop;
      if (Number.isFinite(savedMobile)) mobileCurrent = savedMobile;
    } catch (e) {}
    apply(activeCurrent(), false);

    handle.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startWidth = activeCurrent();
      handle.setPointerCapture(event.pointerId);
      document.body.classList.add("sidebar-resizing");
      event.preventDefault();
    });

    handle.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      apply(startWidth + event.clientX - startX, false);
    });

    function finishResize(event) {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove("sidebar-resizing");
      try { handle.releasePointerCapture(event.pointerId); } catch (e) {}
      apply(activeCurrent(), true);
    }

    handle.addEventListener("pointerup", finishResize);
    handle.addEventListener("pointercancel", finishResize);
    handle.addEventListener("dblclick", function () { apply(activeMinimum(), true); });
    handle.addEventListener("keydown", function (event) {
      var next = activeCurrent();
      if (event.key === "ArrowLeft") next -= SIDEBAR_KEY_STEP;
      else if (event.key === "ArrowRight") next += SIDEBAR_KEY_STEP;
      else if (event.key === "Home") next = activeMinimum();
      else if (event.key === "End") next = activeMaximum();
      else return;
      event.preventDefault();
      apply(next, true);
    });

    window.addEventListener("resize", function () {
      apply(activeCurrent(), false);
    });
  }

  /* ---------- Navigation feedback ----------
     There is no page transition any more (removed 2026-08-04; the reasoning is
     in styles.css). A click navigates immediately. What remains below is the
     slow-navigation loading ring and the link test that decides which clicks
     count as a same-site navigation worth arming it for. */
  var REDUCED_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function isPlainLeftClick(e) {
    return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  }

  function shouldIntercept(a, e) {
    if (!a || !isPlainLeftClick(e) || e.defaultPrevented) return false;
    if (a.target && a.target !== "" && a.target !== "_self") return false;   // new tab/window
    if (a.hasAttribute("download")) return false;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#") return false;                       // in-page anchor
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    // resolve to compare origin + path
    var url;
    try { url = new URL(a.href, location.href); } catch (e2) { return false; }
    if (url.origin !== location.origin) return false;                        // external site
    // same document (only the hash differs) → let the browser handle it
    if (url.pathname === location.pathname && url.search === location.search) return false;
    // only animate navigations to our own .html pages (or directory roots)
    if (!/\.html?$|\/$/.test(url.pathname)) return false;
    return url.href;
  }

  /* ---------- The loading ring ----------
     Ported from ../../assets/sitenav.js on 2026-08-04 so these pages behave
     like the rest of the portal. Shown only when a navigation is actually slow:
     the browser keeps painting the OLD document until the new one is ready, so
     the wait belongs to the page being left, which is why it lives here rather
     than in the arriving page's markup where it could only appear after the
     wait was over.

     GRACE is the whole design: on a warm cache a swap is tens of milliseconds,
     and a spinner that appears and vanishes inside that window is itself the
     flicker it is meant to remove. */
  var GRACE = 220;
  // A navigation the user abandons never fires pagehide, and the ring would
  // spin on a page that is going nowhere. It gives up rather than lying.
  var MAX_VISIBLE = 12000;
  var loaderTimer = null;
  var loaderGiveUp = null;
  var loaderEl = null;

  function buildLoader() {
    if (loaderEl) return loaderEl;
    loaderEl = document.createElement("div");
    loaderEl.className = "page-loader";
    loaderEl.setAttribute("role", "status");
    loaderEl.setAttribute("aria-live", "polite");
    loaderEl.innerHTML =
      '<svg width="30" height="30" viewBox="0 0 40 40" aria-hidden="true">' +
        '<circle class="pl-track" cx="20" cy="20" r="16" fill="none" stroke-width="3.5"/>' +
        '<circle class="pl-arc" cx="20" cy="20" r="16" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '</svg><span class="sr-only">Loading…</span>';
    document.body.appendChild(loaderEl);
    return loaderEl;
  }

  function armLoader() {
    clearTimeout(loaderTimer);
    loaderTimer = window.setTimeout(function () {
      buildLoader();
      // Same tick as the insert: the fade is a keyframe (styles.css), so it does
      // not need the element to have rendered a frame first. A page slow enough
      // to earn a spinner is a page whose frames may not be running.
      document.documentElement.classList.add("is-loading");
      loaderGiveUp = window.setTimeout(disarmLoader, MAX_VISIBLE);
    }, GRACE);
  }

  function disarmLoader() {
    clearTimeout(loaderTimer);
    clearTimeout(loaderGiveUp);
    document.documentElement.classList.remove("is-loading");
  }

  function setupPageTransitions() {
    /* Page transitions were removed on 2026-08-04 (see styles.css). This function
       keeps its name because init() calls it, and because what remains is still
       navigation-adjacent: arming the loading ring.

       No click is intercepted any more. The old code called preventDefault(),
       added `.is-leaving`, waited for a fade and then set location.href — that
       wait was pure latency in front of every navigation, on top of an animation
       that read as jitter. Now the browser navigates on the click, immediately,
       and the ring appears only if the new document takes longer than GRACE. */
    window.addEventListener("pagehide", disarmLoader);
    window.addEventListener("pageshow", function () {
      // Restored from the back/forward cache: never leave the ring spinning, and
      // clear the legacy leaving state in case a cached document still carries it.
      disarmLoader();
      document.documentElement.classList.remove("is-leaving");
    });

    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (shouldIntercept(a, e)) armLoader();
    });
  }

  function init() { buildSidebar(); buildMobileDrawerChrome(); setupSearch(); fixBrand(); injectFooter(); setupSidebarToggle(); setupSidebarResize(); setupPageTransitions(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // expose for debugging / other scripts
  window.SiteNav = { groups: GROUPS, href: href, current: current, currentGroup: currentGroup };
})();
