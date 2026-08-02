'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT_DIR } = require('./manifest');

const CHARTS_SRC_DIR = path.join(ROOT_DIR, 'src', 'components', 'charts');

// Chart props interfaces are declared non-exported and re-exported at the
// bottom of the file (`export type { BarChartProps }`), so matching on
// `export interface` alone misses ten of the twelve charts. Brace-match from
// the opening brace instead of regexing the body — props types contain nested
// object literals, and a lazy regex truncates them.
const DECLARATION = /(?:export\s+)?interface\s+(\w*Props)\s*(?:<[^{]*?>)?\s*\{/;

function extractPropsInterface(source) {
  const match = DECLARATION.exec(source);
  if (!match) return null;

  const openIndex = match.index + match[0].length - 1;
  let depth = 0;

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return { name: match[1], text: source.slice(match.index, i + 1) };
      }
    }
  }

  return null;
}

// Both the llms.txt emitter and the markdown-docs emitter need this exact
// read-then-extract step. It lives here so neither has to reimplement it.
function readPropsInterface(chart) {
  const sourcePath = path.join(CHARTS_SRC_DIR, chart.name, chart.propsSourceFile);
  const extracted = extractPropsInterface(fs.readFileSync(sourcePath, 'utf8'));
  if (!extracted) {
    throw new Error(
      `Could not extract a Props interface for "${chart.name}" from ${chart.propsSourceFile}. ` +
      'Update propsSourceFile in registry/manifest.js.'
    );
  }
  return extracted;
}

module.exports = { extractPropsInterface, readPropsInterface };
