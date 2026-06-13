/* --- LISTENERS --- */
document.addEventListener('click', (e) => {
  const panel = document.getElementById('zt-panel');
  const menu = document.getElementById('zt-settings-menu');
  const modal = document.querySelector('.zt-modal-overlay');
  const preview = document.getElementById('zt-preview-overlay');
  const settingsBtn = document.getElementById('zt-btn-settings');
  if (document.getElementById('zt-fs-layer')?.classList.contains('show')) return;
  if (preview && preview.contains(e.target)) return;
  if (modal && modal.contains(e.target)) return;

  if (panel && panel.classList.contains('open')) {
    if (!panel.contains(e.target) && !e.target.closest('.zt-trigger-btn')) {
      panel.classList.remove('open');
      if (menu) menu.classList.remove('show');
    }
    if (menu && menu.classList.contains('show') && !e.target.closest('#zt-btn-settings')) {
      menu.classList.remove('show');
    }
  }
}, true);

document.addEventListener('keydown', (e) => {
  const panel = document.getElementById('zt-panel');
  if (!panel || !panel.classList.contains('open')) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    const modal = document.querySelector('.zt-modal-overlay');
    if (modal) { modal.remove(); return; }
    const preview = document.getElementById('zt-preview-overlay');
    if (preview) {
      const closeBtn = preview.querySelector('#zt-preview-close');
      if (closeBtn) closeBtn.click();
      else preview.remove();
      return;
    }
    const unsaved = document.getElementById('zt-unsaved-modal');
    if (unsaved) {
      const cancelBtn = unsaved.querySelector('#zt-modal-cancel');
      if (cancelBtn) cancelBtn.click();
      else unsaved.remove();
      return;
    }
    const alertModal = document.getElementById('zt-alert-modal');
    if (alertModal) { alertModal.remove(); return; }
    const fs = document.getElementById('zt-fs-layer');
    if (fs && fs.classList.contains('show')) { fs.classList.remove('show'); return; }
    if (document.getElementById('btn-cancel')) { document.getElementById('btn-cancel').click(); return; }
    if (document.getElementById('btn-cancel-del')) { document.getElementById('btn-cancel-del').click(); return; }
    if (document.getElementById('btn-cancel-var')) { document.getElementById('btn-cancel-var').click(); return; }
    if (document.getElementById('import-cancel')) { document.getElementById('import-cancel').click(); return; }
    panel.classList.remove('open');
  }

  if (e.key === 'Enter') {
    const active = document.activeElement;
    const isInput = active.tagName === 'INPUT';
    if (document.getElementById('btn-confirm-del')) { document.getElementById('btn-confirm-del').click(); return; }
    if (isInput || active.tagName === 'BUTTON') {
      if (document.getElementById('btn-save')) document.getElementById('btn-save').click();
      else if (document.getElementById('btn-insert-var')) document.getElementById('btn-insert-var').click();
      else if (document.getElementById('import-confirm')) document.getElementById('import-confirm').click();
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (!e.target.isContentEditable) return;
  if (e.key === ' ' || e.key === 'Enter') {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType === 3) {
      const textSoFar = node.textContent.substring(0, range.startOffset);
      const match = textSoFar.match(/(\/\w+)$/);
      if (match) {
        const shortcutTyped = match[1];
        const template = templates.find(t => t.shortcut === shortcutTyped);
        if (template) {
          e.preventDefault();
          e.stopPropagation();
          const rangeToReplace = document.createRange();
          rangeToReplace.setStart(node, range.startOffset - shortcutTyped.length);
          rangeToReplace.setEnd(node, range.startOffset);
          rangeToReplace.deleteContents();
          activeComposeBody = e.target;
          initiateTemplateInsertion(template);
        }
      }
    }
  }
}, true);
