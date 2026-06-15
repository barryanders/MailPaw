const test = require('node:test');
const assert = require('node:assert/strict');
const { setupDom, loadScripts } = require('./helpers');

test('included templates keep their original order when restored with custom templates', () => {
  const window = setupDom();
  window.ZT_STANDALONE = true;
  window.chrome = {
    storage: {
      local: {
        get: (_keys, callback) => callback({}),
        set: (_value, callback) => { if (callback) callback(); }
      },
      sync: {
        get: (_keys, callback) => callback({}),
        set: (_value, callback) => { if (callback) callback(); }
      }
    }
  };
  window.setupTooltipLogic = () => {};

  loadScripts(window, [
    'js/state.js',
    { path: 'js/main.js', expose: ['orderTemplatesWithIncludedFirst'] }
  ]);

  const defaults = [
    { id: 'welcome', title: 'Welcome', isDefault: true },
    { id: 'launch', title: 'Launch', isDefault: true },
    { id: 'thanks', title: 'Thanks', isDefault: true }
  ];
  const stored = [
    { id: 'custom-a', title: 'Custom A' },
    { id: 'thanks', title: 'Edited Thanks', isDefault: true },
    { id: 'custom-b', title: 'Custom B' },
    { id: 'welcome', title: 'Edited Welcome', isDefault: true }
  ];

  const ordered = window.__testExports.orderTemplatesWithIncludedFirst(stored, defaults);

  assert.deepEqual(ordered.map(t => t.id), ['welcome', 'launch', 'thanks', 'custom-a', 'custom-b']);
  assert.equal(ordered[0].title, 'Edited Welcome');
  assert.equal(ordered[2].title, 'Edited Thanks');
});
