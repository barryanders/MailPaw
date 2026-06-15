const test = require('node:test');
const assert = require('node:assert/strict');
const { setupDom, loadScripts } = require('./helpers');

test('included template editor uses compact save label', () => {
  const window = setupDom();

  window.getEditorLayoutHTML = () => `
    <div id="zt-fs-layer">
      <button class="zt-btn-save" id="fs-save">
        <span class="zt-save-label">Update</span>
      </button>
    </div>
  `;
  window.setTimeout = () => 0;
  window.ztEditorIsDirty = false;
  window.ztCurrentTemplateId = null;

  loadScripts(window, [
    { path: 'js/ui-editor-core.js', expose: ['openFullScreenEditor'] }
  ]);

  window.__testExports.openFullScreenEditor({
    id: 'default-template',
    isDefault: true,
    title: 'Tiny Magazine',
    subject: '',
    body: '',
    category: 'Examples'
  });

  const saveBtn = window.document.getElementById('fs-save');
  const saveLabel = saveBtn.querySelector('.zt-save-label');

  assert.equal(saveLabel.textContent, 'Save');
  assert.equal(saveBtn.getAttribute('aria-label'), 'Save a copy of this included template');
  assert.equal(saveBtn.getAttribute('title'), 'Save a copy');
  assert.equal(saveBtn.hasAttribute('data-mobile-label'), false);
});
