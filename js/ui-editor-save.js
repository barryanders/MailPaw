/* --- EDITOR SAVING LOGIC --- */

function buildEmailHtmlFromCanvas(canvasEl, bgEmail, fontFamily = '', fontColor = '') {
    if (!canvasEl) return { designState: '', body: '' };
    const designState = canvasEl.innerHTML;

    const clone = canvasEl.cloneNode(true);
    let hasResponsiveEmailColumns = false;
    const responsiveEmailStyles = '<style>@media only screen and (max-width: 600px) { .mp-container { width: 100% !important; max-width: 100% !important; } .mp-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; } .mp-stack + .mp-stack { margin-top: 12px !important; } .mp-fluid { width: 100% !important; max-width: 100% !important; height: auto !important; } }</style>';
    const buildBoxValue = (top, right, bottom, left) => {
        if (!(top || right || bottom || left)) return '';
        const t = top || '0';
        const r = right || top || '0';
        const b = bottom || top || '0';
        const l = left || right || top || '0';
        return `${t} ${r} ${b} ${l}`;
    };
    const readBoxStyle = (block, prop) => {
        const shorthand = block.style[prop];
        if (shorthand) return shorthand;
        const top = block.style[`${prop}Top`];
        const right = block.style[`${prop}Right`];
        const bottom = block.style[`${prop}Bottom`];
        const left = block.style[`${prop}Left`];
        return buildBoxValue(top, right, bottom, left);
    };
    const readBorderWidthStyle = (block) => {
        const shorthand = block.style.borderWidth;
        if (shorthand) return shorthand;
        const top = block.style.borderTopWidth;
        const right = block.style.borderRightWidth;
        const bottom = block.style.borderBottomWidth;
        const left = block.style.borderLeftWidth;
        return buildBoxValue(top, right, bottom, left);
    };
    const wrapInnerWithLink = (el, url) => {
        if (!el || !url) return false;
        if (el.querySelector('a')) return false;
        const link = document.createElement('a');
        link.href = url;
        link.style.color = 'inherit';
        link.style.textDecoration = 'none';
        link.style.display = 'inline-block';
        while (el.firstChild) link.appendChild(el.firstChild);
        el.appendChild(link);
        return true;
    };
    const applyBlockLinkToText = (block, url) => {
        if (!block || !url) return false;
        const targets = block.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote');
        if (!targets.length) return false;
        let applied = false;
        targets.forEach(el => { if (wrapInnerWithLink(el, url)) applied = true; });
        return applied;
    };
    const applyBlockLinkToImage = (block, url) => {
        if (!block || !url) return false;
        const img = block.querySelector('img');
        if (!img) return false;
        if (img.closest('a')) return false;
        const link = document.createElement('a');
        link.href = url;
        link.style.display = 'block';
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';
        img.parentNode.insertBefore(link, img);
        link.appendChild(img);
        return true;
    };

    clone.querySelectorAll('.zt-block-controls, .zt-context-bar').forEach(el => el.remove());
    clone.querySelectorAll('.zt-builder-block').forEach(block => {
        const bgColor = block.style.backgroundColor;
        const padding = readBoxStyle(block, 'padding');
        const border = block.style.border;
        const borderWidth = readBorderWidthStyle(block);
        const borderColor = block.style.borderColor;
        const borderStyle = block.style.borderStyle;
        const radius = block.style.borderRadius;
        const marginValue = readBoxStyle(block, 'margin');
        const marginBottom = block.style.marginBottom;
        const blockLink = block.getAttribute('data-block-link');
        const blockType = block.getAttribute('data-type');
        const isButton = blockType === 'button';
        if (blockLink) {
            if (blockType === 'text' || blockType === 'heading') {
                applyBlockLinkToText(block, blockLink);
            } else if (blockType === 'image') {
                applyBlockLinkToImage(block, blockLink);
            }
        }
        const hasAnchor = block.querySelector('a') !== null;
        const shouldWrapLink = blockLink && !hasAnchor;

        block.removeAttribute('class');
        block.removeAttribute('style');
        block.removeAttribute('data-type');
        block.removeAttribute('data-block-link');

        const defaultMarginBottom = isButton ? "5px" : "10px";
        const finalMarginBottom = marginBottom || defaultMarginBottom;
        const finalMargin = marginValue || '';

        const hasBorder = border || borderWidth;
        const needsWrapper = bgColor || padding || hasBorder || radius || shouldWrapLink;
        if (needsWrapper) {
            const wrapper = document.createElement(shouldWrapLink ? 'a' : 'div');
            if (shouldWrapLink) {
                wrapper.href = blockLink;
                wrapper.style.color = "inherit";
                wrapper.style.textDecoration = "none";
                wrapper.style.display = "block";
                wrapper.style.width = "100%";
            }
            if (bgColor) wrapper.style.backgroundColor = bgColor;
            wrapper.style.padding = padding || (bgColor ? "10px" : "");
            if (border) wrapper.style.border = border;
            else if (borderWidth) {
                wrapper.style.borderWidth = borderWidth;
                wrapper.style.borderStyle = borderStyle || 'solid';
                wrapper.style.borderColor = borderColor || '#e2e8f0';
            }
            if (radius) wrapper.style.borderRadius = radius;
            if (finalMargin) wrapper.style.margin = finalMargin;
            else wrapper.style.marginBottom = finalMarginBottom;
            block.parentNode.replaceChild(wrapper, block);
            wrapper.appendChild(block);
        } else {
            if (finalMargin) block.style.margin = finalMargin;
            else block.style.marginBottom = finalMarginBottom;
        }
    });

    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    clone.querySelectorAll('.zt-block-content').forEach(content => {
        while (content.firstChild) { content.parentNode.insertBefore(content.firstChild, content); }
        content.remove();
    });
    clone.querySelectorAll('tr').forEach(row => {
        const cols = Array.from(row.children).filter(child => child.classList && child.classList.contains('zt-column'));
        if (!cols.length) return;
        hasResponsiveEmailColumns = true;
        const table = row.closest('table');
        if (table) {
            table.classList.add('mp-container');
            table.setAttribute('role', 'presentation');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.tableLayout = 'fixed';
        }
        const width = `${(100 / cols.length).toFixed(2)}%`;
        cols.forEach(col => {
            col.removeAttribute('class');
            col.removeAttribute('style');
            col.className = 'mp-stack';
            col.style.width = width;
            col.style.maxWidth = width;
            col.style.padding = '10px';
            col.style.verticalAlign = 'top';
            col.style.display = 'table-cell';
        });
    });
    clone.querySelectorAll('.zt-html-container').forEach(container => {
        const textarea = container.querySelector('.zt-html-code-editor');
        const cleanHTML = textarea ? textarea.value : '';
        const wrapper = document.createElement('div');
        wrapper.innerHTML = cleanHTML;
        container.replaceWith(wrapper);
    });
    clone.querySelectorAll('img').forEach(img => {
        img.classList.add('mp-fluid');
        if (!img.style.maxWidth) img.style.maxWidth = '100%';
        if (!img.style.height) img.style.height = 'auto';
    });

    const safeBg = bgEmail || '#ffffff';
    const safeFont = fontFamily || '';
    const safeColor = fontColor || '';
    const fontStyle = safeFont ? ` font-family:${safeFont};` : '';
    const colorStyle = safeColor ? ` color:${safeColor};` : '';
    const needsEmailShell = safeBg && safeBg.toLowerCase() !== '#ffffff';
    const shellPadding = needsEmailShell ? ' padding:20px;' : '';
    const finalHTML = `<div style="background-color:${safeBg};${shellPadding}${fontStyle}${colorStyle}">${hasResponsiveEmailColumns ? responsiveEmailStyles : ''}${clone.innerHTML}</div>`;
    return { designState, body: finalHTML };
}

