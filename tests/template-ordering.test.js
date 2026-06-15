const test = require('node:test');
const assert = require('node:assert/strict');
const { setupDom, loadScripts } = require('./helpers');

test('included example specs use the intended display order', () => {
  const window = setupDom();
  loadScripts(window, [
    { path: 'js/constants.js', expose: ['DEFAULT_TEMPLATE_SPECS', 'MAILPAW_EXAMPLE_TEMPLATE_ORDER'] }
  ]);

  const specs = window.__testExports.DEFAULT_TEMPLATE_SPECS;
  assert.equal(specs[0].id, 'tpl-example-tiny-magazine');
  assert.equal(specs[0].title, 'Tiny Magazine');
  assert.equal(window.__testExports.MAILPAW_EXAMPLE_TEMPLATE_ORDER[0], 'tpl-example-tiny-magazine');
  assert.ok(specs.findIndex(spec => spec.id === 'tpl-example-ink-gallery') > 0);
});

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

test('async default template build keeps global order across batches', async () => {
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
  window.buildEmailHtmlFromCanvas = () => ({ designState: [], body: '<div></div>' });

  loadScripts(window, [
    'js/state.js',
    { path: 'js/main.js', expose: ['buildDefaultTemplatesFromSpecsAsync'] }
  ]);

  const specs = Array.from({ length: 5 }, (_, index) => ({
    id: `default-${index}`,
    title: `Default ${index}`,
    category: 'Examples',
    subject: '',
    blocks: []
  }));

  const built = await new Promise(resolve => {
    window.__testExports.buildDefaultTemplatesFromSpecsAsync(specs, resolve);
  });

  assert.deepEqual(Array.from(built, t => t.defaultOrder), [0, 1, 2, 3, 4]);
  assert.deepEqual(Array.from(built, t => t.id), specs.map(spec => spec.id));
  assert.ok(built[0].createdAt > built[4].createdAt);
});
