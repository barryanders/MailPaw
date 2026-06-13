/* --- BLOCK BUILDER --- */

function createBlockHTML(type, param=null) {
    let content = '';
    const def = componentDefaults[type] || {};
    const isHtmlBlock = type === 'html';
    let socialNetworksForBlock = null;
    const globalFontColor = (typeof window !== 'undefined' && window.ztGlobalFontColorActive && window.ztGlobalFontColor)
        ? window.ztGlobalFontColor
        : '';
    const presetDefaults = (typeof window !== 'undefined' && window.ztStylePresetDefaults)
        ? window.ztStylePresetDefaults
        : {};

    switch(type) {
        case 'heading':
            content = `<h2 style="margin:0; font-family:${def.font}; color:${globalFontColor || def.color}; font-size:${def.size};">New Heading</h2>`;
            break;
        case 'text':
            const uid = 'zt-' + Math.random().toString(36).substr(2, 9);
            const linkDecor = def.link.underline ? 'underline' : 'none';
            const linkColor = presetDefaults.linkColor || def.link.color;
            let listStyleVal = def.list.style;
            if(listStyleVal === 'custom' && def.list.customMarker) {
                listStyleVal = `'${def.list.customMarker.replace(/'/g, '\\\'')}'`; 
            } else if (listStyleVal === 'custom') listStyleVal = 'disc';

            const styleBlock = `<style>#${uid} a { color: ${linkColor} !important; text-decoration: ${linkDecor} !important; } #${uid} ul { list-style-type: ${listStyleVal} !important; padding-left: 20px; } #${uid} ol { list-style-type: decimal !important; padding-left: 20px; } #${uid} li { margin-bottom: 5px; } #${uid} blockquote { border-left: 4px solid #e5e7eb; padding-left: 16px; margin-left: 0; color: #6b7280; font-style: italic; }</style>`;
            content = `<div id="${uid}">${styleBlock}<p style="margin:0; font-family:${def.font}; color:${globalFontColor || def.color}; font-size:${def.size}; line-height:${def.lineHeight || '1.6'};">Start typing...</p></div>`;
            break;
        case 'button':
            const buttonBg = presetDefaults.buttonBg || def.bg;
            const buttonColor = presetDefaults.buttonColor || def.color;
            content = `<div style="text-align:center; padding: 5px 0;"><a href="" style="background:${buttonBg}; color:${buttonColor}; font-family:${def.font}; font-size:${def.size}; padding:${def.padding || '12px 24px'}; text-decoration:none; border-radius:${def.radius}; font-weight:bold; display:inline-block;">Click Me</a></div>`;
            break;
        case 'divider':
            const dividerColor = presetDefaults.dividerColor || def.color;
            content = `<hr style="border:0; border-top:${def.thickness || '1px'} solid ${dividerColor}; margin:${def.margin || '10px 0'}; width:${def.width || '100%'};">`;
            break;
        case 'image':
            content = `<img src="https://picsum.photos/600/300" style="width:100%; border-radius:${def.radius}; display:block;">`;
            break;
        case 'spacer':
            const spacerHeight = def.height || '24px';
            content = `<div style="height:${spacerHeight}; line-height:${spacerHeight}; font-size:0;">&nbsp;</div>`;
            break;
        case 'social':
            const selectedNetworks = Array.isArray(param) && param.length ? param : (def.networks || []);
            socialNetworksForBlock = selectedNetworks;
            if (typeof buildSocialLinksHTML === 'function') {
                content = buildSocialLinksHTML(selectedNetworks, { align: 'center' });
            } else {
                const socialLinks = selectedNetworks.map((name) => {
                    return `<td style="padding:4px 6px;"><a href="https://" style="display:inline-flex; align-items:center; justify-content:center; text-decoration:none;">${name}</a></td>`;
                }).join('');
                content = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${socialLinks}</tr></table>`;
            }
            break;
        case 'html':
            const htmlId = 'html-' + Math.random().toString(36).substr(2, 9);
            content = `
                <div class="zt-html-container" id="${htmlId}">
                    <div class="zt-html-header" contenteditable="false">
                        <button class="zt-html-tab active" data-mode="code">Code</button>
                        <button class="zt-html-tab" data-mode="preview">Preview</button>
                    </div>
                    <div class="zt-html-body">
                        <div class="zt-html-source-view">
                            <textarea class="zt-html-code-editor" spellcheck="false" placeholder="Paste HTML here..."></textarea>
                        </div>
                        <div class="zt-html-preview-view" style="display:none;" contenteditable="false"></div>
                    </div>
                </div>`;
            break;
        case 'grid':
            let cols = param || 2;
            let width = 100 / cols;
            let cells = '';
            
            // Create a default text block to populate columns
            // We use a temporary dummy ID to avoid collision logic here, 
            // but ideally we generate fresh ones. 
            // Since createBlockHTML generates a unique ID for text, we call it for each column.
            
            for(let i=0; i<cols; i++) {
                const dummyTextBlock = createBlockHTML('text');
                // Customize the placeholder text for the grid
                const contentDiv = dummyTextBlock.querySelector('.zt-block-content p');
                if(contentDiv) contentDiv.textContent = 'Start typing...';
                
                cells += `<td class="zt-column" width="${width}%" style="padding:10px; vertical-align:top; border:1px dashed #e5e7eb; min-height:50px;">${dummyTextBlock.outerHTML}</td>`;
            }
            content = `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>`;
            break;
        default: return null;
    }

    const socialEditBtn = type === 'social'
        ? `<button class="zt-control-btn zt-social-edit-btn" data-tooltip="Edit social links" aria-label="Edit social links"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="12" r="2"></circle><circle cx="18" cy="6" r="2"></circle><circle cx="18" cy="18" r="2"></circle><path d="M8 12h7"></path><path d="M12 12l6-6"></path><path d="M12 12l6 6"></path></svg><span>Edit Socials</span></button>`
        : '';

    const wrapper = document.createElement('div');
    wrapper.className = 'zt-builder-block';
    wrapper.setAttribute('data-type', type);
    wrapper.innerHTML = `
        <div class="zt-block-content" contenteditable="${isHtmlBlock ? 'false' : 'true'}">${content}</div>
        <div class="zt-block-controls" contenteditable="false" style="user-select:none;">
            <div class="zt-control-btn zt-drag-handle" title="Drag to Move" style="cursor:grab;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="2" x2="12" y2="7"></line><line x1="12" y1="17" x2="12" y2="22"></line><line x1="2" y1="12" x2="7" y2="12"></line><line x1="17" y1="12" x2="22" y2="12"></line></svg></div>
            <button class="zt-control-btn zt-style-btn" title="Block Styles"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><circle cx="4" cy="12" r="2"></circle><circle cx="12" cy="10" r="2"></circle><circle cx="20" cy="14" r="2"></circle></svg></button>
            <button class="zt-control-btn zt-link-btn" title="Block Link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></button>
            ${socialEditBtn}
            <button class="zt-control-btn zt-move-up-btn" title="Move Up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg></button>
            <button class="zt-control-btn zt-move-down-btn" title="Move Down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg></button>
            <button class="zt-control-btn zt-dup-btn" title="Duplicate"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
            <button class="zt-control-btn zt-del-btn" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
        </div>`;
    applyBlockLayoutDefaults(wrapper, def.layout);
    if (socialNetworksForBlock) {
        wrapper.setAttribute('data-social-networks', socialNetworksForBlock.join(','));
        const contentEl = wrapper.querySelector('.zt-block-content');
        const table = contentEl ? contentEl.querySelector('table') : null;
        if (contentEl) contentEl.style.textAlign = 'center';
        if (table) {
            table.setAttribute('align', 'center');
            table.style.display = 'inline-table';
            table.style.margin = '0 auto';
        }
    }
    return wrapper;
}

function applyBlockLayoutDefaults(block, layout) {
    if (!block || !layout) return;
    const normalizeSize = (value) => {
        const raw = String(value || '').trim();
        if (!raw) return '';
        return /^\d+(\.\d+)?$/.test(raw) ? `${raw}px` : raw;
    };
    const normalizeSizeList = (value) => {
        const raw = String(value || '').trim();
        if (!raw) return '';
        return raw.split(/\s+/).map(token => normalizeSize(token)).join(' ');
    };
    const padTop = normalizeSize(layout.paddingTop);
    const padRight = normalizeSize(layout.paddingRight);
    const padBottom = normalizeSize(layout.paddingBottom);
    const padLeft = normalizeSize(layout.paddingLeft);
    const padValues = [padTop, padRight, padBottom, padLeft];
    const hasPad = padValues.some(val => val);
    if (hasPad) {
        block.style.padding = '';
        block.style.paddingTop = padTop || '';
        block.style.paddingRight = padRight || '';
        block.style.paddingBottom = padBottom || '';
        block.style.paddingLeft = padLeft || '';
    } else if (layout.padding) {
        block.style.padding = normalizeSizeList(layout.padding);
    }

    const marginTop = normalizeSize(layout.marginTop);
    const marginRight = normalizeSize(layout.marginRight);
    const marginBottom = normalizeSize(layout.marginBottom);
    const marginLeft = normalizeSize(layout.marginLeft);
    const marginValues = [marginTop, marginRight, marginBottom, marginLeft];
    const hasMargin = marginValues.some(val => val);
    if (hasMargin) {
        block.style.margin = '';
        block.style.marginTop = marginTop || '';
        block.style.marginRight = marginRight || '';
        block.style.marginBottom = marginBottom || '';
        block.style.marginLeft = marginLeft || '';
    } else if (layout.marginBottom) {
        block.style.marginBottom = normalizeSize(layout.marginBottom);
    }
    block.style.backgroundColor = layout.background || '';
    block.style.borderRadius = normalizeSize(layout.radius) || '';
    const borderTop = normalizeSize(layout.borderTop);
    const borderRight = normalizeSize(layout.borderRight);
    const borderBottom = normalizeSize(layout.borderBottom);
    const borderLeft = normalizeSize(layout.borderLeft);
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
        const width = parseFloat(layout.borderWidth);
        if (!Number.isNaN(width) && width > 0) {
            const color = layout.borderColor || '#e2e8f0';
            block.style.border = `${width}px solid ${color}`;
        } else {
            block.style.borderWidth = normalizeSize(layout.borderWidth);
            block.style.borderStyle = 'solid';
            block.style.borderColor = layout.borderColor || '#e2e8f0';
        }
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

function insertBlock(type, param=null) {
    const newBlock = createBlockHTML(type, param);
    const visual = document.getElementById('fs-visual');
    if(newBlock && visual) {
        visual.appendChild(newBlock);
        if (typeof window.applyGlobalFontColorToBlocks === 'function' && window.ztGlobalFontColor && window.ztGlobalFontColorActive) {
            window.applyGlobalFontColorToBlocks(window.ztGlobalFontColor);
        }
        if (type === 'grid') refreshNestedSortables(newBlock);
        selectBlock(newBlock);
        newBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.ztEditorIsDirty = true;
        captureEditorState();
    }
}

function insertPreset(type) {
    const visual = document.getElementById('fs-visual');
    if (!visual) return;

    const blocks = [];
    if (type === 'hero') {
        const image = createBlockHTML('image');
        const imgEl = image.querySelector('img');
        if (imgEl) imgEl.src = 'https://picsum.photos/900/420';

        const heading = createBlockHTML('heading');
        const headingEl = heading.querySelector('h2');
        if (headingEl) {
            headingEl.textContent = 'Launch something new';
            headingEl.style.textAlign = 'center';
        }

        const text = createBlockHTML('text');
        const textEl = text.querySelector('p');
        if (textEl) {
            textEl.textContent = 'Highlight the headline, share the value, then send readers to the next step.';
            textEl.style.textAlign = 'center';
        }

        const button = createBlockHTML('button');
        const btnEl = button.querySelector('a');
        if (btnEl) btnEl.textContent = "See what's new";

        blocks.push(image, heading, text, button);
    }
    if (type === 'feature') {
        const heading = createBlockHTML('heading');
        const headingEl = heading.querySelector('h2');
        if (headingEl) headingEl.textContent = 'Feature Highlights';

        const grid = createBlockHTML('grid', 2);
        const columns = grid.querySelectorAll('.zt-column');
        if (columns[0]) {
            columns[0].innerHTML = '';
            const img = createBlockHTML('image');
            const imgEl = img.querySelector('img');
            if (imgEl) imgEl.src = 'https://picsum.photos/460/300';
            const subhead = createBlockHTML('heading');
            const subEl = subhead.querySelector('h2');
            if (subEl) {
                subEl.textContent = 'Fast setup';
                subEl.style.fontSize = '18px';
            }
            const text = createBlockHTML('text');
            const textEl = text.querySelector('p');
            if (textEl) textEl.textContent = 'Build reusable layouts that stay consistent across teams.';
            columns[0].appendChild(img);
            columns[0].appendChild(subhead);
            columns[0].appendChild(text);
        }
        if (columns[1]) {
            columns[1].innerHTML = '';
            const img = createBlockHTML('image');
            const imgEl = img.querySelector('img');
            if (imgEl) imgEl.src = 'https://picsum.photos/460/301';
            const subhead = createBlockHTML('heading');
            const subEl = subhead.querySelector('h2');
            if (subEl) {
                subEl.textContent = 'Email ready';
                subEl.style.fontSize = '18px';
            }
            const text = createBlockHTML('text');
            const textEl = text.querySelector('p');
            if (textEl) textEl.textContent = 'Responsive email HTML that keeps typography and spacing intact.';
            columns[1].appendChild(img);
            columns[1].appendChild(subhead);
            columns[1].appendChild(text);
        }

        blocks.push(heading, grid);
    }
    if (type === 'cta') {
        const grid = createBlockHTML('grid', 2);
        const columns = grid.querySelectorAll('.zt-column');
        grid.style.padding = '16px';
        grid.style.borderRadius = '16px';

        if (columns[0]) {
            columns[0].innerHTML = '';
            const heading = createBlockHTML('heading');
            const headingEl = heading.querySelector('h2');
            if (headingEl) {
                headingEl.textContent = 'Ready to ship faster?';
                headingEl.style.fontSize = '20px';
            }
            const text = createBlockHTML('text');
            const textEl = text.querySelector('p');
            if (textEl) textEl.textContent = 'Invite readers to take the next step with one clear action.';
            const button = createBlockHTML('button');
            const btnEl = button.querySelector('a');
            if (btnEl) btnEl.textContent = 'Get started';
            columns[0].appendChild(heading);
            columns[0].appendChild(text);
            columns[0].appendChild(button);
        }
        if (columns[1]) {
            columns[1].innerHTML = '';
            const image = createBlockHTML('image');
            const imgEl = image.querySelector('img');
            if (imgEl) imgEl.src = 'https://picsum.photos/420/360';
            columns[1].appendChild(image);
        }

        blocks.push(grid);
    }
    if (type === 'footer') {
        const divider = createBlockHTML('divider');
        const grid = createBlockHTML('grid', 2);
        const columns = grid.querySelectorAll('.zt-column');
        grid.style.padding = '16px';
        grid.style.borderRadius = '16px';
        grid.style.border = '1px solid #e2e8f0';

        columns.forEach((col) => {
            col.innerHTML = '';
            col.style.border = 'none';
            col.style.background = 'transparent';
            col.style.padding = '8px';
        });

        if (columns[0]) {
            const logo = createBlockHTML('image');
            const logoImg = logo.querySelector('img');
            if (logoImg) {
                logoImg.src = 'https://picsum.photos/280/120';
                logoImg.style.width = '140px';
                logoImg.style.margin = '0';
            }

            const about = createBlockHTML('text');
            const aboutEl = about.querySelector('p');
            if (aboutEl) {
                aboutEl.innerHTML = '<strong>Company Name</strong><br>Design-forward updates and resources.<br>123 Market Street, San Francisco, CA';
                aboutEl.style.fontSize = '12px';
                aboutEl.style.color = '#64748b';
                aboutEl.style.lineHeight = '1.5';
            }

            columns[0].appendChild(logo);
            columns[0].appendChild(about);
        }

        if (columns[1]) {
            const links = createBlockHTML('text');
            const linksEl = links.querySelector('p');
            if (linksEl) {
                linksEl.innerHTML = '<a href="https://">Manage preferences</a><br><a href="https://">Unsubscribe</a><br><a href="https://">View in browser</a>';
                linksEl.style.fontSize = '12px';
                linksEl.style.color = '#64748b';
                linksEl.style.textAlign = 'right';
                linksEl.style.lineHeight = '1.6';
            }
            const linksStyle = links.querySelector('style');
            if (linksStyle) {
                linksStyle.innerHTML = linksStyle.innerHTML
                    .replace(/a \{ color: .*? !important/, 'a { color: #475569 !important')
                    .replace(/text-decoration: .*? !important/, 'text-decoration: none !important');
            }

            const social = createBlockHTML('social', ['Instagram', 'TikTok', 'YouTube']);

            columns[1].appendChild(links);
            columns[1].appendChild(social);
        }

        const legal = createBlockHTML('text');
        const legalEl = legal.querySelector('p');
        if (legalEl) {
            legalEl.textContent = 'You are receiving this email because you subscribed to updates.';
            legalEl.style.textAlign = 'center';
            legalEl.style.fontSize = '11px';
            legalEl.style.color = '#94a3b8';
        }

        blocks.push(divider, grid, legal);
    }

    blocks.forEach((block) => {
        if (!block) return;
        visual.appendChild(block);
    });

    if (blocks.length) {
        blocks.forEach((block) => {
            if (block && block.querySelector('.zt-column')) {
                refreshNestedSortables(block);
            }
        });
        if (typeof window.applyGlobalFontColorToBlocks === 'function' && window.ztGlobalFontColor && window.ztGlobalFontColorActive) {
            window.applyGlobalFontColorToBlocks(window.ztGlobalFontColor);
        }
        selectBlock(blocks[0]);
        blocks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.ztEditorIsDirty = true;
        captureEditorState();
    }
}

function selectBlock(block) {
    document.querySelectorAll('.zt-builder-block.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.zt-builder-block.zt-child-selected').forEach(el => el.classList.remove('zt-child-selected'));
    block.classList.add('selected');

    let parentColumn = block.closest('.zt-column');
    while (parentColumn) {
        const parentBlock = parentColumn.closest('.zt-builder-block');
        if (parentBlock && parentBlock !== block) parentBlock.classList.add('zt-child-selected');
        parentColumn = parentBlock ? parentBlock.closest('.zt-column') : null;
    }

    const content = block.querySelector('.zt-block-content');
    if (content && content.firstElementChild) {
        activeElementInEditor = content.firstElementChild;
        // renderContextualSettings(activeElementInEditor); // Disabled per user request (Static Sidebar)
    }
}

// Simple text sync for HTML block (removed tab switching complexity)
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('zt-html-code-editor')) {
        const textarea = e.target;
        const container = textarea.closest('.zt-html-container');
        if (container) {
            const preview = container.querySelector('.zt-html-preview-view');
            // Sync Visual Preview
            if (preview) preview.innerHTML = textarea.value;
            window.ztEditorIsDirty = true;
            queueEditorHistoryCapture();
        }
    }
});
