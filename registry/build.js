#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { buildAllItems, ROOT_DIR } = require('./manifest');
const { emitCliFallback } = require('./emitters/cli-fallback');
const { emitShadcn } = require('./emitters/shadcn');
const { emitSiteData } = require('./emitters/site-data');
const { emitLlms } = require('./emitters/llms');
const { emitMarkdownDocs } = require('./emitters/markdown-docs');

function buildAll() {
  const items = buildAllItems();
  return [
    ...emitCliFallback(items),
    ...emitShadcn(items),
    ...emitSiteData(items),
    ...emitLlms(items),
    ...emitMarkdownDocs(items),
  ];
}

// Directories whose entire contents are generated, so anything in them that
// the current manifest did not produce is an orphan. Deliberately an explicit
// list rather than "every directory an output lands in": the CLI fallback is
// written into packages/cli/src/utils, alongside hand-written source that must
// never be swept.
const MANAGED_DIRS = [
  path.join(ROOT_DIR, 'public', 'r'),
  path.join(ROOT_DIR, 'public', 'docs', 'components'),
  path.join(ROOT_DIR, 'registry', 'generated'),
];

// Writing alone cannot remove anything. Drop a chart from the manifest and its
// public/r/<chart>.json survives untouched — and because it is unchanged, the
// CI staleness check sees a clean diff and passes. The registry would keep
// serving, and llms.txt keep omitting, a chart that no longer exists.
function removeOrphans(outputs, dirs = MANAGED_DIRS) {
  const expected = new Set(outputs.map((output) => path.resolve(output.path)));
  const removed = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const full = path.resolve(dir, entry.name);
      if (expected.has(full)) continue;
      fs.unlinkSync(full);
      removed.push(path.relative(ROOT_DIR, full));
    }
  }
  return removed;
}

function writeAll(outputs) {
  let changed = 0;
  for (const output of outputs) {
    fs.mkdirSync(path.dirname(output.path), { recursive: true });
    const existing = fs.existsSync(output.path)
      ? fs.readFileSync(output.path, 'utf8')
      : null;
    if (existing !== output.content) {
      fs.writeFileSync(output.path, output.content);
      changed += 1;
    }
  }
  return changed;
}

if (require.main === module) {
  const outputs = buildAll();
  const changed = writeAll(outputs);
  const removed = removeOrphans(outputs);
  for (const file of removed) {
    console.log(`[registry] Removed orphan ${file}`);
  }
  console.log(
    changed === 0 && removed.length === 0
      ? `[registry] ${outputs.length} generated files are up to date.`
      : `[registry] Wrote ${changed} of ${outputs.length} generated files, removed ${removed.length}.`
  );
}

module.exports = { buildAll, writeAll, removeOrphans, MANAGED_DIRS };
