# DSA Interview Preparation — Master Implementation Plan

## 1. Purpose

Add a new **DSA Interview Preparation** section at the very top of the learning portal. It should be a dense, textbook-style, Python-first interview course covering the data structures, algorithms, reusable patterns, and problem-solving habits needed for:

- Software Development Engineer interviews
- Python developer and backend interviews
- Data Science interviews
- Machine Learning and AI Engineer interviews
- GenAI Engineer interviews
- General coding and problem-solving rounds

This document is a build plan only. Implement the course **one section at a time** when explicitly requested. Do not generate every page in one pass.

---

## 2. Scope and interpretation of “all LeetCode questions”

A literal explanation of every LeetCode problem would create thousands of pages and become difficult to study. Build a scalable system with two layers:

1. **Core curriculum:** 10–15 carefully selected problems per topic, each with a complete Python solution, reasoning, complexity analysis, memory optimization notes, tests, interview tips, and follow-ups.
2. **Expandable question catalog:** a searchable metadata registry that can later grow to include every relevant LeetCode problem without requiring a full editorial for every entry.

The first implementation target is approximately **300 high-value questions** across the complete curriculum. The architecture must allow later additions without changing navigation or page structure.

### Content and attribution guardrail

- Show the LeetCode number, title, difficulty, topic tags, and a source link.
- Write a short, original problem summary. Do not copy full proprietary problem statements or official editorials.
- All explanations and code must be original.
- Do not claim that a company asks a question unless a reliable source is supplied. Prefer role-relevance tags such as `SDE`, `Python`, `Data Science`, `ML/AI`, and `GenAI`.

---

## 3. Placement in the existing portal

Insert the new group before **Global Study Plan** in `genai-portal/assets/sitenav.js`.

Suggested registry entry:

```js
{
  id: "dsa",
  label: "DSA Interview Preparation",
  mark: "D",
  blurb: "Patterns · Python · LeetCode",
  home: "genai-portal/dsa-prep/index.html",
  pages: [/* pages listed in Section 8 */]
}
```

The group must be the first visible navigation group on desktop and mobile.

### Visual direction

- Keep the existing premium, dense, textbook-like visual language.
- Use compact chapter rows rather than large marketing cards.
- Keep readable line lengths and restrained glass effects.
- Dark mode should use soft off-white text, low-glare surfaces, and subdued accents.
- Do not increase the overall sidebar width.
- Mobile drawer behavior and previous overflow fixes must remain intact.

---

## 4. Proposed file structure

```text
genai-portal/
  dsa-prep/
    index.html
    00-python-dsa-foundations.html
    01-arrays-hashing.html
    02-linked-lists.html
    03-strings.html
    04-two-pointers.html
    05-sliding-window.html
    06-prefix-sums-kadane.html
    07-sorting-intervals.html
    08-binary-search.html
    09-stacks-monotonic-stack.html
    10-queues-deques.html
    11-heaps-priority-queues.html
    12-recursion-backtracking.html
    13-trees-bst.html
    14-tries.html
    15-graphs-grid.html
    16-topological-union-find-shortest-path.html
    17-greedy.html
    18-dynamic-programming-1d.html
    19-dynamic-programming-2d.html
    20-bit-manipulation.html
    21-math-matrix-geometry.html
    22-data-structure-design.html
    23-advanced-dsa.html
    24-role-based-interview-tracks.html
    25-mock-interviews-revision.html
  assets/
    dsa-prep.css
    dsa-prep.js
    dsa-question-bank.js
```

### Architecture requirements

- Remain framework-free and offline-safe, matching the current portal.
- Reuse `styles.css`, `app.js`, `portal-page.js`, and `sitenav.js` wherever possible.
- `dsa-prep.css` should contain only DSA-specific components.
- `dsa-prep.js` should own filters, expandable solutions, progress, bookmarks, and code-runner-like interactions that do not require a server.
- `dsa-question-bank.js` should be a centralized metadata registry used by search, filters, progress, and role tracks.
- Every page must still contain meaningful static HTML. Do not make core reading content depend entirely on JavaScript.

---

## 5. Standard structure for every topic page

Every topic page should use the same predictable sequence so learners can scan it like a textbook chapter.

### 5.1 Chapter header

- Chapter number and topic title
- One-sentence purpose
- Estimated study time
- Difficulty range
- Prerequisites
- Number of patterns and problems
- Role relevance tags

### 5.2 Topic foundations

1. What the structure or algorithm is
2. How Python represents it
3. Memory layout or conceptual memory model
4. Core operations
5. Time-complexity table
6. Auxiliary-space table
7. Advantages and disadvantages
8. When to use it
9. When not to use it
10. Common Python-specific pitfalls

### 5.3 Python implementation

- Minimal implementation from scratch when educationally useful
- Idiomatic standard-library version
- Mutation versus copying behavior
- Shallow versus deep copy where relevant
- Recursion-depth or integer-behavior caveats where relevant
- Short executable examples and assertions

### 5.4 Reusable interview patterns

For each pattern include:

- Recognition signals in a prompt
- Core invariant
- Template code
- Dry run
- Time and space complexity
- Failure modes
- Closely related patterns

### 5.5 Problem ladder

Each topic must contain 10–15 primary problems ordered as:

- Foundation
- Easy pattern recognition
- Medium pattern combination
- Advanced or hard
- One or two role-specific variants

### 5.6 Interview playbook

- Clarifying questions to ask
- How to describe the brute-force solution
- How to derive the optimal solution
- What invariant to say aloud
- Edge cases to mention before coding
- How to test manually
- Common follow-up questions
- Signals that suggest a different data structure

### 5.7 Review section

- One-page cheat sheet
- Five rapid-fire concept checks
- Three code-completion drills
- Two debugging exercises
- One timed mixed problem
- Mastery checklist
- Links to the next recommended chapters

---

## 6. Standard schema for every problem write-up

Each fully explained problem must follow this exact structure.

