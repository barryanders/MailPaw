/* --- COMPONENT SIDEBAR RENDERER --- */

function renderComponentsList() {
    const modulesContainer = document.querySelector('.zt-fs-modules-content');
    if (!modulesContainer) return;
    modulesContainer.classList.remove('zt-modules-settings');

    const labelBar = document.querySelector('.zt-fs-label');
    if(labelBar) labelBar.textContent = window.ZT_STANDALONE ? 'Paw Library' : 'Library';

    // Helper to create the gear icon
    const gearIcon = `<div class="zt-component-settings" title="Edit Default Styles"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg></div>`;

    modulesContainer.innerHTML = `
        <div class="zt-module-group-title">Sections</div>
        <div class="zt-module-btn" data-preset="hero"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 2.9 6.1 6.7.9-4.9 4.8 1.2 6.7L12 18l-5.9 3.5 1.2-6.7-4.9-4.8 6.7-.9L12 3z"/></svg>Hero Section</div>
        <div class="zt-module-btn" data-preset="feature"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16"/><path d="M10 20V10"/></svg>Feature Columns</div>
        <div class="zt-module-btn" data-preset="cta"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>Call To Action</div>
        <div class="zt-module-btn" data-preset="footer"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/></svg>Footer</div>

        <div class="zt-module-group-title">Blocks</div>
        <div class="zt-module-btn" data-type="heading"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>Heading ${gearIcon}</div>
        <div class="zt-module-btn" data-type="text"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>Text Block ${gearIcon}</div>
        <div class="zt-module-btn" data-type="button"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="10" rx="4" ry="4"></rect><line x1="8" y1="13" x2="16" y2="13"></line></svg>Button ${gearIcon}</div>
        <div class="zt-module-btn" data-type="image"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Image ${gearIcon}</div>
        <div class="zt-module-btn" data-type="divider"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>Divider ${gearIcon}</div>
        <div class="zt-module-btn" data-type="spacer"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16"/><path d="M4 18h16"/><path d="M7 9v6"/><path d="M17 9v6"/></svg>Spacer</div>
        <div class="zt-module-btn" data-type="social"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a3 3 0 1 0-2.83-4"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="16" r="3"/><path d="M8.59 13.51 15.4 16.5"/><path d="M15.41 7.5 8.59 10.49"/></svg>Social Links</div>
        <div class="zt-module-btn" data-type="grid"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>Columns</div>
        <div class="zt-module-btn" data-type="html"><svg class="zt-module-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>Raw HTML</div>
    `;

    // Styles are now in css/editor.css to persist across component settings views.
    const applyComponentSettingsAccess = (billing) => {
        const allow = (typeof isBillingConfigured !== 'function' || !isBillingConfigured())
            || (billing && (billing.isPremium || billing.isTrial));
        modulesContainer.querySelectorAll('.zt-component-settings').forEach((el) => {
            el.classList.toggle('is-locked', !allow);
            el.setAttribute('title', allow ? 'Edit Default Styles' : 'Pro: Default Styles');
        });
    };
    if (typeof isBillingConfigured === 'function' && isBillingConfigured()) {
        const cached = (typeof ztLastBillingState !== 'undefined') ? ztLastBillingState : null;
        if (cached) applyComponentSettingsAccess(cached);
        else if (typeof getBillingState === 'function') getBillingState(applyComponentSettingsAccess);
    } else {
        applyComponentSettingsAccess({ isPremium: true, isTrial: true, licenseStatus: 'dev' });
    }

    modulesContainer.onclick = (e) => {
        const btn = e.target.closest('.zt-module-btn');
        if (!btn) return;

        // 1. PRESETS
        if (btn.dataset.preset) {
            e.stopPropagation(); e.preventDefault();
            insertPreset(btn.dataset.preset);
            return;
        }

        // 2. GEAR ICON CLICK
        if (e.target.closest('.zt-component-settings')) {
            e.stopPropagation(); e.preventDefault();
            const openSettings = () => openComponentSettings(btn.dataset.type);
            if (typeof guardPremiumAction === 'function') {
                guardPremiumAction(openSettings, { reason: 'component-defaults' });
            } else {
                openSettings();
            }
            return;
        }

        // 3. SOCIAL LINKS CLICK
        if (btn.dataset.type === 'social') {
            const options = (typeof getSocialNetworkOptions === 'function')
                ? getSocialNetworkOptions()
                : ['LinkedIn', 'X', 'Instagram', 'TikTok', 'YouTube'];
            const defaults = (componentDefaults.social && componentDefaults.social.networks) || ['Instagram', 'TikTok', 'YouTube'];
            const checkboxes = options.map(name => `
                <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:13px; color:#334155;">
                    <input type="checkbox" name="zt-social" value="${name}" ${defaults.includes(name) ? 'checked' : ''}>
                    ${name}
                </label>
            `).join('');
            showModal('Social Links', checkboxes, () => {
               const selected = Array.from(document.querySelectorAll('input[name="zt-social"]:checked')).map(el => el.value);
               if (!selected.length) { alert('Select at least one network.'); return false; }
               insertBlock('social', selected);
               return true;
            });
            return;
        }

        // 4. GRID CLICK
        if (btn.dataset.type === 'grid') {
            const content = `
                <label class="zt-label" style="margin-bottom:8px;">Column Layout</label>
                <select id="modal-grid-cols" class="zt-input-select" style="margin-bottom:10px;">
                    <option value="2">2 Columns</option>
                    <option value="3">3 Columns</option>
                    <option value="4">4 Columns</option>
                </select>
            `;
            showModal('Grid Settings', content, () => {
               const cols = parseInt(document.getElementById('modal-grid-cols').value);
               if (cols >= 2 && cols <= 4) insertBlock('grid', cols);
               return true;
            });
        }
        // 5. STANDARD CLICK
        else {
            insertBlock(btn.dataset.type);
        }
    };
}
