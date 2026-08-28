const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readProjectFile(file) {
  return fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
}

test('public app shell keeps searchable local-first metadata', () => {
  const app = readProjectFile('app.html');

  assert.match(app, /<title>Free HTML Email Template Builder/);
  assert.match(app, /<meta name="description" content="[^"]*local-first[^"]*no account/i);
  assert.match(app, /<meta name="robots" content="index,follow">/);
  assert.match(app, /<link rel="canonical" href="https:\/\/goodburrow\.github\.io\/MailPaw\/app\.html">/);
  assert.match(app, /"@type": "WebApplication"/);
  assert.match(app, /"No account required"/);
});

test('root page remains a noindex redirect to the app', () => {
  const root = readProjectFile('index.html');

  assert.match(root, /<meta name="robots" content="noindex,follow">/);
  assert.match(root, /<meta http-equiv="refresh" content="0; url=app\.html">/);
  assert.match(root, /window\.location\.replace\('app\.html'/);
  assert.match(root, /<a href="app\.html">Open MailPaw<\/a>/);
});

test('about view links to the privacy-safe problem report form', () => {
  const constants = readProjectFile('js/constants.js');
  const standalone = readProjectFile('js/standalone-app.js');

  assert.match(constants, /goodburrow\.com\/report\/\?app=mailpaw&name=MailPaw&version=1\.0\.2/);
  assert.match(standalone, /Report a problem/);
  assert.match(standalone, /No templates or email content are attached/);
});