```text
Problem number and title
Source and direct link
Difficulty
Primary topic
Secondary patterns
Role relevance
Estimated interview time

Original problem summary
Clarifying questions
Constraints that affect the approach
Examples written in original wording

Brute-force approach
Why it works
Time complexity
Auxiliary space
Why it may fail at scale

Optimal approach
Recognition signal
Invariant
Step-by-step reasoning
Dry run table

Python 3 solution
Line-by-line explanation
Time complexity
Auxiliary space
Total output space if applicable
Memory optimization notes
Mutation and side-effect notes

Edge cases
Minimal tests
Adversarial tests
Common mistakes
Follow-up variants
How to explain it in an interview
```

### Memory-optimization standard

Do not label a solution “memory optimized” without a comparison. State all of the following:

- Baseline auxiliary memory
- Optimized auxiliary memory
- Whether input mutation is required
- Whether output storage is excluded from auxiliary-space analysis
- Whether recursion adds call-stack memory
- Any Python object-overhead caveat

Prefer readable optimal solutions over obscure micro-optimizations.

---

## 7. Shared product features

### 7.1 Textbook contents view

The DSA landing page should resemble a compact book contents page:

- chapter number
- topic name
- short skill description
- completion state
- problem count
- estimated time
- difficulty distribution

### 7.2 Search and filters

Support filtering by:

- Topic
- Pattern
- Difficulty
- Role
- Status: not started, learning, solved, review
- Time target: 15, 30, 45, 60 minutes
- Memory pattern: in-place, O(1), O(n), recursion

### 7.3 Progress model

Use local storage and preserve the current portal’s offline behavior.

Track:

- chapter completion
- problem status
- confidence from 1 to 5
- last reviewed date
- next review date
- bookmarked problems
- failed attempts
- notes

### 7.4 Problem list behavior

- Default state is a compact row, not a large card.
- Expand to show reasoning and code.
- Allow “hide solution” mode.
- Allow “show hint 1 / hint 2 / full approach” progressive disclosure.
- Add copy buttons to code blocks.
- Keep keyboard navigation accessible.

### 7.5 Question-bank metadata shape

```js
{
  id: "lc-1",
  source: "LeetCode",
  number: 1,
  title: "Two Sum",
  slug: "two-sum",
  difficulty: "Easy",
  primaryTopic: "Arrays & Hashing",
  patterns: ["Hash map", "Complement lookup"],
  roles: ["SDE", "Python", "Data Science", "ML/AI", "GenAI"],
  studyOrder: 1,
  estimatedMinutes: 20,
  page: "01-arrays-hashing.html",
  anchor: "lc-1-two-sum",
  hasFullSolution: true
}
```

---

## 8. Navigation and chapter order

Use this order in the new top-level navigation group.

| No. | Page | Navigation title | Track |
|---:|---|---|---|
| 00 | `index.html` | DSA Roadmap | Start Here |
| 01 | `00-python-dsa-foundations.html` | Python DSA Foundations | Foundations |
| 02 | `01-arrays-hashing.html` | Arrays & Hashing | Linear Structures |
| 03 | `02-linked-lists.html` | Linked Lists | Linear Structures |
| 04 | `03-strings.html` | Strings | Linear Structures |
| 05 | `04-two-pointers.html` | Two Pointers | Array Patterns |
| 06 | `05-sliding-window.html` | Sliding Window | Array Patterns |
| 07 | `06-prefix-sums-kadane.html` | Prefix Sums & Kadane | Array Patterns |
| 08 | `07-sorting-intervals.html` | Sorting & Intervals | Search & Order |
| 09 | `08-binary-search.html` | Binary Search | Search & Order |
| 10 | `09-stacks-monotonic-stack.html` | Stacks | Linear Structures |
| 11 | `10-queues-deques.html` | Queues & Deques | Linear Structures |
| 12 | `11-heaps-priority-queues.html` | Heaps & Priority Queues | Search & Order |
| 13 | `12-recursion-backtracking.html` | Recursion & Backtracking | Search Spaces |
| 14 | `13-trees-bst.html` | Trees & BSTs | Trees & Graphs |
| 15 | `14-tries.html` | Tries | Trees & Graphs |
| 16 | `15-graphs-grid.html` | Graphs & Grids | Trees & Graphs |
| 17 | `16-topological-union-find-shortest-path.html` | Advanced Graph Patterns | Trees & Graphs |
| 18 | `17-greedy.html` | Greedy Algorithms | Optimization |
| 19 | `18-dynamic-programming-1d.html` | Dynamic Programming I | Optimization |
| 20 | `19-dynamic-programming-2d.html` | Dynamic Programming II | Optimization |
| 21 | `20-bit-manipulation.html` | Bit Manipulation | Specialist Topics |
| 22 | `21-math-matrix-geometry.html` | Math, Matrix & Geometry | Specialist Topics |
| 23 | `22-data-structure-design.html` | Data Structure Design | System Thinking |
| 24 | `23-advanced-dsa.html` | Advanced DSA | Specialist Topics |
| 25 | `24-role-based-interview-tracks.html` | Role-Based Tracks | Interview Practice |
| 26 | `25-mock-interviews-revision.html` | Mocks & Revision | Interview Practice |

---

# 9. Detailed chapter plans

## Chapter 00 — DSA Roadmap

### Goal

Give learners a clear study path and prevent random problem grinding.

### Subsections

1. How coding interviews are evaluated
2. DSA versus pattern recognition
3. How to read constraints
4. How to choose a data structure
5. Big-O decision guide
6. A repeatable interview workflow
7. Recommended chapter order
8. Four-week, eight-week, and twelve-week plans
9. Role-specific starting points
10. How to use hints without memorizing solutions
11. Spaced repetition and review schedule
12. Readiness checklist

### Required overview tools

- Topic dependency map
- Pattern-to-signal table
- Complexity cheat sheet
- Interview answer framework: clarify → brute force → optimize → code → test
- Diagnostic quiz that recommends a starting chapter

---

## Chapter 01 — Python DSA Foundations

### Goal

Teach the Python behaviors that directly affect algorithm correctness, complexity, and memory.

### Subsections

1. Python objects, references, and mutability
2. `list`, `tuple`, `dict`, `set`, `str`, `deque`, and `heapq`
3. Python list over-allocation and amortized append
4. Hashability and dictionary/set behavior
5. String immutability and efficient building with `join`
6. Slicing costs
7. Sorting behavior and key functions
8. Iterators, generators, and memory use
9. Recursion limits and iterative alternatives
10. Integer behavior and bit operations
11. Shallow versus deep copy
12. Common hidden O(n) operations
13. Big-O and auxiliary-space conventions
14. Writing testable interview code
15. Python typing without overcomplicating interview solutions

