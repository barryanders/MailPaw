const test = require('node:test');
const assert = require('node:assert/strict');
const { setupDom, loadScripts } = require('./helpers');

function setupClipboardWindow() {
    const window = setupDom();
    window.chrome = { storage: { sync: null } };
    window.navigator.clipboard = {};
    loadScripts(window, [
        { path: 'js/ui-sidebar.js', expose: ['htmlToClipboardPlainText', 'makeClipboardEmailMobileSafe', 'copyRichEmailToClipboard'] }
    ]);
    return window;
}

test('copyRichEmailToClipboard writes rich html and plain text when available', async () => {
    const window = setupClipboardWindow();
    const writes = [];
    window.Blob = class TestBlob {
        constructor(parts, options) {
            this.parts = parts;
            this.type = options.type;
        }
    };
    window.ClipboardItem = class TestClipboardItem {
        constructor(items) {
            this.items = items;
        }
    };
    window.navigator.clipboard.write = async (items) => {
        writes.push(items);
    };

    await new Promise((resolve, reject) => {
        window.__testExports.copyRichEmailToClipboard(
            '<div><h1>Hello</h1><p>Paste me</p><script>bad()</script></div>',
            resolve,
            reject
        );
    });

    assert.equal(writes.length, 1);
    const item = writes[0][0].items;
    assert.equal(item['text/html'].type, 'text/html');
    assert.equal(item['text/plain'].type, 'text/plain');
    assert.match(item['text/html'].parts[0], /<h1>Hello<\/h1>/);
    assert.doesNotMatch(item['text/html'].parts[0], /script/);
    assert.match(item['text/plain'].parts[0], /Hello/);
    assert.match(item['text/plain'].parts[0], /Paste me/);
});

test('copyRichEmailToClipboard falls back to selecting rendered html', async () => {
    const window = setupClipboardWindow();
    let copied = false;
    window.document.execCommand = (command) => {
        copied = command === 'copy';
        return copied;
    };

    await new Promise((resolve, reject) => {
        window.__testExports.copyRichEmailToClipboard(
            '<div><strong>Rendered</strong> content</div>',
            resolve,
            reject
        );
    });

    assert.equal(copied, true);
    assert.equal(window.document.querySelector('[contenteditable="true"]'), null);
});

test('makeClipboardEmailMobileSafe stacks copied email columns inline', () => {
    const window = setupClipboardWindow();
    const html = `
        <div>
            <table class="mp-container" style="width:100%; table-layout:fixed;">
                <tbody>
                    <tr>
                        <td class="mp-stack" style="width:50%; max-width:50%; display:table-cell;">Left</td>
                        <td class="mp-stack" style="width:50%; max-width:50%; display:table-cell;">Right</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    const output = window.__testExports.makeClipboardEmailMobileSafe(html);
    const wrapper = window.document.createElement('div');
    wrapper.innerHTML = output;
    const table = wrapper.querySelector('table.mp-container');
    const cells = [...wrapper.querySelectorAll('td.mp-stack')];

    assert.equal(table.style.display, 'block');
    assert.equal(table.style.tableLayout, 'auto');
    assert.equal(cells.length, 2);
    assert.ok(cells.every((cell) => cell.style.display === 'block'));
    assert.ok(cells.every((cell) => cell.style.width === '100%'));
    assert.ok(cells.every((cell) => cell.style.maxWidth === '100%'));
});

test('htmlToClipboardPlainText creates readable fallback text', () => {
    const window = setupClipboardWindow();
    const text = window.__testExports.htmlToClipboardPlainText('<h1>Title</h1><p>First<br>Second</p>');

    assert.match(text, /Title/);
    assert.match(text, /First\nSecond/);
});
