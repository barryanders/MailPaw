const test = require('node:test');
const assert = require('node:assert/strict');
const { setupDom, loadScripts } = require('./helpers');

test('standalone copy hint gives the next paste step and fades itself away', () => {
    const window = setupDom();
    const timers = [];
    window.requestAnimationFrame = (callback) => {
        callback();
        return 1;
    };
    window.setTimeout = (callback, delay) => {
        timers.push({ callback, delay });
        return timers.length;
    };
    window.clearTimeout = () => {};

    loadScripts(window, ['js/standalone-app.js']);

    window.showMailpawCopyHint();

    const hint = window.document.getElementById('mailpaw-copy-hint');
    assert.ok(hint);
    assert.equal(hint.textContent, 'Now paste it into your mail app.');
    assert.equal(hint.getAttribute('role'), 'status');
    assert.equal(hint.getAttribute('aria-live'), 'polite');
    assert.equal(hint.classList.contains('show'), true);

    const fadeTimer = timers.find((timer) => timer.delay === 2600);
    assert.ok(fadeTimer);
    fadeTimer.callback();
    assert.equal(hint.classList.contains('show'), false);

    const removeTimer = timers.find((timer) => timer.delay === 220);
    assert.ok(removeTimer);
    removeTimer.callback();
    assert.equal(window.document.getElementById('mailpaw-copy-hint'), null);
});

test('standalone copy success shows the paste hint', () => {
    const window = setupDom();
    window.requestAnimationFrame = (callback) => {
        callback();
        return 1;
    };
    window.setTimeout = () => 1;
    window.clearTimeout = () => {};
    window.copyRichEmailToClipboard = (html, onSuccess) => {
        assert.match(html, /Hello/);
        onSuccess();
    };

    loadScripts(window, ['js/standalone-app.js']);

    const button = window.document.createElement('button');
    button.innerHTML = '<span class="zt-btn-label">Copy Email</span>';
    window.document.body.appendChild(button);
    window.initiateTemplateInsertion({ body: '<p>Hello</p>' }, button);

    const hint = window.document.getElementById('mailpaw-copy-hint');
    assert.ok(hint);
    assert.equal(hint.textContent, 'Now paste it into your mail app.');
    assert.equal(hint.classList.contains('show'), true);
    assert.match(button.textContent, /Copied/);
});

test('template insertion delegates to standalone copy when running as the app', () => {
    const window = setupDom();
    window.ZT_STANDALONE = true;
    let delegated = null;
    window.initiateStandaloneTemplateCopy = (template, button) => {
        delegated = { template, button };
    };

    loadScripts(window, [
        { path: 'js/templates.js', expose: ['initiateTemplateInsertion'] }
    ]);

    const template = { body: '<p>Hello</p>' };
    const button = window.document.createElement('button');
    window.__testExports.initiateTemplateInsertion(template, button);

    assert.deepEqual(delegated, { template, button });
});