function saveCurrentTemplate(isEdit, originalIdIgnored) {
    const originalId = window.ztCurrentTemplateId;
    const canvasEl = document.getElementById('fs-visual');
    const titleEl = document.getElementById('zt_tpl_nme_fs');
    const catEl = document.getElementById('zt_tpl_cat_fs');

    const title = titleEl ? titleEl.value.trim() : 'Untitled';
    let cat = catEl ? catEl.value.trim() : '';

    if(!title || !cat) { 
        showValidationAlert("Please fill in both the <b>Template Name</b> and <b>Category</b> before saving."); 
        return; 
    }

    canvasEl.querySelectorAll('.zt-html-code-editor').forEach(el => {
        el.textContent = el.value;
    });

    const bgEmailInput = document.getElementById('zt_glob_bg_email');
    const bgEmail = bgEmailInput ? bgEmailInput.value : '#ffffff';
    const fontInput = document.getElementById('zt_glob_font_fs');
    const fontFamily = fontInput ? fontInput.value : '';
    const fontColorInput = document.getElementById('zt_glob_font_color');
    const fontColor = fontColorInput ? fontColorInput.value : '';
    const fontColorValue = window.ztGlobalFontColorActive ? fontColor : '';
    const { designState, body: finalHTML } = buildEmailHtmlFromCanvas(canvasEl, bgEmail, fontFamily, fontColorValue);
    const subjectInput = document.getElementById('zt_tpl_sbj_fs');
    const shortcutInput = document.getElementById('zt_tpl_sht_fs');

    const runSave = () => {
        saveTemplate(originalId, {
            category: cat,
            title: title,
            subject: subjectInput ? subjectInput.value : '',
            shortcut: shortcutInput ? shortcutInput.value : '',
            body: finalHTML,
            design: designState,
            bgEmail: bgEmail,
            fontFamily: fontFamily,
            fontColor: fontColorValue,
            stylePresetId: window.ztStylePreset?.id || ''
        });

        window.ztEditorIsDirty = false;
        document.getElementById('zt-fs-layer').classList.remove('show');
        window.ztCurrentTemplateId = null;
        resetEditorHistory();
        renderHomeView();
    };

    if (originalId && Array.isArray(templates)) {
        const existing = templates.find(t => t.id === originalId);
        if (existing && existing.isDefault && typeof guardTemplateCreation === 'function') {
            guardTemplateCreation(runSave);
            return;
        }
    }

    runSave();
}

