#!/usr/bin/env node
'use strict';

// Every URL published in llms.txt is a promise to a model that will follow it.
// A 404 here trains the assistant that Mario Charts docs are unreliable.
const fs = require('fs');
const path = require('path');

const LLMS_PATH = path.join(__dirname, '..', 'public', 'llms.txt');
// Stops at markdown/prose delimiters, including the angle brackets and curly
// braces llms.txt uses for placeholders (`<chart-name>`, `{name}`).
const URL_PATTERN = /https:\/\/mariocharts\.com[^\s`)"'><{}]*/g;
const TIMEOUT_MS = 10000;

// Pulls real, checkable URLs out of llms.txt's markdown. Two kinds of noise
// need stripping: a trailing sentence-ending period ("...registry.json."),
// and placeholder templates (`<chart-name>`, `{name}`) whose angle
// bracket/brace got excluded from the match, leaving a truncated prefix.
//
// A placeholder is identified by the character that stopped the match, not by
// a trailing slash. Discarding every trailing-slash URL would also silently
// skip legitimately checkable ones like https://mariocharts.com/docs/ — the
// link checker would report success on a URL it never requested.
const PLACEHOLDER_NEXT_CHAR = /[<{]/;

function extractUrls(content) {
  const matches = [...content.matchAll(URL_PATTERN)];
  const normalized = matches
    .filter((match) => {
      const next = content[match.index + match[0].length];
      return !(next && PLACEHOLDER_NEXT_CHAR.test(next));
    })
    .map((match) => match[0].replace(/\.+$/, ''));
  return [...new Set(normalized)].sort();
}

async function check(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { url, status: response.status, ok: response.ok };
  } catch (error) {
    return { url, status: 0, ok: false, error: error.message };
  }
}

async function main() {
  const content = fs.readFileSync(LLMS_PATH, 'utf8');
  const urls = extractUrls(content);

  if (urls.length === 0) {
    console.error('[verify-links] No mariocharts.com URLs found in llms.txt.');
    process.exit(1);
  }

  const results = await Promise.all(urls.map(check));
  const broken = results.filter((r) => !r.ok);

  for (const result of results) {
    console.log(`${result.ok ? 'OK  ' : 'FAIL'} ${result.status} ${result.url}`);
  }

  if (broken.length > 0) {
    console.error(`[verify-links] ${broken.length} of ${urls.length} URLs are unreachable.`);
    process.exit(1);
  }
  console.log(`[verify-links] All ${urls.length} URLs reachable.`);
}

module.exports = { extractUrls };

if (require.main === module) {
  main();
}
