const test = require('node:test');
const assert = require('node:assert/strict');
const { setupDom, loadScripts } = require('./helpers');

test('createBlockHTML builds default blocks', () => {
    const window = setupDom();
    loadScripts(window, [
        { path: 'js/components-data.js', attach: ['componentDefaults'] },
        'js/components-blocks.js'
    ]);

    const heading = window.createBlockHTML('heading');
    assert.equal(heading.getAttribute('data-type'), 'heading');
    assert.equal(heading.querySelector('h2').textContent, 'New Heading');

    const text = window.createBlockHTML('text');
    assert.equal(text.getAttribute('data-type'), 'text');
    assert.match(text.textContent, /Start typing/);

    const button = window.createBlockHTML('button');
    const btn = button.querySelector('a');
    assert.equal(button.getAttribute('data-type'), 'button');
    assert.ok(btn.style.padding);
    assert.ok(btn.style.backgroundColor);

    const image = window.createBlockHTML('image');
    const img = image.querySelector('img');
    assert.equal(image.getAttribute('data-type'), 'image');
    assert.ok(img.getAttribute('src'));
    assert.equal(img.style.borderRadius, '8px');
});