function showValidationAlert(msg) {
    const layer = document.createElement('div');
    layer.id = 'zt-alert-modal';
    layer.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:2147483647; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.2s;";
    
    layer.innerHTML = `
        <div class="zt-alert-card" tabindex="-1" style="background:white; padding:24px; border-radius:16px; width:320px; box-shadow:0 24px 45px rgba(15,23,42,0.2); animation:slideUpFade 0.2s; font-family:var(--zt-font);">
            <div style="font-size:16px; font-weight:700; margin-bottom:8px; color:#ef4444; display:flex; align-items:center; gap:8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                Missing Info
            </div>
            <p style="font-size:14px; color:#64748b; line-height:1.5; margin-bottom:20px;">${msg}</p>
            <button id="zt-alert-ok" style="background:#0ea5e9; color:white; border:none; padding:10px; border-radius:10px; font-weight:600; width:100%; cursor:pointer; transition:background 0.2s;">OK</button>
        </div>
    `;
    
    document.body.appendChild(layer);
    
    const btn = document.getElementById('zt-alert-ok');
    const card = layer.querySelector('.zt-alert-card');
    if (btn) btn.onclick = () => layer.remove();
    if (card) setTimeout(() => card.focus(), 50);
    if (card) {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                if (btn) btn.click();
            }
        });
    }
}
