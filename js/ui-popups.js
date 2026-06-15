/* --- CONTEXTUAL FLOATING BAR --- */

let savedRange = null;
const markEditorDirty = () => {
    window.ztEditorIsDirty = true;
    if (typeof queueEditorHistoryCapture === 'function') queueEditorHistoryCapture();
};

const getSocialOptions = () => {
    if (typeof getSocialNetworkOptions === 'function') return getSocialNetworkOptions();
    return ['LinkedIn', 'X', 'Instagram', 'TikTok', 'YouTube'];
};

const getSocialAlignment = (block) => {
    if (!block) return 'center';
    const content = block.querySelector('.zt-block-content');
    const table = block.querySelector('table');
    return (content && content.style.textAlign) || (table && table.getAttribute('align')) || 'center';
};

const getSocialHrefMap = (block) => {
    const map = {};
    if (!block) return map;
    block.querySelectorAll('a[data-network]').forEach(anchor => {
        const key = anchor.dataset.network;
        if (key) map[key] = anchor.getAttribute('href') || '';
    });
    if (Object.keys(map).length) return map;
    const options = getSocialOptions();
    block.querySelectorAll('a').forEach(anchor => {
        const text = (anchor.textContent || '').trim().toLowerCase();
        const match = options.find(name => text.includes(name.toLowerCase()));
        if (match && !map[match]) map[match] = anchor.getAttribute('href') || '';
    });
    return map;
};

const getSocialNetworksFromBlock = (block) => {
    if (!block) return [];
    const attr = block.getAttribute('data-social-networks');
    if (attr) {
        return attr.split(',').map(name => name.trim()).filter(Boolean);
    }
    const dataLinks = Array.from(block.querySelectorAll('a[data-network]'))
        .map(anchor => anchor.dataset.network)
        .filter(Boolean);
    if (dataLinks.length) return Array.from(new Set(dataLinks));
    const options = getSocialOptions();
    const fromText = [];
    block.querySelectorAll('a').forEach(anchor => {
        const text = (anchor.textContent || '').trim().toLowerCase();
        const match = options.find(name => text.includes(name.toLowerCase()));
        if (match && !fromText.includes(match)) fromText.push(match);
    });
    return fromText;
};

const openSocialLinksModal = (block) => {
    if (!block) return;
    const options = getSocialOptions();
    const current = getSocialNetworksFromBlock(block);
    const checkboxes = options.map(name => `
        <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:13px; color:#334155;">
            <input type="checkbox" name="zt-social-edit" value="${name}" ${current.includes(name) ? 'checked' : ''}>
            ${name}
        </label>
    `).join('');
    showModal('Social Links', checkboxes, () => {
        const selected = Array.from(document.querySelectorAll('input[name="zt-social-edit"]:checked'))
            .map(el => el.value);
        if (!selected.length) { alert('Select at least one network.'); return false; }
        const content = block.querySelector('.zt-block-content');
        const align = getSocialAlignment(block);
        const hrefMap = getSocialHrefMap(block);
        if (content && typeof buildSocialLinksHTML === 'function') {
            content.innerHTML = buildSocialLinksHTML(selected, { align, hrefMap });
            content.style.textAlign = align;
        }
        block.setAttribute('data-social-networks', selected.join(','));
        markEditorDirty();
        return true;
    });
};

// AUTO-SAVE SELECTION
// We listen globally but only update if the selection is inside our editor content.
document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    // Verify we are inside a builder block content area
    const container = range.commonAncestorContainer;
    const element = container.nodeType === 1 ? container : container.parentElement;

    if (element && element.closest('.zt-block-content')) {
        if (element.closest('.zt-html-container')) return;
        savedRange = range.cloneRange();
        showInlinePopup(element);
    }
});

function restoreSelection() {
    const sel = window.getSelection();
    sel.removeAllRanges();
    if (savedRange) sel.addRange(savedRange);
}

