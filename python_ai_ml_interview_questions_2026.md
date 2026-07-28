# Python, AI & ML Interview Question Bank — 2026

> **This file is the raw research bank.** The curated, answered version lives in the portal at
> [`python-interview/index.html`](python-interview/index.html) — 319 questions that survived a
> recency check against 2025–2026 India interview reports, each with a simple answer, a 30-second
> spoken version and the likely follow-up. Use that section to study; use this file as the wider
> checklist. Build plan: [`PYTHON_INTERVIEW_PORTAL_PLAN.md`](PYTHON_INTERVIEW_PORTAL_PLAN.md).

**Questions:** 1448  
**Research date:** July 27, 2026  
**Coverage:** Python basics to advanced internals, backend and data engineering, testing, NumPy, Pandas, PySpark, ML, deep learning, LLMs, RAG, agents, MLOps, coding, and project discussions.

> This is a deduplicated research synthesis, not a verbatim scrape of every question on the internet. Public interview reports are incomplete, many large databases require sign-in, and thousands of listings repeat the same concepts. The bank prioritizes recent 2025–2026 candidate reports, current 2026 preparation guides, and official technical documentation. Questions are intentionally provided without answers so the file can be used as a practice checklist.

## How to use this file

- Start with Python fundamentals, collections, functions, `*args`/`**kwargs`, decorators, OOP, exceptions, iterators, and generators.
- For backend roles, add concurrency, APIs, databases, caching, testing, and deployment.
- For data/ML roles, add NumPy, Pandas, data engineering, scikit-learn, statistics, and model-system design.
- For GenAI roles, add transformers, embeddings, RAG, vector search, agents, evaluation, security, and observability.
- For each question, prepare: definition, small example, production trade-off, common mistake, and one follow-up question.

## Table of contents

