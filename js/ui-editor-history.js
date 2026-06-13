/* --- EDITOR HISTORY (UNDO/REDO) --- */

const ztEditorHistory = {
    stack: [],
    index: -1,
    base: null,
    timer: null,
    lock: false,
    max: 40
};

function initializeEditorHistory() {
    const snapshot = getEditorSnapshot();
    ztEditorHistory.stack = snapshot ? [snapshot] : [];
    ztEditorHistory.index = snapshot ? 0 : -1;
    ztEditorHistory.base = snapshot;
    window.ztEditorIsDirty = false;
    updateHistoryControls();
}

function resetEditorHistory() {
    ztEditorHistory.stack = [];
    ztEditorHistory.index = -1;
    ztEditorHistory.base = null;
    updateHistoryControls();
}

function queueEditorHistoryCapture() {
    if (ztEditorHistory.lock) return;
    clearTimeout(ztEditorHistory.timer);
    ztEditorHistory.timer = setTimeout(() => captureEditorState(), 500);
}

function captureEditorState() {
    if (ztEditorHistory.lock) return;
    const snapshot = getEditorSnapshot();
    if (!snapshot) return;

    const current = ztEditorHistory.stack[ztEditorHistory.index];
    if (current && isSameSnapshot(current, snapshot)) return;

    if (ztEditorHistory.index < ztEditorHistory.stack.length - 1) {
        ztEditorHistory.stack = ztEditorHistory.stack.slice(0, ztEditorHistory.index + 1);
    }

    ztEditorHistory.stack.push(snapshot);
    if (ztEditorHistory.stack.length > ztEditorHistory.max) {
        ztEditorHistory.stack.shift();
    }
    ztEditorHistory.index = ztEditorHistory.stack.length - 1;

    updateDirtyFromHistory();
    updateHistoryControls();
}

function undoEditor() {
    if (ztEditorHistory.index <= 0) return;
    ztEditorHistory.index -= 1;
    applyEditorSnapshot(ztEditorHistory.stack[ztEditorHistory.index]);
}

function redoEditor() {
    if (ztEditorHistory.index >= ztEditorHistory.stack.length - 1) return;
    ztEditorHistory.index += 1;
    applyEditorSnapshot(ztEditorHistory.stack[ztEditorHistory.index]);
}

function getEditorSnapshot() {
    const canvasEl = document.getElementById('fs-visual');
    if (!canvasEl) return null;

    const clone = canvasEl.cloneNode(true);
    clone.querySelectorAll('.zt-html-code-editor').forEach(el => {
        el.textContent = el.value;
    });

    const settings = {
        title: document.getElementById('zt_tpl_nme_fs')?.value || '',
        subject: document.getElementById('zt_tpl_sbj_fs')?.value || '',
        shortcut: document.getElementById('zt_tpl_sht_fs')?.value || '',
        category: document.getElementById('zt_tpl_cat_fs')?.value || '',
        bgEmail: document.getElementById('zt_glob_bg_email')?.value || '',
        fontFamily: document.getElementById('zt_glob_font_fs')?.value || '',
        fontColor: window.ztGlobalFontColorActive ? (document.getElementById('zt_glob_font_color')?.value || '') : ''
    };

    return { html: clone.innerHTML, settings };
}

function applyEditorSnapshot(snapshot) {
    if (!snapshot) return;
    const canvasEl = document.getElementById('fs-visual');
    if (!canvasEl) return;

    ztEditorHistory.lock = true;
    canvasEl.innerHTML = snapshot.html;
    refreshNestedSortables(canvasEl);

    canvasEl.querySelectorAll('.zt-html-container').forEach(container => {
        const textarea = container.querySelector('.zt-html-code-editor');
        const preview = container.querySelector('.zt-html-preview-view');
        if (textarea) {
            textarea.value = textarea.textContent || textarea.value || '';
        }
        if (preview && textarea) {
            preview.innerHTML = textarea.value;
        }
    });

    if (document.getElementById('zt_tpl_nme_fs')) document.getElementById('zt_tpl_nme_fs').value = snapshot.settings.title || '';
    if (document.getElementById('zt_tpl_sbj_fs')) document.getElementById('zt_tpl_sbj_fs').value = snapshot.settings.subject || '';
    if (document.getElementById('zt_tpl_sht_fs')) document.getElementById('zt_tpl_sht_fs').value = snapshot.settings.shortcut || '';
    if (document.getElementById('zt_tpl_cat_fs')) document.getElementById('zt_tpl_cat_fs').value = snapshot.settings.category || '';

    if (canvasEl && snapshot.settings.bgEmail) canvasEl.style.backgroundColor = snapshot.settings.bgEmail;
    if (canvasEl) canvasEl.style.fontFamily = snapshot.settings.fontFamily || '';
    if (canvasEl) canvasEl.style.color = snapshot.settings.fontColor || '';
    const fontSelect = document.getElementById('zt_glob_font_fs');
    if (fontSelect) fontSelect.value = snapshot.settings.fontFamily || 'inherit';
    const fontColor = document.getElementById('zt_glob_font_color');
    const fontColorWrap = document.getElementById('wrap_zt_glob_font_color');
    const fontColorValue = snapshot.settings.fontColor || '#0f172a';
    if (fontColor) {
        fontColor.value = fontColorValue;
        if (fontColorWrap) fontColorWrap.style.backgroundColor = fontColorValue;
    }
    window.ztGlobalFontColor = fontColorValue;
    window.ztGlobalFontColorActive = !!snapshot.settings.fontColor;
    if (typeof window.applyGlobalFontColorToBlocks === 'function' && snapshot.settings.fontColor) {
        window.applyGlobalFontColorToBlocks(snapshot.settings.fontColor, { force: true });
    }

    window.ztEditorIsDirty = !isSameSnapshot(ztEditorHistory.base, snapshot);
    updateHistoryControls();
    ztEditorHistory.lock = false;
}

function isSameSnapshot(a, b) {
    if (!a || !b) return false;
    return a.html === b.html && JSON.stringify(a.settings) === JSON.stringify(b.settings);
}

function updateDirtyFromHistory() {
    const current = ztEditorHistory.stack[ztEditorHistory.index];
    window.ztEditorIsDirty = !isSameSnapshot(ztEditorHistory.base, current);
}

function updateHistoryControls() {
    const undoBtn = document.getElementById('zt-undo-btn-fs');
    const redoBtn = document.getElementById('zt-redo-btn-fs');
    if (undoBtn) undoBtn.disabled = ztEditorHistory.index <= 0;
    if (redoBtn) redoBtn.disabled = ztEditorHistory.index >= ztEditorHistory.stack.length - 1;
}
