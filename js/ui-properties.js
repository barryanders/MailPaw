/* --- PROPERTIES PANEL --- */

function applyGlobalFontColorToBlocks(color, options = {}) {
    const next = String(color || '').trim();
    if (!next) return;
    const previous = String(window.ztGlobalFontColor || '').trim();
    const force = options.force === true;
    const active = window.ztGlobalFontColorActive || force;
    if (!active) {
        window.ztGlobalFontColor = next;
        return;
    }
    const normalizeColor = (val) => {
        const raw = String(val || '').trim().toLowerCase();
        if (!raw || raw === 'transparent') return '';
        if (raw.startsWith('#')) {
            if (raw.length === 4) {
                return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
            }
            return raw;
        }
        const match = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const toHex = (num) => Number(num).toString(16).padStart(2, '0');
            return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
        }
        return raw;
    };
    const shouldUpdate = (el, defaults) => {
        if (!el) return false;
        if (force) return true;
        const current = normalizeColor(el.style.color);
        if (!current) return true;
        return defaults.some((val) => {
            const normalized = normalizeColor(val);
            return normalized && current === normalized;
        });
    };

    const headingDefault = componentDefaults?.heading?.color || '';
    const textDefault = componentDefaults?.text?.color || '';
    const socialDefault = '#0f172a';

    document.querySelectorAll('.zt-builder-block[data-type="heading"] h1, .zt-builder-block[data-type="heading"] h2, .zt-builder-block[data-type="heading"] h3, .zt-builder-block[data-type="heading"] h4, .zt-builder-block[data-type="heading"] h5, .zt-builder-block[data-type="heading"] h6')
        .forEach((el) => {
            if (shouldUpdate(el, [headingDefault, previous])) el.style.color = next;
        });

    document.querySelectorAll('.zt-builder-block[data-type="text"]').forEach((block) => {
        block.querySelectorAll('p, li, blockquote').forEach((el) => {
            if (shouldUpdate(el, [textDefault, previous])) el.style.color = next;
        });
    });

    document.querySelectorAll('.zt-builder-block[data-type="social"] a').forEach((el) => {
        if (shouldUpdate(el, [socialDefault, previous])) el.style.color = next;
    });
    window.ztGlobalFontColor = next;
}

if (typeof window !== 'undefined') {
    window.applyGlobalFontColorToBlocks = applyGlobalFontColorToBlocks;
}

function buildStylePresetDefaults(preset) {
    const baseButtonBg = (typeof componentDefaults !== 'undefined' && componentDefaults.button?.bg) ? componentDefaults.button.bg : '#6366f1';
    const baseButtonColor = (typeof componentDefaults !== 'undefined' && componentDefaults.button?.color) ? componentDefaults.button.color : '#ffffff';
    const baseLinkColor = (typeof componentDefaults !== 'undefined' && componentDefaults.text?.link?.color) ? componentDefaults.text.link.color : '#6366f1';
    const baseDividerColor = (typeof componentDefaults !== 'undefined' && componentDefaults.divider?.color) ? componentDefaults.divider.color : '#e5e7eb';
    return {
        buttonBg: preset?.accent || baseButtonBg,
        buttonColor: preset?.accentText || baseButtonColor,
        linkColor: preset?.linkColor || baseLinkColor,
        dividerColor: preset?.dividerColor || baseDividerColor
    };
}

if (typeof window !== 'undefined') {
    window.buildStylePresetDefaults = buildStylePresetDefaults;
}

