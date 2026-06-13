const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { setupDom, loadScripts } = require('./helpers');

test('buildEmailHtmlFromCanvas cleans and wraps content', () => {
    const window = setupDom();
    loadScripts(window, [
        { path: 'js/components-data.js', attach: ['componentDefaults'] },
        'js/components-blocks.js',
        'js/ui-editor-save.js'
    ]);

    const canvas = window.document.createElement('div');
    const textBlock = window.createBlockHTML('text');
    textBlock.style.backgroundColor = 'rgb(255, 0, 0)';
    textBlock.style.padding = '10px';
    textBlock.setAttribute('data-block-link', 'https://example.com');
    canvas.appendChild(textBlock);

    const grid = window.createBlockHTML('grid', 2);
    canvas.appendChild(grid);

    const result = window.buildEmailHtmlFromCanvas(canvas, '#ffffff', 'Arial, sans-serif', '#111827');
    assert.ok(result.designState);
    assert.match(result.body, /background-color:#ffffff/);
    assert.match(result.body, /font-family:Arial, sans-serif/);
    assert.match(result.body, /color:#111827/);

    const outputDom = new JSDOM(result.body);
    const doc = outputDom.window.document;
    assert.equal(doc.querySelectorAll('.zt-block-controls').length, 0);
    assert.equal(doc.querySelectorAll('[contenteditable]').length, 0);
    assert.equal(doc.querySelectorAll('.zt-block-content').length, 0);

    const link = doc.querySelector('a[href="https://example.com"]');
    assert.ok(link, 'block link should be converted to an anchor');

    assert.match(result.body, /@media only screen and \(max-width: 600px\)/);
    assert.match(result.body, /\.mp-stack/);

    const gridTable = doc.querySelector('table.mp-container');
    assert.ok(gridTable, 'grid table should be marked as an email container');
    assert.equal(gridTable.getAttribute('role'), 'presentation');

    const columns = Array.from(doc.querySelectorAll('td.mp-stack'));
    assert.equal(columns.length, 2);
    assert.ok(columns.every((col) => col.style.width === '50%'), 'grid columns should be normalized to 50% width');
    assert.ok(columns.every((col) => col.style.display === 'table-cell'), 'grid columns should remain side by side on desktop');
});

test('buildEmailHtmlFromCanvas does not add outer padding for plain white emails', () => {
    const window = setupDom();
    loadScripts(window, [
        { path: 'js/components-data.js', attach: ['componentDefaults'] },
        'js/components-blocks.js',
        'js/ui-editor-save.js'
    ]);

    const canvas = window.document.createElement('div');
    canvas.appendChild(window.createBlockHTML('text'));

    const result = window.buildEmailHtmlFromCanvas(canvas, '#ffffff');
    const outputDom = new JSDOM(result.body);
    const shell = outputDom.window.document.body.firstElementChild;

    assert.equal(shell.style.backgroundColor, 'rgb(255, 255, 255)');
    assert.equal(shell.style.padding, '');
});
