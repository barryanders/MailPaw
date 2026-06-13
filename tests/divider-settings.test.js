const test = require('node:test');
const assert = require('node:assert/strict');
const { setupDom, loadScripts } = require('./helpers');

test('divider live preview normalizes size values', () => {
    const window = setupDom();
    loadScripts(window, ['js/components-settings.js']);

    const block = window.document.createElement('div');
    block.className = 'zt-builder-block';
    block.setAttribute('data-type', 'divider');
    block.innerHTML = '<div class="zt-block-content"><hr></div>';
    window.document.body.appendChild(block);

    const hr = block.querySelector('hr');
    window.updateLivePreview('divider', 'thickness', '2');
    assert.equal(hr.style.borderTopWidth, '2px');

    window.updateLivePreview('divider', 'width', '400');
    assert.equal(hr.style.width, '400px');

    window.updateLivePreview('divider', 'margin', '10 0');
    assert.equal(hr.style.margin, '10px 0px');
});
