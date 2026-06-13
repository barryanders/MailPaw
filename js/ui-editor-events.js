/* --- EDITOR EVENT HANDLERS --- */

function attachEditorGlobalEvents(fsLayer) {
    // Close Button Logic
    fsLayer.querySelector('#fs-close').onclick = () => { 
        if (window.ztEditorIsDirty) {
            showUnsavedChangesModal(() => {
                // Confirm Close
                fsLayer.classList.remove('show'); 
                activeElementInEditor = null; 
                window.ztCurrentTemplateId = null;
                resetEditorHistory();
            });
        } else {
            // No changes, just close
            fsLayer.classList.remove('show'); 
            activeElementInEditor = null; 
            window.ztCurrentTemplateId = null;
            resetEditorHistory();
        }
    };

    // Save Button
    fsLayer.querySelector('#fs-save').onclick = () => {
        saveCurrentTemplate(!!window.ztCurrentTemplateId);
    };

    const undoBtn = fsLayer.querySelector('#zt-undo-btn-fs');
    if (undoBtn) undoBtn.onclick = () => undoEditor();
    const redoBtn = fsLayer.querySelector('#zt-redo-btn-fs');
    if (redoBtn) redoBtn.onclick = () => redoEditor();

    const helpBtn = fsLayer.querySelector('#zt-help-btn-fs');
    if (helpBtn) helpBtn.onclick = () => renderHelpModal();

    if (!fsLayer.dataset.ztKeyBound) {
        fsLayer.dataset.ztKeyBound = 'true';
        fsLayer.addEventListener('keydown', (e) => {
            const target = e.target;
            if (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const cmdKey = isMac ? e.metaKey : e.ctrlKey;
            if (!cmdKey) return;
            if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                undoEditor();
            } else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redoEditor();
            }
        });
    }

    const canvasWrapper = document.getElementById('zt-canvas-wrapper');
    if (canvasWrapper) {
        canvasWrapper.addEventListener('scroll', () => {
            const bar = document.querySelector('.zt-context-bar');
            const block = bar ? bar.closest('.zt-builder-block') : null;
            if (bar && block) positionContextBar(bar, block);
        });
    }
}

