# Link audit report

Final automated validation:

- HTML pages checked: **108**
- Static local references checked: **2,020**
- Broken, missing, root-escaping, or invalid local references: **0**
- JavaScript navigation registry targets checked: **105**
- Missing JavaScript navigation targets: **0**
- JavaScript files passing syntax checks: **all**
- Pages containing the **Switch job** brand block: **108 / 108**

The old `genai-portal` wrapper paths, Windows `file:///C:/...` paths, and hard-coded repository-root links were removed.

The original `EnM Agents.xlsx` and `enm_dump.txt` files were referenced by the source course but were not included in the supplied archive. Those two broken references now open an included repository-safe exercise resource page instead.
