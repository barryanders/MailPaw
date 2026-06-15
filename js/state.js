let templates = [];
let activeComposeBody = null;
let activeCategory = 'All';
let currentSort = 'createdAt_desc';
let activeElementInEditor = null;
let listViewMode = 'preview';

const TEMPLATE_STORAGE_KEY = 'templates';

function loadTemplatesFromStorage(callback) {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    if (typeof callback === 'function') callback(null);
    return;
  }
  chrome.storage.local.get([TEMPLATE_STORAGE_KEY], (localResult) => {
    const hasLocal = Object.prototype.hasOwnProperty.call(localResult, TEMPLATE_STORAGE_KEY);
    if (hasLocal) {
      const localTemplates = Array.isArray(localResult[TEMPLATE_STORAGE_KEY]) ? localResult[TEMPLATE_STORAGE_KEY] : [];
      if (typeof callback === 'function') callback(localTemplates);
      return;
    }
    chrome.storage.sync.get([TEMPLATE_STORAGE_KEY], (syncResult) => {
      const hasSync = Object.prototype.hasOwnProperty.call(syncResult, TEMPLATE_STORAGE_KEY);
      const syncTemplates = hasSync && Array.isArray(syncResult[TEMPLATE_STORAGE_KEY]) ? syncResult[TEMPLATE_STORAGE_KEY] : null;
      if (hasSync) chrome.storage.local.set({ [TEMPLATE_STORAGE_KEY]: syncTemplates || [] });
      if (typeof callback === 'function') callback(syncTemplates);
    });
  });
}

function saveTemplatesToStorage(nextTemplates, callback) {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    if (typeof callback === 'function') callback();
    return;
  }
  chrome.storage.local.set({ [TEMPLATE_STORAGE_KEY]: nextTemplates || [] }, () => {
    if (typeof callback === 'function') callback();
  });
}
