# DSA Interview Preparation — Best Consolidated Build Plan

**Status:** planning specification only. Build one requested page at a time. This is the canonical plan — superseded drafts are kept as `PLAN-v1-draft.md` and `PLAN-v2-master.md` for reference.

## 1. Decision and design principle

This plan combines the strongest parts of the two earlier proposals:

- the **manageable curriculum, portal fit, and Python/NumPy/Pandas relevance** of the concise plan;
- the **implementation rigor, metadata architecture, testing rules, memory analysis, progress tracking, and accessibility requirements** of the larger master plan.

The result is a **Python-first, interview-first textbook**, not a random LeetCode list and not an oversized encyclopaedia. It must help SDE, Python backend, Data Science, ML/AI, and GenAI candidates recognize patterns, explain trade-offs, write correct code, test it, and communicate well under interview time limits.

### Non-negotiable priorities

1. Arrays and Linked Lists receive the deepest treatment of any chapter: a curated 15-problem ladder each. Linked Lists is nearly fully self-contained (only LRU Cache is cross-linked, to Data Structure Design). Arrays cross-links a handful of its 15 listed problems (Contains Duplicate, Container With Most Water, Merge Intervals, Longest Consecutive Sequence, Trapping Rain Water) to the chapter that owns their full canonical write-up — Hashing, Two Pointers, or Sorting/Intervals — so the same editorial isn't duplicated. Arrays fully owns roughly 10 of its 15 and cross-references the rest; this is intentional, not a shortfall.
2. Every topic explains Python representation, time complexity, auxiliary memory, mutation, and practical trade-offs.
3. Problems are ordered as a learning ladder, not by popularity alone.
4. Repeated problems have **one canonical full write-up** and are cross-linked from other pattern pages.
5. Full copyrighted problem statements are never copied. Use original summaries plus the LeetCode number, title, difficulty, and source link.
6. Company-specific claims are omitted unless a reliable source is supplied. Use role-relevance labels instead.
7. The interface remains dense, textbook-like, offline-safe, responsive, and compatible with the existing light/dark themes.
8. Build and validate one chapter at a time. Do not generate the whole course in one pass.

---

## 2. Scope: curated mastery plus an expandable catalog

"All LeetCode questions" should not mean thousands of full editorials inside the initial portal. That would become slow to build, difficult to verify, and poor to study.

Use two layers:

### Layer A — Core curriculum

- 10–15 canonical problems per topic.
- Arrays and Linked Lists: exactly 15 listed problems each (see §1.1 for how "canonical" ownership applies within that count).
- Every canonical problem includes reasoning, code, tests, complexity, memory notes, interview narration, and follow-ups.
- Approximately 230–270 canonical problems across the complete curriculum, with duplicate write-ups removed through cross-linking.

### Layer B — Expandable question catalog

A centralized metadata registry can later index any additional LeetCode problem by topic, pattern, difficulty, role, and study status without requiring a full editorial immediately.

Each catalog entry states whether it has:

- full solution;
- guided hints only;
- practice-only listing;
- review status.

This gives the portal broad coverage without compromising the quality of the core chapters.

---

## 3. Placement in the existing portal

Create a new top-level group named **DSA Interview Preparation** and place it above **Global Study Plan** in the shared navigation registry.

Suggested navigation metadata:

```js
{
  id: "dsa",
  label: "DSA Interview Preparation",
  mark: "D",
  blurb: "Python · Patterns · Coding Rounds",
  home: "genai-portal/dsa-prep/index.html",
  pages: []
  // each page entry needs path/title/num/kw (search keywords), matching
  // the shape already used by the ats-agent-lab / interview-prep groups
  // in sitenav.js — populated once pages exist.
}
```

### Integration boundaries

This section owns:

- classical data structures;
- algorithmic patterns;
- Python-specific complexity and memory behavior;
- coding-round communication and testing;
- role-specific DSA preparation;
- NumPy/Pandas performance questions relevant to DS/AI roles.

It does **not** duplicate:

- GenAI concepts, RAG, embeddings, agents, or LLM systems;
- behavioral interview preparation already in the interview hub;
- general system design or ML system design already elsewhere in the portal.

Cross-link to those sections where useful.

---

## 4. Final file and chapter architecture