function attachEditorCanvasEvents(canvasEl) {
    // DIRTY TRACKER: Text Changes
    canvasEl.addEventListener('input', () => { window.ztEditorIsDirty = true; queueEditorHistoryCapture(); });

    const clearBlockSelection = () => {
        if (typeof clearInlineToolbar === 'function') clearInlineToolbar();
        document.querySelectorAll('.zt-builder-block.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.zt-builder-block.zt-child-selected').forEach(el => el.classList.remove('zt-child-selected'));
        activeElementInEditor = null;
    };

    const canvasWrapper = document.getElementById('zt-canvas-wrapper');
    if (canvasWrapper && !canvasWrapper.dataset.ztDeselectBound) {
        canvasWrapper.dataset.ztDeselectBound = 'true';
        canvasWrapper.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('.zt-context-bar')) return;
            if (target.closest('.zt-builder-block')) return;
            clearBlockSelection();
        });
    }

    canvasEl.addEventListener('dblclick', (e) => {
        const target = e.target;
        const anchor = target.closest ? target.closest('a') : null;
        if (!anchor) return;
        if (target.tagName === 'IMG' || anchor.querySelector('img')) return;
        if (anchor.closest('.zt-html-container')) return;
        const block = anchor.closest('.zt-builder-block');
        if (!block) return;
        if (typeof openLinkModal === 'function') {
            selectBlock(block);
            openLinkModal({ mode: 'text', block, targetElement: anchor, activeLink: anchor, selectionHasText: true });
            e.preventDefault();
            e.stopPropagation();
        }
    });

    canvasEl.addEventListener('click', (e) => {
        const target = e.target;
        const block = target.closest('.zt-builder-block');

        // Prevent Context Bar clicks from bubbling
        if (target.closest('.zt-context-bar')) return;

        // 1. Delete Block
        if (target.closest('.zt-del-btn')) {
            window.ztEditorIsDirty = true; // Mark Dirty
            if(block) {
                const next = block.nextElementSibling || block.previousElementSibling;
                block.remove();
                if (next) { selectBlock(next); next.scrollIntoView({behavior:'smooth', block:'center'}); }
            }
            captureEditorState();
            e.stopPropagation(); return;
        }

        // 2. Duplicate Block
        if (target.closest('.zt-dup-btn')) {
            window.ztEditorIsDirty = true; // Mark Dirty
            if(block) {
                const clone = block.cloneNode(true);
                clone.querySelectorAll('.zt-context-bar').forEach(el => el.remove());

                // FIX: Regenerate ID for Text Blocks to prevent CSS collision
                if (block.getAttribute('data-type') === 'text') {
                    // Find the existing ID (zt-xxxxxxxxx)
                    // The block structure is: <div class="zt-block-content"><div id="zt-...">...</div></div>
                    // We look for id="zt-..." in the innerHTML
                    const html = clone.innerHTML;
                    const idMatch = html.match(/id="(zt-[a-z0-9]+)"/);
                    if (idMatch && idMatch[1]) {
                        const oldId = idMatch[1];
                        const newId = 'zt-' + Math.random().toString(36).substr(2, 9);
                        // Replace ALL occurrences (the div ID and the CSS selector #ID)
                        clone.innerHTML = html.replaceAll(oldId, newId);
                    }
                }

                block.after(clone);
                // Re-init sortables if it was a grid
                if(clone.querySelector('.zt-column')) refreshNestedSortables(clone);
                selectBlock(clone);
            }
            captureEditorState();
            e.stopPropagation(); return;
        }

        // 2b. Block Styles
        if (target.closest('.zt-style-btn')) {
            if (block) {
                openBlockStyleModal(block);
            }
            e.stopPropagation(); return;
        }

        // 2c. Block Link
        if (target.closest('.zt-link-btn')) {
            if (block && typeof openLinkModal === 'function') {
                openLinkModal({ mode: 'block', block, targetElement: block, activeLink: null, selectionHasText: false });
            }
            e.stopPropagation(); return;
        }

        // 2d. Social Links Editor
        if (target.closest('.zt-social-edit-btn')) {
            if (block && typeof openSocialLinksModal === 'function') {
                openSocialLinksModal(block);
            }
            e.stopPropagation(); return;
        }

        // 3. Move Up/Down
        if (target.closest('.zt-move-up-btn')) { 
            window.ztEditorIsDirty = true; // Mark Dirty
            if (block && block.previousElementSibling) { 
                block.parentElement.insertBefore(block, block.previousElementSibling); 
                block.scrollIntoView({behavior:'smooth', block:'center'}); 
            } 
            captureEditorState();
            e.stopPropagation(); return; 
        }
        if (target.closest('.zt-move-down-btn')) { 
            window.ztEditorIsDirty = true; // Mark Dirty
            if (block && block.nextElementSibling) { 
                block.parentElement.insertBefore(block.nextElementSibling, block); 
                block.scrollIntoView({behavior:'smooth', block:'center'}); 
            } 
            captureEditorState();
            e.stopPropagation(); return; 
        }

        // 4. Selection & Popups
        if (block) {
            const wasSelected = block.classList.contains('selected');
            // HTML Block Tab Logic
            if (target.classList.contains('zt-html-tab')) {
                const container = target.closest('.zt-html-container');
                const mode = target.dataset.mode;
                
                // Update Tabs
                container.querySelectorAll('.zt-html-tab').forEach(t => t.classList.remove('active'));
                target.classList.add('active');

                // Toggle Views
                const sourceView = container.querySelector('.zt-html-source-view');
                const previewView = container.querySelector('.zt-html-preview-view');
                const textarea = container.querySelector('.zt-html-code-editor');

                if (mode === 'preview') {
                    previewView.innerHTML = textarea.value; // Render
                    sourceView.style.display = 'none';
                    previewView.style.display = 'block';
                } else {
                    sourceView.style.display = 'block';
                    previewView.style.display = 'none';
                }
                
                e.stopPropagation();
                return;
            }

            // Ignore if clicking HTML block UI (no context bar)
            if (target.closest('.zt-html-header') || target.closest('.zt-html-source-view') || target.closest('.zt-html-preview-view') || target.closest('.zt-html-container')) {
                clearInlineToolbar();
                selectBlock(block);
                return;
            }

            let editable = target.closest('[contenteditable="true"]');
            const btn = block.querySelector('a');
            const isBtnBlock = btn && btn.closest('.zt-block-content') && btn.parentElement.style.textAlign;

            if (isBtnBlock) { editable = btn; }
            else if (!editable && block.querySelector('.zt-block-content')) {
                editable = block.querySelector('.zt-block-content').firstElementChild;
            }

            const popupTarget = target.tagName === 'IMG' ? target : (target.closest('a') ? target.closest('a') : editable);
            if (popupTarget) showInlinePopup(popupTarget);

            selectBlock(block);
            e.stopPropagation();
        } else {
            // Deselect
            clearBlockSelection();
        }
    });
}