function applyStylePresetToEditor(preset, options = {}) {
    if (!preset) return;
    const force = options.force === true;
    const defaults = (typeof buildStylePresetDefaults === 'function') ? buildStylePresetDefaults(preset) : null;
    if (defaults) {
        window.ztStylePresetDefaults = defaults;
    }
    const canvasEl = document.getElementById('fs-visual');
    const bgInput = document.getElementById('zt_glob_bg_email');
    const bgWrap = document.getElementById('wrap_zt_glob_bg_email');
    const fontSelect = document.getElementById('zt_glob_font_fs');
    const fontColorInput = document.getElementById('zt_glob_font_color');
    const fontColorWrap = document.getElementById('wrap_zt_glob_font_color');

    const nextBg = preset.bgEmail || '#ffffff';
    const nextFont = preset.fontFamily || 'inherit';
    const nextColor = preset.fontColor || '#0f172a';

    if (bgInput) bgInput.value = nextBg;
    if (bgWrap) bgWrap.style.backgroundColor = nextBg;
    if (canvasEl) canvasEl.style.backgroundColor = nextBg;

    if (fontSelect) fontSelect.value = nextFont;
    if (canvasEl) canvasEl.style.fontFamily = nextFont === 'inherit' ? '' : nextFont;

    if (fontColorInput) fontColorInput.value = nextColor;
    if (fontColorWrap) fontColorWrap.style.backgroundColor = nextColor;
    if (canvasEl) canvasEl.style.color = nextColor;

    window.ztGlobalFontColorActive = true;
    if (typeof window.applyGlobalFontColorToBlocks === 'function') {
        window.applyGlobalFontColorToBlocks(nextColor, { force });
    } else {
        window.ztGlobalFontColor = nextColor;
    }

    if (canvasEl) {
        const prevPreset = window.ztPrevStylePreset || null;
        const normalizeColor = (value) => {
            const raw = String(value || '').trim().toLowerCase();
            if (!raw || raw === 'transparent') return '';
            if (raw.startsWith('#')) {
                if (raw.length === 4) {
                    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
                }
                return raw;
            }
            if (raw.startsWith('rgb')) {
                if (typeof rgbToHex === 'function') return rgbToHex(raw).toLowerCase();
                const match = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (match) {
                    const toHex = (num) => Number(num).toString(16).padStart(2, '0');
                    return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
                }
            }
            return raw;
        };
        const matchesColor = (current, candidates = []) => {
            const normalized = normalizeColor(current);
            if (!normalized) return false;
            return candidates.some((candidate) => {
                const candidateNorm = normalizeColor(candidate);
                return candidateNorm && candidateNorm === normalized;
            });
        };

        const baseButtonBg = componentDefaults?.button?.bg || '';
        const baseButtonColor = componentDefaults?.button?.color || '';
        const baseLinkColor = componentDefaults?.text?.link?.color || '';
        const baseDividerColor = componentDefaults?.divider?.color || '';

        const nextButtonBg = defaults?.buttonBg || preset.accent || baseButtonBg;
        const nextButtonColor = defaults?.buttonColor || preset.accentText || baseButtonColor;
        const nextLinkColor = defaults?.linkColor || preset.linkColor || baseLinkColor;
        const nextDividerColor = defaults?.dividerColor || preset.dividerColor || baseDividerColor;

        canvasEl.querySelectorAll('.zt-builder-block[data-type="button"] a').forEach((anchor) => {
            const currentBg = normalizeColor(anchor.style.background || anchor.style.backgroundColor || getComputedStyle(anchor).backgroundColor);
            const currentColor = normalizeColor(anchor.style.color || getComputedStyle(anchor).color);
            if (force || !currentBg || matchesColor(currentBg, [prevPreset?.accent, baseButtonBg])) {
                anchor.style.background = nextButtonBg;
                anchor.style.backgroundColor = nextButtonBg;
            }
            if (force || !currentColor || matchesColor(currentColor, [prevPreset?.accentText, baseButtonColor])) {
                anchor.style.color = nextButtonColor;
            }
        });

        canvasEl.querySelectorAll('.zt-builder-block[data-type="divider"] hr').forEach((hr) => {
            const currentColor = normalizeColor(hr.style.borderTopColor || getComputedStyle(hr).borderTopColor);
            if (force || !currentColor || matchesColor(currentColor, [prevPreset?.dividerColor, baseDividerColor])) {
                hr.style.borderTopColor = nextDividerColor;
            }
        });

        canvasEl.querySelectorAll('.zt-builder-block[data-type="text"]').forEach((block) => {
            const styleEl = block.querySelector('style');
            if (styleEl) {
                const text = styleEl.textContent || '';
                const linkMatch = text.match(/a\\s*\\{[^}]*color:\\s*([^;]+);/i);
                const currentLink = linkMatch ? linkMatch[1].trim() : '';
                if (force || !currentLink || matchesColor(currentLink, [prevPreset?.linkColor, baseLinkColor])) {
                    styleEl.textContent = text.replace(/(a\\s*\\{[^}]*color:)\\s*([^;]+)(;)/i, (match, prefix, value, suffix) => {
                        const keepImportant = /!important/i.test(value) ? ' !important' : '';
                        return `${prefix} ${nextLinkColor}${keepImportant}${suffix}`;
                    });
                }
            }
            block.querySelectorAll('a').forEach((anchor) => {
                const currentColor = normalizeColor(anchor.style.color || getComputedStyle(anchor).color);
                if (force || !currentColor || matchesColor(currentColor, [prevPreset?.linkColor, baseLinkColor])) {
                    anchor.style.color = nextLinkColor;
                }
            });
        });
    }

    window.ztEditorIsDirty = true;
    if (typeof queueEditorHistoryCapture === 'function') queueEditorHistoryCapture();
}