```text
genai-portal/
  dsa-prep/
    PLAN.md
    index.html
    00-interview-strategy.html
    01-python-dsa-foundations.html
    02-arrays.html
    03-linked-lists.html
    04-hashing.html
    05-strings.html
    06-two-pointers.html
    07-sliding-window-prefix-sums.html
    08-stacks-queues-deques.html
    09-sorting-intervals-selection.html
    10-binary-search.html
    11-recursion-backtracking.html
    12-trees-bst.html
    13-heaps-priority-queues.html
    14-tries.html
    15-graphs-grids.html
    16-advanced-graphs.html
    17-greedy.html
    18-dynamic-programming-1d.html
    19-dynamic-programming-2d.html
    20-bit-math-matrix.html
    21-data-structure-design.html
    22-python-numpy-pandas-performance.html
    23-role-tracks-mocks-revision.html
    24-advanced-dsa-optional.html
  assets/
    dsa-prep.css
    dsa-prep.js
    dsa-question-bank.js
```

### Why this chapter count is appropriate

- Topics are separated enough to make them easy to reach and revise.
- Arrays and Linked Lists remain dedicated chapters as requested.
- Closely related techniques are combined only when the combination improves learning: Sliding Window with Prefix Sums; Stacks with Queues/Deques; Bit with Math/Matrix.
- Advanced DSA is explicitly optional so Data Science and ML/AI candidates are not forced through low-priority material.
- NumPy/Pandas performance remains a dedicated bridge for the portal's actual audience.

---

## 5. Learning tracks

Label every chapter as one of the following:

### Core for every role

00–13, 15, 17–19, 21, and 23.

### Strongly recommended for SDE/Python backend

14, 16, 20, and 24.

### Strongly recommended for Data Science/ML/AI/GenAI

04, 07, 09, 13, 15, 20, 22, and the role-specific sets in 23.

### Optional advanced

24, unless the target company or role is known to ask advanced competitive-programming structures.

---

## 6. Universal chapter template

Every content chapter uses the same predictable structure.

### 6.1 Chapter header

- chapter number and title;
- one-sentence outcome;
- estimated study and practice time;
- prerequisite chapters;
- difficulty range;
- number of patterns and canonical problems;
- role-relevance tags;
- progress state.

### 6.2 Foundations

1. Definition and mental model.
2. How Python represents it.
3. Memory layout or conceptual memory model.
4. Core operations and invariants.
5. Time-complexity table.
6. Auxiliary-space table.
7. Advantages and disadvantages.
8. Comparison with the nearest alternative.
9. When to use it.
10. When not to use it.
11. Python-specific pitfalls.

### 6.3 Minimal Python implementation

Where educationally useful, include:

- a from-scratch implementation;
- the idiomatic standard-library alternative;
- mutation/copying behavior;
- short assertions;
- memory and recursion caveats.

### 6.4 Pattern library

For every reusable pattern:

- recognition signals;
- core invariant;
- small template;
- dry run;
- time and auxiliary space;
- failure modes;
- related patterns.

### 6.5 Problem ladder

Order problems as:

1. foundation;
2. easy recognition;
3. medium single-pattern;
4. medium multi-pattern;
5. advanced/hard;
6. one or two role-flavored variants.

Problem rows remain compact and expand progressively:

- summary;
- hint 1;
- hint 2;
- approach;
- code and tests;
- follow-ups.

### 6.6 Interview playbook

- clarifying questions;
- brute-force explanation;
- path to optimization;
- invariant to state aloud;
- edge cases before coding;
- manual test strategy;
- common follow-ups;
- warning signs that another structure is better.

### 6.7 Role notes

A short comparison for:

- SDE;
- Python backend;
- Data Science;
- ML/AI/GenAI.

### 6.8 Review block

- one-page cheat sheet;
- 5–8 concept checks;
- three code-completion drills;
- two debugging drills;
- one timed mixed question;
- mastery checklist;
- previous/next chapter links.

---

## 7. Canonical problem write-up schema

Every fully explained problem follows this order:

```text
LeetCode number and title
Difficulty
Canonical chapter
Secondary patterns
Role relevance
Estimated interview time
Source link

Original problem summary
Clarifying questions
Constraints that affect the approach
Original examples

Brute-force approach
Why it works
Time complexity
Auxiliary space
Why it may fail at scale

Optimized approach
Recognition signal
Invariant
Step-by-step derivation
Dry-run table

Python 3 solution
Explanation by logical block
Time complexity
Auxiliary space
Output-space convention
Mutation and side effects
Python object-overhead caveat where relevant

Edge cases
Executable tests
Adversarial tests
Common mistakes
Follow-up variants
Suggested interview narration
```

### Memory-analysis standard

Never call a solution "memory optimized" without stating:

- baseline auxiliary memory;
- optimized auxiliary memory;
- whether output space is excluded;
- whether input mutation is required;
- recursion stack cost;
- relevant Python container/object overhead.

Readable optimal code is preferred over obscure micro-optimizations.

