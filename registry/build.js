#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { buildAllItems } = require('./manifest');
const { emitCliFallback } = require('./emitters/cli-fallback');
const { emitShadcn } = require('./emitters/shadcn');
const { emitSiteData } = require('./emitters/site-data');
const { emitLlms } = require('./emitters/llms');

function buildAll() {
  const items = buildAllItems();
  return [
    ...emitCliFallback(items),
    ...emitShadcn(items),
    ...emitSiteData(items),
    ...emitLlms(items),
  ];
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
  console.log(
    changed === 0
      ? `[registry] ${outputs.length} generated files are up to date.`
      : `[registry] Wrote ${changed} of ${outputs.length} generated files.`
  );
}

module.exports = { buildAll, writeAll };