### Required drills

- Predict the output and mutation behavior
- Identify hidden copies
- Replace inefficient list operations
- Choose between list, deque, set, and dict
- Rewrite recursive code iteratively

---

## Chapter 02 — Arrays & Hashing

### Foundations

1. What an array is conceptually
2. Python `list` versus fixed typed arrays and NumPy arrays
3. Contiguous storage concept, references, cache locality, and resizing
4. Indexing, append, insert, delete, search, and sort complexity
5. Advantages and disadvantages
6. Arrays versus linked lists
7. Hash maps and hash sets
8. Collision concept and average versus worst-case complexity
9. Memory overhead of Python containers
10. In-place mutation and copying

### Reusable patterns

- Frequency counting
- Complement lookup
- Index mapping
- Prefix and suffix products
- In-place marking
- Cyclic placement
- Kadane’s algorithm
- Sorting plus scan
- Hash-set membership
- Consecutive-sequence expansion

### Core problem ladder

1. LeetCode 1 — Two Sum
2. LeetCode 217 — Contains Duplicate
3. LeetCode 242 — Valid Anagram
4. LeetCode 49 — Group Anagrams
5. LeetCode 347 — Top K Frequent Elements
6. LeetCode 238 — Product of Array Except Self
7. LeetCode 36 — Valid Sudoku
8. LeetCode 128 — Longest Consecutive Sequence
9. LeetCode 121 — Best Time to Buy and Sell Stock
10. LeetCode 53 — Maximum Subarray
11. LeetCode 169 — Majority Element
12. LeetCode 189 — Rotate Array
13. LeetCode 560 — Subarray Sum Equals K
14. LeetCode 41 — First Missing Positive
15. LeetCode 88 — Merge Sorted Array

### Interview playbook

- Ask whether input can be modified.
- Check whether values are bounded; this may replace a hash map with an array.
- Separate auxiliary space from output space.
- Explain Python dictionary/set average-case assumptions.
- Mention cache locality when comparing arrays with linked lists.
- Always test empty, one-element, duplicate-heavy, negative, and already-sorted inputs.

---

## Chapter 03 — Linked Lists

### Foundations

1. Singly, doubly, and circular linked lists
2. Node memory model in Python
3. Pointer/reference manipulation
4. Arrays versus linked lists
5. Where linked lists are better
6. Where arrays are better due to locality and lower overhead
7. Head, tail, sentinel, and dummy nodes
8. Insert, delete, search, and traversal complexity
9. Ownership, aliasing, and accidental cycles
10. Building a minimal `ListNode`

### Reusable patterns

- Dummy head
- Fast and slow pointers
- In-place reversal
- Merge two lists
- Split and reconnect
- Cycle detection
- Two-pass versus one-pass deletion
- K-way merge
- Random-pointer cloning
- Merge sort on linked lists

### Core problem ladder

1. LeetCode 206 — Reverse Linked List
2. LeetCode 21 — Merge Two Sorted Lists
3. LeetCode 141 — Linked List Cycle
4. LeetCode 142 — Linked List Cycle II
5. LeetCode 19 — Remove Nth Node From End of List
6. LeetCode 143 — Reorder List
7. LeetCode 2 — Add Two Numbers
8. LeetCode 138 — Copy List with Random Pointer
9. LeetCode 160 — Intersection of Two Linked Lists
10. LeetCode 234 — Palindrome Linked List
11. LeetCode 82 — Remove Duplicates from Sorted List II
12. LeetCode 148 — Sort List
13. LeetCode 23 — Merge k Sorted Lists
14. LeetCode 25 — Reverse Nodes in k-Group
15. LeetCode 146 — LRU Cache, cross-linked with Data Structure Design

### Interview playbook

- Draw nodes and arrows before coding.
- State which references will be lost after reassignment.
- Prefer a dummy node when head deletion or insertion is possible.
- Verify acyclic output after rewiring.
- Test one node, two nodes, odd/even length, and operations involving the head or tail.

---

## Chapter 04 — Strings

### Foundations

1. Python string immutability
2. Unicode, code points, and interview assumptions
3. Indexing and slicing costs
4. Efficient concatenation
5. Character counting
6. Normalization and case handling
7. Palindromes
8. Substrings versus subsequences
9. Parsing and state machines
10. Rolling hash and pattern matching overview

### Reusable patterns

- Character frequency maps
- Two-pointer palindrome checks
- Sliding windows
- Expand around center
- Stack-based decoding
- Parsing with indexes
- Prefix-function or KMP introduction

### Core problem ladder

1. LeetCode 125 — Valid Palindrome
2. LeetCode 14 — Longest Common Prefix
3. LeetCode 242 — Valid Anagram
4. LeetCode 3 — Longest Substring Without Repeating Characters
5. LeetCode 424 — Longest Repeating Character Replacement
6. LeetCode 567 — Permutation in String
7. LeetCode 438 — Find All Anagrams in a String
8. LeetCode 76 — Minimum Window Substring
9. LeetCode 5 — Longest Palindromic Substring
10. LeetCode 647 — Palindromic Substrings
11. LeetCode 151 — Reverse Words in a String
12. LeetCode 394 — Decode String
13. LeetCode 8 — String to Integer (atoi)
14. LeetCode 28 — Find the Index of the First Occurrence in a String
15. LeetCode 49 — Group Anagrams, cross-linked with Arrays & Hashing

---

## Chapter 05 — Two Pointers

### Foundations and signals

- Sorted input
- Pair or triplet target
- Opposite-end comparison
- In-place compaction
- Partitioning
- Palindrome validation
- Fast/slow movement

### Patterns

- Left/right convergence
- Read/write pointers
- Fixed anchor plus moving pair
- Merge pointers
- Fast and slow pointers
- Partition around a value

### Core problem ladder

