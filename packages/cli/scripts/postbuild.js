#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'index.js');
const content = fs.readFileSync(distPath, 'utf8');

// Adicionar shebang se não existir
if (!content.startsWith('#!/usr/bin/env node')) {
  const newContent = '#!/usr/bin/env node\n' + content;
  fs.writeFileSync(distPath, newContent);
  console.log('Shebang added to CLI binary');
}

// Tornar executável
fs.chmodSync(distPath, '755');
console.log('CLI binary made executable');