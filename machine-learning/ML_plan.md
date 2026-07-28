# Machine Learning — Interview Preparation Curriculum (2026)

A chronological, self-contained course covering classical machine learning end to end: the
algorithms, the mathematics behind them, the evaluation discipline, the production concerns, and
the interview questions that are actually being asked in 2026 loops.

Study it in order. Every module assumes the ones before it.

---

## 0. How to use this document

### 0.1 Structure of every module

| Part | What it gives you |
|---|---|
| **Header table** | Prerequisites, study time, which interview rounds the topic shows up in |
| **What to learn** | The numbered concept list — your checklist for the module |
| **Core intuitions** | The mental models interviewers probe, in plain language |
| **Whiteboard formulas** | What you must be able to derive or write from memory |
| **Gotchas that fail candidates** | The specific mistakes that end interviews |
| **Hands-on drill** | A concrete coding/analysis task to cement the module |
| **2026 interview questions** | Questions with model answers, what's being tested, and follow-ups |

### 0.2 How to actually study a module

1. Read **What to learn** first and treat it as a checklist, not prose.
2. Read **Core intuitions**. If you cannot re-explain each one out loud in your own words in under
   60 seconds, you have not learned it.
3. Write the **Whiteboard formulas** from memory on paper. Not typing — paper. Interviews are verbal
   and visual, and recall under mild stress is a different skill from recognition.
4. Do the **Hands-on drill**. Never skip this. Interviewers can tell within two questions who has
   trained a model and who has only read about training a model.
5. Attempt every **interview question** *before* reading the answer. Say the answer aloud.
6. Re-read the answer, then compress it into a 30-second version. Most 2026 interview questions are
   answered in 30–60 seconds, then deepened by follow-ups.

### 0.3 Suggested pacing

| Track | Duration | Daily commitment | Coverage |
|---|---|---|---|
| **Sprint** | 3 weeks | 4–5 h | Modules 00–18, 24 (algorithms + metrics, skip depth) |
| **Standard** | 8 weeks | 2 h | All modules, all drills |
| **Deep** | 14 weeks | 2 h | All modules + derivations from scratch + 2 portfolio projects |

If you have an interview in under a week, jump to **Module 24 — Mock Interview Drills**, work the
rapid-fire bank, and use the failure pattern to decide which earlier module to revisit.

### 0.4 A guardrail on "2026 interview questions"

The questions in this document are **representative and curated**: they reflect the concepts,
phrasings and follow-up patterns that dominate machine-learning interview loops in the 2025–2026
hiring cycle. They are grouped by topic and tagged by round type.

They are **not** claims that a named company asks a specific question. Treat any source — including
this one — that tells you "Company X asks exactly this" with suspicion. What transfers between
companies is the *concept being tested* and the *shape of the follow-up*, not the wording.

### 0.5 What changed in ML interviews by 2026

Worth internalizing before you start, because it changes how you should answer:

1. **Fundamentals got harder, not easier.** Because LLMs can produce working `sklearn` code
   instantly, interviewers stopped rewarding syntax recall and moved toward *reasoning*: why this
   model, why this loss, why this metric, why this split, what breaks in production. Nearly every
   question below is a "why" question.
2. **Tabular problems are still classical ML problems.** Gradient-boosted trees remain the default
   strong baseline for tabular data. Expect to be asked to justify *not* reaching for a neural
   network or an LLM.
3. **"Why not just use an LLM?" is now a standard question.** You need a crisp, non-defensive
   answer covering cost, latency, determinism, calibration, auditability and data volume.
4. **Evaluation and data quality outweigh algorithm trivia.** Leakage, split design, drift,
   label noise and metric selection are now the highest-yield topics in the loop. A candidate who
   spots leakage beats a candidate who recites the XGBoost gain formula.
5. **Deployment literacy is assumed for all levels.** Training/serving skew, feature stores,
   monitoring, retraining cadence and rollback appear even in junior loops.
6. **Interpretability and fairness moved from "nice to have" to compliance.** With regulation such
   as the EU AI Act phasing in high-risk-system obligations through 2026, expect questions on
   explainability, documentation and bias auditing in any regulated domain.
7. **You are expected to use AI tools well, and to know when they are wrong.** Some loops now
   include an assisted-coding round where the evaluation is your review and correction of generated
   ML code, not your ability to type it.

### 0.6 Round types used as tags in this document

| Tag | Round |
|---|---|
| `[THEORY]` | Conceptual / whiteboard ML fundamentals |
| `[MATH]` | Derivation or statistics |
| `[CODE]` | Live coding or notebook |
| `[APPLIED]` | Case study / take-home discussion |
| `[DESIGN]` | ML system design |
| `[DEBUG]` | "Here is a broken model, diagnose it" |
| `[TRAP]` | Question with a common wrong answer |

---

## 1. Curriculum map

Chronological order. Do not reorder — the dependency chain is real.

| # | Module | Core question it answers | Time |
|---:|---|---|---|
| 00 | ML Interview Landscape & Study Setup | What am I being evaluated on? | 2 h |
| 01 | Math & Statistics Prerequisites | What math do I actually need? | 8 h |
| 02 | The ML Landscape & Algorithm Taxonomy | What kinds of algorithms exist and why? | 4 h |
| 03 | Classification vs Regression | How does the target type change everything? | 4 h |
| 04 | Data Preparation, EDA & Feature Engineering | How do I get from raw data to a matrix? | 10 h |
| 05 | Bias–Variance, Overfitting, Splits & Cross-Validation | Why does my model fail on new data? | 8 h |
| 06 | Linear Regression | What is the simplest learner, done rigorously? | 8 h |
| 07 | Logistic Regression & Log Odds | Why log odds? | 10 h |
| 08 | Regularization — Ridge, Lasso, Elastic Net | How do I control complexity? | 6 h |
| 09 | Gradient Descent & Optimization | How do models actually learn? | 8 h |
| 10 | Classification Metrics & the Confusion Matrix | How do I know it works? | 10 h |
| 11 | Regression Metrics | Which error measure, and why? | 4 h |
| 12 | Imbalanced Data | What if 0.1% of rows are positive? | 6 h |
| 13 | KNN, Naive Bayes & Discriminant Analysis | What do the simple non-linear baselines teach? | 6 h |
| 14 | Support Vector Machines & Kernels | What is a margin, and what is the kernel trick? | 8 h |
| 15 | Decision Trees | How does a model split space? | 8 h |
| 16 | Bagging & Random Forest | How do I average away variance? | 6 h |
| 17 | Boosting I — AdaBoost & Gradient Boosting | How do I reduce bias sequentially? | 8 h |
| 18 | Boosting II — XGBoost, LightGBM, CatBoost | Why do these win tabular competitions? | 10 h |
| 19 | Unsupervised Learning — Clustering & Dimensionality Reduction | What if there are no labels? | 8 h |
| 20 | Hyperparameter Tuning & Model Selection | How do I search without fooling myself? | 6 h |
| 21 | Interpretability & Explainability | Why did the model say that? | 6 h |
| 22 | ML System Design, Deployment, Drift & Monitoring | How does this survive in production? | 10 h |
| 23 | Bridge — Classical ML → Neural Networks → GenAI | Where does the rest of this portal connect? | 4 h |
| 24 | Mock Interview Drills & Revision | Can I perform, not just know? | 10 h |

**Total: roughly 180 hours** for the Standard track including drills.

### 1.1 Dependency graph

```text
01 Math ──┬─> 06 Linear Reg ──> 07 Logistic Reg ──> 08 Regularization
          │        │                   │
          │        └───────────────────┴──> 09 Gradient Descent ──> (23 Neural Nets)
          │
02 Taxonomy ─> 03 Class vs Reg ─> 04 Data Prep ─> 05 Bias-Variance
                                       │              │
                                       │              └─> 20 Tuning
                                       │
                    10 Class Metrics ──┴──> 11 Reg Metrics ──> 12 Imbalance
                                       │
13 KNN/NB ─> 14 SVM ─> 15 Trees ─> 16 Random Forest ─> 17 Boosting ─> 18 XGB/LGBM/Cat
                                                                          │
19 Unsupervised ──> 21 Interpretability ──> 22 System Design ──> 23 Bridge ──> 24 Mocks
```

### 1.2 The 12 things that get candidates rejected

Print this. Re-read it before every interview.

1. Cannot explain **why log odds** beyond "because sigmoid".
2. Confuses **precision and recall**, or cannot pick between them for a stated business cost.
3. Reports **accuracy** on an imbalanced problem without flagging the problem.
4. **Scales or imputes before splitting**, leaking test information into training.
5. Cannot explain the **bias–variance** consequence of a hyperparameter they just named.
6. Says **"Random Forest is boosting"** or otherwise mixes up bagging and boosting.
7. Cannot state what **gradient boosting fits each tree to** (the negative gradient / pseudo-residuals).
8. Uses **random K-fold on time-series** data.
9. Treats **feature importance as causal**.
10. Cannot name a single thing that **breaks after deployment**.
11. Gives a **memorized answer that does not match the asked question** — the single most common
    failure in 2026 loops, because rehearsed answers are now easy to spot.
12. Never asks a **clarifying question** in an applied or design round.

---

# Part A — Foundations

## Module 00 — ML Interview Landscape & Study Setup

| | |
|---|---|
| **Prerequisites** | None |
| **Study time** | 2 h |
| **Why it's in the loop** | It isn't. This module makes the other 24 efficient. |
| **Rounds** | — |

### 00.1 What to learn

1. The five round types in a 2026 ML loop and what each one scores.
2. The difference between a **Data Scientist**, **ML Engineer**, **Applied Scientist** and
   **AI/GenAI Engineer** loop — they weight these modules very differently.
3. How to structure a spoken technical answer (the 30-second → 2-minute → whiteboard ladder).
4. What your environment should be: Python 3.11+, `numpy`, `pandas`, `scikit-learn`, `xgboost`,
   `lightgbm`, `shap`, `matplotlib`, JupyterLab.
5. How to build a two-project portfolio that survives cross-examination.

### 00.2 Role weighting

| Module cluster | Data Scientist | ML Engineer | Applied Scientist | AI/GenAI Engineer |
|---|---|---|---|---|
| Math & stats (01) | High | Medium | Very high | Medium |
| Data prep & EDA (04) | Very high | High | Medium | Medium |
| Linear/logistic (06–08) | Very high | High | High | Medium |
| Optimization (09) | Medium | High | Very high | High |
| Metrics & imbalance (10–12) | Very high | High | High | High |
| Trees & boosting (15–18) | Very high | Very high | High | Low |
| System design & MLOps (22) | Medium | Very high | Medium | Very high |
| DL/GenAI bridge (23) | Low | Medium | High | Very high |

### 00.3 The answer ladder

Every conceptual question should be answered in three escalating layers. Give layer 1, then stop and
read the interviewer.

- **Layer 1 (30 s)** — the direct answer, one sentence of mechanism, one sentence of consequence.
- **Layer 2 (2 min)** — the mechanism properly: formula, tradeoff, when it breaks.
- **Layer 3 (whiteboard)** — the derivation or a worked numeric example.

Worked example for "What is regularization?":

> **L1:** "It's a penalty on model complexity added to the loss, so the optimizer trades a little
> training fit for better generalization."
> **L2:** "Concretely, minimize loss + λ·penalty. L2 shrinks all coefficients smoothly and handles
> correlated features; L1 drives some to exactly zero, giving feature selection. λ moves you along
> the bias–variance curve — larger λ, more bias, less variance."
> **L3:** Write the ridge closed form, show the `(XᵀX + λI)` term is always invertible, and sketch
> the constraint-region diagram explaining why L1's corners produce sparsity.

### 00.4 Gotchas that fail candidates

- **Answering layer 3 to a layer 1 question.** Reads as poor communication and eats your time.
- **Not asking what the business cares about** in an applied round.
- **A portfolio project you cannot defend.** If you cannot say why you chose that metric and what
  the baseline was, the project is a liability, not an asset.

### 00.5 Hands-on drill

Write a one-page brief for each of your two portfolio projects containing exactly: the business
objective, the target definition, the baseline, the chosen metric and *why*, the split strategy, the
final number vs baseline, the biggest weakness, and what you would do with two more weeks. If you
cannot fill every field, the project is not interview-ready.

### 00.6 2026 interview questions

**Q1 `[APPLIED]` — Walk me through an ML project you owned end to end.**

**Answer.** Use a fixed skeleton so you never ramble: *Problem and business metric → data and its
problems → target definition → baseline → why this model class → evaluation design → result vs
baseline → what shipped → what you'd change.* Keep it to 3 minutes and land on a quantified delta
against a stated baseline. Volunteer one genuine weakness before being asked; it converts a
cross-examination into a discussion.

*What's being tested:* Ownership, structured communication, whether you measured against a baseline
at all. Most candidates fail here by describing the model and never the problem.

*Follow-up:* "What was your baseline?" — If your answer is "we didn't have one," you have already
lost the round. Every project has a baseline: the current process, the majority class, or last
month's average.

---

**Q2 `[APPLIED]` `[TRAP]` — This is a tabular churn prediction problem. Why not just use an LLM?**

**Answer.** Frame it as fitness for purpose, not as skepticism. Tabular supervised learning with
plentiful labels is the regime where gradient-boosted trees dominate: they learn from the actual
label distribution, produce calibrated-ish scores you can threshold against a business cost, cost
microseconds per prediction, are deterministic and auditable, and retrain in minutes. An LLM has no
access to your historical label signal beyond what fits in a prompt, costs orders of magnitude more
per prediction, adds latency, and gives you poorly calibrated confidence. Then state where the LLM
*does* earn its place: turning unstructured columns (support tickets, call transcripts, free-text
notes) into embeddings or extracted features that feed the tree model, and generating candidate
feature hypotheses for a human to validate.

*What's being tested:* Judgment and resistance to hype. Interviewers in 2026 use this to separate
engineers who choose tools from engineers who follow trends.

*Follow-up:* "When would you flip to a neural approach?" — Very high-cardinality categorical
interactions, genuinely multimodal inputs, transfer learning from a large pretrained model, or a
target with little tabular signal but rich text/image signal.

---

**Q3 `[THEORY]` — How do you keep learning in a field moving this fast?**

**Answer.** Name a concrete mechanism, not a sentiment. Something like: a fixed weekly slot for one
paper plus one reimplementation from scratch; following 3–4 primary sources rather than aggregators;
reproducing a competition solution per quarter. Then give a specific recent example of something you
learned and what you concluded about *when it does and does not apply.*

*What's being tested:* Whether you have a process. Vague enthusiasm scores zero.

---

## Module 01 — Math & Statistics Prerequisites

| | |
|---|---|
| **Prerequisites** | High-school algebra |
| **Study time** | 8 h |
| **Why it's in the loop** | Every derivation question, and the whole of Modules 06–09 |
| **Rounds** | `[MATH]` `[THEORY]` |

You do not need a maths degree. You need fluency in a small, specific set of ideas. This module is
the minimum set that unlocks everything else.

### 01.1 What to learn

**Linear algebra**
1. Vectors, dot product, and its geometric meaning (projection, similarity, angle).
2. Matrices as linear maps; matrix multiplication as composition.
3. The design matrix `X` (n × d): rows are samples, columns are features. Internalize this shape.
4. Transpose, inverse, rank, singularity, and what "`XᵀX` is not invertible" means practically.
5. Norms: L1, L2, L∞ — and their shapes as constraint regions.
6. Eigenvalues, eigenvectors, and the covariance matrix (this *is* PCA).
7. Condition number — why badly scaled features make optimization slow.

**Calculus**
8. Derivative as slope; partial derivative; the gradient as the direction of steepest ascent.
9. Chain rule (this *is* backpropagation).
10. Convexity, and why it guarantees a unique global minimum.
11. Setting the gradient to zero to find an optimum (this *is* the normal equation).

**Probability**
12. Random variables, expectation, variance, covariance, correlation.
13. Conditional probability, joint probability, independence.
14. Bayes' theorem and how to state it in words.
15. Key distributions: Bernoulli, Binomial, Normal, Poisson, Exponential, Uniform.
16. Central Limit Theorem and Law of Large Numbers — what each actually claims.
17. Maximum Likelihood Estimation (MLE). **This is the single highest-leverage statistical concept
    for ML interviews** — it generates MSE, log-loss, and most other losses you'll ever use.
18. MAP estimation and its equivalence to regularized MLE.

**Statistics & inference**
19. Population vs sample; estimator, bias of an estimator, standard error.
20. Confidence intervals — and the correct interpretation.
21. Hypothesis testing, p-values, Type I/II error, statistical power.
22. Bootstrapping and permutation tests (more useful in practice than most parametric tests).
23. Simpson's paradox, selection bias, survivorship bias.
24. Correlation vs causation; confounders; the basics of A/B testing.

### 01.2 Core intuitions

**Everything is a dot product.** A linear model's prediction is `w·x`. Cosine similarity is a
normalized dot product. Attention scores are dot products. If dot products feel abstract, everything
downstream feels abstract.

**Gradient = "which way is uphill, and how steep."** Training is repeatedly stepping downhill on a
loss surface. That's it.

**MLE is the loss factory.** Pick a probability model for your data, write down the likelihood of the
observed data under it, take the negative log, and you have derived a loss function:

- Assume Gaussian noise around a linear prediction → you get **squared error**.
- Assume Bernoulli outcomes with a sigmoid probability → you get **log-loss / cross-entropy**.
- Assume Laplace noise → you get **absolute error**.

This one insight answers a whole family of "why this loss?" questions.

**Regularization is a prior.** Maximizing the posterior (MAP) instead of the likelihood adds a term
from your prior belief about the parameters. A Gaussian prior on weights gives L2/ridge; a Laplace
prior gives L1/lasso. Regularization isn't a hack — it's Bayesian inference in disguise.

**Covariance is the object PCA diagonalizes.** PCA finds the eigenvectors of the covariance matrix;
they are the directions of maximum variance, and they're orthogonal because the covariance matrix is
symmetric.

### 01.3 Whiteboard formulas

```text
Dot product          a·b = Σ aᵢbᵢ = |a||b|cosθ

Expectation          E[X]   = Σ x·P(x)          (discrete)
Variance             Var(X) = E[(X-μ)²] = E[X²] - (E[X])²
Covariance           Cov(X,Y) = E[(X-μx)(Y-μy)]
Correlation          ρ = Cov(X,Y) / (σx·σy)          ∈ [-1, 1]

Bayes                P(A|B) = P(B|A)·P(A) / P(B)

Likelihood           L(θ) = ∏ᵢ p(xᵢ | θ)
Log-likelihood       ℓ(θ) = Σᵢ log p(xᵢ | θ)
MLE                  θ̂ = argmax_θ ℓ(θ)
MAP                  θ̂ = argmax_θ [ ℓ(θ) + log p(θ) ]     ← the regularizer

Gaussian pdf         p(x) = (1/√(2πσ²))·exp(-(x-μ)²/(2σ²))
Sigmoid              σ(z) = 1/(1+e^(-z));   σ'(z) = σ(z)(1-σ(z))
Softmax              softmax(z)ᵢ = e^(zᵢ) / Σⱼ e^(zⱼ)

Standard error       SE = σ/√n
95% CI (approx)      x̄ ± 1.96·SE
```

### 01.4 Gotchas that fail candidates

- **Misinterpreting a p-value.** It is *not* the probability the null hypothesis is true. It is the
  probability of observing data at least this extreme *if* the null were true.
- **Misinterpreting a confidence interval.** A 95% CI does not mean "95% probability the true
  parameter is in this interval." It means the procedure captures the true parameter 95% of the time
  across repeated samples.
- **Confusing CLT with "data becomes normal."** The CLT is about the distribution of the *sample
  mean*, not about your raw data.
- **Saying zero correlation implies independence.** It doesn't — only the converse holds. Pearson
  correlation only detects *linear* dependence; `y = x²` on symmetric `x` has ρ ≈ 0.
- **Not being able to state what `XᵀX` singular means.** It means perfectly collinear features (or
  more features than samples), so the normal equation has no unique solution.

### 01.5 Hands-on drill

In pure `numpy`, no `sklearn`:
1. Implement `mean`, `variance`, `covariance matrix` from scratch and verify against numpy.
2. Sample 10,000 means of 30 draws from an exponential distribution; plot the histogram; watch the
   CLT happen.
3. Implement a bootstrap 95% CI for the median of a skewed sample.
4. Derive on paper: starting from a Gaussian likelihood, show that maximizing it is equivalent to
   minimizing squared error. Do the same for Bernoulli → log-loss. These two derivations appear
   directly in Modules 06 and 07.

### 01.6 2026 interview questions

**Q1 `[MATH]` — Explain maximum likelihood estimation, and derive a loss function with it.**

**Answer.** MLE chooses the parameters that make the observed data most probable under an assumed
model. Write the likelihood `L(θ) = ∏ p(xᵢ|θ)`, take the log to turn the product into a sum (same
argmax, numerically stable), and maximize — equivalently minimize the negative log-likelihood.
Derivation: assume `yᵢ = w·xᵢ + εᵢ` with `εᵢ ~ N(0, σ²)`. Then
`p(yᵢ|xᵢ,w) = (1/√(2πσ²))·exp(-(yᵢ - w·xᵢ)²/(2σ²))`. The log-likelihood is
`-n/2·log(2πσ²) - (1/2σ²)·Σ(yᵢ - w·xᵢ)²`. The first term is constant in `w`, so maximizing the
log-likelihood is exactly minimizing `Σ(yᵢ - w·xᵢ)²` — mean squared error. **MSE is not an arbitrary
choice; it is the MLE under Gaussian noise.**

*What's being tested:* Whether you understand that loss functions come from probabilistic
assumptions. This is the single most reusable derivation in ML interviews.

*Follow-up:* "So what does using MSE assume about your errors?" — Additive, zero-mean, constant-
variance, Gaussian noise. If your errors are heavy-tailed, MSE over-weights outliers, and MAE (the
Laplace-noise MLE) or Huber loss is more appropriate.

---

**Q2 `[MATH]` `[TRAP]` — What does a p-value of 0.03 mean?**

**Answer.** If the null hypothesis were true, there is a 3% probability of observing a test statistic
at least as extreme as the one observed. It is a statement about data given a hypothesis, **not**
about the probability of the hypothesis given data, and not a measure of effect size. A 0.03 p-value
on a huge sample can accompany a business-irrelevant effect.

*What's being tested:* The most common statistical misconception in the industry. Getting this right
is a strong positive signal.

*Follow-up:* "You ran 20 independent tests and one came back at p = 0.04. What do you conclude?" —
Essentially nothing; at α = 0.05 you expect roughly one false positive in 20 by construction. Apply
a multiple-comparison correction (Bonferroni for strict control, Benjamini–Hochberg for FDR) or
pre-register a single primary metric.

---

**Q3 `[MATH]` — State Bayes' theorem and apply it. A disease affects 1 in 1,000 people. A test has
99% sensitivity and 95% specificity. Your test is positive. What is the probability you have it?**

**Answer.** `P(D|+) = P(+|D)P(D) / P(+)`. Prior `P(D) = 0.001`. `P(+|D) = 0.99`, so the true-positive
mass is `0.001 × 0.99 = 0.00099`. False-positive rate is `1 - 0.95 = 0.05`, so the false-positive
mass is `0.999 × 0.05 = 0.04995`. Then
`P(D|+) = 0.00099 / (0.00099 + 0.04995) ≈ 0.0194`, about **1.9%**. Despite a "99% accurate" test, a
positive result means under a 2% chance of disease, because the prior is so small that false
positives from the huge healthy population swamp the true positives.

*What's being tested:* Base-rate reasoning. This is exactly the arithmetic behind why precision
collapses on imbalanced problems (Module 12) — the same computation, different vocabulary.

*Follow-up:* "Connect this to a fraud model." — Precision on a rare positive class is bounded by the
base rate. A model with excellent recall and a plausible false-positive rate can still produce a
majority-false-positive alert queue.

---

**Q4 `[MATH]` — Does zero correlation imply independence?**

**Answer.** No. Independence implies zero correlation, but not the reverse. Pearson correlation
measures only *linear* association. Take `x ~ Uniform(-1,1)` and `y = x²`: they are perfectly
dependent yet have correlation ≈ 0. The exception is the joint Gaussian case, where zero correlation
does imply independence.

*What's being tested:* Whether you know the limits of your default diagnostic tool. Practical
consequence: dropping features by correlation-with-target screening silently discards non-linear
predictors.

*Follow-up:* "How would you detect non-linear dependence?" — Mutual information, Spearman rank
correlation for monotone non-linearity, distance correlation, or just fit a shallow tree and look at
its gain.

---

**Q5 `[MATH]` — What is the bias of an estimator, and give an example of a biased one.**

**Answer.** Bias is `E[θ̂] - θ`: the systematic error of the estimation procedure across repeated
samples. The maximum-likelihood variance estimator dividing by `n` is biased downward; dividing by
`n-1` (Bessel's correction) is unbiased, because one degree of freedom is consumed estimating the
mean. Note that unbiasedness is not automatically desirable — ridge regression is deliberately
biased in exchange for a large variance reduction, and often has lower total error.

*What's being tested:* Setup for the bias–variance decomposition in Module 05. The "biased can be
better" point is the part that distinguishes a strong answer.

---

**Q6 `[APPLIED]` — Explain Simpson's paradox with a case where it would change your decision.**

**Answer.** A trend present in every subgroup can reverse when the subgroups are aggregated, because
group membership confounds the comparison. Classic case: treatment A appears better than B overall,
but B is better within both mild and severe patient cohorts — because B was disproportionately given
to severe cases. Decision impact: an aggregate A/B readout showing variant B winning can be entirely
driven by a shift in traffic mix (e.g. more mobile users landing in one arm), so you must check
per-segment results and randomization balance before shipping.

*What's being tested:* Confounding awareness — the core skill in any experimentation-adjacent role.

*Follow-up:* "How do you protect against it?" — Randomize properly, pre-register segments, check
covariate balance across arms, and use stratified or CUPED-style variance reduction.

---

## Module 02 — The ML Landscape & Algorithm Taxonomy

| | |
|---|---|
| **Prerequisites** | Module 01 |
| **Study time** | 4 h |
| **Why it's in the loop** | Opening questions; algorithm-selection questions in every applied round |
| **Rounds** | `[THEORY]` `[APPLIED]` |

### 02.1 What to learn

1. What "learning from data" formally means: hypothesis space, loss function, optimization,
   generalization. Every algorithm in this course is a choice of those four things.
2. Supervised vs unsupervised vs semi-supervised vs self-supervised vs reinforcement learning.
3. Parametric vs non-parametric models.
4. Discriminative vs generative models.
5. Instance-based (lazy) vs model-based (eager) learners.
6. Linear vs non-linear decision boundaries.
7. Single models vs ensembles (bagging, boosting, stacking, voting).
8. Batch vs online/incremental learning.
9. The **No Free Lunch theorem** and what it does and does not license you to say.
10. The taxonomy as a decision tool: given a problem description, name two candidate model families
    and justify them in 30 seconds.

### 02.2 Core intuitions

**Every supervised algorithm is three choices.** (1) What functions am I willing to consider — the
hypothesis space. (2) How do I score a candidate — the loss. (3) How do I search — the optimizer.
Linear regression: linear functions, squared error, normal equation or gradient descent. A decision
tree: axis-aligned piecewise-constant functions, impurity reduction, greedy recursive splitting.
Answering "compare algorithm A and B" via these three axes always produces a structured answer.

**Parametric vs non-parametric is about whether model size grows with data.** Linear regression has
`d+1` parameters whether you have 100 rows or 100 million — parametric. KNN stores the entire
training set, so its "model" grows with `n` — non-parametric. Non-parametric models are more
flexible and hungrier for data; parametric models impose structure and are more sample-efficient
when that structure is roughly right.

**Discriminative models learn `P(y|x)`; generative models learn `P(x,y)`.** Logistic regression,
SVM, trees and boosting are discriminative — they only ever model the boundary. Naive Bayes, GDA and
GMMs are generative — they model how the data was produced, which lets them generate samples, handle
missing features more gracefully, and often perform better in very small-sample regimes.
Discriminative models usually win at pure classification accuracy given enough data, because they
spend all their capacity on the thing you're scored on.

**No Free Lunch, stated honestly.** Averaged over *all possible* problems, no algorithm beats any
other. This does not mean "all models are equally good on your data" — real problems have structure
(smoothness, sparsity, low intrinsic dimension), and some inductive biases match that structure far
better than others. That's why gradient-boosted trees beat everything on tabular data so
consistently: axis-aligned splits and additive structure match how tabular data is actually
generated. Use NFL to justify *empirical comparison*, never to dodge a model-selection question.

### 02.3 The taxonomy table

| Algorithm | Type | Parametric? | Discriminative? | Boundary | Scaling needed? | Handles missing? |
|---|---|---|---|---|---|---|
| Linear Regression | Supervised, reg | Yes | Discriminative | Linear | Helps (for GD) | No |
| Logistic Regression | Supervised, clf | Yes | Discriminative | Linear | Helps | No |
| KNN | Supervised, both | No | — (instance) | Non-linear | **Critical** | No |
| Naive Bayes | Supervised, clf | Yes | **Generative** | Linear (in log space) | No | Partially |
| SVM (linear) | Supervised, clf | Yes | Discriminative | Linear | **Critical** | No |
| SVM (RBF) | Supervised, clf | Semi | Discriminative | Non-linear | **Critical** | No |
| Decision Tree | Supervised, both | No | Discriminative | Axis-aligned | **No** | Some impls |
| Random Forest | Ensemble (bagging) | No | Discriminative | Axis-aligned | **No** | Some impls |
| Gradient Boosting | Ensemble (boosting) | No | Discriminative | Axis-aligned | **No** | XGB/LGBM yes |
| K-Means | Unsupervised | Semi | — | Spherical | **Critical** | No |
| PCA | Unsupervised | — | — | Linear | **Critical** | No |
| Neural Network | Supervised, both | Yes | Usually discrim. | Non-linear | **Critical** | No |

Memorize the last three columns. "Does this need scaling?" and "does this handle missing values?"
are asked constantly and cheap to get right.

### 02.4 Gotchas that fail candidates

- **Calling Random Forest a boosting method** — or describing boosting as "many trees in parallel."
- **Claiming trees need feature scaling.** They don't; splits are threshold comparisons within a
  single feature, and any monotone rescaling produces the same tree.
- **Calling logistic regression non-linear** because of the sigmoid. It is linear in the log-odds;
  the decision boundary is a hyperplane.
- **Using No Free Lunch to avoid committing** to a model choice. Interviewers want a recommendation.

### 02.5 Hands-on drill

Take five problem one-liners — credit default from 200k tabular rows; customer segments with no
labels; predicting next-hour electricity demand; classifying 50k product photos; ranking search
results — and for each write two candidate model families, the reason, the metric, and the biggest
data risk. Time yourself: 3 minutes each. This is the exact format of the opening applied question.

### 02.6 2026 interview questions

**Q1 `[THEORY]` — Explain the difference between parametric and non-parametric models, with
tradeoffs.**

**Answer.** A parametric model commits to a fixed-size parameter vector, so model complexity is
independent of training-set size; a non-parametric model's effective complexity grows with the data.
Linear/logistic regression and neural networks of fixed architecture are parametric; KNN, decision
trees, Random Forests and kernel SVMs are non-parametric. Tradeoffs: parametric models are
sample-efficient, fast to train and predict, and easy to interpret, but are badly biased if the
assumed form is wrong. Non-parametric models can approximate arbitrary functions and need no
functional assumption, but require more data, cost more at inference, and overfit readily without
explicit control (depth limits, pruning, `k`).

*What's being tested:* Vocabulary precision and whether you can attach real tradeoffs to a label.

*Follow-up:* "Is a neural network parametric?" — For a fixed architecture, yes. The interesting
nuance is that with enough capacity it behaves like a non-parametric learner in practice, which is
why explicit regularization matters so much.

---

**Q2 `[THEORY]` — Discriminative vs generative models. Which would you use and when?**

**Answer.** Discriminative models estimate `P(y|x)` (or just the boundary) directly; generative
models estimate the joint `P(x,y)`, usually via `P(x|y)P(y)`, then apply Bayes' rule to classify.
Discriminative: logistic regression, SVM, trees, boosting, most neural classifiers. Generative:
Naive Bayes, Gaussian discriminant analysis, GMMs, and — in the modern sense — LLMs and diffusion
models. Choose generative when data is scarce (the stronger assumptions act as regularization),
when you need to sample or detect out-of-distribution inputs, or when features go missing at
inference. Choose discriminative when you have plentiful labels and only care about predictive
accuracy, since all capacity is spent on the decision boundary rather than modeling the full input
distribution.

*What's being tested:* Whether you can connect classical taxonomy to the generative-model era —
a very common 2026 bridge question.

*Follow-up:* "Where does an LLM sit?" — It's a generative model of token sequences, trained by
maximum likelihood on next-token prediction, that can be *used* discriminatively by prompting it to
classify. That gap between how it's trained and how it's used explains a lot of its calibration
problems.

---

**Q3 `[THEORY]` `[TRAP]` — Which algorithms require feature scaling, and why?**

**Answer.** Scaling matters whenever the algorithm depends on distances, dot products or the
geometry of the loss surface. **Required:** KNN, K-Means, SVM (all kernels), PCA, and any
regularized linear model — because a shared penalty λ is only fair across coefficients if features
share a scale. **Strongly recommended:** anything trained by gradient descent, including neural
networks, since unscaled features produce an ill-conditioned loss surface and slow, zig-zagging
convergence. **Not needed:** decision trees and all tree ensembles (Random Forest, gradient
boosting), because each split is a threshold test within one feature and is invariant to monotone
rescaling. Note that unregularized OLS fitted via the normal equation is also scale-invariant in its
*predictions* — scaling only changes coefficient units.

*What's being tested:* A high-frequency question with a crisp right answer. The trap is candidates
who say "always scale" — it reveals rote practice rather than understanding.

*Follow-up:* "Standardization or min-max?" — Standardization (`(x-μ)/σ`) by default, and it's more
robust to outliers than min-max; min-max when you need a bounded range (e.g. image pixels, or a
layer expecting [0,1]); `RobustScaler` (median/IQR) when heavy outliers are present. Always fit the
scaler on training data only.

---

**Q4 `[APPLIED]` — You get a new tabular dataset, 500k rows, 80 mixed-type features, binary target
at 4% positive. What's your model plan?**

**Answer.** Sequence it: (1) Establish a trivial baseline — majority class and a single-feature
rule — so every later number has a reference. (2) Fit a regularized logistic regression on cleaned
features for an interpretable, fast benchmark and a sanity check on signal existence. (3) Fit
gradient-boosted trees (LightGBM or XGBoost) as the expected winner on tabular data — handles mixed
types, non-linearities and interactions, and tolerates missing values natively. (4) Because the
target is 4% positive, evaluate with PR-AUC and a business-cost-driven threshold, not accuracy or
ROC-AUC alone. (5) Use stratified K-fold, or time-based splits if there's any temporal component.
(6) Only then consider stacking or a neural approach, and only if the boosted model plateaus.

*What's being tested:* Whether you work in order of increasing complexity and whether you noticed
the 4% and adjusted your metrics. Candidates who jump straight to a neural network fail.

*Follow-up:* "What if it were 5,000 rows instead of 500k?" — Shift toward regularized linear models
and shallower ensembles, use repeated cross-validation rather than a single holdout because variance
in the estimate dominates, and be far more conservative about feature count.

---

## Module 03 — Classification vs Regression

| | |
|---|---|
| **Prerequisites** | Modules 01–02 |
| **Study time** | 4 h |
| **Why it's in the loop** | Early screening; and it silently drives every metric question later |
| **Rounds** | `[THEORY]` `[APPLIED]` `[TRAP]` |

### 03.1 What to learn

1. The formal difference: the target's measurement scale — continuous/ordered vs discrete/categorical.
2. How the target type propagates through **loss function**, **output layer/link**, **metric**, and
   **error interpretation**. This propagation is the real content of the module.
3. Binary vs multi-class vs multi-label vs ordinal classification — and why multi-label is not
   multi-class.
4. Regression variants: point prediction, quantile regression, count regression (Poisson),
   survival/time-to-event.
5. When a single problem can be framed either way, and how to decide.
6. Discretizing a continuous target: when it's legitimate and what it costs.
7. Ranking as a third family that is neither, and where it shows up.
8. Structured/threshold decisions: a classifier outputs a score; the *decision* requires a threshold
   that comes from business cost, not from the model.

### 03.2 Core intuitions

**The target type is the root of a dependency tree.** Get the root wrong and every branch is wrong:

| | Regression | Binary Classification |
|---|---|---|
| Target | `y ∈ ℝ` | `y ∈ {0,1}` |
| Model output | a number | a probability, then a class |
| Typical loss | MSE / MAE / Huber | Log-loss / hinge |
| Link function | identity | logit (sigmoid) |
| Metrics | RMSE, MAE, MAPE, R² | precision/recall, F1, ROC-AUC, PR-AUC, log-loss |
| "Error" means | how far off | which side of the boundary, and how confident |
| Extra decision needed | none | **the threshold** |

**Classification is two steps, and interviewers care about the second.** A classifier produces a
score; converting that score into an action requires a threshold. `0.5` is a default, almost never
the right answer, and choosing it deliberately from a cost matrix is one of the strongest signals you
can give in an applied round.

**Ordinal targets are the interesting middle.** A 1–5 star rating is ordered but not evenly spaced.
Treating it as regression assumes the gap between 1 and 2 equals the gap between 4 and 5. Treating
it as 5-class classification throws away the ordering entirely — predicting 5 when the truth is 1 is
penalized identically to predicting 2. The honest answers are ordinal regression, or classification
with a distance-aware metric like quadratic weighted kappa.

**Discretizing a continuous target destroys information.** Turning "days until churn" into
"churns within 30 days" makes the problem easier to communicate and to threshold, but throws away the
distinction between day 1 and day 29, and makes your model's usefulness dependent on a cutoff chosen
before you learned anything. Do it when the *decision* is genuinely binary; don't do it just to reach
for a classifier.

### 03.3 Gotchas that fail candidates

- **Treating multi-label as multi-class.** Multi-class: exactly one label per sample, softmax
  output, mutually exclusive. Multi-label: any number of labels per sample, independent sigmoid per
  label, `BinaryRelevance`-style handling. Softmax on a multi-label problem forces the probabilities
  to compete and sum to 1, which is simply the wrong model.
- **Using accuracy on regression** or **RMSE on classification** — usually a slip, always noticed.
- **Not asking whether the business needs a score or a decision.** They are different deliverables.
- **Forgetting that logistic "regression" is a classifier.** Know why the name is what it is
  (Module 07).

### 03.4 Hands-on drill

Take one dataset with a continuous target (house prices works). (1) Fit a regressor, report RMSE and
MAE. (2) Discretize the target at the median and fit a classifier; report precision/recall/PR-AUC.
(3) Write 200 words on what information the discretization destroyed and which framing you'd
actually ship. Then take a 1–5 rating dataset and compare regression, 5-class classification, and
quadratic-weighted-kappa evaluation on the same data.

### 03.5 2026 interview questions

**Q1 `[THEORY]` — Classification vs regression: what actually changes?**

**Answer.** The target's measurement scale, and then everything that depends on it. Regression
predicts a continuous quantity where "close" is meaningful, so it uses distance-based losses (MSE,
MAE, Huber), an identity link, and error metrics in the target's units. Classification predicts
membership in a discrete set, so it uses likelihood-based losses (log-loss) or margin-based losses
(hinge), a squashing link (sigmoid/softmax) to produce probabilities, and metrics built on the
confusion matrix plus a business-chosen threshold. The deepest practical difference is that a
classifier's output requires an extra decision — the threshold — that no regression model needs.

*What's being tested:* Whether you can go beyond "continuous vs categorical" into consequences. The
threshold observation is what marks a senior answer.

---

**Q2 `[APPLIED]` `[TRAP]` — You must predict how many days until a machine fails. Regression or
classification?**

**Answer.** It depends on the decision the output drives, so clarify first. If maintenance is
scheduled and the planner needs a horizon, regression on days (or better, **survival analysis**,
because some machines haven't failed yet — that's right-censored data, and plain regression either
drops those rows or mislabels them). If the decision is a binary "service this machine in the next
shift or not," classification on a fixed window is simpler to calibrate and threshold. A good
production answer is often both: a classifier for the alerting decision and a regression or quantile
model for the scheduling horizon. Mention **quantile regression** if downside risk is asymmetric —
predicting the 10th percentile of time-to-failure is far more useful than the mean when failure is
expensive.

*What's being tested:* Whether you ask about the decision before choosing a formulation, and whether
you spot censoring. Naming survival analysis here is a strong differentiator.

*Follow-up:* "What is censoring and why does it break regression?" — A machine still running at the
end of your observation window has time-to-failure ≥ its current age, not equal to it. Training on
that value as ground truth biases predictions systematically downward.

---

**Q3 `[THEORY]` — Multi-class vs multi-label. How do the model and loss differ?**

**Answer.** Multi-class: classes are mutually exclusive, one label per sample. Use a softmax output
over `K` units and categorical cross-entropy; probabilities sum to 1 and compete. Multi-label: labels
are independent and co-occurring, e.g. article tags. Use `K` independent sigmoid outputs and the sum
of per-label binary cross-entropies; each probability is independent and they need not sum to 1.
Metrics also differ: multi-class uses macro/micro/weighted-averaged precision-recall and a confusion
matrix; multi-label uses per-label metrics, Hamming loss, subset accuracy, and mean average
precision.

*What's being tested:* An easy question to get subtly wrong. Saying "softmax" for a multi-label
problem is an immediate flag.

*Follow-up:* "One-vs-Rest vs One-vs-One for multi-class with a binary-only algorithm?" — OvR trains
`K` classifiers (one per class against the rest): cheap, `K` models, but each faces an imbalanced
problem. OvO trains `K(K-1)/2` pairwise classifiers: many more models but each on a smaller balanced
subset, which is why libsvm uses it for SVMs, where training cost is super-linear in `n`.

---

**Q4 `[APPLIED]` — When is it legitimate to bin a continuous target into classes?**

**Answer.** When the downstream decision is genuinely discrete and the bin boundaries come from the
business, not from the data — e.g. a regulatory threshold, a fixed SLA, or a fixed intervention
budget. It's illegitimate when done for convenience: you destroy within-bin information, you make
performance sensitive to an arbitrary cutoff, and you introduce a discontinuity where a case just
below and just above the line are treated as categorically different. If you do bin, at minimum
report how many samples sit near the boundary and check that your model isn't just learning the
cutoff. A better pattern is usually to model the continuous target and threshold the *prediction*,
which keeps the cutoff a configurable business parameter rather than a baked-in modeling choice.

*What's being tested:* Resistance to convenient simplifications, and awareness that thresholds should
live outside the model where possible.

---

## Module 04 — Data Preparation, EDA & Feature Engineering

| | |
|---|---|
| **Prerequisites** | Modules 01–03 |
| **Study time** | 10 h |
| **Why it's in the loop** | Highest-yield module for applied and take-home rounds in 2026 |
| **Rounds** | `[APPLIED]` `[CODE]` `[DEBUG]` `[TRAP]` |

This is where real projects are won and lost, and interviewers know it. Give it the time.

### 04.1 What to learn

**Understanding the data**
1. Systematic EDA: shapes, dtypes, missingness pattern, cardinality, target distribution, univariate
   distributions, bivariate relationships with the target, correlation structure, duplicates.
2. Target definition and label quality — how the label was generated, by whom, with what delay.
3. Data lineage: which columns exist *at prediction time* versus only after the fact.

**Cleaning**
4. Missing data mechanisms: MCAR, MAR, MNAR — and why the mechanism dictates the fix.
5. Imputation: mean/median/mode, constant sentinel, missing-indicator column, KNN imputation,
   iterative/MICE, and native missing handling in XGBoost/LightGBM.
6. Outliers: detection (z-score, IQR, isolation forest) and the four responses — keep, cap/winsorize,
   transform, remove — with a stated reason.
7. Duplicates, inconsistent categories, unit mismatches, timezone bugs, mixed encodings.

**Transformations**
8. Scaling: standardization, min-max, robust, max-abs, and when each applies.
9. Skew handling: log, log1p, Box–Cox, Yeo–Johnson, quantile transform.
10. Categorical encoding: one-hot, ordinal, target/mean encoding (**with out-of-fold computation**),
    frequency encoding, hashing, CatBoost's ordered target statistics, embeddings.
11. High-cardinality categoricals — the practical hard case.
12. Datetime features: cyclical encoding (sin/cos), lags, rolling windows, time-since-event.
13. Text features: bag-of-words, TF-IDF, n-grams, and modern embedding features.
14. Interaction and polynomial features, binning, ratios and domain-derived features.

**Discipline**
15. **Data leakage** — every form of it. This is the single most-tested concept in this module.
16. Train/serve consistency: fitting all transformers *inside* a pipeline, on training folds only.
17. `sklearn` `Pipeline` + `ColumnTransformer` as the correct default structure.
18. Feature selection: filter (correlation, mutual information, chi²), wrapper (RFE, forward
    selection), embedded (L1, tree importance), and permutation importance.
19. Handling multicollinearity: VIF, correlated-pair pruning, PCA, or just using a model that
    doesn't care.
20. Sampling and dataset shift: how your training sample was selected and whether that matches
    production traffic.

### 04.2 Core intuitions

**Leakage is any information in your features that would not be available, in that form, at
prediction time.** It is the number-one cause of "97% in the notebook, 61% in production." Learn to
recognize its five faces:

1. **Target leakage** — a feature computed from the outcome. `total_amount_paid` when predicting
   default; `discharge_date` when predicting readmission; `number_of_support_calls_after_churn`.
2. **Train/test contamination** — fitting a scaler, imputer, encoder, or feature selector on the full
   dataset before splitting, so test statistics inform training.
3. **Temporal leakage** — using future information for a past prediction; random K-fold on
   time-ordered data does this by construction.
4. **Group leakage** — the same entity (patient, user, device) appearing in both train and test, so
   the model memorizes the entity rather than the pattern. Fix with `GroupKFold`.
5. **Duplicate leakage** — exact or near-duplicate rows split across train and test.

**Target encoding is a leakage machine unless done out-of-fold.** Replacing a category with the mean
target for that category uses the label, so computing it on the full training set lets each row see
its own target. Compute it out-of-fold (or with CatBoost's ordered scheme), add smoothing toward the
global mean for rare categories, and treat unseen categories explicitly.

**Missingness is often informative.** Before you impute, ask whether the fact of absence carries
signal. Income missing on a loan application is not random. The safest general recipe: impute *and*
add a binary `was_missing` indicator, so the model can use both the filled value and the absence.

**"Handle outliers" is not a step, it's a decision with a reason.** A sensor reading of 10,000°C is a
data error — remove it. A legitimate £2M transaction in a fraud dataset is the most important row in
the file — do not touch it. The only wrong answer is a blanket policy applied without asking which
kind you have.

**The pipeline is the deliverable, not the model.** If your preprocessing lives in notebook cells
above `model.fit`, it cannot be reproduced at serving time, and you have a training/serving skew bug
waiting to happen. Everything — imputation, encoding, scaling, selection — goes inside a fitted
`Pipeline` object that is serialized with the model.

### 04.3 The correct split-then-transform order

```text
1. Define the target and confirm every feature is available at prediction time
2. Remove duplicates and obvious corruption
3. SPLIT  ← everything below happens per-fold, fit on train only
4. Fit imputers            on train  → transform train, val, test
5. Fit encoders            on train  → transform train, val, test
6. Fit scalers             on train  → transform train, val, test
7. Fit feature selectors   on train  → transform train, val, test
8. Fit model               on train
9. Evaluate on val (tune), then ONCE on test (report)
```

Steps 4–8 belong inside a `Pipeline` so cross-validation re-fits them per fold automatically. If
your CV loop doesn't re-fit the preprocessing every fold, your CV score is optimistic.

### 04.4 Gotchas that fail candidates

- **`StandardScaler().fit(X)` before `train_test_split`.** Instantly disqualifying in a code round.
- **`SMOTE` applied before splitting** — synthetic points interpolated from test neighbours land in
  train. (More in Module 12.)
- **Target encoding fitted on all training rows** without out-of-fold computation.
- **Dropping rows with missing values by default** — often discards 40% of the data and biases the
  sample when missingness is MAR/MNAR.
- **One-hot encoding a 50,000-category column** and then wondering why the model is slow and
  overfits.
- **Not noticing a feature that is too good.** A single feature with 0.99 AUC is a leakage alarm,
  not a win.

### 04.5 Hands-on drill

Take any messy public dataset (the Titanic, Ames Housing, or a Kaggle tabular set) and build a
single `sklearn` `Pipeline` with `ColumnTransformer` that handles numeric and categorical branches,
imputation with indicators, scaling, and one-hot/target encoding — then cross-validate it. Then
deliberately introduce each of the five leakage types listed above, measure how much the CV score
inflates for each, and write down the number. Having concrete numbers for "leakage cost me 14 AUC
points" makes your interview answers vivid and credible.

### 04.6 2026 interview questions

**Q1 `[APPLIED]` `[TRAP]` — Your model gets 0.97 AUC in cross-validation and 0.61 in production.
Diagnose it.**

**Answer.** Work a fixed checklist out loud, most likely first. (1) **Leakage** — is any feature
computed from or after the outcome? Is any preprocessing fitted before the split? Sort features by
importance and interrogate the top few; a single dominant feature is the classic signature. (2)
**Split design** — random K-fold on temporal data, or the same entity in both folds, both produce
inflated estimates. (3) **Training/serving skew** — is production computing features the same way,
with the same defaults, units, timezone and category vocabulary? (4) **Distribution shift** —
production traffic may differ from the training sample, either because the world moved or because
the training set was selected non-randomly (e.g. trained only on approved loans, scored on all
applicants). (5) **Label availability delay** — production may be scored against labels defined
differently from training. Then say how you'd confirm each: a time-based holdout, a feature-by-feature
train-vs-production distribution comparison, and an ablation dropping suspicious features.

*What's being tested:* Systematic debugging under uncertainty. This is one of the most common 2026
applied questions, and the expected answer leads with leakage.

*Follow-up:* "Which single check first?" — A strictly time-based holdout evaluated with the exact
serving-time feature computation. It catches leakage, temporal leakage and skew simultaneously.

---

**Q2 `[THEORY]` — Name five distinct kinds of data leakage.**

**Answer.** Target leakage (a feature derived from the outcome), preprocessing contamination (fitting
transformers before splitting), temporal leakage (future information in a past prediction), group
leakage (the same entity in train and test), and duplicate leakage (identical or near-identical rows
across the split). A sixth worth naming is leakage through feature selection or hyperparameter tuning
performed on the test set — selecting features using all the data is leakage even if the model never
sees test rows directly.

*What's being tested:* Depth on the highest-consequence topic in applied ML. Naming five with one
concrete example each is a strong answer.

---

**Q3 `[CODE]` `[TRAP]` — You have a 60-category `city` column and a 40,000-category `merchant_id`
column. How do you encode each?**

**Answer.** They need different treatments precisely because of cardinality. For `city` (60
categories): one-hot is fine for a linear model; for tree ensembles, native categorical support
(LightGBM/CatBoost) or ordinal encoding works and avoids 60 sparse columns. For `merchant_id`
(40,000): one-hot is out — it explodes dimensionality and each column carries almost no signal.
Options, roughly in order: (a) **out-of-fold target encoding** with smoothing toward the global mean,
so rare merchants get shrunk; (b) **frequency/count encoding**, which often carries surprising
signal; (c) **grouping** — keep the top-N merchants and bucket the tail into `other`; (d) **hashing**
for a fixed-width sparse representation when memory is constrained; (e) **learned embeddings** if
you're already using a neural model; (f) **CatBoost**, which is designed for exactly this and uses
ordered target statistics to avoid the leakage that naive target encoding creates. Also engineer
merchant-level aggregate features (mean transaction amount, transaction count, days active) — these
often beat the ID encoding itself.

*What's being tested:* Whether you scale your method to the cardinality, and whether you know target
encoding's leakage hazard. Mentioning out-of-fold computation unprompted is the key signal.

*Follow-up:* "What about a merchant unseen at serving time?" — You need an explicit fallback: the
global prior for target encoding, an `unknown` bucket for grouping, and a monitoring alert on the
unseen-category rate.

---

**Q4 `[THEORY]` — MCAR, MAR, MNAR. Why does the distinction matter?**

**Answer.** **MCAR** (missing completely at random): missingness is independent of everything, so
dropping rows is unbiased, just wasteful. **MAR** (missing at random): missingness depends on
*observed* variables — e.g. income missing more often for younger applicants — so it can be modeled,
and multiple imputation using the observed features is principled. **MNAR** (missing not at random):
missingness depends on the *unobserved value itself* — high earners decline to state income — so no
imputation from observed data can recover it without bias, and the missingness itself must be
modeled as a feature. Practically: MCAR is rare, most real data is MAR or MNAR, and the safe default
is impute-plus-indicator so the model can exploit the missingness pattern rather than having it
smoothed away.

*What's being tested:* Statistical literacy plus practical judgment. The impute-plus-indicator
recommendation shows you've done this for real.

*Follow-up:* "What does XGBoost do with missing values?" — It learns a default direction per split:
at each node it tries sending all missing values left and right and keeps whichever gives more gain.
That is a learned, data-driven handling of missingness, which is one reason boosted trees are strong
on messy tabular data.

---

**Q5 `[APPLIED]` — Walk me through your EDA on a dataset you've never seen.**

**Answer.** Fixed sequence, and narrate why each step exists. Shape and dtypes. Target
distribution — including class balance, which decides your metrics. Missingness by column *and its
pattern* (columns missing together often reveal a join problem). Cardinality of every categorical, to
plan encoding. Univariate distributions, looking for skew, spikes at defaults like 0 or -999, and
impossible values. Bivariate relationships against the target. Correlation matrix for
multicollinearity and for suspiciously perfect correlations. Duplicates and near-duplicates. Any
temporal or group structure that dictates the split strategy. Finally, and most importantly, a
column-by-column check that each feature is genuinely available at prediction time. End by writing
down the three biggest data risks — that list is what a senior interviewer is listening for.

*What's being tested:* Whether you have a repeatable process versus improvising. The
availability-at-prediction-time check and the risk list are the differentiators.

---

**Q6 `[THEORY]` `[TRAP]` — Should you always remove outliers?**

**Answer.** No — you should always *investigate* them, then decide with a reason. Three cases:
measurement error (a negative age, a 10,000°C reading) → fix or remove; legitimate extreme values
that matter (large fraudulent transactions, luxury property prices) → keep, because they may be the
signal you're paid to find; legitimate extremes that destabilize a specific model → keep the row but
reduce its leverage via a log/Yeo–Johnson transform, winsorizing, a robust loss (Huber, MAE), or
simply choosing a model that doesn't care. Trees are largely insensitive to outliers in features
because splits are rank-based; OLS, K-Means and distance-based methods are highly sensitive. So "do
I need to handle this outlier?" partly depends on which model you're about to fit.

*What's being tested:* Whether you apply recipes or reasoning. "Drop anything beyond 3 sigma" is the
wrong answer.

---

## Module 05 — Bias–Variance, Overfitting, Splits & Cross-Validation

| | |
|---|---|
| **Prerequisites** | Modules 01–04 |
| **Study time** | 8 h |
| **Why it's in the loop** | Universal. Every hyperparameter question is secretly this question. |
| **Rounds** | `[THEORY]` `[MATH]` `[APPLIED]` `[DEBUG]` |

### 05.1 What to learn

1. Generalization: the difference between training error and expected error on new data.
2. Overfitting and underfitting — the symptoms, not just the definitions.
3. The **bias–variance decomposition** of expected squared error, and what each term means.
4. Model complexity vs error curves; the classical U-shaped test-error curve.
5. **Learning curves** (error vs training-set size) and how to read them to decide "more data" vs
   "more model."
6. Train/validation/test — three sets, three distinct jobs.
7. K-fold cross-validation; stratified K-fold; repeated K-fold; leave-one-out.
8. `GroupKFold` for entity leakage; `TimeSeriesSplit` / walk-forward for temporal data.
9. **Nested cross-validation** and why a single CV loop that also tunes hyperparameters is
   optimistically biased.
10. The five families of regularization: penalty terms, early stopping, ensembling, data
    augmentation/more data, and explicit capacity limits.
11. Double descent — what it is, and the honest scope of the claim.
12. Reproducibility: seeds, fold determinism, and reporting variance across folds rather than a
    single number.

### 05.2 Core intuitions

**Bias is being wrong on average; variance is being unstable.** Bias is error from the model being
too rigid to represent the truth — a straight line fitted to a curve is wrong no matter how much data
you give it. Variance is error from the model being so sensitive that a different training sample
would produce a very different function. A depth-1 tree has high bias and low variance; a fully grown
tree has low bias and high variance.

**Every hyperparameter is a position on the bias–variance dial.** This is the most reusable framing
in the entire course, because interviewers ask it in a hundred disguises:

| Hyperparameter | Increase it → |
|---|---|
| `λ` / `alpha` (regularization) | more bias, less variance |
| `C` in SVM | less bias, more variance (C is inverse regularization) |
| tree `max_depth` | less bias, more variance |
| tree `min_samples_leaf` | more bias, less variance |
| `k` in KNN | more bias, less variance |
| `n_estimators` in **Random Forest** | variance ↓, then flat — does not overfit meaningfully |
| `n_estimators` in **boosting** | bias ↓, variance ↑ — **will** overfit, needs early stopping |
| `learning_rate` in boosting | larger → faster bias reduction, more variance |
| polynomial degree | less bias, more variance |
| number of features | less bias, more variance |

Memorize the contrast in the two `n_estimators` rows. It's asked constantly and it's the cleanest
one-line proof that you understand bagging versus boosting.

**Bagging attacks variance; boosting attacks bias.** Bagging averages many low-bias, high-variance
models fitted on bootstrap samples, so the bias stays roughly the same and the variance falls.
Boosting adds many high-bias, low-variance models sequentially, each correcting the previous
residuals, so bias falls and you must control the resulting variance with shrinkage and early
stopping.

**The test set is a one-shot resource.** Train fits parameters. Validation selects hyperparameters
and model families. Test estimates generalization *once*, at the end. Every time you look at the test
set and change something, you leak a little information into your model choice and your final
estimate becomes optimistic. This is why nested CV exists.

**Read learning curves to decide what to do next.** Plot training and validation error against
training-set size. If both are high and close together, you're underfitting — add capacity or better
features; more data will not help. If training error is low and there's a large persistent gap,
you're overfitting — regularize, simplify, or add data; here more data *will* help, and the curve
shows you roughly how much.

**Double descent, stated carefully.** In heavily over-parameterized regimes — especially deep
networks — test error can fall again after the interpolation threshold, producing a second descent
beyond the classical U-curve. It's a real and important phenomenon in modern deep learning, but it is
not a license to ignore overfitting in the tabular models this course covers, where the classical
U-curve is what you'll actually observe. Know it, scope it honestly.

### 05.3 Whiteboard formulas

```text
Expected squared error at a point x, over training sets:

  E[(y - f̂(x))²] = ( Bias[f̂(x)] )² + Var[f̂(x)] + σ²
                     ─────┬─────      ────┬────    ─┬─
              systematic error   sensitivity to    irreducible
              from wrong form     the sample       noise

  Bias[f̂(x)] = E[f̂(x)] - f(x)
  Var[f̂(x)]  = E[( f̂(x) - E[f̂(x)] )²]

σ² is the noise floor: no model, however good, can go below it.

Variance of an average of B correlated models (the bagging identity):
  Var = ρσ² + (1-ρ)·σ²/B
        ───     ────────
    irreducible   →0 as B→∞
    correlation
    floor
```

That last identity is the mathematical reason Random Forest randomizes features: raising `B` only
helps down to the `ρσ²` floor, so the way to improve further is to *reduce ρ* by decorrelating the
trees. Being able to state it earns real credit in Module 16.

### 05.4 Gotchas that fail candidates

- **Random K-fold on time series.** Trains on the future to predict the past. Use
  `TimeSeriesSplit`/walk-forward validation.
- **Not stratifying** a K-fold on an imbalanced target, so some folds have too few positives to
  produce a stable estimate.
- **Tuning on the test set** and then reporting the test score as an unbiased estimate.
- **Reporting a single CV number with no spread.** Report mean ± std across folds; a 0.82 ± 0.09 is
  a very different result from 0.82 ± 0.01 and the difference changes decisions.
- **Claiming more data always helps.** Under high bias, it doesn't.
- **Confusing the effect of `n_estimators` in RF and in boosting.**

### 05.5 Hands-on drill

1. Fit polynomial regressions of degree 1 through 15 on a small noisy sample; plot training and test
   error against degree and produce the U-curve yourself.
2. Plot learning curves for a high-bias model and a high-variance model on the same data; confirm you
   can identify which is which from the curves alone.
3. Take a time-ordered dataset and score the same model with random K-fold and with
   `TimeSeriesSplit`. Record the gap — that number is your answer to the leakage question.
4. Implement nested CV manually and compare its estimate with a single tuned-CV estimate on the same
   data. Note the optimism.

### 05.6 2026 interview questions

**Q1 `[MATH]` — Write and explain the bias–variance decomposition.**

**Answer.** For squared error, expected error at a point decomposes as
`bias² + variance + irreducible noise`. Bias is `E[f̂(x)] - f(x)`, the systematic error from the
model class being too restrictive to represent the truth. Variance is `E[(f̂(x) - E[f̂(x)])²]`, the
error from sensitivity to the particular training sample. `σ²` is noise in the data-generating
process — a floor no model can beat. The expectation is over training sets, which is the part
candidates usually omit and the part that makes "variance" meaningful: it asks how much your fitted
function would move if you'd drawn a different sample of the same size.

*What's being tested:* Whether your understanding is mathematical or slogan-level. Saying "the
expectation is over training sets" is the marker of a genuine answer.

*Follow-up:* "Does this decomposition hold for 0-1 classification loss?" — Not in this clean additive
form; the decomposition is exact for squared error. Analogues exist for other losses but they're
messier. The *intuition* transfers to classification, the algebra does not — a nuance that scores
well.

---

**Q2 `[THEORY]` — Your model has 99% train accuracy and 71% test accuracy. What do you do?**

**Answer.** That's a 28-point gap: high variance, overfitting. Address it in order of cost. (1)
Verify the evaluation first — is the split leaking or unrepresentative, is the test set too small to
trust? (2) Reduce capacity: shallower trees, higher `min_samples_leaf`, fewer features, lower
polynomial degree. (3) Add regularization: L1/L2, dropout for nets, subsampling for boosting. (4)
Early stopping on a validation set. (5) Ensemble to average out variance. (6) Get more training data
if feasible — and use a learning curve to estimate whether it will actually help before spending the
money. (7) Simplify features: aggressive feature counts on limited rows are a common cause. State
that you'd plot the learning curve before choosing between (6) and the rest, because the curve
distinguishes "needs data" from "needs less model."

*What's being tested:* Whether you have an ordered, cost-aware playbook and whether you check the
evaluation before changing the model.

---

**Q3 `[THEORY]` `[TRAP]` — Does adding more trees to a Random Forest cause overfitting? What about
gradient boosting?**

**Answer.** Random Forest: essentially no. Each tree is fitted independently on a bootstrap sample,
and prediction is an average, so adding trees reduces variance and then plateaus. Test error
flattens; it does not rise meaningfully. `n_estimators` is therefore a compute/latency decision, not
a regularization decision. Gradient boosting: yes, definitively. Each tree is fitted to the current
ensemble's residuals, so the ensemble keeps reducing training error and will eventually fit noise.
`n_estimators` in boosting is a genuine bias–variance knob and must be chosen by early stopping on a
validation set, interacting with the learning rate — lower learning rate needs more trees.

*What's being tested:* The cleanest single discriminator between candidates who understand ensembles
and candidates who have memorized names. Get this one perfect.

*Follow-up:* "Then why does Random Forest have a `max_depth` parameter?" — Individual tree depth
still controls each tree's variance and the correlation between trees, and limiting it saves compute
and memory. But unlike boosting, RF's default of fully grown trees is usually fine, because averaging
handles the variance.

---

**Q4 `[APPLIED]` `[TRAP]` — How do you cross-validate a time-series model?**

**Answer.** Never with random K-fold — that trains on future data to predict the past, which is
temporal leakage and produces an estimate you cannot reproduce in production. Use forward-chaining /
walk-forward validation: sort by time, then train on `[0..t]` and validate on `(t..t+h]`, sliding or
expanding the window across several folds. `sklearn`'s `TimeSeriesSplit` implements the expanding-
window version. Three refinements that mark a strong answer: (a) insert a **gap/embargo** between
train and validation equal to your label-availability delay, so a label that takes 30 days to
materialize can't be learned from data 1 day before validation; (b) make the validation horizon match
the real prediction horizon; (c) if entities also repeat over time, you may need to combine group and
time constraints.

*What's being tested:* Whether you can handle non-i.i.d. data. The embargo/gap point is the senior
differentiator; most candidates stop at "use TimeSeriesSplit."

---

**Q5 `[THEORY]` — What is nested cross-validation and when do you need it?**

**Answer.** Two loops: the inner loop selects hyperparameters, the outer loop estimates
generalization of the *whole procedure including the selection*. You need it whenever you want an
unbiased performance estimate on a dataset small enough that you can't afford a separate untouched
test set. The reason is that selecting the best of 200 hyperparameter configurations by CV score
means the winning score is partly luck — you took a maximum over noisy estimates — so that score is
optimistically biased. Nested CV re-runs the entire selection inside each outer fold, so the reported
number reflects "how well does my procedure do," not "how well did my luckiest configuration do."
Cost is the product of the two loops, so it's a small-data technique; with plenty of data a clean
three-way split is simpler and adequate.

*What's being tested:* Whether you understand that model selection itself overfits. This is a strong
mid-to-senior signal.

---

**Q6 `[DEBUG]` — Cross-validation says 0.84 ± 0.11 across five folds. Is the model good?**

**Answer.** You can't tell yet, and the ±0.11 is the story. That spread means folds range roughly
0.73–0.95, so the estimate is too unstable to act on. Likely causes: the dataset is small; the target
is imbalanced and folds aren't stratified, so positive counts vary wildly per fold; there's group or
temporal structure making some folds much harder; or a few high-leverage outliers dominate whichever
fold they land in. Next steps: switch to stratified and/or repeated K-fold to stabilize the estimate,
inspect per-fold scores for a single bad fold versus uniform noise, check fold-wise class balance,
and check whether the bad fold corresponds to a specific time period or entity group. Reporting mean
with spread — and reacting to the spread — is the point of the question.

*What's being tested:* Whether you read uncertainty or just the headline number. Many candidates
answer "0.84 is decent" and lose the round.

---

# Part B — Linear Models & Optimization

## Module 06 — Linear Regression

| | |
|---|---|
| **Prerequisites** | Modules 01, 05 |
| **Study time** | 8 h |
| **Why it's in the loop** | The reference model. Its assumptions frame every later question. |
| **Rounds** | `[THEORY]` `[MATH]` `[CODE]` `[TRAP]` |

Do not skim this because it looks basic. Linear regression is where interviewers test whether you
understand *any* model rigorously, and the derivations here recur in Modules 07–09.

### 06.1 What to learn

1. The model: `ŷ = w₀ + w₁x₁ + ... + w_dx_d = Xw` (with a bias column of ones).
2. The loss: sum/mean of squared errors, and its MLE justification under Gaussian noise.
3. The **normal equation** `w = (XᵀX)⁻¹Xᵀy` — derive it by setting the gradient to zero.
4. When `XᵀX` is singular and what to do (pseudo-inverse via SVD, ridge, drop collinear features).
5. Computational cost: `O(nd² + d³)` for the normal equation vs `O(nd)` per gradient-descent
   iteration — and therefore when to use which.
6. The five OLS assumptions, and the **Gauss–Markov theorem** (OLS is BLUE — and which assumptions
   that needs).
7. Which assumption violations break *predictions* vs only break *inference* (standard errors,
   p-values, confidence intervals).
8. Diagnostics: residual-vs-fitted plot, Q–Q plot, scale-location, leverage/Cook's distance, VIF,
   Durbin–Watson.
9. Multicollinearity: what it does and does not break.
10. `R²`, adjusted `R²`, and their failure modes (including negative out-of-sample `R²`).
11. Coefficient interpretation: units, "holding all else constant," and standardized coefficients.
12. Extensions: polynomial regression, interaction terms, splines, weighted least squares, robust
    regression (Huber, RANSAC), quantile regression.
13. Why linear regression fails for classification — the setup for Module 07.

### 06.2 Core intuitions

**OLS is an orthogonal projection.** The fitted values `ŷ` are the projection of `y` onto the column
space of `X`; the residuals are orthogonal to every column of `X`. That's the geometric meaning of
"setting the gradient to zero" — you've removed all the signal `X` is capable of explaining, and
whatever is left is by construction uncorrelated with your features. This picture also explains
multicollinearity: if two columns nearly coincide, the projection is fine but the *decomposition* of
it into per-column coefficients becomes unstable.

**Squared error is not a neutral choice.** It's the MLE under Gaussian noise, it's differentiable
everywhere, it has a closed-form solution, and it penalizes large errors quadratically — which makes
it sensitive to outliers. If your errors are heavy-tailed, MAE (Laplace MLE) or Huber (quadratic near
zero, linear in the tails) is the principled alternative. Being able to say *why* you'd switch is what
separates a real answer from "MSE because that's what regression uses."

**Normality is the most over-claimed assumption.** Gauss–Markov says OLS is the Best Linear Unbiased
Estimator under linearity, zero-mean errors given `X`, homoscedasticity, and no autocorrelation.
**Normality is not required** for that result. Normality of errors matters for exact small-sample
inference — t-tests, F-tests, exact confidence intervals. With a large `n` the CLT covers you
approximately. Candidates who list "normality" as required for OLS to work are revealing that they
memorized a list.

**Multicollinearity does not hurt predictions, it hurts explanations.** With two nearly identical
features, many `(w₁, w₂)` combinations give nearly the same fit, so individual coefficients become
large, unstable, and can flip sign across samples — standard errors inflate, p-values become
meaningless, and "feature X matters" conclusions become unreliable. But `ŷ` and RMSE are typically
fine. So: if you need inference, fix it (drop, combine, ridge, PCA). If you only need predictions,
you may legitimately do nothing. Perfect collinearity is different — then `XᵀX` is singular and
there's no unique solution at all.

**R² is a comparison to the mean, and it can be negative.** `R² = 1 - SSres/SStot` measures how much
better you do than predicting `ȳ`. In-sample it can never decrease when you add a feature — even a
random one — which is why adjusted `R²` penalizes parameter count. Out-of-sample, `R²` *can* go
negative: it just means your model is worse than the training mean, which happens more than people
expect on shifted data.

**Why linear regression fails for classification.** Fit OLS to a 0/1 target and you get: predictions
outside [0,1] that can't be read as probabilities; a fitted line whose slope is dragged around by
extreme `x` values, so adding a far-away point can move the decision boundary; heteroscedastic errors
by construction, since Bernoulli variance `p(1-p)` depends on `p`; and an implied constant marginal
effect of `x` on probability, which is wrong near 0 and 1 where probabilities must flatten out. Each
of those is a reason for the logit link in Module 07. Have this list ready — it's the standard bridge
question.

### 06.3 Whiteboard formulas

```text
Model                ŷ = Xw,        X ∈ ℝ^(n×(d+1)) with a ones column

Loss                 J(w) = ½‖y - Xw‖²  =  ½ Σᵢ (yᵢ - w·xᵢ)²

Gradient             ∇J(w) = -Xᵀ(y - Xw) = Xᵀ(Xw - y)

Set to zero          XᵀXw = Xᵀy            ← the "normal equations"
Solution             w = (XᵀX)⁻¹ Xᵀ y      ← requires XᵀX invertible
Singular case        w = X⁺y   (Moore–Penrose pseudo-inverse, via SVD)

Simple regression    w₁ = Cov(x,y)/Var(x) = ρ·(σy/σx);   w₀ = ȳ - w₁x̄

Sums of squares      SStot = Σ(yᵢ - ȳ)²
                     SSres = Σ(yᵢ - ŷᵢ)²
R²                   R² = 1 - SSres/SStot
Adjusted R²          R²adj = 1 - (1-R²)·(n-1)/(n-d-1)

VIF for feature j    VIF_j = 1/(1 - R²_j),  R²_j from regressing xⱼ on all other features
                     VIF > 5 (or 10) → concerning collinearity

Gauss–Markov: under (1) linearity in parameters, (2) E[ε|X]=0,
(3) homoscedasticity Var(ε|X)=σ²I, (4) no autocorrelation,
OLS is the Best Linear Unbiased Estimator. Normality NOT required.
```

### 06.4 The assumptions, and what breaks

| Assumption | Violation looks like | Breaks predictions? | Breaks inference? | Fix |
|---|---|---|---|---|
| Linearity in parameters | Curved residual-vs-fitted plot | **Yes** | Yes | Transform, polynomial, splines, non-linear model |
| `E[ε\|X] = 0` (exogeneity) | Omitted confounder | **Yes** (biased) | Yes | Add the variable, IV, better design |
| Homoscedasticity | Funnel shape in residuals | No (still unbiased) | **Yes** | Robust (HC) standard errors, WLS, log target |
| No autocorrelation | Patterned residuals over time | Mildly | **Yes** | Time-series model, Newey–West SEs |
| No perfect collinearity | `XᵀX` singular | **Yes** (no unique fit) | Yes | Drop/combine features, ridge |
| Normal errors (*inference only*) | Curved Q–Q plot | No | Yes, in small `n` | Larger `n` (CLT), bootstrap, transform |

Being able to fill in the two "breaks?" columns is the whole game on assumption questions. Most
candidates can list the assumptions; very few can say which violations they can safely ignore for a
pure prediction task.

### 06.5 Gotchas that fail candidates

- **Saying OLS requires normally distributed features.** It requires nothing of the features'
  distribution. The (inference-only) normality assumption is about the *errors*.
- **Saying multicollinearity ruins the model.** It ruins coefficient interpretation, usually not
  predictive accuracy.
- **Interpreting a coefficient causally.** `w_j` is the association with `y` per unit of `x_j`
  holding the *included* variables constant. Any omitted confounder invalidates the causal reading.
- **Not knowing when to use the normal equation vs gradient descent.** With `d` in the tens of
  thousands, `d³` is fatal; use gradient descent or an iterative solver.
- **Forgetting that `R²` increases mechanically with more features** in-sample.
- **Claiming "linear regression can't model non-linear relationships."** It's linear *in the
  parameters*; with `x²`, `log x`, splines and interactions as features it fits highly non-linear
  functions of the original inputs.

### 06.6 Hands-on drill

1. Implement OLS three ways in `numpy`: the normal equation, `np.linalg.lstsq` (SVD-based), and
   batch gradient descent. Confirm all three agree, then time them as `d` grows from 10 to 2,000.
2. Construct a dataset with two nearly identical features; fit OLS repeatedly on bootstrap resamples
   and watch the individual coefficients swing wildly while `ŷ` stays stable. Then compute VIF, then
   refit with ridge and watch them stabilize. This exercise makes the multicollinearity answer real.
3. Generate heteroscedastic data, fit OLS, and confirm coefficients stay roughly unbiased while
   conventional standard errors become wrong.
4. Fit OLS to a binary target and plot the predictions. See the out-of-range values yourself. This is
   the visual you should describe in the Module 07 bridge question.

### 06.7 2026 interview questions

**Q1 `[MATH]` — Derive the normal equation.**

**Answer.** Minimize `J(w) = ½‖y - Xw‖² = ½(y - Xw)ᵀ(y - Xw)`. Expand:
`½(yᵀy - 2wᵀXᵀy + wᵀXᵀXw)`. Differentiate with respect to `w`:
`∇J = -Xᵀy + XᵀXw`. Set to zero: `XᵀXw = Xᵀy`, hence `w = (XᵀX)⁻¹Xᵀy` whenever `XᵀX` is
invertible. It's a genuine minimum because `J` is convex — its Hessian is `XᵀX`, which is positive
semi-definite, and positive definite exactly when `X` has full column rank.

*What's being tested:* Whether you can do matrix calculus and whether you justify that it's a
minimum. Mentioning the Hessian and convexity unprompted is the differentiator.

*Follow-up:* "When is `XᵀX` not invertible, and what then?" — When columns are perfectly collinear or
`d > n`. Then use the Moore–Penrose pseudo-inverse via SVD (which returns the minimum-norm solution),
or add ridge: `(XᵀX + λI)` is always invertible for `λ > 0`, since it shifts every eigenvalue up by λ.

---

**Q2 `[THEORY]` `[TRAP]` — What are the assumptions of linear regression, and which can you ignore if
you only care about prediction?**

**Answer.** Assumptions: linearity in the parameters, exogeneity (`E[ε|X] = 0`), homoscedasticity, no
autocorrelation of errors, no perfect multicollinearity, and — for exact small-sample inference
only — normality of errors. For a pure prediction task: violations of linearity and exogeneity are
serious, because they bias the fit itself. Heteroscedasticity and non-normal errors mostly damage
*inference* — your standard errors, p-values and confidence intervals become unreliable — while the
coefficient estimates remain unbiased and predictions remain usable, so if you're reporting RMSE
rather than p-values you can often proceed (optionally with robust standard errors). Autocorrelation
matters more than it looks, because it usually signals that you should be using a time-series model
and that your CV is leaking. Imperfect multicollinearity is tolerable for prediction and fatal for
interpretation.

*What's being tested:* The split between prediction and inference. This is exactly the question that
separates candidates who memorized a list from candidates who understand what the list is for.

*Follow-up:* "Is normality of errors needed for OLS to be BLUE?" — No. Gauss–Markov needs linearity,
zero-mean errors, homoscedasticity and no autocorrelation. Normality buys you exact `t`/`F`
distributions in small samples, and the CLT gives you an approximate version for large `n`.

---

**Q3 `[THEORY]` — Explain multicollinearity. How do you detect and handle it?**

**Answer.** Two or more predictors are strongly linearly related, so the data can't cleanly attribute
the shared variance among them. Consequences: coefficient estimates become high-variance, can be
implausibly large, and can flip sign with small changes to the sample; standard errors inflate so
individually significant predictors appear insignificant even while the overall F-test is strongly
significant — that pattern is a classic tell. Detection: pairwise correlation matrix for the obvious
cases, **VIF** for the general case (`VIF_j = 1/(1-R²_j)`, with >5 or >10 as the usual flags), or the
condition number of `X`. Handling depends on your goal — drop one of the pair, combine them into a
domain-meaningful composite, use PCA, use **ridge** (which is specifically well-behaved under
collinearity because it shrinks along the low-variance directions), collect more data, or, if you
only need predictions and are using a tree ensemble, do nothing at all.

*What's being tested:* Whether you know that this is primarily an interpretation problem. The
"significant F-test, insignificant t-tests" signature is a strong detail.

*Follow-up:* "Why does ridge help specifically?" — Writing `X = UΣVᵀ`, ridge scales each direction's
contribution by `σᵢ²/(σᵢ² + λ)`. Directions with tiny singular values — exactly the collinear
directions where variance explodes — get shrunk hardest, while high-variance directions are barely
touched.

---

**Q4 `[THEORY]` `[TRAP]` — Can `R²` be negative? Can it decrease when you add a feature?**

**Answer.** In-sample, on the data you fitted, `R²` is bounded in [0,1] and can **never** decrease
when you add a feature — OLS can always set the new coefficient to zero and do no worse, so `R²` is
monotone in feature count. That's exactly why adjusted `R²` exists: it penalizes each extra
parameter and *can* fall. Out-of-sample, `R²` absolutely can be negative: `1 - SSres/SStot` goes
negative whenever your model's squared error exceeds that of simply predicting the training mean —
common under distribution shift or severe overfitting. So "negative `R²`" is not a bug, it's a
meaningful and fairly damning diagnostic.

*What's being tested:* Whether you distinguish in-sample from out-of-sample behaviour. Many
candidates confidently say "no, R² is always 0 to 1."

---

**Q5 `[THEORY]` — When would you use gradient descent instead of the normal equation for linear
regression?**

**Answer.** The normal equation is `O(nd² + d³)` and needs the whole `XᵀX` in memory, so it becomes
impractical when `d` is large — the `d³` inversion dominates once `d` reaches the thousands. Use
gradient descent (or a conjugate-gradient / L-BFGS solver) when `d` is large, when `n` is too large to
fit in memory and you want mini-batches or online updates, when `XᵀX` is ill-conditioned so explicit
inversion is numerically unstable, or when you're using a loss with no closed form (which is most of
them — logistic loss, Huber, and anything with an L1 penalty). Conversely, for small-to-moderate `d`
the normal equation is exact, needs no learning-rate tuning, and is the better choice. Note that in
practice you'd use `lstsq`/SVD rather than literally inverting `XᵀX`, for numerical stability.

*What's being tested:* Cost awareness and knowing that closed forms are the exception, not the rule.

---

**Q6 `[THEORY]` `[TRAP]` — Why can't you just use linear regression for classification?**

**Answer.** Four concrete reasons, and this is the bridge into logistic regression. (1) **Unbounded
output:** `Xw` ranges over all reals, so you get predictions like `-0.3` and `1.4` that can't be
probabilities. (2) **Sensitivity of the boundary:** because squared error penalizes distance from 0/1
even for confidently-correct points, a cluster of extreme `x` values drags the fitted line and moves
the implied threshold, so adding easy points changes your boundary. (3) **Wrong noise model:** a
Bernoulli target has variance `p(1-p)`, which depends on `p`, so errors are heteroscedastic by
construction and the Gaussian-noise justification for MSE simply doesn't apply. (4) **Wrong
functional shape:** a linear model implies a constant marginal effect of `x` on probability, but
probability must saturate near 0 and 1 — real effects flatten at the extremes. The fix for all four
is to model a *transformed* quantity that is naturally unbounded, which is the log-odds, and to use
the Bernoulli likelihood as the loss. That is exactly logistic regression.

*What's being tested:* Whether you can motivate logistic regression from first principles instead of
just asserting it. This question is asked constantly and answering it with these four points
positions you perfectly for the log-odds questions that follow.

---

## Module 07 — Logistic Regression & Log Odds

| | |
|---|---|
| **Prerequisites** | Modules 01, 06 |
| **Study time** | 10 h |
| **Why it's in the loop** | The single most-interviewed algorithm in ML. Expect 15+ minutes on it. |
| **Rounds** | `[THEORY]` `[MATH]` `[CODE]` `[TRAP]` |

**This is the highest-density module in the course.** "Why log odds?" is a signature 2026 interview
question because it has a shallow memorized answer and a deep correct answer, and the two are easy to
tell apart. Work through 07.3 until you can derive it on a whiteboard cold.

### 07.1 What to learn

1. Odds, log-odds (the logit), and the sigmoid as its inverse.
2. The model: `logit(p) = w·x + b`, therefore `p = σ(w·x + b)`.
3. **Why the logit link** — the full answer, in five independent arguments (07.3).
4. GLM framing: exponential families, link functions, and why the logit is the **canonical link** for
   the Bernoulli distribution.
5. Deriving log-loss (binary cross-entropy) from the Bernoulli likelihood via MLE.
6. Deriving the gradient, and why it collapses to `Xᵀ(σ(Xw) - y)` — the same residual form as linear
   regression.
7. Why the log-loss surface is **convex** in `w` (and why MSE-with-sigmoid is not).
8. Why not MSE: non-convexity *and* vanishing gradients from the `σ'` factor.
9. Why the name says "regression".
10. Coefficient interpretation: log-odds are additive, **odds are multiplicative** (`e^{w_j}` is the
    odds ratio), probability effects are non-linear and depend on the base rate.
11. Decision boundary: `w·x + b = 0` is a hyperplane — logistic regression is a linear classifier.
12. No closed-form solution; fitting via IRLS / Newton–Raphson / L-BFGS / SGD.
13. **Perfect separation** — MLE diverges to infinite coefficients, and regularization fixes it.
14. Regularized logistic regression, and `sklearn`'s `C = 1/λ` convention (a real trap).
15. Multi-class extension: softmax / multinomial logistic regression, and its relation to OvR.
16. Class weights and thresholds for imbalanced problems.
17. Calibration — why logistic regression is naturally well-calibrated and most other classifiers
    aren't.
18. The generative connection: Gaussian class-conditionals with shared covariance produce a *linear*
    log-odds, and Naive Bayes does too — so the logistic form is not arbitrary.
19. Practical strengths and limits; when it beats boosting.

### 07.2 Core intuitions

**Odds convert a bounded probability into an unbounded ratio; the log makes it symmetric.**

```text
p     : probability            ∈ (0, 1)          bounded both ends
p/(1-p): odds                  ∈ (0, ∞)          bounded below only
log(p/(1-p)): log-odds (logit) ∈ (-∞, +∞)        unbounded — matches w·x
```

| p | odds | log-odds |
|---|---|---|
| 0.01 | 1/99 ≈ 0.0101 | −4.60 |
| 0.10 | 1/9 ≈ 0.111 | −2.20 |
| 0.25 | 1/3 ≈ 0.333 | −1.10 |
| 0.50 | 1 | **0** |
| 0.75 | 3 | +1.10 |
| 0.90 | 9 | +2.20 |
| 0.99 | 99 | +4.60 |

Read the symmetry in that table: `logit(1-p) = -logit(p)`, and `p = 0.5` sits at exactly zero. That's
what makes log-odds the natural scale for a linear predictor — the two classes are treated
symmetrically, and the "no information" point is the origin.

**Logistic regression is a linear model wearing a non-linear output.** The relationship between the
features and the *log-odds* is linear. The relationship between features and *probability* is an
S-curve, because you pushed the linear predictor through a sigmoid. The decision boundary is
`w·x + b = 0` — a hyperplane. So it's a linear classifier, and the sigmoid changes the calibration of
the output, not the geometry of the boundary.

**A coefficient is a multiplier on the odds.** `w_j = 0.7` does not mean "probability increases by
0.7" or even "by 70%". It means each one-unit increase in `x_j` adds `0.7` to the log-odds, i.e.
multiplies the **odds** by `e^0.7 ≈ 2.01` — the odds roughly double. What that does to the probability
depends entirely on where you started: from `p = 0.01` (odds 0.0101) you go to odds 0.0203,
`p ≈ 0.020`, a 1-point rise. From `p = 0.5` (odds 1) you go to odds 2.01, `p ≈ 0.668`, a 17-point
rise. Same coefficient, wildly different probability effect. Being able to say this fluently is one of
the strongest signals in the whole module.

**The gradient is beautiful, and that's the point.** With the logit link and log-loss, the gradient is
`Xᵀ(p - y)` — feature matrix transposed times the prediction error. Identical in form to linear
regression's `Xᵀ(ŷ - y)`. This is not a coincidence: it's a general property of using the canonical
link of an exponential-family distribution. The messy `σ'(z)` factors cancel exactly.

**Logistic regression outputs honest probabilities.** Because it's trained by maximum likelihood on a
proper scoring rule, its outputs are typically well-calibrated out of the box — if it says 0.3, about
30% of such cases really are positive. SVMs (hinge loss) and boosted trees are not calibrated by
default and generally need Platt scaling or isotonic regression. In any application where the *score*
drives a decision with a monetary cost — expected-loss thresholds, pricing, triage ranking — this is a
decisive advantage, and it's a great reason to give when asked "why would you ever pick logistic
regression over XGBoost?"

### 07.3 Why log odds — the complete answer

This is the section to over-prepare. There are five independent arguments; a 30-second answer uses
argument 1, a strong answer adds 2 and 3, and a standout answer can reach 4 or 5.

**Argument 1 — Range matching (the one everyone should have).**
A linear predictor `η = w·x + b` is unbounded: it ranges over `(-∞, +∞)`. A probability is bounded to
`(0,1)`. You cannot set an unbounded thing equal to a bounded thing without either breaking the model
(predictions outside [0,1]) or crushing the linear structure. So you don't model `p` linearly — you
model a *transformation* of `p` whose range is all the reals. The logit does exactly that:
`logit: (0,1) → (-∞,+∞)`. Then invert to recover a probability, and the inverse of the logit *is* the
sigmoid:

```text
   log( p/(1-p) ) = η
      → p/(1-p)   = e^η
      → p         = e^η / (1 + e^η)  =  1/(1 + e^(-η))  =  σ(η)
```

Note the direction of the reasoning: **the sigmoid is a consequence of choosing the logit link, not
the starting point.** Candidates who answer "because we use a sigmoid" have the logic backwards, and
interviewers listen for exactly that.

**Argument 2 — MLE gives you the loss, and the algebra comes out clean.**
Model each observation as Bernoulli with parameter `pᵢ = σ(w·xᵢ)`. The likelihood is
`∏ᵢ pᵢ^{yᵢ}(1-pᵢ)^{1-yᵢ}`; the negative log-likelihood is
`-Σᵢ [ yᵢ log pᵢ + (1-yᵢ) log(1-pᵢ) ]` — **that is log-loss**. It wasn't invented, it was derived.
Now take the gradient. Using `σ'(z) = σ(z)(1-σ(z))`, the `σ'` factors cancel exactly against the
derivative of the log terms and you get:

```text
∂NLL/∂w = Σᵢ (σ(w·xᵢ) - yᵢ)·xᵢ   =   Xᵀ(p - y)
```

Simple, stable, and structurally identical to linear regression. This cancellation is a specific
consequence of pairing the Bernoulli likelihood with the logit link.

**Argument 3 — Convexity, hence a unique global optimum.**
The negative log-likelihood of logistic regression is convex in `w` (its Hessian is
`Xᵀ diag(pᵢ(1-pᵢ)) X`, which is positive semi-definite because every `pᵢ(1-pᵢ) > 0`). Convexity means
no local minima, no dependence on initialization, and reliable convergence with Newton or quasi-Newton
methods. If instead you kept the sigmoid but used squared error, the objective is **not convex** in
`w` — you can get stuck in local minima. Choosing the logit link *with* the matching likelihood is
what buys you the well-behaved optimization problem.

**Argument 4 — GLM theory: the logit is the canonical link for Bernoulli.**
In the generalized-linear-model framework, you write a distribution in exponential-family form
`p(y|θ) = h(y)exp(θ·T(y) - A(θ))`. The **canonical link** is the function mapping the mean parameter
to the natural parameter `θ`. For the Bernoulli distribution with mean `p`, writing
`p^y(1-p)^{1-y} = exp( y·log(p/(1-p)) + log(1-p) )` shows the natural parameter is exactly
`log(p/(1-p))` — the log-odds. So the logit isn't a convenient hack; it's the *structurally
distinguished* link that Bernoulli hands you. This is also why the gradient simplifies (argument 2)
and why the loss is convex (argument 3) — both are general properties of canonical links, and the same
framework produces the identity link for Gaussian regression and the log link for Poisson regression.
If you can deliver this, you're answering above the level of the question.

**Argument 5 — It's what the data-generating process actually implies.**
Suppose the two classes are Gaussian with different means and a *shared* covariance:
`x|y=1 ~ N(μ₁, Σ)`, `x|y=0 ~ N(μ₀, Σ)`. Apply Bayes and take the log of the posterior odds:

```text
log( P(y=1|x) / P(y=0|x) ) = log(P(x|y=1)/P(x|y=0)) + log(P(y=1)/P(y=0))
```

The quadratic terms in `x` cancel because the covariances are equal, and what survives is **linear in
x**. Naive Bayes with exponential-family class-conditionals gives the same result. So under a broad
and not-unreasonable family of generative assumptions, the true log-odds *is* a linear function of the
features — meaning logistic regression is fitting exactly the right functional form, and doing so
discriminatively (without having to estimate `μ`s and `Σ`) so it's robust to those assumptions being
somewhat wrong.

**Interpretability, as a bonus.** Because effects are additive in log-odds and multiplicative in odds,
`e^{w_j}` is an **odds ratio** — the exact quantity epidemiology, credit scoring and clinical
research have used for decades. "Smoking multiplies the odds of the outcome by 2.4" is a sentence a
regulator, a doctor or a credit officer can act on. No other model class hands you that for free, and
it is a large part of why logistic regression is still deployed in regulated domains in 2026.

**The 30-second version, for when you're asked in a screen:**
> "A linear combination of features is unbounded, but a probability is stuck in [0,1] — so you can't
> model probability linearly. The log-odds is unbounded, so we model *that* linearly, and inverting it
> gives the sigmoid. It's also the canonical link for the Bernoulli distribution, which is what makes
> the log-loss convex and the gradient collapse to `Xᵀ(p−y)`. And it gives us interpretable odds
> ratios, since `e^{wⱼ}` is the multiplicative effect on the odds."

### 07.4 Whiteboard formulas

```text
Odds                 odds = p/(1-p)
Logit  (link)        η = logit(p) = log( p/(1-p) )              ∈ ℝ
Sigmoid (inverse)    p = σ(η) = 1/(1+e^(-η))
Derivative           σ'(η) = σ(η)(1-σ(η))
Symmetry             σ(-η) = 1 - σ(η);   logit(1-p) = -logit(p)

Model                logit(P(y=1|x)) = w·x + b
                     P(y=1|x) = σ(w·x + b)

Likelihood           L(w) = ∏ᵢ pᵢ^{yᵢ}(1-pᵢ)^{1-yᵢ}
Log-loss (NLL)       J(w) = -Σᵢ [ yᵢ log pᵢ + (1-yᵢ)log(1-pᵢ) ]
Gradient             ∇J(w) = Xᵀ(p - y)              ← same form as linear regression
Hessian              H = Xᵀ S X,  S = diag(pᵢ(1-pᵢ))    ⪰ 0  → J is convex

Decision boundary    w·x + b = 0        (a hyperplane; p = 0.5 there)
Odds ratio           a 1-unit rise in xⱼ multiplies odds by e^{wⱼ}

Regularized (sklearn):  min  C·Σ log-loss + ½‖w‖²      ← note: C = 1/λ
                        small C = STRONG regularization

Multinomial (softmax):  P(y=k|x) = e^{w_k·x} / Σⱼ e^{w_j·x}
Multi-class loss:       categorical cross-entropy
```

### 07.5 Gotchas that fail candidates

- **"Why log odds?" answered with "because of the sigmoid."** Backwards. The sigmoid is the
  *consequence* of the logit link.
- **Interpreting `w_j` as a change in probability.** It's a change in log-odds; `e^{w_j}` is the odds
  multiplier.
- **Calling logistic regression a non-linear model.** Linear in log-odds; linear decision boundary.
- **Not knowing `sklearn`'s `C` is inverse regularization.** Setting `C=100` to "regularize more"
  actually regularizes less. This exact mistake shows up in live coding rounds.
- **Not knowing MSE-with-sigmoid is non-convex** — or citing only the vanishing-gradient reason and
  missing convexity, or vice versa. Give both.
- **Not knowing what happens under perfect separation.** The MLE doesn't exist; coefficients diverge.
- **Forgetting the default 0.5 threshold is a choice**, not a property of the model.
- **Using `predict()` instead of `predict_proba()`** on an imbalanced problem and then wondering why
  recall is zero.

### 07.6 Hands-on drill

1. Implement logistic regression from scratch in `numpy`: sigmoid, log-loss, gradient
   `Xᵀ(p-y)`, batch gradient descent. Match `sklearn`'s coefficients to 3 decimal places on the same
   data with regularization disabled (`penalty=None`).
2. Add L2 and confirm that as `λ` grows, coefficients shrink toward zero but never reach it.
3. Print the sigmoid loss surface for a 1-feature problem under log-loss and under MSE; verify
   visually that the MSE version has a non-convex region. This makes your convexity answer concrete.
4. Build a perfectly separable 2D dataset, fit with `penalty=None`, and watch the coefficients blow
   up and the solver warn about convergence. Then add a tiny L2 penalty and watch it stabilize.
5. Fit on an imbalanced dataset and produce the full precision/recall-vs-threshold curve. Pick a
   threshold from an explicit cost matrix (e.g. FN costs 10× FP) and show the expected cost at your
   chosen threshold versus at 0.5.
6. Compare calibration curves for logistic regression vs an untuned `XGBClassifier` on the same data.
   You will see the logistic curve hug the diagonal. That plot is worth describing in interviews.

### 07.7 2026 interview questions

**Q1 `[MATH]` `[TRAP]` — Why log odds? Why not model the probability directly with a linear
function?**

**Answer.** Because the ranges don't match. `w·x + b` is unbounded over `(-∞,+∞)` while a probability
lives in `(0,1)`, so a linear model of `p` produces predictions below 0 and above 1, implies a
constant marginal effect where probabilities must actually saturate, and has errors whose variance
`p(1-p)` depends on the mean — violating the Gaussian-noise assumption that justifies squared error in
the first place. Instead, transform: the log-odds `log(p/(1-p))` maps `(0,1)` onto all of `ℝ`, so
*that* is what we model linearly. Inverting gives `p = σ(w·x+b)` — the sigmoid falls out, it isn't
assumed. Three further reasons the logit specifically: it's the canonical link for the Bernoulli
distribution in GLM theory, which makes the negative log-likelihood convex and collapses the gradient
to `Xᵀ(p−y)`; it's symmetric, with `p=0.5` at the origin and `logit(1−p) = −logit(p)`; and it yields
interpretable odds ratios, since `e^{wⱼ}` is the multiplicative effect of a unit change in `xⱼ` on the
odds.

*What's being tested:* Whether you can reason from constraints to model form. The direction of the
argument — logit chosen first, sigmoid derived — is what interviewers grade. Mentioning the canonical
link puts you in the top band.

*Follow-up:* "Are there other valid links?" — Yes. The **probit** link (inverse normal CDF) also maps
`(0,1)→ℝ` and gives very similar fits; it's standard in econometrics. The **complementary log-log**
link is used for asymmetric responses. The logit's advantages are the odds-ratio interpretation and
the analytic convenience of being canonical, not uniqueness.

---

**Q2 `[MATH]` — Derive the log-loss for logistic regression from first principles.**

**Answer.** Assume each `yᵢ ∈ {0,1}` is Bernoulli with parameter `pᵢ = σ(w·xᵢ)`. A single
observation's probability can be written compactly as `pᵢ^{yᵢ}(1-pᵢ)^{1-yᵢ}` — it evaluates to `pᵢ`
when `yᵢ=1` and `1-pᵢ` when `yᵢ=0`. Assuming independence, the likelihood over the dataset is the
product `∏ᵢ pᵢ^{yᵢ}(1-pᵢ)^{1-yᵢ}`. Take logs to turn the product into a sum (monotone, so same
argmax, and numerically far more stable): `Σᵢ [yᵢ log pᵢ + (1-yᵢ)log(1-pᵢ)]`. Maximizing that is
minimizing its negative, which is log-loss / binary cross-entropy. So log-loss is the negative
log-likelihood of a Bernoulli model — the direct classification analogue of MSE being the negative
log-likelihood of a Gaussian model.

*What's being tested:* The MLE-to-loss pipeline from Module 01, applied. Landing the parallel to MSE
shows you see the general pattern rather than two memorized facts.

*Follow-up:* "Now derive the gradient." — Differentiate, use `σ'(z)=σ(z)(1-σ(z))`, and the `σ'` terms
cancel against the `1/p` and `1/(1-p)` from the log derivatives, leaving
`∇J = Σᵢ(pᵢ - yᵢ)xᵢ = Xᵀ(p-y)`.

---

**Q3 `[MATH]` `[TRAP]` — Why not use MSE as the loss for logistic regression?**

**Answer.** Two independent reasons, and a complete answer gives both. (1) **Non-convexity.**
Composing the sigmoid with squared error produces an objective that is not convex in `w`, so gradient
descent can converge to a local minimum and the result depends on initialization. Log-loss with the
logit link is convex — Hessian `XᵀSX` with `S = diag(pᵢ(1-pᵢ)) ⪰ 0` — so there's a unique global
optimum. (2) **Vanishing gradients.** With MSE, the gradient carries a factor of `σ'(z) = σ(z)(1-σ(z))`,
which goes to zero when `z` is large in magnitude. So a confidently *wrong* prediction — `p ≈ 0.999`
when `y = 0` — produces an almost-zero gradient and the model barely learns from its worst mistakes.
Log-loss cancels that `σ'` factor, so the gradient is proportional to the raw error `(p − y)` and
confident mistakes generate the largest updates, which is exactly the behaviour you want. A third
point if you want to go further: log-loss is a **proper scoring rule**, so it's minimized by the true
conditional probability, making it the right objective if you care about calibrated probabilities and
not just the argmax.

*What's being tested:* Whether you know both reasons. Most candidates give the vanishing-gradient
answer only. Both, plus the proper-scoring-rule note, is a top-band answer.

---

**Q4 `[THEORY]` `[TRAP]` — Why is it called logistic *regression* if it does classification?**

**Answer.** Because it *is* a regression — it just regresses the log-odds rather than the target. The
model fits a continuous, unbounded quantity `logit(p) = w·x + b` by regression; the classification
step is a separate act of thresholding the resulting probability. Historically it belongs to the
generalized-linear-model family alongside linear and Poisson regression, differing only in the link
function and the assumed response distribution, and the name reflects that lineage plus the logistic
function used to invert the link. The practical payoff of remembering this: the native output is a
*probability*, and turning it into a class label requires a threshold that you choose from business
cost — the model itself never commits to 0.5.

*What's being tested:* Conceptual clarity on a question designed to catch rote learners. The
"regresses the log-odds, then you threshold" framing is the answer.

---

**Q5 `[THEORY]` — A coefficient in your fitted model is 0.7. Interpret it for a business stakeholder.**

**Answer.** A one-unit increase in that feature, holding the other included features constant, adds
0.7 to the log-odds of the positive outcome — which means it multiplies the **odds** by
`e^0.7 ≈ 2.0`, so the odds roughly double. Critically, that is *not* "the probability doubles." What
happens to the probability depends on the starting point: from a 1% baseline (odds ≈ 0.0101) doubling
the odds gives about 2.0% — a one-point rise. From a 50% baseline (odds = 1) it gives about 67% — a
17-point rise. So for stakeholders I'd say "this factor roughly doubles the odds," and then, if they
need a probability figure, quote the effect at their actual base rate. I'd also caveat that this is
association, not causation, and that the "holding others constant" clause is only over the variables
in the model.

*What's being tested:* Whether you truly internalized the log-odds scale, plus communication skill.
The two worked base-rate examples are what make this answer land.

*Follow-up:* "What if features are on wildly different scales?" — Raw coefficients aren't comparable
across features. Standardize the features first and compare standardized coefficients, or report the
odds ratio per one standard deviation, which is the version stakeholders can actually rank.

---

**Q6 `[THEORY]` — Is logistic regression a linear or non-linear model?**

**Answer.** Linear — in two precise senses. It's linear in the parameters, and its decision boundary
is the hyperplane `w·x + b = 0`. The sigmoid is a monotone transformation applied *after* the linear
combination; it changes how the score maps to a probability, not the shape of the boundary. The
probability-versus-feature relationship is an S-curve, which is where the confusion comes from, but
the classifier itself can only separate classes with a hyperplane. Consequence: logistic regression
cannot solve XOR, and to capture interactions or curvature you must supply them explicitly as
engineered features (`x₁x₂`, `x²`, splines) — at which point it's still linear in parameters but
non-linear in the original inputs.

*What's being tested:* Precision. Also sets up the SVM/kernel discussion in Module 14.

---

**Q7 `[DEBUG]` `[TRAP]` — Your logistic regression coefficients are enormous (values like 400) and the
solver warns it didn't converge. What's happening?**

**Answer.** Almost certainly **perfect (or near-perfect) separation**: some feature or linear
combination separates the two classes cleanly. In that case the likelihood keeps increasing as you
scale `w` up — pushing predicted probabilities toward exactly 0 and 1 — so the MLE is at infinity and
doesn't exist. The optimizer chases it until it hits the iteration limit. Diagnosis: look for a
feature that perfectly predicts the target, which is very often **leakage** or a category that only
appears in one class. Fixes: add L2 regularization, which bounds the coefficient norm and guarantees a
finite unique solution; use Firth's penalized likelihood if you need principled inference; remove or
investigate the separating feature; or check whether a rare category is creating separation and merge
it. Practically, the first thing I'd do is treat it as a leakage alarm rather than an optimizer
problem.

*What's being tested:* Whether you recognize a specific, well-known failure mode and connect it back
to leakage. Strong senior signal.

---

**Q8 `[CODE]` `[TRAP]` — In `sklearn`, you want stronger regularization on `LogisticRegression`. Do
you increase or decrease `C`?**

**Answer.** Decrease it. `sklearn` parameterizes with `C = 1/λ`, so `C` is the *inverse* of
regularization strength — the objective is roughly `C·Σloss + ½‖w‖²`. Small `C` (e.g. 0.01) means
strong regularization and heavily shrunk coefficients; large `C` (e.g. 1000) means weak
regularization, approaching unpenalized MLE. Also worth noting: `LogisticRegression` applies L2 by
default, so it is *never* plain unregularized MLE unless you set `penalty=None` — which matters when
you're trying to reproduce textbook coefficients or a `statsmodels` fit.

*What's being tested:* Practical tool knowledge, and the very common `C`-direction mistake. The
"regularized by default" point is a bonus that shows real usage.

---

**Q9 `[THEORY]` — How does logistic regression extend to multi-class problems?**

**Answer.** Two routes. **Multinomial (softmax) logistic regression** — the principled one — learns a
weight vector per class and sets `P(y=k|x) = e^{w_k·x}/Σⱼe^{w_j·x}`, trained with categorical
cross-entropy. Probabilities are jointly normalized to sum to 1 and the model is fitted in one
optimization, which is why it's `sklearn`'s default `multi_class='multinomial'`. **One-vs-Rest** trains
`K` independent binary classifiers, each "class k vs everything else," and picks the largest score;
it's simpler and parallelizable but the `K` outputs aren't calibrated against each other and must be
normalized post hoc, and each sub-problem is artificially imbalanced. Softmax also has a redundancy
worth knowing: adding a constant vector to every `w_k` leaves the probabilities unchanged, so the
parameterization is over-specified by one degree of freedom — which is why some implementations fix
one class's weights at zero, and why regularization is helpful for identifiability.

*What's being tested:* Whether you know both approaches and their calibration difference. The softmax
shift-invariance detail is a nice depth signal.

---

**Q10 `[APPLIED]` — When would you choose logistic regression over XGBoost in 2026?**

**Answer.** Several genuine cases, and the answer should be affirmative rather than apologetic. (1)
**Regulatory or explainability requirements** — credit decisioning, insurance underwriting, clinical
risk — where you must state a monotone, auditable per-feature effect and defend it to a regulator;
odds ratios are the accepted currency in those fields. (2) **Well-calibrated probabilities out of the
box**, needed when the score feeds an expected-cost calculation or a price rather than a
classification. (3) **Small or low-signal datasets**, where a high-variance model overfits and the
strong linear prior wins. (4) **Extreme latency or footprint constraints** — a dot product is
microseconds and the model is a vector of numbers. (5) **A strong baseline** you should always fit
first, to know whether the boosted model's extra complexity is actually buying anything. (6)
**Stability and easy monitoring** — coefficient drift is directly interpretable. Also note that a
logistic regression on well-engineered features can close much of the gap to boosting, and that the
combination — boosting for accuracy, logistic regression for the explainable production model — is a
common real-world pattern.

*What's being tested:* Whether you can defend the simple model on its merits. This question exists
precisely to catch candidates who reflexively reach for the most complex tool.

---

**Q11 `[THEORY]` — What does it mean for logistic regression to be "well-calibrated," and why is it?**

**Answer.** Calibrated means the predicted probabilities are truthful in aggregate: among all cases
scored around 0.3, roughly 30% are actually positive. It's a different property from
discrimination — a model can rank perfectly (AUC 1.0) while being badly calibrated, and vice versa.
Logistic regression tends to be calibrated because it's fitted by maximizing the Bernoulli
likelihood, and log-loss is a **proper scoring rule**, meaning it's uniquely minimized by the true
conditional probability — so the training objective is directly pushing toward honest probabilities.
By contrast, an SVM optimizes hinge loss, which only cares about the margin, so its decision-function
output isn't a probability at all; and boosted trees, while trained on log-loss, are typically
pushed toward over-confident extremes by the sequential fitting and need post-hoc correction. Fixes
for uncalibrated models: **Platt scaling** (fit a 1-D logistic regression on the held-out scores) or
**isotonic regression** (non-parametric, more flexible, needs more data), both fitted on a held-out
set, never on training data. Measure calibration with a reliability diagram, expected calibration
error, or the Brier score.

*What's being tested:* A topic that has become much more prominent in 2026 loops because scores
increasingly drive automated cost-based decisions. Naming "proper scoring rule" and separating
calibration from discrimination is the strong answer.

---

**Q12 `[MATH]` — Show that the log-odds is linear in `x` if both classes are Gaussian with shared
covariance.**

**Answer.** Let `x|y=1 ~ N(μ₁,Σ)` and `x|y=0 ~ N(μ₀,Σ)` with priors `π₁, π₀`. The log posterior odds
is `log(P(x|y=1)/P(x|y=0)) + log(π₁/π₀)`. Substituting the Gaussian densities, the normalizing
constants `(2π)^{-d/2}|Σ|^{-1/2}` cancel, leaving
`-½(x-μ₁)ᵀΣ⁻¹(x-μ₁) + ½(x-μ₀)ᵀΣ⁻¹(x-μ₀) + log(π₁/π₀)`. Expanding both quadratic forms, the `xᵀΣ⁻¹x`
terms are identical and **cancel** — this is exactly where the shared-covariance assumption earns its
keep — leaving terms linear in `x` plus constants:
`(μ₁-μ₀)ᵀΣ⁻¹x - ½(μ₁ᵀΣ⁻¹μ₁ - μ₀ᵀΣ⁻¹μ₀) + log(π₁/π₀)`. That is `w·x + b` with
`w = Σ⁻¹(μ₁-μ₀)`. So the true log-odds is linear, which is precisely the form logistic regression
assumes — and this is the generative justification (Linear Discriminant Analysis) for the logistic
model.

*What's being tested:* Serious mathematical depth. This is an Applied Scientist / research-track
question, and it's also the most satisfying answer to "why should the log-odds be linear?"

*Follow-up:* "What if the covariances differ?" — The quadratic terms no longer cancel and the boundary
becomes quadratic: that's Quadratic Discriminant Analysis. It's more flexible but estimates a separate
covariance matrix per class, so it needs far more data. And note the practical point: logistic
regression estimates `w` discriminatively without assuming Gaussianity at all, so it's more robust
than LDA when the assumption is violated — while LDA is more efficient when it holds.

---

## Module 08 — Regularization: Ridge, Lasso, Elastic Net

| | |
|---|---|
| **Prerequisites** | Modules 05, 06, 07 |
| **Study time** | 6 h |
| **Why it's in the loop** | Constant. And the L1-sparsity question is a favourite. |
| **Rounds** | `[THEORY]` `[MATH]` `[TRAP]` |

### 08.1 What to learn

1. Regularization as the bias–variance dial, applied through the loss function.
2. **Ridge (L2):** `J = loss + λ‖w‖²`, closed form `(XᵀX + λI)⁻¹Xᵀy`.
3. **Lasso (L1):** `J = loss + λ‖w‖₁`, no closed form, produces exact zeros.
4. **Elastic Net:** `J = loss + λ(α‖w‖₁ + (1-α)‖w‖²)`.
5. **Why L1 produces sparsity** — the geometric argument and the subgradient argument. Know both.
6. The SVD view of ridge: shrinkage factor `σᵢ²/(σᵢ²+λ)` per singular direction.
7. The Bayesian view: L2 = Gaussian prior, L1 = Laplace prior, both as MAP estimation.
8. Why the intercept is not penalized, and why features must be standardized first.
9. Choosing λ by cross-validation; the regularization path; `RidgeCV`/`LassoCV`.
10. Behaviour under correlated features: lasso picks arbitrarily among them, ridge spreads weight,
    elastic net groups them.
11. Other regularization families: early stopping, dropout, data augmentation, ensembling, explicit
    capacity limits, and the tree-specific penalties in Module 18.
12. Group lasso and monotonic constraints, briefly.

### 08.2 Core intuitions

**A penalty is a price on complexity.** Unpenalized fitting chases every wiggle in the training
sample. Adding `λ‖w‖²` makes large coefficients expensive, so the optimizer only "buys" a large
coefficient when the loss reduction justifies it. As `λ → 0` you recover OLS; as `λ → ∞` all
coefficients go to zero and you predict the mean. Somewhere in between is the sweet spot, and
cross-validation finds it.

**Why L1 gives exact zeros and L2 doesn't — geometry.** Think of it as minimizing the loss subject to
a budget on the coefficients. The L2 budget region `‖w‖₂ ≤ t` is a circle/sphere — smooth, no corners.
The L1 region `‖w‖₁ ≤ t` is a diamond/cross-polytope whose **vertices lie exactly on the axes**, where
some coordinates are zero. The solution is where the expanding elliptical loss contours first touch
the budget region, and a convex region with pointy corners is very likely to be touched *at* a corner
— which means a coefficient of exactly zero. A sphere has no corners, so contact happens at a generic
point where every coefficient is small but non-zero.

**Why L1 gives exact zeros — calculus.** The L2 penalty's derivative `2λw_j` vanishes as `w_j → 0`, so
the shrinkage force fades exactly where it would need to be strongest to reach zero — asymptotic
shrinkage, never arrival. The L1 penalty's subgradient is `λ·sign(w_j)`, which has **constant
magnitude λ regardless of how small `w_j` is**. So there's a persistent push toward zero, and any
feature whose loss-gradient contribution is smaller than λ gets pinned at exactly zero. This is
visible directly in the soft-thresholding solution of coordinate descent:
`w_j ← sign(z_j)·max(|z_j| - λ, 0)`, where the `max(·,0)` is literally the mechanism that creates the
zero.

**Ridge shrinks the unstable directions hardest.** Via SVD, ridge multiplies each singular direction's
contribution by `σᵢ²/(σᵢ²+λ)`. Directions with large `σᵢ` — well-determined by the data — are barely
affected. Directions with tiny `σᵢ` — the collinear, high-variance directions where OLS coefficients
explode — get crushed. This is the precise reason ridge is the right tool for multicollinearity, and
it's a better answer than "it shrinks coefficients."

**Regularization is a prior.** Maximize the posterior instead of the likelihood: `log p(w|D) ∝
log p(D|w) + log p(w)`. A zero-mean Gaussian prior on `w` contributes `-‖w‖²/2τ²`, i.e. **L2**. A
Laplace prior contributes `-‖w‖₁/b`, i.e. **L1** — and the Laplace density's sharp peak at zero is the
probabilistic counterpart of the geometric corner. So λ encodes how strongly you believe coefficients
are small before seeing data.

**Standardize first, and don't penalize the intercept.** The penalty treats all coefficients with the
same λ, so a feature measured in millimetres and one measured in kilometres get wildly unfair
treatment unless you standardize. And penalizing the intercept would shrink your predictions toward
zero rather than toward the target mean, which is not what you want — so `sklearn` and every sane
implementation exclude it.

### 08.3 Whiteboard formulas

```text
Ridge (L2)        J(w) = ‖y - Xw‖² + λ‖w‖²₂
                  w    = (XᵀX + λI)⁻¹ Xᵀy        ← always invertible for λ>0
                  SVD view: shrink direction i by σᵢ²/(σᵢ²+λ)
                  Prior: w ~ N(0, τ²I),  λ = σ²/τ²

Lasso (L1)        J(w) = ‖y - Xw‖² + λ‖w‖₁
                  No closed form. Coordinate descent / LARS / proximal GD.
                  Soft threshold:  wⱼ ← sign(zⱼ)·max(|zⱼ| - λ, 0)
                  Prior: w ~ Laplace(0, b)

Elastic Net       J(w) = ‖y - Xw‖² + λ( α‖w‖₁ + (1-α)‖w‖²₂ )
                  α=1 → lasso;  α=0 → ridge

sklearn note      Ridge/Lasso use `alpha` = λ  (bigger = more regularization)
                  LogisticRegression/SVC use `C` = 1/λ (bigger = LESS regularization)
```

### 08.4 Comparison table

| | Ridge (L2) | Lasso (L1) | Elastic Net |
|---|---|---|---|
| Penalty | `λΣwⱼ²` | `λΣ\|wⱼ\|` | mix |
| Exact zeros? | No | **Yes** | Yes |
| Feature selection | No | Yes | Yes |
| Closed form? | Yes | No | No |
| Correlated features | Spreads weight across them | Picks one ~arbitrarily | **Groups them** |
| `d > n` | Works | Selects at most `n` features | Works |
| Differentiable at 0? | Yes | No (subgradient) | No |
| Prior | Gaussian | Laplace | Mixture |
| Best when | Many small effects; collinearity | Few strong effects; want sparsity | Many correlated features |

### 08.5 Gotchas that fail candidates

- **Not standardizing before regularizing.** The penalty becomes arbitrary.
- **Only giving the geometric sparsity argument.** Give the subgradient/soft-threshold one too; it's
  the mechanism.
- **Saying lasso is always better because it selects features.** With correlated predictors, lasso's
  selection is unstable — resample the data and it picks a different member of the correlated group.
- **Getting the `alpha` vs `C` direction wrong** across `sklearn` estimators.
- **Penalizing the intercept.**
- **Thinking regularization only means an L1/L2 penalty.** Early stopping, subsampling, dropout,
  bagging, `min_samples_leaf` and more data are all regularization.

### 08.6 Hands-on drill

1. Generate data with 100 features where only 5 matter. Fit OLS, ridge and lasso across a λ grid.
   Plot the **regularization paths** (coefficient value vs λ) for all three and confirm you can see
   lasso coefficients hitting exactly zero while ridge's asymptote toward zero.
2. Count how many of the 5 true features lasso recovers, and how many false ones it keeps.
3. Duplicate one of the 5 true features (perfect correlation) and re-fit. Observe that lasso splits or
   arbitrarily picks between the twins while ridge splits the weight evenly, and elastic net keeps
   both. This experiment *is* the answer to the correlated-features question.
4. Implement soft-thresholding coordinate descent for lasso from scratch and confirm it produces
   exact zeros.

### 08.7 2026 interview questions

**Q1 `[MATH]` `[TRAP]` — Why does L1 produce exactly zero coefficients while L2 doesn't?**

**Answer.** Two complementary arguments. **Geometric:** view it as minimizing the loss subject to a
coefficient budget. The L1 constraint region `‖w‖₁ ≤ t` is a diamond whose vertices sit on the
coordinate axes, where some coefficients are exactly zero; the L2 region is a smooth sphere. The
optimum is where the loss's elliptical contours first touch the region, and a region with sharp
axis-aligned corners is very likely to be touched at a corner — producing exact zeros. A sphere has no
corners, so contact is at a generic point with all coefficients small but non-zero. **Analytic (the
mechanism):** the L2 penalty's gradient is `2λwⱼ`, which vanishes as `wⱼ → 0`, so the shrinkage force
disappears precisely where it would need to be strongest — you get asymptotic shrinkage without
arrival. The L1 subgradient is `λ·sign(wⱼ)`, constant in magnitude no matter how small `wⱼ` is, so
there's a persistent constant push to zero and any coefficient whose loss gradient is smaller than λ
is pinned at zero. You can see this explicitly in lasso's coordinate-descent update,
`wⱼ ← sign(zⱼ)·max(|zⱼ|−λ, 0)`, where the `max(·,0)` is the zeroing operation.

*What's being tested:* Depth. Nearly every candidate gives the diamond picture; the subgradient/
soft-threshold mechanism is what distinguishes a strong answer, because it explains *why* the geometry
works.

---

**Q2 `[THEORY]` — Ridge or lasso: how do you choose?**

**Answer.** Start from what you believe about the signal. If you expect many features each
contributing a little — the "dense" case — ridge is better, because it keeps them all and shrinks
proportionally. If you expect a few strong predictors among many irrelevant ones — the "sparse"
case — lasso is better, and hands you feature selection for free. Then check correlation structure:
with groups of correlated predictors, lasso arbitrarily keeps one and zeroes the others, which is
unstable across resamples and can be actively misleading for interpretation, whereas ridge spreads
weight across the group and elastic net selects the group as a unit — so elastic net is usually the
pragmatic default for wide correlated data. Practically: cross-validate all three over a λ grid, and
also weigh the operational factor that a sparse model is cheaper to serve and easier to maintain,
which can justify a small accuracy loss.

*What's being tested:* Whether you reason from the data's structure rather than reciting "L1 selects
features."

*Follow-up:* "Why is lasso's selection unstable with correlated features?" — Among near-duplicates the
loss is nearly flat with respect to which one carries the weight, so tiny sampling changes flip the
choice. If you need stable selection, use elastic net, or run stability selection (bootstrap lasso and
keep features chosen in most resamples).

---

**Q3 `[MATH]` — Show the Bayesian interpretation of ridge regression.**

**Answer.** Ridge is the MAP estimate under a Gaussian prior. Assume `y|X,w ~ N(Xw, σ²I)` and a prior
`w ~ N(0, τ²I)`. The log posterior is `log p(y|X,w) + log p(w) + const`, which equals
`-‖y-Xw‖²/(2σ²) - ‖w‖²/(2τ²) + const`. Maximizing it is minimizing
`‖y-Xw‖² + (σ²/τ²)‖w‖²` — exactly ridge with `λ = σ²/τ²`. The interpretation is illuminating: λ is
the ratio of noise variance to prior variance. Noisy data or a tight prior belief that coefficients
are small ⇒ large λ ⇒ heavy shrinkage. Substituting a Laplace prior in place of the Gaussian yields
the L1 penalty and lasso, and the Laplace density's sharp spike at zero is the probabilistic
counterpart of the L1 diamond's corner.

*What's being tested:* Whether you see regularization as principled inference rather than a
hyperparameter hack. Deriving `λ = σ²/τ²` and interpreting it is the strong finish.

---

**Q4 `[THEORY]` — Name five forms of regularization that aren't an L1/L2 penalty.**

**Answer.** (1) **Early stopping** — halt training when validation loss stops improving; in boosting
and neural nets this is the primary complexity control, and for gradient descent on a convex problem
it's provably related to L2 shrinkage. (2) **Ensembling / bagging** — averaging decorrelated models
reduces variance, which is regularization by another route. (3) **Data augmentation and simply more
data** — the most effective variance reducer when available. (4) **Explicit capacity limits** —
`max_depth`, `min_samples_leaf`, `max_leaf_nodes`, fewer features, lower polynomial degree. (5)
**Stochasticity during training** — dropout in neural networks, and `subsample`/`colsample_bytree` in
gradient boosting, both of which prevent the model from relying on any single path or feature. Two
more worth naming: **noise injection** on inputs or labels (label smoothing), and **structural
constraints** such as monotonicity constraints in XGBoost/LightGBM, which restrict the hypothesis
space using domain knowledge and are increasingly used in regulated settings.

*What's being tested:* Breadth. Candidates who equate regularization with `alpha` reveal a narrow
mental model. This question also sets up Modules 17–18.

---

**Q5 `[APPLIED]` `[TRAP]` — You have 200 samples and 5,000 features. What do you do?**

**Answer.** `d ≫ n`, so `XᵀX` is singular and unregularized OLS has no unique solution — regularization
is mandatory, not optional. Plan: (1) Expect huge variance, so evaluate with repeated or nested
cross-validation and report spread — a single holdout of 40 rows tells you almost nothing. (2) Start
with strongly regularized linear models: lasso or elastic net for sparsity and interpretability, ridge
if you believe many small effects. (3) Reduce dimensionality first where sensible — remove
zero/near-zero-variance features, deduplicate perfectly correlated ones, and consider PCA or a
univariate filter, but *fit any selection inside the CV folds*, because selecting features on all the
data is leakage and is spectacularly optimistic in this regime. (4) Use domain knowledge to prune —
in the `d≫n` regime priors are worth more than algorithms. (5) Be very skeptical of complex models;
a boosted ensemble on 200 rows will overfit, and this is one of the few regimes where a strong
generative model or a simple regularized linear model is genuinely the right final answer. (6) If
possible, get more data — the honest answer is that 200 rows bounds what any method can deliver.

*What's being tested:* Whether you recognize the regime and the leakage trap in feature selection.
The "select inside the CV fold" point is the one most candidates miss.

---

## Module 09 — Gradient Descent & Optimization

| | |
|---|---|
| **Prerequisites** | Modules 01, 06, 07 |
| **Study time** | 8 h |
| **Why it's in the loop** | Every "how does it learn?" question; and the bridge to deep learning |
| **Rounds** | `[THEORY]` `[MATH]` `[CODE]` `[DEBUG]` |

### 09.1 What to learn

1. The core update `w ← w - η∇J(w)`, and why the negative gradient is the steepest-descent direction.
2. **Batch** vs **stochastic** vs **mini-batch** gradient descent — cost, noise, convergence, and
   hardware fit.
3. The learning rate: too small, too large, and divergence. Learning-rate schedules (step, cosine,
   exponential, warmup) and how to find a good rate.
4. Convex vs non-convex objectives: global optimum guarantees, local minima, saddle points, plateaus.
5. Why feature scaling matters: condition number, elongated contours, zig-zagging.
6. **Momentum** and Nesterov accelerated gradient — the intuition and the update rule.
7. Adaptive methods: **AdaGrad**, **RMSProp**, **Adam**, **AdamW** — what each fixes about the
   previous one.
8. Second-order methods: Newton–Raphson, the Hessian, IRLS, **L-BFGS** — and why you can't use full
   Newton on a large `d`.
9. Coordinate descent (how lasso is actually solved) and proximal gradient methods.
10. Convergence criteria, gradient norms, and the difference between "converged" and "hit
    `max_iter`".
11. Vanishing and exploding gradients — where they come from and the standard mitigations.
12. Epochs, iterations, batch size, and the batch-size/learning-rate relationship.
13. **Gradient descent vs gradient boosting** — the same idea in two different spaces. This is a
    favourite question.

### 09.2 Core intuitions

**You're walking downhill in the dark, feeling the slope.** The gradient tells you the steepest uphill
direction at your current position; you step the other way. The learning rate is your stride length.
Too short and you take forever; too long and you leap over the valley and end up higher than you
started.

**Batch vs stochastic is a compute-versus-noise trade.** Batch gradient descent uses all `n` samples
per step: the gradient is exact, the path is smooth, and each step costs `O(nd)` — infeasible when `n`
is huge. SGD uses one sample: each step is `O(d)` and extremely fast, but the gradient is a noisy
estimate so the path jitters and it never quite settles (you need a decaying learning rate to
converge). Mini-batch — typically 32 to 512 — is the practical answer: enough samples to give a
low-variance gradient estimate, small enough to be fast, and shaped to exploit vectorized hardware.
The noise in SGD isn't purely a cost, either: it helps escape sharp local minima and saddle points in
non-convex problems.

**Unscaled features make bowls into canyons.** If one feature ranges 0–1 and another 0–100,000, the
loss surface's contours are extremely elongated ellipses. The gradient at most points is nearly
perpendicular to the direction you actually need to travel, so you zig-zag across the canyon making
tiny progress along it. Standardizing makes the contours near-circular and the gradient points
roughly at the optimum. Formally, convergence rate depends on the condition number of the Hessian, and
scaling improves it. This is *the* reason gradient-based methods need scaling while trees don't.

**Momentum is a heavy ball.** Instead of stepping purely by the current gradient, accumulate a
velocity: `v ← βv + ∇J`, then `w ← w - ηv`. In consistent directions the velocity builds up and you
accelerate; in oscillating directions successive gradients cancel and the oscillation is damped. It
directly attacks the canyon-zig-zag problem, and `β = 0.9` is the near-universal default. Nesterov's
variant evaluates the gradient at the *look-ahead* position `w - ηβv`, which corrects the step slightly
earlier and converges a bit faster.

**Adaptive methods give each parameter its own learning rate.** AdaGrad divides the step by the square
root of the accumulated sum of squared gradients, so rarely-updated parameters (sparse features) get
big steps and frequently-updated ones get small steps — great for sparse data, but the accumulator
grows monotonically so the learning rate decays to zero and learning stalls. RMSProp fixes that by
using an exponentially-decaying average instead of a full sum, so the effective rate doesn't die.
Adam combines RMSProp's per-parameter scaling with momentum, plus bias-correction terms for the
initialization of the two moving averages — which is why it's the default for neural networks.
AdamW fixes a subtle but real bug in Adam's handling of L2: applying weight decay through the
gradient means the adaptive scaling also rescales the decay, so it isn't true L2 regularization;
AdamW **decouples** weight decay from the gradient and applies it directly to the weights, which
measurably improves generalization and is why it's the standard for transformer training.

**Gradient descent and gradient boosting are the same idea in different spaces.** Gradient descent
takes steps in *parameter* space: `w ← w - η∇_w J`. Gradient boosting takes steps in *function*
space: `F ← F - η∇_F J`, where the "step" is a new weak learner fitted to approximate the negative
functional gradient. That's exactly why each boosting tree is fitted to the negative gradient of the
loss with respect to the current predictions (the pseudo-residuals), and why the boosting learning
rate is called shrinkage and plays the same role as η. Being able to state this connection is a
strong senior signal, and it's the cleanest possible setup for Module 17.

**Saddle points, not local minima, are the real problem in high dimensions.** For a critical point to
be a local minimum, *every* eigenvalue of the Hessian must be positive; in `d` dimensions that becomes
increasingly unlikely, so most critical points are saddles. This is why SGD's noise and momentum are
so valuable in non-convex optimization — they help you slide off saddles that a pure deterministic
method could stall on.

### 09.3 Whiteboard formulas

```text
Vanilla GD           w ← w - η·∇J(w)

Momentum             v ← βv + ∇J(w)              (β ≈ 0.9)
                     w ← w - η·v

Nesterov             v ← βv + ∇J(w - ηβv)
                     w ← w - η·v

AdaGrad              G ← G + (∇J)²               (elementwise)
                     w ← w - η·∇J / (√G + ε)     → η decays to 0 (the flaw)

RMSProp              E ← ρE + (1-ρ)(∇J)²         (ρ ≈ 0.9)
                     w ← w - η·∇J / (√E + ε)

Adam                 m ← β₁m + (1-β₁)∇J          (momentum,   β₁ = 0.9)
                     v ← β₂v + (1-β₂)(∇J)²       (RMSProp,    β₂ = 0.999)
                     m̂ = m/(1-β₁ᵗ),  v̂ = v/(1-β₂ᵗ)      ← bias correction
                     w ← w - η·m̂/(√v̂ + ε)

AdamW                Adam step, then decoupled decay:  w ← w - ηλ·w
                     (NOT folded into ∇J — that's the fix over Adam)

Newton–Raphson       w ← w - H⁻¹∇J          cost O(d³) per step — infeasible for large d
                     (L-BFGS approximates H⁻¹ from a window of past gradients)

Linear reg gradient  ∇J = Xᵀ(Xw - y)
Logistic gradient    ∇J = Xᵀ(σ(Xw) - y)          ← identical form
```

### 09.4 Gotchas that fail candidates

- **Saying gradient descent finds the global minimum.** Only for convex objectives. Linear and
  logistic regression are convex; neural nets and MSE-with-sigmoid are not.
- **Not knowing the direction of the batch-size/learning-rate relationship.** Larger batches give
  lower-variance gradients, which generally supports a larger learning rate (the linear-scaling
  heuristic, usually with warmup).
- **Confusing an epoch with an iteration.** One epoch is a full pass over the data; an iteration is
  one parameter update.
- **Not being able to explain why scaling matters** in terms of the loss surface.
- **Saying Adam is always best.** For convex problems L-BFGS often converges faster and needs no
  learning-rate tuning; for well-tuned vision training, SGD with momentum still frequently
  generalizes better than Adam.
- **Not knowing what AdamW actually changes.** "It's Adam with weight decay" is incomplete — the point
  is *decoupled* decay.

### 09.5 Hands-on drill

1. Implement batch GD, SGD and mini-batch GD for linear regression from scratch. Plot loss vs
   iteration for all three on the same axes and observe the noise/smoothness trade.
2. Run the same problem with `η` too small, about right, and too large, and produce a plot of
   divergence. Keep that plot in your head for the debugging question.
3. Run gradient descent on unscaled vs standardized features and count the iterations to convergence.
   The ratio is your evidence for the scaling question.
4. Implement momentum and Adam by hand and compare convergence on an ill-conditioned quadratic where
   the condition number is around 1,000.
5. Verify empirically that logistic regression's log-loss surface has a single minimum from many
   random initializations, while an MSE-with-sigmoid objective reaches different optima.

### 09.6 2026 interview questions

**Q1 `[THEORY]` — Explain gradient descent, and compare batch, stochastic and mini-batch.**

**Answer.** Gradient descent minimizes a differentiable loss by repeatedly stepping in the negative
gradient direction: `w ← w - η∇J(w)`. The gradient points uphill most steeply, so its negative is the
locally fastest descent direction, and η controls the step size. **Batch** computes the gradient over
all `n` samples: exact gradient, smooth monotone descent for suitable η, but `O(nd)` per step and it
requires the whole dataset per update, so it doesn't scale. **Stochastic** uses one sample per step:
`O(d)` per step, so it makes rapid early progress and supports online learning, but the gradient is
noisy, the trajectory oscillates, and it needs a decaying learning rate to converge rather than
hovering. **Mini-batch** (32–512) is the standard compromise: the gradient variance falls roughly as
`1/batch_size`, updates are frequent, and the batch matrix multiply maps efficiently onto GPU/SIMD
hardware. Worth adding that SGD's noise is sometimes a feature — it helps escape saddle points and
sharp minima in non-convex problems.

*What's being tested:* Fundamentals plus practical awareness. The hardware point and the "noise as a
feature" point both signal real experience.

*Follow-up:* "How does batch size interact with learning rate?" — Bigger batches mean lower-variance
gradients, so you can afford a larger learning rate; the common heuristic is to scale the rate
linearly with batch size, usually with a warmup period to avoid instability in the early steps.

---

**Q2 `[DEBUG]` — Your training loss oscillates wildly and sometimes increases. What's wrong?**

**Answer.** Most likely the learning rate is too high, so steps overshoot the minimum and can climb
the far wall of the valley. Check in this order: (1) Lower η by 10× and see if the oscillation
resolves — the cheapest decisive test. (2) Check feature scaling; unscaled features create an
ill-conditioned surface where a rate that's fine in one direction diverges in another. (3) If using
SGD with a very small batch, some oscillation is expected from gradient noise — increase the batch
size or add momentum, which damps oscillation by construction. (4) Look for exploding gradients,
especially with deep models or recurrent structure; apply gradient clipping. (5) Check for numerical
issues — NaNs from `log(0)`, division by zero, or unclipped probabilities in a hand-rolled log-loss.
(6) Confirm the loss is being computed and averaged correctly, since a summed rather than averaged
loss effectively multiplies your learning rate by the batch size. Then use a learning-rate schedule
or an adaptive optimizer to stabilize.

*What's being tested:* Structured debugging with an ordered, cheap-first checklist. The
summed-vs-averaged loss detail is a nice practitioner touch.

---

**Q3 `[THEORY]` `[TRAP]` — Does gradient descent always find the global minimum?**

**Answer.** Only if the objective is convex, in which case any local minimum is global and gradient
descent with an appropriate step size converges to it. Linear regression with squared error and
logistic regression with log-loss are both convex, so yes for those. Neural networks, K-Means, and
sigmoid-plus-MSE are non-convex, so no guarantee — you converge to *a* critical point that depends on
initialization. A crucial nuance for high dimensions: the practical obstacle is usually not local
minima but **saddle points**, because a critical point is only a local minimum if every Hessian
eigenvalue is positive, which becomes improbable as dimension grows. That's why SGD's noise and
momentum matter — they help escape saddles. And empirically, in over-parameterized deep networks most
local minima reached in practice have similar loss values, which is why non-convexity turns out to be
much less damaging than the theory suggests.

*What's being tested:* Precision about convexity plus modern understanding. The saddle-point point
elevates the answer well above "no, it can get stuck in local minima."

---

**Q4 `[THEORY]` — Compare SGD with momentum, RMSProp, Adam and AdamW.**

**Answer.** Each fixes a specific deficiency in the previous one. **SGD with momentum** accumulates a
velocity `v ← βv + ∇J`, which accelerates along consistently-signed directions and damps oscillation
across a narrow valley; it's simple, memory-light, and still gives the best generalization in many
well-tuned vision setups, but it needs careful learning-rate scheduling. **AdaGrad** (worth naming as
the ancestor) scales each parameter's step by the inverse square root of its accumulated squared
gradients — excellent for sparse features, but the accumulator only grows, so the effective rate
decays to zero and learning halts. **RMSProp** replaces the sum with an exponentially-decaying
average, keeping the per-parameter adaptivity without the terminal decay. **Adam** combines RMSProp's
scaling with momentum and adds bias correction for the two moving averages' zero initialization; it's
robust to hyperparameters and the default for transformers and most modern deep learning. **AdamW**
decouples weight decay from the gradient: in Adam, an L2 term added to the gradient also gets divided
by `√v̂`, so the effective regularization varies per parameter and isn't true weight decay — AdamW
applies `w ← w - ηλw` directly to the weights instead, which improves generalization and is the
standard for large-model training today.

*What's being tested:* Whether you understand optimizers as a chain of fixes rather than a list of
names. Correctly stating what AdamW decouples is the single highest-value detail here.

---

**Q5 `[MATH]` `[TRAP]` — How is gradient boosting related to gradient descent?**

**Answer.** It's gradient descent in **function space** rather than parameter space. Ordinary gradient
descent parameterizes the model and steps `w ← w - η∇_w J`. Gradient boosting treats the model
*itself* as the thing being optimized: at each stage it computes the negative gradient of the loss
with respect to the current predictions, `-∂L/∂F(xᵢ)` — the "pseudo-residuals" — then fits a weak
learner to approximate that negative gradient and adds it to the ensemble,
`F_{m} = F_{m-1} + η·h_m`. So the new tree plays the role of the descent direction, and the boosting
learning rate (shrinkage) plays exactly the role of η. Two clarifying consequences: with squared
error the negative gradient is literally the residual `y - F(x)`, which is why the intuitive "fit the
residuals" description works for regression; and with log-loss it isn't the raw residual but
`y - p`, which is why you must say "negative gradient" rather than "residual" to be correct in
general. XGBoost extends the analogy to second order by using a Taylor expansion with both gradient
and Hessian, making it the function-space analogue of Newton's method.

*What's being tested:* Whether you see the unifying principle. This is one of the highest-signal
questions in the whole ML interview canon, and the "it's residuals only for MSE" nuance is what marks
a genuinely deep answer.

---

**Q6 `[THEORY]` — Why does feature scaling speed up gradient descent, when it doesn't affect a
tree at all?**

**Answer.** Gradient descent's convergence rate depends on the **condition number** of the loss
surface — roughly, the ratio of the largest to smallest curvature. With features on very different
scales, the loss contours are extremely elongated ellipses, so the gradient at most points is nearly
perpendicular to the direction of the minimum and the trajectory zig-zags across the narrow valley,
taking many iterations to travel along it. Any single learning rate is then simultaneously too large
for the steep direction and too small for the flat one. Standardizing makes the contours roughly
circular, so the gradient points near the optimum and convergence is fast. A decision tree, by
contrast, evaluates splits as threshold comparisons *within* a single feature and ranks candidate
thresholds — an operation invariant to any monotone rescaling — so scaling changes nothing about the
tree it builds. Same reason distance-based methods (KNN, K-Means, SVM, PCA) need scaling: they combine
features into a single geometric quantity, and trees never do.

*What's being tested:* Whether you can explain the *mechanism* rather than repeating the rule. The
"trees rank thresholds within one feature" framing is the clean way to say it.

---

# Part C — Evaluation

## Module 10 — Classification Metrics & the Confusion Matrix

| | |
|---|---|
| **Prerequisites** | Modules 03, 05, 07 |
| **Study time** | 10 h |
| **Why it's in the loop** | Guaranteed. Metric selection is the most-asked applied topic in 2026. |
| **Rounds** | `[THEORY]` `[APPLIED]` `[MATH]` `[TRAP]` |

If you master one module beyond logistic regression, make it this one. Interviewers use metric
questions to test business judgment, and a wrong metric choice invalidates an otherwise good project.

### 10.1 What to learn

1. The confusion matrix: TP, FP, TN, FN — and being able to draw it correctly, labelled, from memory.
2. Accuracy, and the **accuracy paradox** on imbalanced data.
3. **Precision** = TP/(TP+FP): of the ones I flagged, how many were right?
4. **Recall** / sensitivity / TPR = TP/(TP+FN): of the real positives, how many did I catch?
5. **Specificity** / TNR = TN/(TN+FP); **FPR** = 1 − specificity.
6. **F1** as the harmonic mean, and **F-beta** for asymmetric weighting.
7. The precision–recall tradeoff and why it's driven entirely by the threshold.
8. **ROC curve** and **ROC-AUC** — including AUC's probabilistic interpretation.
9. **Precision–Recall curve** and **PR-AUC / average precision** — and when to prefer it over ROC-AUC.
10. Why ROC-AUC is misleadingly optimistic under severe imbalance.
11. **Log-loss** and **Brier score** — probability-quality metrics, not label metrics.
12. **Calibration**: reliability diagrams, expected calibration error, Platt scaling, isotonic
    regression.
13. **MCC** (Matthews correlation coefficient), Cohen's kappa, balanced accuracy — and when each is
    the right answer.
14. Threshold selection from an explicit **cost matrix**; expected-cost minimization.
15. Multi-class: per-class metrics, and **macro vs micro vs weighted** averaging.
16. Multi-label metrics: Hamming loss, subset accuracy, mAP.
17. Ranking metrics you should recognize: precision@k, recall@k, MAP, NDCG.
18. Business metrics vs model metrics, and how to translate between them.

### 10.2 Core intuitions

**Draw the matrix, always.** In any metric question, draw it first. It anchors the discussion and
prevents the precision/recall mix-up that ends interviews.

```text
                        PREDICTED
                    Positive      Negative
              ┌───────────────┬───────────────┐
   A  Positive│      TP       │      FN       │  ← Recall = TP/(TP+FN)
   C          │  (correct hit)│    (miss)     │     "of real positives, caught?"
   T          ├───────────────┼───────────────┤
   U  Negative│      FP       │      TN       │  ← Specificity = TN/(TN+FP)
   A          │  (false alarm)│(correct pass) │
   L          └───────────────┴───────────────┘
                      ↑
              Precision = TP/(TP+FP)
              "of my flags, how many were real?"
```

Mnemonic that survives interview pressure: **precision is a column** (it divides by what you
predicted positive); **recall is a row** (it divides by what actually is positive).

**Precision protects the user from false alarms; recall protects the business from misses.** Every
metric question reduces to: which error is more expensive here? Missing a cancer diagnosis (FN) is
catastrophic; a false cancer alert (FP) costs an unnecessary biopsy. So recall dominates. Wrongly
blocking a legitimate customer's card (FP) causes churn; missing a small fraudulent charge (FN) costs
the transaction value. So the balance depends on relative amounts, and the right answer is an
expected-cost calculation, not a metric name.

**The threshold, not the model, moves you along the tradeoff.** Lower the threshold and you flag more
things: recall rises, precision falls. Raise it and the reverse. A single trained model gives you an
entire curve of operating points, which is why threshold-free metrics (AUC) measure *ranking quality*
while threshold-dependent metrics (precision, recall, F1) measure a *specific operating point*.
Understanding this distinction is the backbone of the module.

**ROC-AUC has a clean probabilistic meaning.** It equals the probability that a randomly chosen
positive is ranked above a randomly chosen negative. 0.5 is random, 1.0 is perfect ranking, and below
0.5 means your scores are inverted. It's threshold-free and invariant to class balance — that last
property is both its strength and its trap.

**Why ROC-AUC misleads under severe imbalance.** ROC plots TPR against FPR, and FPR has the *large*
negative count in its denominator. With 1,000,000 negatives and 1,000 positives, going from 1,000 to
11,000 false positives moves FPR from 0.001 to 0.011 — a visually negligible shift on the ROC curve —
while precision collapses from 0.5 to about 0.08. The ROC curve barely registers a change that has
just made your alert queue 92% junk. The PR curve, whose precision axis has the *predicted-positive*
count in its denominator, shows it immediately. Hence: **for rare-positive problems, use PR-AUC /
average precision.** Note also that the PR-curve baseline is the positive rate (0.001 here), not 0.5,
so a PR-AUC of 0.15 can be an excellent model.

**F1 is a default, not a principle.** It's the harmonic mean of precision and recall, so it punishes a
large imbalance between them — you can't get a good F1 by sacrificing one entirely. But it implicitly
asserts that precision and recall matter equally, which is rarely true. If recall is twice as
important, use F2 (`β=2` weights recall more); if precision matters more, F0.5. If you can quantify
costs at all, skip F-beta and minimize expected cost directly. Also note F1 ignores TN entirely, which
is usually appropriate for rare-positive problems and inappropriate when both classes matter.

**Discrimination and calibration are different things.** A model that outputs `p/1000` for every case
has identical ranking to one outputting `p` — the same AUC — but is uselessly miscalibrated. If a human
or a rule consumes the *number*, you need calibration; if only the *order* matters, you need
discrimination. Say which one the application needs.

**MCC is the most honest single number for a binary confusion matrix.** It uses all four cells,
returns −1 to +1 with 0 as random, and unlike F1 it can't be inflated by a degenerate
predict-everything-positive strategy on imbalanced data. It's underused and naming it scores well.

### 10.3 Whiteboard formulas

```text
Accuracy          = (TP+TN) / (TP+TN+FP+FN)
Precision (PPV)   = TP / (TP+FP)
Recall/TPR/Sens.  = TP / (TP+FN)
Specificity/TNR   = TN / (TN+FP)
FPR               = FP / (FP+TN)  = 1 - specificity
FNR               = FN / (FN+TP)  = 1 - recall
NPV               = TN / (TN+FN)

F1                = 2·P·R / (P+R)                  (harmonic mean)
F-beta            = (1+β²)·P·R / (β²·P + R)        β>1 favours recall
Balanced accuracy = (Recall + Specificity)/2

MCC = (TP·TN - FP·FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN))       ∈ [-1, 1]

Log-loss  = -(1/n) Σ [ yᵢ log pᵢ + (1-yᵢ) log(1-pᵢ) ]
Brier     =  (1/n) Σ (pᵢ - yᵢ)²

ROC    : TPR (y) vs FPR (x), swept over thresholds. Baseline = diagonal.
         AUC = P(score of random positive > score of random negative)
PR     : Precision (y) vs Recall (x). Baseline = positive class rate.
         AUC ≈ average precision

Expected cost at threshold t:
   E[cost](t) = FP(t)·C_FP + FN(t)·C_FN        ← minimize this over t
Optimal threshold for a calibrated model:
   t* = C_FP / (C_FP + C_FN)
```

That last line is worth memorizing. If a false positive costs £10 and a false negative costs £190,
then `t* = 10/200 = 0.05` — flag anything above a 5% predicted probability. Producing that formula in
an applied round is a standout moment.

### 10.4 Metric selection guide

| Situation | Primary metric | Why |
|---|---|---|
| Balanced classes, symmetric costs | Accuracy, F1 | Simple and meaningful |
| Rare positives (fraud, disease, defects) | **PR-AUC / average precision** | ROC-AUC hides FP growth |
| Missing a positive is catastrophic | **Recall** (with a precision floor) | FN cost dominates |
| False alarms are expensive/annoying | **Precision** (with a recall floor) | FP cost dominates |
| Costs are quantifiable | **Expected cost** at tuned threshold | Directly optimizes the objective |
| Score feeds a downstream calculation | **Log-loss / Brier + calibration** | Need honest probabilities |
| Comparing models' ranking ability | ROC-AUC (balanced) or PR-AUC (imbalanced) | Threshold-free |
| Multi-class, all classes equally important | **Macro-F1** | Rare classes weighted equally |
| Multi-class, overall correctness matters | **Micro-F1** / accuracy | Weighted by frequency |
| Single honest summary on imbalanced data | **MCC** | Uses all four cells |
| Top-k results shown to a user | precision@k, NDCG | Matches what users see |

### 10.5 Gotchas that fail candidates

- **Reporting accuracy on an imbalanced problem** without flagging it. Instant negative signal.
- **Mixing up precision and recall** under pressure. Use the row/column mnemonic.
- **Defaulting to ROC-AUC** for a 0.1%-positive problem.
- **Reporting F1 without saying which class it's for**, or macro/micro without saying which.
- **Not knowing that AUC is threshold-free** and therefore says nothing about your operating point.
- **Tuning the threshold on the test set.** Tune it on validation.
- **Confusing calibration with accuracy.**
- **Forgetting the PR baseline isn't 0.5.** A PR-AUC of 0.3 on a 1%-positive problem is 30× baseline.

### 10.6 Hands-on drill

1. Compute all of the above metrics from a raw confusion matrix by hand, on paper, for a case with
   TP=40, FP=60, FN=10, TN=9890. Then reproduce them with `sklearn` and check yourself.
2. On an imbalanced dataset, plot the ROC curve and the PR curve side by side for the same model.
   Then add 10× more negatives and re-plot both. The ROC curve will barely move; the PR curve will
   collapse. **This experiment is the single best preparation for the ROC-vs-PR question.**
3. Sweep the threshold from 0 to 1 and plot precision, recall and F1 against it. Locate the F1-maximal
   threshold and note how far it is from 0.5.
4. Define a cost matrix (`C_FP = 10`, `C_FN = 190`), compute expected cost across thresholds, find the
   minimizing threshold empirically, and confirm it lands near the `C_FP/(C_FP+C_FN)` prediction for a
   calibrated model.
5. Plot reliability diagrams for logistic regression, an SVM decision function, and untuned XGBoost.
   Then apply Platt scaling and isotonic regression to the latter two and re-plot.

### 10.7 2026 interview questions

**Q1 `[THEORY]` — Draw the confusion matrix and define precision and recall.**

**Answer.** Draw a 2×2 with actual on rows and predicted on columns: TP and FN on the positive-actual
row, FP and TN on the negative-actual row. **Precision = TP/(TP+FP)** — of everything I predicted
positive, what fraction really was; it's computed down the predicted-positive *column* and it answers
"can I trust my alerts?" **Recall = TP/(TP+FN)** — of all the actual positives, what fraction I
caught; it's computed across the actual-positive *row* and answers "am I missing cases?" They trade
off against each other through the threshold: lowering it flags more, raising recall and lowering
precision.

*What's being tested:* Absolute fundamentals. Any hesitation here is costly. Practise until it's
reflexive, and always draw the matrix.

*Follow-up:* "What's specificity, and where is it used?" — `TN/(TN+FP)`, recall for the negative class.
It's the standard companion to sensitivity in medical testing, and `1 − specificity` is the FPR that
forms the ROC curve's x-axis.

---

**Q2 `[APPLIED]` `[TRAP]` — Your fraud model has 99.9% accuracy. Are you happy?**

**Answer.** No, and I'd be suspicious. If fraud is 0.1% of transactions, a model that predicts "never
fraud" for everything achieves exactly 99.9% accuracy while catching zero fraud — so the number is
consistent with a completely useless model. That's the accuracy paradox: on imbalanced data, accuracy
is dominated by the majority class and carries almost no information. What I'd ask for instead: the
full confusion matrix, recall (what fraction of fraud we catch), precision (how much of the alert
queue is real, since a human team has to work it), PR-AUC as the threshold-free summary, and the
expected cost given the actual cost of a missed fraud versus a false decline. Then I'd set the
threshold by minimizing that expected cost rather than defaulting to 0.5.

*What's being tested:* Whether you spot the trap immediately. This is probably the single most
frequently asked ML interview question of the last decade and it's still standard in 2026 — the
expected-cost extension is what makes the answer strong rather than merely correct.

---

**Q3 `[THEORY]` `[TRAP]` — ROC-AUC vs PR-AUC. When must you use PR?**

**Answer.** ROC plots TPR against FPR; PR plots precision against recall. Use PR when the positive
class is rare and you care about the quality of your positive predictions. The reason is in the
denominators: FPR is `FP/(FP+TN)`, so with an enormous negative count the denominator is huge and even
a large absolute increase in false positives barely moves FPR — the ROC curve stays high and looks
great. Precision is `TP/(TP+FP)`, whose denominator is the predicted-positive set, so the same increase
in FP visibly destroys precision. Concretely with 1,000 positives and 1,000,000 negatives: going from
1,000 to 11,000 false positives shifts FPR from 0.001 to 0.011 — invisible on ROC — while precision
falls from 0.5 to 0.08. Two additional points: ROC-AUC is invariant to class balance, which makes it
good for comparing models across datasets with different base rates but bad for judging real-world
usability; and the PR curve's baseline is the positive rate, not 0.5, so PR-AUC values must be read
relative to that base rate.

*What's being tested:* Whether you can explain the mechanism with numbers, not just state the rule.
The worked numeric example is what makes this answer memorable.

---

**Q4 `[APPLIED]` — How do you choose the classification threshold?**

**Answer.** From business cost, not from the model. If the costs of a false positive and a false
negative are quantifiable, minimize expected cost: `E[cost](t) = FP(t)·C_FP + FN(t)·C_FN`, swept over
`t` on a validation set. For a well-calibrated model this has a clean closed form:
`t* = C_FP/(C_FP + C_FN)` — so if a false negative is 19× as expensive as a false positive, the
optimal threshold is 0.05, not 0.5. If costs aren't quantifiable, use an operational constraint
instead: fix the alert volume your review team can actually handle and take the top-k by score, or fix
a minimum acceptable precision and maximize recall subject to it. Two disciplines matter: tune the
threshold on validation data, never on test; and re-check it after deployment, because the optimal
threshold shifts when the base rate drifts.

*What's being tested:* Whether you understand that 0.5 is an arbitrary default. The closed-form
threshold and the "re-check after drift" point are both strong differentiators.

*Follow-up:* "What if the model isn't calibrated?" — The closed form doesn't apply; calibrate first
(Platt or isotonic on held-out data), or just find the empirical cost-minimizing threshold by direct
sweep, which works regardless of calibration.

---

**Q5 `[THEORY]` — Why is F1 the harmonic mean rather than the arithmetic mean?**

**Answer.** Because the harmonic mean is dominated by the smaller value, which is exactly the
behaviour you want. Take precision 1.0 and recall 0.01 — a model that flags one thing, correctly, and
misses 99% of positives. The arithmetic mean is 0.505, which flatters a useless model. The harmonic
mean is `2(1×0.01)/(1.01) ≈ 0.02`, correctly near-zero. So F1 can only be high when *both* precision
and recall are decent, preventing you from gaming it by collapsing one of them. Worth adding two
caveats: F1 assumes precision and recall matter equally, so use F-beta when they don't; and F1 ignores
TN entirely, which is appropriate for rare-positive detection and inappropriate when correctly
identifying negatives has value.

*What's being tested:* Whether you understand why a metric is constructed the way it is. The numeric
example is the fastest way to demonstrate it.

---

**Q6 `[APPLIED]` — Pick a metric for: (a) cancer screening, (b) spam filtering, (c) credit default,
(d) a recommendation feed.**

**Answer.** (a) **Cancer screening** — recall/sensitivity dominates, since a missed cancer is
potentially fatal while a false positive costs a follow-up test. So maximize recall subject to a
precision floor that keeps the follow-up burden feasible; report sensitivity at a fixed specificity,
which is the convention clinicians use. (b) **Spam filtering** — precision dominates, because a
legitimate email sent to spam is far worse for the user than one spam message reaching the inbox. So
maximize recall subject to a very high precision constraint, and consider a three-way outcome (inbox /
spam / quarantine) rather than a binary decision. (c) **Credit default** — costs are directly
monetizable, so use expected cost with the actual loss-given-default versus the foregone-interest cost
of a wrongly declined applicant, and require **calibrated probabilities** because the score feeds
pricing and capital calculations, plus interpretability for regulatory reasons. (d) **Recommendation
feed** — it's a ranking problem, not a classification one, so use top-k metrics: precision@k, NDCG,
MAP — because users only see the top few items — and validate against an online engagement metric via
A/B test, since offline ranking metrics correlate imperfectly with real behaviour.

*What's being tested:* Whether you can map business context to metric choice fluently. Recognizing (d)
as ranking rather than classification is a specific differentiator.

---

**Q7 `[THEORY]` — Macro vs micro vs weighted averaging in multi-class problems.**

**Answer.** **Macro** computes the metric per class and takes an unweighted mean, so every class counts
equally regardless of size — use it when rare classes matter as much as common ones, which is usually
the case when you're evaluating fairness across categories. **Micro** pools all TP/FP/FN across
classes and computes one global metric, so it's dominated by frequent classes; for single-label
multi-class classification, micro-F1 equals overall accuracy. **Weighted** averages the per-class
metric weighted by class support, a middle ground that reflects the population but can still hide poor
performance on rare classes. Rule of thumb: report macro when class importance is uniform, micro/
accuracy when you care about overall correct-decision rate, and always report the per-class breakdown
alongside — a single averaged number can conceal one class at zero recall.

*What's being tested:* Precision on a routinely fudged topic. The "micro-F1 equals accuracy" identity
is a good detail.

---

**Q8 `[THEORY]` — What is calibration, how do you measure it, and how do you fix it?**

**Answer.** A model is calibrated when its predicted probabilities match observed frequencies — among
cases scored 0.7, about 70% are positive. It's distinct from discrimination: a model can rank
perfectly (AUC 1.0) and still be badly calibrated, and vice versa. Measure it with a **reliability
diagram** (bin predictions, plot mean predicted probability against observed positive rate; the
diagonal is perfect), **expected calibration error** (the average bin-wise gap), or the **Brier
score** (mean squared error of the probability, which combines calibration and discrimination). Fix it
with a post-hoc mapping fitted on **held-out** data: **Platt scaling** fits a one-dimensional logistic
regression on the model's scores — parametric, works with little data, assumes a sigmoid-shaped
distortion; **isotonic regression** fits a non-parametric monotone mapping — more flexible, can correct
any monotone distortion, needs more data and can overfit on small sets. Which models need it: SVMs
badly, since hinge loss doesn't estimate probabilities at all; boosted trees usually, since they tend
toward over-confidence; Random Forests mildly, typically under-confident at the extremes because of
averaging; logistic regression usually not, since it's trained on a proper scoring rule.

*What's being tested:* A topic that has grown much more prominent in 2026 loops. Knowing which models
are miscalibrated *in which direction* is a strong practitioner signal.

---

**Q9 `[THEORY]` — What is MCC and why might you prefer it?**

**Answer.** The Matthews correlation coefficient is essentially the Pearson correlation between the
predicted and actual binary labels:
`(TP·TN − FP·FN)/√((TP+FP)(TP+FN)(TN+FP)(TN+FN))`, ranging from −1 (perfectly wrong) through 0
(random) to +1 (perfect). Its advantage is that it uses **all four cells** of the confusion matrix, so
unlike F1 — which ignores TN — it can't be inflated by a degenerate strategy on imbalanced data. A
model predicting all-positive on a 1%-positive dataset gets a non-trivial F1 but an MCC of
approximately 0. It's therefore the most trustworthy single-number summary for imbalanced binary
problems, and it's symmetric under swapping which class you call positive, which F1 is not.

*What's being tested:* Breadth beyond the standard four metrics. Naming MCC unprompted, with the
"uses all four cells" justification, is a clear positive signal.

---

## Module 11 — Regression Metrics

| | |
|---|---|
| **Prerequisites** | Modules 03, 06 |
| **Study time** | 4 h |
| **Why it's in the loop** | Any regression case study; and the MAE-vs-RMSE question is standard |
| **Rounds** | `[THEORY]` `[APPLIED]` `[TRAP]` |

### 11.1 What to learn

1. **MSE**, **RMSE**, **MAE** — definitions, units, and outlier sensitivity.
2. Why RMSE ≥ MAE always, and what the gap tells you about your error distribution.
3. **MAPE** and its failure modes (undefined at zero, asymmetric penalty); **SMAPE**, **WAPE**,
   **MASE**.
4. **R²** and adjusted R²; out-of-sample R² and why it can be negative.
5. **Huber loss** and **quantile loss** — and the fact that each metric corresponds to predicting a
   different statistic.
6. **RMSLE** for multiplicative/skewed targets.
7. Which statistic each loss actually predicts: MSE → the conditional **mean**, MAE → the conditional
   **median**, quantile loss → a conditional **quantile**. This is the highest-value idea in the
   module.
8. Aligning the metric with the business cost of over- vs under-prediction.
9. Residual analysis as evaluation, not just as an assumption check.
10. Time-series-specific evaluation: naive/seasonal-naive baselines, backtesting, forecast horizons.

### 11.2 Core intuitions

**Your loss choice decides which statistic you predict.** This is the deepest idea here and it makes
several interview questions trivial. Minimizing squared error over a set of numbers gives the **mean**;
minimizing absolute error gives the **median**; minimizing asymmetric quantile (pinball) loss gives
that **quantile**. So a model trained with MSE predicts the conditional mean of `y|x`, and one trained
with MAE predicts the conditional median. On a right-skewed target — house prices, insurance claims,
revenue — those are very different numbers, and choosing between them is a business decision, not a
technical preference.

**RMSE punishes large errors; MAE treats all errors linearly.** Squaring means one error of 10
contributes as much as a hundred errors of 1. Choose RMSE when a few large misses are genuinely much
worse than many small ones (a badly wrong ETA, a large capacity shortfall). Choose MAE when errors
scale linearly with cost and you don't want a handful of outliers to dominate. Huber gives you both:
quadratic near zero for a smooth gradient, linear in the tails for robustness, with the crossover set
by δ.

**The RMSE/MAE gap is a free diagnostic.** RMSE ≥ MAE always, by Jensen's inequality, with equality
only when all errors are identical in magnitude. A large ratio means your error distribution is
heavy-tailed — a few big misses. So reporting both, and commenting on the gap, tells the interviewer
something a single number can't: RMSE 40 with MAE 12 is a very different model from RMSE 14 with
MAE 12, and only the first one has an outlier problem worth investigating.

**MAPE is asymmetric and often the wrong choice.** `|y−ŷ|/|y|` is undefined when `y = 0` and explodes
as `y → 0`. Worse, it penalizes over-prediction more than under-prediction: predicting 150 when the
truth is 100 gives 50% error, but predicting 50 gives the same 50% while predicting 0 caps out at
100%. So a MAPE-optimizing model is systematically biased low. It's popular because "percent error"
communicates well to stakeholders — so if you must report it, pair it with WAPE (total absolute error
divided by total actual, which is robust to near-zero rows) or MASE (scaled against a naive
forecast).

**Always report against a baseline.** RMSE of 4,200 is meaningless alone. RMSE of 4,200 versus 11,000
for "predict the mean" and 5,100 for "predict last month's value" is a result. For time series the
seasonal-naive baseline is the standard bar, and beating it is genuinely harder than people expect.

### 11.3 Whiteboard formulas

```text
MSE    = (1/n) Σ (yᵢ - ŷᵢ)²                     units: target²
RMSE   = √MSE                                    units: target      ← report this one
MAE    = (1/n) Σ |yᵢ - ŷᵢ|                       units: target
MAPE   = (100/n) Σ |yᵢ - ŷᵢ|/|yᵢ|                undefined at yᵢ=0
WAPE   = Σ|yᵢ - ŷᵢ| / Σ|yᵢ|                      robust alternative
RMSLE  = √( (1/n) Σ (log(1+yᵢ) - log(1+ŷᵢ))² )   penalizes under-prediction more

R²     = 1 - SSres/SStot                         can be < 0 out-of-sample

Huber (δ):  ½e²                for |e| ≤ δ
            δ|e| - ½δ²         for |e| >  δ

Quantile (pinball) loss for quantile τ:
            max( τ·e , (τ-1)·e )        where e = y - ŷ
            τ=0.5 → MAE/2 → predicts the median

Which statistic does the minimizer predict?
   MSE  → conditional MEAN
   MAE  → conditional MEDIAN
   pinball(τ) → conditional τ-QUANTILE
```

### 11.4 Gotchas that fail candidates

- **Reporting MSE rather than RMSE** to a stakeholder. Squared units are uninterpretable.
- **Using MAPE on data containing zeros or near-zeros.**
- **Not knowing that MSE targets the mean and MAE the median.** This is the differentiating fact.
- **Reporting a metric with no baseline.**
- **Assuming R² near 1 means a good model** — it can be leakage, or a trivially predictable target.
- **Ignoring the sign of the error** when over- and under-prediction have different costs.

### 11.5 Hands-on drill

1. On a right-skewed target, train two models — one with MSE, one with MAE — and compare their
   predictions against the conditional mean and median. Confirm the theory holds.
2. Add 1% extreme outliers and re-measure both. Quantify how much more the MSE model moves.
3. Fit a quantile-regression model (or `LGBMRegressor(objective='quantile', alpha=0.9)`) and produce
   a 10th/50th/90th-percentile prediction interval. Being able to say "I shipped a P90 rather than a
   mean, because under-supply cost 5× over-supply" is a strong applied answer.
4. Compute RMSE, MAE and their ratio on a real dataset; interpret the ratio.

### 11.6 2026 interview questions

**Q1 `[THEORY]` `[TRAP]` — RMSE or MAE? How do you choose?**

**Answer.** It depends on how error cost scales and how you want outliers treated. RMSE squares errors,
so large misses dominate — use it when one big error is much worse than several small ones, e.g. a
severely wrong delivery ETA or a large inventory shortfall. MAE weights all errors linearly — use it
when cost is proportional to error size and you don't want a handful of anomalies to steer the model.
The deeper distinction: a model trained on squared error predicts the conditional **mean** of `y|x`,
while one trained on absolute error predicts the conditional **median**. On a skewed target those
differ substantially, so the choice is really "does the business want the average or the typical
case?" Practically I'd report both, since RMSE ≥ MAE always and the size of the gap reveals how
heavy-tailed the errors are. If I wanted robustness without giving up a smooth gradient, I'd use Huber.

*What's being tested:* Whether you can go beyond "RMSE punishes outliers more." The mean-versus-median
point is what marks a genuinely strong answer.

*Follow-up:* "So which is easier to optimize?" — MSE is differentiable everywhere and has a closed
form for linear models; MAE has a discontinuous derivative at zero, so it needs subgradient or
specialized methods. That convenience is a real reason MSE is the default, independent of whether it's
the right cost.

---

**Q2 `[APPLIED]` `[TRAP]` — Your stakeholder wants MAPE. What do you say?**

**Answer.** I'd accept it as a *reporting* metric while flagging three problems and proposing a
companion. First, MAPE is undefined when the actual is zero and explodes as it approaches zero, so if
the target has any zeros or small values the metric is unstable or unusable. Second, it's
**asymmetric**: over-prediction can incur an unbounded percentage error while under-prediction is
capped at 100%, so a model optimized for MAPE is systematically biased toward under-predicting — which
is exactly the wrong bias if under-supply is the expensive direction. Third, it weights low-value rows
far more heavily than high-value ones, which usually inverts the business priority. I'd therefore
report MAPE for communication but add **WAPE** (total absolute error over total actual), which is
robust to small denominators and aggregates the way the business actually experiences error, and use
RMSE or a quantile loss for model selection. For time series I'd add **MASE**, which scales the error
against a naive forecast and is comparable across series.

*What's being tested:* Whether you can push back on a metric request constructively rather than either
capitulating or refusing. The asymmetry-induced bias is the key technical point.

---

**Q3 `[APPLIED]` — Under-predicting demand costs you 5× what over-predicting does. How do you build
for that?**

**Answer.** Encode the asymmetry in the objective rather than fixing it afterwards. The cleanest
approach is **quantile regression** with a pinball loss at `τ = 5/6 ≈ 0.83`, which directly targets
the quantile where the marginal cost of over- and under-prediction balances — most gradient-boosting
libraries support this via a quantile objective, and it's a one-line change. Alternatively use a
custom asymmetric loss that multiplies the under-prediction branch by 5, which XGBoost and LightGBM
support through a custom gradient/Hessian. A weaker but common fallback is to train a mean model and
apply a learned safety-stock multiplier, but that's a post-hoc patch that doesn't adapt per-row — a
quantile model gives you a *conditional* buffer that's larger where uncertainty is genuinely larger.
Evaluate with the same asymmetric cost you optimized, plus the realized total cost on a backtest,
never plain RMSE — because a model that's better on RMSE can easily be worse on your actual cost.

*What's being tested:* Whether you can align the loss function with an asymmetric business cost.
Naming quantile regression and computing `τ = 5/6` is exactly the answer senior interviewers want.

---

**Q4 `[THEORY]` `[TRAP]` — Your regression has R² = 0.95. Is the model good?**

**Answer.** Probably suspicious rather than good, and I'd check four things before celebrating. (1) **Is
it out-of-sample?** In-sample R² rises mechanically with feature count, so 0.95 on training data may
mean nothing. (2) **Leakage** — a very high R² on a genuinely hard target is the classic leakage
signature; I'd look for a feature computed from or after the outcome. (3) **Is the target trivially
predictable?** If `y` is nearly a linear function of an obvious input (predicting total price from
quantity × unit price), 0.95 is unimpressive — compare against a naive baseline before drawing any
conclusion. (4) **Autocorrelation** — on a trending time series, R² against the mean is flattering
because the mean is a terrible baseline; compare against a seasonal-naive forecast instead. And
separately, R² says nothing about whether errors are *usefully* small: I'd want RMSE and MAE in the
target's own units and a residual plot, because R² can be high while errors remain operationally
unacceptable.

*What's being tested:* Skepticism toward good news. Interviewers deliberately offer a flattering number
to see whether you interrogate it.

---

## Module 12 — Imbalanced Data

| | |
|---|---|
| **Prerequisites** | Modules 04, 05, 10 |
| **Study time** | 6 h |
| **Why it's in the loop** | Nearly every real classification problem, and every fraud/churn case study |
| **Rounds** | `[APPLIED]` `[THEORY]` `[CODE]` `[TRAP]` |

### 12.1 What to learn

1. Why imbalance is a problem — and, importantly, when it **isn't**.
2. Metric-level responses (usually the first and best move): PR-AUC, recall at fixed precision,
   expected cost, MCC, threshold tuning.
3. Algorithm-level responses: `class_weight='balanced'`, `scale_pos_weight` in XGBoost, focal loss,
   cost-sensitive learning.
4. Data-level responses: random oversampling, random undersampling, **SMOTE**, Borderline-SMOTE,
   ADASYN, Tomek links, edited nearest neighbours, and hybrid samplers.
5. **The critical rule: resample only the training fold, never the validation or test fold**, and
   always inside the CV loop.
6. Why resampling distorts calibration, and how to correct predicted probabilities afterwards.
7. Ensemble approaches: BalancedRandomForest, EasyEnsemble, RUSBoost.
8. Threshold moving as the cheapest and often best intervention.
9. Anomaly-detection framing for extreme imbalance (< 0.1%): Isolation Forest, One-Class SVM, LOF,
   autoencoder reconstruction error.
10. Collecting or generating better data, and reframing the problem (e.g. ranking instead of
    classification).
11. The order in which to try these things.

### 12.2 Core intuitions

**Imbalance is usually a metric and threshold problem before it's a data problem.** The model's
*ranking* is often fine; what's broken is that a 0.5 threshold on a 1%-positive problem predicts
almost nothing positive, and accuracy hides it. So the correct first moves are free: switch to PR-AUC
and MCC, tune the threshold on validation, and use `class_weight='balanced'`. Reach for SMOTE later,
if at all. Candidates who open with "I'd apply SMOTE" reveal a recipe-following mindset; candidates
who open with "first I'd fix the metric and the threshold" sound like practitioners.

**Class weighting and resampling do similar things by different means.** Weighting multiplies the
minority class's contribution to the loss, so errors on rare cases cost more. Oversampling duplicates
minority rows, which — for most losses — has the same effect as weighting but costs more memory and
compute. Undersampling discards majority rows, which is fast and can help on very large datasets but
throws away real information. Weighting is generally the cleaner default because it doesn't touch the
data.

**SMOTE creates synthetic minority points along lines between real minority neighbours.** For each
minority sample it picks one of its `k` minority neighbours and generates a point somewhere on the
segment between them. That's more useful than plain duplication because it broadens the minority
region rather than just re-weighting existing points. But it has real failure modes: it interpolates
in feature space, so it produces nonsense for categorical features (SMOTE-NC exists for this) and can
generate implausible combinations; it amplifies label noise, since a mislabeled minority point spawns
synthetic mislabeled neighbours; it degrades in high dimensions where nearest-neighbour distances lose
meaning; and it can bridge into majority territory, blurring the boundary. Empirically it helps far
less often than its popularity suggests, particularly with gradient-boosted trees.

**Resampling before splitting is a leakage bug, and it's a specific one worth understanding.** If you
SMOTE the full dataset and then split, synthetic points interpolated *from* test-set minority
neighbours end up in the training set. The model has effectively seen the test data, and your CV score
will be dramatically inflated. Same for oversampling: duplicates of the same row land on both sides of
the split. The fix is to resample inside the pipeline so it happens per training fold —
`imblearn.pipeline.Pipeline` exists specifically because `sklearn`'s pipeline can't do this correctly.
Being able to state this crisply is one of the highest-value things in this module.

**Resampling breaks calibration.** After oversampling the minority class, the model's implied base rate
is the resampled one, not reality, so predicted probabilities are systematically too high. If you only
need a ranking or a tuned threshold, that's tolerable. If you need honest probabilities for an
expected-cost calculation, either avoid resampling, or recalibrate on an unresampled held-out set, or
apply the prior-correction adjustment to shift the probabilities back to the true base rate.

**Below roughly 0.1% positive, reconsider the framing.** With extreme rarity you may have too few
positives to learn a supervised boundary at all — a few hundred positives against millions of
negatives. Then anomaly detection (Isolation Forest, one-class methods, autoencoder reconstruction
error) trained mostly on the normal class can outperform supervised learning, or a two-stage design:
a cheap high-recall filter, then a supervised model on the much more balanced survivors. Reframing as
*ranking* — "give the review team the 500 riskiest cases today" — often matches the operational
reality better than classification.

### 12.3 The order to try things

```text
1. Fix the METRIC          → PR-AUC / average precision, MCC, recall@precision, expected cost
2. Fix the THRESHOLD       → tune on validation from a cost matrix; never leave it at 0.5
3. Fix the LOSS            → class_weight='balanced' | scale_pos_weight = n_neg/n_pos | focal loss
4. Try RESAMPLING          → inside the CV fold only; SMOTE, undersampling, hybrids
5. Try ENSEMBLES           → BalancedRandomForest, EasyEnsemble, RUSBoost
6. Reconsider the FRAMING  → anomaly detection, two-stage cascade, ranking
7. Get more POSITIVES      → targeted labelling of the minority class beats any algorithmic trick
```

Steps 1–3 are cheap, safe, and usually sufficient. Present them in this order and you will sound
markedly more experienced than a candidate who starts at step 4.

### 12.4 Gotchas that fail candidates

- **SMOTE before the split.** The signature leakage error of this module.
- **Leading with SMOTE** instead of metrics and thresholds.
- **Resampling the validation/test set**, which makes your reported metrics correspond to a
  distribution that doesn't exist in production.
- **Not knowing resampling breaks calibration.**
- **Setting `scale_pos_weight` and also oversampling**, double-counting the correction.
- **Claiming imbalance is always a problem.** With enough absolute positives and a properly tuned
  threshold, a 1:100 ratio often needs no special handling at all.

### 12.5 Hands-on drill

1. Build a 1%-positive dataset. Train a baseline and report accuracy, precision, recall, F1, ROC-AUC,
   PR-AUC and MCC. Note how differently they behave.
2. Apply, one at a time: threshold tuning, `class_weight='balanced'`, random oversampling, random
   undersampling, SMOTE, and `scale_pos_weight`. Build a comparison table on PR-AUC and on expected
   cost. **In many runs threshold tuning alone matches or beats SMOTE** — get that empirical result
   into your own hands so you can cite it.
3. Deliberately apply SMOTE before the split and measure the inflation in CV score. Record the number.
4. Plot calibration curves before and after oversampling to see the distortion directly.
5. Use `imblearn.pipeline.Pipeline` to do it correctly and confirm the CV score drops to something
   honest.

### 12.6 2026 interview questions

**Q1 `[APPLIED]` — 1% of your rows are positive. Walk me through your approach.**

**Answer.** In order of cost and risk. (1) **Metrics first** — accuracy is useless here, so I'd use
PR-AUC or average precision as the headline, plus recall at a fixed achievable precision, MCC as a
single honest summary, and expected cost if I can get the cost numbers. (2) **Threshold** — 0.5 is
arbitrary; I'd tune it on validation to minimize expected cost or to hit an operational constraint like
the alert volume the review team can handle. (3) **Loss weighting** — `class_weight='balanced'` for
sklearn models or `scale_pos_weight = n_neg/n_pos` for XGBoost, which makes minority errors more
expensive without touching the data. (4) **Only then resampling** — SMOTE or undersampling, applied
strictly inside the training fold via an `imblearn` pipeline, and I'd verify empirically that it
actually helps, because with boosted trees it often doesn't. (5) **Stratified CV** so every fold has
enough positives for a stable estimate. (6) I'd also ask how many positives there are in absolute
terms — 1% of 10 million is 100,000 positives and barely a problem; 1% of 2,000 is 20 positives and no
technique will rescue that, so the answer is to go get more labelled positives.

*What's being tested:* Whether you lead with metrics rather than SMOTE, and whether you ask about
absolute counts rather than just the ratio. Both are strong senior signals.

---

**Q2 `[THEORY]` `[TRAP]` — Explain SMOTE. What are its downsides?**

**Answer.** SMOTE (Synthetic Minority Over-sampling Technique) creates new minority examples by
interpolation: for each minority point it selects one of its `k` minority nearest neighbours and
generates a synthetic point at a random position on the segment between them. That expands the
minority region rather than merely duplicating points. Downsides: it interpolates in feature space, so
it's invalid for categorical features (SMOTE-NC handles those separately) and can create implausible
records; it amplifies label noise, since a mislabeled minority point generates a cluster of synthetic
mislabeled points; it degrades in high dimensions where nearest-neighbour distances concentrate and
neighbourhoods stop being meaningful; it can synthesize points that cross into majority territory,
blurring the boundary; it distorts calibration, because the model now believes a base rate that
doesn't exist; and it increases training time. Empirically it helps less often than its reputation
suggests, especially with gradient-boosted trees, where class weighting plus threshold tuning
frequently does as well or better. And the operational hazard: **applying it before the train/test
split leaks**, because synthetic points interpolated from test-fold neighbours enter the training set.

*What's being tested:* Whether you can critique a popular technique. Naming the leakage hazard and the
categorical-feature limitation unprompted is what distinguishes the answer.

*Follow-up:* "Which variants improve on it?" — Borderline-SMOTE synthesizes only near the decision
boundary where it's most informative; ADASYN allocates more synthetic points to harder-to-learn
minority regions; and hybrids like SMOTE+Tomek or SMOTE+ENN clean up the resulting overlap by removing
ambiguous boundary points.

---

**Q3 `[CODE]` `[TRAP]` — Where in your pipeline does resampling belong?**

**Answer. Inside the pipeline, applied to the training fold only** — never to the whole dataset before
splitting, and never to the validation or test folds. Two reasons. First, leakage: SMOTE interpolates
from nearest neighbours, so if you resample before splitting, synthetic training points are derived
from test-set rows and your CV estimate is badly inflated; plain oversampling has the same problem via
duplicates landing on both sides of the split. Second, representativeness: your test set must reflect
production's real class balance, or your reported precision and expected cost describe a world that
doesn't exist. Implementation matters here — `sklearn`'s `Pipeline` won't do this correctly because it
applies transforms to both train and test, so use `imblearn.pipeline.Pipeline`, which applies samplers
during `fit` only. That way `cross_val_score` resamples each training fold independently and leaves
every validation fold untouched.

*What's being tested:* One of the most common practical errors in the field, and a favourite live-coding
trap. The `imblearn`-vs-`sklearn` pipeline detail proves you've actually done it.

---

**Q4 `[THEORY]` `[TRAP]` — Is class imbalance always a problem?**

**Answer.** No — and saying so confidently is a good signal. What matters is the **absolute number of
minority examples** and whether your metric and threshold are appropriate, not the ratio itself. With
100,000 positives out of 10 million rows, a model can learn the minority class perfectly well; you
just need PR-AUC instead of accuracy and a threshold tuned to your costs. Imbalance genuinely bites in
three situations: too few absolute positives to characterize the class (tens, not thousands);
inappropriate metrics masking failure; and a fixed 0.5 threshold producing almost no positive
predictions. There's also a subtler case worth mentioning — if the minority class is *heterogeneous*,
containing several distinct sub-patterns, you may have plenty of positives in total but too few of
each subtype, which no resampling technique fixes and only better labelling or subtype-specific
modelling does.

*What's being tested:* Resistance to reflexive rule-following. Interviewers ask this to see whether
you'll over-engineer. The heterogeneous-minority point is a strong extra.

---

**Q5 `[APPLIED]` — Positives are 0.01% of your data. Still a classification problem?**

**Answer.** Maybe not, and I'd consider three reframings. (1) **Anomaly detection** — with so few
positives you may not have enough to learn a supervised boundary, so methods that model the *normal*
class and flag deviations (Isolation Forest, One-Class SVM, LOF, autoencoder reconstruction error) can
outperform supervised learning, and they generalize to novel attack or failure modes the training
positives never contained. (2) **A two-stage cascade** — a cheap high-recall rule or model filters
99% of traffic, then a supervised model runs on the much more balanced survivors; this is how most
production fraud systems are actually built, and it also solves the latency and cost problem. (3)
**Ranking rather than classification** — the operational reality is usually "the review team can
handle 500 cases a day," so what's needed is a good ordering and precision@500, not a binary label.
I'd also weigh a hybrid: use unsupervised scores as *features* in the supervised model, which lets the
few known positives inform the ranking without carrying the whole burden. And I'd push hard on getting
more labelled positives, including active learning to prioritize which ambiguous cases get human
review — with 0.01% positives, better labels beat every algorithmic choice.

*What's being tested:* Whether you can step outside the supervised-classification frame. The two-stage
cascade and the precision@k reframing are both strong production-experience signals.

---

## Module 13 — KNN, Naive Bayes & Discriminant Analysis

| | |
|---|---|
| **Prerequisites** | Modules 01, 02, 04 |
| **Study time** | 6 h |
| **Why it's in the loop** | Cheap-to-ask questions that reveal depth; KNN is the curse-of-dimensionality vehicle |
| **Rounds** | `[THEORY]` `[MATH]` `[TRAP]` |

These three are rarely your production model, but they carry three concepts you'll be tested on: lazy
learning, the curse of dimensionality, and generative classification.

### 13.1 What to learn

**KNN**
1. The algorithm: store everything, then at prediction time find the `k` nearest training points and
   vote (classification) or average (regression).
2. Lazy learning: no training cost, expensive inference — the opposite profile from everything else.
3. Distance metrics: Euclidean, Manhattan, Minkowski, cosine, Hamming, Gower for mixed types.
4. Choosing `k` and its bias–variance meaning; why odd `k` for binary problems.
5. Distance weighting.
6. Why scaling is **mandatory**.
7. The **curse of dimensionality** — the central concept here.
8. Efficient search: KD-trees, ball trees, and why they fail in high dimensions; approximate nearest
   neighbours (HNSW, IVF) — the direct bridge to vector databases in the GenAI part of the portal.

**Naive Bayes**
9. Bayes' theorem applied to classification, and the "naive" conditional-independence assumption.
10. Variants: Gaussian, Multinomial, Bernoulli, Complement — and which data each suits.
11. Laplace/additive smoothing and the zero-frequency problem.
12. Why it works well on text despite an obviously false assumption.
13. Why its probability estimates are poorly calibrated even when its classification is good.

**Discriminant analysis**
14. LDA: shared covariance, linear boundary, and its dual life as a supervised dimensionality
    reducer.
15. QDA: per-class covariance, quadratic boundary, more parameters.
16. LDA vs PCA (supervised vs unsupervised), and LDA vs logistic regression (generative vs
    discriminative).

### 13.2 Core intuitions

**KNN is the purest form of "similar inputs have similar outputs."** It makes no global assumption
about the function's form — it just trusts locality. That makes it a genuinely non-parametric,
zero-bias-in-the-limit learner, and also the model most exposed to bad distance geometry.

**The curse of dimensionality is why KNN fails on wide data.** As dimensions grow, three things happen
together. Volume grows exponentially, so any fixed number of samples becomes vanishingly sparse — to
maintain the same local density you'd need exponentially more data. Distances **concentrate**: the
ratio between the nearest and farthest neighbour distances tends toward 1, so "nearest" stops being
meaningfully different from "farthest" and the whole notion of a neighbourhood degrades. And almost
all the volume of a high-dimensional ball sits near its surface, so every point is effectively on the
boundary. The consequence: in high dimensions your `k` nearest neighbours are not actually near, and
KNN's predictions become noise. This affects every distance-based method — KNN, K-Means, RBF kernels —
and it's the reason dimensionality reduction or embeddings precede them in practice.

**`k` is the bias–variance dial, and it's inverted from what beginners expect.** `k = 1` gives zero
training error and a jagged, high-variance boundary that memorizes noise. Large `k` averages over a
big neighbourhood, smoothing the boundary — more bias, less variance. At `k = n` you always predict
the global majority. So *increasing* `k` regularizes.

**Naive Bayes assumes features are conditionally independent given the class, which is essentially
always false — and it still works.** The reason is that classification only needs the *argmax* of the
posterior to be right, not the posterior itself. The independence assumption badly distorts the
magnitude of the probabilities — correlated features effectively get their evidence counted multiple
times, driving estimates toward 0 and 1 — but it frequently leaves the *ordering* of classes intact.
So Naive Bayes is often a decent classifier and a poor probability estimator, which is exactly the
distinction from Module 10's calibration discussion. It also has a real practical virtue: with `d`
features and `K` classes it estimates `O(dK)` parameters instead of a joint distribution, so it trains
in one pass, needs very little data, and remains a strong text baseline.

**LDA is logistic regression's generative twin.** Both produce a linear boundary. LDA gets there by
assuming Gaussian class-conditionals with a shared covariance and estimating means, the pooled
covariance and the priors; logistic regression gets there by directly fitting the log-odds without any
distributional assumption. When the Gaussian assumption holds, LDA is more statistically efficient —
it needs less data. When it doesn't, logistic regression is more robust. LDA also doubles as a
supervised dimensionality reducer projecting to at most `K−1` dimensions, which is the key contrast
with PCA: PCA maximizes total variance ignoring labels; LDA maximizes between-class separation
relative to within-class scatter, using them.

### 13.3 Whiteboard formulas

```text
KNN prediction     classification: majority vote over the k nearest
                   regression:     mean (or distance-weighted mean) over the k nearest
Euclidean          d(a,b) = √Σ(aᵢ-bᵢ)²
Manhattan          d(a,b) = Σ|aᵢ-bᵢ|
Minkowski(p)       d(a,b) = (Σ|aᵢ-bᵢ|^p)^(1/p)      p=1 Manhattan, p=2 Euclidean
Cosine distance    1 - (a·b)/(|a||b|)
Cost               train O(1) | predict O(nd) brute force | memory O(nd)

Naive Bayes        P(y|x) ∝ P(y)·∏ⱼ P(xⱼ|y)          ← the "naive" product
Predict            ŷ = argmax_y [ log P(y) + Σⱼ log P(xⱼ|y) ]   ← log-space for stability
Laplace smoothing  P(xⱼ=v|y) = (count + α) / (total + α·V)      α=1 typical

LDA                assume x|y=k ~ N(μ_k, Σ)  with SHARED Σ
                   δ_k(x) = xᵀΣ⁻¹μ_k - ½μ_kᵀΣ⁻¹μ_k + log π_k   ← linear in x
QDA                per-class Σ_k → quadratic in x
```

### 13.4 Gotchas that fail candidates

- **Not scaling before KNN.** A feature in dollars will dominate one in years entirely.
- **Getting the `k` bias–variance direction backwards.**
- **Saying Naive Bayes fails because features are correlated.** It often classifies well anyway —
  explain *why*.
- **Not knowing about Laplace smoothing.** One unseen word gives a zero product and destroys the
  posterior.
- **Confusing LDA (Linear Discriminant Analysis) with LDA (Latent Dirichlet Allocation).** Clarify
  which one is meant if the context is ambiguous — a nice moment to show precision.
- **Saying PCA and LDA are interchangeable.** One uses labels, the other doesn't.

### 13.5 Hands-on drill

1. Implement KNN from scratch. Plot test accuracy against `k` from 1 to 50 and identify the U-curve.
2. Demonstrate the curse of dimensionality directly: for `d` from 2 to 1,000, sample random points and
   plot the ratio of the mean farthest-neighbour distance to the mean nearest-neighbour distance.
   Watch it approach 1. **This plot is the best possible answer to the curse-of-dimensionality
   question** — describe it in interviews.
3. Run KNN with and without scaling on a dataset with mixed units and record the accuracy gap.
4. Implement Multinomial Naive Bayes for text classification with Laplace smoothing and compare it to
   logistic regression on TF-IDF features. Then compare their calibration curves — NB will be far
   worse calibrated while being competitive on accuracy.
5. Fit LDA and PCA on the same labelled dataset, project to 2D, and plot both. The visual difference
   between "maximum variance" and "maximum class separation" makes the contrast permanent.

### 13.6 2026 interview questions

**Q1 `[THEORY]` — Explain the curse of dimensionality and its practical consequences.**

**Answer.** As the number of features grows, the volume of the feature space grows exponentially, so a
fixed sample size becomes exponentially sparser — maintaining the same local data density requires
exponentially more data. Two geometric consequences follow. Distances **concentrate**: the ratio of the
farthest to the nearest neighbour distance tends toward 1, so all points become roughly equidistant
and "nearest neighbour" loses its meaning. And nearly all the volume of a high-dimensional ball lies
near its surface, so every point is effectively on the boundary with no interior to interpolate
within. Practical consequences: KNN, K-Means and RBF kernels degrade badly; overfitting becomes easy
because there's always some hyperplane separating any labelling of sparse points; and distance-based
outlier detection becomes unreliable. Mitigations: dimensionality reduction (PCA, UMAP), learned
embeddings that compress to a dense low-dimensional manifold, feature selection, using models whose
inductive bias tolerates high dimensions (regularized linear models, trees, which pick one feature at
a time), and exploiting the fact that real data usually lies on a much lower-dimensional manifold than
its ambient dimension suggests.

*What's being tested:* Whether you understand the geometry rather than just the phrase. The distance-
concentration point and the manifold caveat are the two markers of a strong answer.

*Follow-up:* "Then why does KNN work in vector search over 1,536-dimensional embeddings?" — Excellent
question and worth answering carefully: because embeddings are *learned* so that semantic similarity
corresponds to cosine proximity, the data occupies a low-dimensional manifold within the ambient
space, the metric is usually cosine rather than raw Euclidean, and production systems use approximate
methods (HNSW, IVF-PQ) tuned to that structure. The curse applies to *arbitrary* high-dimensional
data, not to a well-trained embedding space.

---

**Q2 `[THEORY]` — How does `k` in KNN affect bias and variance?**

**Answer.** Small `k` means low bias and high variance: `k=1` fits the training data perfectly, giving
zero training error and a jagged boundary that memorizes label noise, so a single mislabeled point
carves out its own region. Large `k` means higher bias and lower variance: predictions average over a
wide neighbourhood, smoothing the boundary and potentially washing out genuine local structure; at
`k=n` you always predict the global majority, which is maximum bias and zero variance. So increasing
`k` is regularization. Choose it by cross-validation, use an odd `k` for binary problems to avoid
ties, and consider distance weighting so nearer neighbours count more, which lets you use a larger `k`
without over-smoothing.

*What's being tested:* Whether you can apply the bias–variance frame to a specific hyperparameter. The
direction is what people get wrong.

---

**Q3 `[THEORY]` `[TRAP]` — Naive Bayes assumes feature independence, which is obviously false for
text. Why does it work?**

**Answer.** Because classification needs only the **argmax** of the posterior to be correct, not the
posterior's numerical value. The independence assumption does damage the probability estimates —
correlated features have their evidence effectively counted multiple times, pushing estimates toward 0
and 1 — but that distortion often preserves the *ranking* of classes, so the predicted label stays
right. Three additional reasons it does well on text specifically: the parameter count is tiny
(`O(dK)` instead of a joint distribution), so it trains in one pass and works with very little data;
bag-of-words features are individually weakly informative but jointly numerous, so accumulating many
mildly-correlated log-probabilities is fairly robust; and high-dimensional sparse text data suits a
model with strong assumptions and low variance. The right summary is that Naive Bayes is often a good
*classifier* and a poor *probability estimator* — which is exactly why you'd calibrate it before using
its outputs as probabilities.

*What's being tested:* Whether you understand the argmax-versus-posterior distinction. This is the
canonical answer and it links directly to the calibration material in Module 10.

---

**Q4 `[MATH]` — What is Laplace smoothing and why is it necessary?**

**Answer.** Naive Bayes multiplies per-feature conditional probabilities, so a single term of zero
makes the whole product zero. If a word never appeared with a given class in training, then
`P(word|class) = 0` and that class's posterior is annihilated regardless of how much other evidence
supports it — the zero-frequency problem. Laplace (additive) smoothing fixes it by adding a
pseudo-count: `P(xⱼ=v|y) = (count + α)/(total + α·V)`, where `V` is the vocabulary size and `α = 1`
gives classic Laplace smoothing (`α < 1` is Lidstone smoothing). This guarantees every probability is
strictly positive, and it's equivalent to placing a Dirichlet prior on the categorical distribution and
taking the MAP estimate — the same regularization-as-prior idea from Module 08. Practically it also
prevents unseen categories at serving time from breaking predictions, and you should work in log-space
anyway to avoid numerical underflow from multiplying many small probabilities.

*What's being tested:* Whether you know the mechanism and can connect it to Bayesian priors. The
Dirichlet-prior framing and the log-space note are the depth signals.

---

**Q5 `[THEORY]` — LDA vs PCA vs logistic regression.**

**Answer.** **PCA** is unsupervised: it finds orthogonal directions of maximum total variance, ignoring
labels, and is used for compression, denoising and visualization. **LDA** is supervised: it finds the
directions maximizing between-class separation relative to within-class scatter, so it's a
dimensionality reducer that explicitly preserves discriminability — but it can produce at most `K−1`
components for `K` classes, and it assumes Gaussian class-conditionals with shared covariance. The
practical contrast: PCA's top component can be a direction along which the classes are completely
mixed, if that's where the variance happens to be, while LDA's is chosen to separate them. **Logistic
regression** and LDA both yield linear decision boundaries but arrive there differently: LDA is
generative, modelling `P(x|y)` and applying Bayes, which makes it more statistically efficient when
the Gaussian assumption holds and lets it handle multi-class naturally; logistic regression is
discriminative, fitting `P(y|x)` directly with no distributional assumption, which makes it more
robust when the assumption fails and is why it's the more common default.

*What's being tested:* Whether you can hold three related methods apart cleanly. The PCA-component-
along-which-classes-are-mixed example is the fastest way to make the supervised/unsupervised
distinction concrete.

---

**Q6 `[THEORY]` — KNN has no training phase. Is that an advantage?**

**Answer.** It's a trade, and mostly a disadvantage in production. The advantages are real: adding new
data requires no retraining, which suits rapidly-changing data; there's no model to fit, so no
optimization to tune; and the decision boundary can be arbitrarily complex without any assumption
about its form. The costs are severe: prediction is `O(nd)` per query with brute-force search, so
latency grows with your dataset; the entire training set must be held in memory at serving time; it's
highly sensitive to scaling, irrelevant features and the curse of dimensionality; and there's no
learned compact representation to inspect or reason about. This "lazy" profile is exactly inverted from
every other model in this course, which pays a large one-off training cost for cheap inference — and
cheap inference is what production usually needs. Mitigations that make it viable are spatial indexes
(KD-trees, ball trees) for low dimensions and approximate nearest-neighbour indexes (HNSW, IVF-PQ) for
high dimensions, which is precisely the technology behind vector databases in modern retrieval systems.

*What's being tested:* Cost awareness across the train/serve boundary, and whether you can connect KNN
to contemporary vector search — a common 2026 bridge question.

---

# Part D — Margins, Trees & Ensembles

## Module 14 — Support Vector Machines & Kernels

| | |
|---|---|
| **Prerequisites** | Modules 01, 07, 09 |
| **Study time** | 8 h |
| **Why it's in the loop** | The margin and the kernel trick are both conceptually load-bearing |
| **Rounds** | `[THEORY]` `[MATH]` `[TRAP]` |

SVMs are rarely the production choice in 2026, but they are asked about constantly, because the margin
idea and the kernel trick test whether you can think geometrically.

### 14.1 What to learn

1. The **maximum-margin** principle: among all separating hyperplanes, choose the one furthest from
   both classes.
2. Margin, **support vectors**, and why only they determine the solution.
3. **Hard-margin** SVM: the constrained optimization problem and why it fails on non-separable data.
4. **Soft-margin** SVM: slack variables, and the `C` parameter as inverse regularization.
5. **Hinge loss** and the equivalent unconstrained formulation.
6. The **dual formulation** via Lagrange multipliers, and why the dual is what enables kernels.
7. The **kernel trick**: computing inner products in a high-dimensional feature space without ever
   constructing the mapping.
8. Kernels: linear, polynomial, **RBF/Gaussian**, sigmoid; Mercer's condition; custom kernels.
9. The RBF `gamma` parameter and its interaction with `C` — the classic 2D grid search.
10. Why scaling is mandatory.
11. **SVR** (support vector regression) and the ε-insensitive tube.
12. Multi-class via OvO/OvR; class weights for imbalance.
13. Computational cost — roughly `O(n²)` to `O(n³)` — and why that ended SVMs' dominance at scale.
14. SVM vs logistic regression: hinge versus log loss, and what that implies about calibration.

### 14.2 Core intuitions

**Maximizing the margin is a generalization argument.** Many hyperplanes can separate the training
data; they are not equally good. The one with the widest buffer to the nearest points of each class is
the most robust to perturbation — a small shift in a test point is least likely to flip its
classification. This is the geometric expression of the same intuition regularization expresses
algebraically, and indeed maximizing the margin is equivalent to minimizing `‖w‖` subject to correct
classification with a unit functional margin.

**Only the support vectors matter.** The solution depends solely on the points on or inside the margin
boundary. Delete every other training point and refit — you get the identical hyperplane. This is a
striking property with two consequences: SVMs are sparse in the *examples* (as opposed to lasso's
sparsity in features), and they are relatively insensitive to outliers that sit far from the boundary
on the correct side. Being able to state the "delete the rest and nothing changes" fact is the fastest
way to prove you understand the model.

**`C` is inverse regularization, and it controls the margin/violation trade.** Soft margin allows
points to violate the margin, penalized by `C·Σξᵢ`. Large `C` makes violations expensive, so the model
fits a narrow margin that classifies training points strictly — low bias, high variance, potentially
overfitting. Small `C` tolerates violations, giving a wide, smooth margin — high bias, low variance.
Note this is the *same* `C` convention as `sklearn`'s `LogisticRegression`, and the same trap:
**increasing `C` regularizes less**.

**The kernel trick, stated correctly.** In the dual formulation, the data appears only through inner
products `xᵢ·xⱼ`. So if you want to work in some high-dimensional feature space `φ(x)`, you only ever
need `φ(xᵢ)·φ(xⱼ)`. A kernel function `K(xᵢ,xⱼ)` computes that inner product *directly*, without ever
constructing `φ(x)`. That's the whole trick: you get the expressive power of a high-dimensional (for
RBF, infinite-dimensional) space at the cost of evaluating a cheap function on the original inputs.
The polynomial kernel `(xᵢ·xⱼ + c)^d` corresponds to all monomials up to degree `d`, which for `d=3` on
1,000 features would be an astronomically large explicit expansion.

**`gamma` in the RBF kernel is a locality dial.** `K(x,x') = exp(-γ‖x-x'‖²)`. Large `γ` makes the
kernel decay fast, so each support vector influences only a tiny neighbourhood — the boundary becomes
wiggly and can memorize individual points, i.e. high variance. Small `γ` makes influence broad and the
boundary smooth, approaching linear behaviour. Because `C` and `γ` both control effective complexity,
they interact, which is why RBF-SVM tuning is the textbook example of a **2D grid search over
log-spaced values** — typically `C ∈ {0.01 … 1000}` and `γ ∈ {1e-4 … 10}`.

**Hinge loss versus log loss explains SVMs' calibration problem.** Hinge loss is
`max(0, 1 - y·f(x))`: it is exactly zero for points correctly classified beyond the margin. So the
model stops caring about a point once it's comfortably right, which is what produces the sparsity in
support vectors. Log loss never reaches zero, so logistic regression keeps adjusting for every point
and consequently estimates a calibrated probability. The price the SVM pays: its `decision_function`
output is a signed distance, not a probability, and getting probabilities requires Platt scaling
(`probability=True` in `sklearn`, which internally does cross-validated Platt scaling and is
noticeably slow).

**Why SVMs faded.** Training cost scales roughly between `O(n²)` and `O(n³)` for kernel SVMs, because
the kernel matrix is `n × n`. At a million rows that matrix alone is 8 TB in float64. Gradient-boosted
trees handle the same data in minutes, need no scaling, handle mixed types and missing values, and
usually win on accuracy for tabular problems. Linear SVMs remain practical at scale (`LinearSVC`,
`SGDClassifier(loss='hinge')`) and are still competitive on high-dimensional sparse data like text.

### 14.3 Whiteboard formulas

```text
Decision function     f(x) = w·x + b ;   predict sign(f(x))

Hard margin (primal)  min ½‖w‖²
                      s.t. yᵢ(w·xᵢ + b) ≥ 1   ∀i
                      margin width = 2/‖w‖   → maximizing margin = minimizing ‖w‖

Soft margin (primal)  min ½‖w‖² + C·Σᵢ ξᵢ
                      s.t. yᵢ(w·xᵢ + b) ≥ 1 - ξᵢ ,  ξᵢ ≥ 0

Equivalent unconstrained (hinge + L2):
                      min ½‖w‖² + C·Σᵢ max(0, 1 - yᵢ(w·xᵢ + b))

Dual                  max_α  Σᵢαᵢ - ½ΣᵢΣⱼ αᵢαⱼ yᵢyⱼ (xᵢ·xⱼ)
                      s.t. 0 ≤ αᵢ ≤ C ,  Σᵢ αᵢyᵢ = 0
                      → data enters ONLY as inner products  ⇒ kernels

Kernelized            f(x) = Σᵢ αᵢ yᵢ K(xᵢ, x) + b     (sum over support vectors only)

Kernels               Linear      K = xᵢ·xⱼ
                      Polynomial  K = (xᵢ·xⱼ + c)^d
                      RBF/Gauss.  K = exp(-γ‖xᵢ-xⱼ‖²)        γ>0
                      Sigmoid     K = tanh(κ xᵢ·xⱼ + c)

Support vectors       points with αᵢ > 0  (on or violating the margin)

SVR                   ε-insensitive: no penalty if |y - f(x)| ≤ ε
```

### 14.4 Gotchas that fail candidates

- **Not scaling.** An unscaled feature dominates the kernel entirely.
- **Getting `C`'s direction wrong.** Large `C` = less regularization.
- **Saying the kernel trick "maps data to higher dimensions."** It computes inner products *as if* you
  had — the point is that you never build `φ(x)`.
- **Claiming SVMs give probabilities.** They give a signed distance; probabilities need Platt scaling.
- **Recommending an RBF-SVM for a million rows.** Know the `O(n²)`–`O(n³)` cost.
- **Not knowing hinge loss.** It's the whole reason support vectors are sparse.

### 14.5 Hands-on drill

1. Fit a linear SVM on 2D separable data. Plot the hyperplane, both margin boundaries, and circle the
   support vectors. Then delete all non-support-vector points, refit, and confirm the boundary is
   identical. This is your visual for the support-vector question.
2. Sweep `C` from 0.01 to 1000 on non-separable data and plot how the boundary and the number of
   support vectors change.
3. Fit an RBF-SVM on concentric-circles data (something a linear model cannot separate) and sweep
   `gamma` to see under- and over-fitting boundaries.
4. Run a full 2D log-spaced grid search over `(C, gamma)` and plot the validation-score heatmap. The
   ridge shape in that heatmap is worth describing in interviews.
5. Time `SVC(kernel='rbf')` at n = 1,000 / 5,000 / 20,000 and confirm the super-linear scaling
   yourself, then compare against `LGBMClassifier` on the same data.

### 14.6 2026 interview questions

**Q1 `[THEORY]` — What is an SVM trying to do, and what is a support vector?**

**Answer.** It finds the hyperplane that separates the classes with the **maximum margin** — the widest
possible buffer between the boundary and the nearest points of each class. The reasoning is a
generalization argument: among the infinitely many separating hyperplanes, the one furthest from both
classes is most robust to perturbation of the data, so a slightly shifted test point is least likely to
be misclassified. Geometrically the margin width is `2/‖w‖`, so maximizing the margin is minimizing
`‖w‖` subject to all points being correctly classified with a functional margin of at least 1. A
**support vector** is a training point lying on the margin boundary or violating it — equivalently, one
with a non-zero dual coefficient. These are the only points that matter: delete every other training
point, refit, and you get exactly the same hyperplane. That makes the model sparse in *examples* and
relatively robust to outliers that sit far from the boundary on the correct side.

*What's being tested:* Geometric intuition. The "delete the rest and nothing changes" statement is the
most efficient way to demonstrate real understanding.

---

**Q2 `[MATH]` `[TRAP]` — Explain the kernel trick precisely.**

**Answer.** In the dual formulation of the SVM, the training data appears only through inner products
`xᵢ·xⱼ` — never through the individual vectors. So if you wanted to work in a higher-dimensional feature
space via some mapping `φ`, you would only ever need `φ(xᵢ)·φ(xⱼ)`. A kernel function `K(xᵢ,xⱼ)`
computes that inner product **directly from the original inputs**, without ever constructing or storing
`φ(x)`. That's the trick, and the emphasis matters: it is not "map the data to higher dimensions" — you
get the effect of the mapping while never performing it. Example: the polynomial kernel
`(xᵢ·xⱼ + c)^d` corresponds to a feature map containing all monomials up to degree `d`, which for
`d=3` on 1,000 features would be hundreds of millions of explicit terms; the kernel computes it as one
dot product plus a power. The RBF kernel corresponds to an **infinite-dimensional** feature space, which
you obviously could never construct explicitly. Any function satisfying **Mercer's condition** —
producing a positive semi-definite Gram matrix — is a valid kernel, which is what guarantees the dual
problem stays convex.

*What's being tested:* Whether you understand the mechanism or just the slogan. Saying "you never
construct φ" and naming Mercer's condition are the two markers.

*Follow-up:* "So why doesn't everyone use kernels?" — The kernel matrix is `n × n`, so memory is
`O(n²)` and training is roughly `O(n²)`–`O(n³)`. That's fine at thousands of rows and impossible at
millions, which is why kernel methods lost to boosted trees and neural networks on large datasets.

---

**Q3 `[THEORY]` — What do `C` and `gamma` do, and how do you tune them?**

**Answer.** `C` is inverse regularization, controlling the penalty on margin violations. Large `C` makes
violations expensive, producing a narrow margin that classifies training points strictly — low bias,
high variance. Small `C` tolerates violations, giving a wide smooth margin — high bias, low variance.
`gamma` (RBF only) controls the kernel's locality: `K = exp(-γ‖x-x'‖²)`, so large `γ` means influence
decays quickly and each support vector affects only a small neighbourhood, giving a wiggly
high-variance boundary; small `γ` means broad influence and a smooth boundary that approaches linear
behaviour. Because both control effective complexity they interact, so you tune them **jointly** on a
2D log-spaced grid — typically `C ∈ {10⁻², … , 10³}` and `γ ∈ {10⁻⁴, … , 10¹}`, or `gamma='scale'` as a
sensible starting point since it adapts to feature variance. The validation heatmap usually shows a
diagonal ridge of good combinations rather than a single optimum, which is itself informative: high `C`
with low `γ` and low `C` with high `γ` can perform similarly.

*What's being tested:* Whether you know both parameters, their directions, and that they must be tuned
together. The diagonal-ridge observation is a nice practitioner detail.

---

**Q4 `[THEORY]` — SVM vs logistic regression. When would you pick each?**

**Answer.** Both are linear classifiers; they differ in loss and therefore in behaviour. The SVM uses
**hinge loss**, which is exactly zero once a point is correctly classified beyond the margin — so the
model ignores comfortable points, depends only on support vectors, and optimizes a geometric margin.
Logistic regression uses **log loss**, which is never zero, so every point contributes and the model
estimates a calibrated probability. Consequences: pick logistic regression when you need
**probabilities** (for expected-cost thresholds, pricing, ranking with confidence), when you want
interpretable coefficients and odds ratios, when `n` is large (it scales linearly and supports SGD), or
when you need a fast, easily monitored production model. Pick an SVM when you need a **non-linear**
boundary and `n` is small-to-moderate (RBF kernel), when the data is high-dimensional and sparse —
text with a linear kernel is a classic strong case — or when the margin's robustness to outliers far
from the boundary is desirable. In 2026 practice, for tabular problems you'd usually pick logistic
regression as the interpretable baseline and gradient boosting as the accurate model, with kernel SVMs
occupying a narrow niche.

*What's being tested:* Whether you can connect a loss function to practical model properties.
Calibration is the key axis, and mentioning that hinge loss is what creates support-vector sparsity
shows the two ideas are connected in your head.

---

**Q5 `[THEORY]` — Does an SVM output probabilities?**

**Answer.** Not natively. `decision_function` returns a signed distance from the hyperplane — larger
magnitude means further from the boundary, but it's on an arbitrary scale and is not a probability. To
get probabilities you fit a post-hoc calibration map, which is exactly what `sklearn`'s
`probability=True` does: it runs **Platt scaling**, fitting a one-dimensional logistic regression on
cross-validated decision-function values. Two caveats worth raising: it's expensive, because it
requires internal 5-fold cross-validation during `fit`, and the resulting `predict_proba` can be
mildly inconsistent with `predict` since the two are computed differently. If probabilities are central
to your application, that's a reason to prefer logistic regression or a calibrated boosted model in
the first place.

*What's being tested:* Awareness that a decision score isn't a probability — a distinction that
matters for the entire Module 10 metric discussion. The `probability=True` cost/inconsistency detail
proves practical experience.

---

**Q6 `[APPLIED]` `[TRAP]` — You have 2 million rows and 300 features. Would you use an RBF-SVM?**

**Answer.** No. A kernel SVM requires the `n × n` kernel matrix, so memory is `O(n²)` — at 2 million
rows that's on the order of terabytes — and training scales roughly `O(n²)`–`O(n³)`. It's simply
infeasible. Realistic options: **gradient-boosted trees** (LightGBM or XGBoost), which handle this
scale in minutes, need no scaling, tolerate mixed types and missing values, and will most likely be
more accurate on tabular data anyway; a **linear SVM** via `LinearSVC` or `SGDClassifier(loss='hinge')`,
which avoids the kernel matrix and scales linearly, if you specifically want the hinge-loss margin
behaviour; **logistic regression with SGD** for a fast calibrated baseline; or, if you genuinely need
the RBF's non-linearity, an explicit kernel approximation such as **Nyström** or **random Fourier
features** (`RBFSampler`) followed by a linear model, which approximates the kernel in a few thousand
explicit dimensions at linear cost. I'd start with LightGBM and only explore the others if there were a
specific reason.

*What's being tested:* Whether you know the cost model and have a real alternative ready. Naming
Nyström or random Fourier features is a genuine differentiator — few candidates know the kernel
approximation route exists.

---

## Module 15 — Decision Trees

| | |
|---|---|
| **Prerequisites** | Modules 02, 05 |
| **Study time** | 8 h |
| **Why it's in the loop** | The foundation of everything in Modules 16–18. Gini-vs-entropy is standard. |
| **Rounds** | `[THEORY]` `[MATH]` `[CODE]` `[TRAP]` |

### 15.1 What to learn

1. The structure: root, internal nodes, branches, leaves; how a prediction is made by traversal.
2. Greedy recursive binary splitting, and why it's greedy (finding the globally optimal tree is
   NP-hard).
3. **Impurity measures for classification: Gini and entropy.** Definitions, ranges, and their
   practical near-equivalence.
4. **Information gain** and gain ratio; why plain information gain favours high-cardinality features.
5. Splitting criteria for regression: variance reduction / MSE, and MAE.
6. The exact split-finding algorithm: for each feature, sort candidate thresholds and evaluate the
   weighted impurity of the children.
7. Stopping criteria: `max_depth`, `min_samples_split`, `min_samples_leaf`, `max_leaf_nodes`,
   `min_impurity_decrease`.
8. **Pruning**: pre-pruning vs post-pruning; cost-complexity (weakest-link) pruning and the `ccp_alpha`
   parameter.
9. Handling categorical features; the combinatorial explosion of subset splits.
10. Handling missing values: surrogate splits, and the learned-default-direction approach.
11. Why trees need **no feature scaling**.
12. Why single trees are **high-variance** — and why that motivates Modules 16–18.
13. **Axis-aligned splits** and the resulting inability to represent a diagonal boundary compactly.
14. **Failure to extrapolate** — trees predict a constant outside the training range.
15. Feature importance from trees, and its bias toward high-cardinality and continuous features.
16. CART vs ID3 vs C4.5, briefly.
17. Interpretability, and its limits as depth grows.

### 15.2 Core intuitions

**A tree is a sequence of questions that partitions the feature space into boxes.** Each split cuts
one region into two along a single feature; the leaves are axis-aligned boxes, and the prediction is
constant within each box — the majority class or the mean target. So a decision tree is a **piecewise-
constant** function on an axis-aligned partition. That single sentence explains most of its properties:
no scaling needed, no extrapolation, jagged boundaries, and easy interaction capture.

**Splitting is greedy and locally optimal.** At each node, the algorithm evaluates every feature and
every candidate threshold and takes the single best split *right now*, never looking ahead. Finding the
globally optimal tree is NP-hard, so greediness is a necessity. The consequence: a split that looks
mediocre alone but enables an excellent pair of subsequent splits will be passed over. This is a real
limitation — trees struggle with problems like XOR at shallow depth precisely because no single-feature
split reduces impurity at the root.

**Gini and entropy measure the same thing and rarely disagree.** Gini is `1 - Σpᵢ²`, the probability
that two randomly drawn samples from the node have different labels. Entropy is `-Σpᵢlog₂pᵢ`, the
expected information content in bits. Both are zero for a pure node and maximal for a uniform mixture
(binary case: Gini 0.5, entropy 1.0). Their curves are nearly the same shape, so they select the same
split the overwhelming majority of the time and rarely produce meaningfully different trees. The
practical difference is that Gini avoids a logarithm and is therefore slightly faster, which is why
it's the default in CART and `sklearn`. Entropy is marginally more sensitive at the extremes and has
the cleaner information-theoretic interpretation. **The correct interview answer is that the choice
almost never matters and is not worth tuning** — say that explicitly, because the question is often
designed to see whether you'll over-claim a difference.

**Information gain favours high-cardinality features, and that's a trap.** Gain is impurity reduction,
and a feature with many distinct values can slice the data into many small, nearly-pure nodes — a
customer-ID column can produce perfect purity while carrying zero generalizable signal. C4.5's **gain
ratio** normalizes by the split's own entropy (its "intrinsic information") to correct for this. The
same bias reappears in tree-based feature importance, which is why permutation importance on a held-out
set is the more trustworthy measure (Module 21).

**Trees don't need scaling, and understanding why is the general principle.** A split is a threshold
comparison within a single feature, and the algorithm only needs the *ranking* of values to enumerate
candidate thresholds. Any monotone transformation — scaling, log, rank — leaves that ranking unchanged
and therefore produces an identical tree. Trees never combine features into a single geometric
quantity, which is exactly what distance- and gradient-based methods do and why *they* need scaling.

**Trees are high-variance, and this is the most important fact about them.** Change a few training
rows and the root split can change, which changes every subsequent split, which restructures the whole
tree. Two trees fitted on bootstrap samples of the same data can look entirely different while
achieving similar accuracy. That instability is precisely what bagging exploits — averaging many
high-variance, low-bias models reduces variance without adding much bias. So Module 15's weakness is
Module 16's opportunity, and stating that link is a strong transition in an interview.

**Trees cannot extrapolate.** A leaf's prediction is a constant computed from its training samples, so
feeding in a value beyond the training range simply lands you in the outermost leaf and returns its
constant. If you train a regression tree on houses of 50–200 m² and predict for 500 m², you get the
same answer as for 200 m². Linear regression would extrapolate the trend — perhaps wrongly, but at
least responsively. This is a genuine reason to prefer a linear model for a trending target, and it's
also why boosted trees struggle with time-series trends unless you detrend or add explicit trend
features.

### 15.3 Whiteboard formulas

```text
Gini impurity        G = 1 - Σ_k p_k²          binary: max 0.5 at p=0.5
Entropy              H = -Σ_k p_k log₂ p_k     binary: max 1.0 at p=0.5
Misclassification    E = 1 - max_k p_k         (rarely used for splitting — too flat)

Weighted child impurity for a split:
      I_split = (n_L/n)·I(left) + (n_R/n)·I(right)

Information gain     IG = I(parent) - I_split
Gain ratio (C4.5)    GainRatio = IG / SplitInfo,
                     SplitInfo = -Σ (nᵢ/n)·log₂(nᵢ/n)      ← penalizes many-valued splits

Regression split     minimize  Σ_left (yᵢ - ȳ_L)² + Σ_right (yᵢ - ȳ_R)²
                     equivalently maximize variance reduction
Leaf prediction      classification: majority class (or class proportions)
                     regression:     mean of y in the leaf

Cost-complexity pruning:
      R_α(T) = R(T) + α·|leaves(T)|
      α = 0 → full tree ;  α ↑ → smaller tree ;  tune α by CV (`ccp_alpha`)

Split-finding cost   O(n·d·log n) per node with pre-sorting
```

### 15.4 Worked Gini example (be able to do this on a whiteboard)

Parent node: 100 samples, 50 positive / 50 negative.
`G_parent = 1 - (0.5² + 0.5²) = 0.5`

Candidate split → Left: 60 samples (45 pos / 15 neg); Right: 40 samples (5 pos / 35 neg).

```text
G_left  = 1 - (0.75² + 0.25²) = 1 - (0.5625 + 0.0625) = 0.375
G_right = 1 - (0.125² + 0.875²) = 1 - (0.015625 + 0.765625) = 0.21875

Weighted = (60/100)(0.375) + (40/100)(0.21875)
         = 0.225 + 0.0875 = 0.3125

Gini gain = 0.5 - 0.3125 = 0.1875
```

Practise this until it's mechanical. Being asked to compute a split by hand is common, and fumbling
the arithmetic on a question you conceptually understand is an avoidable loss.

### 15.5 Gotchas that fail candidates

- **Claiming Gini and entropy give substantially different trees.** They rarely do — say so.
- **Saying trees need scaling.**
- **Not knowing trees can't extrapolate.**
- **Treating tree feature importance as reliable** without mentioning its high-cardinality bias.
- **Not knowing the greedy-vs-optimal distinction**, or why greediness is necessary.
- **Confusing pre-pruning with post-pruning**, or not knowing `ccp_alpha` exists.
- **Saying a deep tree is interpretable.** A depth-20 tree has up to a million leaves; nobody reads
  that.

### 15.6 Hands-on drill

1. Implement a decision tree from scratch: Gini computation, exhaustive split search over features and
   thresholds, recursive building, depth and leaf-size stopping rules, prediction by traversal. This
   is a common live-coding task and building it once makes Modules 16–18 far easier.
2. Compute the worked Gini example above by hand, then verify with your implementation.
3. Fit trees at `max_depth` 1 through 20 and plot train and test accuracy — produce the overfitting
   curve yourself.
4. Fit the same tree specification on 10 bootstrap samples and visualize all 10. The structural
   variation you see *is* the high-variance argument for bagging.
5. Train a regression tree on a linear trend and plot its step-function predictions, including beyond
   the training range. That flat line past the boundary is your extrapolation answer.
6. Use `cost_complexity_pruning_path` to obtain the `ccp_alpha` sequence and pick one by
   cross-validation.

### 15.7 2026 interview questions

**Q1 `[THEORY]` `[TRAP]` — Gini or entropy? Which is better?**

**Answer.** Neither, practically. Both measure node impurity, both are zero for a pure node and maximal
for a uniform class mixture, and their curves are so similar in shape that they select the same split
the great majority of the time — differences in resulting trees are usually negligible and rarely
change test performance. The real differences are minor: Gini (`1 - Σpₖ²`) avoids computing a
logarithm, so it's slightly faster and is CART's and `sklearn`'s default; entropy
(`-Σpₖlog₂pₖ`) has the cleaner information-theoretic reading — it's the expected bits needed to encode
the class — and is very marginally more sensitive near pure nodes. Gini also has a nice interpretation
of its own: it's the probability that two samples drawn at random from the node have different labels.
My practical position is that this is not a hyperparameter worth tuning; I'd spend that compute on
`max_depth`, `min_samples_leaf` or feature engineering instead.

*What's being tested:* Whether you'll invent a difference to sound knowledgeable. Saying plainly that
it rarely matters — while still knowing both definitions precisely — is the strong answer.

---

**Q2 `[MATH]` `[CODE]` — Compute the Gini gain for this split.** *(Parent: 50/50 of 100. Left: 45/15 of
60. Right: 5/35 of 40.)*

**Answer.** `G_parent = 1 - (0.5² + 0.5²) = 0.5`. Left node has `p = 0.75/0.25`, so
`G_left = 1 - (0.5625 + 0.0625) = 0.375`. Right node has `p = 0.125/0.875`, so
`G_right = 1 - (0.015625 + 0.765625) = 0.21875`. Weighted child impurity is
`0.6(0.375) + 0.4(0.21875) = 0.225 + 0.0875 = 0.3125`. Gini gain is `0.5 - 0.3125 = 0.1875`. Note the
weighting by child size is essential — an unweighted average would over-value a split that isolates a
tiny pure node, which is exactly the pathology `min_samples_leaf` guards against.

*What's being tested:* Arithmetic under pressure and whether you remember to weight by node size.
Practise it; it's free marks.

---

**Q3 `[THEORY]` — Why is a single decision tree high-variance, and what do we do about it?**

**Answer.** Because splitting is greedy and hierarchical. The root split is chosen from the whole
dataset, and a small change in the training sample can change which feature or threshold wins — and
once the root changes, every subsequent split is computed on different data, so the entire tree
restructures. Fit the same specification on ten bootstrap samples and you get ten visibly different
trees with similar accuracy. Deep trees make it worse, because leaves contain few samples so their
predictions are estimated from very little data. Remedies fall into two groups: **constrain the single
tree** — `max_depth`, `min_samples_leaf`, `min_impurity_decrease`, or cost-complexity pruning via
`ccp_alpha` — which trades variance for bias; or, far more effectively, **average many trees**, which
is exactly what bagging and Random Forests do. That's the reason single trees are almost never a
production model while tree *ensembles* dominate tabular ML: the instability that makes one tree
unreliable is precisely what makes averaging so effective, since averaging works best on models whose
errors are uncorrelated.

*What's being tested:* Whether you can explain the mechanism of the instability and connect it to the
motivation for ensembles. That connection is the natural bridge into Module 16 and interviewers
listen for it.

---

**Q4 `[THEORY]` `[TRAP]` — Do decision trees need feature scaling? Why or why not?**

**Answer.** No. Each split is a threshold test on a single feature — "is `xⱼ ≤ t`?" — and the algorithm
only needs the *ordering* of that feature's values to enumerate candidate thresholds. Any monotone
transformation (standardization, min-max, log, rank) preserves that ordering, so it produces an
identical tree with correspondingly transformed thresholds. This extends to all tree ensembles: Random
Forest, gradient boosting, XGBoost, LightGBM, CatBoost. Contrast with methods that need scaling — KNN,
K-Means, SVM, PCA and gradient-descent-trained models — all of which combine multiple features into a
single geometric quantity (a distance, an inner product, or a loss-surface direction), where relative
magnitudes therefore matter. The general principle: **scaling matters exactly when features are
combined; trees never combine them.**

*What's being tested:* A very common question with a precise answer. The general principle at the end is
what distinguishes understanding from memorization.

*Follow-up:* "Does a monotone transform of the *target* matter for a regression tree?" — Yes, that's
different. The leaf prediction is the mean of `y`, and splits minimize squared error in `y`, so
log-transforming the target changes which splits are chosen and what the leaves predict.

---

**Q5 `[THEORY]` — Explain pruning. Pre-pruning vs post-pruning.**

**Answer.** Pruning reduces a tree's size to lower variance. **Pre-pruning** (early stopping) prevents
growth during construction via `max_depth`, `min_samples_split`, `min_samples_leaf`, `max_leaf_nodes`
or `min_impurity_decrease`. It's cheap since you never build the full tree, but it's myopic — it can
stop at a split that looks unhelpful even though excellent splits lay just beneath it, which is the
same greediness problem in another form. **Post-pruning** grows the tree fully, then removes subtrees
that don't pay for themselves. The standard method is **cost-complexity (weakest-link) pruning**:
minimize `R_α(T) = R(T) + α|leaves(T)|`, which for each α identifies a specific optimal subtree,
generating a nested sequence of trees as α increases; you then select α by cross-validation. In
`sklearn` that's `ccp_alpha`, with `cost_complexity_pruning_path` giving you the candidate values.
Post-pruning generally yields better trees because it evaluates a subtree by its full realized
contribution rather than by a single split's immediate gain; it just costs more to build the full tree
first.

*What's being tested:* Whether you know both, and specifically whether you know cost-complexity
pruning and `ccp_alpha`. Many candidates only know `max_depth`.

---

**Q6 `[THEORY]` `[TRAP]` — What are the main weaknesses of decision trees?**

**Answer.** Five, and each has a specific consequence. (1) **High variance** — small data changes
restructure the tree, so single trees are unstable and rarely production-grade. (2) **Greedy
construction** — locally optimal splits can miss globally better structures; this is why trees handle
XOR-like interactions poorly at shallow depth, since no single-feature split reduces impurity at the
root. (3) **Axis-aligned splits only** — a diagonal boundary must be approximated by a staircase of many
splits, so a relationship a linear model captures in one coefficient may take a large subtree. (4) **No
extrapolation** — leaves predict constants, so anything beyond the training range returns the outermost
leaf's value; this makes plain trees a poor fit for trending targets unless you detrend or add trend
features. (5) **Biased feature importance** — impurity-based importance favours high-cardinality and
continuous features, so it can mislead badly; prefer permutation importance on held-out data. Worth
adding that (1) is largely solved by ensembling, which is why the field moved to Random Forests and
boosting, while (3) and (4) are structural and persist even in XGBoost — a genuinely useful thing to
know when deciding whether to use a linear model or add engineered features.

*What's being tested:* Depth of critique, and specifically whether you know which weaknesses ensembling
fixes and which it doesn't. That distinction is the senior-level insight.

---

## Module 16 — Bagging & Random Forest

| | |
|---|---|
| **Prerequisites** | Modules 05, 15 |
| **Study time** | 6 h |
| **Why it's in the loop** | Guaranteed. The bagging-vs-boosting question is near-universal. |
| **Rounds** | `[THEORY]` `[MATH]` `[APPLIED]` `[TRAP]` |

### 16.1 What to learn

1. **Bootstrap sampling**: sampling `n` items with replacement, and the ~63.2% inclusion result.
2. **Bagging** (bootstrap aggregating): train `B` models on `B` bootstrap samples, then average or
   vote.
3. Why bagging reduces variance but not bias — with the mathematical argument.
4. **Random Forest = bagging + random feature subsampling at each split.** Both sources of randomness
   matter.
5. Why feature subsampling is the crucial addition: **decorrelation**.
6. `max_features`: `sqrt(p)` for classification, `p/3` for regression, and why.
7. **Out-of-bag (OOB) error** as free validation, and its relationship to cross-validation.
8. Key hyperparameters: `n_estimators`, `max_features`, `max_depth`, `min_samples_leaf`,
   `bootstrap`.
9. Why more trees don't overfit a Random Forest.
10. **Extra Trees** (Extremely Randomized Trees) and how they differ.
11. Feature importance: impurity-based (MDI) vs permutation-based, and MDI's biases.
12. Parallelizability, and the contrast with boosting's sequential nature.
13. Proximity matrices and RF for missing-value imputation, briefly.
14. Strengths and limits versus gradient boosting.

### 16.2 Core intuitions

**Averaging independent estimates reduces variance.** If you have `B` independent estimators each with
variance `σ²`, the variance of their mean is `σ²/B`. That's the entire idea behind bagging: fit many
high-variance low-bias models and average them. Bias is essentially unchanged, since each model is
approximately unbiased and the average of unbiased estimators is unbiased — so bagging buys variance
reduction almost for free.

**But bagged trees are not independent, and this is the key insight.** They're all fitted on samples
from the same dataset, so their errors are correlated. The variance of the average of `B` estimators
with pairwise correlation `ρ` is:

```text
Var = ρσ² + (1-ρ)σ²/B
      ─┬─   ────┬────
   floor    →0 as B→∞
```

The second term vanishes as you add trees, but the first does not. So there's a hard floor on how much
averaging can help, set by `ρ`. Adding the 500th tree to a bagged ensemble barely helps because you've
already exhausted the `(1-ρ)σ²/B` term. **The only way to improve further is to reduce `ρ` — and that
is exactly what Random Forest does.**

**Random feature subsampling decorrelates the trees.** At each split, a Random Forest considers only a
random subset of features (`sqrt(p)` by default for classification). This means a single dominant
feature can't be used at the root of every tree — sometimes it isn't even available — so different
trees are forced to explore different structures and their errors become less correlated. You pay a
small price in individual tree quality (each tree is slightly worse than it could be, so bias rises
slightly) in exchange for a large reduction in `ρ`, which lowers the variance floor. That trade is the
entire innovation of Random Forest over plain bagging, and being able to state it in those terms — with
the variance identity — is one of the highest-value answers in this course.

**OOB error is free cross-validation.** Each bootstrap sample omits about 36.8% of the rows, since the
probability a given row is never picked in `n` draws with replacement is `(1 - 1/n)ⁿ → 1/e ≈ 0.368`.
So for every training row there's a subset of trees that never saw it, and you can predict that row
using only those trees. Aggregating over all rows gives an out-of-bag error estimate that's roughly
comparable to k-fold CV — at no extra training cost, since it reuses the trees you already built.
Caveats worth mentioning: it's less reliable with few trees, and it assumes rows are i.i.d., so it's
invalid under temporal or group structure, where you still need a proper time- or group-aware split.

**More trees never meaningfully overfit a Random Forest.** Each tree is fitted independently, and
prediction is an average. Adding trees reduces the `(1-ρ)σ²/B` term monotonically and then plateaus;
it does not push the ensemble toward the training data. So `n_estimators` is a compute-and-latency
decision, not a regularization decision — set it as high as your budget allows and stop when the OOB
curve flattens. This is diametrically opposite to boosting, where `n_estimators` is the primary
overfitting risk. That contrast is the single most-asked ensemble question.

**Extra Trees push randomization further.** Instead of searching for the best threshold on each
candidate feature, Extra Trees pick thresholds **at random** and take the best among those random
candidates; they also typically use the whole dataset rather than bootstrap samples. This further
reduces correlation and is much faster (no threshold search), at the cost of slightly higher bias per
tree. On noisy data they sometimes beat Random Forests, and they're worth naming as a cheap thing to
try.

### 16.3 Whiteboard formulas

```text
Bootstrap            draw n samples from n WITH replacement
P(row excluded)      (1 - 1/n)ⁿ → 1/e ≈ 0.368        → ~63.2% of rows in each bag
OOB set              the ~36.8% left out; use trees that didn't see a row to predict it

Bagged prediction    regression:     ŷ = (1/B) Σ_b f_b(x)
                     classification: majority vote, or average predicted probabilities

Variance of an average of B estimators with pairwise correlation ρ:
      Var = ρσ² + (1-ρ)σ²/B
      B→∞  ⇒  Var → ρσ²          ← the floor; reduce it by reducing ρ

Random Forest = bagging + at each split consider only max_features random features
      classification default: max_features = √p
      regression   default: max_features = p/3  (sklearn historically 1.0 — set it explicitly)

Bias:      roughly unchanged by bagging (slightly ↑ for RF due to restricted splits)
Variance:  reduced substantially
```

### 16.4 Bagging vs boosting — the table to memorize

| | **Bagging / Random Forest** | **Boosting** |
|---|---|---|
| Training | **Parallel**, independent | **Sequential**, each depends on the last |
| Samples | Bootstrap resamples | Full data, reweighted or gradient-targeted |
| Base learner | **Low bias, high variance** (deep trees) | **High bias, low variance** (shallow trees/stumps) |
| Primarily reduces | **Variance** | **Bias** |
| More estimators → | Plateaus; no real overfitting | **Can overfit**; needs early stopping |
| Overfit risk | Low | Moderate to high |
| Parallelizable | Yes, trivially | No across trees (yes within a split) |
| Noise/outlier sensitivity | Robust | More sensitive (keeps chasing hard points) |
| Hyperparameter sensitivity | Low — good defaults | High — needs tuning |
| Typical accuracy (tabular) | Strong | **Usually best** |
| Free validation | OOB error | No (use a validation set for early stopping) |

### 16.5 Gotchas that fail candidates

- **Saying Random Forest is just bagging.** The feature subsampling is the point.
- **Not being able to explain *why* feature subsampling helps.** "Decorrelation" plus the variance
  identity is the answer.
- **Getting the `n_estimators` overfitting comparison wrong.**
- **Trusting `feature_importances_` uncritically.** Know the high-cardinality bias.
- **Not knowing the 63.2%/36.8% bootstrap result.**
- **Using OOB error on time-series data.** It assumes i.i.d. rows.
- **Saying RF handles missing values natively in `sklearn`.** It doesn't — you must impute, unlike
  XGBoost/LightGBM.

### 16.6 Hands-on drill

1. Verify the 63.2% result empirically: bootstrap-sample repeatedly and count unique rows.
2. Implement bagging over your Module 15 tree from scratch. Plot test error against `B` and watch it
   plateau — that plateau is the `ρσ²` floor.
3. Add random feature subsampling to get a Random Forest. Plot test error against `max_features` from
   1 to `p` and find the interior optimum. **This plot is the empirical proof of the decorrelation
   argument** and is worth describing verbally in interviews.
4. Compute average pairwise correlation of tree predictions for bagging vs RF and confirm RF's is
   lower.
5. Compare OOB error against 5-fold CV error on the same data; note how close they are and how much
   less compute OOB cost.
6. Compare `feature_importances_` with `permutation_importance` on a dataset containing a
   high-cardinality ID column. The ID will rank absurdly high on MDI and near zero on permutation
   importance — that contrast is the answer to the feature-importance question.

### 16.7 2026 interview questions

**Q1 `[THEORY]` — Bagging vs boosting. Explain the difference completely.**

**Answer.** They're opposite strategies against opposite problems. **Bagging** trains many models
independently in parallel, each on a bootstrap resample, then averages or votes. Base learners are
deliberately low-bias and high-variance — typically fully grown trees — and averaging cancels their
uncorrelated errors, so bagging primarily reduces **variance** while leaving bias roughly unchanged.
It's trivially parallelizable, robust to noise, forgiving of hyperparameters, and adding estimators
plateaus rather than overfits. **Boosting** trains models sequentially, each one focused on what the
current ensemble gets wrong — via reweighted samples in AdaBoost or by fitting the negative gradient
of the loss in gradient boosting. Base learners are deliberately weak and high-bias — shallow trees or
stumps — and the sequence progressively reduces **bias**. It's not parallelizable across trees, is
more sensitive to noise and mislabeled points because it keeps chasing hard examples, needs careful
tuning, and **will** overfit as trees accumulate, so it requires early stopping. Practically: bagging
if you want a strong robust model with minimal tuning; boosting if you want maximum accuracy on
tabular data and can afford to tune and validate properly.

*What's being tested:* The single most common ensemble question. A complete answer covers training
order, base-learner strength, which error component is reduced, parallelizability, and overfitting
behaviour. Cover all five and you're in the top band.

---

**Q2 `[MATH]` `[TRAP]` — Random Forest is bagging plus what, and why does that addition matter?**

**Answer.** Plus **random feature subsampling at every split**: each split considers only a random
subset of features (`√p` by default for classification, `p/3` for regression) rather than all of them.
It matters because of the variance identity for an average of correlated estimators:
`Var = ρσ² + (1−ρ)σ²/B`. The second term goes to zero as you add trees, but the first term — set by the
pairwise correlation `ρ` between trees — is a hard floor that no amount of averaging can beat. Plain
bagged trees are strongly correlated, because if one feature is dominantly predictive, nearly every
tree will split on it at the root and the trees end up structurally similar. Feature subsampling
prevents that: sometimes the dominant feature isn't even in the candidate set, so trees are forced to
explore different structures and `ρ` drops, lowering the variance floor. The cost is that each
individual tree is slightly worse — bias rises a little — but the reduction in `ρ` more than
compensates. So Random Forest deliberately makes each model worse to make the *ensemble* better, which
is the elegant idea at its core.

*What's being tested:* Whether you can produce the variance identity and the decorrelation argument.
This is the highest-signal answer in the module — most candidates say "it adds randomness" and stop.

*Follow-up:* "Why `√p` specifically?" — It's an empirical default from Breiman's work that balances
decorrelation against individual tree quality: too few features and each tree is badly handicapped,
too many and correlation stays high. It's worth tuning, and the optimum is usually an interior point,
which you can demonstrate by plotting test error against `max_features`.

---

**Q3 `[MATH]` — What is out-of-bag error and why is it useful?**

**Answer.** A bootstrap sample of size `n` drawn with replacement omits each particular row with
probability `(1 − 1/n)ⁿ`, which converges to `1/e ≈ 0.368` — so about 36.8% of rows are out-of-bag for
each tree, and about 63.2% are in-bag. For any training row, the subset of trees that never saw it can
be used to predict it; aggregating those predictions across all rows gives the out-of-bag error. It's
useful because it's essentially free validation: no separate holdout, no extra model fits, and it's
generally comparable to k-fold cross-validation, so you can use it for model selection and for
choosing when the OOB curve has flattened with respect to `n_estimators`. Caveats: it's noisy with few
trees; it can be mildly pessimistic since each row is predicted by only ~37% of the ensemble; and
crucially it assumes rows are **i.i.d.**, so it's invalid under temporal or group structure, where you
still need a time-based or `GroupKFold` split.

*What's being tested:* Whether you can derive the 36.8% and know the i.i.d. caveat. The caveat is the
part that distinguishes a practitioner.

---

**Q4 `[THEORY]` `[TRAP]` — Can you overfit a Random Forest?**

**Answer.** Not by adding trees — but yes, in other ways, and the distinction matters. Adding trees is
safe: each is fitted independently and prediction is an average, so more trees monotonically reduce the
`(1−ρ)σ²/B` variance term and then plateau. Test error flattens; it doesn't rise. So `n_estimators` is a
compute/latency choice, not a regularization one. You *can* still overfit a Random Forest by: growing
trees fully on a small or noisy dataset, where each leaf holds one or two samples and the ensemble
memorizes label noise; setting `max_features` too high, which raises `ρ` and undermines the whole
mechanism; or having far more features than samples, where even decorrelated trees find spurious
splits. Controls: `min_samples_leaf`, `max_depth`, and a lower `max_features`. The contrast with
boosting is the point of the question — there, `n_estimators` is the primary overfitting risk and early
stopping is mandatory.

*What's being tested:* Precision. The complete answer is "not via `n_estimators`, but yes via tree
complexity" — candidates who answer a flat "no, RF can't overfit" are overstating it.

---

**Q5 `[THEORY]` `[TRAP]` — How do you interpret `feature_importances_` from a Random Forest?**

**Answer.** Carefully, because `sklearn`'s default is **mean decrease in impurity** (MDI) — the total
impurity reduction attributable to each feature, averaged over trees — and it has three known biases.
(1) It favours **high-cardinality and continuous features**, because more candidate split points mean
more chances to reduce impurity; a random unique-ID column can score high while carrying zero signal.
(2) It's computed on **training data**, so it reflects what the model used to fit, including noise, not
what generalizes. (3) With **correlated features** it splits credit arbitrarily among them, so an
important feature can look unimportant simply because a correlated twin absorbed the attribution. The
better tool is **permutation importance** on a held-out set: shuffle one feature's values and measure
the drop in validation performance, which directly measures the feature's contribution to
generalization and is model-agnostic — though it too is distorted by correlated features, since a twin
can substitute for the shuffled one. For real interpretation work, SHAP values give consistent
per-prediction attributions (Module 21). And the most important caveat regardless of method:
**importance is not causation** — a feature can be important because it proxies for an unmeasured cause.

*What's being tested:* Whether you know that the default is untrustworthy. Naming MDI vs permutation
importance and the correlated-feature caveat is the strong answer.

---

**Q6 `[APPLIED]` — When would you choose Random Forest over XGBoost in 2026?**

**Answer.** Several legitimate cases. (1) **Minimal tuning budget** — RF's defaults are strong and it's
forgiving, whereas boosted trees need `learning_rate`, `n_estimators`, depth and regularization tuned
to reach their potential; if I have hours rather than days, RF often gets closer to its ceiling. (2)
**Noisy labels** — boosting keeps focusing on hard examples, so it chases mislabeled points, while
bagging averages them out; RF is meaningfully more robust here. (3) **Free validation via OOB** when
data is limited and I want an honest estimate without spending rows on a holdout. (4) **Trivial
parallelism** — trees train independently, so wall-clock time scales with cores, which can matter for
frequent retraining. (5) **A robust baseline** to establish what's achievable before investing in
tuning. (6) **Very high-dimensional data with many irrelevant features**, where feature subsampling
provides useful implicit selection. That said, I'd be honest that on most tabular problems a
well-tuned LightGBM or XGBoost model wins on accuracy and trains faster on large data, so RF is
typically my strong baseline rather than my final model.

*What's being tested:* Whether you can defend the simpler ensemble on real grounds. The noisy-labels
point is the most technically interesting and least commonly given.

---

## Module 17 — Boosting I: AdaBoost & Gradient Boosting

| | |
|---|---|
| **Prerequisites** | Modules 09, 15, 16 |
| **Study time** | 8 h |
| **Why it's in the loop** | Guaranteed. "What does each tree fit?" is the make-or-break question. |
| **Rounds** | `[THEORY]` `[MATH]` `[TRAP]` |

### 17.1 What to learn

1. The boosting principle: combine many weak learners sequentially into a strong learner.
2. What "weak learner" formally means (better than random), and the PAC-learning origin of boosting.
3. **AdaBoost**: reweighting misclassified samples, computing learner weights `α`, and the exponential
   loss it implicitly minimizes.
4. **Gradient boosting**: the general framework — fit each new learner to the **negative gradient of
   the loss with respect to the current predictions** (the pseudo-residuals).
5. Why "fit the residuals" is only literally true for squared error, and what it becomes for log-loss.
6. Gradient boosting as **gradient descent in function space** (the Module 09 connection).
7. The algorithm step by step: initialize with a constant, then iterate — compute pseudo-residuals,
   fit a tree, find leaf values, update with shrinkage.
8. **Shrinkage / learning rate** and its trade against `n_estimators`.
9. **Stochastic gradient boosting**: `subsample` and its regularizing effect.
10. Tree depth in boosting: why shallow (3–8) rather than deep, and depth as an interaction-order
    control.
11. **Early stopping** on a validation set as the primary complexity control.
12. Loss functions for boosting: squared error, absolute error, Huber, log-loss, multi-class
    cross-entropy, Poisson, quantile.
13. Why boosting is sensitive to noisy labels and outliers.
14. AdaBoost vs gradient boosting: how they relate, and AdaBoost as a special case.

### 17.2 Core intuitions

**Boosting builds a committee where each new member specializes in the previous committee's
mistakes.** Start with a weak model. Look at what it gets wrong. Train the next model to focus on
exactly that. Add it to the ensemble with a small weight. Repeat. Each individual model is barely
better than guessing, but the sum becomes highly accurate — which is the surprising theoretical result
that started the field.

**AdaBoost reweights the data; gradient boosting reweights the target.** AdaBoost keeps a weight per
training sample, increases the weights of misclassified points, and fits the next stump to that
reweighted distribution, then adds it with weight `α = ½ln((1−ε)/ε)` where `ε` is its weighted error —
so accurate learners get large `α`, and a learner at exactly 50% error gets `α = 0` (no contribution).
Gradient boosting instead leaves sample weights alone and changes what the next tree is *trying to
predict*: the negative gradient of the loss at the current predictions.

**The single most important sentence in this module: each gradient-boosting tree is fitted to the
negative gradient of the loss with respect to the current predictions.** Not "the residuals" in
general. For squared error the negative gradient happens to equal `y − F(x)`, the residual, which is
why the intuitive story works for regression — but for log-loss it's `y − p`, and for absolute error
it's `sign(y − F(x))`. Saying "residuals" for the general case is the most common way candidates reveal
a shallow understanding, and saying "negative gradient" correctly — then noting that it *reduces to*
the residual under MSE — is the fastest way to demonstrate the opposite.

**It's gradient descent in function space.** Ordinary gradient descent updates parameters:
`w ← w − η∇_w J`. Gradient boosting updates the *function*: `F ← F − η∇_F J`, where the gradient can't
be taken directly (the function is not a finite parameter vector) so you fit a weak learner to
approximate it. The new tree is the descent direction; the learning rate is the step size. This framing
makes every boosting hyperparameter interpretable and is the best possible answer to "how are they
related?"

**Shrinkage and `n_estimators` trade off against each other, and shrinkage almost always wins.**
Multiplying each tree's contribution by a small `η` (0.01–0.1) means each step is a small correction,
so more steps are needed but the ensemble generalizes better — averaging many small corrections is
more robust than taking a few large ones. So the standard recipe is: set a low learning rate, set
`n_estimators` high, and let **early stopping** on a validation set decide when to stop. Halving the
learning rate roughly doubles the required number of trees.

**Shallow trees, deliberately.** Boosting wants weak learners, so depths of 3–8 (or `num_leaves` around
31 in LightGBM) are typical, versus fully grown trees in a Random Forest. There's an elegant
interpretation: a depth-`d` tree can represent interactions of order at most `d`, so `max_depth`
directly controls the interaction order your model can capture. Depth 1 (stumps) gives a purely
additive model with no interactions; depth 2 allows pairwise interactions; and so on. Deeper trees in
boosting overfit quickly because each is already fitting a residual signal that is mostly noise by
later iterations.

**Boosting chases noise, and this is its main structural weakness.** Because each iteration focuses on
what the ensemble currently gets wrong, and mislabeled points are permanently "wrong," boosting keeps
allocating capacity to them. AdaBoost is especially vulnerable, since exponential loss grows
exponentially in the margin violation, so a single badly mislabeled outlier can dominate the weight
distribution. Gradient boosting with log-loss is gentler, and using Huber or absolute-error losses for
regression makes it more robust still. This is the crisp reason to prefer a Random Forest on
known-noisy labels.

### 17.3 Whiteboard formulas

```text
=== AdaBoost (binary, y ∈ {-1,+1}) ===
init weights        wᵢ = 1/n
for m = 1..M:
    fit weak learner h_m to the weighted data
    weighted error  ε_m = Σᵢ wᵢ·1[h_m(xᵢ) ≠ yᵢ] / Σᵢ wᵢ
    learner weight  α_m = ½·ln((1-ε_m)/ε_m)         ε=0.5 → α=0 ; ε→0 → α→∞
    update weights  wᵢ ← wᵢ·exp(-α_m·yᵢ·h_m(xᵢ))    then renormalize
final               F(x) = sign( Σ_m α_m·h_m(x) )
implicit loss       exponential loss  L = exp(-y·F(x))

=== Gradient Boosting (any differentiable loss L) ===
init                F₀(x) = argmin_c Σᵢ L(yᵢ, c)      (e.g. mean for MSE, log-odds for log-loss)
for m = 1..M:
    pseudo-residual rᵢ = -[ ∂L(yᵢ, F(xᵢ)) / ∂F(xᵢ) ]_{F=F_{m-1}}     ← THE key line
    fit tree h_m to predict rᵢ
    leaf values  γ_j = argmin_γ Σ_{xᵢ∈leaf j} L(yᵢ, F_{m-1}(xᵢ) + γ)
    update       F_m(x) = F_{m-1}(x) + η·h_m(x)          η = learning rate (shrinkage)

Negative gradient by loss:
    squared error ½(y-F)²      →  r = y - F           ← the actual residual
    log-loss (binary)          →  r = y - p,  p = σ(F)
    absolute error |y-F|       →  r = sign(y - F)
    Huber                      →  clipped residual

Function-space view:  F ← F - η·∇_F J     ⇔ gradient descent, with h_m ≈ -∇_F J
```

### 17.4 Gotchas that fail candidates

- **Saying "each tree fits the residuals"** without qualifying that this holds only for squared error.
- **Not knowing what AdaBoost's `α` means** or that `ε = 0.5` gives `α = 0`.
- **Saying boosting reduces variance.** It primarily reduces **bias**.
- **Using deep trees in boosting.**
- **Not using early stopping**, or tuning `n_estimators` by grid search when early stopping is both
  cheaper and better.
- **Claiming boosting is parallelizable across trees.** It isn't — it's sequential by construction.
  (Parallelism happens *within* split finding.)
- **Not knowing boosting is sensitive to label noise.**

### 17.5 Hands-on drill

1. Implement gradient boosting for regression from scratch on top of your Module 15 tree: initialize
   with the mean, loop computing residuals, fit a shallow tree, update with a learning rate. Confirm
   you match `GradientBoostingRegressor` closely.
2. Extend it to log-loss and verify the pseudo-residual is `y − p`, **not** `y − F`. Doing this once
   permanently fixes the most-failed question in this module.
3. Plot training and validation loss against `n_estimators`. Watch training loss fall monotonically
   while validation loss bottoms out and then rises — the overfitting signature bagging doesn't have.
4. Grid the learning rate over {0.3, 0.1, 0.03, 0.01} and record the optimal `n_estimators` for each.
   Confirm the inverse relationship.
5. Corrupt 5% of labels and compare gradient boosting against Random Forest. Quantify boosting's
   larger degradation — that number is your evidence for the noise-sensitivity question.
6. Implement AdaBoost with stumps and print the `α` sequence to see how learner weights evolve.

### 17.6 2026 interview questions

**Q1 `[MATH]` `[TRAP]` — In gradient boosting, what exactly does each new tree fit?**

**Answer.** Each new tree is fitted to the **negative gradient of the loss function with respect to the
current model's predictions**, evaluated at the current ensemble — the pseudo-residuals
`rᵢ = −∂L(yᵢ, F(xᵢ))/∂F(xᵢ)`. It is *not* "the residuals" in general. For squared error the negative
gradient works out to exactly `y − F(x)`, the ordinary residual, which is why the popular "fit the
residuals" description is fine for regression with MSE. But for binary log-loss it's `y − p` where
`p = σ(F(x))` — the difference between the label and the predicted probability, not the raw prediction.
For absolute error it's `sign(y − F(x))`, which is why an MAE-boosted model behaves so differently. The
general formulation is what lets gradient boosting work with any differentiable loss — Poisson for
counts, quantile for asymmetric costs, Huber for robustness — and that generality is the whole point of
Friedman's framing.

*What's being tested:* The single highest-signal question in the boosting module. Interviewers use it
precisely because "residuals" is the memorized answer and "negative gradient, which reduces to the
residual under MSE" is the understood one.

*Follow-up:* "So what's the initial prediction `F₀`?" — The constant minimizing the loss: the mean of
`y` for squared error, the median for absolute error, and the log-odds of the base rate for log-loss.

---

**Q2 `[THEORY]` — Explain AdaBoost.**

**Answer.** AdaBoost maintains a weight per training sample, starting uniform at `1/n`. At each round it
fits a weak learner — classically a decision stump — to the weighted data, computes that learner's
weighted error `ε_m`, and assigns it an ensemble weight `α_m = ½ln((1−ε_m)/ε_m)`. Then it multiplies the
weights of misclassified samples up and correctly classified samples down (via
`wᵢ ← wᵢ·exp(−α_m yᵢ h_m(xᵢ))`) and renormalizes, so the next learner concentrates on what the current
committee gets wrong. The final prediction is the sign of the α-weighted vote. Two things are worth
noting about `α`: a learner at exactly 50% error gets `α = 0` and contributes nothing, while a
near-perfect learner gets a very large `α` — so accuracy is rewarded superlinearly. And it can be shown
that AdaBoost is performing coordinate-wise minimization of an **exponential loss**
`exp(−y·F(x))`, which makes it a special case of the general gradient-boosting framework and also
explains its notable sensitivity to mislabeled points, since exponential loss grows exponentially in
the margin violation.

*What's being tested:* Whether you know the mechanism, and whether you know the exponential-loss
connection. That connection is what unifies this module.

---

**Q3 `[MATH]` — How is gradient boosting related to gradient descent?**

**Answer.** It *is* gradient descent, performed in **function space** rather than parameter space.
Ordinary gradient descent parameterizes the model and steps `w ← w − η∇_w J`. Gradient boosting treats
the prediction function `F` itself as the optimization variable and steps `F ← F − η∇_F J`. The
complication is that you can't add a gradient to a function directly, so at each stage you compute the
negative gradient at each training point — the pseudo-residuals — and fit a weak learner to
approximate that vector, giving `F_m = F_{m−1} + η·h_m`. So the new tree plays the role of the descent
direction, and boosting's learning rate (shrinkage) is exactly the step size η. The framing makes every
hyperparameter interpretable: `n_estimators` is the number of descent steps, `learning_rate` is the
step size, and early stopping is convergence monitoring. XGBoost extends the analogy to **second
order**, using a Taylor expansion with both the gradient and the Hessian to choose leaf values, which
makes it the function-space analogue of Newton's method rather than plain gradient descent.

*What's being tested:* The unifying insight of Modules 09 and 17. Landing the Newton's-method extension
for XGBoost sets you up perfectly for Module 18.

---

**Q4 `[THEORY]` — How do the learning rate and `n_estimators` interact, and how do you set them?**

**Answer.** They trade off inversely: a lower learning rate means each tree contributes a smaller
correction, so more trees are needed to reach the same training fit — roughly, halving the learning
rate doubles the number of trees required. Lower learning rates generalize better, because many small
corrections are more robust than a few large ones, so the standard recipe is to fix a small learning
rate (0.01–0.1 depending on your compute budget), set `n_estimators` deliberately high, and let
**early stopping** on a validation set determine where to actually stop. That's strictly better than
grid-searching `n_estimators`, because a single fit with early stopping finds the optimum for that
learning rate at the cost of one training run rather than many. In practice I'd tune the learning rate
against my time budget — 0.1 for fast iteration, 0.01–0.03 for the final model — and always report
which iteration early stopping selected, since a model that stopped at 80 trees out of 5,000 is telling
you something about signal in the data.

*What's being tested:* Practical tuning competence. The "use early stopping instead of grid-searching
`n_estimators`" point is what makes it a practitioner's answer.

---

**Q5 `[THEORY]` `[TRAP]` — Why does boosting use shallow trees while Random Forest uses deep ones?**

**Answer.** Because they're attacking opposite error components. Random Forest reduces **variance** by
averaging, so it wants base learners with **low bias** — fully grown trees that individually fit the
data well, whose high variance averaging then cancels. Boosting reduces **bias** by sequentially
correcting errors, so it wants base learners that are deliberately **weak**: a shallow tree contributes
a small, low-variance correction, and the ensemble builds accuracy gradually. If you used deep trees in
boosting, the first tree would already fit most of the signal, subsequent trees would fit noise in the
residuals, and the ensemble would overfit rapidly. There's also a nice interpretive angle: a depth-`d`
tree can capture interactions of order at most `d`, so `max_depth` in boosting directly controls the
interaction order of the model — depth 1 gives a purely additive model, depth 2 allows pairwise
interactions, and so on. Typical values are 3–8 for boosting (or `num_leaves ≈ 31` in LightGBM) versus
unlimited depth in a Random Forest.

*What's being tested:* Whether you can derive the hyperparameter choice from the bias–variance role of
each method. The interaction-order interpretation is a strong extra.

---

**Q6 `[THEORY]` `[TRAP]` — 5% of your labels are wrong. Random Forest or gradient boosting?**

**Answer.** Random Forest, for a structural reason. Boosting explicitly concentrates each successive
learner on what the current ensemble gets wrong, and a mislabeled point is permanently wrong — so
boosting will keep allocating capacity to fitting noise, in the worst case building a large part of the
ensemble around a handful of bad labels. AdaBoost is the most vulnerable, since its exponential loss
grows exponentially in the margin violation, so one badly mislabeled outlier can dominate the weight
distribution entirely. Bagging has the opposite behaviour: each tree sees a bootstrap sample that
includes the bad label only ~63% of the time, and averaging dilutes its influence. If I did want
boosting's accuracy despite the noise, the mitigations are a robust loss (Huber or absolute error for
regression rather than squared error), a lower learning rate with aggressive early stopping,
`subsample` below 1 for stochastic boosting, and stronger leaf regularization. But the highest-value
action isn't a modelling choice at all — it's cleaning the labels, since 5% noise puts a ceiling on
what any model can achieve, and finding the mislabeled rows (e.g. by flagging high-loss training
examples for review) usually beats any algorithmic workaround.

*What's being tested:* Whether you understand *why* boosting is noise-sensitive, and whether you
recognize that the data is the real problem. Both halves are needed for a full answer.

---

## Module 18 — Boosting II: XGBoost, LightGBM, CatBoost

| | |
|---|---|
| **Prerequisites** | Module 17 |
| **Study time** | 10 h |
| **Why it's in the loop** | The default production model for tabular data. Expect deep questions. |
| **Rounds** | `[THEORY]` `[MATH]` `[APPLIED]` `[CODE]` |

### 18.1 What to learn

**XGBoost**
1. The **regularized objective**: loss + `γT + ½λΣw_j²` — regularization built into the objective, not
   bolted on.
2. The **second-order Taylor expansion** of the loss using gradient `gᵢ` and Hessian `hᵢ`.
3. The derived **optimal leaf weight** `w_j* = −G_j/(H_j + λ)` and the **gain/similarity score**.
4. The split-gain formula and how `γ` acts as a minimum-gain threshold (pre-pruning).
5. **Sparsity-aware split finding**: the learned default direction for missing values.
6. The **weighted quantile sketch** for approximate split finding on large data.
7. The histogram-based method (`tree_method='hist'`) and why it's now the default.
8. Systems engineering: the column block structure, cache-aware access, out-of-core computation —
   the "why is it fast" answer.
9. Key hyperparameters and what each controls: `learning_rate`, `n_estimators`, `max_depth`,
   `min_child_weight`, `subsample`, `colsample_bytree`, `gamma`, `reg_alpha`, `reg_lambda`,
   `scale_pos_weight`.
10. Early stopping and monotonic constraints.

**LightGBM**
11. **Leaf-wise** (best-first) growth versus XGBoost's level-wise growth, and the accuracy/overfitting
    implication.
12. `num_leaves` as the primary capacity control, and why `max_depth` is secondary.
13. **GOSS** (Gradient-based One-Side Sampling) — keep large-gradient samples, subsample small-gradient
    ones.
14. **EFB** (Exclusive Feature Bundling) — bundle mutually-exclusive sparse features.
15. Native categorical feature support.
16. Why it's typically much faster than XGBoost on large datasets, and where it overfits more easily.

**CatBoost**
17. **Ordered boosting** — how it addresses the prediction-shift/target-leakage problem in standard
    boosting.
18. **Ordered target statistics** for categorical encoding without leakage.
19. **Oblivious (symmetric) trees** and their speed and regularization consequences.
20. Why it's often the best default on categorical-heavy data with minimal tuning.

**Practice**
21. Choosing among the three; a sensible tuning order; typical value ranges.
22. Where all three still lose: extrapolation, very high-cardinality-only signal, genuine
    multimodality, tiny datasets.
23. What's changed by 2026 — tabular foundation models, and why GBDTs remain the baseline to beat.

### 18.2 Core intuitions

**XGBoost's central idea is that regularization belongs in the objective.** Standard gradient boosting
fits a tree to the pseudo-residuals and then, separately, applies heuristics like depth limits.
XGBoost writes down a single objective including tree complexity:

```text
Obj = Σᵢ L(yᵢ, ŷᵢ) + Σ_trees [ γT + ½λΣ_j w_j² ]
```

where `T` is the number of leaves and `w_j` the leaf weights. Then it solves for the optimal tree
*under that objective*. So the number of leaves and the magnitude of leaf outputs are penalized by
construction, and split decisions already account for complexity cost.

**The second-order expansion is what makes it work.** Approximate the loss around the current
prediction with a second-order Taylor expansion, using `gᵢ = ∂L/∂ŷᵢ` and `hᵢ = ∂²L/∂ŷᵢ²`. Because the
resulting objective is quadratic in the leaf weights, you can solve it in closed form. For a leaf with
sample set `I_j`, writing `G_j = Σ_{i∈I_j} gᵢ` and `H_j = Σ_{i∈I_j} hᵢ`:

```text
optimal leaf weight   w_j* = -G_j / (H_j + λ)
resulting objective   -½ Σ_j G_j²/(H_j + λ) + γT
```

The quantity `G²/(H+λ)` is XGBoost's "similarity score," and the split gain is just the improvement in
that quantity:

```text
Gain = ½[ G_L²/(H_L+λ) + G_R²/(H_R+λ) - (G_L+G_R)²/(H_L+H_R+λ) ] - γ
```

Three things fall out of this one formula, and being able to point them out is the mark of a strong
answer. `λ` in the denominator shrinks leaf weights, most strongly for leaves with small `H` (few or
low-confidence samples). `γ` is subtracted, so a split is only made if its gain exceeds `γ` — that's
principled pre-pruning built into the split criterion. And using the Hessian rather than just sample
counts means "how much data is in this leaf" is measured in terms of *confidence-weighted* information,
which is what `min_child_weight` actually thresholds on — a subtlety most candidates miss.

**Missing values get a learned direction.** At each split, XGBoost sends all missing values to the left
child, computes the gain, then sends them all right and computes the gain, and keeps whichever is
better as that split's default direction. So missingness handling is *learned per split from the data*
rather than imputed by a global rule. That's a genuine advantage on messy tabular data and a common
interview question.

**LightGBM grows leaf-wise, which is faster and more prone to overfitting.** XGBoost's classic
level-wise growth expands all nodes at a given depth before going deeper, producing balanced trees.
LightGBM instead picks the single leaf with the highest split gain anywhere in the tree and splits
that. For the same number of leaves this reaches lower loss, because it spends capacity where it pays
most — but it produces deep, unbalanced trees that can carve out very specific regions, so it overfits
small datasets more readily. Consequently `num_leaves` (not `max_depth`) is the primary capacity knob,
and it's important that `num_leaves` stays well below `2^max_depth` or the constraint does nothing.

**GOSS and EFB are what make LightGBM fast.** **GOSS** exploits the observation that samples with small
gradients are already well-fitted and contribute little to further split-gain estimation, so it keeps
all large-gradient samples and randomly subsamples the small-gradient ones, reweighting to keep the
gain estimate unbiased — fewer samples per iteration, nearly the same split decisions. **EFB** exploits
sparsity: in one-hot-encoded or otherwise sparse data, many features are almost never non-zero
simultaneously, so they can be *bundled* into a single feature without losing information, reducing the
effective feature count substantially. Together with histogram binning, these give large speedups on
big, sparse data.

**CatBoost's ordered boosting addresses a subtle bias in standard boosting.** In conventional gradient
boosting, the residual for sample `i` is computed using a model that was itself trained on sample `i`.
That's a mild form of target leakage, and it produces a systematic **prediction shift** — the
distribution of residuals seen during training differs from what you'd see on unseen data, biasing the
fit. CatBoost's ordered boosting fixes it using random permutations of the data: the residual for a
sample is computed from a model trained only on samples appearing *before* it in the permutation. The
same principle powers its **ordered target statistics** for categorical features — the target encoding
for a row uses only preceding rows, which is a principled solution to the target-encoding leakage
problem from Module 04. That's why CatBoost is often the strongest option on categorical-heavy data
with little tuning.

**Oblivious trees.** CatBoost uses symmetric trees where every node at a given depth splits on the same
feature and threshold. That's a strong structural constraint — hence a regularizer, which helps on
smaller data — and it makes inference extremely fast, since a prediction becomes a bit-vector index
lookup rather than a branchy traversal. Worth knowing as a real differentiator when serving latency
matters.

**Where all three still lose, in 2026.** They cannot extrapolate beyond the training range, so trending
targets need detrending or explicit trend features. They handle genuinely multimodal data (text +
image + tabular) only if you convert the other modalities into features first. They need enough data —
on a few hundred rows a regularized linear model often wins. And they're not naturally calibrated, so
add Platt or isotonic calibration if you need honest probabilities. Regarding what's new: tabular
foundation models (in-context learners such as the TabPFN line) emerged as a credible approach for
small tabular datasets and are worth knowing about, but gradient-boosted trees remain the default
baseline to beat on medium-to-large tabular problems, and the defensible interview position is to name
the newer approaches while treating GBDTs as the benchmark.

### 18.3 Whiteboard formulas

```text
=== XGBoost objective ===
Obj⁽ᵗ⁾ ≈ Σᵢ [ gᵢ·f_t(xᵢ) + ½hᵢ·f_t(xᵢ)² ] + γT + ½λ Σ_j w_j²
         where gᵢ = ∂L/∂ŷᵢ⁽ᵗ⁻¹⁾ ,  hᵢ = ∂²L/∂(ŷᵢ⁽ᵗ⁻¹⁾)²

For leaf j with sample set I_j:   G_j = Σ_{i∈I_j} gᵢ ,  H_j = Σ_{i∈I_j} hᵢ

Optimal leaf weight    w_j* = -G_j / (H_j + λ)
Objective at optimum   Obj = -½ Σ_j G_j²/(H_j + λ)  +  γT
Similarity score       G²/(H + λ)

Split gain             Gain = ½[ G_L²/(H_L+λ) + G_R²/(H_R+λ)
                                 - (G_L+G_R)²/(H_L+H_R+λ) ] - γ
                       split only if Gain > 0  ⇒ γ is built-in pre-pruning

For log-loss:  gᵢ = pᵢ - yᵢ  ,  hᵢ = pᵢ(1-pᵢ)
For MSE:       gᵢ = ŷᵢ - yᵢ  ,  hᵢ = 1        (→ reduces to plain gradient boosting)

min_child_weight thresholds Σh in a leaf — NOT the sample count
```

### 18.4 Hyperparameter reference

| Parameter | Controls | Typical range | Direction |
|---|---|---|---|
| `learning_rate` / `eta` | Step size | 0.01–0.3 | ↓ = better generalization, more trees needed |
| `n_estimators` | Number of trees | 100–5000 | Set high + **early stopping** |
| `max_depth` | Tree depth (XGB) | 3–10 | ↑ = more variance |
| `num_leaves` | Capacity (LGBM) | 15–255 | ↑ = more variance; keep < 2^max_depth |
| `min_child_weight` | Min Σhessian per leaf | 1–20 | ↑ = more regularization |
| `min_child_samples` | Min rows per leaf (LGBM) | 5–100 | ↑ = more regularization |
| `subsample` / `bagging_fraction` | Row sampling per tree | 0.6–1.0 | < 1 regularizes |
| `colsample_bytree` / `feature_fraction` | Feature sampling per tree | 0.5–1.0 | < 1 regularizes + decorrelates |
| `gamma` / `min_split_loss` | Min gain to split | 0–5 | ↑ = more pruning |
| `reg_lambda` | L2 on leaf weights | 0–10 | ↑ = smaller leaf values |
| `reg_alpha` | L1 on leaf weights | 0–10 | ↑ = sparser leaves |
| `scale_pos_weight` | Class imbalance | `n_neg/n_pos` | For imbalanced binary |
| `max_bin` | Histogram bins | 63–255 | ↓ = faster, coarser |

**Tuning order that works:** fix a moderate `learning_rate` (0.1) with early stopping → tune capacity
(`max_depth`/`num_leaves`, `min_child_weight`) → tune sampling (`subsample`, `colsample_bytree`) →
tune regularization (`reg_lambda`, `gamma`) → finally lower the learning rate and raise
`n_estimators` for the production model.

### 18.5 Library comparison

| | **XGBoost** | **LightGBM** | **CatBoost** |
|---|---|---|---|
| Tree growth | Level-wise (`hist` default now) | **Leaf-wise** (best-first) | **Oblivious/symmetric** |
| Speed on large data | Fast | **Fastest** | Fast |
| Small-data overfitting | Moderate | **Higher** (leaf-wise) | **Lowest** (symmetric trees) |
| Categorical support | Limited (needs encoding) | Native | **Best** (ordered target stats) |
| Missing values | Learned default direction | Native | Native |
| Key capacity knob | `max_depth` | `num_leaves` | `depth` |
| Signature techniques | 2nd-order + regularized objective, sparsity-aware splits, quantile sketch | GOSS, EFB, leaf-wise | Ordered boosting, ordered target statistics |
| Tuning effort | Moderate | Higher | **Lowest** |
| Inference speed | Fast | Fast | **Fastest** (oblivious trees) |
| Pick it when | Default, mature, best-documented | Large data, need speed | Many categoricals, minimal tuning |

### 18.6 Gotchas that fail candidates

- **Not knowing XGBoost uses the second derivative.** This is *the* distinguishing feature.
- **Saying `min_child_weight` is a row count.** It's the sum of Hessians.
- **Setting `num_leaves` above `2^max_depth`** in LightGBM, so the depth limit does nothing.
- **Not knowing what makes LightGBM fast** (GOSS, EFB, histogram binning, leaf-wise growth).
- **Not knowing what CatBoost's ordered boosting solves** (prediction shift / target leakage).
- **Grid-searching `n_estimators`** rather than using early stopping.
- **Both setting `scale_pos_weight` and oversampling.**
- **Assuming boosted probabilities are calibrated.**
- **Reaching for a neural net on tabular data** without first establishing a GBDT baseline.

### 18.7 Hands-on drill

1. Compute the XGBoost gain formula by hand for a small toy split, with `λ = 1` and `γ = 0`. Then set
   `γ = 2` and confirm the split is rejected. This exercise makes `γ` and `λ` concrete.
2. Train XGBoost, LightGBM and CatBoost on the same tabular dataset with default parameters, then
   after tuning. Record accuracy and wall-clock training time for all six runs.
3. Insert missing values deliberately and confirm all three train without imputation. Compare their
   scores against an explicitly-imputed pipeline.
4. Take a dataset with several high-cardinality categorical columns. Compare one-hot + XGBoost,
   out-of-fold target encoding + XGBoost, LightGBM native categorical, and CatBoost defaults.
   CatBoost usually wins with the least effort — get that result in your own notebook.
5. Demonstrate LightGBM's leaf-wise overfitting: train with `num_leaves = 255` on a small dataset and
   watch the gap to validation open up. Then constrain `num_leaves` and `min_child_samples`.
6. Fit with `eval_set` and early stopping; plot the validation curve and note the selected iteration.
7. Plot a calibration curve for tuned XGBoost, then apply isotonic regression on a held-out set and
   re-plot.

### 18.8 2026 interview questions

**Q1 `[MATH]` — What does XGBoost add over standard gradient boosting?**

**Answer.** Four categories. **(1) A regularized objective.** Instead of fitting a tree to
pseudo-residuals and controlling complexity with external heuristics, XGBoost writes the objective as
loss plus `γT + ½λΣw_j²`, penalizing both the number of leaves and the magnitude of leaf weights, and
then solves for the optimal tree under *that* objective. **(2) A second-order approximation.** It Taylor-
expands the loss to second order using the gradient `gᵢ` and Hessian `hᵢ`, which makes the per-leaf
problem quadratic and therefore closed-form: the optimal leaf weight is `w_j* = −G_j/(H_j + λ)` and the
split gain is `½[G_L²/(H_L+λ) + G_R²/(H_R+λ) − (G_L+G_R)²/(H_L+H_R+λ)] − γ`. Using curvature rather
than just slope means better leaf values per iteration and faster convergence — it's Newton's method
in function space rather than plain gradient descent. Notice also that `γ` being subtracted from the
gain makes pre-pruning part of the split criterion itself, and that `min_child_weight` thresholds the
sum of Hessians, so leaf size is measured in confidence-weighted information rather than raw row
counts. **(3) Sparsity-aware split finding.** Missing values get a learned default direction per split,
chosen by trying both and keeping the higher gain — so missingness is handled from data, not imputed.
**(4) Systems engineering.** The weighted quantile sketch gives approximate split finding on data too
large to sort exhaustively; histogram binning, a compressed column-block layout, cache-aware access
patterns and out-of-core computation are what make it fast in practice.

*What's being tested:* Depth on the most important tabular algorithm. The second-order point is
essential; the `γ`/`min_child_weight` observations mark a top-band answer.

---

**Q2 `[MATH]` — Derive XGBoost's optimal leaf weight.**

**Answer.** After the second-order expansion, the objective for a single tree is
`Σᵢ[gᵢf(xᵢ) + ½hᵢf(xᵢ)²] + γT + ½λΣ_j w_j²`. Since `f` is constant `w_j` on each leaf, group the sum by
leaf: for leaf `j` with sample set `I_j`, its contribution is `G_j w_j + ½(H_j + λ)w_j²`, where
`G_j = Σ_{i∈I_j} gᵢ` and `H_j = Σ_{i∈I_j} hᵢ`. That's a one-dimensional quadratic in `w_j`, convex
because `H_j + λ > 0`. Differentiate and set to zero: `G_j + (H_j + λ)w_j = 0`, so
`w_j* = −G_j/(H_j + λ)`. Substituting back gives the leaf's optimal objective contribution
`−½G_j²/(H_j + λ)`, and summing over leaves gives `−½Σ_j G_j²/(H_j+λ) + γT`. The split gain is then just
the improvement in that quantity when a leaf is divided, minus `γ`. Two readings of the result: `λ`
shrinks the leaf weight, and does so hardest when `H_j` is small — i.e. for leaves with few or
low-confidence samples, which is exactly where you want shrinkage; and the term `G²/(H+λ)` is the
"similarity score" the popular explanations refer to.

*What's being tested:* Genuine mathematical fluency on the algorithm you claim to use daily. Very few
candidates can do this, which makes it a strong differentiator.

---

**Q3 `[THEORY]` — XGBoost vs LightGBM vs CatBoost. How do you choose?**

**Answer.** They share the gradient-boosting core and differ in growth strategy and engineering.
**XGBoost** grows level-wise (with histogram-based splitting now the default), is the most mature and
best-documented, and is a safe default. **LightGBM** grows **leaf-wise** — always splitting the leaf
with highest gain anywhere in the tree — which reaches lower loss for a given number of leaves but
produces deep unbalanced trees that overfit small datasets more readily; combined with **GOSS**
(subsampling small-gradient rows while keeping all large-gradient ones) and **EFB** (bundling
mutually-exclusive sparse features), it's typically the fastest on large data, and `num_leaves` rather
than `max_depth` is its main capacity knob. **CatBoost** uses **ordered boosting** and **ordered target
statistics** to eliminate the prediction shift and target-encoding leakage that affect standard
boosting, plus **oblivious (symmetric) trees** that act as a strong regularizer and make inference very
fast. Choosing: CatBoost when the data is categorical-heavy or high-cardinality, or when I have little
tuning time — its defaults are the strongest of the three; LightGBM when the dataset is large and
training speed matters; XGBoost as the well-understood default, especially where ecosystem maturity or
existing infrastructure matters. In practice I'd fit all three with defaults early — it costs minutes —
and tune whichever leads.

*What's being tested:* Whether you know the actual algorithmic differences rather than just brand
preferences. Naming GOSS, EFB, leaf-wise growth, ordered boosting and oblivious trees correctly is the
bar.

---

**Q4 `[THEORY]` — How does XGBoost handle missing values?**

**Answer.** It learns a **default direction per split**. When evaluating a candidate split, it computes
the gain with all missing-valued rows sent to the left child and again with them all sent to the right,
and stores whichever direction produced the higher gain as that split's default. At prediction time a
missing value follows the stored default. This is genuinely different from imputation: the handling is
learned from the data, it can differ across splits (so missingness can mean different things in
different regions of the feature space), and it implicitly exploits informative missingness — if a
value being absent is predictive, the learned direction captures that automatically. It's also
efficient, since the algorithm only iterates over non-missing values when enumerating split points,
which is why the technique is called sparsity-aware split finding. Caveat worth adding: this handles
missingness *for the model*, but it doesn't tell you *why* the values are missing, so I'd still
investigate the mechanism and consider adding explicit missing-indicator features if the pattern seems
meaningful.

*What's being tested:* A very common question with a specific answer. "It handles them automatically"
is not enough — the interviewer wants the learned-default-direction mechanism.

---

**Q5 `[APPLIED]` `[CODE]` — Walk me through tuning XGBoost on a new dataset.**

**Answer.** In a fixed order, cheapest-signal-first. **(0)** Establish a baseline and a validation
strategy first — stratified K-fold, or time-based if there's temporal structure — because tuning against
a leaky split is worse than not tuning. **(1)** Fit defaults with `learning_rate = 0.1`, a high
`n_estimators`, and **early stopping** on a validation set. That one run tells me the achievable
ballpark and how many trees the problem wants. **(2)** Tune capacity: `max_depth` (3–10) and
`min_child_weight` (1–20), which together control how specific each tree can get — the biggest lever
after the learning rate. **(3)** Tune sampling: `subsample` and `colsample_bytree` in 0.6–1.0, which
regularize and decorrelate. **(4)** Tune explicit regularization: `reg_lambda`, `gamma`, and
`reg_alpha` if I want sparser leaves. **(5)** For the final model, drop the learning rate to 0.01–0.03,
raise `n_estimators` correspondingly, and re-run early stopping. **(6)** If the target is imbalanced,
set `scale_pos_weight = n_neg/n_pos` and tune the decision threshold separately on validation. For the
search itself I'd use random search or a Bayesian optimizer (Optuna) rather than exhaustive grid
search, since the parameters interact and grid search wastes most of its budget. And I'd hold a final
untouched test set to measure once at the end, because tuning on the validation folds means the
validation score is optimistically biased.

*What's being tested:* Whether you have a real workflow rather than a reflexive `GridSearchCV`. Leading
with the validation strategy and early stopping — and ending with the untouched test set — are the
markers of experience.

---

**Q6 `[APPLIED]` `[TRAP]` — Would you use a neural network instead of XGBoost on tabular data in 2026?**

**Answer.** Usually not, and I'd want a specific reason to. On medium-to-large tabular data,
gradient-boosted trees remain the strongest default: axis-aligned splits match how tabular features
actually behave, they handle mixed types and missing values natively, they need no scaling, they train
in minutes, and they typically match or beat neural approaches while requiring far less tuning — a
finding that has held up across repeated benchmark studies. I'd consider a neural approach when: the
problem is genuinely **multimodal** (tabular plus text or images), where a network can learn a joint
representation end to end; there are **very high-cardinality categorical** features where learned
embeddings capture structure that encoding schemes lose; I want **transfer learning** from a
pretrained model; the target is **highly structured** (sequences, graphs); or I need a single
end-to-end differentiable system for a downstream task. It's also worth naming what's new: **tabular
foundation models** — in-context learners of the TabPFN family — became a credible option for small
tabular datasets, and using **LLM-derived embeddings of free-text columns as features inside a GBDT** is
now a standard and very effective hybrid. My practical position is that GBDTs are the baseline any
alternative must beat, and I'd require a measured win on a properly designed validation split before
choosing anything more complex.

*What's being tested:* Judgment plus currency. This is the archetypal 2026 question: they want to see
that you know the newer options *and* that you won't abandon a strong baseline for novelty. The
embeddings-as-features hybrid is the answer that shows you've actually thought about it.

---

# Part E — Unsupervised, Tuning & Interpretability

## Module 19 — Unsupervised Learning: Clustering & Dimensionality Reduction

| | |
|---|---|
| **Prerequisites** | Modules 01, 04, 13 |
| **Study time** | 8 h |
| **Why it's in the loop** | Segmentation case studies; PCA is asked constantly |
| **Rounds** | `[THEORY]` `[MATH]` `[APPLIED]` `[TRAP]` |

### 19.1 What to learn

**Clustering**
1. **K-Means**: the algorithm (assign, update, repeat), the objective (within-cluster sum of squares),
   and its convergence guarantee.
2. Why K-Means is non-convex and initialization-sensitive; **K-Means++**; `n_init`.
3. Choosing `k`: the **elbow method**, **silhouette score**, gap statistic, Davies–Bouldin, and the
   business answer.
4. K-Means assumptions: spherical, similarly-sized, similarly-dense clusters — and each failure mode.
5. **Hierarchical clustering**: agglomerative vs divisive, linkage criteria (single, complete,
   average, Ward), dendrograms.
6. **DBSCAN**: density-based clustering, `eps` and `min_samples`, core/border/noise points, and its
   ability to find arbitrary shapes and label outliers. HDBSCAN as the modern improvement.
7. **Gaussian Mixture Models** and the **EM algorithm**; soft vs hard assignment; K-Means as a limiting
   case of GMM.
8. Evaluating clustering with and without labels: silhouette, Calinski–Harabasz, adjusted Rand index,
   normalized mutual information.

**Dimensionality reduction**
9. **PCA**: the objective (maximum variance / minimum reconstruction error), the covariance
   eigendecomposition, and the SVD route.
10. Explained variance ratio and choosing the number of components.
11. Why PCA requires standardization, and why components are orthogonal.
12. PCA's limits: linear only, variance ≠ importance, components are hard to interpret.
13. **t-SNE** and **UMAP** — visualization tools, their non-determinism, and the crucial caveat that
    distances between clusters in the plot are not meaningful.
14. Autoencoders as non-linear dimensionality reduction; matrix factorization (NMF, SVD) for
    recommendation.
15. **Anomaly detection**: Isolation Forest, One-Class SVM, LOF, reconstruction error.
16. When unsupervised results should be treated as hypotheses rather than answers.

### 19.2 Core intuitions

**K-Means minimizes within-cluster sum of squares by alternating two steps.** Assign each point to its
nearest centroid; move each centroid to the mean of its assigned points; repeat. Each step
monotonically decreases the objective, so it always converges — but to a **local** optimum, since the
objective is non-convex in the assignments. That's why you run it multiple times from different
initializations (`n_init`) and keep the best, and why K-Means++ exists: it seeds centroids far apart
probabilistically, which reliably improves both the final objective and convergence speed.

**K-Means bakes in strong geometric assumptions.** Because it assigns by Euclidean distance to a
centroid, its implied cluster shape is a **sphere** (more precisely, the partition is a Voronoi
tessellation, so boundaries are linear). It also implicitly prefers clusters of similar size and
density, since a large cluster's centroid gets pulled toward wherever the mass is. So it fails on:
elongated or crescent-shaped clusters, clusters of very different sizes, clusters of different
densities, and any data with meaningful non-Euclidean structure. When you see those, reach for DBSCAN
(arbitrary shapes, density-based) or a GMM (elliptical clusters with per-component covariance).

**The elbow method is a heuristic, not an answer.** Plot within-cluster sum of squares against `k`; it
decreases monotonically, and you look for the bend where additional clusters stop paying. The problem
is that real data often has no clear bend, and the choice is subjective. Silhouette score is better —
it measures how much closer each point is to its own cluster than to the next nearest, on a −1 to +1
scale, and it has an actual maximum you can select. But the honest senior answer is that **`k` is
usually a business decision**: if the marketing team can run four campaigns, `k = 4` is the answer
regardless of what the elbow plot says, and your job is to check whether four clusters are stable and
interpretable.

**DBSCAN's real advantages are shape-freedom and explicit noise.** It grows clusters from dense
neighbourhoods: a point with at least `min_samples` neighbours within `eps` is a core point, points
reachable from core points join the cluster, and points in no dense region are labelled **noise**. So it
finds arbitrarily shaped clusters, does not need `k` specified in advance, and — uniquely among the
common methods — refuses to assign outliers, which is genuinely useful. The costs: it's very sensitive
to `eps`, it struggles when clusters have very different densities (one `eps` can't suit both), and it
degrades in high dimensions along with every other distance-based method. HDBSCAN removes most of the
`eps` sensitivity by building a cluster hierarchy across density levels, and is the better default in
2026.

**PCA finds orthogonal directions of maximum variance, and it's an eigenproblem.** Standardize the
data, compute the covariance matrix, and take its eigenvectors: those are the principal components, and
each eigenvalue is the variance captured along its component. Because the covariance matrix is
symmetric, the eigenvectors are orthogonal — that's *why* components are uncorrelated, and it's a better
answer than asserting it. Equivalently, PCA is the truncated SVD of the centred data matrix, which is
how it's actually computed for numerical stability and to handle `d > n`. And it has a dual
characterization worth knowing: the top-`k` components are simultaneously the directions of maximum
variance *and* the `k`-dimensional linear subspace minimizing reconstruction error.

**PCA needs standardization, and the reason is the same as always.** Covariance is scale-dependent, so
a feature measured in a large unit will have large variance and dominate the first component regardless
of its relevance. Standardize first (equivalently, use the correlation matrix instead of the covariance
matrix), unless all features genuinely share a unit and their relative variances are meaningful.

**Variance is not importance — the sharpest PCA caveat.** PCA is unsupervised, so it has no idea what
you're predicting. The direction of greatest variance can be the direction along which your classes are
completely mixed, while a low-variance direction carries all the discriminative signal. So PCA before a
supervised model can discard exactly the information you needed. Use it for decorrelation,
visualization, noise reduction and compression — and if you want a *supervised* projection, use LDA or
partial least squares instead, or just let a regularized model handle the dimensionality.

**t-SNE and UMAP plots must be read carefully.** They preserve local neighbourhood structure, so tight
groups in the plot really are similar points. But global geometry is not preserved: **the distances
*between* clusters are not meaningful**, cluster sizes in the plot don't reflect real cluster sizes, and
both methods are stochastic so different runs give different-looking pictures. They're also strongly
hyperparameter-dependent (t-SNE's `perplexity`, UMAP's `n_neighbors`/`min_dist`) and can manufacture
apparent clusters in random data at some settings. Use them for exploration and communication, never as
evidence, and never as a preprocessing step feeding a supervised model — UMAP is at least deterministic
enough with a fixed seed and has a `transform` for new data, which t-SNE fundamentally lacks.

### 19.3 Whiteboard formulas

```text
=== K-Means ===
objective (WCSS)   J = Σ_k Σ_{x∈C_k} ‖x - μ_k‖²
assign step        C_k = { x : k = argmin_j ‖x - μ_j‖ }
update step        μ_k = mean of points in C_k
converges to a LOCAL optimum; each step decreases J monotonically
cost               O(n·k·d·iters)

silhouette for point i:   s(i) = (b(i) - a(i)) / max(a(i), b(i))     ∈ [-1, 1]
   a(i) = mean distance to own-cluster points
   b(i) = mean distance to nearest other cluster

=== PCA ===
1. standardize X (zero mean, unit variance)
2. covariance     Σ = (1/(n-1)) XᵀX
3. eigendecompose Σ = VΛVᵀ        (V orthogonal since Σ symmetric)
4. components     columns of V, ordered by eigenvalue λᵢ
5. project        Z = X·V_k       (k largest components)
explained variance ratio for component i:  λᵢ / Σⱼλⱼ
equivalently: truncated SVD of centred X = UΣVᵀ  (preferred numerically)

=== GMM / EM ===
model      p(x) = Σ_k π_k · N(x | μ_k, Σ_k)
E-step     responsibilities γ_ik = π_k N(xᵢ|μ_k,Σ_k) / Σ_j π_j N(xᵢ|μ_j,Σ_j)
M-step     update π_k, μ_k, Σ_k as γ-weighted estimates
K-Means is the limit of GMM with shared spherical Σ = σ²I as σ² → 0, with hard assignment

=== DBSCAN ===
core point: ≥ min_samples points within eps
cluster: maximal set of density-connected points
noise: not reachable from any core point → labelled -1
```

### 19.4 Gotchas that fail candidates

- **Not scaling before K-Means or PCA.**
- **Saying K-Means always converges to the global optimum.** Local only; use `n_init` and K-Means++.
- **Presenting the elbow method as definitive.**
- **Claiming PCA components are interpretable features.** They're linear combinations of everything.
- **Saying PCA is a feature-selection method.** It's feature *extraction* — it builds new features from
  all the old ones, so you can't drop the original columns from your pipeline.
- **Reading cluster distances off a t-SNE plot.**
- **Using t-SNE as a preprocessing step** for a supervised model.
- **Presenting cluster labels as ground truth** rather than as hypotheses to validate.

### 19.5 Hands-on drill

1. Implement K-Means from scratch, including K-Means++ initialization. Run it 20 times on the same data
   from random inits and record the spread in final WCSS — that spread is your evidence for the
   local-optimum answer.
2. Generate three datasets: spherical blobs, two crescents, and clusters of very different densities.
   Run K-Means, DBSCAN and GMM on all three and plot the nine results. **This 3×3 grid is the single
   best preparation for "when does K-Means fail?"**
3. Produce elbow and silhouette plots for `k` from 2 to 15 on real data and note whether they agree.
4. Implement PCA from scratch via both eigendecomposition and SVD; verify they match `sklearn`.
5. Construct a labelled dataset where the top principal component is *not* the discriminative
   direction, then compare a classifier on PCA features vs LDA features. This is your evidence for the
   variance-isn't-importance answer.
6. Run t-SNE on the same data with `perplexity` 5, 30 and 100 and with different seeds. The visual
   instability is what you should describe when asked about it.

### 19.6 2026 interview questions

**Q1 `[THEORY]` — Explain K-Means and its assumptions.**

**Answer.** K-Means partitions data into `k` clusters minimizing within-cluster sum of squares. It
alternates two steps: assign each point to the nearest centroid, then move each centroid to the mean of
its assigned points. Both steps monotonically decrease the objective, so it always converges — but only
to a **local** optimum, since the objective is non-convex over assignments; hence multiple restarts
(`n_init`) and K-Means++ seeding, which spreads initial centroids probabilistically. Its assumptions
are strong and worth stating explicitly: clusters are roughly **spherical** (since assignment is by
Euclidean distance to a centre, the partition is a Voronoi tessellation with linear boundaries), of
roughly **similar size** and **similar density**, and the number of clusters `k` is known in advance. It
also requires **feature scaling**, is sensitive to outliers because centroids are means, and assumes
Euclidean distance is meaningful — which fails in high dimensions. When those assumptions don't hold —
elongated clusters, wildly different densities, unknown `k`, or outliers you want identified rather than
absorbed — DBSCAN/HDBSCAN or a Gaussian mixture model are better choices.

*What's being tested:* Whether you can enumerate assumptions and connect each to a failure mode. The
Voronoi/linear-boundary observation is a nice depth signal.

---

**Q2 `[APPLIED]` `[TRAP]` — How do you choose `k`?**

**Answer.** With a combination of statistical heuristics and, decisively, the business context. The
**elbow method** plots within-cluster sum of squares against `k` and looks for the bend where extra
clusters stop paying — but WCSS decreases monotonically, real data often has no clear bend, and the
reading is subjective. **Silhouette score** is better, since it measures how much closer points are to
their own cluster than the next nearest and has an actual maximum to select; **gap statistic** and
**Davies–Bouldin** are further options, and for a GMM you can use **BIC/AIC**, which properly penalize
model complexity. But the honest answer is that in most real projects `k` is a **business decision**: if
the marketing team can operate four distinct campaigns, `k = 4` is the answer regardless of the elbow
plot, and my job becomes verifying that four clusters are *stable* (consistent across resamples and
seeds) and *interpretable* (each has a describable profile a stakeholder can act on). I'd also check
whether cluster membership actually predicts anything downstream, since a segmentation nobody can act
on is worthless no matter how good its silhouette score.

*What's being tested:* Whether you'll hide behind a metric or acknowledge that unsupervised problems
are underdetermined. The stability-and-interpretability check is the senior move.

---

**Q3 `[MATH]` — Explain PCA. Why are the components orthogonal?**

**Answer.** PCA finds a new orthogonal basis ordered by how much variance each direction captures.
Procedure: standardize the features, compute the covariance matrix `Σ = XᵀX/(n−1)`, and eigendecompose
it — the eigenvectors are the principal components and each eigenvalue is the variance along its
component, so ordering by eigenvalue gives the components by importance. Projecting onto the top `k`
gives a `k`-dimensional representation. The components are orthogonal because **the covariance matrix is
real and symmetric, and the spectral theorem guarantees a symmetric matrix has an orthogonal
eigenbasis** — so orthogonality is a mathematical consequence, not an imposed constraint, and it's why
the resulting features are uncorrelated. In practice PCA is computed via the SVD of the centred data
matrix rather than by forming `Σ` explicitly, which is more numerically stable and handles `d > n`. It
also has a dual characterization: the top-`k` components are simultaneously the directions of maximum
variance and the `k`-dimensional subspace minimizing reconstruction error.

*What's being tested:* Whether you know the linear algebra. Citing the spectral theorem for
orthogonality, and knowing the SVD route, are the two markers of a strong answer.

*Follow-up:* "How many components do you keep?" — Depends on the goal: enough to reach a target
cumulative explained variance (90–95% is conventional) for compression; two or three for visualization;
or, if PCA is feeding a supervised model, treat the component count as a hyperparameter and
cross-validate it against downstream performance rather than against explained variance.

---

**Q4 `[THEORY]` `[TRAP]` — Should you always apply PCA before modelling?**

**Answer.** No, and it's often actively harmful. PCA is **unsupervised**, so it selects directions by
variance with no knowledge of your target — and variance is not importance. The highest-variance
direction can be one along which your classes are perfectly mixed, while a low-variance direction
carries all the discriminative signal, so PCA can discard exactly what you needed. Other costs: the
components are linear combinations of every original feature, so you lose interpretability and can't
drop any source column from your production pipeline; it assumes linear structure, so non-linear
manifolds are poorly captured; it requires standardization; and for tree ensembles it's usually
counterproductive, since trees handle irrelevant features well and PCA's rotated axes destroy the
axis-aligned structure that makes splits effective. PCA earns its place when you need visualization,
when features are severely collinear and you're using a linear model, when you need compression for
memory or latency, for noise reduction by discarding low-variance components, or when `d ≫ n`. If what
you want is a *supervised* projection, use LDA or partial least squares instead.

*What's being tested:* Resistance to applying a standard step reflexively. The "variance is not
importance" point and the "bad for trees" point are the two that land.

---

**Q5 `[THEORY]` — K-Means vs DBSCAN vs GMM. When would you use each?**

**Answer.** **K-Means** when clusters are roughly spherical and similarly sized, `k` is known or
business-determined, and you need speed — it's `O(nkd)` per iteration and scales to very large data.
**DBSCAN** (or preferably **HDBSCAN**) when clusters have arbitrary shapes, you don't know `k`, and you
want outliers explicitly identified rather than forced into a cluster — it finds density-connected
regions and labels the rest as noise, which is uniquely useful for anomaly-adjacent problems. Its
weaknesses are sensitivity to `eps` and trouble with clusters of differing densities, which is exactly
what HDBSCAN improves by working across density levels. **GMM** when clusters are elliptical rather than
spherical, or when you want **soft assignments** — a probability of belonging to each cluster rather
than a hard label, which is valuable when membership is genuinely ambiguous; fitted by EM, it also gives
you a generative model you can sample from and score new points under, and BIC/AIC give a principled way
to choose the number of components. A useful connection: K-Means is the limiting case of a GMM with
shared spherical covariance as the variance goes to zero and assignments become hard — so GMM is the
strictly more general model, at the cost of more parameters and more data needed to fit them.

*What's being tested:* Whether you can map data geometry to algorithm choice, and whether you see the
K-Means/GMM relationship. Naming HDBSCAN shows currency.

---

**Q6 `[THEORY]` `[TRAP]` — Your t-SNE plot shows two clusters far apart. What can you conclude?**

**Answer.** Very little from the distance. t-SNE optimizes preservation of **local** neighbourhood
structure and explicitly does not preserve global geometry, so the distance *between* clusters in the
plot is not meaningful — two clusters appearing far apart may be adjacent in the original space, and
vice versa. Nor are the apparent cluster sizes meaningful, since t-SNE expands dense regions and
contracts sparse ones. Additional caveats: it's stochastic, so different seeds give visibly different
plots; it's very sensitive to `perplexity`, and at some settings it will manufacture apparent clusters
in pure random data; and it has no `transform` method for new points, since it optimizes an embedding of
the specific input set rather than learning a mapping. What I *can* conclude is that the points within
each apparent group have similar local neighbourhoods, which is a hypothesis worth testing. To validate
it I'd check whether the groups differ on interpretable features, run a proper clustering algorithm in
the original space, and confirm stability across seeds and hyperparameters. If I needed a projection
that preserved more global structure and could transform new data, I'd use **UMAP** — though it shares
the "don't over-read the geometry" caveat.

*What's being tested:* Whether you over-interpret visualizations. This is a deliberate trap and one of
the most common misuses in real data-science work.

---

## Module 20 — Hyperparameter Tuning & Model Selection

| | |
|---|---|
| **Prerequisites** | Modules 05, 18 |
| **Study time** | 6 h |
| **Why it's in the loop** | Every applied round; and the "tuning overfits too" insight is prized |
| **Rounds** | `[THEORY]` `[APPLIED]` `[CODE]` `[TRAP]` |

### 20.1 What to learn

1. Parameters vs hyperparameters — the distinction, precisely.
2. **Grid search**: exhaustive, exponential in dimensions, wasteful.
3. **Random search**: why it beats grid search in high dimensions (the Bergstra–Bengio result).
4. **Bayesian optimization**: surrogate models, acquisition functions (expected improvement), TPE;
   Optuna and Hyperopt.
5. **Successive halving** and **Hyperband** — bandit-based early elimination of bad configurations.
6. **Early stopping** as tuning, especially for `n_estimators`.
7. Search spaces: log-uniform for scale parameters, and why that matters.
8. **Nested CV** and the optimism of a tuned-CV score.
9. **Multiple-comparisons overfitting** in model selection: the more configurations you try, the more
   your best CV score is luck.
10. Compute budgeting: tuning the parameters that matter, in the right order.
11. Model selection beyond hyperparameters: comparing families, ensembling, stacking, blending.
12. Reproducibility: seeds, logged trials, experiment tracking (MLflow, Weights & Biases).
13. What *not* to tune, and why feature engineering usually beats tuning.

### 20.2 Core intuitions

**Random search beats grid search because most hyperparameters don't matter.** With `d` hyperparameters
and `m` values each, a grid needs `m^d` fits, and it spends its budget evaluating every value of the
irrelevant parameters. Random search with the same budget samples `N` distinct values for *every*
parameter, so it explores the few important dimensions far more finely. Bergstra and Bengio's result is
the standard citation: for the same compute, random search finds better configurations, and the gap
widens with dimensionality. There's also a neat probabilistic framing: to land in the top 5% of the
search space with 95% confidence you need about 60 random draws — independent of dimension.

**Bayesian optimization uses the results so far to decide where to look next.** It fits a cheap
surrogate model (Gaussian process, or a tree-structured density estimator in TPE) mapping
hyperparameters to validation score, then maximizes an acquisition function like expected improvement
to pick the next configuration — balancing exploiting promising regions against exploring uncertain
ones. It's more sample-efficient than random search, which matters when each fit costs hours, and it's
what Optuna does by default. The caveats: it's sequential by nature so parallelizes less cleanly, it
adds its own hyperparameters, and with cheap models the overhead may exceed the savings.

**Successive halving is the highest-leverage trick people don't use.** Train many configurations with a
small budget (few trees, few epochs, a data subsample), discard the worst half, double the budget for
the survivors, and repeat. Bad configurations are usually identifiable early, so you avoid spending
full budget on them. Hyperband runs successive halving at several aggressiveness levels to hedge
against configurations that start slowly but finish well. `sklearn` has
`HalvingGridSearchCV`/`HalvingRandomSearchCV`.

**Tuning overfits the validation set, and this is the insight interviewers reward.** If you evaluate
500 configurations by cross-validation and keep the best, that best score is partly genuine quality and
partly luck — you took a maximum over 500 noisy estimates, and the maximum of noisy estimates is biased
upward. This is a multiple-comparisons problem. Consequences: the winning configuration's CV score is
optimistically biased and must not be reported as an unbiased estimate; you need a final untouched test
set, or nested CV, to get an honest number; and the more configurations you try, the worse the bias, so
huge searches on small data can actively harm you by selecting a configuration that happened to suit
your folds.

**Search log-uniformly over scale parameters.** Learning rates, regularization strengths and `C` span
orders of magnitude, and the interesting variation is multiplicative. Sampling `learning_rate` uniformly
in [0.001, 0.3] puts almost all draws above 0.05; sampling log-uniformly gives even coverage across
each decade. Same for `alpha`, `C`, `gamma`, `reg_lambda`.

**Feature engineering usually beats tuning, and saying so is a strong signal.** Going from default to
optimally-tuned XGBoost typically buys a few percent. One well-constructed feature that encodes real
domain structure can buy far more. If you have limited time, spend it on the data. The corollary: when
asked "your model isn't good enough, what do you do?", tuning should not be your first answer.

### 20.3 Method comparison

| Method | Best for | Cost | Parallel? | Notes |
|---|---|---|---|---|
| Grid search | ≤ 2–3 params, small discrete sets | `m^d` fits | Yes | Wasteful beyond 3 params |
| Random search | The general default | `N` fits | Yes | Beats grid at equal budget |
| Bayesian (Optuna/TPE) | Expensive fits, many params | `N` fits, smarter | Partly | Most sample-efficient |
| Successive halving | Many configs, cheap early signal | Much less | Yes | Great with random search |
| Hyperband | As above, hedged | Much less | Yes | Robust to slow starters |
| Early stopping | `n_estimators`, epochs | ~free | — | Always use for boosting/NNs |

### 20.4 Gotchas that fail candidates

- **Grid-searching six hyperparameters.** Combinatorially hopeless.
- **Sampling learning rates uniformly** instead of log-uniformly.
- **Reporting the tuned CV score as the final unbiased estimate.**
- **Tuning on the test set.**
- **Not using early stopping for `n_estimators`.**
- **Tuning before fixing the validation strategy.** Tuning against a leaky split optimizes for the leak.
- **Answering "tune hyperparameters" to "how do you improve the model?"** without mentioning data,
  features or the target definition.

### 20.5 Hands-on drill

1. On the same dataset and equal compute budget, run grid search, random search and Optuna over five
   XGBoost hyperparameters. Compare best score and wall-clock. Record the result.
2. Run `HalvingRandomSearchCV` and compare its cost against plain random search at comparable quality.
3. Deliberately over-tune: evaluate 500 configurations on a small dataset, note the best CV score, then
   measure on a held-out test set. **Quantify the optimism gap.** That number is your evidence for the
   tuning-overfits question.
4. Implement nested CV and compare its estimate against the tuned-CV estimate.
5. Take your best tuned model and then add two well-considered engineered features to the *untuned*
   model. Compare the gains from tuning versus from features.

### 20.6 2026 interview questions

**Q1 `[THEORY]` `[TRAP]` — Why is random search usually better than grid search?**

**Answer.** Because hyperparameter importance is highly uneven, and grid search wastes budget on the
unimportant ones. With `d` hyperparameters and `m` values each, a grid requires `m^d` fits, and it
evaluates every combination of values for parameters that barely affect performance — so if only two of
six parameters matter, most of your compute produces near-identical results. Random search with the same
number of fits samples `N` *distinct* values for every parameter, so it explores the important
dimensions much more finely; this is the Bergstra–Bengio result, and the advantage grows with
dimensionality. There's also a clean probabilistic argument: to land within the top 5% of the search
space with 95% confidence requires roughly 60 random samples, **independent of the number of
dimensions**. Practical additions: random search handles continuous parameters naturally rather than
forcing you to discretize, and it can be stopped at any point with a valid result, whereas a partially
completed grid is systematically biased toward whichever corner it started in. Grid search remains
reasonable for two or three genuinely discrete parameters with few levels.

*What's being tested:* Whether you know the standard result and can explain the mechanism. The "60
samples for top 5%" figure is memorable and lands well.

---

**Q2 `[THEORY]` — What is Bayesian optimization and when is it worth it?**

**Answer.** It builds a probabilistic surrogate model of the objective — a Gaussian process, or a
tree-structured Parzen estimator in TPE — mapping hyperparameter configurations to validation score,
then chooses the next configuration by maximizing an acquisition function such as expected improvement,
which trades off exploiting regions the surrogate predicts are good against exploring regions where it's
uncertain. Each evaluation updates the surrogate, so the search gets progressively better informed —
unlike random search, which never learns from its own results. It's worth it when each fit is expensive
(hours of training, large data, deep models) so that sample efficiency dominates, and when the search
space is moderately high-dimensional. It's *not* worth it when fits are cheap, since the surrogate's
overhead and the sequential dependency can cost more than they save, or when you have massive
parallelism available, since random search parallelizes perfectly while Bayesian optimization is
inherently sequential (though asynchronous variants exist). In practice I'd use Optuna, which defaults to
TPE and combines it with pruning — an implementation of successive halving that kills unpromising trials
early, which is often a bigger win than the surrogate itself.

*What's being tested:* Whether you understand the mechanism and, more importantly, when *not* to use it.
The Optuna pruning point is a practical detail that shows real usage.

---

**Q3 `[THEORY]` `[TRAP]` — Can hyperparameter tuning overfit?**

**Answer.** Yes, and it's a genuine and underappreciated problem. If you evaluate 500 configurations by
cross-validation and select the best, that best score is partly real quality and partly the luck of
which configuration happened to suit your particular folds — you've taken a maximum over 500 noisy
estimates, and the maximum of noisy estimates is systematically biased upward. It's a multiple-
comparisons problem, and the bias grows with the number of configurations tried and shrinks with dataset
size. Three consequences: the winning configuration's CV score must never be reported as an unbiased
performance estimate; you need either a final untouched test set or **nested cross-validation** to get an
honest number; and on small datasets a very large search can actively hurt you, since it will find a
configuration tuned to fold-level noise that doesn't generalize. Mitigations: prefer smaller search
spaces informed by domain knowledge, use repeated CV to reduce estimate variance so the selection is
less noise-driven, prefer simpler configurations when scores are within noise of each other (the
one-standard-error rule), and always keep a final holdout you look at exactly once.

*What's being tested:* Whether you understand that model *selection* is itself a fitting procedure. This
is a strong mid-to-senior differentiator and connects directly back to Module 05's nested-CV question.

---

**Q4 `[APPLIED]` — You have 4 hours of compute. How do you spend it to improve a model?**

**Answer.** Mostly not on hyperparameter tuning, and I'd say so explicitly. Rough allocation: **first
30 minutes verifying the evaluation** — is the split leaking, is it time- or group-aware, is the metric
the right one? Everything downstream is worthless if this is wrong, and a leak found here is worth more
than any tuning. **Next 2 hours on data and features** — investigate the largest errors to see what the
model is systematically missing, add features encoding real domain structure, fix data-quality problems,
reconsider the target definition. This has by far the highest expected return; one good feature usually
beats a full tuning sweep. **Then 1 hour on model and tuning** — try two or three model families with
defaults, then a random or Optuna search with successive halving over the parameters that matter most
(learning rate, capacity, sampling), with early stopping handling `n_estimators` for free. **Final 30
minutes on the decision layer** — threshold selection from business cost and calibration, which is often
the single cheapest large improvement in realized business value and is frequently ignored entirely. If
the model is still short after that, the honest conclusion is usually that I need better data or a
different target definition, not more compute.

*What's being tested:* Prioritization. Candidates who spend the whole budget on `GridSearchCV` fail this.
Leading with evaluation and ending with the threshold layer are both strong signals.

---

## Module 21 — Interpretability & Explainability

| | |
|---|---|
| **Prerequisites** | Modules 06, 07, 16, 18 |
| **Study time** | 6 h |
| **Why it's in the loop** | Rising sharply — regulated domains and the EU AI Act make it standard |
| **Rounds** | `[THEORY]` `[APPLIED]` `[TRAP]` |

### 21.1 What to learn

1. Interpretability vs explainability; global vs local explanations; intrinsic vs post-hoc.
2. Intrinsically interpretable models: linear/logistic coefficients, shallow trees, rule lists, GAMs
   and EBMs.
3. **Permutation importance** — the mechanism, and its correlated-feature caveat.
4. **SHAP**: Shapley values from cooperative game theory, the additivity property, TreeSHAP, and the
   standard plots (summary/beeswarm, waterfall, dependence, force).
5. **LIME**: local surrogate models, and why it's less stable than SHAP.
6. **Partial dependence plots** and **ICE plots**; how PDPs mislead under feature correlation and
   interactions.
7. Global surrogate models.
8. Counterfactual and contrastive explanations ("what would need to change?"), and why they're often
   the most actionable.
9. **Correlation vs causation in explanations** — the single most important caveat.
10. Monotonic constraints as a way to buy interpretability structurally.
11. Fairness and bias: group fairness definitions (demographic parity, equal opportunity, equalized
    odds), their mathematical incompatibility, and disparate-impact auditing.
12. Documentation practice: model cards, datasheets, and what regulated deployment requires.
13. The accuracy–interpretability tradeoff, and why it's smaller than people assume.

### 21.2 Core intuitions

**Distinguish global from local.** Global explanations describe the model's overall behaviour ("income
is the strongest driver, and risk rises monotonically as it falls"). Local explanations describe one
prediction ("this application was declined mainly because of a 14-month credit history and three recent
enquiries"). Regulated decisions usually require *local* explanations, because the affected individual
is entitled to know why *their* case was decided that way. Feature importance is global; SHAP gives
both.

**SHAP computes each feature's fair share of the prediction.** Shapley values come from cooperative game
theory: they allocate a payout among players by averaging each player's marginal contribution across
all possible orderings in which players could join the coalition. Applied to ML, the "payout" is the
difference between this prediction and the average prediction, and the "players" are the features. This
gives SHAP its key **additivity** property: the SHAP values for one prediction sum exactly to
`prediction − baseline`, so the explanation is complete and consistent — no contribution is unaccounted
for. Exact computation is exponential in features, but **TreeSHAP** computes it in polynomial time for
tree ensembles, which is why SHAP is practical for exactly the models (XGBoost, LightGBM, Random
Forest) that most need explaining.

**Permutation importance measures what the model *uses to generalize*.** Shuffle one feature's values in
a held-out set, breaking its relationship with the target, and measure the drop in performance. A large
drop means the model relied on it. Its advantages over impurity-based importance: it's model-agnostic,
it's computed on held-out data so it reflects generalization rather than fit, and it has no
high-cardinality bias. Its main caveat is shared with most methods: with two correlated features,
shuffling one leaves the other available as a substitute, so both look unimportant even though the
information is critical.

**PDPs show the average marginal effect, and average is the operative word.** A partial dependence plot
varies one feature across its range while marginalizing the others, showing the average predicted
response. Two ways it misleads: if the feature is correlated with others, the plot evaluates the model
at combinations that never occur in real data, so the curve is partly fiction; and if the feature's
effect is heterogeneous — increasing for one subgroup, decreasing for another — the average can be flat
and hide both. **ICE plots** solve the second problem by drawing one line per instance instead of the
average, and disagreeing line shapes are a direct visual signal of interaction.

**The most important caveat: explanations are about the model, not the world.** SHAP tells you what
drove *the model's* prediction. It does not tell you what causes the outcome. If ZIP code is highly
predictive of default, SHAP will show ZIP code as important — but ZIP code doesn't cause default, it
proxies for unmeasured socioeconomic factors (and possibly encodes protected characteristics). Acting
on an explanation as if it were causal is how organizations make expensive mistakes: "SHAP says support
calls predict churn, so let's reduce support calls" inverts the causality entirely. State this
limitation whenever you present an explanation — it's a strong signal of maturity, and it's the answer
interviewers most often reward in this module.

**Group fairness definitions are mathematically incompatible, and that's a theorem not an
inconvenience.** Demographic parity requires equal positive-prediction rates across groups; equal
opportunity requires equal true-positive rates; predictive parity requires equal precision. Except in
degenerate cases (equal base rates or a perfect classifier) you cannot satisfy all of them at once —
this is the impossibility result from the COMPAS debate. So "make the model fair" is not a well-posed
technical request; the correct response is to ask which fairness criterion the context requires and to
be explicit about what is being traded away. Being able to say this crisply is increasingly expected in
2026 loops, particularly for regulated domains.

**Monotonic constraints buy interpretability structurally.** XGBoost, LightGBM and CatBoost all let you
constrain a feature's effect to be monotonically increasing or decreasing. That encodes domain knowledge
("higher income must never increase predicted risk"), makes the model's behaviour defensible to a
regulator, often costs little accuracy, and can even improve generalization by ruling out
noise-driven non-monotonicity. It's an underused technique and naming it is a good differentiator.

### 21.3 Method comparison

| Method | Scope | Model-agnostic? | Cost | Main caveat |
|---|---|---|---|---|
| Linear coefficients | Global | No (linear only) | Free | Only for linear models; scale-dependent |
| Impurity importance (MDI) | Global | No (trees) | Free | High-cardinality bias; training-data based |
| Permutation importance | Global | **Yes** | Moderate | Correlated features mask each other |
| **SHAP** | **Global + local** | **Yes** (fast for trees) | Moderate (TreeSHAP) | Not causal; correlation issues |
| LIME | Local | Yes | Low per instance | Unstable; sampling-dependent |
| PDP | Global | Yes | Moderate | Unrealistic combinations; hides heterogeneity |
| ICE | Local + global | Yes | Moderate | Cluttered with many instances |
| Counterfactuals | Local | Yes | Varies | Must respect feasibility of changes |
| Monotonic constraints | Structural | No (trees/GAMs) | Free | Requires domain knowledge |

### 21.4 Gotchas that fail candidates

- **Treating feature importance or SHAP as causal.** The defining error of this module.
- **Using `feature_importances_` without mentioning its biases.**
- **Not distinguishing global from local** when the question implies a regulated individual decision.
- **Saying SHAP is "just feature importance."** It's per-prediction, signed, and additive.
- **Reading a flat PDP as "no effect"** when heterogeneous effects may be cancelling.
- **Claiming a model can satisfy all fairness definitions.**
- **Claiming interpretable models are always much less accurate.** On tabular data, GAMs/EBMs and
  well-featured logistic regression are often close.

### 21.5 Hands-on drill

1. Train XGBoost on a tabular dataset. Produce MDI importance, permutation importance and SHAP summary
   plots. Compare the rankings and explain every disagreement you find.
2. Add a random high-cardinality ID column and re-run all three. MDI will rank it high; the others
   won't. **This is your evidence for the feature-importance question.**
3. Generate SHAP waterfall plots for three individual predictions — one confident positive, one
   confident negative, one borderline — and write the one-paragraph explanation you'd give a customer.
4. Produce a PDP and the corresponding ICE plot for a feature with a known interaction. Observe how the
   PDP flattens what the ICE plot reveals.
5. Duplicate an important feature (perfect correlation) and re-run permutation importance. Watch both
   copies drop to near zero. That result is the correlated-feature caveat made concrete.
6. Fit the same model with and without a monotonic constraint on one feature; compare accuracy and plot
   both response curves.

### 21.6 2026 interview questions

**Q1 `[THEORY]` — What is SHAP and why is it preferred over plain feature importance?**

**Answer.** SHAP assigns each feature a contribution to an individual prediction, based on Shapley values
from cooperative game theory: a feature's value is its average marginal contribution to the prediction
across all possible orderings in which features could be added. Three properties make it valuable.
**Additivity/local accuracy** — for any single prediction the SHAP values sum exactly to
`prediction − baseline`, so the explanation is complete with nothing unattributed. **Locality** — it
explains each prediction individually, whereas conventional feature importance gives one global number;
this matters enormously for regulated decisions, where the affected individual needs to know why *their*
case went that way. **Consistency** — it satisfies formal axioms (a feature that always contributes more
never receives a lower attribution), unlike impurity-based importance, which is biased toward
high-cardinality features and computed on training data. And SHAP values are *signed*, so you see
direction as well as magnitude, and they aggregate upward into a global importance ranking, giving you
both views from one computation. Exact Shapley computation is exponential, but **TreeSHAP** makes it
polynomial for tree ensembles, which is why it's practical for XGBoost and LightGBM. The caveat I'd
always state: SHAP explains the **model**, not the world — the attributions are not causal effects.

*What's being tested:* Whether you know the theory behind SHAP and its limits. Additivity, locality and
the non-causality caveat are the three things to land.

---

**Q2 `[APPLIED]` `[TRAP]` — Your SHAP analysis shows number of support calls is the top driver of churn.
The business wants to cut support calls. What do you say?**

**Answer.** I'd stop that decision, because it inverts the causality. SHAP tells me the model *uses*
support-call count to predict churn — it does not tell me support calls *cause* churn. The far more
plausible causal story is that customers who are already having problems both call support and churn, so
call volume is a **symptom and a leading indicator**, not a cause. Reducing calls by making support
harder to reach would remove the signal while leaving the underlying dissatisfaction untouched, and
would very likely increase churn. What I'd propose instead: treat the feature as an early-warning
trigger rather than a lever — route high-call-volume customers to proactive retention outreach; dig into
*what* the calls are about, since the root cause is what's actionable; and if the business wants a
causal estimate of an intervention, run an **experiment** (randomize the retention treatment among
flagged customers), because that's the only way to establish causality. I'd also check whether the
feature is available at prediction time in production or whether it's partly post-hoc, since a symptom
this strong is worth checking for leakage.

*What's being tested:* The most important judgment call in this module. Interviewers use this scenario
specifically to see whether you'll let a stakeholder act on a correlation. Proposing an experiment is
the answer that closes it.

---

**Q3 `[THEORY]` — Permutation importance vs impurity-based importance.**

**Answer.** **Impurity-based (MDI)** — `sklearn`'s `feature_importances_` — sums each feature's total
impurity reduction across all splits, averaged over trees. It's free, since it's a by-product of
training, but it has three biases: it favours **high-cardinality and continuous** features because more
candidate split points give more opportunities to reduce impurity (a random unique-ID column can rank
top); it's computed on **training data**, so it reflects what the model fitted, including noise, rather
than what generalizes; and with correlated features it splits credit arbitrarily among them.
**Permutation importance** shuffles one feature's values in a held-out set and measures the resulting
drop in performance. It's model-agnostic, computed on held-out data so it measures contribution to
*generalization*, and has no cardinality bias — at the cost of requiring one re-scoring pass per feature
(per repeat). Its own caveat is the correlated-feature problem in a different form: if two features are
correlated, shuffling one leaves the other as a substitute, so both appear unimportant even though the
information is essential. Practical guidance: never rely on MDI alone; use permutation importance on
validation data for a trustworthy global ranking, and SHAP when you need per-prediction explanations or
direction of effect.

*What's being tested:* Whether you know the default is untrustworthy and why. The three specific MDI
biases are the substance of the answer.

---

**Q4 `[APPLIED]` — You're deploying a credit model. What does interpretability require of you?**

**Answer.** Several distinct things, and I'd separate them. **Local explanations per decision** — a
declined applicant is typically entitled to the principal reasons for the decision, which means
per-prediction attributions (SHAP or a reason-code mapping), not a global importance chart. **Structural
defensibility** — I'd use monotonic constraints so that, for example, higher income can never increase
predicted risk; a regulator will ask about non-monotonic behaviour, and constraints make the answer
trivial while usually costing little accuracy. **Model choice** — a well-featured logistic regression or
a GAM/EBM may be the right final model even at a small accuracy cost, because odds ratios are the
accepted currency in credit and the model is auditable end to end; a common pattern is to use boosting
to discover which features matter and then ship a constrained interpretable model. **Fairness auditing**
— test for disparate impact across protected groups, decide explicitly which fairness criterion applies
(they're mutually incompatible), and check for proxy variables such as ZIP code that encode protected
characteristics indirectly. **Documentation** — a model card covering intended use, training data,
performance by segment, known limitations and monitoring plan; with the EU AI Act's high-risk
obligations phasing in through 2026, credit scoring sits squarely in scope, so documentation, human
oversight and record-keeping are compliance requirements rather than good practice. **Monitoring** —
track score distribution, feature drift and outcome rates by segment, with alerting.

*What's being tested:* Whether you understand that regulated deployment is a different engineering
problem. Distinguishing local from global, and naming monotonic constraints and the fairness
incompatibility, are the differentiators.

---

**Q5 `[THEORY]` `[TRAP]` — Can a model be fair on all definitions simultaneously?**

**Answer.** No, and this is a proven impossibility rather than an engineering shortfall. The common
group-fairness criteria are mutually incompatible except in degenerate cases. **Demographic parity**
requires equal positive-prediction rates across groups. **Equal opportunity** requires equal
true-positive rates. **Predictive parity** requires equal precision. If the groups have different base
rates, you cannot satisfy calibration/predictive parity and equalized error rates at the same time —
this is the impossibility result that emerged from the COMPAS recidivism debate. The practical
consequence is that "make the model fair" is not a well-posed technical request. The correct response is
to ask which criterion the context and regulation require, implement that one, measure and report the
others so the tradeoff is visible rather than hidden, and document the choice and its rationale.
Beyond the group definitions, I'd also raise that fairness isn't only a metric question: it depends on
whether the historical labels themselves encode past discrimination, whether the protected attribute is
being proxied by something like ZIP code, and whether the decision process around the model provides
recourse — and none of those are fixed by choosing a different fairness metric.

*What's being tested:* Whether you know this is an impossibility theorem, and whether you can reframe an
ill-posed request. Both are strong senior signals, and this question has become considerably more common
as regulation has tightened.

---

# Part F — Production & Beyond

## Module 22 — ML System Design, Deployment, Drift & Monitoring

| | |
|---|---|
| **Prerequisites** | Modules 04, 05, 10, 18 |
| **Study time** | 10 h |
| **Why it's in the loop** | A dedicated round for ML Engineer roles; assumed knowledge for all others |
| **Rounds** | `[DESIGN]` `[APPLIED]` `[DEBUG]` |

### 22.1 What to learn

**Framing**
1. The ML system design interview format and a reusable answer framework.
2. Translating a business goal into an ML problem: target definition, unit of prediction, and the
   decision the output drives.
3. Choosing online vs batch inference, and the latency/cost/freshness triangle.
4. Baselines and the "do we need ML at all?" question.

**Data & training**
5. Training data pipelines; label collection and label delay; feedback loops.
6. **Feature stores** and the training/serving consistency problem.
7. **Training/serving skew** — its causes and how to detect it.
8. Retraining cadence: scheduled, triggered by drift, or continuous.
9. Reproducibility: data versioning, model registry, experiment tracking, lineage.

**Serving**
10. Deployment patterns: batch scoring, real-time REST/gRPC service, streaming, edge/on-device.
11. Latency budgets, throughput, caching, batching, quantization, model distillation.
12. Shadow deployment, canary release, blue/green, and **A/B testing** the model.
13. Rollback plans and the kill switch.

**Operations**
14. **Data drift** (covariate shift), **concept drift**, **label shift**, and how to detect each (PSI,
    KL divergence, KS test, population stability, monitoring feature distributions).
15. What to monitor: input distributions, prediction distributions, latency/errors, business KPIs, and
    delayed ground-truth metrics.
16. Alerting thresholds and the false-alarm problem.
17. Model degradation and the feedback-loop pathology (the model's own decisions change the data).
18. Cost management: training cost, inference cost, and cost per prediction.
19. Documentation, on-call, incident response for ML.

### 22.2 Core intuitions

**A reusable framework for any ML design question.** Say the framework out loud at the start; it buys
you structure and signals experience.

```text
1. CLARIFY      business goal, success metric, scale, latency budget, constraints
2. FRAME        ML problem type, unit of prediction, target definition, what decision it drives
3. BASELINE     non-ML baseline first — a rule, a heuristic, the current process
4. DATA         sources, volume, labels and their delay, quality risks, leakage audit
5. FEATURES     what's available AT PREDICTION TIME; feature store; freshness
6. MODEL        start simple; candidate families; why
7. EVALUATE     offline metric aligned to business cost; split design; online metric
8. SERVE        batch vs real-time; latency; scaling; caching
9. MONITOR      drift, performance, business KPI; alerting; retraining trigger
10. ITERATE     A/B test, rollback plan, what you'd do next
```

**The most common real failure is training/serving skew, not model quality.** Skew arises when the
features computed at training time differ from those computed at serving time — different code paths,
different default values, different units, different timezone handling, a category vocabulary that has
since grown, or an aggregation computed over a different window. The model isn't wrong; it's being fed
different data than it was trained on. This is precisely the problem a **feature store** exists to
solve: define each feature once, compute it through one code path, and serve it to both training and
inference. Absent a feature store, the discipline is to serialize preprocessing inside the model
pipeline and to log serving-time feature values so you can compare their distributions against training.

**Distinguish the three kinds of drift, because they need different responses.** **Data/covariate drift**
is a change in `P(x)` — your input distribution moved (new user demographics, a new device type, a
seasonal shift) while the underlying relationship holds. **Concept drift** is a change in `P(y|x)` — the
relationship itself changed (fraudsters adapted, consumer behaviour shifted after a price change), which
is the more dangerous kind because the model is now learning the wrong function. **Label shift** is a
change in `P(y)` — the base rate moved, which breaks your calibration and your chosen threshold even if
everything else holds. Detection differs: covariate drift is detectable immediately from inputs alone
(PSI, KS test, KL divergence per feature); concept drift requires labels, so it's only detectable after
your label delay, which is why you also monitor proxy signals like prediction-distribution shift and
business KPIs.

**You often can't measure model performance in real time, and interviewers want you to know that.** If
a loan default takes 12 months to materialize, your accuracy metric is 12 months delayed. So the
monitoring stack has to be layered: immediate signals (input distributions, prediction distribution,
latency, error rates, null rates, unseen-category rates), near-term proxies (business KPIs, human review
agreement rate, override rate), and delayed ground truth (the actual metric, when labels arrive). Saying
this unprompted is one of the strongest production signals you can give.

**Feedback loops are the subtle production killer.** If your fraud model blocks a transaction, you never
learn whether it was actually fraud. If your recommender only shows what it predicts you'll like, you
only collect labels for what it already recommended. The model's decisions shape the data used to train
its successor, which can entrench errors and progressively narrow the distribution the model sees.
Mitigations: hold out a small random control group that bypasses the model, use exploration (epsilon-
greedy or bandit approaches) to collect counterfactual data, and explicitly model the selection —
"trained on approved loans, scored on all applicants" is a classic instance of this and a great thing to
raise.

**Start with a baseline, and be willing to say "no ML."** A well-tuned rule can capture much of the
value, is trivially explainable and deployable, and gives you the number your model must beat. In a
design round, proposing the non-ML baseline first is a strong signal — it shows you optimize for
business outcome rather than for using ML.

### 22.3 What to monitor

| Layer | Signal | Detects | Latency |
|---|---|---|---|
| Infrastructure | Latency p50/p95/p99, error rate, throughput, cost | Serving failures | Seconds |
| Input data | Null rate, unseen-category rate, range violations, schema changes | Pipeline breakage | Minutes |
| Input distribution | PSI, KS test, KL divergence per feature | **Covariate drift** | Hours–days |
| Prediction distribution | Mean score, score histogram, positive rate at threshold | Drift, upstream bugs | Hours |
| Human interaction | Override rate, review agreement, appeal rate | Concept drift proxy | Days |
| Business KPI | Conversion, loss rate, revenue, queue volume | Real impact | Days–weeks |
| Ground truth | Actual precision/recall/AUC by segment | **Concept drift** | Label delay |

### 22.4 Gotchas that fail candidates

- **Not asking clarifying questions** before designing.
- **Jumping straight to the model** and skipping data, labels and serving.
- **Not mentioning any baseline.**
- **Not knowing what training/serving skew is.**
- **Conflating data drift and concept drift.**
- **Claiming you'll monitor accuracy in real time** when labels are delayed.
- **No rollback plan.** Always mention shadow/canary deployment and a kill switch.
- **Ignoring cost.** Cost per prediction is a real constraint and asking about it is a strong signal.

### 22.5 Hands-on drill

1. Write a full design document for one system — fraud detection, churn prediction, or demand
   forecasting — using the 10-step framework. Two pages. Include the latency budget, the label delay,
   the monitoring table and the rollback plan.
2. Build a `Pipeline` that serializes all preprocessing with the model, save it, load it in a separate
   process, and score a single row. Confirm identical output. That exercise is the concrete version of
   the skew answer.
3. Implement population stability index (PSI) from scratch and compute it between two time slices of a
   dataset. Establish for yourself what PSI value corresponds to a drift worth alerting on.
4. Simulate concept drift: train on the first half of a time-ordered dataset, then evaluate on rolling
   windows of the second half and plot performance decay. That decay curve is what a retraining cadence
   is derived from.
5. Wrap a model in a minimal FastAPI service, measure p50/p95 latency under load, then add batching or
   caching and measure again.

### 22.6 2026 interview questions

**Q1 `[DESIGN]` — Design a fraud detection system for a payments company.**

**Answer.** I'd start by clarifying, then follow a structure. **Clarify:** transaction volume and peak
TPS, the latency budget (real-time authorization implies tens of milliseconds, which drives every later
choice), the relative cost of a missed fraud versus a false decline, whether there's a human review
team and its capacity, how quickly chargeback labels arrive (typically weeks to months), and regulatory
constraints. **Frame:** binary classification per transaction producing a risk score, with the score
driving a three-way decision — approve, challenge (step-up authentication), decline — rather than a
binary one, since a challenge tier dramatically reduces the cost of uncertainty. **Baseline:** the
existing rules engine, which I'd keep running alongside the model, both as a safety net and as a
benchmark. **Data:** transaction attributes, plus aggregate features over card, merchant, device and IP
across multiple time windows; velocity features (count and amount in the last minute/hour/day) are
typically the strongest signal. Critically, all aggregates must be computable within the latency budget,
which means precomputing them in a **feature store** with streaming updates rather than querying at
request time. **Leakage audit:** exclude anything derived from the chargeback process. **Model:**
gradient-boosted trees as the primary — fast inference, strong on tabular, handles missing values — with
unsupervised anomaly scores as additional features to catch novel patterns the labelled fraud doesn't
cover. **Imbalance:** roughly 0.1% positive, so PR-AUC as the offline metric, `scale_pos_weight`, and a
threshold set by expected cost; I'd also calibrate, since the score feeds a cost-based decision.
**Evaluation:** strictly time-based splits with an embargo matching the label delay, and segment metrics
by merchant category and geography. **Serving:** a low-latency service with the model and preprocessing
in one artifact, precomputed features from the store, a hard timeout with a conservative fallback to
rules if the model doesn't respond in budget. **Deployment:** shadow mode first to compare against rules
on live traffic, then canary, then a percentage rollout with a kill switch. **Monitoring:** feature
drift, score distribution, decline rate, challenge rate, review-queue precision, and delayed
chargeback-based metrics; alert on score distribution shifts, since those surface before labels do.
**Feedback loop:** declined transactions never produce labels, so I'd keep a small random
allow-through control group and use review outcomes as a faster proxy. **Retraining:** scheduled
frequently (fraud is adversarial, so concept drift is the norm rather than the exception) plus
drift-triggered.

*What's being tested:* Whether you can run a design round end to end. The signals that matter most:
asking about latency and label delay upfront, the three-way decision, the feature store, the
time-based split with embargo, and the feedback-loop problem. Most candidates describe a model and stop.

---

**Q2 `[DEBUG]` `[TRAP]` — Your model performed well for three months, then degraded. Diagnose it.**

**Answer.** I'd separate "the world changed" from "our system broke," because the second is more common
and much faster to check. **First, is it actually the model?** Check pipeline health — schema changes, a
new null pattern, an upstream job failing silently, a unit change, a timezone bug, a new category value
being mapped to a default. A silent data-pipeline change is the single most frequent cause of a sudden
degradation. **Second, training/serving skew** — did a feature's computation change on one side only?
I'd compare logged serving-time feature distributions against training. **Third, covariate drift** —
`P(x)` moved: new customer segments, a new marketing channel, a new device type, seasonality the model
never saw. Detectable from inputs alone via PSI or KS tests per feature. **Fourth, concept drift** —
`P(y|x)` moved: behaviour genuinely changed, competitors adjusted, a policy change altered incentives,
or in an adversarial domain the adversaries adapted. This is the dangerous case and it requires labels
to confirm. **Fifth, label shift** — the base rate moved, which breaks calibration and makes the chosen
threshold wrong even if the model is fine; often fixable by re-tuning the threshold alone. **Sixth,
feedback loop** — the model's own decisions have narrowed the data distribution, so its successor was
trained on a biased sample. To distinguish them: a sharp step change points to a pipeline or deployment
event (correlate with the change log); gradual decay points to drift. Fixes, in order of cost:
re-tune the threshold, retrain on recent data, add features capturing the new regime, or re-frame the
problem. And I'd close the loop by adding the monitoring that would have caught this earlier.

*What's being tested:* Systematic production debugging, and specifically whether you check the boring
infrastructure causes before the interesting statistical ones. The step-change-versus-gradual-decay
heuristic is a strong practical detail.

---

**Q3 `[THEORY]` — Data drift vs concept drift. How do you detect each?**

**Answer.** **Data (covariate) drift** is a change in the input distribution `P(x)` while `P(y|x)` holds —
your users changed but the underlying relationship didn't. It's detectable **immediately** from inputs
alone: per-feature population stability index, Kolmogorov–Smirnov tests, KL or Jensen–Shannon divergence
against a training reference, or a domain classifier trained to distinguish training data from recent
production data (if it succeeds, they differ). **Concept drift** is a change in `P(y|x)` — the
relationship itself moved, so the model is now approximating the wrong function. This is the more
dangerous kind and it **requires labels** to confirm, so it's only directly detectable after your label
delay. Meanwhile you monitor proxies: prediction-distribution shift, business KPI movement, human
override or appeal rates, and agreement with a review team. **Label shift** is worth naming as a third
case: `P(y)` moved, which invalidates calibration and your threshold even when the model is otherwise
fine, and is often correctable by threshold re-tuning alone. Responses differ accordingly — covariate
drift may only need retraining on recent data or reweighting; concept drift needs retraining and often
new features; label shift may need only recalibration.

*What's being tested:* Precision on a distinction that is routinely blurred. The label-delay asymmetry
in detectability is the key insight.

---

**Q4 `[APPLIED]` — What is training/serving skew and how do you prevent it?**

**Answer.** It's when the features a model receives at serving time differ from those it was trained on,
even though both are nominally "the same feature." Common causes: training features computed in a
notebook or SQL batch job while serving computes them in application code, so two implementations drift
apart; different handling of missing values or default sentinels; different units, encodings or
timezones; a categorical vocabulary that has grown since training so new values hit an unhandled path;
and aggregation windows computed over different periods. The model is fine — it's being fed a different
distribution than it learned from. Prevention: **serialize all preprocessing inside the model artifact**
so there's literally one code path (an `sklearn` `Pipeline` or equivalent, saved and loaded as one
object); use a **feature store** so each feature is defined once and served identically to training and
inference; **log serving-time feature values** and continuously compare their distributions against the
training reference, which detects skew even when you didn't anticipate its cause; add schema validation
and range checks at the serving boundary that fail loudly rather than silently defaulting; and write an
integration test that scores a fixed set of rows through the production path and asserts the outputs
match the training-time predictions exactly. That last test is cheap and catches most instances of this
class of bug before release.

*What's being tested:* Whether you've operated a model in production. The "one serialized code path"
answer plus the fixed-row integration test are the practitioner signals.

---

**Q5 `[DESIGN]` `[TRAP]` — How often should you retrain?**

**Answer.** It depends on how fast the relationship changes and what retraining costs, so I'd derive it
rather than assert a number. The empirical method: train on a historical window, then evaluate on rolling
forward windows and plot performance decay over time. That curve tells you how long a model stays
acceptable, and you retrain at a cadence comfortably inside it. Domain heuristics: adversarial settings
like fraud and abuse drift fastest and may need daily or weekly retraining, since the adversaries adapt
deliberately; consumer behaviour models (churn, recommendations) typically weekly to monthly; physical
or biological processes may be stable for years. Beyond the schedule, I'd add **drift-triggered
retraining** — retrain when PSI on key features or a monitored metric crosses a threshold — so you react
to unexpected regime changes rather than only to the calendar. Two cautions worth raising: retraining
isn't free of risk, since each new model needs validation, calibration and threshold re-tuning, and a
badly-timed automatic retrain can bake in a data-quality incident — so any automatic retraining pipeline
needs the same offline gates and canary rollout as a manual release. And more frequent retraining does
not fix concept drift caused by a genuinely new regime; if the new pattern isn't in your features, more
recent data won't help.

*What's being tested:* Whether you derive the cadence from measured decay rather than guessing, and
whether you recognize retraining as a release with its own risk. The "automatic retrain can bake in an
incident" point is a strong senior signal.

---

**Q6 `[DESIGN]` — How do you safely deploy a new model version?**

**Answer.** Progressively, with a rollback plan at every stage. **Offline gates first:** the new model
must beat the incumbent on the primary offline metric using a time-based holdout the incumbent's tuning
never touched, with segment-level checks so an aggregate win doesn't hide a regression on an important
subgroup, plus calibration and fairness checks if applicable. **Shadow mode:** run the new model on live
traffic in parallel without acting on its outputs, and compare its predictions against the incumbent's
and against the production feature distributions. This catches training/serving skew and latency
problems with zero user risk, and it's the step people skip. **Canary:** route a small slice of real
traffic (1–5%) to the new model, monitoring latency, error rates, prediction distribution and any
immediately available business signal. **A/B test:** scale to a proper randomized split and measure the
**business** metric, not the model metric — offline gains often fail to translate, and the experiment is
the only way to know. Run it long enough for the relevant labels to materialize. **Progressive
rollout:** increase traffic in stages with automated guardrails that halt or revert on threshold
breach. **Throughout:** keep the previous version deployable and warm so rollback is a config change
rather than a redeploy, version the model artifact together with the exact preprocessing and feature
definitions, and log which version scored each prediction so you can attribute any incident. I'd also
define the rollback criteria *before* the rollout starts, since deciding under pressure is how bad calls
get made.

*What's being tested:* Deployment discipline. Shadow mode, business-metric A/B testing, and
pre-defined rollback criteria are the three things that mark real experience.

---

## Module 23 — Bridge: Classical ML → Neural Networks → GenAI

| | |
|---|---|
| **Prerequisites** | Modules 06–09, 18 |
| **Study time** | 4 h |
| **Why it's in the loop** | Every AI/GenAI Engineer loop, and increasingly all ML loops |
| **Rounds** | `[THEORY]` `[APPLIED]` |

This module connects everything you've learned to the rest of this portal. It is deliberately short —
its job is to make the transitions explicit, not to re-teach deep learning.

### 23.1 Where to continue in this portal

| Next topic | Page |
|---|---|
| Neural network fundamentals | [00-neural-networks.html](../interview-prep/00-neural-networks.html) |
| LLM foundations & prompting | [01-llm-foundations-prompting.html](../interview-prep/01-llm-foundations-prompting.html) |
| Embeddings & RAG | [02-embeddings-rag.html](../interview-prep/02-embeddings-rag.html) |
| Agents & MCP | [03-agents-mcp.html](../interview-prep/03-agents-mcp.html) |
| Evaluation & LLMOps | [04-evaluation-llmops.html](../interview-prep/04-evaluation-llmops.html) |
| Transformers deep dive | [02_transformers.html](../modules/02_transformers.html) |
| Foundations module | [01_foundations.html](../modules/01_foundations.html) |
| Vector databases | [05_vector_databases.html](../modules/05_vector_databases.html) |

### 23.2 The concepts that carry over unchanged

State these explicitly in interviews — they demonstrate that you see one field, not two.

| Classical ML concept | Its form in deep learning / GenAI |
|---|---|
| Logistic regression | **A single-layer neural network with a sigmoid output.** Literally the same model. |
| Softmax regression | The final classification layer of essentially every classifier network |
| Log-loss / cross-entropy | The training objective of essentially every classifier, including next-token prediction |
| MLE | Why cross-entropy is the loss; LLM pretraining is MLE over token sequences |
| Gradient descent | Still the optimizer; now with Adam/AdamW and backprop computing the gradients |
| Chain rule | **Is** backpropagation |
| Regularization | Weight decay, dropout, early stopping, data augmentation, label smoothing |
| Bias–variance | Still governs capacity choices; complicated by double descent in the over-parameterized regime |
| Feature scaling | Input normalization, plus batch/layer normalization inside the network |
| Train/val/test discipline | Identical, and *more* important — plus contamination of public benchmarks is now a first-order concern |
| Calibration | LLMs are notoriously overconfident; the same reliability diagrams and fixes apply |
| Dot product / cosine similarity | Attention scores; embedding retrieval in RAG |
| KNN | Vector search (HNSW, IVF-PQ) — the retrieval half of RAG |
| Curse of dimensionality | Why embedding quality and approximate-NN indexing matter |
| Precision/recall | Retrieval evaluation in RAG: recall@k, precision@k, NDCG |
| Class imbalance | Rare-intent classification, and skewed evaluation sets for LLM judges |
| Bagging | Self-consistency / majority voting over multiple LLM samples |
| Boosting's residual fitting | Iterative refinement and critique-revise agent loops (conceptually) |
| Data leakage | **Benchmark contamination** — the same failure, at internet scale |
| Drift monitoring | Prompt/model version drift, and provider model updates changing behaviour under you |

### 23.3 Core intuitions

**Logistic regression *is* a one-layer neural network.** Same linear combination, same sigmoid, same
cross-entropy loss, same gradient `Xᵀ(p−y)`. A neural network adds hidden layers with non-linear
activations, which lets it *learn* the feature representation rather than requiring you to engineer it.
That's the whole conceptual leap: deep learning is representation learning. Saying this in an interview
frames everything else you know as directly relevant.

**LLM pretraining is maximum likelihood estimation.** Next-token prediction minimizes cross-entropy
over a vocabulary — the multi-class version of the log-loss you derived in Module 07, applied at
enormous scale. The softmax over the vocabulary is exactly Module 07's multinomial logistic regression,
sitting on top of a transformer instead of a linear layer. So when you're asked how an LLM is trained,
the honest first sentence is "it's MLE with a cross-entropy loss."

**Benchmark contamination is data leakage.** When a model's pretraining corpus includes the test set of
a benchmark, its score on that benchmark is meaningless in exactly the way a leaked feature makes your
CV score meaningless. The concept transfers directly, and so does the fix: evaluate on data you know
post-dates the training cutoff, or on private held-out sets. This is one of the cleanest bridges between
classical rigour and modern practice, and it's a good thing to raise unprompted.

**Classical ML has not been replaced, and the boundary is worth being crisp about.** For tabular
supervised learning with plentiful labels, gradient-boosted trees remain the strongest default. LLMs win
where the input is unstructured language, where labelled data is scarce but the task is describable in
words, where you need flexible zero-shot generalization, or where the output is itself text. The most
valuable practical pattern in 2026 is the **hybrid**: use an LLM or embedding model to convert
unstructured columns into features, then feed those into a gradient-boosted tree that provides the
calibrated, cheap, auditable decision. Being able to describe that architecture concretely is one of the
most useful things this whole curriculum prepares you to say.

### 23.4 2026 interview questions

**Q1 `[THEORY]` — How is logistic regression related to a neural network?**

**Answer.** Logistic regression *is* a neural network with no hidden layers: one linear transformation
`w·x + b`, a sigmoid activation, and a cross-entropy loss — trained by gradient descent with the
gradient `Xᵀ(p−y)`. Multinomial logistic regression is the same thing with a softmax output, which is
exactly the final layer of nearly every neural classifier. What a deep network adds is hidden layers
with non-linear activations, and the consequence is qualitative: instead of requiring you to engineer
features that make the classes linearly separable, the network **learns a representation** in which they
are. That's the essential leap — deep learning is representation learning, and the output layer is still
the logistic/softmax regression you already understand. It's why the loss, the optimizer, the
regularization concepts and the calibration concerns all carry over unchanged.

*What's being tested:* Whether your knowledge is unified or siloed. This is a very common opening bridge
question, and framing deep learning as "the same output layer plus learned features" is the answer that
lands.

---

**Q2 `[APPLIED]` — When would you use classical ML instead of an LLM in 2026?**

**Answer.** Whenever the problem is supervised learning on structured data with plenty of labels — which
is most business ML. Concretely, classical ML wins on: **tabular prediction**, where gradient-boosted
trees typically match or beat neural and LLM-based approaches while training in minutes; **cost and
latency**, since a tree ensemble is microseconds and fractions of a cent per million predictions versus
an LLM's tokens and hundreds of milliseconds; **determinism and auditability**, since the same input
always yields the same output and you can attribute it, which regulated domains require;
**calibration**, where a properly fitted model gives probabilities you can plug into an expected-cost
calculation; and **learning from your own historical labels**, which an LLM can only access through
whatever fits in a prompt. LLMs win where the input is unstructured language, where labels are scarce
but the task is describable in words, where you need zero-shot flexibility across many tasks, or where
the required output is text. And the highest-value pattern is the **hybrid**: use embedding models or an
LLM to turn free-text columns (support tickets, notes, transcripts) into features, then feed those into
a gradient-boosted tree that makes the actual calibrated decision — you get the LLM's language
understanding with the tree's cost profile, determinism and auditability.

*What's being tested:* Judgment and cost awareness — the archetypal 2026 question. The hybrid
architecture is what elevates the answer from "know the tradeoffs" to "know what to build."

---

**Q3 `[THEORY]` — What classical ML concepts still matter most for GenAI work?**

**Answer.** More than people expect, and I'd group them. **Evaluation discipline** is the biggest:
train/val/test separation, the fact that looking at your test set repeatedly invalidates it, and
metric-to-objective alignment all apply directly — and **benchmark contamination is just data leakage at
internet scale**, the exact failure mode from Module 04. **Retrieval is classical ML**: RAG's retriever
is nearest-neighbour search over embeddings, evaluated with recall@k, precision@k and NDCG, and subject
to the curse of dimensionality — so everything from Module 13 applies. **Calibration** matters acutely,
since LLMs are systematically overconfident and their stated confidence is unreliable; the same
reliability diagrams and post-hoc corrections apply to any classifier built on their outputs.
**Cross-entropy and MLE** are how these models are trained, so the Module 01 and 07 derivations explain
the objective. **Class imbalance** shows up in rare-intent classification and in skewed evaluation sets
for LLM-as-judge setups. **Ensembling** reappears as self-consistency and majority voting over samples.
And **drift monitoring** applies to prompts and provider model versions, which change underneath you
without notice — a form of concept drift you don't control. The summary I'd give: GenAI changed the model
class, not the discipline of measuring whether something works.

*What's being tested:* Whether you can see the field as continuous. This question is increasingly used
to filter candidates whose GenAI knowledge is prompt-level from those with real ML foundations.

---

## Module 24 — Mock Interview Drills & Revision

| | |
|---|---|
| **Prerequisites** | All modules |
| **Study time** | 10 h+ |
| **Why it's in the loop** | This *is* the loop |
| **Rounds** | All |

### 24.1 How to use this module

Knowing the material and performing under interview conditions are different skills. Work these drills
out loud, ideally recorded or with a partner. If you can't answer in the time budget, the module to
revisit is named next to the question.

### 24.2 Rapid-fire bank — 60 questions, 30 seconds each

Cover the answer, say yours out loud, then check. Any miss sends you back to the named module.

| # | Question | Module |
|---:|---|:--:|
| 1 | Difference between classification and regression? | 03 |
| 2 | Why log odds and not probability directly? | 07 |
| 3 | Why not MSE for logistic regression? Two reasons. | 07 |
| 4 | Define precision and recall. | 10 |
| 5 | Bias–variance decomposition — the three terms? | 05 |
| 6 | Why does L1 give exact zeros? | 08 |
| 7 | What does each gradient-boosting tree fit? | 17 |
| 8 | Bagging vs boosting — one sentence each. | 16 |
| 9 | Random Forest = bagging + what? | 16 |
| 10 | Can more trees overfit a Random Forest? Boosting? | 16 |
| 11 | Which algorithms need feature scaling? | 02 |
| 12 | Why don't trees need scaling? | 15 |
| 13 | Gini vs entropy — which is better? | 15 |
| 14 | What is a support vector? | 14 |
| 15 | Explain the kernel trick. | 14 |
| 16 | Does `C` larger mean more or less regularization? | 07/14 |
| 17 | When is ROC-AUC misleading? | 10 |
| 18 | PR-AUC baseline value? | 10 |
| 19 | Why is F1 a harmonic mean? | 10 |
| 20 | How do you choose a decision threshold? | 10 |
| 21 | Optimal threshold formula from costs? | 10 |
| 22 | Name five kinds of data leakage. | 04 |
| 23 | Where does resampling belong in a pipeline? | 12 |
| 24 | Downsides of SMOTE? | 12 |
| 25 | Is class imbalance always a problem? | 12 |
| 26 | RMSE vs MAE — which statistic does each predict? | 11 |
| 27 | Can R² be negative? | 06 |
| 28 | Assumptions of linear regression? | 06 |
| 29 | Is normality required for OLS to be BLUE? | 06 |
| 30 | What does multicollinearity break? | 06 |
| 31 | When is `XᵀX` not invertible, and what then? | 06 |
| 32 | Normal equation vs gradient descent — when each? | 06/09 |
| 33 | Batch vs SGD vs mini-batch? | 09 |
| 34 | What does AdamW decouple? | 09 |
| 35 | Gradient boosting vs gradient descent? | 09/17 |
| 36 | Does gradient descent find the global minimum? | 09 |
| 37 | Why does scaling speed up gradient descent? | 09 |
| 38 | XGBoost's key addition over standard GBM? | 18 |
| 39 | XGBoost optimal leaf weight formula? | 18 |
| 40 | How does XGBoost handle missing values? | 18 |
| 41 | What is `min_child_weight` thresholding? | 18 |
| 42 | LightGBM: what is leaf-wise growth? | 18 |
| 43 | What do GOSS and EFB do? | 18 |
| 44 | What does CatBoost's ordered boosting solve? | 18 |
| 45 | Curse of dimensionality — two consequences? | 13 |
| 46 | How does `k` in KNN affect bias/variance? | 13 |
| 47 | Why does Naive Bayes work despite false assumptions? | 13 |
| 48 | What is Laplace smoothing for? | 13 |
| 49 | LDA vs PCA? | 13/19 |
| 50 | K-Means assumptions? | 19 |
| 51 | Why are PCA components orthogonal? | 19 |
| 52 | Should you always apply PCA first? | 19 |
| 53 | What can't you conclude from a t-SNE plot? | 19 |
| 54 | Why is random search better than grid search? | 20 |
| 55 | Can hyperparameter tuning overfit? | 20 |
| 56 | What is nested cross-validation for? | 05/20 |
| 57 | Data drift vs concept drift? | 22 |
| 58 | What is training/serving skew? | 22 |
| 59 | Is SHAP causal? | 21 |
| 60 | Logistic regression vs a neural network? | 23 |

### 24.3 Mock round 1 — Theory (45 min)

Run these in sequence, timed, out loud.

1. Walk me through logistic regression from first principles, including why we use log odds. *(10 min)*
2. Derive log-loss from the Bernoulli likelihood, then its gradient. *(8 min)*
3. Explain the bias–variance tradeoff and give three hyperparameters that move along it. *(5 min)*
4. Compare bagging and boosting across five dimensions. *(7 min)*
5. What does XGBoost add over standard gradient boosting? *(8 min)*
6. Why does L1 produce sparsity? Give both arguments. *(7 min)*

### 24.4 Mock round 2 — Applied case study (45 min)

> A subscription business wants to reduce churn. They have 3 years of data, 800,000 customers, ~40
> tables in a warehouse, monthly billing, and a retention team that can contact 5,000 customers per
> month. Build them a solution.

Work it in this order and time yourself. **Clarify** (what counts as churn — voluntary cancellation,
payment failure, or inactivity? what does a save cost and what is a saved customer worth? how far ahead
do they need warning?). **Target definition** — this is the hardest and most important part; the label
and the horizon determine everything. **Data and leakage audit** — the cancellation record and anything
downstream of it must be excluded, and features must be as-of the prediction date. **Split** — time-based
with a gap for label maturation, and grouped by customer. **Baseline** — a simple tenure-and-engagement
rule. **Model** — gradient boosting, plus a logistic regression for interpretability. **Metric** — the
retention team can contact 5,000 per month, so the metric is **precision@5000**, not F1 or accuracy; this
is the single most important insight in the case and interviewers watch for it. **Threshold/ranking** —
rank and take the top 5,000. **Uplift caveat** — a strong answer notes that churn probability is not the
same as *saveability*, and that the ideal target is incremental effect of contact, which requires an
experiment (uplift modelling). **Deployment** — monthly batch scoring is sufficient; no real-time
serving needed. **Monitoring and measurement** — a randomized holdout among the top-ranked customers is
the only way to measure whether the intervention actually works.

### 24.5 Mock round 3 — Coding (45 min)

1. Implement logistic regression with gradient descent in `numpy`. *(15 min)*
2. Implement a decision tree with Gini splitting. *(20 min)*
3. Given `y_true` and `y_pred`, compute precision, recall, F1 and the confusion matrix without
   `sklearn`. *(5 min)*
4. Given `y_true` and `y_score`, compute ROC-AUC without `sklearn`. *(5 min)*

### 24.6 Mock round 4 — Debugging (30 min)

1. CV AUC 0.97, production AUC 0.61. *(Module 04)*
2. Training loss oscillates and sometimes rises. *(Module 09)*
3. Logistic regression coefficients are around 400 and the solver won't converge. *(Module 07)*
4. Model was fine for three months, then degraded. *(Module 22)*
5. CV score is 0.84 ± 0.11. *(Module 05)*
6. Recall is 0.0 on an imbalanced problem despite a good AUC. *(Modules 10, 12)*

### 24.7 Mock round 5 — System design (45 min)

Pick one and run the 10-step framework from Module 22:
- Real-time fraud detection for payments
- Demand forecasting for a retail chain with 2,000 stores
- Lead scoring for a B2B sales team
- Predictive maintenance for industrial equipment
- Content moderation triage at scale

### 24.8 The one-page cheat sheet

```text
━━ FORMULAS ━━
Sigmoid σ(z)=1/(1+e⁻ᶻ) ; σ'=σ(1-σ) ; logit(p)=log(p/(1-p))
Log-loss  -Σ[y log p + (1-y)log(1-p)]      grad = Xᵀ(p-y)
OLS       w=(XᵀX)⁻¹Xᵀy                     Ridge w=(XᵀX+λI)⁻¹Xᵀy
Gini      1-Σp²        Entropy  -Σp log₂p
Bias-var  E[err] = bias² + variance + σ²
Bagging   Var = ρσ² + (1-ρ)σ²/B            ← RF reduces ρ
XGB leaf  w* = -G/(H+λ)   Gain = ½[G_L²/(H_L+λ)+G_R²/(H_R+λ)-(G²/(H+λ))] - γ
Precision TP/(TP+FP)   Recall TP/(TP+FN)   F1 = 2PR/(P+R)
Threshold t* = C_FP/(C_FP+C_FN)
Bootstrap ~63.2% in-bag, ~36.8% OOB

━━ ONE-LINERS ━━
Why log odds?         Unbounded linear predictor vs bounded p; canonical Bernoulli link;
                      convex loss; grad Xᵀ(p-y); odds ratios e^wⱼ
Why not MSE?          Non-convex with sigmoid + vanishing gradient from σ'
Bagging               parallel, deep learners, cuts VARIANCE, won't overfit w/ more trees
Boosting              sequential, weak learners, cuts BIAS, WILL overfit, early stop
RF adds               feature subsampling → decorrelation → lowers the ρσ² floor
GBM tree fits         negative gradient of loss wrt predictions (= residual only for MSE)
XGBoost adds          2nd-order Taylor + regularized objective + sparsity-aware splits
Need scaling          KNN, K-Means, SVM, PCA, regularized linear, NNs.  NOT trees.
Imbalance order       metric → threshold → class weight → resample (in-fold!) → reframe
ROC vs PR             PR when positives are rare; FPR's huge denominator hides FP growth
L1 sparsity           diamond corners + constant λ·sign subgradient → soft threshold
Leakage types         target, preprocessing, temporal, group, duplicate, selection
Drift                 data=P(x) detectable now; concept=P(y|x) needs labels; label=P(y)
SHAP                  local + additive + consistent — but NOT causal
```

### 24.9 The 48-hour pre-interview plan

**Day −2:** Rapid-fire bank (24.2) twice, out loud. Note every miss; re-read only those modules. Then
mock round 1 (theory), timed.

**Day −1:** Mock round 2 (applied) and round 5 (design), both timed and spoken. Re-derive log-loss and
its gradient on paper. Re-read the cheat sheet and the "12 things that get candidates rejected" list in
section 1.2.

**Day 0:** Read only the cheat sheet (24.8) and section 1.2. Do not learn anything new. Prepare your two
project briefs from Module 00 and three questions to ask the interviewer.

---

# Appendix A — Study checklist

Tick each module only when you can do **all four**: explain the core intuitions out loud, write the
whiteboard formulas from memory, complete the hands-on drill, and answer every interview question
without looking.

```text
Part A — Foundations
[ ] 00  Interview landscape & setup
[ ] 01  Math & statistics prerequisites
[ ] 02  ML landscape & algorithm taxonomy
[ ] 03  Classification vs regression
[ ] 04  Data preparation, EDA & feature engineering
[ ] 05  Bias–variance, splits & cross-validation

Part B — Linear models & optimization
[ ] 06  Linear regression
[ ] 07  Logistic regression & log odds          ← highest priority
[ ] 08  Regularization: ridge, lasso, elastic net
[ ] 09  Gradient descent & optimization

Part C — Evaluation
[ ] 10  Classification metrics & confusion matrix   ← highest priority
[ ] 11  Regression metrics
[ ] 12  Imbalanced data
[ ] 13  KNN, Naive Bayes & discriminant analysis

Part D — Margins, trees & ensembles
[ ] 14  SVM & kernels
[ ] 15  Decision trees
[ ] 16  Bagging & Random Forest                 ← highest priority
[ ] 17  Boosting I: AdaBoost & gradient boosting ← highest priority
[ ] 18  Boosting II: XGBoost, LightGBM, CatBoost

Part E — Unsupervised, tuning & interpretability
[ ] 19  Clustering & dimensionality reduction
[ ] 20  Hyperparameter tuning & model selection
[ ] 21  Interpretability & explainability

Part F — Production & beyond
[ ] 22  ML system design, deployment & monitoring
[ ] 23  Bridge: classical ML → NN → GenAI
[ ] 24  Mock interview drills & revision
```

If you have limited time, the four modules marked **highest priority** — 07, 10, 16, 17 — cover the
majority of questions in a typical loop.

---

# Appendix B — Environment setup

```bash
python -m venv .venv
# Windows PowerShell:  .venv\Scripts\Activate.ps1
# Git Bash / macOS:    source .venv/bin/activate

pip install numpy pandas scikit-learn scipy matplotlib seaborn \
            xgboost lightgbm catboost \
            imbalanced-learn shap optuna statsmodels jupyterlab
```

Suggested working structure inside this folder:

```text
machine learning/
  ML_plan.md                  ← this document
  notebooks/
    01_math_stats.ipynb
    04_data_prep_leakage.ipynb
    05_bias_variance_cv.ipynb
    06_linear_regression_scratch.ipynb
    07_logistic_regression_scratch.ipynb   ← the most valuable notebook here
    08_regularization_paths.ipynb
    09_optimizers_scratch.ipynb
    10_metrics_roc_pr.ipynb
    12_imbalance_experiments.ipynb
    13_knn_curse_of_dimensionality.ipynb
    14_svm_kernels.ipynb
    15_decision_tree_scratch.ipynb
    16_bagging_rf_decorrelation.ipynb
    17_gradient_boosting_scratch.ipynb
    18_xgb_lgbm_catboost_bakeoff.ipynb
    19_clustering_pca_tsne.ipynb
    20_tuning_comparison.ipynb
    21_shap_interpretability.ipynb
  projects/
    project_1_<name>/
    project_2_<name>/
```

The from-scratch notebooks (06, 07, 15, 17) carry disproportionate value: implementing logistic
regression and gradient boosting by hand makes roughly a third of the interview questions in this
document trivially answerable.

---

# Appendix C — Recommended reading

**Books**
- *An Introduction to Statistical Learning* (James, Witten, Hastie, Tibshirani) — the best single book
  for this curriculum; freely available from the authors.
- *The Elements of Statistical Learning* (Hastie, Tibshirani, Friedman) — the rigorous reference;
  freely available.
- *Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow* (Géron) — the best practical
  companion.
- *Designing Machine Learning Systems* (Huyen) — the reference for Module 22.
- *Interpretable Machine Learning* (Molnar) — the reference for Module 21; freely available online.

**Papers worth reading directly** (each maps to a module)
- Breiman, *Random Forests* (2001) — Module 16
- Friedman, *Greedy Function Approximation: A Gradient Boosting Machine* (2001) — Module 17
- Chen & Guestrin, *XGBoost: A Scalable Tree Boosting System* (2016) — Module 18
- Ke et al., *LightGBM* (2017) — Module 18
- Prokhorenkova et al., *CatBoost* (2018) — Module 18
- Bergstra & Bengio, *Random Search for Hyper-Parameter Optimization* (2012) — Module 20
- Lundberg & Lee, *A Unified Approach to Interpreting Model Predictions* (SHAP, 2017) — Module 21
- Grinsztajn et al., *Why do tree-based models still outperform deep learning on tabular data?* (2022) —
  Module 18, and the citation for the "why not a neural net?" answer

**Practice**
- Kaggle Playground competitions for tabular practice with fast feedback.
- Re-implement one algorithm per week from scratch; the act of building it is what makes the interview
  answers fluent.

---

*This is a living document. When you encounter an interview question not covered here, add it to the
relevant module with your answer — the act of writing the answer is what makes it retrievable under
pressure.*