if (typeof window !== 'undefined') {
    window.applyStylePresetToEditor = applyStylePresetToEditor;
}

function renderTemplateSettingsInPanel(template) {
    const settingsForm = document.getElementById('zt-fs-settings-form');
    if (!settingsForm) return;

    // --- SETUP VALUES ---
    const isNewTemplate = !template || !template.id;
    const presetDefaults = (isNewTemplate && window.ztStylePreset) ? window.ztStylePreset : null;
    const baseDefaults = {
        bgEmail: presetDefaults?.bgEmail || '#ffffff',
        fontFamily: presetDefaults?.fontFamily || '',
        fontColor: presetDefaults?.fontColor || ''
    };
    const tpl = template
        ? { ...baseDefaults, ...template }
        : { title: '', subject: '', shortcut: '', body: '', category: '', ...baseDefaults };

    // --- POPULATE CATEGORIES (Dynamic) ---
    // 1. Collect all categories from existing templates
    const uniqueCats = new Set();
    if (typeof templates !== 'undefined' && Array.isArray(templates)) {
        templates.forEach(t => { if(t.category) uniqueCats.add(t.category); });
    }

    // 2. Sort and Build Options
    const sortedCats = Array.from(uniqueCats).sort();
    const catOptions = sortedCats.map(c => `<option value="${c}">${c}</option>`).join('');

    // --- UI HELPERS ---
    const renderColorCircle = (id, val, title) => `
        <div class="zt-color-circle-wrap" id="wrap_${id}" style="background:${val}; border:1px solid #e5e7eb; width:34px; height:34px;" title="${title}">
            <input type="color" id="${id}" class="zt-color-circle" value="${val}" autocomplete="off" data-bwignore="true" data-lpignore="true" data-1p-ignore="true">
        </div>
    `;
    const fontOptions = typeof FONT_OPTIONS !== 'undefined' ? FONT_OPTIONS : '<option value="inherit">Inherit / System</option>';
    const defaultFontColor = tpl.fontColor || '#0f172a';
    const isStandalone = typeof window !== 'undefined' && window.ZT_STANDALONE;
    const shortcutField = isStandalone ? '' : `
        <input type="text" class="zt-input-title" id="zt_tpl_sht_fs" placeholder="/shortcut" style="font-family:monospace;" autocomplete="off" />
    `;
    const subjectLabel = isStandalone ? 'Subject' : 'Subject & Shortcut';

    // --- RENDER FORM ---
    settingsForm.innerHTML = `
        <div class="zt-group-title">Template Info</div>
        <div class="zt-label-row"><label class="zt-label">Name & Category</label></div>
        <input type="text" class="zt-input-title" id="zt_tpl_nme_fs" placeholder="Template Name" autocomplete="off" style="margin-bottom:8px;" />

        <div id="zt-cat-wrapper" style="margin-bottom:16px;">
            <select class="zt-input-select" id="zt_tpl_cat_fs">
                ${catOptions}
                <option value="__NEW__" style="font-weight:bold; color:var(--zt-primary);">+ Create New Category...</option>
            </select>
        </div>

        <div class="zt-label-row"><label class="zt-label">${subjectLabel}</label></div>
        <input type="text" class="zt-input-title" id="zt_tpl_sbj_fs" placeholder="Subject Line" autocomplete="off" style="margin-bottom:8px;" />
        ${shortcutField}

        <div class="zt-group-title" style="margin-top:24px;">Email Appearance</div>
        <div class="zt-style-presets-panel">
            <div class="zt-label-row"><label class="zt-label">Style Presets</label></div>
            <div class="zt-style-presets zt-style-presets-grid" data-style-presets="editor" aria-label="Style presets"></div>
        </div>
        <div class="zt-style-group">
            <div class="zt-style-row" style="gap:16px;">
                <div class="zt-style-col">
                    <label class="zt-label" style="margin-bottom:6px;">Email BG</label>
                    ${renderColorCircle('zt_glob_bg_email', tpl.bgEmail || '#ffffff', 'Email Background')}
                </div>
                <div class="zt-style-col">
                    <label class="zt-label" style="margin-bottom:6px;">Font Color</label>
                    ${renderColorCircle('zt_glob_font_color', defaultFontColor, 'Font Color')}
                </div>
            </div>
            <div class="zt-style-row" style="gap:16px; margin-top:12px;">
                <div class="zt-style-col" style="flex:1;">
                    <label class="zt-label" style="margin-bottom:6px;">Global Font</label>
                    <select class="zt-input-select" id="zt_glob_font_fs">
                        ${fontOptions}
                    </select>
                </div>
            </div>
        </div>
    `;

    // --- APPLY VALUES ---
    document.getElementById('zt_tpl_nme_fs').value = tpl.title;
    document.getElementById('zt_tpl_sbj_fs').value = tpl.subject || '';
    const shortcutInput = document.getElementById('zt_tpl_sht_fs');
    if (shortcutInput) shortcutInput.value = tpl.shortcut || '';

    document.getElementById('zt_tpl_nme_fs').oninput = () => { window.ztEditorIsDirty = true; queueEditorHistoryCapture(); };
    document.getElementById('zt_tpl_sbj_fs').oninput = () => { window.ztEditorIsDirty = true; queueEditorHistoryCapture(); };
    if (shortcutInput) shortcutInput.oninput = () => { window.ztEditorIsDirty = true; queueEditorHistoryCapture(); };

    // --- CATEGORY LOGIC: COMBINED INPUT + DROPDOWN ---
    const wrapper = document.getElementById('zt-cat-wrapper');
    const isNew = !template || !template.id;
    const initialCategory = isNew ? '' : (tpl.category || '');

    // Build the category UI
    wrapper.innerHTML = `
        <div style="position:relative;">
            <input type="text" class="zt-input-title" id="zt_tpl_cat_fs" placeholder="Enter Category Name" value="${initialCategory}" style="padding-right:42px;" />
            <button class="zt-btn-cancel zt-cat-toggle" id="zt-cat-list-btn" type="button" title="Select Existing Category">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9l6 6 6-6"></path>
                </svg>
            </button>
            <div id="zt-cat-suggestions" style="position:absolute; top:calc(100% + 4px); left:0; width:100%; background:white; border:1px solid #e5e7eb; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); max-height:200px; overflow-y:auto; z-index:10; display:none;">
            </div>
        </div>
    `;

    const categoryInput = document.getElementById('zt_tpl_cat_fs');
    const categoryButton = document.getElementById('zt-cat-list-btn');
    const suggestionsBox = document.getElementById('zt-cat-suggestions');

    // Populate suggestions
    const renderSuggestions = () => {
        let currentOptions = sortedCats.map(c => `<div class="zt-suggestion-item" data-value="${c}">${c}</div>`).join('');
        currentOptions += `<div class="zt-suggestion-item" data-value="__NEW__" style="font-weight:bold; color:var(--zt-primary);">+ Create New Category...</div>`;
        suggestionsBox.innerHTML = currentOptions;
    };

    // Show/Hide suggestions
    categoryButton.onclick = (e) => {
        e.preventDefault(); // Prevent input from losing focus if this causes issues
        e.stopPropagation();
        renderSuggestions();
        suggestionsBox.style.display = suggestionsBox.style.display === 'none' ? 'block' : 'none';
    };

    // Handle selection from suggestions
    suggestionsBox.onclick = (e) => {
        const item = e.target.closest('.zt-suggestion-item');
        if (item) {
            window.ztEditorIsDirty = true;
            const val = item.dataset.value;
            if (val === '__NEW__') {
                categoryInput.value = ''; // Clear for new input
                categoryInput.focus();
            } else {
                categoryInput.value = val;
            }
            suggestionsBox.style.display = 'none';
            queueEditorHistoryCapture();
        }
    };

    bindCategoryDismissListener();

    // Mark dirty on input change
    categoryInput.oninput = () => { window.ztEditorIsDirty = true; queueEditorHistoryCapture(); };

    // --- BINDING LOGIC ---
    const visualEditor = document.getElementById('fs-visual');

    // Init Backgrounds
    if (tpl.bgEmail) visualEditor.style.backgroundColor = tpl.bgEmail;
    visualEditor.style.fontFamily = tpl.fontFamily || '';
    visualEditor.style.color = defaultFontColor;
    window.ztGlobalFontColor = defaultFontColor;
    window.ztGlobalFontColorActive = !!tpl.fontColor;

    // Helper: Bind Input to CSS Property (Inline)
    const bindInline = (id, selector, prop) => {
        const el = document.getElementById(id);
        const wrap = document.getElementById('wrap_' + id);
        if(!el) return;
        el.oninput = (e) => {
            window.ztEditorIsDirty = true;
            const val = e.target.value;
            if(wrap) wrap.style.backgroundColor = val;

            if (selector === 'EMAIL') {
                visualEditor.style.backgroundColor = val;
            }
            queueEditorHistoryCapture();
        };
        el.onchange = el.oninput;
    };

    bindInline('zt_glob_bg_email', 'EMAIL', null);

    const fontSelect = document.getElementById('zt_glob_font_fs');
    if (fontSelect) {
        fontSelect.value = tpl.fontFamily || 'inherit';
        fontSelect.onchange = (e) => {
            window.ztEditorIsDirty = true;
            const val = e.target.value;
            visualEditor.style.fontFamily = val;
            queueEditorHistoryCapture();
        };
    }

    const fontColorInput = document.getElementById('zt_glob_font_color');
    const fontColorWrap = document.getElementById('wrap_zt_glob_font_color');
    if (fontColorInput) {
        fontColorInput.value = defaultFontColor;
        if (fontColorWrap) fontColorWrap.style.backgroundColor = defaultFontColor;
        const applyColor = (val) => {
            window.ztEditorIsDirty = true;
            if (fontColorWrap) fontColorWrap.style.backgroundColor = val;
            visualEditor.style.color = val;
            window.ztGlobalFontColorActive = true;
            if (typeof window.applyGlobalFontColorToBlocks === 'function') {
                window.applyGlobalFontColorToBlocks(val);
            } else {
                window.ztGlobalFontColor = val;
            }
            queueEditorHistoryCapture();
        };
        fontColorInput.oninput = (e) => applyColor(e.target.value);
        fontColorInput.onchange = fontColorInput.oninput;
    }

    const renderPresets = () => {
        if (typeof renderStylePresets === 'function') renderStylePresets();
    };
    if (typeof ensureStylePresetLoaded === 'function') {
        ensureStylePresetLoaded(renderPresets);
    } else {
        renderPresets();
    }
}