---

## 8. Canonical ownership and cross-linking

Some questions teach multiple patterns. To prevent repetitive pages:

- assign each problem one `canonicalChapter`;
- show the full explanation only there;
- other chapters display a compact cross-reference explaining the alternate lens;
- progress is shared across all appearances.

Example:

```js
{
  id: "lc-15",
  title: "3Sum",
  canonicalChapter: "06-two-pointers",
  relatedChapters: ["02-arrays", "09-sorting-intervals-selection"]
}
```

This rule keeps pages dense and makes the same solved problem count everywhere it appears.

---

## 9. Shared product features

### 9.1 Textbook contents page

The DSA landing page should use compact chapter rows rather than large marketing cards. Each row contains:

- chapter number;
- title;
- one-line skill description;
- estimated time;
- problem count;
- difficulty mix;
- completion/confidence.

Include filters for role, difficulty, progress, and estimated time.

### 9.2 Question bank

Use a central metadata registry:

```js
{
  id: "lc-1",
  source: "LeetCode",
  number: 1,
  title: "Two Sum",
  slug: "two-sum",
  difficulty: "Easy",
  canonicalChapter: "04-hashing",
  relatedChapters: ["02-arrays"],
  patterns: ["Complement lookup", "Hash map"],
  roles: ["SDE", "Python", "Data Science", "ML/AI", "GenAI"],
  estimatedMinutes: 20,
  editorialLevel: "full",
  page: "04-hashing.html",
  anchor: "lc-1-two-sum"
}
```

### 9.3 Search and filters

Filter by:

- chapter;
- pattern;
- difficulty;
- role;
- completion state;
- target time;
- memory behavior;
- editorial level.

### 9.4 Progress and revision

Store locally:

- chapter completion;
- problem state: unseen, learning, solved, review;
- confidence 1–5;
- last and next review date;
- bookmarks;
- attempt count;
- mistake tags;
- personal notes.

### 9.5 Progressive disclosure

- compact problem row by default;
- hints before full solution;
- "hide all solutions" practice mode;
- copy buttons for code;
- keyboard-accessible expansion;
- no required server or online code runner.

---

# 10. Detailed chapter plan

## 00 — Interview Strategy

### Outcome

Run a 45-minute coding interview with a repeatable process rather than jumping straight into code.

### Subsections

1. How interviewers evaluate coding rounds.
2. Clarify → examples → constraints → brute force → optimize → code → test → complexity.
3. UMPIRE-style workflow.
4. Reading constraints and estimating feasible complexity.
5. Thinking aloud without narrating every keystroke.
6. Stating invariants.
7. Testing and debugging under time pressure.
8. Python built-ins generally acceptable in interviews.
9. How to recover after getting stuck.
10. A pattern-signal primer.
11. 4-, 8-, and 12-week study routes.
12. Diagnostic quiz and starting-point recommendation.

---

## 01 — Python DSA Foundations

### Outcome

Understand Python behavior that changes correctness, runtime, or memory.

### Subsections

- objects, references, mutability, aliasing;
- list over-allocation and amortized append;
- tuple, dict, set, str, deque, heapq;
- hashability and collision assumptions;
- slicing and hidden copies;
- string building with `join`;
- sorting/Timsort and key functions;
- generators and streaming memory;
- recursion limits and iterative alternatives;
- integer and bit behavior;
- shallow versus deep copy;
- Big-O and auxiliary-space conventions;
- type hints for interview code;
- executable assertions and tiny test harnesses.

### Required drills

- predict mutation and aliasing;
- identify hidden O(n) operations;
- choose list vs deque vs set vs dict;
- remove unnecessary copies;
- rewrite recursive code iteratively.

---

## 02 — Arrays

### Foundations

- conceptual fixed array versus Python list;
- list of references, over-allocation, resizing, cache locality;
- `list` vs `array.array` vs `numpy.ndarray` overview;
- index, append, insert, delete, search, slicing, sort;
- arrays vs linked lists;
- in-place mutation vs copy;
- 1D and 2D arrays/matrices;
- memory estimation at interview depth.

### Patterns

- linear scan and running state;
- prefix/suffix products;
- Kadane's algorithm;
- in-place marking;
- reversal/rotation;
- boundary traversal;
- matrix row/column markers;
- sort plus scan;
- partitioning;
- array-as-index.

### Canonical problem ladder — 15

