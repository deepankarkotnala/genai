# Data dictionary — `data/support_ops_synthetic.csv`

800 rows of SaaS customer-support tickets. Synthetic, seeded, and regenerable:
`python make_dataset.py` reproduces the file **byte for byte**.

That last property matters more than it sounds. Every pinned number in
`evals/golden_set.json` and in the tests is a fact about *this* file. If the
generator drifted, the golden set would quietly start grading against numbers
that no longer exist — so five things are held fixed: a seeded `default_rng`,
fixed category tuples, a sort by `ticket_id`, `float_format="%.2f"`, and
`lineterminator="\n"`.

## Columns

| Column | Type | Notes |
| --- | --- | --- |
| `ticket_id` | text | `TCK-10001`…`TCK-10800`. Unique. Near-unique keys are a classic grouping mistake — grouping by this returns `too_many_groups`. |
| `created_at` | timestamp | 2025-08-01 to 2026-07-31. The only date column. |
| `category` | text | Billing, Technical, Shipping, Returns, Account, Other |
| `priority` | text | Low, Normal, High, Urgent |
| `channel` | text | Email, Chat, Phone, Web |
| `customer_tier` | text | Free, Pro, Enterprise |
| `first_response_minutes` | float | **4.4% missing** — tickets closed before anyone replied |
| `resolution_minutes` | float | The main outcome variable |
| `status` | text | Open, Pending, Resolved, Closed |
| `escalated` | bool | |
| `refund_requested` | bool | |
| `refund_amount` | float | **81.9% missing, by design** — null unless a refund was requested. Not-applicable is not the same thing as missing, and imputing a mean here is wrong. |
| `csat_score` | float | 1–5. **21.5% missing** — unsurveyed tickets |

## What is planted in it, and what is a trap

A tidy dataset teaches nothing. Each of these exists to be found, and two of
them exist to be *mis*-found.

**Strong, and real.** Resolution time by category. Returns averages 949 minutes
against Technical's 492 — roughly 2×, and the strongest signal in the file. Any
competent plan finds it.

**Real, but confounded.** Escalation rate by tier: Enterprise 21.9%, Pro 14.7%,
Free 9.9%, so about 2.2×. The obvious reading is "Enterprise customers escalate
more". Priority also varies by tier and drives escalation independently, so the
tier effect is partly priority wearing a different hat. A pairwise correlation
cannot tell you which — which is why `correlation_summary` returns a
causation caveat it is not possible to suppress.

**Weak, and hiding behind missing data.** CSAT by channel: Phone 3.44, Email
3.80, Web 3.82, Chat 3.83. The gap is small, and `csat_score` is 21.5% missing.
`.mean()` drops those rows silently, so the honest answer covers 628 of 800
tickets and must say so. The tool attaches that note itself rather than trusting
the model to remember.

**An association that invites the wrong verb.** Tickets with a refund request
take 807 minutes against 382 without. "Refunds cause slow resolution" is the
tempting sentence and it is not supported: both are driven by case complexity.

**Skew.** `resolution_minutes` is right-skewed -- mean 459, median 326 -- so the
two tell different stories. `detect_outliers` deliberately offers both IQR and z-score, and
they return different counts — "outlier" is a method choice, not a fact.

## Regenerating

```
python make_dataset.py
```

macOS / Linux, to confirm nothing moved:

```
shasum -a 256 data/support_ops_synthetic.csv
```

Windows Command Prompt:

```
certutil -hashfile data\support_ops_synthetic.csv SHA256
```

If the hash changes, `tests/test_golden.py::test_pinned_numbers_are_recomputable`
will fail before the golden set has a chance to mislead you.