1. LeetCode 125 — Valid Palindrome
2. LeetCode 167 — Two Sum II — Input Array Is Sorted
3. LeetCode 283 — Move Zeroes
4. LeetCode 26 — Remove Duplicates from Sorted Array
5. LeetCode 27 — Remove Element
6. LeetCode 977 — Squares of a Sorted Array
7. LeetCode 344 — Reverse String
8. LeetCode 392 — Is Subsequence
9. LeetCode 680 — Valid Palindrome II
10. LeetCode 15 — 3Sum
11. LeetCode 16 — 3Sum Closest
12. LeetCode 11 — Container With Most Water
13. LeetCode 75 — Sort Colors
14. LeetCode 88 — Merge Sorted Array
15. LeetCode 42 — Trapping Rain Water

---

## Chapter 06 — Sliding Window

### Foundations and signals

- Contiguous subarray or substring
- Longest or shortest valid range
- At most or exactly K conditions
- Fixed-size versus variable-size windows
- Frequency or count constraints

### Patterns

- Fixed window
- Expand and shrink
- Count map with validity condition
- At most K to exactly K transformation
- Monotonic deque window

### Core problem ladder

1. LeetCode 643 — Maximum Average Subarray I
2. LeetCode 121 — Best Time to Buy and Sell Stock
3. LeetCode 3 — Longest Substring Without Repeating Characters
4. LeetCode 209 — Minimum Size Subarray Sum
5. LeetCode 567 — Permutation in String
6. LeetCode 438 — Find All Anagrams in a String
7. LeetCode 424 — Longest Repeating Character Replacement
8. LeetCode 1004 — Max Consecutive Ones III
9. LeetCode 904 — Fruit Into Baskets
10. LeetCode 713 — Subarray Product Less Than K
11. LeetCode 1456 — Maximum Number of Vowels in a Substring of Given Length
12. LeetCode 1208 — Get Equal Substrings Within Budget
13. LeetCode 76 — Minimum Window Substring
14. LeetCode 239 — Sliding Window Maximum
15. LeetCode 30 — Substring with Concatenation of All Words

---

## Chapter 07 — Prefix Sums, Difference Arrays & Kadane

### Foundations

1. Prefix sums
2. Prefix frequency maps
3. Suffix accumulation
4. Difference arrays
5. Two-dimensional prefix sums
6. Kadane’s algorithm
7. Circular subarrays
8. Prefix XOR

### Core problem ladder

1. LeetCode 303 — Range Sum Query — Immutable
2. LeetCode 724 — Find Pivot Index
3. LeetCode 560 — Subarray Sum Equals K
4. LeetCode 525 — Contiguous Array
5. LeetCode 974 — Subarray Sums Divisible by K
6. LeetCode 53 — Maximum Subarray
7. LeetCode 152 — Maximum Product Subarray
8. LeetCode 918 — Maximum Sum Circular Subarray
9. LeetCode 304 — Range Sum Query 2D — Immutable
10. LeetCode 1074 — Number of Submatrices That Sum to Target
11. LeetCode 1109 — Corporate Flight Bookings
12. LeetCode 1094 — Car Pooling
13. LeetCode 1310 — XOR Queries of a Subarray
14. LeetCode 2270 — Number of Ways to Split Array
15. LeetCode 238 — Product of Array Except Self

---

## Chapter 08 — Sorting & Intervals

### Foundations

1. Stable versus unstable sorting
2. Python Timsort and `key=`
3. Comparison versus non-comparison sorting
4. Custom ordering
5. Interval normalization
6. Sorting by start versus end
7. Sweep-line introduction
8. In-place versus copied sorting

### Core problem ladder

1. LeetCode 88 — Merge Sorted Array
2. LeetCode 75 — Sort Colors
3. LeetCode 56 — Merge Intervals
4. LeetCode 57 — Insert Interval
5. LeetCode 435 — Non-overlapping Intervals
6. LeetCode 452 — Minimum Number of Arrows to Burst Balloons
7. LeetCode 986 — Interval List Intersections
8. LeetCode 1288 — Remove Covered Intervals
9. LeetCode 729 — My Calendar I
10. LeetCode 1094 — Car Pooling
11. LeetCode 215 — Kth Largest Element in an Array
12. LeetCode 148 — Sort List
13. LeetCode 179 — Largest Number
14. LeetCode 252 — Meeting Rooms
15. LeetCode 253 — Meeting Rooms II

---

## Chapter 09 — Binary Search

### Foundations

1. Exact search
2. Lower bound and upper bound
3. First true / last false templates
4. Rotated arrays
5. Search on answer
6. Matrix search
7. Floating-point or integer convergence
8. Overflow-safe midpoint concept, even though Python integers do not overflow

### Core problem ladder

1. LeetCode 704 — Binary Search
2. LeetCode 35 — Search Insert Position
3. LeetCode 69 — Sqrt(x)
4. LeetCode 34 — Find First and Last Position of Element in Sorted Array
5. LeetCode 74 — Search a 2D Matrix
6. LeetCode 153 — Find Minimum in Rotated Sorted Array
7. LeetCode 33 — Search in Rotated Sorted Array
8. LeetCode 81 — Search in Rotated Sorted Array II
9. LeetCode 162 — Find Peak Element
10. LeetCode 875 — Koko Eating Bananas
11. LeetCode 1011 — Capacity to Ship Packages Within D Days
12. LeetCode 410 — Split Array Largest Sum
13. LeetCode 981 — Time Based Key-Value Store
14. LeetCode 378 — Kth Smallest Element in a Sorted Matrix
15. LeetCode 4 — Median of Two Sorted Arrays

---

## Chapter 10 — Stacks & Monotonic Stacks

### Foundations

1. LIFO behavior
2. Python list as a stack
3. Expression evaluation
4. Matching delimiters
5. Monotonic increasing and decreasing stacks
6. Next greater or smaller element
7. Stack versus recursion

### Core problem ladder

1. LeetCode 20 — Valid Parentheses
2. LeetCode 155 — Min Stack
3. LeetCode 150 — Evaluate Reverse Polish Notation
4. LeetCode 71 — Simplify Path
5. LeetCode 394 — Decode String
6. LeetCode 496 — Next Greater Element I
7. LeetCode 503 — Next Greater Element II
8. LeetCode 739 — Daily Temperatures
9. LeetCode 901 — Online Stock Span
10. LeetCode 853 — Car Fleet
11. LeetCode 402 — Remove K Digits
12. LeetCode 316 — Remove Duplicate Letters
13. LeetCode 84 — Largest Rectangle in Histogram
14. LeetCode 224 — Basic Calculator
15. LeetCode 22 — Generate Parentheses, cross-linked with Backtracking

