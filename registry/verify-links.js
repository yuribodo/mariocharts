#!/usr/bin/env node
'use strict';

// Every URL published in llms.txt is a promise to a model that will follow it.
// A 404 here trains the assistant that Mario Charts docs are unreliable.
const fs = require('fs');
const path = require('path');

const LLMS_PATH = path.join(__dirname, '..', 'public', 'llms.txt');
const URL_PATTERN = /https:\/\/mariocharts\.com[^\s`)"'>]*/g;
const TIMEOUT_MS = 10000;

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
  const urls = [...new Set(content.match(URL_PATTERN) ?? [])].sort();

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

main();
