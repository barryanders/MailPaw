/* --- COMPONENT SETTINGS & LIVE PREVIEW --- */

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

const normalizeSpacingList = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return raw.split(/\s+/).map((token) => normalizeSpacingValue(token)).join(' ');
};

const normalizeColorValue = (value) => String(value || '').trim();

const getColorInputValue = (value) => {
    const normalized = normalizeColorValue(value);
    if (!normalized) return '#ffffff';
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) return normalized;
    if (typeof rgbToHex === 'function') return rgbToHex(normalized);
    return '#ffffff';
};

const buildBoxValue = (top, right, bottom, left) => {
    if (!(top || right || bottom || left)) return '';
    const t = top || '0';
    const r = right || top || '0';
    const b = bottom || top || '0';
    const l = left || right || top || '0';
    return `${t} ${r} ${b} ${l}`;
};

const buildBorderWidth = (top, right, bottom, left) => {
    if (!(top || right || bottom || left)) return '';
    return `${top || '0'} ${right || '0'} ${bottom || '0'} ${left || '0'}`;
};

function openComponentSettings(type) {
    const defaults = componentDefaults[type];
    const baseDefaults = (typeof window !== 'undefined' && window.COMPONENT_DEFAULTS_BASE)
        ? window.COMPONENT_DEFAULTS_BASE[type]
        : null;
    if (!defaults) return;

    // Update Header
    const labelBar = document.querySelector('.zt-fs-label');
    if(labelBar) labelBar.textContent = `Edit ${type}`;

    const modulesContainer = document.querySelector('.zt-fs-modules-content');
    let formContent = '';
    if (modulesContainer) modulesContainer.classList.add('zt-modules-settings');

    // -- UI HELPERS --
    const escapeAttr = (value) => String(value ?? '').replace(/"/g, '&quot;');
    const resetIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12a9 9 0 1 0 3-6.7"></path>
            <path d="M3 5v5h5"></path>
        </svg>
    `;
    const renderResetButton = (attrs, label = 'Reset to default') => `
        <button type="button" class="zt-reset-btn" ${attrs} title="${label}" aria-label="${label}">
            ${resetIcon}
        </button>
    `;
    const renderColor = (key, label, val, options = {}) => {
        const showText = options.showText !== false;
        const allowEmpty = options.allowEmpty === true;
        const resetValue = options.resetValue;
        const normalized = normalizeColorValue(val);
        const inputValue = getColorInputValue(normalized);
        const wrapBg = normalized || 'transparent';
        const placeholder = allowEmpty ? 'transparent' : '';
        return `
        <div style="margin-bottom:8px;">
            <label class="zt-label" style="margin-bottom:4px;">${label}</label>
            <div class="zt-field-row">
                <div class="zt-color-circle-wrap" style="background:${wrapBg};">
                    <input type="color" id="set-${key}" class="zt-color-circle" value="${inputValue}">
                </div>
                ${showText ? `<input type="text" id="text-${key}" value="${normalized}" class="zt-input-title" style="flex:1; font-family:monospace;" placeholder="${placeholder}">` : ''}
                ${renderResetButton(`data-reset-color="${key}" data-reset-value="${escapeAttr(resetValue ?? normalized)}"`)}
            </div>
        </div>
    `;
    };

    const renderInput = (key, label, val, inputType = "text", placeholder = "", resetValue = val) => `
        <div style="margin-bottom:8px;">
            <label class="zt-label" style="margin-bottom:4px;">${label}</label>
            <div class="zt-field-row">
                <input type="${inputType}" id="set-${key}" value="${val}" class="zt-input-title"${placeholder ? ` placeholder="${placeholder}"` : ''}>
                ${renderResetButton(`data-reset-target="set-${key}" data-reset-value="${escapeAttr(resetValue)}"`)}
            </div>
        </div>`;

    const renderSelect = (key, label, val, options, resetValue = val) => `
        <div style="margin-bottom:8px;">
            <label class="zt-label" style="margin-bottom:4px;">${label}</label>
            <div class="zt-field-row">
                <select id="set-${key}" class="zt-input-select">${options}</select>
                ${renderResetButton(`data-reset-target="set-${key}" data-reset-value="${escapeAttr(resetValue)}"`)}
            </div>
        </div>`;

    const renderCheckbox = (key, label, checked, resetValue = checked) => `
        <div style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
            <label class="zt-label" style="margin-bottom:0;">${label}</label>
            <div style="display:flex; align-items:center; gap:8px;">
                <input type="checkbox" id="set-${key}" ${checked ? 'checked' : ''} style="width:16px; height:16px;">
                ${renderResetButton(`data-reset-target="set-${key}" data-reset-value="${escapeAttr(resetValue)}"`)}
            </div>
        </div>`;

    const getBoxDefaults = (layout, prefix) => {
        const topKey = `${prefix}Top`;
        const rightKey = `${prefix}Right`;
        const bottomKey = `${prefix}Bottom`;
        const leftKey = `${prefix}Left`;
        let values = {
            top: layout[topKey] || '',
            right: layout[rightKey] || '',
            bottom: layout[bottomKey] || '',
            left: layout[leftKey] || ''
        };
        if (!(values.top || values.right || values.bottom || values.left)) {
            if (layout[prefix]) {
                values = parseSpacing(layout[prefix]);
            } else if (prefix === 'border' && layout.borderWidth) {
                values = parseSpacing(layout.borderWidth);
            } else if (prefix === 'margin' && layout.marginBottom) {
                values.bottom = layout.marginBottom;
            }
        }
        return values;
    };

    const renderBoxInputs = (keyPrefix, label, values, centerLabel, centerContent, resetValues = null, syncDefault = true) => {
        const centerHtml = centerContent || `<span>${centerLabel || label}</span>`;
        const syncState = syncDefault ? 'on' : 'off';
        const syncClass = syncDefault ? 'is-on' : '';
        const resetAttrs = resetValues ? `
            data-reset-group="${keyPrefix}"
            data-reset-top="${escapeAttr(resetValues.top || '')}"
            data-reset-right="${escapeAttr(resetValues.right || '')}"
            data-reset-bottom="${escapeAttr(resetValues.bottom || '')}"
            data-reset-left="${escapeAttr(resetValues.left || '')}"
            ${resetValues.color ? `data-reset-color="${escapeAttr(resetValues.color)}"` : ''}
            ${resetValues.colorTarget ? `data-reset-color-target="${escapeAttr(resetValues.colorTarget)}"` : ''}
        ` : '';
        const syncButton = `<button type="button" class="zt-box-sync ${syncClass}" data-sync-toggle="${keyPrefix}" data-sync-state="${syncState}" data-sync-default="${syncState}" aria-pressed="${syncDefault ? 'true' : 'false'}">Sync</button>`;
        const resetButton = resetValues ? renderResetButton(resetAttrs, 'Reset to default') : '';
        return `
        <div style="margin-bottom:4px;">
            <div class="zt-box-title-row">
                <span class="zt-label">${label}</span>
                <div class="zt-box-title-actions">
                    ${syncButton}
                    ${resetButton}
                </div>
            </div>
            <div class="zt-box-grid" data-sync-group="${keyPrefix}">
                <input type="text" id="set-${keyPrefix}Top" class="zt-box-input top" placeholder="Top" value="${values.top || ''}" data-sync-group="${keyPrefix}">
                <input type="text" id="set-${keyPrefix}Right" class="zt-box-input right" placeholder="Right" value="${values.right || ''}" data-sync-group="${keyPrefix}">
                <input type="text" id="set-${keyPrefix}Bottom" class="zt-box-input bottom" placeholder="Bottom" value="${values.bottom || ''}" data-sync-group="${keyPrefix}">
                <input type="text" id="set-${keyPrefix}Left" class="zt-box-input left" placeholder="Left" value="${values.left || ''}" data-sync-group="${keyPrefix}">
                <div class="zt-box-center">
                    ${centerHtml}
                </div>
            </div>
        </div>
    `;
    };

    // --- FORM BUILDER ---
    if (type === 'heading') {
        const base = baseDefaults || defaults;
        formContent += renderSelect('font', 'Font Family', defaults.font, FONT_OPTIONS, base.font);
        formContent += renderColor('color', 'Text Color', defaults.color, { resetValue: base.color });
        formContent += renderInput('size', 'Font Size', defaults.size, 'text', '', base.size);
    }
    else if (type === 'text') {
        const base = baseDefaults || defaults;
        formContent += `<div class="zt-group-title" style="margin: 0 0 10px 0;">Typography</div>`;
        formContent += renderSelect('font', 'Font Family', defaults.font, FONT_OPTIONS, base.font);
        formContent += renderColor('color', 'Text Color', defaults.color, { resetValue: base.color });
        formContent += renderInput('size', 'Font Size', defaults.size, 'text', '', base.size);
        formContent += renderInput('lineHeight', 'Line Height', defaults.lineHeight || '1.6', 'text', '', base.lineHeight || '1.6');

        formContent += `<div class="zt-group-title" style="margin: 20px 0 10px 0;">Link Defaults</div>`;
        formContent += renderColor('linkColor', 'Link Color', defaults.link.color, { resetValue: base.link?.color });
        formContent += renderCheckbox('linkUnderline', 'Underline Links', defaults.link.underline, base.link?.underline);

        formContent += `<div class="zt-group-title" style="margin: 20px 0 10px 0;">List Defaults</div>`;
        formContent += renderSelect('listStyle', 'Bullet Style', defaults.list.style, `<option value="disc">Disc (•)</option><option value="circle">Circle (○)</option><option value="square">Square (■)</option><option value="custom">Custom Character...</option>`, base.list?.style);

        const isCustom = defaults.list.style === 'custom';
        const display = isCustom ? 'block' : 'none';
        formContent += `
            <div id="zt-custom-list-wrap" style="display:${display}; margin-top:8px;">
                ${renderInput('listCustom', 'Custom Character', defaults.list.customMarker || '»', 'text', 'e.g. » or ★', base.list?.customMarker || '»')}
            </div>`;
    }
    else if (type === 'button') {
        const base = baseDefaults || defaults;
        const buttonPaddingDefaults = getBoxDefaults({ padding: defaults.padding || '' }, 'padding');
        const buttonPaddingReset = getBoxDefaults({ padding: base.padding || defaults.padding || '' }, 'padding');
        formContent += renderSelect('font', 'Font Family', defaults.font, FONT_OPTIONS, base.font);
        formContent += renderColor('bg', 'Background Color', defaults.bg, { resetValue: base.bg });
        formContent += renderColor('color', 'Text Color', defaults.color, { resetValue: base.color });
        formContent += renderInput('size', 'Font Size', defaults.size, 'text', '', base.size);
        formContent += renderBoxInputs('buttonPadding', 'Button Padding', buttonPaddingDefaults, 'Padding', null, buttonPaddingReset, false);
        formContent += renderInput('radius', 'Rounded Edges', defaults.radius, 'text', 'e.g. 12px', base.radius);
    }
    else if (type === 'divider') {
        const base = baseDefaults || defaults;
        formContent += renderColor('color', 'Line Color', defaults.color, { resetValue: base.color });
        formContent += renderInput('thickness', 'Line Thickness', defaults.thickness || '1px', 'text', '', base.thickness || '1px');
        formContent += renderInput('width', 'Width', defaults.width || '100%', 'text', '', base.width || '100%');
        formContent += renderInput('margin', 'Divider Margin', defaults.margin || '10px 0', 'text', '', base.margin || '10px 0');
    }
    else if (type === 'image') {
        const base = baseDefaults || defaults;
        formContent += renderInput('radius', 'Rounded Edges', defaults.radius, 'text', 'e.g. 12px', base.radius);
    }

    if (defaults.layout) {
        const baseLayout = (baseDefaults && baseDefaults.layout) ? baseDefaults.layout : defaults.layout;
        formContent += `<div class="zt-group-title" style="margin: 20px 0 10px 0;">Block Layout</div>`;
        const paddingDefaults = getBoxDefaults(defaults.layout, 'padding');
        const marginDefaults = getBoxDefaults(defaults.layout, 'margin');
        const borderDefaults = getBoxDefaults(defaults.layout, 'border');
        const borderColor = defaults.layout.borderColor || '#e2e8f0';
        const layoutBg = defaults.layout.background || '';
        const paddingReset = getBoxDefaults(baseLayout, 'padding');
        const marginReset = getBoxDefaults(baseLayout, 'margin');
        const borderReset = { ...getBoxDefaults(baseLayout, 'border'), color: baseLayout.borderColor || '#e2e8f0', colorTarget: 'set-layoutBorderColor' };
        formContent += renderColor('layoutBg', 'Block Background', layoutBg, { allowEmpty: true, resetValue: baseLayout.background || '' });
        formContent += renderBoxInputs('layoutPadding', 'Block Padding', paddingDefaults, 'Padding', null, paddingReset);
        formContent += renderBoxInputs('layoutMargin', 'Block Margin', marginDefaults, 'Margin', null, marginReset);
        formContent += renderBoxInputs('layoutBorder', 'Border', borderDefaults, 'Border', `
            <div class="zt-border-center">
                <span>Border</span>
                <div class="zt-color-circle-wrap" style="background:${borderColor};">
                    <input type="color" id="set-layoutBorderColor" class="zt-color-circle" value="${borderColor}">
                </div>
            </div>
        `, borderReset);
        formContent += renderInput('layoutRadius', 'Rounded Edges', defaults.layout.radius || '', 'text', 'e.g. 12px', baseLayout.radius || '');
    }

    // UPDATED BACK BUTTON MARKUP (Text content and SVG)
    modulesContainer.innerHTML = `
        <div class="zt-settings-back-wrap">
            <button id="zt-settings-back" class="zt-back-btn zt-settings-back">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                BACK TO LIBRARY
            </button>
        </div>
        <div class="zt-settings-form-wrapper" style="animation: slideUpFade 0.2s;">
            <div class="zt-settings-form-body">
                ${formContent}
            </div>
            <div class="zt-settings-save-wrap">
                <div class="zt-settings-actions">
                    <button id="zt-reset-defaults" class="zt-btn-cancel zt-settings-reset">Reset to Defaults</button>
                    <button id="zt-save-defaults" class="zt-btn-save zt-settings-save">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    // --- BIND EVENTS ---
    const setSyncState = (toggle, on) => {
        if (!toggle) return;
        toggle.dataset.syncState = on ? 'on' : 'off';
        toggle.classList.toggle('is-on', on);
        toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    const syncGroupInputs = (group, value, sourceInput) => {
        if (!group) return;
        const toggle = modulesContainer.querySelector(`.zt-box-sync[data-sync-toggle="${group}"]`);
        if (!toggle || toggle.dataset.syncState === 'off') return;
        modulesContainer.querySelectorAll(`input[data-sync-group="${group}"]`).forEach(input => {
            if (input !== sourceInput) input.value = value;
        });
    };
    const alignGroupInputs = (group) => {
        const inputs = Array.from(modulesContainer.querySelectorAll(`input[data-sync-group="${group}"]`));
        if (!inputs.length) return '';
        const baseInput = inputs.find(input => input.value.trim() !== '') || inputs[0];
        const value = baseInput ? baseInput.value : '';
        inputs.forEach(input => { if (input !== baseInput) input.value = value; });
        return value;
    };
    modulesContainer.querySelectorAll('.zt-box-sync').forEach(toggle => {
        const defaultOn = toggle.dataset.syncDefault !== 'off';
        setSyncState(toggle, defaultOn);
        toggle.addEventListener('click', () => {
            const isOn = toggle.dataset.syncState !== 'off';
            const nextState = !isOn;
            setSyncState(toggle, nextState);
            if (nextState) {
                const group = toggle.dataset.syncToggle;
                alignGroupInputs(group);
                const firstInput = modulesContainer.querySelector(`input[data-sync-group="${group}"]`);
                if (firstInput) updateLivePreview(type, firstInput.id.replace('set-', ''), firstInput.value);
            }
        });
    });

    modulesContainer.querySelectorAll('select').forEach(sel => {
        const key = sel.id.replace('set-', '');
        if(type === 'text' && key === 'listStyle') sel.value = defaults.list.style;
        else if(defaults[key]) sel.value = defaults[key];
        sel.onchange = (e) => {
            if (key === 'listStyle') {
                const wrap = document.getElementById('zt-custom-list-wrap');
                if(wrap) wrap.style.display = e.target.value === 'custom' ? 'block' : 'none';
            }
            updateLivePreview(type, key, e.target.value);
        };
    });

    modulesContainer.querySelectorAll('input[type="checkbox"]').forEach(input => {
        const key = input.id.replace('set-', '');
        input.onchange = (e) => updateLivePreview(type, key, e.target.checked);
    });

    ['bg', 'color', 'linkColor', 'layoutBorderColor'].forEach(id => {
        const el = document.getElementById('set-' + id);
        if(el) {
            el.oninput = (e) => {
                const textInput = document.getElementById('text-' + id);
                if (textInput) textInput.value = e.target.value;
                el.parentElement.style.backgroundColor = e.target.value;
                updateLivePreview(type, id, e.target.value);
            };
        }
    });

    const layoutBgInput = document.getElementById('set-layoutBg');
    const layoutBgText = document.getElementById('text-layoutBg');
    const syncLayoutBackground = (value) => {
        const normalized = normalizeColorValue(value);
        if (layoutBgText) layoutBgText.value = normalized;
        if (layoutBgInput) layoutBgInput.value = getColorInputValue(normalized);
        const wrap = layoutBgInput ? layoutBgInput.closest('.zt-color-circle-wrap') : null;
        if (wrap) wrap.style.backgroundColor = normalized || 'transparent';
        updateLivePreview(type, 'layoutBg', normalized);
    };
    if (layoutBgInput) layoutBgInput.oninput = (e) => syncLayoutBackground(e.target.value);
    if (layoutBgText) layoutBgText.oninput = (e) => syncLayoutBackground(e.target.value);

    modulesContainer.querySelectorAll('.zt-reset-btn[data-reset-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.resetTarget;
            const target = targetId ? document.getElementById(targetId) : null;
            if (!target) return;
            const value = btn.dataset.resetValue ?? '';
            if (target.type === 'checkbox') {
                target.checked = value === 'true';
                target.dispatchEvent(new Event('change', { bubbles: true }));
                return;
            }
            target.value = value;
            const eventName = target.tagName === 'SELECT' ? 'change' : 'input';
            target.dispatchEvent(new Event(eventName, { bubbles: true }));
        });
    });

    modulesContainer.querySelectorAll('.zt-reset-btn[data-reset-color]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.resetColor;
            const value = btn.dataset.resetValue ?? '';
            if (key === 'layoutBg') {
                syncLayoutBackground(value);
                return;
            }
            const normalized = normalizeColorValue(value);
            const textInput = document.getElementById('text-' + key);
            const colorInput = document.getElementById('set-' + key);
            if (textInput) textInput.value = normalized;
            if (colorInput) {
                colorInput.value = getColorInputValue(normalized);
                const wrap = colorInput.closest('.zt-color-circle-wrap');
                if (wrap) wrap.style.backgroundColor = normalized || 'transparent';
            }
            updateLivePreview(type, key, normalized);
        });
    });

    modulesContainer.querySelectorAll('.zt-reset-btn[data-reset-group]').forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.dataset.resetGroup;
            if (!group) return;
            const inputs = modulesContainer.querySelectorAll(`input[data-sync-group="${group}"]`);
            inputs.forEach(input => {
                let value = '';
                if (input.classList.contains('top')) value = btn.dataset.resetTop || '';
                else if (input.classList.contains('right')) value = btn.dataset.resetRight || '';
                else if (input.classList.contains('bottom')) value = btn.dataset.resetBottom || '';
                else if (input.classList.contains('left')) value = btn.dataset.resetLeft || '';
                input.value = value;
            });
            const colorTarget = btn.dataset.resetColorTarget;
            if (colorTarget) {
                const colorInput = document.getElementById(colorTarget);
                if (colorInput) {
                    const colorValue = btn.dataset.resetColor || '';
                    const normalized = normalizeColorValue(colorValue);
                    colorInput.value = getColorInputValue(normalized);
                    const wrap = colorInput.closest('.zt-color-circle-wrap');
                    if (wrap) wrap.style.backgroundColor = normalized || 'transparent';
                }
            }
            const sampleInput = document.getElementById(`set-${group}Top`);
            const sampleValue = sampleInput ? sampleInput.value : '';
            updateLivePreview(type, `${group}Top`, sampleValue);
        });
    });

    ['size', 'radius', 'listCustom', 'lineHeight', 'buttonPaddingTop', 'buttonPaddingRight', 'buttonPaddingBottom', 'buttonPaddingLeft', 'thickness', 'width', 'margin',
     'layoutPaddingTop', 'layoutPaddingRight', 'layoutPaddingBottom', 'layoutPaddingLeft',
     'layoutMarginTop', 'layoutMarginRight', 'layoutMarginBottom', 'layoutMarginLeft',
     'layoutBorderTop', 'layoutBorderRight', 'layoutBorderBottom', 'layoutBorderLeft',
     'layoutRadius'].forEach(id => {
        const el = document.getElementById('set-' + id);
        if(el) {
            el.oninput = (e) => {
                const group = e.target.dataset.syncGroup;
                if (group) syncGroupInputs(group, e.target.value, e.target);
                updateLivePreview(type, id, e.target.value);
            };
        }
    });

    document.getElementById('zt-settings-back').onclick = () => renderComponentsList();
    const resetBtn = document.getElementById('zt-reset-defaults');
    if (resetBtn) {
        resetBtn.onclick = () => {
            const baseDefaults = (typeof window !== 'undefined' && window.COMPONENT_DEFAULTS_BASE) ? window.COMPONENT_DEFAULTS_BASE[type] : null;
            if (!baseDefaults) return;
            const applyReset = () => {
                componentDefaults[type] = JSON.parse(JSON.stringify(baseDefaults));
                if (typeof persistComponentDefaults === 'function') persistComponentDefaults();
                openComponentSettings(type);
                return true;
            };
            if (typeof showModal === 'function') {
                showModal('Reset Defaults', `
                    <p style="font-size:13px; color:#475569; line-height:1.5;">
                        Reset ${type} defaults back to the factory settings? This cannot be undone.
                    </p>
                `, applyReset);
                const modal = document.querySelector('.zt-modal-overlay');
                if (modal) {
                    const submit = modal.querySelector('#modal-submit');
                    if (submit) submit.textContent = 'Reset';
                }
            } else {
                const confirmReset = window.confirm(`Reset ${type} defaults back to factory settings?`);
                if (!confirmReset) return;
                applyReset();
            }
        };
    }
    document.getElementById('zt-save-defaults').onclick = () => {
        if (type === 'heading') {
            componentDefaults[type].font = document.getElementById('set-font').value;
            componentDefaults[type].color = document.getElementById('set-color').value;
            componentDefaults[type].size = normalizeSpacingValue(document.getElementById('set-size').value);
        } else if (type === 'text') {
            componentDefaults[type].font = document.getElementById('set-font').value;
            componentDefaults[type].color = document.getElementById('set-color').value;
            componentDefaults[type].size = normalizeSpacingValue(document.getElementById('set-size').value);
            componentDefaults[type].lineHeight = document.getElementById('set-lineHeight').value;
            componentDefaults[type].link.color = document.getElementById('set-linkColor').value;
            componentDefaults[type].link.underline = document.getElementById('set-linkUnderline').checked;
            componentDefaults[type].list.style = document.getElementById('set-listStyle').value;
            const customInput = document.getElementById('set-listCustom');
            if(customInput) componentDefaults[type].list.customMarker = customInput.value;
        } else if (type === 'button') {
            componentDefaults[type].font = document.getElementById('set-font').value;
            componentDefaults[type].bg = document.getElementById('set-bg').value;
            componentDefaults[type].color = document.getElementById('set-color').value;
            componentDefaults[type].size = normalizeSpacingValue(document.getElementById('set-size').value);
            const paddingTop = normalizeSpacingValue(document.getElementById('set-buttonPaddingTop').value);
            const paddingRight = normalizeSpacingValue(document.getElementById('set-buttonPaddingRight').value);
            const paddingBottom = normalizeSpacingValue(document.getElementById('set-buttonPaddingBottom').value);
            const paddingLeft = normalizeSpacingValue(document.getElementById('set-buttonPaddingLeft').value);
            const buttonPadding = buildBoxValue(paddingTop, paddingRight, paddingBottom, paddingLeft);
            componentDefaults[type].padding = buttonPadding || componentDefaults[type].padding || '12px 24px';
            componentDefaults[type].radius = normalizeSpacingValue(document.getElementById('set-radius').value);
        } else if (type === 'divider') {
            componentDefaults[type].color = document.getElementById('set-color').value;
            componentDefaults[type].thickness = normalizeSpacingValue(document.getElementById('set-thickness').value);
            componentDefaults[type].width = normalizeSpacingValue(document.getElementById('set-width').value);
            componentDefaults[type].margin = normalizeSpacingList(document.getElementById('set-margin').value);
        } else if (type === 'image') {
            componentDefaults[type].radius = normalizeSpacingValue(document.getElementById('set-radius').value);
        }
        if (defaults.layout) {
            componentDefaults[type].layout.background = normalizeColorValue(document.getElementById('text-layoutBg')?.value || '');
            componentDefaults[type].layout.paddingTop = normalizeSpacingValue(document.getElementById('set-layoutPaddingTop').value);
            componentDefaults[type].layout.paddingRight = normalizeSpacingValue(document.getElementById('set-layoutPaddingRight').value);
            componentDefaults[type].layout.paddingBottom = normalizeSpacingValue(document.getElementById('set-layoutPaddingBottom').value);
            componentDefaults[type].layout.paddingLeft = normalizeSpacingValue(document.getElementById('set-layoutPaddingLeft').value);
            componentDefaults[type].layout.marginTop = normalizeSpacingValue(document.getElementById('set-layoutMarginTop').value);
            componentDefaults[type].layout.marginRight = normalizeSpacingValue(document.getElementById('set-layoutMarginRight').value);
            componentDefaults[type].layout.marginBottom = normalizeSpacingValue(document.getElementById('set-layoutMarginBottom').value);
            componentDefaults[type].layout.marginLeft = normalizeSpacingValue(document.getElementById('set-layoutMarginLeft').value);
            const borderTop = normalizeSpacingValue(document.getElementById('set-layoutBorderTop').value);
            const borderRight = normalizeSpacingValue(document.getElementById('set-layoutBorderRight').value);
            const borderBottom = normalizeSpacingValue(document.getElementById('set-layoutBorderBottom').value);
            const borderLeft = normalizeSpacingValue(document.getElementById('set-layoutBorderLeft').value);
            componentDefaults[type].layout.borderTop = borderTop;
            componentDefaults[type].layout.borderRight = borderRight;
            componentDefaults[type].layout.borderBottom = borderBottom;
            componentDefaults[type].layout.borderLeft = borderLeft;
            componentDefaults[type].layout.borderWidth = buildBorderWidth(borderTop, borderRight, borderBottom, borderLeft);
            componentDefaults[type].layout.borderColor = document.getElementById('set-layoutBorderColor').value;
            componentDefaults[type].layout.radius = normalizeSpacingValue(document.getElementById('set-layoutRadius').value);
        }
        if (type === 'image') {
            document.querySelectorAll('.zt-builder-block[data-type="image"]').forEach(block => {
                const img = block.querySelector('img');
                if (img) img.style.borderRadius = componentDefaults.image.radius || '';
                if (componentDefaults.image.layout) applyLayoutStyles(block, componentDefaults.image.layout);
            });
        }
        if (type === 'divider') {
            document.querySelectorAll('.zt-builder-block[data-type="divider"]').forEach(block => {
                const hr = block.querySelector('hr');
                if (hr) {
                    hr.style.borderTopColor = componentDefaults.divider.color;
                    hr.style.borderTopWidth = componentDefaults.divider.thickness || '1px';
                    hr.style.width = componentDefaults.divider.width || '100%';
                    hr.style.margin = componentDefaults.divider.margin || '10px 0';
                }
                if (componentDefaults.divider.layout) applyLayoutStyles(block, componentDefaults.divider.layout);
            });
        }
        if (defaults.layout) {
            document.querySelectorAll(`.zt-builder-block[data-type="${type}"]`).forEach(block => {
                applyLayoutStyles(block, componentDefaults[type].layout);
            });
        }
        if (typeof persistComponentDefaults === 'function') {
            persistComponentDefaults();
        }
        renderComponentsList();
    };
}

