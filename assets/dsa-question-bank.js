/* =========================================================================
   DSA Interview Preparation — central question-bank metadata registry
   One record per problem. Canonical ownership lives here: `canonicalChapter`
   names the single chapter that carries the full editorial; `relatedChapters`
   lists every other chapter that shows a compact cross-reference.

   Progress (solved/learning/review) is stored separately by dsa-prep.js keyed
   by `id`, so a problem counts everywhere it appears.

   editorialLevel: "full" | "hints" | "listed" | "review"
   ========================================================================= */
window.DSA_QUESTION_BANK = [
  /* ---------------- 02 — Arrays (owns 10 of 15) ---------------- */
  { id: "lc-121", source: "LeetCode", number: 121, title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "Easy", canonicalChapter: "02-arrays", relatedChapters: ["18-dynamic-programming-1d"], patterns: ["Running minimum", "Single pass"], roles: ["SDE", "Python", "Data Science", "ML/AI", "GenAI"], estimatedMinutes: 15, editorialLevel: "full", page: "02-arrays.html", anchor: "lc-121" },
  { id: "lc-217", source: "LeetCode", number: 217, title: "Contains Duplicate", slug: "contains-duplicate", difficulty: "Easy", canonicalChapter: "04-hashing", relatedChapters: ["02-arrays"], patterns: ["Seen set"], roles: ["SDE", "Python", "Data Science", "ML/AI", "GenAI"], estimatedMinutes: 10, editorialLevel: "full", page: "04-hashing.html", anchor: "lc-217" },
  { id: "lc-238", source: "LeetCode", number: 238, title: "Product of Array Except Self", slug: "product-of-array-except-self", difficulty: "Medium", canonicalChapter: "02-arrays", relatedChapters: ["07-sliding-window-prefix-sums"], patterns: ["Prefix/suffix products"], roles: ["SDE", "Python", "Data Science", "ML/AI"], estimatedMinutes: 20, editorialLevel: "full", page: "02-arrays.html", anchor: "lc-238" },
  { id: "lc-53", source: "LeetCode", number: 53, title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium", canonicalChapter: "02-arrays", relatedChapters: ["07-sliding-window-prefix-sums", "18-dynamic-programming-1d"], patterns: ["Kadane"], roles: ["SDE", "Python", "Data Science", "ML/AI"], estimatedMinutes: 20, editorialLevel: "full", page: "02-arrays.html", anchor: "lc-53" },
  { id: "lc-88", source: "LeetCode", number: 88, title: "Merge Sorted Array", slug: "merge-sorted-array", difficulty: "Easy", canonicalChapter: "02-arrays", relatedChapters: ["09-sorting-intervals-selection", "06-two-pointers"], patterns: ["Merge from the back", "Two pointers"], roles: ["SDE", "Python"], estimatedMinutes: 15, editorialLevel: "full", page: "02-arrays.html", anchor: "lc-88" },
  { id: "lc-189", source: "LeetCode", number: 189, title: "Rotate Array", slug: "rotate-array", difficulty: "Medium", canonicalChapter: "02-arrays", relatedChapters: [], patterns: ["Reversal trick"], roles: ["SDE", "Python"], estimatedMinutes: 15, editorialLevel: "full", page: "02-arrays.html", anchor: "lc-189" },
  { id: "lc-169", source: "LeetCode", number: 169, title: "Majority Element", slug: "majority-element", difficulty: "Easy", canonicalChapter: "02-arrays", relatedChapters: ["04-hashing"], patterns: ["Boyer–Moore voting"], roles: ["SDE", "Python", "Data Science"], estimatedMinutes: 15, editorialLevel: "full", page: "02-arrays.html", anchor: "lc-169" },
  { id: "lc-54", source: "LeetCode", number: 54, title: "Spiral Matrix", slug: "spiral-matrix", difficulty: "Medium", canonicalChapter: "02-arrays", relatedChapters: ["20-bit-math-matrix"], patterns: ["Boundary traversal"], roles: ["SDE", "Python"], estimatedMinutes: 20, editorialLevel: "full", page: "02-arrays.html", anchor: "lc-54" },
  { id: "lc-73", source: "LeetCode", number: 73, title: "Set Matrix Zeroes", slug: "set-matrix-zeroes", difficulty: "Medium", canonicalChapter: "02-arrays", relatedChapters: ["20-bit-math-matrix"], patterns: ["In-place markers"], roles: ["SDE", "Python"], estimatedMinutes: 20, editorialLevel: "full", page: "02-arrays.html", anchor: "lc-73" },
  { id: "lc-11", source: "LeetCode", number: 11, title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", canonicalChapter: "06-two-pointers", relatedChapters: ["02-arrays"], patterns: ["Opposite ends"], roles: ["SDE", "Python"], estimatedMinutes: 20, editorialLevel: "full", page: "06-two-pointers.html", anchor: "lc-11" },
  { id: "lc-56", source: "LeetCode", number: 56, title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium", canonicalChapter: "09-sorting-intervals-selection", relatedChapters: ["02-arrays"], patterns: ["Sort + sweep"], roles: ["SDE", "Python", "Data Science"], estimatedMinutes: 20, editorialLevel: "full", page: "09-sorting-intervals-selection.html", anchor: "lc-56" },
  { id: "lc-31", source: "LeetCode", number: 31, title: "Next Permutation", slug: "next-permutation", difficulty: "Medium", canonicalChapter: "02-arrays", relatedChapters: [], patterns: ["Pivot + reverse"], roles: ["SDE"], estimatedMinutes: 25, editorialLevel: "full", page: "02-arrays.html", anchor: "lc-31" },
  { id: "lc-128", source: "LeetCode", number: 128, title: "Longest Consecutive Sequence", slug: "longest-consecutive-sequence", difficulty: "Medium", canonicalChapter: "04-hashing", relatedChapters: ["02-arrays"], patterns: ["Sequence starts in a set"], roles: ["SDE", "Python", "Data Science"], estimatedMinutes: 25, editorialLevel: "full", page: "04-hashing.html", anchor: "lc-128" },
  { id: "lc-42", source: "LeetCode", number: 42, title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard", canonicalChapter: "06-two-pointers", relatedChapters: ["02-arrays", "08-stacks-queues-deques"], patterns: ["Two pointers", "Prefix extrema"], roles: ["SDE"], estimatedMinutes: 30, editorialLevel: "full", page: "06-two-pointers.html", anchor: "lc-42" },
  { id: "lc-41", source: "LeetCode", number: 41, title: "First Missing Positive", slug: "first-missing-positive", difficulty: "Hard", canonicalChapter: "02-arrays", relatedChapters: [], patterns: ["Array as index (cyclic sort)"], roles: ["SDE"], estimatedMinutes: 30, editorialLevel: "full", page: "02-arrays.html", anchor: "lc-41" },

  /* ---------------- 03 — Linked Lists (owns 14 of 15) ---------------- */
  { id: "lc-206", source: "LeetCode", number: 206, title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", canonicalChapter: "03-linked-lists", relatedChapters: [], patterns: ["In-place reversal"], roles: ["SDE", "Python", "Data Science", "ML/AI", "GenAI"], estimatedMinutes: 15, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-206" },
  { id: "lc-21", source: "LeetCode", number: 21, title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "Easy", canonicalChapter: "03-linked-lists", relatedChapters: ["09-sorting-intervals-selection"], patterns: ["Dummy head", "Merge pointers"], roles: ["SDE", "Python"], estimatedMinutes: 15, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-21" },
  { id: "lc-141", source: "LeetCode", number: 141, title: "Linked List Cycle", slug: "linked-list-cycle", difficulty: "Easy", canonicalChapter: "03-linked-lists", relatedChapters: [], patterns: ["Fast/slow pointers"], roles: ["SDE", "Python"], estimatedMinutes: 15, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-141" },
  { id: "lc-142", source: "LeetCode", number: 142, title: "Linked List Cycle II", slug: "linked-list-cycle-ii", difficulty: "Medium", canonicalChapter: "03-linked-lists", relatedChapters: [], patterns: ["Floyd cycle start"], roles: ["SDE"], estimatedMinutes: 25, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-142" },
  { id: "lc-19", source: "LeetCode", number: 19, title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list", difficulty: "Medium", canonicalChapter: "03-linked-lists", relatedChapters: [], patterns: ["One-pass gap", "Dummy head"], roles: ["SDE", "Python"], estimatedMinutes: 20, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-19" },
  { id: "lc-143", source: "LeetCode", number: 143, title: "Reorder List", slug: "reorder-list", difficulty: "Medium", canonicalChapter: "03-linked-lists", relatedChapters: [], patterns: ["Midpoint + reverse + merge"], roles: ["SDE"], estimatedMinutes: 25, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-143" },
  { id: "lc-2", source: "LeetCode", number: 2, title: "Add Two Numbers", slug: "add-two-numbers", difficulty: "Medium", canonicalChapter: "03-linked-lists", relatedChapters: [], patterns: ["Dummy head", "Carry"], roles: ["SDE", "Python"], estimatedMinutes: 20, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-2" },
  { id: "lc-138", source: "LeetCode", number: 138, title: "Copy List with Random Pointer", slug: "copy-list-with-random-pointer", difficulty: "Medium", canonicalChapter: "03-linked-lists", relatedChapters: ["04-hashing"], patterns: ["Interleave clone", "Hash map clone"], roles: ["SDE"], estimatedMinutes: 25, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-138" },
  { id: "lc-160", source: "LeetCode", number: 160, title: "Intersection of Two Linked Lists", slug: "intersection-of-two-linked-lists", difficulty: "Easy", canonicalChapter: "03-linked-lists", relatedChapters: [], patterns: ["Two-pointer switch"], roles: ["SDE", "Python"], estimatedMinutes: 20, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-160" },
  { id: "lc-234", source: "LeetCode", number: 234, title: "Palindrome Linked List", slug: "palindrome-linked-list", difficulty: "Easy", canonicalChapter: "03-linked-lists", relatedChapters: ["06-two-pointers"], patterns: ["Midpoint + reverse half"], roles: ["SDE", "Python"], estimatedMinutes: 20, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-234" },
  { id: "lc-82", source: "LeetCode", number: 82, title: "Remove Duplicates from Sorted List II", slug: "remove-duplicates-from-sorted-list-ii", difficulty: "Medium", canonicalChapter: "03-linked-lists", relatedChapters: [], patterns: ["Dummy head", "Skip run"], roles: ["SDE"], estimatedMinutes: 25, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-82" },
  { id: "lc-148", source: "LeetCode", number: 148, title: "Sort List", slug: "sort-list", difficulty: "Medium", canonicalChapter: "03-linked-lists", relatedChapters: ["09-sorting-intervals-selection"], patterns: ["Merge sort on a list"], roles: ["SDE"], estimatedMinutes: 30, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-148" },
  { id: "lc-23", source: "LeetCode", number: 23, title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists", difficulty: "Hard", canonicalChapter: "03-linked-lists", relatedChapters: ["13-heaps-priority-queues"], patterns: ["k-way merge", "Heap"], roles: ["SDE"], estimatedMinutes: 30, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-23" },
  { id: "lc-25", source: "LeetCode", number: 25, title: "Reverse Nodes in k-Group", slug: "reverse-nodes-in-k-group", difficulty: "Hard", canonicalChapter: "03-linked-lists", relatedChapters: [], patterns: ["Segmented reversal"], roles: ["SDE"], estimatedMinutes: 35, editorialLevel: "full", page: "03-linked-lists.html", anchor: "lc-25" },
  { id: "lc-146", source: "LeetCode", number: 146, title: "LRU Cache", slug: "lru-cache", difficulty: "Medium", canonicalChapter: "21-data-structure-design", relatedChapters: ["03-linked-lists", "04-hashing"], patterns: ["Doubly linked list + hash map"], roles: ["SDE", "Python", "ML/AI", "GenAI"], estimatedMinutes: 30, editorialLevel: "full", page: "21-data-structure-design.html", anchor: "lc-146" },

  /* ---------------- Seed sample for later chapters (metadata only) ---------------- */
  { id: "lc-1", source: "LeetCode", number: 1, title: "Two Sum", slug: "two-sum", difficulty: "Easy", canonicalChapter: "04-hashing", relatedChapters: ["02-arrays"], patterns: ["Complement lookup"], roles: ["SDE", "Python", "Data Science", "ML/AI", "GenAI"], estimatedMinutes: 15, editorialLevel: "listed", page: "04-hashing.html", anchor: "lc-1" },
  { id: "lc-15", source: "LeetCode", number: 15, title: "3Sum", slug: "3sum", difficulty: "Medium", canonicalChapter: "06-two-pointers", relatedChapters: ["02-arrays", "09-sorting-intervals-selection"], patterns: ["Anchor + pair"], roles: ["SDE", "Python"], estimatedMinutes: 30, editorialLevel: "listed", page: "06-two-pointers.html", anchor: "lc-15" },
  { id: "lc-20", source: "LeetCode", number: 20, title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", canonicalChapter: "08-stacks-queues-deques", relatedChapters: [], patterns: ["Matching delimiters"], roles: ["SDE", "Python"], estimatedMinutes: 15, editorialLevel: "listed", page: "08-stacks-queues-deques.html", anchor: "lc-20" },
  { id: "lc-704", source: "LeetCode", number: 704, title: "Binary Search", slug: "binary-search", difficulty: "Easy", canonicalChapter: "10-binary-search", relatedChapters: [], patterns: ["Exact search"], roles: ["SDE", "Python", "Data Science"], estimatedMinutes: 15, editorialLevel: "listed", page: "10-binary-search.html", anchor: "lc-704" },
  { id: "lc-200", source: "LeetCode", number: 200, title: "Number of Islands", slug: "number-of-islands", difficulty: "Medium", canonicalChapter: "15-graphs-grids", relatedChapters: [], patterns: ["Grid DFS/BFS", "Connected components"], roles: ["SDE", "Python"], estimatedMinutes: 25, editorialLevel: "listed", page: "15-graphs-grids.html", anchor: "lc-200" },
  { id: "lc-70", source: "LeetCode", number: 70, title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "Easy", canonicalChapter: "18-dynamic-programming-1d", relatedChapters: [], patterns: ["1D DP", "Fibonacci recurrence"], roles: ["SDE", "Python", "Data Science"], estimatedMinutes: 15, editorialLevel: "listed", page: "18-dynamic-programming-1d.html", anchor: "lc-70" },
  { id: "lc-104", source: "LeetCode", number: 104, title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", canonicalChapter: "12-trees-bst", relatedChapters: [], patterns: ["DFS recursion"], roles: ["SDE", "Python"], estimatedMinutes: 12, editorialLevel: "listed", page: "12-trees-bst.html", anchor: "lc-104" },
  { id: "lc-215", source: "LeetCode", number: 215, title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", difficulty: "Medium", canonicalChapter: "13-heaps-priority-queues", relatedChapters: ["09-sorting-intervals-selection"], patterns: ["Bounded heap", "Quickselect"], roles: ["SDE", "Data Science", "ML/AI"], estimatedMinutes: 20, editorialLevel: "listed", page: "13-heaps-priority-queues.html", anchor: "lc-215" }
];

/* =========================================================================
   High-frequency interview set — the pattern-defining problems most asked at
   FAANG / MAANG and major Indian product companies (the Blind-75 / NeetCode
   core plus common India favourites). dsa-prep.js renders these with a small
   ★ indicator so learners can focus on the highest-leverage problems first and
   skip lower-yield practice. Keyed by LeetCode number — edit freely; a number
   that isn't present on any page is simply ignored.
   ========================================================================= */
window.DSA_INTERVIEW_MUST = [
  // Arrays & hashing
  1, 49, 53, 56, 57, 121, 128, 152, 169, 217, 238, 271, 347,
  // Two pointers
  11, 15, 42, 75, 125, 167,
  // Sliding window
  3, 76, 239, 424, 438, 567,
  // Stacks & queues
  20, 22, 84, 150, 155, 496, 503, 739,
  // Binary search
  4, 33, 34, 35, 74, 153, 704, 875,
  // Linked lists
  2, 19, 21, 23, 25, 138, 141, 142, 143, 146, 206,
  // Trees & BST
  98, 100, 102, 104, 105, 110, 116, 124, 173, 199, 226, 230, 235, 236, 297, 543, 572, 662,
  // Tries
  208, 211, 212,
  // Heaps / priority queues
  295, 355, 621, 703, 973,
  // Recursion & backtracking
  17, 39, 40, 46, 47, 51, 77, 78, 79, 90, 131, 216,
  // Graphs & grids
  127, 130, 133, 200, 207, 210, 261, 269, 323, 547, 684, 785, 802, 994,
  // Greedy
  45, 55, 134, 846,
  // Dynamic programming
  62, 63, 70, 72, 91, 139, 198, 213, 300, 309, 322, 416, 494, 647, 1143,
  // Intervals
  252, 253, 435, 452,
  // Math, matrix & bits
  43, 48, 50, 54, 66, 73, 136, 190, 191, 202, 268, 338, 371,
  // Design
  380, 460, 5
];