function openBlockStyleModal(block) {
    if (!block) return;
    const blockStyle = window.getComputedStyle(block);
    const parseSpacing = (value) => {
        const raw = String(value || '').trim();
        if (!raw) return { top: '', right: '', bottom: '', left: '' };
        const parts = raw.split(/\s+/);
        if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
        if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
        if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
        return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    };
    const normalizeSpacingValue = (value) => {
        const raw = String(value || '').trim();
        if (!raw) return '';
        if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}px`;
        return raw;
    };
    const escapeAttr = (value) => String(value ?? '').replace(/"/g, '&quot;');
    const normalizeColorValue = (value) => String(value || '').trim();
    const getColorInputValue = (value) => {
        const normalized = normalizeColorValue(value);
        if (!normalized) return '#ffffff';
        if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) return normalized;
        if (typeof rgbToHex === 'function') return rgbToHex(normalized);
        return '#ffffff';
    };
    const resetIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 8l-4 4 4 4"></path>
            <path d="M16 12H8"></path>
        </svg>
    `;
    const buildBoxValue = (top, right, bottom, left) => {
        if (!(top || right || bottom || left)) return '';
        const t = top || '0';
        const r = right || '0';
        const b = bottom || '0';
        const l = left || '0';
        return `${t} ${r} ${b} ${l}`;
    };
    const readBoxValues = (prop) => {
        const values = {
            top: block.style[`${prop}Top`] || '',
            right: block.style[`${prop}Right`] || '',
            bottom: block.style[`${prop}Bottom`] || '',
            left: block.style[`${prop}Left`] || ''
        };
        if (values.top || values.right || values.bottom || values.left) return values;
        const shorthand = block.style[prop] || '';
        if (shorthand) return parseSpacing(shorthand);
        if (prop === 'margin' && block.style.marginBottom) {
            values.bottom = block.style.marginBottom;
        }
        return values;
    };
    const readBorderValues = () => {
        const values = {
            top: block.style.borderTopWidth || '',
            right: block.style.borderRightWidth || '',
            bottom: block.style.borderBottomWidth || '',
            left: block.style.borderLeftWidth || ''
        };
        if (values.top || values.right || values.bottom || values.left) return values;
        const shorthand = block.style.borderWidth || '';
        if (shorthand) return parseSpacing(shorthand);
        return values;
    };
    const getLayoutDefaults = () => {
        const blockType = block.getAttribute('data-type') || '';
        const layout = (typeof componentDefaults !== 'undefined' && componentDefaults[blockType]) ? componentDefaults[blockType].layout : null;
        if (!layout) return { padding: null, margin: null, border: null, borderColor: '#e2e8f0', radius: '' };
        const readLayoutBox = (prefix) => {
            const values = {
                top: layout[`${prefix}Top`] || '',
                right: layout[`${prefix}Right`] || '',
                bottom: layout[`${prefix}Bottom`] || '',
                left: layout[`${prefix}Left`] || ''
            };
            if (values.top || values.right || values.bottom || values.left) return values;
            if (layout[prefix]) return parseSpacing(layout[prefix]);
            if (prefix === 'border' && layout.borderWidth) return parseSpacing(layout.borderWidth);
            if (prefix === 'margin' && layout.marginBottom) return { ...values, bottom: layout.marginBottom };
            return values;
        };
        return {
            padding: readLayoutBox('padding'),
            margin: readLayoutBox('margin'),
            border: readLayoutBox('border'),
            borderColor: layout.borderColor || '#e2e8f0',
            radius: layout.radius || '',
            background: layout.background || ''
        };
    };
    const paddingVals = readBoxValues('padding');
    const marginVals = readBoxValues('margin');
    const radiusVal = block.style.borderRadius || '';
    const borderVals = readBorderValues();
    const borderColorVal = block.style.borderColor || '#e2e8f0';
    const backgroundVal = normalizeColorValue(block.style.backgroundColor || '');
    const backgroundInputValue = getColorInputValue(backgroundVal);
    const backgroundWrapValue = backgroundVal || 'transparent';
    const defaultLayout = getLayoutDefaults();

    const content = `
        <div style="display:flex; flex-direction:column; gap:6px;">
            <div>
                <label class="zt-label" style="margin-bottom:4px;">Background</label>
                <div class="zt-field-row">
                    <div class="zt-color-circle-wrap" style="background:${backgroundWrapValue};">
                        <input type="color" id="zt-block-bg-color" class="zt-color-circle" value="${backgroundInputValue}">
                    </div>
                    <input type="text" id="zt-block-bg-text" class="zt-input-title" value="${backgroundVal}" placeholder="transparent" style="flex:1; font-family:monospace;">
                    <button type="button" id="zt-block-bg-reset" class="zt-reset-btn" title="Reset to default" aria-label="Reset to default">${resetIcon}</button>
                </div>
            </div>
            <div>
                <div class="zt-box-title-row">
                    <span class="zt-label">Padding</span>
                    <div class="zt-box-title-actions">
                        <button type="button" class="zt-box-sync is-on" data-sync-toggle="block-padding" data-sync-state="on" aria-pressed="true">Sync</button>
                        <button type="button" class="zt-reset-btn" data-reset-group="block-padding" data-reset-top="${escapeAttr(defaultLayout.padding?.top || '')}" data-reset-right="${escapeAttr(defaultLayout.padding?.right || '')}" data-reset-bottom="${escapeAttr(defaultLayout.padding?.bottom || '')}" data-reset-left="${escapeAttr(defaultLayout.padding?.left || '')}" title="Reset to default" aria-label="Reset to default">${resetIcon}</button>
                    </div>
                </div>
                <div class="zt-box-grid" data-sync-group="block-padding">
                    <input type="text" id="zt-block-pad-top" class="zt-box-input top" placeholder="Top" value="${paddingVals.top}" data-sync-group="block-padding">
                    <input type="text" id="zt-block-pad-right" class="zt-box-input right" placeholder="Right" value="${paddingVals.right}" data-sync-group="block-padding">
                    <input type="text" id="zt-block-pad-bottom" class="zt-box-input bottom" placeholder="Bottom" value="${paddingVals.bottom}" data-sync-group="block-padding">
                    <input type="text" id="zt-block-pad-left" class="zt-box-input left" placeholder="Left" value="${paddingVals.left}" data-sync-group="block-padding">
                    <div class="zt-box-center">
                        <span>Padding</span>
                    </div>
                </div>
            </div>
            <div>
                <div class="zt-box-title-row">
                    <span class="zt-label">Margin</span>
                    <div class="zt-box-title-actions">
                        <button type="button" class="zt-box-sync is-on" data-sync-toggle="block-margin" data-sync-state="on" aria-pressed="true">Sync</button>
                        <button type="button" class="zt-reset-btn" data-reset-group="block-margin" data-reset-top="${escapeAttr(defaultLayout.margin?.top || '')}" data-reset-right="${escapeAttr(defaultLayout.margin?.right || '')}" data-reset-bottom="${escapeAttr(defaultLayout.margin?.bottom || '')}" data-reset-left="${escapeAttr(defaultLayout.margin?.left || '')}" title="Reset to default" aria-label="Reset to default">${resetIcon}</button>
                    </div>
                </div>
                <div class="zt-box-grid" data-sync-group="block-margin">
                    <input type="text" id="zt-block-margin-top" class="zt-box-input top" placeholder="Top" value="${marginVals.top}" data-sync-group="block-margin">
                    <input type="text" id="zt-block-margin-right" class="zt-box-input right" placeholder="Right" value="${marginVals.right}" data-sync-group="block-margin">
                    <input type="text" id="zt-block-margin-bottom" class="zt-box-input bottom" placeholder="Bottom" value="${marginVals.bottom}" data-sync-group="block-margin">
                    <input type="text" id="zt-block-margin-left" class="zt-box-input left" placeholder="Left" value="${marginVals.left}" data-sync-group="block-margin">
                    <div class="zt-box-center">
                        <span>Margin</span>
                    </div>
                </div>
            </div>
            <div>
                <div class="zt-box-title-row">
                    <span class="zt-label">Border</span>
                    <div class="zt-box-title-actions">
                        <button type="button" class="zt-box-sync is-on" data-sync-toggle="block-border" data-sync-state="on" aria-pressed="true">Sync</button>
                        <button type="button" class="zt-reset-btn" data-reset-group="block-border" data-reset-top="${escapeAttr(defaultLayout.border?.top || '')}" data-reset-right="${escapeAttr(defaultLayout.border?.right || '')}" data-reset-bottom="${escapeAttr(defaultLayout.border?.bottom || '')}" data-reset-left="${escapeAttr(defaultLayout.border?.left || '')}" data-reset-color="${escapeAttr(defaultLayout.borderColor || '#e2e8f0')}" data-reset-color-target="zt-block-border-color" title="Reset to default" aria-label="Reset to default">${resetIcon}</button>
                    </div>
                </div>
                <div class="zt-box-grid zt-border-grid">
                    <input type="text" id="zt-block-border-top" class="zt-box-input top" placeholder="Top" value="${borderVals.top}" data-sync-group="block-border">
                    <input type="text" id="zt-block-border-right" class="zt-box-input right" placeholder="Right" value="${borderVals.right}" data-sync-group="block-border">
                    <input type="text" id="zt-block-border-bottom" class="zt-box-input bottom" placeholder="Bottom" value="${borderVals.bottom}" data-sync-group="block-border">
                    <input type="text" id="zt-block-border-left" class="zt-box-input left" placeholder="Left" value="${borderVals.left}" data-sync-group="block-border">
                    <div class="zt-box-center">
                        <div class="zt-border-center">
                            <span>Border</span>
                            <div class="zt-color-circle-wrap" style="background:${borderColorVal};">
                                <input type="color" id="zt-block-border-color" class="zt-color-circle" value="${borderColorVal}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <label class="zt-label" style="margin-bottom:4px;">Rounded Edges</label>
                <div class="zt-field-row" style="margin-bottom:6px;">
                    <input type="text" id="zt-block-radius" class="zt-input-title" placeholder="e.g. 12px" value="${radiusVal}">
                    <button type="button" id="zt-block-radius-reset" class="zt-reset-btn" title="Reset to default" aria-label="Reset to default">${resetIcon}</button>
                </div>
            </div>
        </div>
    `;

    showModal('Block Styles', content, () => {
        const paddingTop = normalizeSpacingValue(document.getElementById('zt-block-pad-top').value);
        const paddingRight = normalizeSpacingValue(document.getElementById('zt-block-pad-right').value);
        const paddingBottom = normalizeSpacingValue(document.getElementById('zt-block-pad-bottom').value);
        const paddingLeft = normalizeSpacingValue(document.getElementById('zt-block-pad-left').value);

        const marginTop = normalizeSpacingValue(document.getElementById('zt-block-margin-top').value);
        const marginRight = normalizeSpacingValue(document.getElementById('zt-block-margin-right').value);
        const marginBottom = normalizeSpacingValue(document.getElementById('zt-block-margin-bottom').value);
        const marginLeft = normalizeSpacingValue(document.getElementById('zt-block-margin-left').value);
        const background = normalizeColorValue(document.getElementById('zt-block-bg-text').value);
        const radius = document.getElementById('zt-block-radius').value.trim();
        const borderTop = normalizeSpacingValue(document.getElementById('zt-block-border-top').value);
        const borderRight = normalizeSpacingValue(document.getElementById('zt-block-border-right').value);
        const borderBottom = normalizeSpacingValue(document.getElementById('zt-block-border-bottom').value);
        const borderLeft = normalizeSpacingValue(document.getElementById('zt-block-border-left').value);
        const color = document.getElementById('zt-block-border-color').value;

        const hasPadding = [paddingTop, paddingRight, paddingBottom, paddingLeft].some(val => val);
        block.style.padding = '';
        block.style.paddingTop = hasPadding ? paddingTop : '';
        block.style.paddingRight = hasPadding ? paddingRight : '';
        block.style.paddingBottom = hasPadding ? paddingBottom : '';
        block.style.paddingLeft = hasPadding ? paddingLeft : '';

        const hasMargin = [marginTop, marginRight, marginBottom, marginLeft].some(val => val);
        block.style.margin = '';
        block.style.marginTop = hasMargin ? marginTop : '';
        block.style.marginRight = hasMargin ? marginRight : '';
        block.style.marginBottom = hasMargin ? marginBottom : '';
        block.style.marginLeft = hasMargin ? marginLeft : '';
        block.style.backgroundColor = background || '';
        block.style.borderRadius = radius;

        const hasBorder = [borderTop, borderRight, borderBottom, borderLeft].some(val => val);
        block.style.border = '';
        block.style.borderColor = color;
        if (hasBorder) {
            const borderWidth = buildBoxValue(borderTop || '0', borderRight || '0', borderBottom || '0', borderLeft || '0');
            block.style.borderWidth = borderWidth;
            block.style.borderStyle = 'solid';
        } else {
            block.style.borderWidth = '';
            block.style.borderStyle = '';
            block.style.borderTopWidth = '';
            block.style.borderRightWidth = '';
            block.style.borderBottomWidth = '';
            block.style.borderLeftWidth = '';
        }

        window.ztEditorIsDirty = true;
        if (typeof queueEditorHistoryCapture === 'function') queueEditorHistoryCapture();
        return true;
    });

    const borderColorInput = document.getElementById('zt-block-border-color');
    if (borderColorInput) {
        const wrap = borderColorInput.closest('.zt-color-circle-wrap');
        if (wrap) wrap.style.backgroundColor = borderColorInput.value;
        borderColorInput.addEventListener('input', (event) => {
            if (wrap) wrap.style.backgroundColor = event.target.value;
        });
    }
    const backgroundColorInput = document.getElementById('zt-block-bg-color');
    const backgroundTextInput = document.getElementById('zt-block-bg-text');
    const backgroundReset = document.getElementById('zt-block-bg-reset');
    const syncBlockBackground = (value) => {
        const normalized = normalizeColorValue(value);
        if (backgroundTextInput) backgroundTextInput.value = normalized;
        if (backgroundColorInput) backgroundColorInput.value = getColorInputValue(normalized);
        const wrap = backgroundColorInput ? backgroundColorInput.closest('.zt-color-circle-wrap') : null;
        if (wrap) wrap.style.backgroundColor = normalized || 'transparent';
    };
    if (backgroundColorInput) backgroundColorInput.addEventListener('input', (event) => syncBlockBackground(event.target.value));
    if (backgroundTextInput) backgroundTextInput.addEventListener('input', (event) => syncBlockBackground(event.target.value));
    if (backgroundReset) backgroundReset.addEventListener('click', () => syncBlockBackground(defaultLayout.background || ''));

    const bindSyncGroup = (group) => {
        const toggle = document.querySelector(`.zt-box-sync[data-sync-toggle="${group}"]`);
        const inputs = Array.from(document.querySelectorAll(`input[data-sync-group="${group}"]`));
        if (!toggle || !inputs.length) return;
        const setState = (on) => {
            toggle.dataset.syncState = on ? 'on' : 'off';
            toggle.classList.toggle('is-on', on);
            toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
        };
        const syncValues = (source) => {
            if (toggle.dataset.syncState === 'off') return;
            const value = source.value;
            inputs.forEach(input => { if (input !== source) input.value = value; });
        };
        setState(true);
        inputs.forEach(input => input.addEventListener('input', (event) => syncValues(event.target)));
        toggle.addEventListener('click', () => {
            const nextState = toggle.dataset.syncState === 'off';
            setState(nextState);
            if (nextState) {
                const baseInput = inputs.find(input => input.value.trim() !== '') || inputs[0];
                if (baseInput) {
                    const value = baseInput.value;
                    inputs.forEach(input => { if (input !== baseInput) input.value = value; });
                }
            }
        });
    };
    const bindGroupReset = (group) => {
        const resetBtn = document.querySelector(`.zt-reset-btn[data-reset-group="${group}"]`);
        if (!resetBtn) return;
        const inputs = Array.from(document.querySelectorAll(`input[data-sync-group="${group}"]`));
        resetBtn.addEventListener('click', () => {
            inputs.forEach(input => {
                let value = '';
                if (input.classList.contains('top')) value = resetBtn.dataset.resetTop || '';
                else if (input.classList.contains('right')) value = resetBtn.dataset.resetRight || '';
                else if (input.classList.contains('bottom')) value = resetBtn.dataset.resetBottom || '';
                else if (input.classList.contains('left')) value = resetBtn.dataset.resetLeft || '';
                input.value = value;
            });
            const colorTarget = resetBtn.dataset.resetColorTarget;
            if (colorTarget) {
                const colorInput = document.getElementById(colorTarget);
                if (colorInput) {
                    const colorValue = resetBtn.dataset.resetColor || '';
                    const normalized = normalizeColorValue(colorValue);
                    colorInput.value = getColorInputValue(normalized);
                    const wrap = colorInput.closest('.zt-color-circle-wrap');
                    if (wrap) wrap.style.backgroundColor = normalized || 'transparent';
                }
            }
        });
    };
    ['block-padding', 'block-margin', 'block-border'].forEach(bindSyncGroup);
    ['block-padding', 'block-margin', 'block-border'].forEach(bindGroupReset);

    const radiusReset = document.getElementById('zt-block-radius-reset');
    if (radiusReset) {
        radiusReset.addEventListener('click', () => {
            const radiusInput = document.getElementById('zt-block-radius');
            if (radiusInput) radiusInput.value = defaultLayout.radius || '';
        });
    }

    const modal = document.querySelector('.zt-modal-overlay');
    if (modal) {
        const buttonGroup = modal.querySelector('.zt-btn-group');
        if (buttonGroup && !modal.querySelector('#modal-reset')) {
            const resetBtn = document.createElement('button');
            resetBtn.id = 'modal-reset';
            resetBtn.className = 'zt-btn-cancel';
            resetBtn.textContent = 'Reset to Defaults';
            buttonGroup.insertBefore(resetBtn, buttonGroup.firstChild);
            resetBtn.onclick = () => {
                const setValue = (id, value) => {
                    const el = document.getElementById(id);
                    if (el) el.value = value || '';
                };
                if (defaultLayout.padding) {
                    setValue('zt-block-pad-top', defaultLayout.padding.top);
                    setValue('zt-block-pad-right', defaultLayout.padding.right);
                    setValue('zt-block-pad-bottom', defaultLayout.padding.bottom);
                    setValue('zt-block-pad-left', defaultLayout.padding.left);
                }
                if (defaultLayout.margin) {
                    setValue('zt-block-margin-top', defaultLayout.margin.top);
                    setValue('zt-block-margin-right', defaultLayout.margin.right);
                    setValue('zt-block-margin-bottom', defaultLayout.margin.bottom);
                    setValue('zt-block-margin-left', defaultLayout.margin.left);
                }
                if (defaultLayout.border) {
                    setValue('zt-block-border-top', defaultLayout.border.top);
                    setValue('zt-block-border-right', defaultLayout.border.right);
                    setValue('zt-block-border-bottom', defaultLayout.border.bottom);
                    setValue('zt-block-border-left', defaultLayout.border.left);
                }
                setValue('zt-block-radius', defaultLayout.radius);
                const colorInput = document.getElementById('zt-block-border-color');
                if (colorInput) {
                    colorInput.value = defaultLayout.borderColor || '#e2e8f0';
                    const colorWrap = colorInput.closest('.zt-color-circle-wrap');
                    if (colorWrap) colorWrap.style.backgroundColor = colorInput.value;
                }
                setValue('zt-block-bg-text', defaultLayout.background);
                const bgInput = document.getElementById('zt-block-bg-color');
                if (bgInput) {
                    bgInput.value = getColorInputValue(defaultLayout.background);
                    const bgWrap = bgInput.closest('.zt-color-circle-wrap');
                    if (bgWrap) bgWrap.style.backgroundColor = normalizeColorValue(defaultLayout.background) || 'transparent';
                }
            };
        }
    }
}