function updateLivePreview(type, prop, val) {
    const blocks = document.querySelectorAll(`.zt-builder-block[data-type="${type}"]`);
    const isLayoutProp = prop.startsWith('layout');
    const isButtonPaddingProp = prop.startsWith('buttonPadding');
    const layoutBorderTop = normalizeSpacingValue(document.getElementById('set-layoutBorderTop')?.value || '');
    const layoutBorderRight = normalizeSpacingValue(document.getElementById('set-layoutBorderRight')?.value || '');
    const layoutBorderBottom = normalizeSpacingValue(document.getElementById('set-layoutBorderBottom')?.value || '');
    const layoutBorderLeft = normalizeSpacingValue(document.getElementById('set-layoutBorderLeft')?.value || '');
    const layoutBorderWidth = buildBorderWidth(layoutBorderTop, layoutBorderRight, layoutBorderBottom, layoutBorderLeft);
    const layout = isLayoutProp ? {
        background: normalizeColorValue(document.getElementById('text-layoutBg')?.value || ''),
        paddingTop: normalizeSpacingValue(document.getElementById('set-layoutPaddingTop')?.value || ''),
        paddingRight: normalizeSpacingValue(document.getElementById('set-layoutPaddingRight')?.value || ''),
        paddingBottom: normalizeSpacingValue(document.getElementById('set-layoutPaddingBottom')?.value || ''),
        paddingLeft: normalizeSpacingValue(document.getElementById('set-layoutPaddingLeft')?.value || ''),
        marginTop: normalizeSpacingValue(document.getElementById('set-layoutMarginTop')?.value || ''),
        marginRight: normalizeSpacingValue(document.getElementById('set-layoutMarginRight')?.value || ''),
        marginBottom: normalizeSpacingValue(document.getElementById('set-layoutMarginBottom')?.value || ''),
        marginLeft: normalizeSpacingValue(document.getElementById('set-layoutMarginLeft')?.value || ''),
        borderTop: layoutBorderTop,
        borderRight: layoutBorderRight,
        borderBottom: layoutBorderBottom,
        borderLeft: layoutBorderLeft,
        borderWidth: layoutBorderWidth,
        borderColor: document.getElementById('set-layoutBorderColor')?.value || '#e2e8f0',
        radius: normalizeSpacingValue(document.getElementById('set-layoutRadius')?.value || '')
    } : null;
    const buttonPadding = isButtonPaddingProp ? buildBoxValue(
        normalizeSpacingValue(document.getElementById('set-buttonPaddingTop')?.value || ''),
        normalizeSpacingValue(document.getElementById('set-buttonPaddingRight')?.value || ''),
        normalizeSpacingValue(document.getElementById('set-buttonPaddingBottom')?.value || ''),
        normalizeSpacingValue(document.getElementById('set-buttonPaddingLeft')?.value || '')
    ) : '';
    blocks.forEach(block => {
        if (isLayoutProp) {
            applyLayoutStyles(block, layout);
            return;
        }
        const content = block.querySelector('.zt-block-content');
        if (!content) return;

        if (type === 'heading') {
            const h2 = content.querySelector('h2');
            if(h2) {
                if(prop === 'font') h2.style.fontFamily = val;
                if(prop === 'color') h2.style.color = val;
                if(prop === 'size') h2.style.fontSize = normalizeSpacingValue(val);
            }
        }
        else if (type === 'text') {
            const p = content.querySelector('p');
            const scopedStyle = block.querySelector('style');
            if(scopedStyle) {
                if(prop === 'linkColor') scopedStyle.innerHTML = scopedStyle.innerHTML.replace(/a \{ color: .*? !important/, `a { color: ${val} !important`);
                if(prop === 'listStyle' && val !== 'custom') scopedStyle.innerHTML = scopedStyle.innerHTML.replace(/list-style-type: .*? !important/, `list-style-type: ${val} !important`);
                if(prop === 'listCustom') scopedStyle.innerHTML = scopedStyle.innerHTML.replace(/list-style-type: .*? !important/, `list-style-type: '${val}' !important`);
                if(prop === 'linkUnderline') {
                    const decor = val ? 'underline' : 'none';
                    scopedStyle.innerHTML = scopedStyle.innerHTML.replace(/text-decoration: .*? !important/, `text-decoration: ${decor} !important`);
                }
            }
            if(p) {
                if(prop === 'font') p.style.fontFamily = val;
                if(prop === 'color') p.style.color = val;
                if(prop === 'size') p.style.fontSize = normalizeSpacingValue(val);
                if(prop === 'lineHeight') p.style.lineHeight = val;
            }
        }
        else if (type === 'button') {
            const btn = content.querySelector('a');
            if(btn) {
                if(prop === 'bg') btn.style.backgroundColor = val;
                if(prop === 'color') btn.style.color = val;
                if(prop === 'size') btn.style.fontSize = normalizeSpacingValue(val);
                if(isButtonPaddingProp) btn.style.padding = buttonPadding || componentDefaults[type].padding || '12px 24px';
                if(prop === 'radius') btn.style.borderRadius = normalizeSpacingValue(val);
                if(prop === 'font') btn.style.fontFamily = val;
            }
        }
        else if (type === 'divider') {
            const hr = content.querySelector('hr');
            if (hr) {
                if (prop === 'color') hr.style.borderTopColor = val;
                if (prop === 'thickness') hr.style.borderTopWidth = normalizeSpacingValue(val);
                if (prop === 'width') hr.style.width = normalizeSpacingValue(val);
                if (prop === 'margin') hr.style.margin = normalizeSpacingList(val);
            }
        }
        else if (type === 'image') {
            const img = content.querySelector('img');
            if (img && prop === 'radius') img.style.borderRadius = normalizeSpacingValue(val);
        }
    });
}

function applyLayoutStyles(block, layout) {
    if (!block || !layout) return;
    block.style.backgroundColor = normalizeColorValue(layout.background) || '';
    const padTop = normalizeSpacingValue(layout.paddingTop || '');
    const padRight = normalizeSpacingValue(layout.paddingRight || '');
    const padBottom = normalizeSpacingValue(layout.paddingBottom || '');
    const padLeft = normalizeSpacingValue(layout.paddingLeft || '');
    const padValues = [padTop, padRight, padBottom, padLeft];
    const hasPad = padValues.some(val => val);
    if (hasPad) {
        block.style.padding = '';
        block.style.paddingTop = padTop || '';
        block.style.paddingRight = padRight || '';
        block.style.paddingBottom = padBottom || '';
        block.style.paddingLeft = padLeft || '';
    } else if (layout.padding) {
        block.style.padding = normalizeSpacingList(layout.padding);
    } else {
        block.style.paddingTop = '';
        block.style.paddingRight = '';
        block.style.paddingBottom = '';
        block.style.paddingLeft = '';
        block.style.padding = '';
    }

    const marginTop = normalizeSpacingValue(layout.marginTop || '');
    const marginRight = normalizeSpacingValue(layout.marginRight || '');
    const marginBottom = normalizeSpacingValue(layout.marginBottom || '');
    const marginLeft = normalizeSpacingValue(layout.marginLeft || '');
    const marginValues = [marginTop, marginRight, marginBottom, marginLeft];
    const hasMargin = marginValues.some(val => val);
    if (hasMargin) {
        block.style.margin = '';
        block.style.marginTop = marginTop || '';
        block.style.marginRight = marginRight || '';
        block.style.marginBottom = marginBottom || '';
        block.style.marginLeft = marginLeft || '';
    } else if (layout.marginBottom) {
        block.style.marginBottom = normalizeSpacingValue(layout.marginBottom);
    } else {
        block.style.marginTop = '';
        block.style.marginRight = '';
        block.style.marginBottom = '';
        block.style.marginLeft = '';
        block.style.margin = '';
    }
    block.style.borderRadius = normalizeSpacingValue(layout.radius || '');
    const borderTop = normalizeSpacingValue(layout.borderTop || '');
    const borderRight = normalizeSpacingValue(layout.borderRight || '');
    const borderBottom = normalizeSpacingValue(layout.borderBottom || '');
    const borderLeft = normalizeSpacingValue(layout.borderLeft || '');
    const borderValues = [borderTop, borderRight, borderBottom, borderLeft];
    const hasBorder = borderValues.some(val => val);
    block.style.border = '';
    block.style.borderWidth = '';
    if (hasBorder) {
        block.style.borderTopWidth = borderTop || '';
        block.style.borderRightWidth = borderRight || '';
        block.style.borderBottomWidth = borderBottom || '';
        block.style.borderLeftWidth = borderLeft || '';
        block.style.borderStyle = 'solid';
        block.style.borderColor = layout.borderColor || '#e2e8f0';
    } else if (layout.borderWidth) {
        block.style.borderWidth = normalizeSpacingValue(layout.borderWidth);
        block.style.borderStyle = 'solid';
        block.style.borderColor = layout.borderColor || '#e2e8f0';
        block.style.borderTopWidth = '';
        block.style.borderRightWidth = '';
        block.style.borderBottomWidth = '';
        block.style.borderLeftWidth = '';
    } else {
        block.style.borderWidth = '';
        block.style.borderStyle = '';
        block.style.borderColor = '';
        block.style.borderTopWidth = '';
        block.style.borderRightWidth = '';
        block.style.borderBottomWidth = '';
        block.style.borderLeftWidth = '';
    }
}