---

## Chapter 11 — Queues & Deques

### Foundations

1. FIFO behavior
2. Why `list.pop(0)` is inefficient
3. `collections.deque`
4. Circular queues
5. Monotonic deques
6. Producer-consumer concept
7. Queue simulation

### Core problem ladder

1. LeetCode 232 — Implement Queue using Stacks
2. LeetCode 225 — Implement Stack using Queues
3. LeetCode 933 — Number of Recent Calls
4. LeetCode 622 — Design Circular Queue
5. LeetCode 641 — Design Circular Deque
6. LeetCode 1700 — Number of Students Unable to Eat Lunch
7. LeetCode 2073 — Time Needed to Buy Tickets
8. LeetCode 649 — Dota2 Senate
9. LeetCode 950 — Reveal Cards In Increasing Order
10. LeetCode 239 — Sliding Window Maximum
11. LeetCode 1438 — Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit
12. LeetCode 862 — Shortest Subarray with Sum at Least K
13. LeetCode 1670 — Design Front Middle Back Queue
14. LeetCode 346 — Moving Average from Data Stream
15. LeetCode 281 — Zigzag Iterator

---

## Chapter 12 — Heaps & Priority Queues

### Foundations

1. Heap invariant
2. Min heap and max heap emulation in Python
3. `heapq` operations
4. Top K
5. K-way merge
6. Streaming median
7. Scheduling
8. Lazy deletion

### Core problem ladder

1. LeetCode 1046 — Last Stone Weight
2. LeetCode 703 — Kth Largest Element in a Stream
3. LeetCode 215 — Kth Largest Element in an Array
4. LeetCode 973 — K Closest Points to Origin
5. LeetCode 347 — Top K Frequent Elements
6. LeetCode 373 — Find K Pairs with Smallest Sums
7. LeetCode 23 — Merge k Sorted Lists
8. LeetCode 621 — Task Scheduler
9. LeetCode 767 — Reorganize String
10. LeetCode 295 — Find Median from Data Stream
11. LeetCode 378 — Kth Smallest Element in a Sorted Matrix
12. LeetCode 1834 — Single-Threaded CPU
13. LeetCode 502 — IPO
14. LeetCode 857 — Minimum Cost to Hire K Workers
15. LeetCode 355 — Design Twitter

---

## Chapter 13 — Recursion & Backtracking

### Foundations

1. Call stack and base cases
2. State, choices, and undo
3. Decision trees
4. Subsets, permutations, and combinations
5. Pruning
6. Duplicate handling
7. Memoization versus backtracking
8. Python recursion-depth limits

### Core problem ladder

1. LeetCode 78 — Subsets
2. LeetCode 90 — Subsets II
3. LeetCode 46 — Permutations
4. LeetCode 47 — Permutations II
5. LeetCode 77 — Combinations
6. LeetCode 39 — Combination Sum
7. LeetCode 40 — Combination Sum II
8. LeetCode 17 — Letter Combinations of a Phone Number
9. LeetCode 22 — Generate Parentheses
10. LeetCode 79 — Word Search
11. LeetCode 131 — Palindrome Partitioning
12. LeetCode 93 — Restore IP Addresses
13. LeetCode 51 — N-Queens
14. LeetCode 37 — Sudoku Solver
15. LeetCode 698 — Partition to K Equal Sum Subsets

---

## Chapter 14 — Trees & Binary Search Trees

### Foundations

1. Tree vocabulary
2. Binary trees and BSTs
3. Depth-first traversals
4. Breadth-first traversal
5. Recursive and iterative traversal
6. Height, depth, and balance
7. Subtree reasoning
8. BST ordering invariant
9. Construction and serialization
10. Tree memory and recursion considerations

### Core problem ladder

1. LeetCode 226 — Invert Binary Tree
2. LeetCode 104 — Maximum Depth of Binary Tree
3. LeetCode 100 — Same Tree
4. LeetCode 110 — Balanced Binary Tree
5. LeetCode 543 — Diameter of Binary Tree
6. LeetCode 572 — Subtree of Another Tree
7. LeetCode 102 — Binary Tree Level Order Traversal
8. LeetCode 199 — Binary Tree Right Side View
9. LeetCode 1448 — Count Good Nodes in Binary Tree
10. LeetCode 98 — Validate Binary Search Tree
11. LeetCode 230 — Kth Smallest Element in a BST
12. LeetCode 235 — Lowest Common Ancestor of a BST
13. LeetCode 236 — Lowest Common Ancestor of a Binary Tree
14. LeetCode 105 — Construct Binary Tree from Preorder and Inorder Traversal
15. LeetCode 124 — Binary Tree Maximum Path Sum
16. LeetCode 297 — Serialize and Deserialize Binary Tree

Use 15 primary cards and make the remaining item an advanced bonus if page density requires it.

---

## Chapter 15 — Tries

### Foundations

1. Prefix trees
2. Node representations
3. Dictionary versus fixed alphabet array children
4. Insert, search, and prefix complexity
5. Memory trade-offs
6. Wildcard search
7. Trie plus DFS
8. Bitwise trie

### Core problem ladder

1. LeetCode 208 — Implement Trie (Prefix Tree)
2. LeetCode 211 — Design Add and Search Words Data Structure
3. LeetCode 648 — Replace Words
4. LeetCode 677 — Map Sum Pairs
5. LeetCode 720 — Longest Word in Dictionary
6. LeetCode 1268 — Search Suggestions System
7. LeetCode 212 — Word Search II
8. LeetCode 421 — Maximum XOR of Two Numbers in an Array
9. LeetCode 472 — Concatenated Words
10. LeetCode 1032 — Stream of Characters
11. LeetCode 745 — Prefix and Suffix Search
12. LeetCode 1804 — Implement Trie II (Prefix Tree)
13. LeetCode 2416 — Sum of Prefix Scores of Strings
14. LeetCode 3043 — Find the Length of the Longest Common Prefix
15. LeetCode 3093 — Longest Common Suffix Queries

