'use strict';

const path = require('path');
const { ROOT_DIR, SITE_URL, AUTHOR } = require('../manifest');

const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'r');

const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
const REGISTRY_SCHEMA = 'https://ui.shadcn.com/schema/registry.json';

function registryType(item) {
  return item.kind === 'chart' ? 'registry:component' : 'registry:lib';
}

// Rewrite internal monorepo imports to canonical @/ aliases that shadcn
// understands. Anchored to `from` (covers both `import ... from` and
// `export ... from`) so unrelated strings aren't rewritten.
function rewriteImportsForShadcn(content) {
  return content
    .replace(/(from\s+)(['"])\.\.\/\.\.\/\.\.\/\.\.\/lib\/utils\2/g, `$1$2@/lib/utils$2`)
    .replace(/(from\s+)(['"])\.\.\/\.\.\/\.\.\/\.\.\/lib\/hooks\2/g, `$1$2@/lib/hooks$2`)
    .replace(/(from\s+)(['"])\.\.\/_shared((?:\/[^'"]*)?)\2/g, `$1$2@/components/charts/_shared$3$2`);
}

// shadcn resolves `@components` / `@lib` through the consumer's components.json
// aliases, so targets land in the right place whether the project uses src/ or
// not. Nested targets are supported (the shadcn docs use `@ui/ai/prompt-input.tsx`),
// which lets each chart keep its own directory.
function targetFor(item, fileName) {
  if (item.name === 'lib-utils' || item.name === 'lib-hooks') {
    return `@lib/${fileName}`;
  }
  return `@components/charts/${fileName}`;
}

function toShadcnItem(item) {
  const type = registryType(item);

  const doc = {
    $schema: ITEM_SCHEMA,
    name: item.name,
    type,
    title: item.title,
    description: item.description,
    author: AUTHOR,
    dependencies: [...item.npmDependencies],
    registryDependencies: item.registryDependencies.map(
      (name) => `${SITE_URL}/r/${name}.json`
    ),
    files: item.files.map((file) => ({
      path: file.name,
      type,
      target: targetFor(item, file.name),
      content: rewriteImportsForShadcn(file.content),
    })),
    categories: item.categories,
  };

  if (item.devDependencies.length > 0) {
    doc.devDependencies = [...item.devDependencies];
  }
  if (item.kind === 'chart') {
    doc.docs = `${SITE_URL}/docs/components/${item.name}`;
  }

  return doc;
}

// The hosted index lists charts only. Support items stay fetchable by URL —
// registryDependencies resolve directly — but an agent browsing the registry
// should see twelve charts, not fifteen entries including internals.
function toIndexEntry(item) {
  const doc = toShadcnItem(item);
  return {
    name: doc.name,
    type: doc.type,
    title: doc.title,
    description: doc.description,
    categories: doc.categories,
    files: doc.files.map((file) => ({ path: file.path, type: file.type })),
  };
}

function emitShadcn(items) {
  const outputs = items.map((item) => ({
    path: path.join(OUTPUT_DIR, `${item.name}.json`),
    content: `${JSON.stringify(toShadcnItem(item), null, 2)}\n`,
  }));

  const index = {
    $schema: REGISTRY_SCHEMA,
    name: 'mario-charts',
    homepage: SITE_URL,
    items: items.filter((item) => item.kind === 'chart').map(toIndexEntry),
  };

  outputs.push({
    path: path.join(OUTPUT_DIR, 'registry.json'),
    content: `${JSON.stringify(index, null, 2)}\n`,
  });

  return outputs;
}

module.exports = { emitShadcn, toShadcnItem, toIndexEntry, targetFor, OUTPUT_DIR };
