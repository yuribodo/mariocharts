'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT_DIR } = require('../manifest');

const SOURCE_DIR = path.join(ROOT_DIR, 'content', 'agent-md');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Walk content/agent-md and emit the same relative paths under public/.
// index.md → public/index.md so Accept on / and GET /index.md both resolve.
function walkMarkdownFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMarkdownFiles(full, base));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    out.push(full);
  }
  return out;
}

function emitSiteMarkdown() {
  return walkMarkdownFiles(SOURCE_DIR).map((sourcePath) => {
    const relative = path.relative(SOURCE_DIR, sourcePath);
    return {
      path: path.join(PUBLIC_DIR, relative),
      content: fs.readFileSync(sourcePath, 'utf8'),
    };
  });
}

module.exports = { emitSiteMarkdown, SOURCE_DIR, PUBLIC_DIR, walkMarkdownFiles };
