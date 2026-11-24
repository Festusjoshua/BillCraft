// Script to generate a single self-contained bundle for BillCraft
// so it runs flawlessly both on file:/// protocol and over HTTP/HTTPS.

const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, 'js');
const bundlePath = path.join(__dirname, 'bundle.js');

// Safety check: if source js/ folder wasn't pushed to git, but bundle.js already exists, succeed!
if (!fs.existsSync(jsDir) || !fs.existsSync(path.join(jsDir, 'calculator.js'))) {
  if (fs.existsSync(bundlePath)) {
    console.log('Production bundle.js already present. Build succeeded!');
    process.exit(0);
  } else {
    console.error('Neither js/ source directory nor bundle.js was found.');
    process.exit(1);
  }
}

const files = [
  'js/calculator.js',
  'js/storage.js',
  'js/supabase-client.js',
  'js/templates.js',
  'js/pdf-service.js',
  'js/ui.js',
  'js/editor-ui.js',
  'js/clients-ui.js',
  'js/business-ui.js',
  'js/templates-ui.js',
  'js/settings-ui.js',
  'js/modals.js',
  'js/app.js'
];

let bundleContent = `/**
 * BillCraft - Unified Application Bundle
 * Supports both direct file:// opening and http:// serving.
 * Strict Aeonik Typography • Fintech Invoicing
 */
(function() {
  'use strict';
`;

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${file} not found, skipping.`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove import statements
  content = content.replace(/^import\s+.*?;?\s*$/gm, '// [bundled import]');
  // Remove export keywords while preserving declarations
  content = content.replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ');
  content = content.replace(/^export\s+default\s+/gm, '');
  content = content.replace(/^export\s+\{.*?\};?\s*$/gm, '// [bundled export]');

  bundleContent += `\n/* --- START ${file} --- */\n` + content + `\n/* --- END ${file} --- */\n`;
}

bundleContent += `
})();
`;

fs.writeFileSync(bundlePath, bundleContent, 'utf8');
console.log('Successfully generated bundle.js (' + bundleContent.length + ' bytes)');