function showUnsavedChangesModal(onConfirm) {
    const layer = document.createElement('div');
    layer.id = 'zt-unsaved-modal';
    layer.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:2147483647; display:flex; align-items:center; justify-content:center;";
    
    layer.innerHTML = `
        <div class="zt-unsaved-card" tabindex="-1" style="background:white; padding:24px; border-radius:16px; width:320px; box-shadow:0 24px 45px rgba(15,23,42,0.2); animation:slideUpFade 0.2s; font-family:var(--zt-font);">
            <div style="font-size:16px; font-weight:700; margin-bottom:8px; color:#0f172a;">Unsaved Changes</div>
            <p style="font-size:14px; color:#64748b; line-height:1.5; margin-bottom:20px;">You have unsaved changes. Are you sure you want to close the editor? Your changes will be lost.</p>
            <div class="zt-btn-group">
                <button class="zt-btn-cancel" id="zt-modal-cancel">Keep Editing</button>
                <button class="zt-btn-danger" id="zt-modal-confirm">Discard Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(layer);
    
    const cancelBtn = document.getElementById('zt-modal-cancel');
    const confirmBtn = document.getElementById('zt-modal-confirm');
    const card = layer.querySelector('.zt-unsaved-card');
    if (card) setTimeout(() => card.focus(), 50);

    if (cancelBtn) cancelBtn.onclick = () => layer.remove();
    if (confirmBtn) confirmBtn.onclick = () => {
        layer.remove();
        onConfirm();
    };

    if (card) {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                if (confirmBtn) confirmBtn.click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                if (cancelBtn) cancelBtn.click();
            }
        });
    }
}