1. LC 121 — Best Time to Buy and Sell Stock
2. LC 217 — Contains Duplicate *(full write-up canonical in Hashing; array lens cross-link here)*
3. LC 238 — Product of Array Except Self
4. LC 53 — Maximum Subarray
5. LC 88 — Merge Sorted Array
6. LC 189 — Rotate Array
7. LC 169 — Majority Element
8. LC 54 — Spiral Matrix
9. LC 73 — Set Matrix Zeroes
10. LC 11 — Container With Most Water *(canonical in Two Pointers)*
11. LC 56 — Merge Intervals *(canonical in Sorting/Intervals)*
12. LC 31 — Next Permutation
13. LC 128 — Longest Consecutive Sequence *(canonical in Hashing)*
14. LC 42 — Trapping Rain Water *(canonical in Two Pointers)*
15. LC 41 — First Missing Positive

### Mandatory interview guidance

- ask whether input is sorted;
- ask about duplicates, negatives, bounded values, and mutation;
- distinguish output space from auxiliary space;
- explain cache locality and Python reference storage;
- compare hash-memory trade-offs with sorting/in-place alternatives;
- test empty, single-element, duplicate-heavy, negative, and already-sorted inputs.

---

## 03 — Linked Lists

### Foundations

- singly, doubly, circular lists;
- Python node object and reference model;
- pointer rewiring and lost references;
- arrays vs linked lists in theory and real systems;
- locality and per-node overhead;
- head, tail, sentinel/dummy nodes;
- traversal, insertion, deletion, search;
- aliasing and accidental cycles.

### Patterns

- dummy head;
- fast/slow pointers;
- in-place reversal;
- merge and split;
- cycle detection;
- one-pass kth-from-end;
- random-pointer cloning;
- k-way merge;
- linked-list merge sort;
- doubly linked list + hash map.

### Canonical problem ladder — 15

1. LC 206 — Reverse Linked List
2. LC 21 — Merge Two Sorted Lists
3. LC 141 — Linked List Cycle
4. LC 142 — Linked List Cycle II
5. LC 19 — Remove Nth Node From End of List
6. LC 143 — Reorder List
7. LC 2 — Add Two Numbers
8. LC 138 — Copy List with Random Pointer
9. LC 160 — Intersection of Two Linked Lists
10. LC 234 — Palindrome Linked List
11. LC 82 — Remove Duplicates from Sorted List II
12. LC 148 — Sort List
13. LC 23 — Merge k Sorted Lists
14. LC 25 — Reverse Nodes in k-Group
15. LC 146 — LRU Cache *(canonical in Data Structure Design; linked-list lens here)*

### Mandatory interview guidance

- preserve `next` before rewiring;
- state the reversed-prefix invariant;
- use a dummy node when the head may change;
- draw nodes for reorder, k-group, and random-pointer problems;
- test one/two nodes, odd/even lengths, head/tail changes, and cycles.

---

## 04 — Hashing

### Foundations

- hash maps and sets;
- average vs worst-case complexity;
- hashability and immutability;
- open addressing at conceptual depth;
- Python dict/set memory overhead;
- insertion order and when it matters;
- counting arrays vs hash maps when values are bounded.

### Patterns

- frequency counting;
- complement lookup;
- seen set;
- prefix sum + map;
- grouping by normalized key;
- bidirectional mapping;
- index/value mapping;
- consecutive-sequence starts.

### Canonical problems — 15

LC 1 Two Sum; 217 Contains Duplicate; 242 Valid Anagram; 49 Group Anagrams; 347 Top K Frequent Elements; 219 Contains Duplicate II; 560 Subarray Sum Equals K; 128 Longest Consecutive Sequence; 383 Ransom Note; 205 Isomorphic Strings; 290 Word Pattern; 387 First Unique Character; 706 Design HashMap; 36 Valid Sudoku; 380 Insert Delete GetRandom O(1) *(canonical in Design)*.

---

## 05 — Strings

### Foundations and patterns

String immutability, Unicode assumptions, slicing, efficient concatenation, normalization, parsing, substring vs subsequence, frequency maps, palindrome pointers, expand-around-center, index-driven parsing, stack decoding, and KMP overview.

### Canonical problems — 15

LC 125 Valid Palindrome; 14 Longest Common Prefix; 3 Longest Substring Without Repeating Characters *(canonical in Sliding Window)*; 424 Longest Repeating Character Replacement *(canonical in Sliding Window)*; 567 Permutation in String *(canonical in Sliding Window)*; 438 Find All Anagrams *(canonical in Sliding Window)*; 76 Minimum Window Substring *(canonical in Sliding Window)*; 5 Longest Palindromic Substring; 647 Palindromic Substrings; 151 Reverse Words in a String; 394 Decode String *(canonical in Stacks)*; 8 String to Integer; 28 Find First Occurrence; 49 Group Anagrams *(canonical in Hashing)*; 165 Compare Version Numbers.