---

## Chapter 16 — Graphs & Grid Traversal

### Foundations

1. Graph vocabulary
2. Directed versus undirected
3. Weighted versus unweighted
4. Adjacency lists and matrices
5. BFS and DFS
6. Connected components
7. Grid-as-graph modeling
8. Visited sets and in-place marking
9. Multi-source BFS
10. Bipartite checking

### Core problem ladder

1. LeetCode 733 — Flood Fill
2. LeetCode 200 — Number of Islands
3. LeetCode 695 — Max Area of Island
4. LeetCode 133 — Clone Graph
5. LeetCode 1971 — Find if Path Exists in Graph
6. LeetCode 547 — Number of Provinces
7. LeetCode 130 — Surrounded Regions
8. LeetCode 417 — Pacific Atlantic Water Flow
9. LeetCode 994 — Rotting Oranges
10. LeetCode 542 — 01 Matrix
11. LeetCode 752 — Open the Lock
12. LeetCode 127 — Word Ladder
13. LeetCode 785 — Is Graph Bipartite?
14. LeetCode 399 — Evaluate Division
15. LeetCode 286 — Walls and Gates

---

## Chapter 17 — Topological Sort, Union-Find & Shortest Paths

### Foundations

1. Directed acyclic graphs
2. Kahn’s algorithm
3. DFS cycle detection
4. Disjoint-set union
5. Path compression and union by rank/size
6. Minimum spanning trees
7. Dijkstra’s algorithm
8. Bellman-Ford concept
9. Shortest path with constraints
10. Eulerian path overview

### Core problem ladder

1. LeetCode 207 — Course Schedule
2. LeetCode 210 — Course Schedule II
3. LeetCode 684 — Redundant Connection
4. LeetCode 261 — Graph Valid Tree
5. LeetCode 323 — Number of Connected Components in an Undirected Graph
6. LeetCode 721 — Accounts Merge
7. LeetCode 990 — Satisfiability of Equality Equations
8. LeetCode 743 — Network Delay Time
9. LeetCode 787 — Cheapest Flights Within K Stops
10. LeetCode 1514 — Path with Maximum Probability
11. LeetCode 1631 — Path With Minimum Effort
12. LeetCode 1584 — Min Cost to Connect All Points
13. LeetCode 778 — Swim in Rising Water
14. LeetCode 332 — Reconstruct Itinerary
15. LeetCode 269 — Alien Dictionary

---

## Chapter 18 — Greedy Algorithms

### Foundations

1. Greedy-choice property
2. Proving a local choice
3. Sorting before greedy selection
4. Reachability
5. Interval scheduling
6. Resource assignment
7. Greedy versus dynamic programming
8. Counterexample testing

### Core problem ladder

1. LeetCode 122 — Best Time to Buy and Sell Stock II
2. LeetCode 55 — Jump Game
3. LeetCode 45 — Jump Game II
4. LeetCode 134 — Gas Station
5. LeetCode 846 — Hand of Straights
6. LeetCode 1899 — Merge Triplets to Form Target Triplet
7. LeetCode 763 — Partition Labels
8. LeetCode 678 — Valid Parenthesis String
9. LeetCode 435 — Non-overlapping Intervals
10. LeetCode 452 — Minimum Number of Arrows to Burst Balloons
11. LeetCode 621 — Task Scheduler
12. LeetCode 881 — Boats to Save People
13. LeetCode 1029 — Two City Scheduling
14. LeetCode 406 — Queue Reconstruction by Height
15. LeetCode 135 — Candy

---

## Chapter 19 — Dynamic Programming I: One-Dimensional

### Foundations

1. Recognizing overlapping subproblems
2. State and transition
3. Top-down versus bottom-up
4. Base cases
5. Rolling-state memory optimization
6. Reconstruction versus value-only DP
7. DP versus greedy

### Core problem ladder

1. LeetCode 70 — Climbing Stairs
2. LeetCode 746 — Min Cost Climbing Stairs
3. LeetCode 198 — House Robber
4. LeetCode 213 — House Robber II
5. LeetCode 91 — Decode Ways
6. LeetCode 139 — Word Break
7. LeetCode 322 — Coin Change
8. LeetCode 377 — Combination Sum IV
9. LeetCode 279 — Perfect Squares
10. LeetCode 300 — Longest Increasing Subsequence
11. LeetCode 416 — Partition Equal Subset Sum
12. LeetCode 152 — Maximum Product Subarray
13. LeetCode 309 — Best Time to Buy and Sell Stock with Cooldown
14. LeetCode 5 — Longest Palindromic Substring
15. LeetCode 647 — Palindromic Substrings

---

## Chapter 20 — Dynamic Programming II: Two-Dimensional & Sequence DP

### Foundations

1. Grid DP
2. Sequence alignment
3. Subsequence DP
4. Knapsack variants
5. Interval DP
6. State compression
7. Memoization key design
8. Reconstruction and parent pointers

### Core problem ladder

1. LeetCode 62 — Unique Paths
2. LeetCode 64 — Minimum Path Sum
3. LeetCode 931 — Minimum Falling Path Sum
4. LeetCode 221 — Maximal Square
5. LeetCode 1143 — Longest Common Subsequence
6. LeetCode 72 — Edit Distance
7. LeetCode 97 — Interleaving String
8. LeetCode 115 — Distinct Subsequences
9. LeetCode 494 — Target Sum
10. LeetCode 518 — Coin Change II
11. LeetCode 10 — Regular Expression Matching
12. LeetCode 44 — Wildcard Matching
13. LeetCode 312 — Burst Balloons
14. LeetCode 329 — Longest Increasing Path in a Matrix
15. LeetCode 1463 — Cherry Pickup II

---

## Chapter 21 — Bit Manipulation

### Foundations

1. Binary representation
2. AND, OR, XOR, NOT
3. Shifts
4. Masks
5. Two’s complement concept
6. Set, clear, toggle, and test a bit
7. XOR cancellation
8. Bit-count tricks
9. Bitmask subsets
10. Python’s unbounded integers and masking caveats

### Core problem ladder

