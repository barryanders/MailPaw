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

test('inline toolbar keeps mobile editor controls while editing a block', () => {
    const window = setupDom(`
        <!doctype html>
        <html>
            <body>
                <div id="zt-inline-toolbar">
                    <div id="zt-mobile-editor-controls">
                        <button id="zt-mobile-blocks-toggle" type="button">Blocks</button>
                        <button id="zt-mobile-details-toggle" type="button">Details</button>
                    </div>
                    <div id="zt-inline-tools">
                        <span class="zt-toolbar-empty">Select a block to edit</span>
                    </div>
                </div>
                <div id="fs-visual"></div>
            </body>
        </html>
    `);
    window.rgbToHex = () => '#000000';
    window.FONT_OPTIONS = '<option value="inherit">Inherit / System</option>';
    loadScripts(window, [
        { path: 'js/components-data.js', attach: ['componentDefaults'] },
        'js/components-blocks.js',
        'js/ui-popups.js'
    ]);

    const buttonBlock = window.createBlockHTML('button');
    window.document.getElementById('fs-visual').appendChild(buttonBlock);
    window.showInlinePopup(buttonBlock.querySelector('a'));

    assert.ok(window.document.getElementById('zt-mobile-blocks-toggle'));
    assert.ok(window.document.getElementById('zt-mobile-details-toggle'));
    assert.ok(window.document.getElementById('bar-btn-text'));

    window.clearInlineToolbar();

    assert.ok(window.document.getElementById('zt-mobile-blocks-toggle'));
    assert.ok(window.document.getElementById('zt-mobile-details-toggle'));
    assert.match(window.document.getElementById('zt-inline-tools').textContent, /Select a block/);
});