---

## 06 — Two Pointers

### Patterns

Opposite ends, read/write compaction, anchor + pair, merge pointers, fast/slow movement, and partitioning.

### Canonical problems — 15

LC 125 Valid Palindrome; 167 Two Sum II; 283 Move Zeroes; 26 Remove Duplicates; 27 Remove Element; 977 Squares of a Sorted Array; 344 Reverse String; 15 3Sum; 11 Container With Most Water; 42 Trapping Rain Water; 75 Sort Colors; 80 Remove Duplicates II; 392 Is Subsequence; 881 Boats to Save People; 287 Find the Duplicate Number.

---

## 07 — Sliding Window & Prefix Sums

### Patterns

Fixed window, variable window, frequency-constrained window, monotonic deque, prefix sums, prefix sum + hash map, difference arrays, running extrema, and Kadane.

### Canonical problems — 15

LC 643 Maximum Average Subarray I; 3 Longest Substring Without Repeating; 424 Longest Repeating Character Replacement; 567 Permutation in String; 438 Find All Anagrams; 76 Minimum Window Substring; 904 Fruit Into Baskets; 1004 Max Consecutive Ones III; 239 Sliding Window Maximum; 209 Minimum Size Subarray Sum; 560 Subarray Sum Equals K *(canonical in Hashing)*; 525 Contiguous Array; 724 Find Pivot Index; 238 Product Except Self *(canonical in Arrays)*; 53 Maximum Subarray *(canonical in Arrays)*.

---

## 08 — Stacks, Queues & Deques

### Patterns

LIFO/FIFO, matching delimiters, expression evaluation, monotonic stack, monotonic deque, queue-via-stacks, stack-via-queues, and circular buffers.

### Canonical problems — 15

LC 20 Valid Parentheses; 155 Min Stack *(canonical in Design)*; 150 Evaluate Reverse Polish Notation; 739 Daily Temperatures; 496 Next Greater Element I; 84 Largest Rectangle in Histogram; 232 Queue using Stacks; 225 Stack using Queues; 239 Sliding Window Maximum *(canonical in Sliding Window)*; 735 Asteroid Collision; 394 Decode String; 227 Basic Calculator II; 622 Design Circular Queue *(canonical in Design)*; 1047 Remove Adjacent Duplicates; 71 Simplify Path.

---

## 09 — Sorting, Intervals & Selection

### Foundations

Stability, in-place vs extra memory, comparison lower bound, Python Timsort, custom keys/comparators, merge sort, quicksort, quickselect, bucket/counting techniques, interval sorting.

### Canonical problems — 15

Merge sort implementation; quicksort implementation; LC 75 Sort Colors; 215 Kth Largest; 179 Largest Number; 56 Merge Intervals; 57 Insert Interval; 435 Non-overlapping Intervals; 253 Meeting Rooms II; 88 Merge Sorted Array *(canonical in Arrays)*; 347 Top K Frequent via bucket sort *(canonical in Hashing)*; 274 H-Index; 791 Custom Sort String; classic Count Inversions; 324 Wiggle Sort II.

---

## 10 — Binary Search

### Patterns

Exact search, lower/upper bound, rotated array, matrix search, peak finding, and binary search on a monotonic answer.

### Canonical problems — 15

LC 704 Binary Search; 35 Search Insert; 34 First and Last Position; 33 Search Rotated Array; 153 Find Minimum Rotated Array; 74 Search 2D Matrix; 875 Koko Eating Bananas; 1011 Ship Packages; 4 Median of Two Sorted Arrays; 852 Peak Index; 162 Find Peak; 410 Split Array Largest Sum; 981 Time Based Key-Value Store *(canonical in Design)*; 69 Sqrt(x); 275 H-Index II.

---

## 11 — Recursion & Backtracking

### Patterns

Choice tree, choose/explore/unchoose, duplicate handling, pruning, state restoration, recursion-stack analysis, and iterative alternatives.

### Canonical problems — 15

LC 78 Subsets; 90 Subsets II; 46 Permutations; 39 Combination Sum; 40 Combination Sum II; 79 Word Search; 131 Palindrome Partitioning; 51 N-Queens; 22 Generate Parentheses; 17 Phone Letter Combinations; 37 Sudoku Solver; 93 Restore IP Addresses; 77 Combinations; 526 Beautiful Arrangement; 50 Pow(x,n).

---

## 12 — Trees & BSTs

### Foundations and patterns

Recursive/iterative DFS, BFS, subtree aggregation, path state, BST ordering, inorder reasoning, construction, serialization, and lowest common ancestor.