1. LeetCode 136 — Single Number
2. LeetCode 191 — Number of 1 Bits
3. LeetCode 338 — Counting Bits
4. LeetCode 190 — Reverse Bits
5. LeetCode 268 — Missing Number
6. LeetCode 371 — Sum of Two Integers
7. LeetCode 201 — Bitwise AND of Numbers Range
8. LeetCode 137 — Single Number II
9. LeetCode 260 — Single Number III
10. LeetCode 89 — Gray Code
11. LeetCode 1310 — XOR Queries of a Subarray
12. LeetCode 421 — Maximum XOR of Two Numbers in an Array
13. LeetCode 78 — Subsets using a bitmask
14. LeetCode 1863 — Sum of All Subset XOR Totals
15. LeetCode 7 — Reverse Integer as an overflow-awareness companion problem

---

## Chapter 22 — Math, Matrix & Geometry

### Foundations

1. Modular arithmetic
2. GCD and LCM
3. Prime checks and sieves
4. Coordinate geometry
5. Matrix traversal
6. In-place matrix transforms
7. Numeric parsing
8. Fast exponentiation
9. Overflow concepts across languages
10. Precision considerations

### Core problem ladder

1. LeetCode 66 — Plus One
2. LeetCode 202 — Happy Number
3. LeetCode 9 — Palindrome Number
4. LeetCode 13 — Roman to Integer
5. LeetCode 12 — Integer to Roman
6. LeetCode 48 — Rotate Image
7. LeetCode 54 — Spiral Matrix
8. LeetCode 73 — Set Matrix Zeroes
9. LeetCode 50 — Pow(x, n)
10. LeetCode 43 — Multiply Strings
11. LeetCode 29 — Divide Two Integers
12. LeetCode 204 — Count Primes
13. LeetCode 149 — Max Points on a Line
14. LeetCode 593 — Valid Square
15. LeetCode 1232 — Check If It Is a Straight Line

---

## Chapter 23 — Data Structure Design

### Foundations

1. Translating requirements into operations
2. Choosing combined structures
3. Amortized complexity
4. Eviction policies
5. Streaming state
6. Snapshotting and versioning
7. API invariants
8. Thread-safety discussion without overengineering the coding-round solution

### Core problem ladder

1. LeetCode 155 — Min Stack
2. LeetCode 225 — Implement Stack using Queues
3. LeetCode 232 — Implement Queue using Stacks
4. LeetCode 622 — Design Circular Queue
5. LeetCode 641 — Design Circular Deque
6. LeetCode 380 — Insert Delete GetRandom O(1)
7. LeetCode 981 — Time Based Key-Value Store
8. LeetCode 146 — LRU Cache
9. LeetCode 460 — LFU Cache
10. LeetCode 295 — Find Median from Data Stream
11. LeetCode 355 — Design Twitter
12. LeetCode 729 — My Calendar I
13. LeetCode 1146 — Snapshot Array
14. LeetCode 1396 — Design Underground System
15. LeetCode 2034 — Stock Price Fluctuation

---

## Chapter 24 — Advanced DSA

### Foundations

1. Fenwick trees
2. Segment trees
3. Coordinate compression
4. Sweep line
5. Ordered-statistics concepts
6. Advanced monotonic structures
7. Advanced string matching
8. Randomized algorithms and reservoir sampling
9. Meet-in-the-middle
10. When advanced structures are unnecessary in interviews

### Core problem ladder

1. LeetCode 307 — Range Sum Query — Mutable
2. LeetCode 315 — Count of Smaller Numbers After Self
3. LeetCode 327 — Count of Range Sum
4. LeetCode 493 — Reverse Pairs
5. LeetCode 218 — The Skyline Problem
6. LeetCode 699 — Falling Squares
7. LeetCode 715 — Range Module
8. LeetCode 732 — My Calendar III
9. LeetCode 850 — Rectangle Area II
10. LeetCode 480 — Sliding Window Median
11. LeetCode 239 — Sliding Window Maximum
12. LeetCode 76 — Minimum Window Substring as an advanced invariant review
13. LeetCode 214 — Shortest Palindrome
14. LeetCode 912 — Sort an Array with multiple implementations
15. LeetCode 528 — Random Pick with Weight

---

## Chapter 25 — Role-Based Interview Tracks

### Track A — Data Science

Prioritize:

- Arrays and hashing
- Strings and parsing
- Prefix sums
- Sliding windows
- Sorting
- Heaps and Top K
- Matrices
- Practical complexity and memory analysis

Create 30-question, 60-question, and 90-question tracks.

### Track B — ML / AI / GenAI Engineer

Prioritize:

- Arrays, strings, and hashing
- Top K and heaps
- Graph traversal
- Trees and tries
- Sliding windows for streams
- Caches and data structure design
- Batching, deduplication, ranking, and retrieval-flavored scenarios

Include realistic wrappers such as token streams, embeddings, document chunks, ranking results, model outputs, and graph-based workflows while keeping the underlying DSA problem recognizable.

### Track C — Python Backend Engineer

Prioritize:

- Python container behavior
- Strings and parsing
- Hash maps
- Queues and deques
- Heaps and scheduling
- Intervals
- Caches
- Graph dependency resolution
- Data structure design

### Track D — Software Development Engineer

Cover the complete curriculum with progressive mixed sets.

### Required role-track features

- Topic coverage matrix
- Recommended order
- 4-, 8-, and 12-week schedules
- Timed sets
- Weak-topic remediation links
- Resume-project-to-DSA talking points

---

## Chapter 26 — Mock Interviews & Revision

### Subsections

1. 15-minute screening drills
2. 30-minute single-problem rounds
3. 45-minute standard rounds
4. 60-minute two-problem rounds
5. Data Science coding rounds
6. Python backend rounds
7. AI/ML/GenAI coding rounds
8. SDE mixed rounds
9. Debugging rounds
10. Code-review rounds
11. Follow-up optimization rounds
12. Behavioral communication during coding

### Revision tools

- Pattern flashcards
- Complexity flashcards
- “What data structure would you choose?” drills
- Mistake log
- Spaced-repetition queue
- Weekly mixed assessment
- Readiness score
- Final 50-question revision list

---

# 10. Arrays page — detailed first-build specification

The Arrays & Hashing page should be the first full topic page implemented after the shell and landing page.

