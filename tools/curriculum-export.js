#!/usr/bin/env node
/* The only bridge between the manifest and the Python validator.
 *
 * assets/curriculum.js is authored for the browser, so it must stay valid
 * JavaScript. Rather than have validate.py parse JavaScript with regular
 * expressions -- which is how a second, silently diverging copy of the
 * curriculum gets born -- it requires() the real file and prints it as JSON.
 * One copy of the data, one parser per language, no transcription.
 *
 * Usage: node tools/curriculum-export.js
 */
"use strict";

const path = require("path");

try {
  const manifest = require(path.join(__dirname, "..", "assets", "curriculum.js"));
  process.stdout.write(JSON.stringify(manifest, null, 2));
} catch (err) {
  process.stderr.write("curriculum-export: could not load assets/curriculum.js\n" + err.stack + "\n");
  process.exit(1);
}