### Canonical problems — 15

LC 104 Max Depth; 226 Invert Tree; 100 Same Tree; 572 Subtree; 235 LCA BST; 236 LCA Binary Tree; 102 Level Order; 199 Right Side View; 98 Validate BST; 230 Kth Smallest; 105 Build from Traversals; 543 Diameter; 110 Balanced Tree; 124 Max Path Sum; 297 Serialize/Deserialize.

---

## 13 — Heaps & Priority Queues

### Patterns

Top K, streaming extrema, two heaps, k-way merge, scheduling, greedy heap selection, and bounded heaps.

### Canonical problems — 15

LC 215 Kth Largest; 703 Kth Largest Stream; 1046 Last Stone Weight; 973 K Closest Points; 621 Task Scheduler; 347 Top K Frequent *(canonical in Hashing)*; 295 Median from Stream; 23 Merge k Lists *(canonical in Linked Lists)*; 767 Reorganize String; 253 Meeting Rooms II *(canonical in Sorting/Intervals)*; 264 Ugly Number II; 480 Sliding Window Median; 355 Design Twitter *(canonical in Design)*; classic Connect Sticks; 502 IPO.

---

## 14 — Tries

### Foundations and patterns

Prefix search, trie node design, memory trade-offs, wildcard search, trie + DFS, compressed representations, and binary trie.

### Canonical problems — 10

LC 208 Implement Trie; 211 Add and Search Words; 212 Word Search II; 648 Replace Words; 720 Longest Word in Dictionary; 421 Maximum XOR; 1268 Search Suggestions; 336 Palindrome Pairs; 676 Magic Dictionary; 745 Prefix and Suffix Search.

---

## 15 — Graphs & Grids

### Foundations and patterns

Adjacency list/matrix, BFS/DFS, visited-state design, grid-as-graph, connected components, multi-source BFS, and unweighted shortest path.

### Canonical problems — 15

LC 200 Number of Islands; 133 Clone Graph; 695 Max Area of Island; 417 Pacific Atlantic; 130 Surrounded Regions; 994 Rotting Oranges; 542 01 Matrix; 127 Word Ladder; 752 Open the Lock; 733 Flood Fill; 1091 Shortest Path Binary Matrix; 463 Island Perimeter; 841 Keys and Rooms; 547 Number of Provinces; 934 Shortest Bridge.

---

## 16 — Advanced Graphs

### Foundations and patterns

Topological sorting, cycle detection, union-find, Dijkstra, Bellman-Ford overview, MST, weighted shortest path, and state-augmented graphs.

### Canonical problems — 15

LC 207 Course Schedule; 210 Course Schedule II; 684 Redundant Connection; 323 Connected Components; 261 Graph Valid Tree; 721 Accounts Merge; 743 Network Delay Time; 787 Cheapest Flights K Stops; 1584 Min Cost to Connect Points; 1631 Path With Minimum Effort; 332 Reconstruct Itinerary; 269 Alien Dictionary; 778 Swim in Rising Water; 399 Evaluate Division; 1462 Course Schedule IV.

---

## 17 — Greedy

### Foundations and patterns

Exchange argument intuition, local-choice proof, interval scheduling, reachability, partitioning, sorting before choosing, and contrast with DP.

### Canonical problems — 15

LC 55 Jump Game; 45 Jump Game II; 134 Gas Station; 435 Non-overlapping Intervals *(canonical in Sorting/Intervals)*; 452 Minimum Arrows; 763 Partition Labels; 621 Task Scheduler *(canonical in Heaps)*; 135 Candy; 122 Stock II; 881 Boats *(canonical in Two Pointers)*; 860 Lemonade Change; 455 Assign Cookies; 767 Reorganize String *(canonical in Heaps)*; 678 Valid Parenthesis String; 846 Hand of Straights.

---

## 18 — Dynamic Programming I: 1D

### Foundations and patterns

State definition, recurrence, base cases, memoization vs tabulation, rolling-state compression, decision DP, subsequence DP preview.

### Canonical problems — 15

LC 70 Climbing Stairs; 746 Min Cost Climbing Stairs; 198 House Robber; 213 House Robber II; 322 Coin Change; 139 Word Break; 300 LIS; 91 Decode Ways; 152 Maximum Product Subarray; 309 Stock with Cooldown; 377 Combination Sum IV; 416 Partition Equal Subset Sum; 279 Perfect Squares; 647 Palindromic Substrings *(canonical in Strings)*; 740 Delete and Earn.

---

## 19 — Dynamic Programming II: 2D & Sequence