## Required page outline

1. **Chapter header**
2. **What arrays are**
3. **Python list internals at interview depth**
4. **Python list versus `array.array` versus NumPy array**
5. **Pros, cons, memory, locality, and resizing**
6. **Operation complexity table**
7. **Hash map and set companion concepts**
8. **Ten reusable array patterns**
9. **Compact pattern templates**
10. **Fifteen complete problem write-ups**
11. **Interview tips and spoken reasoning examples**
12. **Memory optimization guide**
13. **Common bugs and debugging exercises**
14. **Rapid review cheat sheet**
15. **Timed assessment and mastery checklist**

## Required array-specific interview insights

- Ask whether the array is sorted.
- Ask whether values can be negative or duplicated.
- Ask whether order must be preserved.
- Ask whether input mutation is allowed.
- Use value ranges to decide between a boolean/count array and a hash structure.
- Recognize when sorting changes O(n) memory into O(1) extra memory but increases time to O(n log n).
- Explain why Python lists store references rather than raw values.
- Distinguish expected O(1) hash lookup from worst-case behavior.
- Mention that an O(1)-space in-place solution can have side effects that are unacceptable in production code.
- Use assertions for empty input, one element, duplicates, negatives, large values, and already-sorted data.

---

# 11. Linked-list page — detailed second-build specification

Implement Linked Lists after Arrays & Hashing.

## Required page outline

1. **Chapter header**
2. **Singly, doubly, and circular linked lists**
3. **Python node implementation**
4. **Memory model and object overhead**
5. **Arrays versus linked lists**
6. **When linked lists are genuinely better**
7. **Why arrays are often faster in real systems**
8. **Dummy-node pattern**
9. **Fast/slow pointer pattern**
10. **In-place reversal template**
11. **Merge and split templates**
12. **Cycle detection proof**
13. **Fifteen complete problem write-ups**
14. **Pointer-debugging exercises**
15. **Interview checklist**

## Required linked-list interview insights

- Never overwrite `next` before preserving it.
- State the invariant for the reversed prefix.
- Use a sentinel to simplify head changes.
- Draw the list for reorder, k-group reversal, and random-pointer cloning.
- Discuss memory locality and per-node overhead rather than saying linked lists are always “better for insertion.”
- Clarify whether the interviewer provides a node class and whether the list can contain cycles.

---

# 12. Implementation sequence for Claude Code

Follow this sequence and stop after each requested milestone.

## Milestone 0 — Infrastructure only

- Add the top-level DSA navigation group.
- Add `dsa-prep/index.html` as a compact contents page.
- Add shared DSA CSS and JavaScript.
- Add empty question-bank registry with schema and sample records.
- Add progress storage and filtering primitives.
- Do not create full topic content yet.

## Milestone 1 — Arrays & Hashing

- Create the complete Arrays & Hashing page.
- Add all 15 problem records.
- Implement progressive hints and solution expansion.
- Test every code example.

## Milestone 2 — Linked Lists

- Create the complete Linked Lists page.
- Add all 15 problem records.
- Include visual pointer traces using lightweight HTML/SVG.

## Milestone 3 onward

Implement one chapter at a time in the order shown in Section 8 unless the user requests another order.

### Rule for every milestone

- Update the navigation registry.
- Update the DSA landing-page contents.
- Update the question-bank metadata.
- Add or update progress counts.
- Add a concise root-level update note.
- Validate links, HTML, JavaScript, responsive behavior, light mode, and dark mode.
- Zip the complete project after the requested chapter is finished.

---

# 13. Code-quality and testing requirements

## Python solutions

- Target modern Python 3.
- Prefer standard-library-only solutions.
- Use type hints where they clarify the API.
- Avoid unnecessary classes and clever one-liners.
- Include input validation only when relevant to the interview problem.
- Use `collections.deque` for queues.
- Use `heapq` for heaps.
- Avoid `list.pop(0)` in queue solutions.
- Explain recursion-depth risks.
- Ensure code blocks can be copied and run with minimal editing.

## Verification

For every primary problem:

- Run provided sample tests.
- Add at least three edge tests.
- Add one adversarial or stress-oriented test when practical.
- Compare against a brute-force oracle for randomly generated small inputs when practical.
- Check time and space claims against the implementation, not only the intended algorithm.

## Front-end validation

- No horizontal overflow at 390 px mobile width.
- Mobile drawer must not show the previous overlapping translucent card issue.
- Desktop pages should remain dense and readable at 100% browser zoom.
- The right contents rail should be compact and independently scrollable where needed.
- Code blocks must not force the whole page wider than the viewport.
- Interactive controls must be keyboard accessible.
- Respect reduced-motion settings.
- Preserve readable off-white dark-mode text without high-glare pure white.

---

# 14. Definition of done for each topic

A topic is complete only when all items are true:

- [ ] Navigation entry exists and highlights correctly.
- [ ] Page follows the standard chapter structure.
- [ ] Foundations explain Python behavior, complexity, memory, pros, and cons.
- [ ] At least 10 and preferably 15 primary problems are included.
- [ ] Every primary problem has an original summary and complete solution analysis.
- [ ] Every code example is tested.
- [ ] Brute-force and optimized approaches are compared where meaningful.
- [ ] Auxiliary-space and memory-mutation notes are explicit.
- [ ] Interview tips and follow-ups are included.
- [ ] Page has a compact cheat sheet and mastery checklist.
- [ ] Search and filters find every problem.
- [ ] Progress and bookmarks persist locally.
- [ ] Light and dark themes are checked.
- [ ] Desktop and mobile layouts are checked.
- [ ] No existing GenAI course page is broken.

---

# 15. Final quality bar

The finished DSA area should feel like a carefully edited interview textbook, not a collection of copied solutions. A learner should be able to:

1. Learn the data structure from first principles.
2. Understand Python-specific memory and performance behavior.
3. Recognize the small set of patterns behind many questions.
4. Progress from brute force to an optimal solution.
5. Explain the solution clearly in an interview.
6. Write and test correct code under time pressure.
7. Review weak areas through a compact, searchable contents system.
8. Follow a role-specific route without studying irrelevant material first.

Implement only the section explicitly requested by the user, then stop and provide the updated project archive for review.