function getLinkFromRange(range) {
    if (!range) return null;
    const container = range.commonAncestorContainer;
    const element = container.nodeType === 1 ? container : container.parentElement;
    return element ? element.closest('a') : null;
}

function positionContextBar(toolbar, block) {
    const header = document.querySelector('.zt-fs-header');
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    const blockRect = block.getBoundingClientRect();
    const barHeight = toolbar.offsetHeight || 0;
    const needsBelow = blockRect.top - barHeight - 12 < headerBottom;
    toolbar.classList.toggle('below', needsBelow);
}

function clearInlineToolbar() {
    const toolbarHost = document.getElementById('zt-inline-tools');
    if (toolbarHost) {
        toolbarHost.innerHTML = '<span class="zt-toolbar-empty">Select a block to edit</span>';
    }
    document.querySelectorAll('.zt-context-bar').forEach(el => el.remove());
}

function showInlinePopup(targetElement) {
    // If the bar for this EXACT block already exists, do not destroy/recreate it.
    // This prevents the "flashing" or reloading issue.
    const block = targetElement.closest('.zt-builder-block');
    if (!block) return;
    if (targetElement.closest('.zt-html-container')) return;

    const toolbarHost = document.getElementById('zt-inline-tools');
    const useHeaderToolbar = !!toolbarHost;
    if (useHeaderToolbar) {
        document.querySelectorAll('.zt-context-bar').forEach(el => el.remove());
    }

    const selectionInBlock = (() => {
        if (!savedRange) return false;
        const container = savedRange.commonAncestorContainer;
        const element = container.nodeType === 1 ? container : container.parentElement;
        return element ? block.contains(element) : false;
    })();
    const selectionHasText = selectionInBlock && savedRange && !savedRange.collapsed;
    const selectionLink = selectionInBlock ? getLinkFromRange(savedRange) : null;
    const targetLink = targetElement.closest('a');
    const activeLink = targetLink || (selectionHasText ? selectionLink : null);

    let toolbar = null;
    if (useHeaderToolbar) {
        toolbar = toolbarHost;
    } else {
        // If we are switching blocks, remove OTHER bars.
        document.querySelectorAll('.zt-context-bar').forEach(el => el.remove());

        toolbar = document.createElement('div');
        toolbar.className = 'zt-context-bar';
        toolbar.contentEditable = "false";
        toolbar.onclick = (e) => e.stopPropagation();
    }

    // if (targetElement.isContentEditable) saveSelection(); // Handled by global listener

    let content = '';

    // 1. TEXT EDITING
    const blockType = block.getAttribute('data-type') || '';
    const isSocial = blockType === 'social';
    const isButton = blockType === 'button' && targetElement.tagName === 'A';
    const isText = ['H1','H2','H3','P','LI','DIV','TD','SPAN','B','I','U','BLOCKQUOTE','A'].includes(targetElement.tagName)
        && !isButton
        && !targetElement.classList.contains('zt-html-sandbox');
    const isImage = targetElement.tagName === 'IMG';
    if (isText) {
        const fontOptions = typeof FONT_OPTIONS !== 'undefined' ? FONT_OPTIONS : '<option value="inherit">Inherit / System</option>';
        const showFontControls = ['heading', 'text', 'social'].includes(blockType);
        const listControls = isSocial ? '' : `
                <button class="zt-bar-btn" data-cmd="insertUnorderedList" title="Bullet List"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="5" cy="6" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="5" cy="18" r="2"/></svg></button>
                <button class="zt-bar-btn" data-cmd="insertOrderedList" title="Numbered List"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg></button>
                <button class="zt-bar-btn" data-cmd="formatBlock" data-val="blockquote" title="Quote"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg></button>
        `;
        const socialControls = isSocial ? `
                <button class="zt-bar-btn" id="bar-social-edit" title="Edit Social Links"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg></button>
        ` : '';
        const fontSampleEl = (() => {
            if (blockType === 'heading') return block.querySelector('h1,h2,h3,h4,h5,h6') || targetElement;
            if (blockType === 'text') return block.querySelector('p') || targetElement;
            if (blockType === 'social') return block.querySelector('a, span') || targetElement;
            return targetElement;
        })();
        const fontComputed = fontSampleEl ? window.getComputedStyle(fontSampleEl) : null;
        const currentSize = fontSampleEl ? (fontSampleEl.style.fontSize || (fontComputed ? fontComputed.fontSize : '') || '') : '';
        const fontControls = showFontControls ? `
                <span class="zt-bar-label">FONT</span>
                <select id="bar-font-family" class="zt-bar-input zt-bar-select" style="min-width:140px;">${fontOptions}</select>
                <span class="zt-bar-label" style="margin-left:6px;">SIZE</span>
                <input type="text" id="bar-font-size" class="zt-bar-input" value="${currentSize}" style="width:60px;">
        ` : '';
        const fontControlsWrapped = showFontControls ? `
                ${fontControls}
                <div class="zt-bar-sep"></div>
        ` : '';
        const listControlsWrapped = listControls ? `
                <div class="zt-bar-sep"></div>
                ${listControls}
        ` : '';
        content = `
            <div class="zt-bar-row">
                ${fontControlsWrapped}
                <button class="zt-bar-btn" data-cmd="bold" title="Bold"><b>B</b></button>
                <button class="zt-bar-btn" data-cmd="italic" title="Italic"><i>I</i></button>
                <button class="zt-bar-btn" data-cmd="underline" title="Underline"><u>U</u></button>
                
                <div class="zt-bar-sep"></div>
                <button class="zt-bar-btn" id="bar-btn-link" title="Link"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></button>
                ${socialControls}
                ${listControlsWrapped}
                <div class="zt-bar-sep"></div>

                <button class="zt-bar-btn" id="bar-align-left"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg></button>
                <button class="zt-bar-btn" id="bar-align-center"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg></button>
                <button class="zt-bar-btn" id="bar-align-right"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg></button>
                <div class="zt-bar-sep"></div>
                <div class="zt-color-circle-wrap" title="Text Color" style="background:${rgbToHex(getComputedStyle(targetElement).color)}">
                    <span style="color:#fff; font-weight:bold; font-size:10px; text-shadow:0 0 2px #000;">A</span>
                    <input type="color" id="bar-text-color" class="zt-color-circle">
                </div>
            </div>
        `;
    }

    // 2. BUTTONS
    else if (isButton) {
        const fontOptions = typeof FONT_OPTIONS !== 'undefined' ? FONT_OPTIONS : '<option value="inherit">Inherit / System</option>';
        const btnComputed = targetElement ? window.getComputedStyle(targetElement) : null;
        const btnSize = targetElement ? (targetElement.style.fontSize || (btnComputed ? btnComputed.fontSize : '') || '') : '';
        content = `
            <div class="zt-bar-row">
                <input type="text" id="bar-btn-text" class="zt-bar-input" value="${targetElement.innerText}" style="width:90px; font-weight:600;">
                <input type="text" id="bar-btn-url" class="zt-bar-input" value="${targetElement.getAttribute('href') || ''}" style="width:160px;" placeholder="https://...">
                <div class="zt-bar-sep"></div>
                <span class="zt-bar-label">FONT</span>
                <select id="bar-font-family" class="zt-bar-input zt-bar-select" style="min-width:140px;">${fontOptions}</select>
                <span class="zt-bar-label" style="margin-left:6px;">SIZE</span>
                <input type="text" id="bar-font-size" class="zt-bar-input" value="${btnSize}" style="width:60px;">
                <div class="zt-bar-sep"></div>
                <button class="zt-bar-btn" data-btn-style="bold" title="Bold"><b>B</b></button>
                <button class="zt-bar-btn" data-btn-style="italic" title="Italic"><i>I</i></button>
                <button class="zt-bar-btn" data-btn-style="underline" title="Underline"><u>U</u></button>
                <div class="zt-bar-sep"></div>
                <button class="zt-bar-btn" id="bar-align-left"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg></button>
                <button class="zt-bar-btn" id="bar-align-center"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg></button>
                <button class="zt-bar-btn" id="bar-align-right"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg></button>
                <div class="zt-bar-sep"></div>
                <div class="zt-color-circle-wrap" id="wrap-btn-bg" title="Button Color" style="background:${rgbToHex(targetElement.style.backgroundColor)}">
                    <input type="color" id="bar-btn-bg" class="zt-color-circle" value="${rgbToHex(targetElement.style.backgroundColor)}">
                </div>
                <div class="zt-color-circle-wrap" id="wrap-btn-color" title="Text Color" style="background:${rgbToHex(targetElement.style.color)}">
                    <span style="color:#fff; font-size:10px; text-shadow:0 0 2px #000;"><b>T</b></span>
                    <input type="color" id="bar-btn-color" class="zt-color-circle" value="${rgbToHex(targetElement.style.color)}">
                </div>
            </div>
        `;
    }

    // 3. IMAGES
    else if (isImage) {
        toolbar.classList.add('zt-img-bar');
        content = `
            <div class="zt-bar-row">
                <span class="zt-bar-label">SRC</span>
                <input type="text" id="bar-img-src" class="zt-bar-input" value="${targetElement.src}" style="width:180px;">
                <div class="zt-bar-sep"></div>
                <span class="zt-bar-label">W</span>
                <input type="text" id="bar-img-width" class="zt-bar-input" value="${targetElement.style.width || '100%'}" style="width:45px;">
                <span class="zt-bar-label">H</span>
                <input type="text" id="bar-img-height" class="zt-bar-input" value="${targetElement.style.height || 'auto'}" style="width:45px;">
                <div class="zt-bar-sep"></div>
                <button class="zt-bar-btn zt-bar-btn-text" id="bar-img-upload" data-tooltip="Uploads use data URIs. Some clients (Outlook desktop) may not display them. Use a hosted URL for full compatibility.">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Upload</span>
                </button>
                <input type="file" id="bar-img-file" accept="image/*" style="display:none;">
            </div>
        `;
    }

    // 4. DIVIDERS (New)
    else if (targetElement.tagName === 'HR') {
        content = `
            <div class="zt-bar-row">
                <div class="zt-color-circle-wrap" title="Color" style="background:${rgbToHex(targetElement.style.borderTopColor || '#000000')}">
                    <input type="color" id="bar-div-color" class="zt-color-circle" value="${rgbToHex(targetElement.style.borderTopColor || '#000000')}">
                </div>
                <div class="zt-bar-sep"></div>
                <span class="zt-bar-label">HEIGHT</span>
                <input type="text" id="bar-div-height" class="zt-bar-input" value="${targetElement.style.borderTopWidth || '1px'}" style="width:40px;">
                <span class="zt-bar-label" style="margin-left:8px;">WIDTH</span>
                <input type="text" id="bar-div-width" class="zt-bar-input" value="${targetElement.style.width || '100%'}" style="width:40px;">
            </div>
        `;
    }

    if (!content) {
        if (useHeaderToolbar) clearInlineToolbar();
        return;
    }

    toolbar.innerHTML = useHeaderToolbar ? content : content + `<div class="zt-bar-arrow"></div>`;
    if (useHeaderToolbar) {
        toolbar.scrollLeft = 0;
        const scheduleScrollReset = typeof requestAnimationFrame === 'function'
            ? requestAnimationFrame
            : (callback) => setTimeout(callback, 0);
        scheduleScrollReset(() => {
            toolbar.scrollLeft = 0;
        });
    }
    if (!useHeaderToolbar) {
        block.appendChild(toolbar);
        requestAnimationFrame(() => positionContextBar(toolbar, block));
    }

    const applyBlockTextStyle = (blockEl, styleKey, value) => {
        if (!blockEl) return;
        const content = blockEl.querySelector('.zt-block-content') || blockEl;
        const nodes = content.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, ul, ol, span, div, td, th, a, blockquote, strong, em, b, i, u, small');
        if (nodes.length) {
            nodes.forEach(el => { el.style[styleKey] = value; });
        } else {
            content.style[styleKey] = value;
        }
    };

    const applyBlockTextColor = (blockEl, color) => {
        applyBlockTextStyle(blockEl, 'color', color);
    };

    const normalizeFontSize = (value) => {
        const raw = String(value || '').trim();
        if (!raw) return '';
        return /^\d+(\.\d+)?$/.test(raw) ? `${raw}px` : raw;
    };

    const getTextToggleTarget = (el, blockEl) => {
        if (el && ['H1','H2','H3','H4','H5','H6','P','BLOCKQUOTE'].includes(el.tagName)) return el;
        if (el) {
            const ancestor = el.closest('h1,h2,h3,h4,h5,h6,p,blockquote');
            if (ancestor) return ancestor;
        }
        if (blockEl) {
            const fallback = blockEl.querySelector('h1,h2,h3,h4,h5,h6,p,blockquote');
            if (fallback) return fallback;
        }
        return el || blockEl || null;
    };

    const applyQuoteStyle = (blockquote) => {
        if (!blockquote) return;
        blockquote.style.borderLeft = '4px solid #e5e7eb';
        blockquote.style.paddingLeft = '16px';
        blockquote.style.marginLeft = '0';
        blockquote.style.color = '#6b7280';
        blockquote.style.fontStyle = 'italic';
    };

    // --- LISTENERS ---

    // Formatting: Apply to Selection OR Block
    toolbar.querySelectorAll('.zt-bar-btn[data-cmd]').forEach(btn => {
        btn.onmousedown = (e) => {
            e.preventDefault();
            const cmd = btn.dataset.cmd;
            const val = btn.dataset.val || null; // Support for arguments (like blockquote)
            const isHeadingBlock = blockType === 'heading';
            const isQuoteToggle = cmd === 'formatBlock' && val === 'blockquote';
            const hasSelection = savedRange && !savedRange.collapsed;

            if (hasSelection && !(isQuoteToggle && isHeadingBlock)) {
                // Apply to Selection
                restoreSelection();
                document.execCommand(cmd, false, val);
                markEditorDirty();
            } else {
                // Apply to Whole Block (or default exec behavior)
                const styleTarget = getTextToggleTarget(targetElement, block) || targetElement;
                if(cmd === 'bold') styleTarget.style.fontWeight = styleTarget.style.fontWeight === 'bold' ? 'normal' : 'bold';
                else if(cmd === 'italic') styleTarget.style.fontStyle = styleTarget.style.fontStyle === 'italic' ? 'normal' : 'italic';
                else if(cmd === 'underline') {
                    const computed = window.getComputedStyle(styleTarget);
                    const decoration = computed.textDecorationLine || computed.textDecoration || '';
                    const isUnderlined = decoration.includes('underline');
                    styleTarget.style.textDecoration = isUnderlined ? 'none' : 'underline';
                }
                else if(isQuoteToggle) {
                    const blockTarget = getTextToggleTarget(targetElement, block);
                    if (blockTarget) {
                        const existing = blockTarget.tagName === 'BLOCKQUOTE' ? blockTarget : blockTarget.closest('blockquote');
                        if (existing) {
                            const parent = existing.parentNode;
                            while (existing.firstChild) parent.insertBefore(existing.firstChild, existing);
                            parent.removeChild(existing);
                        } else {
                            const wrapper = document.createElement('blockquote');
                            applyQuoteStyle(wrapper);
                            if (blockTarget.parentNode) {
                                blockTarget.parentNode.insertBefore(wrapper, blockTarget);
                                wrapper.appendChild(blockTarget);
                            }
                        }
                    }
                } else {
                    // For Lists, let execCommand handle the block wrapping
                    document.execCommand(cmd, false, val);
                }
                markEditorDirty();
            }
        };
    });

    // Alignment
    const alignContainer = isButton ? targetElement.parentElement : targetElement;
    const applySocialAlignment = (alignment) => {
        const table = block ? block.querySelector('table') : null;
        const content = block ? block.querySelector('.zt-block-content') : null;
        if (!table || !content) return;
        content.style.textAlign = alignment;
        table.setAttribute('align', alignment);
        table.style.display = 'inline-table';
        table.style.marginLeft = '';
        table.style.marginRight = '';
        markEditorDirty();
    };
    if(document.getElementById('bar-align-left')) {
        document.getElementById('bar-align-left').onmousedown = (e) => {
            e.preventDefault();
            if (isSocial) applySocialAlignment('left');
            else alignContainer.style.textAlign = 'left';
            markEditorDirty();
        };
        document.getElementById('bar-align-center').onmousedown = (e) => {
            e.preventDefault();
            if (isSocial) applySocialAlignment('center');
            else alignContainer.style.textAlign = 'center';
            markEditorDirty();
        };
        document.getElementById('bar-align-right').onmousedown = (e) => {
            e.preventDefault();
            if (isSocial) applySocialAlignment('right');
            else alignContainer.style.textAlign = 'right';
            markEditorDirty();
        };
    }

    // Text Logic
    if(isText) {
        const btnLink = document.getElementById('bar-btn-link');
        if (btnLink) btnLink.onmousedown = (e) => {
            e.preventDefault();
            openLinkModal({ mode: 'text', block, targetElement, activeLink, selectionHasText });
        };
        const socialEdit = document.getElementById('bar-social-edit');
        if (socialEdit && blockType === 'social') {
            socialEdit.onmousedown = (e) => {
                e.preventDefault();
                openSocialLinksModal(block);
            };
        }

        // Font controls
        const fontSelect = document.getElementById('bar-font-family');
        const fontSizeInput = document.getElementById('bar-font-size');
        const normalizeFontValue = (value) => String(value || '').replace(/['"]/g, '').trim().toLowerCase();
        if (fontSelect) {
            const desired = normalizeFontValue(getComputedStyle(targetElement).fontFamily);
            const match = Array.from(fontSelect.options).find(opt => {
                const candidate = normalizeFontValue(opt.value);
                return desired === candidate || desired.includes(candidate.split(',')[0]);
            });
            if (match) fontSelect.value = match.value;
            fontSelect.onchange = (e) => {
                applyBlockTextStyle(block, 'fontFamily', e.target.value);
                markEditorDirty();
            };
        }
        if (fontSizeInput) {
            fontSizeInput.oninput = (e) => {
                applyBlockTextStyle(block, 'fontSize', normalizeFontSize(e.target.value));
                markEditorDirty();
            };
        }

        // Colors
        const txtColor = document.getElementById('bar-text-color');
        if(txtColor) txtColor.oninput = (e) => {
            if(savedRange && !savedRange.collapsed) {
                restoreSelection();
                document.execCommand('foreColor', false, e.target.value);
            } else {
                applyBlockTextColor(block, e.target.value);
            }
            txtColor.parentElement.style.background = e.target.value;
            markEditorDirty();
        };

    }

    // Button Props
    if (isButton) {
        document.getElementById('bar-btn-text').oninput = (e) => { targetElement.innerText = e.target.value; markEditorDirty(); };
        document.getElementById('bar-btn-url').oninput = (e) => { targetElement.setAttribute('href', e.target.value); markEditorDirty(); };
        toolbar.querySelectorAll('.zt-bar-btn[data-btn-style]').forEach(btn => {
            btn.onmousedown = (e) => {
                e.preventDefault();
                const style = btn.dataset.btnStyle;
                if (style === 'bold') {
                    targetElement.style.fontWeight = targetElement.style.fontWeight === 'bold' ? 'normal' : 'bold';
                } else if (style === 'italic') {
                    targetElement.style.fontStyle = targetElement.style.fontStyle === 'italic' ? 'normal' : 'italic';
                } else if (style === 'underline') {
                    const computed = window.getComputedStyle(targetElement);
                    const decoration = computed.textDecorationLine || computed.textDecoration || '';
                    const isUnderlined = decoration.includes('underline');
                    targetElement.style.textDecoration = isUnderlined ? 'none' : 'underline';
                }
                markEditorDirty();
            };
        });
        const btnFontSelect = document.getElementById('bar-font-family');
        const btnFontSize = document.getElementById('bar-font-size');
        const normalizeFontValue = (value) => String(value || '').replace(/['"]/g, '').trim().toLowerCase();
        if (btnFontSelect) {
            const desired = normalizeFontValue(getComputedStyle(targetElement).fontFamily);
            const match = Array.from(btnFontSelect.options).find(opt => {
                const candidate = normalizeFontValue(opt.value);
                return desired === candidate || desired.includes(candidate.split(',')[0]);
            });
            if (match) btnFontSelect.value = match.value;
            btnFontSelect.onchange = (e) => {
                targetElement.style.fontFamily = e.target.value;
                markEditorDirty();
            };
        }
        if (btnFontSize) {
            btnFontSize.oninput = (e) => {
                targetElement.style.fontSize = normalizeFontSize(e.target.value);
                markEditorDirty();
            };
        }

        const btnBg = document.getElementById('bar-btn-bg');
        btnBg.oninput = (e) => { targetElement.style.backgroundColor = e.target.value; btnBg.parentElement.style.background = e.target.value; markEditorDirty(); };

        const btnCol = document.getElementById('bar-btn-color');
        btnCol.oninput = (e) => { targetElement.style.color = e.target.value; btnCol.parentElement.style.background = e.target.value; markEditorDirty(); };

    }

    // Image Props
    if (isImage) {
        document.getElementById('bar-img-src').oninput = (e) => { targetElement.src = e.target.value; markEditorDirty(); };
        document.getElementById('bar-img-width').oninput = (e) => { targetElement.style.width = e.target.value; markEditorDirty(); };
        document.getElementById('bar-img-height').oninput = (e) => { targetElement.style.height = e.target.value; markEditorDirty(); };
        const uploadBtn = document.getElementById('bar-img-upload');
        const fileInput = document.getElementById('bar-img-file');
        if (uploadBtn && fileInput) {
            uploadBtn.onmousedown = (e) => {
                e.preventDefault();
                fileInput.click();
            };
            fileInput.onchange = (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                if (!file.type || !file.type.startsWith('image/')) {
                    alert('Please choose an image file.');
                    fileInput.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result;
                    if (typeof result === 'string') {
                        targetElement.src = result;
                        const srcInput = document.getElementById('bar-img-src');
                        if (srcInput) srcInput.value = result;
                        markEditorDirty();
                    }
                };
                reader.readAsDataURL(file);
                fileInput.value = '';
            };
        }
    }

    // Divider Props
    if (targetElement.tagName === 'HR') {
        const divColor = document.getElementById('bar-div-color');
        divColor.oninput = (e) => {
             targetElement.style.borderTopColor = e.target.value;
             divColor.parentElement.style.background = e.target.value;
             markEditorDirty();
        };
        document.getElementById('bar-div-height').oninput = (e) => { targetElement.style.borderTopWidth = e.target.value; markEditorDirty(); };
        document.getElementById('bar-div-width').oninput = (e) => { targetElement.style.width = e.target.value; markEditorDirty(); };
    }

}

function openLinkModal({ mode, block, targetElement, activeLink, selectionHasText }) {
    const isImage = mode === 'image';
    const isBlockOnly = mode === 'block';
    if (isImage && !activeLink && targetElement) {
        activeLink = targetElement.closest ? targetElement.closest('a') : null;
    }
    const blockLinkValue = block ? (block.getAttribute('data-block-link') || '') : '';
    const blockHasAnchor = block ? !!block.querySelector('a') : false;
    const linkValue = activeLink ? (activeLink.getAttribute('href') || '') : '';
    const textDisabled = !isImage && !activeLink && !selectionHasText;
    const blockDisabled = blockHasAnchor && !blockLinkValue;

    const imageSection = `
        <div style="margin-bottom:12px;">
            <label class="zt-label" style="margin-bottom:6px;">Image Link</label>
            <input type="text" id="zt-link-text" class="zt-input-title" value="${linkValue}" placeholder="https://...">
        </div>
    `;
    const textSection = `
        <div style="margin-bottom:12px;">
            <label class="zt-label" style="margin-bottom:6px;">Text Link</label>
            <input type="text" id="zt-link-text" class="zt-input-title" value="${linkValue}" placeholder="${textDisabled ? 'Select text to add a link' : 'https://...'}" ${textDisabled ? 'disabled' : ''}>
            ${textDisabled ? `<div class="zt-link-hint">Select text in the editor to add a link.</div>` : ''}
        </div>
    `;
    const blockSection = `
        <div style="margin-bottom:12px;">
            <label class="zt-label" style="margin-bottom:6px;">Block Link</label>
            <input type="text" id="zt-link-block" class="zt-input-title" value="${blockDisabled ? '' : blockLinkValue}" placeholder="${blockDisabled ? 'Block already contains a link' : 'https://...'}" ${blockDisabled ? 'disabled' : ''}>
            ${blockDisabled ? `<div class="zt-link-hint">Block link is disabled because this block already contains a link.</div>` : ''}
        </div>
    `;

    const content = isImage ? imageSection : (isBlockOnly ? blockSection : textSection);

    showModal('Link', content, () => {
        let didChange = false;
        const textInput = document.getElementById('zt-link-text');
        const blockInput = document.getElementById('zt-link-block');
        const url = textInput ? textInput.value.trim() : '';

        if (isImage) {
            const img = targetElement && targetElement.tagName === 'IMG' ? targetElement : null;
            if (img) {
                const parent = img.parentElement;
                if (parent && parent.tagName === 'A') {
                    if (url) parent.href = url;
                    else {
                        parent.parentNode.insertBefore(img, parent);
                        parent.remove();
                    }
                    didChange = true;
                } else if (url) {
                    const a = document.createElement('a');
                    a.href = url;
                    img.parentNode.insertBefore(a, img);
                    a.appendChild(img);
                    didChange = true;
                }
            }
        } else if (!textDisabled && textInput) {
            if (activeLink) {
                if (url) activeLink.setAttribute('href', url);
                else {
                    const parent = activeLink.parentNode;
                    while (activeLink.firstChild) parent.insertBefore(activeLink.firstChild, activeLink);
                    parent.removeChild(activeLink);
                }
                didChange = true;
            } else if (savedRange && !savedRange.collapsed) {
                restoreSelection();
                if (url) document.execCommand('createLink', false, url);
                else document.execCommand('unlink', false, null);
                didChange = true;
            }
        }

        if (!isImage && !blockDisabled && blockInput && block) {
            const blockUrl = blockInput.value.trim();
            if (blockUrl) block.setAttribute('data-block-link', blockUrl);
            else block.removeAttribute('data-block-link');
            didChange = true;
        }

        if (didChange) markEditorDirty();
        return true;
    });

    const modal = document.querySelector('.zt-modal-overlay');
    if (modal) {
        const submit = modal.querySelector('#modal-submit');
        if (submit) submit.textContent = 'Apply';
    }
}
