window.ZT_STANDALONE = true;

(function setupStandaloneChromeShim() {
  const readStore = (area) => {
    try {
      return JSON.parse(localStorage.getItem(`zt-${area}-storage`) || '{}');
    } catch (err) {
      return {};
    }
  };
  const writeStore = (area, value) => {
    localStorage.setItem(`zt-${area}-storage`, JSON.stringify(value || {}));
  };
  const createArea = (area) => ({
    get(keys, callback) {
      const store = readStore(area);
      let result = {};
      if (Array.isArray(keys)) {
        keys.forEach((key) => { result[key] = store[key]; });
      } else if (typeof keys === 'string') {
        result[keys] = store[keys];
      } else if (keys && typeof keys === 'object') {
        result = { ...keys };
        Object.keys(keys).forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(store, key)) result[key] = store[key];
        });
      } else {
        result = { ...store };
      }
      if (typeof callback === 'function') setTimeout(() => callback(result), 0);
    },
    set(items, callback) {
      const store = readStore(area);
      writeStore(area, { ...store, ...(items || {}) });
      if (typeof callback === 'function') setTimeout(callback, 0);
    },
    remove(keys, callback) {
      const store = readStore(area);
      const list = Array.isArray(keys) ? keys : [keys];
      list.forEach((key) => delete store[key]);
      writeStore(area, store);
      if (typeof callback === 'function') setTimeout(callback, 0);
    }
  });

  window.chrome = window.chrome || {};
  window.chrome.storage = window.chrome.storage || {
    local: createArea('local'),
    sync: createArea('sync')
  };
  window.chrome.runtime = window.chrome.runtime || {
    id: '',
    sendMessage(message, callback) {
      if (typeof callback === 'function') callback({ ok: false, error: 'runtime unavailable' });
    },
    lastError: null
  };
})();
