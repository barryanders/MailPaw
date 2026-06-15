const test = require('node:test');
const assert = require('node:assert/strict');
const { setupDom, loadScripts } = require('./helpers');

test('library view blocks page-wide select all', () => {
  const window = setupDom(`
    <!doctype html>
    <html>
      <body>
        <div id="zt-panel" class="open fullscreen">
          <div class="zt-list">
            <article class="zt-item">
              <h2>Tiny Magazine</h2>
              <p>A pocket-sized issue for busy readers.</p>
            </article>
          </div>
        </div>
      </body>
    </html>
  `);

  loadScripts(window, ['js/events.js']);

  const card = window.document.querySelector('.zt-item');
  const event = new window.KeyboardEvent('keydown', {
    key: 'a',
    metaKey: true,
    bubbles: true,
    cancelable: true
  });
  card.dispatchEvent(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(window.getSelection().rangeCount, 0);
});

test('editor select all inside a block stays inside that block', () => {
  const window = setupDom(`
    <!doctype html>
    <html>
      <body>
        <div id="zt-fs-layer" class="show">
          <div class="zt-builder-block">
            <div id="first-block" class="zt-block-content" contenteditable="true">First block text</div>
          </div>
          <div class="zt-builder-block">
            <div id="second-block" class="zt-block-content" contenteditable="true">Second block text</div>
          </div>
          <aside>Template Details</aside>
        </div>
      </body>
    </html>
  `);

  loadScripts(window, ['js/events.js']);

  const firstBlock = window.document.getElementById('first-block');
  const event = new window.KeyboardEvent('keydown', {
    key: 'a',
    metaKey: true,
    bubbles: true,
    cancelable: true
  });
  firstBlock.dispatchEvent(event);

  const selection = window.getSelection();
  const selectedNode = selection.anchorNode.nodeType === window.Node.TEXT_NODE
    ? selection.anchorNode.parentElement
    : selection.anchorNode;
  assert.equal(event.defaultPrevented, true);
  assert.equal(selection.toString(), 'First block text');
  assert.equal(firstBlock.contains(selectedNode), true);
});

test('select all remains native inside form fields', () => {
  const window = setupDom(`
    <!doctype html>
    <html>
      <body>
        <div id="zt-panel" class="open fullscreen">
          <input id="search" value="blueprint">
        </div>
      </body>
    </html>
  `);

  loadScripts(window, ['js/events.js']);

  const input = window.document.getElementById('search');
  const event = new window.KeyboardEvent('keydown', {
    key: 'a',
    metaKey: true,
    bubbles: true,
    cancelable: true
  });
  input.dispatchEvent(event);

  assert.equal(event.defaultPrevented, false);
});
