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
//
// The interface is looked up by name rather than by "first one that ends in
// Props". Every chart declares exactly one `<ExportName>Props` today, but
// nothing stops a future chart from declaring a helper type like
// `TooltipRendererProps` above its real props — a positional match would then
// silently publish the wrong interface, and no assertion on the name would
// notice, because the wrong one still ends in Props.
function declarationPattern(interfaceName) {
  const name = interfaceName ? escapeForPattern(interfaceName) : '\\w*Props';
  return new RegExp(`(?:export\\s+)?interface\\s+(${name})\\s*(?:<[^{]*?>)?\\s*\\{`);
}

function escapeForPattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractPropsInterface(source, interfaceName) {
  const match = declarationPattern(interfaceName).exec(source);
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
// Callers pass one of two shapes: a raw CHARTS entry, which carries exportName
// at the top level, or a built item from buildAllItems(), which nests it under
// meta. Accept both rather than making every call site remember which it holds.
function exportNameOf(chart) {
  const exportName = chart.exportName ?? chart.meta?.exportName;
  if (!exportName) {
    throw new Error(
      `No exportName on the entry for "${chart.name}". Expected it at the top ` +
      'level (a CHARTS entry) or under .meta (a built item).'
    );
  }
  return exportName;
}

function readPropsInterface(chart) {
  const sourcePath = path.join(CHARTS_SRC_DIR, chart.name, chart.propsSourceFile);
  const interfaceName = `${exportNameOf(chart)}Props`;
  const extracted = extractPropsInterface(
    fs.readFileSync(sourcePath, 'utf8'),
    interfaceName
  );
  if (!extracted) {
    throw new Error(
      `Could not find "interface ${interfaceName}" for "${chart.name}" in ${chart.propsSourceFile}. ` +
      'Either the interface is named something else, or propsSourceFile in ' +
      'registry/manifest.js points at the wrong file.'
    );
  }
  return extracted;
}

module.exports = { extractPropsInterface, readPropsInterface };
