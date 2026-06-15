/* --- EDITOR CORE ORCHESTRATOR --- */

function openFullScreenEditor(template = null) {
  window.ztEditorIsDirty = false; // Reset Dirty State
  const isEdit = !!template && !!template.id;
  window.ztCurrentTemplateId = isEdit ? template.id : null; // STORE ID
  let fsLayer = document.getElementById('zt-fs-layer');
  if (!fsLayer) {
    fsLayer = document.createElement('div');
    fsLayer.id = 'zt-fs-layer';
    document.body.appendChild(fsLayer);
  }

  // 1. Render Layout
  fsLayer.innerHTML = getEditorLayoutHTML(isEdit);
  const saveBtn = fsLayer.querySelector('#fs-save');
  if (saveBtn && template && template.isDefault) {
    const label = saveBtn.querySelector('.zt-save-label');
    if (label) {
      label.textContent = 'Save as new';
      label.setAttribute('data-mobile-label', 'Save');
    }
    saveBtn.setAttribute('data-mobile-label', 'Save');
  }

  const tpl = template || { title: '', subject: '', shortcut: '', body: '', category: null }; // Changed default category to null

  // Wait for DOM
  setTimeout(() => {
    try {
        const canvasEl = document.getElementById('fs-visual');
        const sidebarEl = document.querySelector('.zt-fs-modules-content');

        // 2. Init Components & Settings (load presets first)
        renderComponentsList();
        const finishInit = () => {
            const isNewTemplate = !template || !template.id;
            if (isNewTemplate) {
                if (typeof getStylePresets === 'function' && typeof setActiveStylePreset === 'function') {
                    const presets = getStylePresets();
                    const defaultPreset = presets[0];
                    if (defaultPreset) setActiveStylePreset(defaultPreset, { persist: false, applyToEditor: false });
                }
            } else if (template && template.stylePresetId && typeof resolveStylePresetForTemplate === 'function' && typeof setActiveStylePreset === 'function') {
                const preset = resolveStylePresetForTemplate(template);
                if (preset) setActiveStylePreset(preset, { persist: false, applyToEditor: false });
            }
            renderStylePresets();
            renderTemplateSettingsInPanel(tpl);

            // 3. Init Drag & Drop (Centralized)
            // We pass the elements to the Drag Manager
            if (typeof Sortable === 'undefined') {
                 console.error("MailPaw: SortableJS not found.");
                 alert("Error: The Drag & Drop library could not be loaded. Please reload the page or check your connection.");
            } else {
                 setupDragAndDrop(canvasEl, sidebarEl);
            }

            // 4. Load Content
            loadEditorContent(canvasEl, tpl);

            // 5. Attach Events (Close, Save, Canvas Clicks)
            attachEditorGlobalEvents(fsLayer);
            attachEditorCanvasEvents(canvasEl);

            initializeEditorHistory();

            fsLayer.classList.add('show');
            document.getElementById('zt_tpl_nme_fs').focus();
        };

        if (typeof ensureStylePresetLoaded === 'function') {
            ensureStylePresetLoaded(finishInit);
        } else {
            finishInit();
        }

    } catch(e) { console.error(e); alert("Editor Error: " + e.message); }
  }, 0);
}

function loadEditorContent(canvasEl, tpl) {
    if (tpl.design) {
        canvasEl.innerHTML = tpl.design;
        // Re-init sortables for nested grids inside the loaded content
        refreshNestedSortables(canvasEl);

        // Restore HTML Textareas
        canvasEl.querySelectorAll('.zt-html-container').forEach(container => {
            const textarea = container.querySelector('.zt-html-code-editor');
            const preview = container.querySelector('.zt-html-preview-view');
            if (textarea && !textarea.value && preview) {
                textarea.value = preview.innerHTML;
            }
            const blockContent = container.closest('.zt-builder-block')?.querySelector('.zt-block-content');
            if (blockContent) blockContent.setAttribute('contenteditable', 'false');
            if (preview) preview.setAttribute('contenteditable', 'false');
        });
    } else {
        // Legacy Fallback for old templates
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = tpl.body;
        Array.from(tempDiv.childNodes).forEach(node => {
            if (node.nodeType === 3 && node.textContent.trim() === '') return;
            if (node.nodeType === 1 && node.classList.contains('zt-builder-block')) {
                canvasEl.appendChild(node.cloneNode(true));
            } else {
                const wrapper = createBlockHTML('text');
                wrapper.querySelector('.zt-block-content').innerHTML = '';
                wrapper.querySelector('.zt-block-content').appendChild(node.cloneNode(true));
                canvasEl.appendChild(wrapper);
            }
        });
        refreshNestedSortables(canvasEl);
    }
    hydrateSocialBlocks(canvasEl);
    ensureSocialEditButtons(canvasEl);
    if (typeof window.applyGlobalFontColorToBlocks === 'function' && window.ztGlobalFontColor && window.ztGlobalFontColorActive) {
        window.applyGlobalFontColorToBlocks(window.ztGlobalFontColor);
    }
}

