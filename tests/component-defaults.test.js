const test = require('node:test');
const assert = require('node:assert/strict');
const { setupDom, loadScripts } = require('./helpers');

test('normalize spacing helpers', () => {
    const window = setupDom();
    loadScripts(window, [{
        path: 'js/components-settings.js',
        expose: ['normalizeSpacingValue', 'normalizeSpacingList']
    }]);
    const { normalizeSpacingValue, normalizeSpacingList } = window.__testExports;

    assert.equal(normalizeSpacingValue('12'), '12px');
    assert.equal(normalizeSpacingValue('1.5'), '1.5px');
    assert.equal(normalizeSpacingValue('12px'), '12px');
    assert.equal(normalizeSpacingValue('0'), '0px');
    assert.equal(normalizeSpacingValue(''), '');

    assert.equal(normalizeSpacingList('10 0'), '10px 0px');
    assert.equal(normalizeSpacingList('5 10 15 20'), '5px 10px 15px 20px');
});