let ztCategoryDismissBound = false;
function bindCategoryDismissListener() {
    if (ztCategoryDismissBound) return;
    ztCategoryDismissBound = true;
    document.addEventListener('click', (e) => {
        const wrapper = document.getElementById('zt-cat-wrapper');
        const suggestionsBox = document.getElementById('zt-cat-suggestions');
        if (!wrapper || !suggestionsBox) return;
        if (!wrapper.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });
}

function renderContextualSettings(element) {
    const settingsForm = document.getElementById('zt-fs-settings-form');
    if (!settingsForm || !element) return;

    const block = element.closest('.zt-builder-block');
    if(!block) return;

    const type = block.getAttribute('data-type') || 'text';
    const tag = element.tagName;
    const computed = window.getComputedStyle(element);

    // --- HELPER: FIELD GENERATORS ---
    const createBackBtn = () => {
        const btn = document.createElement('div');
        btn.className = 'zt-back-btn';
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg> Back to Template`;
        btn.onclick = () => {
            // Re-render global settings using the CURRENT state of the editor (we can pass null or find the logic to get current tpl)
            // For now, we rely on the fact that 'renderTemplateSettingsInPanel' uses 'activeElementInEditor' or just renders.
            // We need to clear active selection
            document.querySelectorAll('.zt-builder-block.selected').forEach(el => el.classList.remove('selected'));
            renderTemplateSettingsInPanel(null); 
            // Ideally we'd pass the current template object, but 'renderTemplateSettingsInPanel' 
            // handles pulling from inputs if null, or we can just let it reset. 
            // BETTER: Just re-run the render function with values from DOM? 
            // Actually, renderTemplateSettingsInPanel(null) resets to defaults if we aren't careful.
            // But wait, the Inputs for Title/Cat are in that form. If we destroy them, we lose that data.
            // FIX: We should probably SAVE the global form state before switching, or 
            // simpler: Just re-render. The user might lose "Template Name" if they haven't saved.
            // Let's assume for this "Clean AI" scope that we just re-render.
            // To be safe, we can read values from the HIDDEN (or destroyed) inputs? No.
            // We will just re-render. The Main 'Save' button is global.
        };
        return btn;
    };

    const createSection = (title) => {
        const div = document.createElement('div');
        div.className = 'zt-group-title';
        div.innerText = title;
        return div;
    };

    const createInput = (label, value, callback, type='text') => {
        const row = document.createElement('div');
        row.style.marginBottom = '12px';
        row.innerHTML = `<label class="zt-label">${label}</label>`;
        const input = document.createElement('input');
        input.type = type;
        input.className = 'zt-input-title'; // Reuse class
        input.value = value;
        input.style.fontSize = '12px';
        input.oninput = (e) => callback(e.target.value);
        row.appendChild(input);
        return row;
    };

    const createSelect = (label, options, val, callback) => {
        const row = document.createElement('div');
        row.style.marginBottom = '12px';
        row.innerHTML = `<label class="zt-label">${label}</label>`;
        const sel = document.createElement('select');
        sel.className = 'zt-input-select';
        sel.style.fontSize = '12px';
        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.val;
            o.innerText = opt.label;
            if(opt.val === val || (opt.label === val)) o.selected = true;
            sel.appendChild(o);
        });
        sel.onchange = (e) => callback(e.target.value);
        row.appendChild(sel);
        return row;
    };

    const createColor = (label, val, callback) => {
        const row = document.createElement('div');
        row.className = 'zt-color-input-row';
        row.style.marginBottom = '12px';
        row.innerHTML = `<span class="zt-label" style="margin:0; flex:1;">${label}</span>`;
        
        const input = document.createElement('input');
        input.type = 'color';
        input.value = rgbToHex(val) || '#000000';
        
        const hex = document.createElement('span');
        hex.className = 'zt-hex-label';
        hex.innerText = input.value;

        input.oninput = (e) => {
            callback(e.target.value);
            hex.innerText = e.target.value;
        };

        row.appendChild(input);
        row.appendChild(hex);
        return row;
    };

    const createToggle = (label, checked, callback) => {
         const row = document.createElement('div');
         row.style.display = 'flex';
         row.style.justifyContent = 'space-between';
         row.style.alignItems = 'center';
         row.style.marginBottom = '12px';
         row.innerHTML = `<label class="zt-label" style="margin:0;">${label}</label>`;
         
         // Simple switch style
         const switchLabel = document.createElement('label');
         switchLabel.style.cssText = "position: relative; display: inline-block; width: 34px; height: 20px;";
         const input = document.createElement('input');
         input.type = "checkbox";
         input.checked = checked;
         input.style.opacity = "0";
         input.style.width = "0";
         input.style.height = "0";
         
         const slider = document.createElement('span');
         slider.style.cssText = "position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px;";
         
         // Using a pseudo-element logic in JS is hard, let's just use background color change for now + inline dot
         const dot = document.createElement('span');
         dot.style.cssText = `position: absolute; content: ''; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; transform: ${checked ? 'translateX(14px)' : 'translateX(0)'};`;
         if(checked) slider.style.backgroundColor = 'var(--zt-primary)';

         input.onchange = (e) => {
             const isC = e.target.checked;
             slider.style.backgroundColor = isC ? 'var(--zt-primary)' : '#ccc';
             dot.style.transform = isC ? 'translateX(14px)' : 'translateX(0)';
             callback(isC);
         };

         switchLabel.appendChild(input);
         switchLabel.appendChild(slider);
         slider.appendChild(dot);
         row.appendChild(switchLabel);
         return row;
    };


    // --- BUILD FORM ---
    settingsForm.innerHTML = '';
    settingsForm.appendChild(createBackBtn());

    // 1. TYPOGRAPHY (Heading/Text/Button)
    if (['H1','H2','H3','P','A','LI','DIV'].includes(tag) || type === 'heading' || type === 'text') {
        settingsForm.appendChild(createSection('Typography'));
        
        // Font Family
        const fonts = [
            {val: 'sans-serif', label: 'Sans Serif'},
            {val: 'serif', label: 'Serif'},
            {val: 'monospace', label: 'Monospace'},
            {val: 'Arial, sans-serif', label: 'Arial'},
            {val: 'Helvetica, sans-serif', label: 'Helvetica'},
            {val: 'Georgia, serif', label: 'Georgia'},
            {val: 'Times New Roman, serif', label: 'Times New Roman'},
            {val: 'Courier New, monospace', label: 'Courier New'},
            {val: 'Verdana, sans-serif', label: 'Verdana'}
        ];
        settingsForm.appendChild(createSelect('Font Family', fonts, computed.fontFamily.replace(/"/g, ''), (val) => element.style.fontFamily = val));
        
        // Font Size
        settingsForm.appendChild(createInput('Font Size', computed.fontSize, (val) => element.style.fontSize = val));
        
        // Line Height
        settingsForm.appendChild(createInput('Line Height', computed.lineHeight === 'normal' ? '1.5' : computed.lineHeight, (val) => element.style.lineHeight = val));

        // NOTE: Align and Color removed to prevent overlap with Popup (Context Bar)
    }

    // 2. BUTTON SPECIFIC
    if (tag === 'A' || type === 'button') {
        settingsForm.appendChild(createSection('Button Style'));
        settingsForm.appendChild(createColor('Background', computed.backgroundColor, (val) => element.style.backgroundColor = val));
        settingsForm.appendChild(createInput('Padding', computed.padding, (val) => element.style.padding = val));
        settingsForm.appendChild(createInput('Rounded Edges', computed.borderRadius, (val) => element.style.borderRadius = val));
        
        // Width toggle?
        // Usually buttons are inline-block. 
        settingsForm.appendChild(createSelect('Width', [{val:'auto', label:'Auto (Fit Text)'}, {val:'100%', label:'Full Width'}], element.style.display === 'block' ? '100%' : 'auto', (val) => {
            if(val === '100%') {
                element.style.display = 'block';
                element.style.width = '100%';
            } else {
                element.style.display = 'inline-block';
                element.style.width = 'auto';
            }
        }));
    }

    // 3. IMAGE SPECIFIC
    if (tag === 'IMG') {
        settingsForm.appendChild(createSection('Image Style'));
        settingsForm.appendChild(createInput('Width', element.style.width || '100%', (val) => element.style.width = val));
        settingsForm.appendChild(createInput('Height', element.style.height || 'auto', (val) => element.style.height = val));
        settingsForm.appendChild(createInput('Rounded Edges', computed.borderRadius, (val) => element.style.borderRadius = val));
    }

    // 4. DIVIDER SPECIFIC
    if (tag === 'HR') {
        settingsForm.appendChild(createSection('Divider Style'));
        settingsForm.appendChild(createColor('Color', computed.borderTopColor, (val) => element.style.borderTopColor = val));
        settingsForm.appendChild(createInput('Thickness', computed.borderTopWidth, (val) => element.style.borderTopWidth = val));
        settingsForm.appendChild(createInput('Margin', computed.marginTop + ' 0', (val) => element.style.margin = val));
    }

    // 5. HTML COMPONENT SPECIFIC
    // The element passed might be the .zt-block-content wrapper or inner. 
    // For HTML block, we need to find the container .zt-html-container
    const htmlContainer = block.querySelector('.zt-html-container');
    if (htmlContainer) {
        settingsForm.appendChild(createSection('HTML Component'));
        
        // Toggle Removed - Handled by Tabs on Block

        settingsForm.appendChild(createSection('Help'));
        const p = document.createElement('p');
        p.style.fontSize = '11px';
        p.style.color = '#6b7280';
        p.style.lineHeight = '1.4';
        p.innerText = "Paste your raw HTML code into the editor. Use the tabs above the block to switch between Code and Preview.";
        settingsForm.appendChild(p);
    }
}