### Patterns

Grid DP, sequence alignment, knapsack, interval DP, partition DP, path counting, and memory compression.

### Canonical problems — 15

LC 62 Unique Paths; 63 Unique Paths II; 64 Minimum Path Sum; 1143 LCS; 72 Edit Distance; 115 Distinct Subsequences; 97 Interleaving String; 494 Target Sum; 518 Coin Change II; 1049 Last Stone Weight II; 312 Burst Balloons; 10 Regular Expression Matching; 44 Wildcard Matching; 221 Maximal Square; 329 Longest Increasing Path in Matrix.

---

## 20 — Bit Manipulation, Math & Matrix

### Foundations and patterns

Binary representation, masks, XOR, shifts, overflow assumptions, GCD/LCM, sieve, modular arithmetic, coordinate/matrix traversal, and geometry caveats.

### Canonical problems — 18, divided into three mini-ladders

**Bits:** LC 136, 137, 260, 191, 338, 190, 268, 371.

**Math:** LC 50, 69, 204, 202, 172, 528.

**Matrix/geometry:** LC 48 Rotate Image, 54 Spiral Matrix *(canonical in Arrays)*, 73 Set Matrix Zeroes *(canonical in Arrays)*, 289 Game of Life.

---

## 21 — Data Structure Design

### Foundations and patterns

Translate requirements into operations, combine structures, preserve invariants, reason about amortized complexity, eviction policies, streaming state, snapshots, and API design.

### Canonical problems — 15

LC 155 Min Stack; 225 Stack using Queues; 232 Queue using Stacks; 622 Circular Queue; 641 Circular Deque; 380 Insert Delete GetRandom; 981 Time Based Key-Value Store; 146 LRU Cache; 460 LFU Cache; 295 Median from Stream; 355 Design Twitter; 729 My Calendar I; 1146 Snapshot Array; 1396 Underground System; 2034 Stock Price Fluctuation.

---

## 22 — Python, NumPy & Pandas Performance for DS/AI

### Purpose

Bridge textbook DSA with the practical coding and performance questions asked in Data Science, ML/AI, GenAI, and Python roles.

### Concepts

- list vs tuple vs `array.array` vs `numpy.ndarray`;
- object arrays vs contiguous typed buffers;
- generators and streaming;
- `deque`, `heapq`, `Counter`, `defaultdict`, `bisect`;
- vectorization, broadcasting, and memory contiguity;
- avoiding accidental copies;
- Pandas `iterrows`, `itertuples`, `apply`, and vectorized operations;
- categorical dtype and memory reduction;
- chunked CSV/JSON processing;
- batching and top-k retrieval;
- vectorized cosine similarity;
- measuring before optimizing.

### Practical exercises — 12

1. Memory-efficient stable deduplication.
2. Moving average with a deque.
3. Batch a generator into fixed-size chunks.
4. Stream-parse a large CSV.
5. Stream-parse nested JSON records.
6. Implement a Counter/defaultdict alternative.
7. Brute-force k-nearest neighbors, then optimize top-k with a heap.
8. Vectorized cosine similarity vs Python loop.
9. Replace a slow Pandas row loop.
10. Reduce DataFrame memory with dtype choices.
11. Detect and remove avoidable NumPy copies.
12. Design a bounded in-memory feature cache.

Each exercise includes runtime and memory reasoning, not only code.

---

## 23 — Role Tracks, Mocks & Revision

### Pattern reference

A searchable signal → structure map, for example:

- top K → heap;
- subarray sum → prefix sum + hash map;
- next greater/smaller → monotonic stack;
- shortest path, unweighted → BFS;
- dependency ordering → topological sort;
- count ways / optimize over choices → DP;
- sorted pair/triplet → two pointers;
- monotonic feasibility → binary search on answer;
- dynamic connectivity → union-find.

### Role tracks

Create 30-, 60-, and 90-question sets for:

- Data Science;
- ML/AI/GenAI;
- Python backend;
- SDE.

Every track includes:

- priority chapters;
- recommended order;
- 4-, 8-, and 12-week schedule;
- timed sets;
- review cadence;
- weak-topic remediation;
- final readiness checklist.

### Mock formats

- 15-minute screen;
- 30-minute single problem;
- 45-minute standard interview;
- 60-minute two-problem round;
- debugging round;
- code-review round;
- optimization follow-up round;
- DS/AI practical coding round.

### Revision tools

- mistake log;
- spaced-repetition queue;
- complexity flashcards;
- pattern flashcards;
- weekly mixed assessment;
- final 50-question list;
- confidence/readiness score.

---

## 24 — Advanced DSA (Optional)