function ensureSocialEditButtons(canvasEl) {
    if (!canvasEl) return;
    canvasEl.querySelectorAll('.zt-builder-block[data-type="social"]').forEach((block) => {
        const controls = block.querySelector('.zt-block-controls');
        if (!controls) return;
        const existingBtn = controls.querySelector('.zt-social-edit-btn');
        if (existingBtn) {
            if (!existingBtn.querySelector('span')) {
                existingBtn.setAttribute('data-tooltip', 'Edit social links');
                existingBtn.setAttribute('aria-label', 'Edit social links');
                existingBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="12" r="2"></circle><circle cx="18" cy="6" r="2"></circle><circle cx="18" cy="18" r="2"></circle><path d="M8 12h7"></path><path d="M12 12l6-6"></path><path d="M12 12l6 6"></path></svg><span>Edit Socials</span>`;
            }
            return;
        }
        const linkBtn = controls.querySelector('.zt-link-btn');
        const btn = document.createElement('button');
        btn.className = 'zt-control-btn zt-social-edit-btn';
        btn.setAttribute('data-tooltip', 'Edit social links');
        btn.setAttribute('aria-label', 'Edit social links');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="12" r="2"></circle><circle cx="18" cy="6" r="2"></circle><circle cx="18" cy="18" r="2"></circle><path d="M8 12h7"></path><path d="M12 12l6-6"></path><path d="M12 12l6 6"></path></svg><span>Edit Socials</span>`;
        if (linkBtn && linkBtn.nextSibling) {
            linkBtn.parentNode.insertBefore(btn, linkBtn.nextSibling);
        } else {
            controls.appendChild(btn);
        }
    });
}

function hydrateSocialBlocks(canvasEl) {
    if (!canvasEl || typeof buildSocialLinksHTML !== 'function') return;
    const getOptions = () => (typeof getSocialNetworkOptions === 'function')
        ? getSocialNetworkOptions()
        : ['LinkedIn', 'X', 'Instagram', 'TikTok', 'YouTube'];
    const getNetworks = (block) => {
        const attr = block.getAttribute('data-social-networks');
        if (attr) return attr.split(',').map(name => name.trim()).filter(Boolean);
        const fromData = Array.from(block.querySelectorAll('a[data-network]'))
            .map(anchor => anchor.dataset.network)
            .filter(Boolean);
        if (fromData.length) return Array.from(new Set(fromData));
        const options = getOptions();
        const fallback = [];
        block.querySelectorAll('a').forEach(anchor => {
            const text = (anchor.textContent || '').trim().toLowerCase();
            const match = options.find(name => text.includes(name.toLowerCase()));
            if (match && !fallback.includes(match)) fallback.push(match);
        });
        return fallback;
    };
    const getAlignment = (block) => {
        const content = block.querySelector('.zt-block-content');
        const table = block.querySelector('table');
        return (content && content.style.textAlign) || (table && table.getAttribute('align')) || 'center';
    };
    const getHrefMap = (block) => {
        const map = {};
        block.querySelectorAll('a[data-network]').forEach(anchor => {
            const key = anchor.dataset.network;
            if (key) map[key] = anchor.getAttribute('href') || '';
        });
        if (Object.keys(map).length) return map;
        const options = getOptions();
        block.querySelectorAll('a').forEach(anchor => {
            const text = (anchor.textContent || '').trim().toLowerCase();
            const match = options.find(name => text.includes(name.toLowerCase()));
            if (match && !map[match]) map[match] = anchor.getAttribute('href') || '';
        });
        return map;
    };

    canvasEl.querySelectorAll('.zt-builder-block[data-type="social"]').forEach((block) => {
        const content = block.querySelector('.zt-block-content');
        if (!content) return;
        const networks = getNetworks(block);
        if (!networks.length) return;
        const align = getAlignment(block);
        const hrefMap = getHrefMap(block);
        content.innerHTML = buildSocialLinksHTML(networks, { align, hrefMap });
        content.style.textAlign = align;
        block.setAttribute('data-social-networks', networks.join(','));
    });
}