1. [Recently reported in 2025-2026 interviews](#recently-reported-in-2025-2026-interviews) — 31 questions
2. [Python overview, execution, and runtime](#python-overview-execution-and-runtime) — 30 questions
3. [Syntax, variables, control flow, and operators](#syntax-variables-control-flow-and-operators) — 39 questions
4. [Built-in types, casting, truthiness, and numbers](#built-in-types-casting-truthiness-and-numbers) — 39 questions
5. [Strings, bytes, formatting, and regular expressions](#strings-bytes-formatting-and-regular-expressions) — 36 questions
6. [Lists, tuples, sets, dictionaries, and collections](#lists-tuples-sets-dictionaries-and-collections) — 50 questions
7. [Functions, parameters, *args, and **kwargs](#functions-parameters-args-and-kwargs) — 44 questions
8. [Scope, closures, lambdas, and functional programming](#scope-closures-lambdas-and-functional-programming) — 30 questions
9. [Comprehensions, iterables, iterators, and generators](#comprehensions-iterables-iterators-and-generators) — 35 questions
10. [Decorators, context managers, descriptors, and properties](#decorators-context-managers-descriptors-and-properties) — 35 questions
11. [Object-oriented Python](#object-oriented-python) — 54 questions
12. [Python data model, magic methods, and metaprogramming](#python-data-model-magic-methods-and-metaprogramming) — 43 questions
13. [Exceptions, modules, imports, environments, and packaging](#exceptions-modules-imports-environments-and-packaging) — 47 questions
14. [Memory management, garbage collection, performance, and CPython internals](#memory-management-garbage-collection-performance-and-cpython-internals) — 50 questions
15. [Threading, multiprocessing, asyncio, and parallelism](#threading-multiprocessing-asyncio-and-parallelism) — 58 questions
16. [Type hints and modern Python](#type-hints-and-modern-python) — 50 questions
17. [Standard library, files, serialization, logging, and utilities](#standard-library-files-serialization-logging-and-utilities) — 46 questions
18. [Testing, mocking, debugging, linting, and code quality](#testing-mocking-debugging-linting-and-code-quality) — 55 questions
19. [Backend Python, APIs, frameworks, databases, and distributed work](#backend-python-apis-frameworks-databases-and-distributed-work) — 60 questions
20. [NumPy](#numpy) — 36 questions
21. [Pandas and analytical Python](#pandas-and-analytical-python) — 45 questions
22. [Data engineering, PySpark, Airflow, and pipelines](#data-engineering-pyspark-airflow-and-pipelines) — 49 questions
23. [Machine learning and scikit-learn](#machine-learning-and-scikit-learn) — 83 questions
24. [Deep learning, PyTorch, NLP, and computer vision](#deep-learning-pytorch-nlp-and-computer-vision) — 54 questions
25. [LLMs, prompt engineering, RAG, vector search, and agents](#llms-prompt-engineering-rag-vector-search-and-agents) — 102 questions
26. [MLOps, deployment, monitoring, and ML system design](#mlops-deployment-monitoring-and-ml-system-design) — 49 questions
27. [Python coding and implementation questions](#python-coding-and-implementation-questions) — 158 questions
28. [Project, architecture, and behavioral questions](#project-architecture-and-behavioral-questions) — 40 questions
29. [Research sources](#research-sources)

## Recently reported in 2025-2026 interviews

_Questions and topic clusters explicitly reflected in recent candidate reports and 2026 interview listings. See Sources S1-S8._

1. What are the differences among sets, dictionaries, tuples, and lists in Python?
2. Explain inheritance, abstraction, encapsulation, and polymorphism with Python examples.?
3. How do membership, relational, and logical operators work in Python?
4. What is the difference between a for loop and a while loop?
5. How would you discuss the architecture and technical decisions in your Python project?
6. What are generators, and where have you used them in production?
7. What are decorators, and how would you implement one that accepts arguments?
8. What is the GIL, and how does it affect multithreaded Python programs?
9. How does Python memory management work?
10. What is the difference between threads, processes, and asyncio?
11. What is the difference between a tuple and a list?
12. What is the difference between a shallow copy and a deep copy?
13. How would you scale a Python backend service?
14. Solve the Two Sum problem in Python and analyze its complexity.?
15. What Python syntax, function, and error-handling questions should an intern know?
16. Find the second-largest distinct element in an array.?
17. Check whether a string is a palindrome.?
18. Print a decreasing star pattern with indentation.?
19. Write Python code using NumPy and Pandas to preprocess a dataset.?
20. How does an SVM work?
21. What are support vectors?
22. How do decision trees use entropy, Gini impurity, and information gain?
23. How would you approach a bank loan-prediction problem?
24. What is the difference between supervised and unsupervised learning?
25. Explain the bias-variance trade-off.?
26. How do linear regression, logistic regression, decision trees, and KNN work?
27. How would you handle an imbalanced classification dataset?
28. Explain neural-network training using backpropagation.?
29. Implement linear regression from scratch in Python.?
30. Implement k-means clustering from scratch in Python.?
31. How would you preprocess and analyze a dataset using NumPy, Pandas, and scikit-learn?

## Python overview, execution, and runtime

1. What is Python, and what are its defining characteristics?
2. Is Python compiled, interpreted, or both?
3. What happens from the moment a Python file is executed until its code runs?
4. What is Python bytecode?
5. What is the Python virtual machine?
6. What is CPython?
7. How do CPython, PyPy, Jython, IronPython, and MicroPython differ?
8. What is dynamic typing?
9. What is strong typing?
10. What is duck typing?
11. What is an object in Python?
12. What are object identity, type, and value?
13. What does the id function return?
14. What is a namespace?
15. What is a code block in Python's execution model?
16. What is the difference between an expression and a statement?
17. What is the difference between syntax errors and runtime errors?
18. What does it mean that functions and classes are first-class objects?
19. What are Python keywords?
20. How can you inspect the keyword list programmatically?
21. What is PEP 8?
22. What is a PEP, and why does it matter?
23. What does Pythonic code mean?
24. What is the Zen of Python?
25. What is the purpose of the interactive interpreter or REPL?
26. What is the difference between running a script and importing a module?
27. What does if __name__ == '__main__' do?
28. What information is stored in __name__, __file__, __package__, and __spec__?
29. What is the difference between Python language semantics and CPython implementation details?
30. Which Python implementation assumptions should production code avoid?

## Syntax, variables, control flow, and operators

1. How are variables created in Python?
2. Does a Python variable contain an object or reference an object?
3. What is multiple assignment?
4. How does iterable unpacking work?
5. What is extended iterable unpacking with a starred target?
6. How can two variables be swapped without a temporary variable?
7. What is the walrus operator, and when should it be used?
8. What is operator precedence?
9. How can ambiguous operator precedence be made explicit?
10. What is short-circuit evaluation?
11. How do and and or return values rather than only booleans?
12. What are comparison chains, and how are they evaluated?
13. What is the difference between == and is?
14. Why should None normally be compared using is?
15. What are membership operators?
16. What are identity operators?
17. What is the difference between break, continue, and pass?
18. What does the else clause on a for loop mean?
19. What does the else clause on a while loop mean?
20. How does range work?
21. Why is range memory efficient?
22. What is the difference between enumerate and manually maintaining an index?
23. How does zip work?
24. What happens when zip receives iterables of different lengths?
25. What does zip with strict=True do?
26. What is structural pattern matching?
27. How do match and case differ from switch statements in other languages?
28. What are guards in pattern matching?
29. How do sequence, mapping, class, and OR patterns work?
30. What is the difference between a conditional expression and an if statement?
31. When is recursion preferable to iteration?
32. What is Python's recursion limit?
33. How can the recursion limit be inspected or changed, and why is changing it risky?
34. How does Python handle integer overflow?
35. What is the difference between /, //, %, and divmod?
36. How does modulo behave with negative numbers?
37. What is exponentiation associativity in Python?
38. What are bitwise operators, and when are they useful?
39. What is the difference between logical and bitwise operators?

## Built-in types, casting, truthiness, and numbers

1. What are Python's principal built-in types?
2. Which built-in types are mutable?
3. Which built-in types are immutable?
4. What is explicit type conversion?
5. What is implicit numeric conversion?
6. What is the difference between int('10') and int('10.5')?
7. How does int convert a floating-point value?
8. How do int, float, complex, str, bool, list, tuple, set, and dict conversions work?
9. When does type conversion raise ValueError versus TypeError?
10. What is truthiness in Python?
11. Which built-in values are falsy?
12. How can a custom class define truthiness?
13. What is the relationship between bool and int?
14. Why is bool a subclass of int?
15. What is None, and what is NoneType?
16. How do int objects support arbitrary precision?
17. What is floating-point representation error?
18. Why can 0.1 + 0.2 differ from 0.3?
19. When should Decimal be used instead of float?
20. When should Fraction be used?
21. How do Decimal contexts and rounding modes work?
22. What is a complex number in Python?
23. What are NaN and infinity?
24. Why is NaN not equal to itself?
25. How should NaN values be tested?
26. What is numeric coercion?
27. What are the consequences of converting a large integer to float?
28. What is the difference between round and decimal quantization?
29. How does banker's rounding work in Python?
30. What do abs, pow, divmod, min, max, sum, all, and any do?
31. What is the difference between type and isinstance?
32. Why is isinstance usually preferred for inheritance-aware checks?
33. How does issubclass work?
34. What is an immutable object containing a mutable object?
35. Can a tuple be mutable in practice if it contains a list?
36. What makes an object hashable?
37. What contract must __eq__ and __hash__ satisfy?
38. Why are mutable built-in containers unhashable?
39. When can a tuple be used as a dictionary key?

## Strings, bytes, formatting, and regular expressions

1. Why are Python strings immutable?
2. How are strings represented as Unicode?
3. What is the difference between str, bytes, and bytearray?
4. What is encoding and decoding?
5. What is UTF-8?
6. What happens when text is decoded with the wrong encoding?
7. What are encoding error handlers such as strict, ignore, replace, and surrogateescape?
8. What is string interning?
9. Why should identity not be used to compare strings?
10. What is slicing syntax?
11. How do negative indices work?
12. What happens when a slice index is outside the sequence bounds?
13. What is the difference between split, rsplit, partition, and rpartition?
14. What is the difference between strip, lstrip, and rstrip?
15. Why does strip not remove a literal substring?
16. What is the difference between replace and translate?
17. How does str.join work, and why is it preferable to repeated concatenation in loops?
18. What is the difference between find and index?
19. What is the difference between isdigit, isnumeric, and isdecimal?
20. How do casefold and lower differ?
21. What are f-strings?
22. How do conversion flags and format specifications work in f-strings?
23. What is the difference between f-strings, str.format, and percent formatting?
24. What are raw strings, and what limitations do they have?
25. What are template string literals in modern Python?
26. How do multiline strings and implicit literal concatenation work?
27. How would you reverse a string?
28. How would you check whether two strings are anagrams?
29. How would you find the first non-repeating character?
30. How would you count overlapping substring occurrences?
31. What is a regular expression?
32. What is the difference between re.match, re.search, and re.fullmatch?
33. What is the difference between greedy and non-greedy quantifiers?
34. What are capture groups, named groups, lookaheads, and lookbehinds?
35. When should re.compile be used?
36. How can catastrophic regex backtracking be avoided?

## Lists, tuples, sets, dictionaries, and collections

1. What is the difference between a list and a tuple?
2. When should a tuple be preferred over a list?
3. How are lists implemented internally?
4. What is amortized O(1) list append?
5. What is the time complexity of list indexing, insertion, deletion, and membership testing?
6. What is the difference between append, extend, insert, and concatenation?
7. What is the difference between remove, pop, clear, and del?
8. What is the difference between list.sort and sorted?
9. Why does list.sort return None?
10. What does stable sorting mean?
11. How do key functions work in sorting?
12. How can multiple sort keys be expressed?
13. What is the difference between reverse=True and reversing after a sort?
14. How can a list be copied?
15. Why can list multiplication create shared nested objects?
16. What happens in matrix = [[0] * 3] * 3?
17. How can a two-dimensional list be initialized safely?
18. What is tuple packing and unpacking?
19. What is a singleton tuple?
20. How does tuple comparison work?
21. What is a named tuple?
22. When should namedtuple, dataclass, or a regular class be used?
23. What is a set?
24. How do union, intersection, difference, and symmetric difference work?
25. What is the difference between set methods and set operators?
26. Why must set elements be hashable?
27. What is a frozenset?
28. When is frozenset useful?
29. How can duplicates be removed while preserving order?
30. What is a dictionary?
31. How are dictionaries implemented at a high level?
32. Do dictionaries preserve insertion order?
33. What is the difference between dictionary insertion order and sorted order?
34. What happens when two different keys have the same hash?
35. What is a hash collision?
36. What is the average and worst-case complexity of dictionary lookup?
37. What is the difference between d[key], get, setdefault, and defaultdict?
38. What is the difference between keys, values, and items views?
39. Are dictionary views live or copied?
40. How do dictionary merge operators work?
41. What happens when duplicate keys appear in a dictionary literal or merge?
42. What is a dictionary comprehension?
43. How can a dictionary be inverted safely when values are not unique?
44. What is collections.Counter?
45. What is collections.defaultdict?
46. What is collections.deque, and why is it preferable for queue operations?
47. What is OrderedDict still useful for now that dict preserves order?
48. What is ChainMap?
49. What are UserDict, UserList, and UserString?
50. How would you implement an LRU cache using a dictionary and doubly linked list?

## Functions, parameters, *args, and **kwargs

1. How are functions defined and called in Python?
2. What is the difference between a parameter and an argument?
3. What are positional arguments?
4. What are keyword arguments?
5. What are default arguments?
6. What is *args?
7. What is **kwargs?
8. What is the difference between *args and **kwargs?
9. Why are args and kwargs only naming conventions?
10. What does a single star do in a function call?
11. What does a double star do in a function call?
12. What happens when unpacked positional arguments conflict with explicit arguments?
13. What happens when duplicate keyword arguments are supplied?
14. What are positional-only parameters?
15. What are keyword-only parameters?
16. What do / and * mean in a function signature?
17. What is the valid ordering of parameter kinds?
18. How can a function accept arbitrary positional and keyword arguments while validating them?
19. How can **kwargs be typed precisely?
20. Why are mutable default arguments dangerous?
21. When can a mutable default argument be intentionally useful?
22. When are default argument expressions evaluated?
23. What is pass-by-object-reference or call-by-sharing?
24. Does Python pass arguments by value or by reference?
25. Why can mutating an argument affect the caller while rebinding it does not?
26. Can a function return multiple values?
27. What is actually returned when a function appears to return multiple values?
28. What happens when a function reaches the end without return?
29. What is a docstring?
30. How are function annotations stored?
31. Are type annotations enforced at runtime?
32. What is a pure function?
33. What is a side effect?
34. What is referential transparency?
35. What is function overloading, and how is it approximated in Python?
36. How does functools.singledispatch work?
37. What is partial application?
38. How does functools.partial work?
39. What is a callable object?
40. How can inspect.signature be used?
41. How can a wrapper preserve the original function signature and metadata?
42. How would you design a function API that remains backward compatible?
43. How would you validate unknown keyword arguments and produce useful errors?
44. How do variadic generic functions differ from functions using *args?

## Scope, closures, lambdas, and functional programming

1. What is the LEGB name-resolution rule?
2. What is local scope?
3. What is enclosing scope?
4. What is global scope?
5. What is built-in scope?
6. What does the global statement do?
7. What does the nonlocal statement do?
8. What is the difference between global and nonlocal?
9. What is a closure?
10. What values are stored in a function closure?
11. What is late binding in closures?
12. Why do lambdas created in a loop often use the final loop value?
13. How can late binding in loop-created closures be fixed?
14. What is a lambda function?
15. What limitations do lambda expressions have?
16. When is a named function preferable to a lambda?
17. What is a first-class function?
18. What is a higher-order function?
19. What is the difference between map and a comprehension?
20. What is the difference between filter and a comprehension?
21. What does functools.reduce do?
22. When is reduce less readable than a loop or built-in aggregation?
23. What does operator.itemgetter do?
24. What does operator.attrgetter do?
25. What is function composition?
26. How can immutable data and pure functions simplify testing?
27. What is currying, and is it idiomatic in Python?
28. How can closures be used to maintain private state?
29. What is the difference between a closure and a callable class?
30. How can a closure cause memory to remain alive unexpectedly?

## Comprehensions, iterables, iterators, and generators

1. What is an iterable?
2. What is an iterator?
3. What is the difference between an iterable and an iterator?
4. What protocol does iter implement?
5. What protocol does next implement?
6. What is StopIteration?
7. What happens when iter is called on an iterator?
8. How can a custom iterator be implemented?
9. What is a generator function?
10. What is a generator expression?
11. What is the difference between yield and return?
12. How does generator state persist between yields?
13. Why are generators memory efficient?
14. When can generators be slower than lists?
15. What is lazy evaluation?
16. What is yield from?
17. How does yield from delegate send, throw, and close?
18. What do generator send, throw, and close do?
19. What is GeneratorExit?
20. What is an infinite iterator?
21. How can itertools.count, cycle, and repeat be used safely?
22. What are list, set, and dictionary comprehensions?
23. What is the scope of a comprehension variable in Python 3?
24. How do nested comprehensions execute?
25. When should a comprehension be replaced with a regular loop?
26. What is the difference between a generator expression and a list comprehension?
27. How does any short-circuit over a generator?
28. How does all short-circuit over a generator?
29. What does itertools.tee do, and what memory risk does it introduce?
30. What is the difference between itertools.chain and nested loops?
31. What do islice, takewhile, dropwhile, groupby, product, permutations, and combinations do?
32. Why does itertools.groupby require adjacent equal keys?
33. What is an asynchronous iterator?
34. What are __aiter__ and __anext__?
35. What is an asynchronous generator?

## Decorators, context managers, descriptors, and properties

1. What is a decorator?
2. What does @decorator syntax translate to?
3. How do decorators use first-class functions and closures?
4. How do you write a decorator that accepts *args and **kwargs?
5. How do you write a decorator factory that accepts configuration?
6. Why should functools.wraps be used?
7. What metadata can be lost without wraps?
8. In what order are multiple decorators applied?
9. In what order do nested decorator wrappers execute?
10. How can a class be used as a decorator?
11. How can a stateful decorator remain thread-safe?
12. How can a decorator work with both synchronous and asynchronous functions?
13. How would you implement retry, timing, logging, caching, authorization, and rate-limiting decorators?
14. What risks arise when decorators swallow exceptions?
15. How can a decorator preserve a precise static type signature?
16. What is a context manager?
17. What do __enter__ and __exit__ do?
18. How can __exit__ suppress an exception?
19. How can contextlib.contextmanager create a context manager?
20. What is an asynchronous context manager?
21. What do __aenter__ and __aexit__ do?
22. What are ExitStack and AsyncExitStack?
23. When is closing from contextlib useful?
24. What is a descriptor?
25. What are __get__, __set__, and __delete__?
26. What is the difference between a data descriptor and a non-data descriptor?
27. How do functions behave as descriptors when accessed through an instance?
28. How are bound methods created?
29. What is a property?
30. How do property getters, setters, and deleters work?
31. When is a property preferable to an explicit getter method?
32. How can a cached property become stale?
33. How does functools.cached_property interact with mutability and threading?
34. How would you implement a validating descriptor?
35. How do descriptors underpin methods, properties, classmethod, and staticmethod?

## Object-oriented Python

1. What is a class?
2. What is an instance?
3. What is the purpose of self?
4. Is self a keyword?
5. What does __init__ do?
6. What does __new__ do?
7. What is the difference between __new__ and __init__?
8. What are instance attributes?
9. What are class attributes?
10. What happens when an instance attribute shadows a class attribute?
11. What is an instance method?
12. What is a class method?
13. What is a static method?
14. When should classmethod be used as an alternative constructor?
15. When is staticmethod preferable to a module-level function?
16. What is inheritance?
17. What is method overriding?
18. What is multiple inheritance?
19. What is the diamond problem?
20. What is method resolution order?
21. How does C3 linearization work conceptually?
22. What does super do?
23. Why does super not simply mean the direct parent?
24. What is cooperative multiple inheritance?
25. Why should methods in cooperative inheritance accept compatible signatures?
26. What is encapsulation in Python?
27. What do single-leading-underscore names mean?
28. What is name mangling for double-leading-underscore attributes?
29. Does name mangling provide true privacy?
30. What is abstraction?
31. What are abstract base classes?
32. How do ABC and abstractmethod work?
33. Can an abstract class have concrete methods and state?
34. What is polymorphism?
35. What is duck typing in object-oriented design?
36. What is composition?
37. When should composition be preferred over inheritance?
38. What is the Liskov substitution principle?
39. What are SOLID principles, and how do they apply to Python?
40. What is dependency injection in Python?
41. How can protocols reduce coupling?
42. What is a mixin?
43. What makes a good mixin?
44. What is a dataclass?
45. Which methods can dataclass generate?
46. What do frozen, order, slots, kw_only, and unsafe_hash mean in dataclass?
47. Why should default_factory be used for mutable dataclass fields?
48. What is the difference between dataclass, namedtuple, TypedDict, and Pydantic models?
49. What are __slots__, and what trade-offs do they introduce?
50. How does inheritance interact with __slots__?
51. How would you design immutable value objects in Python?
52. How would you implement equality and ordering for a domain class?
53. How would you avoid the fragile base-class problem?
54. What is object aggregation versus composition?

## Python data model, magic methods, and metaprogramming

1. What are dunder or magic methods?
2. What is the difference between __str__ and __repr__?
3. What qualities should a useful __repr__ have?
4. How do __eq__, __ne__, __lt__, __le__, __gt__, and __ge__ work?
5. What does functools.total_ordering do?
6. How does operator overloading work?
7. What are reflected operators such as __radd__?
8. What are in-place operators such as __iadd__?
9. Why can += mutate one object but create another for a different type?
10. How do __len__, __iter__, __next__, and __contains__ customize containers?
11. How does Python fall back when __contains__ is absent?
12. What does __call__ do?
13. What do __getitem__, __setitem__, and __delitem__ do?
14. How can slicing be supported in __getitem__?
15. What are __getattr__ and __getattribute__?
16. What is the difference between __getattr__ and __getattribute__?
17. How can overriding __getattribute__ cause infinite recursion?
18. What do __setattr__ and __delattr__ do?
19. What are __dir__ and __format__?
20. What are __bytes__, __index__, and __bool__?
21. How does the context-manager protocol fit the data model?
22. How does the descriptor protocol fit the data model?
23. What is a metaclass?
24. What is type's role as the default metaclass?
25. How is a class statement executed?
26. What does a metaclass __new__ or __init__ do?
27. What is __prepare__ on a metaclass?
28. What is __init_subclass__?
29. When is __init_subclass__ simpler than a metaclass?
30. What is __set_name__ on a descriptor?
31. What is dynamic class creation with type?
32. What is monkey patching?
33. What are the benefits and dangers of monkey patching?
34. What is introspection?
35. How do dir, vars, getattr, setattr, hasattr, callable, and inspect help introspection?
36. What are code objects, frame objects, and traceback objects?
37. What is the abstract syntax tree module used for?
38. What is compile, eval, and exec?
39. Why are eval and exec dangerous with untrusted input?
40. How can decorators register classes or functions at import time?
41. What is a plugin architecture using entry points or registries?
42. What is a proxy object, and how can attribute forwarding be implemented?
43. What is the difference between nominal and structural subtyping?

## Exceptions, modules, imports, environments, and packaging

1. What is an exception?
2. What is the exception hierarchy rooted at BaseException?
3. Why should application exceptions normally inherit from Exception rather than BaseException?
4. How do try, except, else, and finally interact?
5. When does an else block execute?
6. Does finally always execute?
7. What happens when return appears inside try and finally?
8. Why is control flow in finally risky?
9. Why should bare except usually be avoided?
10. How should multiple exception types be caught?
11. What is exception chaining?
12. What is the difference between implicit context and raise ... from ...?
13. What does raise from None do?
14. How do you create a custom exception hierarchy?
15. What information should a custom exception carry?
16. What are exception groups?
17. How does except* differ from except?
18. What are exception notes?
19. What is EAFP?
20. What is LBYL?
21. When is EAFP preferable in Python?
22. What is a module?
23. What is a package?
24. What is a namespace package?
25. What is the module search path?
26. How does sys.path get populated?
27. What is import caching in sys.modules?
28. Why is imported module code usually executed only once?
29. How can a module be reloaded, and what problems can reload cause?
30. What is an absolute import?
31. What is a relative import?
32. What causes circular imports?
33. How can circular imports be redesigned or mitigated?
34. What is importlib?
35. What are finders and loaders in the import system?
36. What is a virtual environment?
37. Why should projects use isolated environments?
38. What is the difference between pip, venv, pipx, Poetry, uv, and Conda at a high level?
39. What are pyproject.toml, build-system metadata, and project metadata?
40. What are wheels and source distributions?
41. What is semantic versioning?
42. What is dependency pinning?
43. What is a lock file?
44. How do editable installations work?
45. What is a console-script entry point?
46. How would you package and publish a Python library?
47. How can dependency confusion and supply-chain risks be reduced?

## Memory management, garbage collection, performance, and CPython internals

1. How does CPython memory management work at a high level?
2. What is reference counting?
3. What is cyclic garbage collection?
4. Why is cyclic garbage collection needed in addition to reference counting?
5. What are generations in the garbage collector?
6. How can garbage collection be inspected or controlled?
7. What is a reference cycle?
8. How can __del__ complicate object finalization?
9. What is weakref?
10. When are weak references useful?
11. What are WeakKeyDictionary, WeakValueDictionary, and finalize?
12. What is object interning?
13. Which small immutable objects may CPython reuse?
14. Why should code not rely on small-integer or string interning?
15. What is the private heap?
16. What are pymalloc arenas, pools, and blocks conceptually?
17. Why might process memory not fall after objects are deleted?
18. What is memory fragmentation?
19. How can tracemalloc be used?
20. How can sys.getsizeof be misleading for container memory?
21. How can the total retained size of an object graph be estimated?
22. What is a memory leak in a garbage-collected language?
23. What common Python patterns cause memory growth?
24. What is the GIL?
25. Why does CPython have historically used a GIL?
26. Does the GIL make Python code thread-safe?
27. Which operations may release the GIL?
28. How do free-threaded CPython builds change assumptions?
29. What are subinterpreters?
30. How do subinterpreters differ from threads and processes?
31. What is copy-on-write after fork?
32. What is the difference between shallow and deep copying?
33. How does copy.deepcopy handle recursive objects?
34. How can custom copy behavior be defined?
35. How are lists over-allocated?
36. How do dictionaries balance speed and memory?
37. What is bytecode specialization?
38. What is a JIT compiler, and how can it differ from CPython's default execution?
39. How do PyPy's performance characteristics differ from CPython's?
40. What is vectorization?
41. Why are NumPy operations often faster than Python loops?
42. What is the difference between profiling and benchmarking?
43. How should timeit be used?
44. How should cProfile and pstats be used?
45. How do line-level and memory profilers help?
46. Why should optimization follow measurement?
47. What are algorithmic, interpreter, allocation, I/O, and serialization bottlenecks?
48. How can caching improve performance, and when can it hurt correctness?
49. What is memoization?
50. How does functools.lru_cache work, and what are its limitations?

## Threading, multiprocessing, asyncio, and parallelism

1. What is the difference between concurrency and parallelism?
2. What is the difference between CPU-bound and I/O-bound work?
3. When should threads be used?
4. When should processes be used?
5. When should asyncio be used?
6. What is the threading module?
7. What is a race condition?
8. What is a critical section?
9. What is mutual exclusion?
10. How do Lock and RLock differ?
11. What are Semaphore and BoundedSemaphore?
12. What is a Condition?
13. What is an Event?
14. What is a Barrier?
15. What is thread-local storage?
16. How do queues support safe producer-consumer patterns?
17. What is a deadlock?
18. What is livelock?
19. What is starvation?
20. How can lock ordering prevent deadlocks?
21. Why can check-then-act code race despite the GIL?
22. What is multiprocessing?
23. How do fork, spawn, and forkserver start methods differ?
24. Why is if __name__ == '__main__' important with multiprocessing?
25. What must be pickleable for process-based execution?
26. What is interprocess communication?
27. How do Queue, Pipe, shared memory, and Manager differ?
28. What is a process pool?
29. What is concurrent.futures?
30. How do ThreadPoolExecutor and ProcessPoolExecutor differ?
31. What is a Future?
32. How are exceptions propagated through futures?
33. What is asyncio?
34. What is a coroutine?
35. What is an awaitable?
36. What is an event loop?
37. What is a Task?
38. What is the difference between creating a coroutine and scheduling a task?
39. What does await do?
40. What does asyncio.run do?
41. How does asyncio.gather handle results and exceptions?
42. What is asyncio.TaskGroup?
43. What is structured concurrency?
44. How does cancellation work?
45. Why should CancelledError usually be allowed to propagate?
46. How should cleanup be handled during cancellation?
47. What is asyncio.shield?
48. How do timeout context managers work?
49. What is backpressure in an asynchronous system?
50. How do async queues help implement backpressure?
51. What happens when blocking code runs on the event loop?
52. When should asyncio.to_thread or run_in_executor be used?
53. What are async iterators and async context managers?
54. What is the difference between asyncio concurrency and multi-core parallelism?
55. How can contextvars preserve request-local context across async tasks?
56. How would you limit concurrency when calling an external API?
57. How would you design retries without causing a retry storm?
58. How would you test asynchronous code deterministically?

## Type hints and modern Python

1. Why use type hints in a dynamically typed language?
2. Are annotations enforced at runtime?
3. What is gradual typing?
4. What is the difference between Any and object?
5. What is the difference between list[int] and typing.List[int]?
6. What is Union, and how does the | syntax work?
7. What does Optional mean?
8. Why does Optional not imply a default argument?
9. What is Literal?
10. What is Final?
11. What is ClassVar?
12. What is TypeAlias or the modern type-alias statement?
13. What is NewType?
14. What is a TypeVar?
15. What are bounded and constrained type variables?
16. What is generic variance?
17. What are covariant, contravariant, and invariant types?
18. Why are mutable containers usually invariant?
19. What is a generic class?
20. What is a generic function?
21. What is ParamSpec?
22. What is Concatenate?
23. What is TypeVarTuple?
24. What is Unpack?
25. How can **kwargs be typed using TypedDict and Unpack?
26. What is TypedDict?
27. What are Required and NotRequired fields?
28. What is a Protocol?
29. What is runtime_checkable?
30. What is structural subtyping?
31. What is Self?
32. What is Never or NoReturn?
33. What is overload from typing?
34. Does typing.overload implement runtime dispatch?
35. What is cast, and what does it do at runtime?
36. What are type guards and TypeIs?
37. What is Annotated?
38. What is a forward reference?
39. How are annotations evaluated in modern Python?
40. What changed with deferred annotation evaluation in Python 3.14?
41. What is get_type_hints?
42. How can decorators preserve callable types?
43. How do mypy, Pyright, and IDE type checkers differ conceptually?
44. How should third-party code without type hints be handled?
45. What are stub files?
46. What is py.typed?
47. What are the limitations of static typing in highly dynamic Python code?
48. What are pattern-matching exhaustiveness checks?
49. What recent Python features should a 2026 candidate know?
50. What are t-strings, subinterpreters, and free-threaded mode?

## Standard library, files, serialization, logging, and utilities

1. What is the difference between pathlib and os.path?
2. How do Path objects improve file-system code?
3. How should files be opened safely?
4. What is the difference between text mode and binary mode?
5. What do buffering and newline parameters control in open?
6. Why should file encodings be specified explicitly?
7. How can very large files be processed without loading them fully into memory?
8. What is memory mapping?
9. How do tempfile and TemporaryDirectory work?
10. What are shutil and glob used for?
11. How can atomic file replacement be implemented?
12. What is the difference between JSON and pickle?
13. Why is unpickling untrusted data unsafe?
14. What are pickle protocols?
15. What do __getstate__ and __setstate__ customize?
16. When should marshal not be used for application persistence?
17. What are csv dialects?
18. How should CSV files with newlines and encodings be handled?
19. How do json encoders and decoders handle custom types?
20. What is base64, and is it encryption?
21. What is the logging module?
22. Why is logging preferable to print in production?
23. What are log levels?
24. What are loggers, handlers, formatters, and filters?
25. What is structured logging?
26. How can request or correlation IDs be added to logs?
27. What is the difference between datetime, date, time, timedelta, and timezone?
28. What are naive and aware datetimes?
29. Why should UTC be used for storage?
30. How do zoneinfo and daylight-saving transitions work?
31. What are dataclasses, enum, and functools useful for?
32. What are deque, Counter, defaultdict, and ChainMap useful for?
33. What are heapq and bisect used for?
34. What does itertools provide?
35. What do contextlib and ExitStack provide?
36. What are secrets and random, and when should each be used?
37. What are hashlib and hmac used for?
38. How does subprocess differ from os.system?
39. How can shell-injection risk be avoided with subprocess?
40. What do signal handlers do?
41. What are argparse and configuration-file patterns?
42. How can environment variables be loaded and validated safely?
43. What is functools.cache versus lru_cache?
44. What is singledispatchmethod?
45. What do inspect, dis, ast, and sys.monitoring enable?
46. What is zstandard support in modern Python's standard library?

## Testing, mocking, debugging, linting, and code quality

1. What is the difference between unit, integration, contract, system, and end-to-end tests?
2. What makes a test deterministic?
3. What is test isolation?
4. What is the test pyramid?
5. What is pytest?
6. How does pytest test discovery work?
7. What is a pytest fixture?
8. What are fixture scopes?
9. How do yield fixtures perform teardown?
10. What is fixture parametrization?
11. What is test parametrization?
12. What are marks in pytest?
13. How do skip, skipif, and xfail differ?
14. What is conftest.py?
15. What are pytest plugins?
16. What is monkeypatch in pytest?
17. What is unittest?
18. What are setUp, tearDown, setUpClass, and tearDownClass?
19. What is doctest?
20. When is doctest useful, and when is it brittle?
21. What is a mock?
22. What is the difference between a mock, stub, spy, fake, and dummy?
23. What are Mock, MagicMock, AsyncMock, and PropertyMock?
24. What is autospec?
25. Why should you patch where an object is looked up rather than where it is defined?
26. What is side_effect?
27. How can calls and call order be asserted?
28. How do you mock context managers, iterators, generators, and async iterators?
29. When does excessive mocking reduce test value?
30. How would you test code that calls a database or external HTTP API?
31. What is dependency injection for testability?
32. What is a property-based test?
33. How does Hypothesis differ from example-based testing?
34. What is fuzz testing?
35. What is mutation testing?
36. What is code coverage, and what does it fail to prove?
37. What is branch coverage?
38. How should flaky tests be diagnosed?
39. How do timeouts, retries, random seeds, and clocks affect tests?
40. How can time-dependent code be tested?
41. How can concurrency bugs be tested?
42. How can an ML pipeline be tested without retraining a large model?
43. How should LLM application tests handle nondeterministic outputs?
44. What is snapshot testing?
45. What is contract testing for APIs?
46. How do pdb and breakpoint work?
47. How can traceback information be interpreted?
48. What are logging-based and tracing-based debugging?
49. What are linters, formatters, and static analyzers?
50. How do Ruff, Black, pylint, mypy, and Pyright complement one another?
51. What are pre-commit hooks?
52. What should a Python CI pipeline run?
53. How should test data and secrets be managed in CI?
54. What is cyclomatic complexity?
55. How can code review identify Python-specific bugs?

## Backend Python, APIs, frameworks, databases, and distributed work

1. What is WSGI?
2. What is ASGI?
3. How do WSGI and ASGI differ?
4. What is the request-response lifecycle in a Python web application?
5. How do Django, Flask, and FastAPI differ?
6. When would you choose Django over Flask or FastAPI?
7. When would you choose FastAPI for an AI service?
8. What is middleware?
9. How does dependency injection work in FastAPI?
10. What is Pydantic validation?
11. What are synchronous and asynchronous route handlers?
12. Why does declaring a route async not automatically make blocking libraries asynchronous?
13. How should API input validation be designed?
14. How should API errors be represented?
15. What is REST?
16. What are idempotent HTTP methods?
17. What is the difference between PUT and PATCH?
18. What are status codes commonly used for validation, authentication, authorization, conflict, and rate limiting?
19. What is content negotiation?
20. What is API pagination?
21. What are offset and cursor pagination trade-offs?
22. What is API versioning?
23. What is OpenAPI?
24. What are authentication and authorization?
25. How do sessions, API keys, OAuth 2.0, and JWTs differ?
26. What are common JWT security mistakes?
27. What is CORS?
28. What is CSRF?
29. What is SQL injection, and how do parameterized queries prevent it?
30. What is an ORM?
31. What is the unit-of-work pattern?
32. What is an identity map?
33. What is the N+1 query problem?
34. What are eager and lazy loading?
35. What is a database transaction?
36. What are isolation levels?
37. What is optimistic versus pessimistic locking?
38. What is connection pooling?
39. How should database sessions be scoped in web requests?
40. What is SQLAlchemy's session lifecycle?
41. What are migrations?
42. How do schema migrations differ from data migrations?
43. What is caching?
44. What are cache-aside, write-through, write-behind, and read-through patterns?
45. What are cache invalidation and cache stampedes?
46. How can Redis be used from Python?
47. What is a distributed lock, and why is it difficult?
48. What is Celery?
49. What are brokers and result backends?
50. How should Celery tasks be made idempotent?
51. How are retries and acknowledgments handled in task queues?
52. What is at-most-once, at-least-once, and effectively-once processing?
53. How would you design a background job for long-running ML inference?
54. How would you stream an LLM response through an API?
55. How would you enforce per-user rate limits?
56. How would you add tracing, metrics, and structured logs to a Python service?
57. How do Gunicorn, Uvicorn, and worker models relate?
58. How would you containerize and deploy a Python API?
59. How would you perform graceful shutdown?
60. How would you prevent secrets from being committed or logged?

## NumPy

1. What problem does NumPy solve?
2. What is an ndarray?
3. How do shape, ndim, size, dtype, itemsize, and strides differ?
4. Why are NumPy arrays usually faster and more memory efficient than Python lists?
5. How are NumPy arrays created?
6. What is the difference between arange and linspace?
7. What are zeros, ones, empty, full, eye, and identity?
8. What is a dtype?
9. What is type promotion in NumPy?
10. What are structured arrays?
11. What is vectorization?
12. What is broadcasting?
13. What are NumPy's broadcasting rules?
14. When can broadcasting cause unexpectedly large temporary arrays?
15. What is the difference between basic indexing and advanced indexing?
16. Which indexing operations return views, and which return copies?
17. What is the difference between a view and a copy?
18. What do base and shares_memory reveal?
19. What is the difference between reshape, resize, flatten, ravel, and squeeze?
20. What are C-order and Fortran-order arrays?
21. What does contiguous memory mean?
22. What is an axis?
23. How do reductions behave across axes?
24. What is the difference between concatenate, stack, vstack, hstack, and column_stack?
25. How do split, array_split, hsplit, and vsplit differ?
26. What is boolean masking?
27. What is fancy indexing?
28. What are ufuncs?
29. What do reduce, accumulate, outer, and at do on ufuncs?
30. What is the difference between dot, matmul, inner, outer, and element-wise multiplication?
31. How do NaN-aware reductions differ from regular reductions?
32. How does random number generation work with Generator and seeds?
33. How can reproducibility be improved with NumPy random generators?
34. What are memory-mapped arrays?
35. How would you optimize a slow NumPy computation?
36. How do NumPy arrays interact with Pandas, SciPy, scikit-learn, and PyTorch?

## Pandas and analytical Python

1. What are Series and DataFrame?
2. How do Index objects work?
3. What is label alignment in Pandas?
4. What is the difference between loc and iloc?
5. What are at and iat?
6. What is boolean indexing?
7. What is chained indexing?
8. What was SettingWithCopyWarning trying to signal?
9. What is copy-on-write in modern Pandas?
10. How do read_csv parameters affect performance and correctness?
11. How can a large CSV be processed in chunks?
12. Why should dtypes be specified when reading large datasets?
13. What are nullable dtypes?
14. How do NaN, None, NaT, and pandas.NA differ?
15. How are missing values detected, dropped, or filled?
16. What is the difference between fillna, interpolate, and model-based imputation?
17. How do concat, merge, join, and combine_first differ?
18. What are inner, left, right, outer, cross, semi, and anti joins conceptually?
19. How can merge cardinality be validated?
20. What is groupby and split-apply-combine?
21. What is the difference between agg, transform, apply, and filter?
22. Why can groupby.apply be slower than built-in aggregations?
23. What are pivot, pivot_table, melt, stack, and unstack?
24. What is a MultiIndex?
25. When is a MultiIndex useful or harmful?
26. How do sort_values and sort_index differ?
27. How are duplicates detected and removed?
28. How do categorical dtypes improve memory and semantics?
29. How does Pandas handle dates, time zones, periods, and timedeltas?
30. What is resampling?
31. What are rolling, expanding, and exponentially weighted windows?
32. What is the difference between map, apply, applymap-style element operations, and vectorized methods?
33. Why should row-wise apply often be avoided?
34. How can DataFrame memory usage be measured and reduced?
35. What is query and eval?
36. What are the risks of object dtype?
37. When should Parquet be preferred over CSV?
38. How do Pandas and Polars differ?
39. What is lazy execution in Polars?
40. When should DuckDB, Polars, Dask, or PySpark replace Pandas?
41. How would you identify the top N records per group?
42. How would you calculate a seven-day rolling average per customer?
43. How would you join slowly changing dimension data to events?
44. How would you detect data leakage during Pandas preprocessing?
45. How would you write memory-efficient feature engineering code?

## Data engineering, PySpark, Airflow, and pipelines

1. How is Python used in data engineering?
2. What makes a data pipeline idempotent?
3. What is schema evolution?
4. What is data lineage?
5. What are batch and streaming pipelines?
6. What is event time versus processing time?
7. What are watermarks and late-arriving data?
8. What is exactly-once processing, and when is it only an approximation?
9. How should retries and partial failures be handled in ETL?
10. How can large files be streamed and partitioned?
11. What is columnar storage?
12. Why are Parquet and Arrow important?
13. What is predicate pushdown?
14. What is partition pruning?
15. What is Apache Spark?
16. What is PySpark?
17. What is the difference between RDDs, DataFrames, and Datasets conceptually?
18. What are transformations and actions?
19. What is lazy evaluation in Spark?
20. What are narrow and wide transformations?
21. What causes a shuffle?
22. How can shuffle costs be reduced?
23. What is data skew?
24. How can skewed joins be handled?
25. What is a broadcast join?
26. What is the Catalyst optimizer?
27. What is Tungsten execution?
28. What is the difference between repartition and coalesce?
29. What is the difference between cache and persist?
30. Why are Python UDFs often slower than built-in Spark expressions?
31. What are vectorized Pandas UDFs?
32. What is the Arrow boundary in PySpark?
33. How do window functions work in PySpark?
34. How would you deduplicate events in a Spark pipeline?
35. How would you process incremental data?
36. What is checkpointing in Spark streaming?
37. What is Airflow?
38. What are DAGs, tasks, operators, sensors, and hooks?
39. What is the difference between scheduling time and execution time in Airflow?
40. What is a backfill?
41. What are catchup and start_date pitfalls?
42. How should XCom be used, and what should not be placed in XCom?
43. What is dynamic task mapping?
44. How do retries, pools, queues, and concurrency limits work?
45. How can an Airflow DAG be made idempotent and testable?
46. How would you orchestrate model training, evaluation, registration, and deployment?
47. How would you validate data quality before downstream use?
48. What are data contracts?
49. How would you monitor freshness, volume, schema, and distribution changes?

## Machine learning and scikit-learn

1. What is the difference between AI, machine learning, and deep learning?
2. What is supervised learning?
3. What is unsupervised learning?
4. What is semi-supervised learning?
5. What is self-supervised learning?
6. What is reinforcement learning?
7. What is classification?
8. What is regression?
9. What is clustering?
10. What is dimensionality reduction?
11. What is anomaly detection?
12. What is overfitting?
13. What is underfitting?
14. What is the bias-variance trade-off?
15. Why are train, validation, and test sets needed?
16. What is data leakage?
17. What are target leakage and temporal leakage?
18. What is cross-validation?
19. When should stratified, grouped, nested, or time-series cross-validation be used?
20. Why is random cross-validation inappropriate for some datasets?
21. What is a baseline model?
22. What is feature engineering?
23. What is feature selection?
24. What are filter, wrapper, and embedded feature-selection methods?
25. What is standardization?
26. What is normalization?
27. Which algorithms are sensitive to feature scale?
28. How should categorical variables be encoded?
29. What are one-hot, ordinal, frequency, target, and embedding encodings?
30. How can target encoding leak information?
31. How should missing data be handled?
32. How should outliers be handled?
33. What is class imbalance?
34. How do class weights, resampling, thresholding, and anomaly detection address imbalance?
35. What is a confusion matrix?
36. What are precision, recall, specificity, F1, and balanced accuracy?
37. What are ROC-AUC and PR-AUC?
38. When is PR-AUC more informative than ROC-AUC?
39. What is log loss?
40. What are MAE, MSE, RMSE, MAPE, and R-squared?
41. What is probability calibration?
42. What are calibration curves, Platt scaling, and isotonic regression?
43. How does linear regression work?
44. What assumptions underlie ordinary least squares?
45. What is multicollinearity?
46. What are ridge, lasso, and elastic-net regularization?
47. How does logistic regression work?
48. Why does logistic regression use log-odds?
49. How does a decision tree choose a split?
50. What are entropy, Gini impurity, and information gain?
51. How can decision-tree overfitting be controlled?
52. How does a random forest work?
53. What is bagging?
54. What is boosting?
55. How do gradient boosting, XGBoost, LightGBM, and CatBoost differ conceptually?
56. How does K-nearest neighbors work?
57. How does an SVM work?
58. What are margins, support vectors, kernels, and the C parameter?
59. How does Naive Bayes work?
60. What assumptions do Gaussian, Multinomial, and Bernoulli Naive Bayes make?
61. How does k-means work?
62. How can the number of clusters be selected?
63. What are silhouette score, inertia, and cluster stability?
64. How do hierarchical clustering and DBSCAN differ from k-means?
65. What is PCA?
66. How does PCA relate to covariance and singular-value decomposition?
67. What is explained variance?
68. What is the curse of dimensionality?
69. What is a scikit-learn estimator?
70. What are fit, transform, fit_transform, predict, and predict_proba?
71. What is a Pipeline?
72. How does a Pipeline prevent leakage?
73. What is ColumnTransformer?
74. What are GridSearchCV, RandomizedSearchCV, and successive halving?
75. How should hyperparameter search spaces be chosen?
76. What is nested cross-validation?
77. How do custom scorers work?
78. How should random_state be used?
79. How can a custom transformer be implemented?
80. How can a model be persisted safely?
81. What are the risks of pickle-based model loading?
82. How would you implement linear regression or k-means from scratch?
83. How would you debug a model that performs well offline but poorly in production?

## Deep learning, PyTorch, NLP, and computer vision

1. What is a neural network?
2. What are weights, biases, activations, and layers?
3. What is a loss function?
4. What is forward propagation?
5. What is backpropagation?
6. How does automatic differentiation work?
7. What is a computation graph?
8. What is gradient descent?
9. How do batch, stochastic, and mini-batch gradient descent differ?
10. How do SGD, momentum, RMSProp, Adam, and AdamW differ?
11. What is a learning-rate schedule?
12. What are vanishing and exploding gradients?
13. What is gradient clipping?
14. What are sigmoid, tanh, ReLU, Leaky ReLU, GELU, and softmax?
15. Why can sigmoid saturate?
16. What is weight initialization?
17. What are Xavier and He initialization?
18. What is batch normalization?
19. What is layer normalization?
20. What is dropout?
21. What is early stopping?
22. What is transfer learning?
23. What is fine-tuning?
24. What is data augmentation?
25. What is a convolution?
26. Why are CNNs effective for images?
27. What are kernel size, stride, padding, dilation, and receptive field?
28. What is pooling?
29. What are residual connections?
30. What are RNNs, LSTMs, and GRUs?
31. What is teacher forcing?
32. What is attention?
33. What is self-attention?
34. What are queries, keys, and values?
35. What is positional encoding?
36. What is an embedding?
37. What is cosine similarity?
38. What are tokenization and subword units?
39. What are encoder-only, decoder-only, and encoder-decoder architectures?
40. What is PyTorch autograd?
41. What do requires_grad, backward, grad, no_grad, and inference_mode do?
42. What are Dataset and DataLoader?
43. How do batching, shuffling, workers, and pinned memory affect training?
44. What is model.train versus model.eval?
45. How are checkpoints saved and restored?
46. What is mixed-precision training?
47. How do autocast and GradScaler work?
48. What are gradient accumulation and gradient checkpointing?
49. What are data parallelism, distributed data parallelism, and model parallelism?
50. How can training be made reproducible?
51. Why can GPU operations be nondeterministic?
52. How would you diagnose GPU out-of-memory errors?
53. How would you speed up PyTorch training or inference?
54. How should image, text, or tabular model errors be analyzed?

## LLMs, prompt engineering, RAG, vector search, and agents

1. What is a large language model?
2. How does autoregressive next-token prediction work?
3. What is a token?
4. What is a context window?
5. What is a transformer?
6. How does scaled dot-product attention work?
7. Why is attention divided by the square root of the key dimension?
8. What is multi-head attention?
9. What are residual connections and layer normalization doing in transformers?
10. What is causal masking?
11. What is pretraining?
12. What is instruction tuning?
13. What is supervised fine-tuning?
14. What are RLHF, DPO, and preference optimization conceptually?
15. What is temperature?
16. What are top-k and top-p sampling?
17. What is greedy decoding?
18. What is beam search?
19. What are repetition and frequency penalties?
20. What is hallucination?
21. How can hallucinations be measured and reduced?
22. What is prompt engineering?
23. What are system, developer, user, and tool messages conceptually?
24. What is few-shot prompting?
25. What is chain-of-thought prompting, and when should reasoning traces not be requested or exposed?
26. What is structured output?
27. How should JSON-schema-constrained output be validated?
28. What is function or tool calling?
29. How should tool arguments be validated before execution?
30. What is prompt injection?
31. What is indirect prompt injection?
32. How can prompt-injection risk be reduced?
33. Why are prompt-only defenses insufficient?
34. What is retrieval-augmented generation?
35. Why use RAG instead of only fine-tuning?
36. What are the ingestion, indexing, retrieval, and generation stages of RAG?
37. What is document parsing?
38. How should PDFs, tables, images, and scanned documents be ingested?
39. What are fixed-size, recursive, semantic, sentence, parent-child, and sliding-window chunking?
40. How should chunk size and overlap be selected?
41. What are embeddings?
42. How are embedding models evaluated?
43. What is a vector database?
44. What are cosine similarity, dot product, and Euclidean distance?
45. When should embeddings be normalized?
46. What is approximate nearest-neighbor search?
47. What are HNSW, IVF, and product quantization conceptually?
48. What is sparse retrieval such as BM25?
49. What is dense retrieval?
50. What is hybrid retrieval?
51. What is reciprocal-rank fusion?
52. What is reranking?
53. What is the difference between a bi-encoder and cross-encoder?
54. What is metadata filtering?
55. How should multi-tenant access control be enforced in retrieval?
56. What are Recall@k, Precision@k, MRR, nDCG, and hit rate?
57. How should retrieval be evaluated separately from generation?
58. What are groundedness, faithfulness, answer relevance, and citation correctness?
59. What is a golden evaluation dataset?
60. How can LLM-as-a-judge be calibrated and checked for bias?
61. What are RAGAS-style evaluation dimensions?
62. What is query rewriting?
63. What are multi-query and hypothetical-document retrieval?
64. What is contextual compression?
65. What is agentic RAG?
66. What is GraphRAG?
67. What is a knowledge graph, and when does it help retrieval?
68. How should stale, duplicate, or deleted documents be handled in an index?
69. How can vector indexes be versioned and rebuilt safely?
70. What is an AI agent?
71. How does an agent differ from a deterministic workflow?
72. When should an agent not be used?
73. What are planner-executor and router patterns?
74. What are ReAct-style tool-use loops?
75. What is short-term versus long-term agent memory?
76. How should memory be scoped, expired, and protected?
77. What is a multi-agent system?
78. What coordination and failure risks arise in multi-agent systems?
79. How can infinite tool loops be prevented?
80. How should maximum steps, budgets, timeouts, and approvals be enforced?
81. What is human-in-the-loop approval?
82. How should dangerous or irreversible actions be gated?
83. What are guardrails?
84. How should PII, secrets, and regulated data be handled?
85. How can an LLM application resist data exfiltration?
86. What is model routing?
87. How can latency and cost be reduced using caching, batching, smaller models, and prompt compression?
88. What is semantic caching?
89. How should streaming responses and cancellation be implemented in Python?
90. How do synchronous and asynchronous LLM clients differ?
91. How should rate limits and transient provider failures be handled?
92. What are exponential backoff and jitter?
93. How should model-provider fallbacks be designed?
94. What is LoRA?
95. What is QLoRA?
96. What is quantization?
97. What is knowledge distillation?
98. When should fine-tuning be chosen over RAG or prompting?
99. How would you evaluate a production LLM assistant end to end?
100. How would you design a secure enterprise RAG service in Python?
101. How would you test a tool-using agent?
102. How would you observe prompts, retrievals, tool calls, tokens, latency, cost, and failures?

## MLOps, deployment, monitoring, and ML system design

1. What is MLOps?
2. What should be versioned in an ML project?
3. What is experiment tracking?
4. What is data and model lineage?
5. What is a model registry?
6. What is reproducible training?
7. How should random seeds, environments, code, and data snapshots be recorded?
8. What is a feature store?
9. What is training-serving skew?
10. What is online versus offline feature computation?
11. What is batch inference?
12. What is online inference?
13. What is streaming inference?
14. How do latency, throughput, freshness, and cost trade off?
15. What is a canary deployment?
16. What is a shadow deployment?
17. What is blue-green deployment?
18. How is A/B testing used for ML models?
19. What are model, data, concept, and prediction drift?
20. How can drift be detected?
21. What should be monitored when labels are delayed?
22. What are proxy metrics?
23. How should performance be backfilled when ground truth arrives?
24. What are service-level indicators and objectives for an ML service?
25. How should feature, prediction, latency, error, and business metrics be monitored?
26. How should a model rollback be performed?
27. How can model artifacts be signed and verified?
28. How should model endpoints be secured?
29. How should data privacy and retention be managed?
30. How can bias and fairness be monitored?
31. What is model explainability?
32. When are SHAP, permutation importance, and local explanations useful?
33. What is a feedback loop in an ML system?
34. What is selection bias caused by deployed model decisions?
35. How should retraining triggers be designed?
36. How can retraining pipelines be made safe and idempotent?
37. How would you design a real-time fraud-detection system?
38. How would you design a recommendation system?
39. How would you design a churn-prediction platform?
40. How would you design a document-question-answering system?
41. How would you design an LLM customer-support assistant?
42. How would you scale inference to millions of requests?
43. How would you optimize GPU utilization?
44. How do batching, dynamic batching, quantization, compilation, and caching affect serving?
45. How should asynchronous Python be used in an inference gateway?
46. How can graceful degradation be implemented when a model or dependency fails?
47. How would you conduct capacity planning for an AI service?
48. How would you debug a sudden production-quality regression?
49. How would you balance accuracy, latency, cost, interpretability, and safety?

## Python coding and implementation questions

1. Reverse a string without slicing.?
2. Determine whether a string is a palindrome after normalization.?
3. Find the first non-repeating character in a string.?
4. Find the first repeating character in a string.?
5. Count the frequency of every character in a string.?
6. Check whether two strings are anagrams.?
7. Find the longest common prefix among strings.?
8. Find the longest substring without repeating characters.?
9. Find the longest palindromic substring.?
10. Compress a string using run-length encoding.?
11. Decode a run-length-encoded string.?
12. Validate balanced parentheses, brackets, and braces.?
13. Remove adjacent duplicate characters repeatedly.?
14. Group a list of words into anagrams.?
15. Find all occurrences of a substring, including overlapping matches.?
16. Implement substring search without using find.?
17. Convert a Roman numeral to an integer.?
18. Convert an integer to a Roman numeral.?
19. Parse a string into an integer with sign and overflow rules.?
20. Evaluate a simple arithmetic expression.?
21. Find the second-largest distinct value in a list.?
22. Find the k-th largest value in an unsorted list.?
23. Find duplicate values and their counts.?
24. Remove duplicates while preserving order.?
25. Move all zeros to the end while preserving other order.?
26. Rotate a list by k positions.?
27. Merge two sorted lists.?
28. Find the intersection of two lists with and without duplicate counts.?
29. Find the union of multiple lists while preserving first occurrence.?
30. Find a missing number from a consecutive range.?
31. Find all missing ranges in sorted data.?
32. Solve Two Sum.?
33. Solve Three Sum.?
34. Find a subarray with a target sum.?
35. Find the maximum-sum contiguous subarray.?
36. Find the maximum product subarray.?
37. Find the longest increasing subsequence.?
38. Merge overlapping intervals.?
39. Insert an interval into sorted non-overlapping intervals.?
40. Find meeting-room conflicts.?
41. Find the minimum number of meeting rooms required.?
42. Implement binary search iteratively and recursively.?
43. Find the first and last positions of a value in a sorted list.?
44. Search a rotated sorted array.?
45. Find a peak element.?
46. Compute integer square root using binary search.?
47. Sort a list using merge sort.?
48. Sort a list using quicksort.?
49. Explain and implement stable sorting.?
50. Implement counting sort for a bounded integer range.?
51. Find the top k frequent elements.?
52. Maintain the median of a data stream.?
53. Merge k sorted iterables lazily.?
54. Implement a stack using queues.?
55. Implement a queue using stacks.?
56. Implement a min stack.?
57. Implement a circular queue.?
58. Implement a singly linked list.?
59. Reverse a linked list.?
60. Detect a cycle in a linked list.?
61. Find the middle node of a linked list.?
62. Merge two sorted linked lists.?
63. Remove the n-th node from the end.?
64. Implement a doubly linked list.?
65. Traverse a binary tree recursively and iteratively.?
66. Perform breadth-first traversal of a binary tree.?
67. Calculate the maximum depth of a binary tree.?
68. Check whether a binary tree is balanced.?
69. Validate a binary search tree.?
70. Find the lowest common ancestor in a tree.?
71. Serialize and deserialize a binary tree.?
72. Invert a binary tree.?
73. Find connected components in a graph.?
74. Implement depth-first and breadth-first graph search.?
75. Detect a cycle in a directed graph.?
76. Topologically sort a directed acyclic graph.?
77. Find the shortest path in an unweighted graph.?
78. Implement Dijkstra's algorithm.?
79. Count islands in a two-dimensional grid.?
80. Perform flood fill.?
81. Find the shortest path through a grid with obstacles.?
82. Solve the word-search problem using backtracking.?
83. Generate all permutations of a sequence.?
84. Generate all combinations of k elements.?
85. Generate the power set.?
86. Solve the N-Queens problem.?
87. Solve Sudoku using backtracking.?
88. Compute Fibonacci numbers using recursion, memoization, iteration, and matrix methods.?
89. Compute factorial iteratively and recursively.?
90. Calculate the greatest common divisor and least common multiple.?
91. Test whether a number is prime.?
92. Generate primes using the Sieve of Eratosthenes.?
93. Find prime factors of an integer.?
94. Check whether a number is an Armstrong number.?
95. Find all pairs whose sum equals a target.?
96. Calculate frequencies using Counter and without Counter.?
97. Flatten a nested list recursively.?
98. Flatten an arbitrarily nested iterable while treating strings atomically.?
99. Transpose a matrix.?
100. Rotate a square matrix by 90 degrees.?
101. Multiply two matrices without NumPy.?
102. Find the spiral traversal of a matrix.?
103. Find the maximum value in each sliding window.?
104. Implement a fixed-size moving average.?
105. Implement an LRU cache.?
106. Implement an LFU cache.?
107. Implement a trie.?
108. Implement autocomplete using a trie.?
109. Implement a priority queue wrapper.?
110. Implement a disjoint-set or union-find structure.?
111. Implement a thread-safe singleton and discuss whether it is necessary.?
112. Implement a rate limiter.?
113. Implement exponential backoff with jitter.?
114. Implement a retry decorator that preserves metadata.?
115. Implement a timing decorator supporting sync and async functions.?
116. Implement a memoization decorator with bounded size.?
117. Implement a context manager for a database transaction.?
118. Implement a custom iterator for paginated API results.?
119. Implement a generator that streams records from a large file.?
120. Implement a producer-consumer pipeline with a queue.?
121. Implement an asynchronous bounded-concurrency HTTP fetcher.?
122. Implement a worker pool with graceful shutdown.?
123. Implement a simple event emitter.?
124. Implement a plugin registry using decorators.?
125. Implement a descriptor that validates positive numbers.?
126. Implement an immutable value object.?
127. Implement a custom mapping type.?
128. Implement deep merge for nested dictionaries.?
129. Compare two nested structures and report differences.?
130. Read a large CSV and compute aggregations in chunks.?
131. Join two datasets that do not fit in memory.?
132. Find duplicate records in a large stream.?
133. Maintain top-k items from an unbounded stream.?
134. Sample k items uniformly from a stream using reservoir sampling.?
135. Implement linear regression using only NumPy.?
136. Implement logistic regression using gradient descent.?
137. Implement k-means clustering using NumPy.?
138. Implement KNN from scratch.?
139. Implement a decision-tree split using Gini impurity.?
140. Build a scikit-learn-compatible custom transformer.?
141. Write a leakage-safe preprocessing and modeling pipeline.?
142. Write code to calculate precision, recall, F1, and confusion matrix.?
143. Write code to find the optimal classification threshold for a business cost function.?
144. Write a mini-batch data loader.?
145. Implement cosine similarity and top-k vector search.?
146. Implement chunking with overlap for a RAG pipeline.?
147. Build a minimal in-memory RAG prototype.?
148. Build a FastAPI endpoint that validates input and streams model output.?
149. Implement an async tool-calling loop with maximum-step and timeout limits.?
150. Write tests for an external-API client using mocks and contract fixtures.?
151. Debug a deliberately broken Python snippet involving mutable defaults.?
152. Predict the output of code involving closures and late binding.?
153. Predict the output of code involving shallow copies and nested lists.?
154. Predict the output of code involving class and instance attributes.?
155. Predict the output of code involving multiple inheritance and super.?
156. Predict the output of code involving generators, send, and yield from.?
157. Predict the output of code involving try, return, and finally.?
158. Predict the output of code involving async task scheduling and cancellation.?

## Project, architecture, and behavioral questions

1. Explain one Python project from problem statement to production outcome.?
2. What was your exact contribution to the project?
3. Why did you choose Python for the project?
4. Why did you choose the libraries and frameworks you used?
5. What alternatives did you evaluate?
6. What was the hardest technical problem?
7. What failed, and what did you learn?
8. How did you test the system?
9. How did you profile and optimize the code?
10. How did you handle errors and partial failures?
11. How did you manage configuration and secrets?
12. How did you structure the repository?
13. How did you enforce code quality?
14. How did you deploy the application?
15. How did you monitor it in production?
16. What production incident did you handle?
17. How did you identify the root cause?
18. What preventive action did you take afterward?
19. How did you make the service scalable?
20. How did you make the pipeline reproducible?
21. How did you prevent data leakage?
22. How did you choose the evaluation metrics?
23. How did you explain the model to stakeholders?
24. What business impact did the project achieve?
25. What trade-off did you make between accuracy, latency, and cost?
26. What would you redesign today?
27. How did you collaborate with data scientists, engineers, product managers, or domain experts?
28. Describe a technical disagreement and how it was resolved.?
29. Describe a time you received difficult code-review feedback.?
30. Describe a time you improved a teammate's design without taking ownership away from them.?
31. Describe a time requirements were ambiguous.?
32. Describe a time you had to deliver under a tight deadline.?
33. Describe a time you reduced technical debt.?
34. Describe a time you balanced speed against maintainability.?
35. Describe a time you mentored another developer.?
36. How do you review AI-generated Python code?
37. How do you verify that an AI assistant has not invented an API or dependency?
38. How do you protect private code and data when using AI tools?
39. How would you use an AI coding assistant during a debugging exercise?
40. What questions would you ask before accepting responsibility for an existing Python or ML system?

## Research sources

The questions were synthesized and expanded from the following sources. Official documentation was used to validate current language and library topic coverage; interview guides and candidate reports were used to identify interview emphasis.

- **S1.** [Python Developer interview reports updated May 2026 (Glassdoor)](https://www.glassdoor.com/Interview/Python-Developer-Interview-Questions-E6681373.htm)
- **S2.** [LG Soft India Python Developer report: generators, decorators, GIL, memory, threads, async](https://www.glassdoor.com/Interview/They-asked-about-python-concepts-like-generators-decorators-GIL-Memory-management-Threads-Async-etc-and-the-projects-QTN_9084483.htm)
- **S3.** [Fynd Backend Engineer report: tuple/list, copies, decorators, GIL, generators, memory, Two Sum](https://www.glassdoor.com/Interview/Python-language-questions-tuple-vs-lists-Shallow-vs-deep-copy-Decorators-Scaling-backend-questions-GIL-Generato-QTN_7525978.htm)
- **S4.** [Cognifyz Python Intern interview, August 2025](https://www.geeksforgeeks.org/interview-experiences/company-name-interview-experience-for-job-title-141/)
- **S5.** [Sigmoid Data Science Intern 2025 interview report](https://www.geeksforgeeks.org/interview-experiences/sigmoid-interview-experience-data-science-intern-2025-on-campus-bit-mesra/)
- **S6.** [Amazon ML Intern 2025 interview report](https://www.geeksforgeeks.org/interview-experiences/interview-experience-at-amazon-ml-intern-position-2025/)
- **S7.** [DataCamp Python interview guide, updated April 30, 2026](https://www.datacamp.com/blog/top-python-interview-questions-and-answers)
- **S8.** [DataInterview Python questions, 2026](https://www.datainterview.com/blog/python-interview-questions)
- **S9.** [Official Python 3.14 documentation](https://docs.python.org/3/)
- **S10.** [Official Python data model](https://docs.python.org/3/reference/datamodel.html)
- **S11.** [Official Python typing documentation](https://docs.python.org/3/library/typing.html)
- **S12.** [Official Python asyncio documentation](https://docs.python.org/3/library/asyncio.html)
- **S13.** [Official Python functools and contextlib documentation](https://docs.python.org/3/library/functools.html)
- **S14.** [Official Python unittest.mock documentation](https://docs.python.org/3/library/unittest.mock.html)
- **S15.** [Real Python decorator guide](https://realpython.com/primer-on-python-decorators/)
- **S16.** [Real Python asyncio guide](https://realpython.com/async-io-python/)
- **S17.** [DataVidhya Python Data Engineering interview questions for 2026](https://datavidhya.com/blog/python-data-engineering-interview-questions/)
- **S18.** [DataCamp PySpark interview guide, updated March 3, 2026](https://www.datacamp.com/blog/pyspark-interview-questions)
- **S19.** [Official NumPy user guide](https://numpy.org/doc/stable/user/)
- **S20.** [Official Pandas user guide](https://pandas.pydata.org/docs/user_guide/index.html)
- **S21.** [Official scikit-learn user guide](https://scikit-learn.org/stable/user_guide.html)
- **S22.** [Official PyTorch documentation](https://docs.pytorch.org/docs/stable/index.html)
- **S23.** [CoPrep AI Engineer questions for 2026](https://www.coprep.ai/blog/top-ai-engineer-interview-questions-in-2026-llms-rag-agents-and-langchain)
- **S24.** [DataCamp RAG interview guide, updated January 22, 2026](https://www.datacamp.com/blog/rag-interview-questions)
- **S25.** [CodeSubmit Python interview bank for 2026](https://www.codesubmit.io/interview/python)
- **S26.** [TestMu AI pytest interview questions, 2026](https://www.testmuai.com/learning-hub/pytest-interview-questions/)

## Research limitations

- No source can verify every question asked by every employer.
- Candidate-report sites contain self-reported information and may omit context or exact wording.
- Some interview databases expose only a sample without an account.
- Framework and library questions change with releases; review the official documentation before an interview.
- Company-specific coding questions may be protected by confidentiality agreements and should not be treated as guaranteed future questions.

---

Prepared as a question-only practice bank for Python, backend, data engineering, data science, machine learning, and AI engineering profiles.