### Scope

Fenwick tree, segment tree, coordinate compression, sweep line, advanced monotonic structures, reservoir sampling, meet-in-the-middle, and advanced string matching.

### Canonical problems — 12

LC 307 Range Sum Query Mutable; 315 Count Smaller After Self; 327 Count of Range Sum; 493 Reverse Pairs; 218 Skyline; 699 Falling Squares; 715 Range Module; 732 My Calendar III; 850 Rectangle Area II; 480 Sliding Window Median *(canonical in Heaps)*; 214 Shortest Palindrome; 528 Random Pick with Weight *(canonical in Bit/Math/Matrix)*.

The page must clearly state when these structures are unnecessary for the learner's target role.

---

# 11. Build sequence for Claude Code

Build only the requested milestone and stop.

## Milestone 0 — Shell and infrastructure

- Create the DSA top-level navigation group.
- Create `dsa-prep/index.html` as the compact textbook contents page.
- Create the shared DSA stylesheet and JavaScript.
- Create the question-bank schema with a small sample.
- Create progress/filter primitives.
- Do not generate full chapter content yet.

## Milestone 1 — Interview Strategy and Python Foundations

- Build pages 00 and 01.
- Keep them concise and practical.
- Add diagnostic quiz and study-route selector.

## Milestone 2 — Arrays

- Build the complete Arrays page.
- Include 15 problem entries; full canonical write-ups only where Arrays owns the problem.
- Cross-link problems canonically owned elsewhere.
- Test every original code sample.

## Milestone 3 — Linked Lists

- Build the complete Linked Lists page.
- Include pointer diagrams using lightweight HTML/SVG.
- Test all code and validate cycle-sensitive cases.

## Milestone 4 onward

Proceed in chapter order unless the user requests a different topic.

### Required update after every milestone

- navigation registry;
- DSA contents page;
- question-bank metadata;
- progress counts;
- root-level update note;
- responsive/theme/accessibility checks;
- full project ZIP.

---

# 12. Code quality and verification

## Python requirements

- modern Python 3;
- standard library by default;
- readable type hints where useful;
- no clever one-liners that reduce explainability;
- `deque` for queues;
- `heapq` for heaps;
- never use `list.pop(0)` as a queue solution;
- explain recursion depth;
- copy-paste runnable examples.

## Test requirements for every canonical problem

- published examples rewritten in original wording;
- at least three edge tests;
- one adversarial test where useful;
- brute-force oracle comparison on small random inputs where practical;
- complexity claims checked against actual implementation;
- mutation and output behavior verified.

## Front-end requirements

- no horizontal overflow at 390 px;
- mobile drawer must preserve the earlier overflow fix;
- desktop must be dense and readable at 100% browser zoom;
- chapter contents rail must remain compact and scrollable;
- code blocks must not widen the page;
- keyboard-accessible controls;
- reduced-motion support;
- low-glare dark mode with off-white text;
- meaningful static HTML even if JavaScript is disabled.

---

# 13. Definition of done for a chapter

A chapter is complete only when:

- [ ] navigation and active state work;
- [ ] foundations cover Python behavior, complexity, memory, pros, cons, and alternatives;
- [ ] patterns include signals, invariants, templates, and dry runs;
- [ ] 10–15 curated problems are listed, except Tries where 10 is sufficient;
- [ ] canonical problems have original summaries and complete analyses;
- [ ] duplicate problems cross-link instead of repeating full editorials;
- [ ] code has been executed against tests;
- [ ] brute-force and optimal approaches are compared where meaningful;
- [ ] auxiliary memory, output memory, recursion, and mutation are explicit;
- [ ] interview narration, mistakes, edge cases, and follow-ups are included;
- [ ] review drills and mastery checklist exist;
- [ ] search, filters, progress, and bookmarks work;
- [ ] light/dark and desktop/mobile layouts are checked;
- [ ] existing portal pages remain unaffected.

---

# 14. Copyable Claude Code request template

Use this prompt for one chapter at a time:

```text
Read genai-portal/dsa-prep/PLAN.md and build only Chapter XX: <TITLE>.
Follow the universal chapter template, canonical ownership rules, problem schema,
code testing requirements, UI constraints, and definition of done.
Do not build later chapters. Update navigation, contents, metadata, progress counts,
and the root update note. Run tests and package the complete project as a ZIP.
```

For the first implementation request:

```text
Read genai-portal/dsa-prep/PLAN.md and complete Milestone 0 only.
Create the DSA shell, textbook contents page, shared assets, metadata schema,
and progress/filter primitives. Do not generate full chapter pages yet.
```
