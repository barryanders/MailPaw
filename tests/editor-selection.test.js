const test = require('node:test');
const assert = require('node:assert/strict');
const { setupDom, loadScripts } = require('./helpers');

test('editor chrome blocks select-all while editable fields keep native behavior', () => {
  const window = setupDom(`
    <!doctype html>
    <html>
      <body>
        <div id="zt-fs-layer">
          <button id="fs-close">Close</button>
          <button id="fs-save">Save</button>
          <button id="zt-undo-btn-fs">Undo</button>
          <button id="zt-redo-btn-fs">Redo</button>
          <div id="zt-canvas-wrapper">
            <div id="chrome-label">Template Details</div>
            <input id="template-name" value="Blueprint">
          </div>
        </div>
      </body>
    </html>
  `);

  Object.assign(window, {
    showUnsavedChangesModal: () => {},
    saveCurrentTemplate: () => {},
    undoEditor: () => {},
    redoEditor: () => {},
    renderHelpModal: () => {},
    resetEditorHistory: () => {}
  });

  loadScripts(window, [
    { path: 'js/ui-editor-events.js', expose: ['attachEditorGlobalEvents'] }
  ]);

  const fsLayer = window.document.getElementById('zt-fs-layer');
  window.__testExports.attachEditorGlobalEvents(fsLayer);

  const chromeEvent = new window.KeyboardEvent('keydown', {
    key: 'a',
    ctrlKey: true,
    bubbles: true,
    cancelable: true
  });
  window.document.getElementById('chrome-label').dispatchEvent(chromeEvent);
  assert.equal(chromeEvent.defaultPrevented, true);

  const inputEvent = new window.KeyboardEvent('keydown', {
    key: 'a',
    ctrlKey: true,
    bubbles: true,
    cancelable: true
  });
  window.document.getElementById('template-name').dispatchEvent(inputEvent);
  assert.equal(inputEvent.defaultPrevented, false);
});
