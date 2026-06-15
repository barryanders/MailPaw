/* --- MAIN SIDEBAR UI --- */

const ZT_TRIAL_DAYS = typeof EXTPAY_TRIAL_DAYS === 'number' ? EXTPAY_TRIAL_DAYS : 7;
const ZT_FREE_TEMPLATE_LIMIT = 3;
const ZT_FREE_STYLE_PRESET_LIMIT = 2;
const ZT_STYLE_PRESET_KEY = 'ztStylePresetId';
const ZT_HIDE_HERO_KEY = 'ztHideHero';
const ZT_TEMPLATE_FILTER_KEY = 'ztTemplateFilter';
const ZT_TIER_FILTER_KEY = 'ztTierFilter';
let ztStylePresetLoaded = false;
let ztActiveStylePresetId = null;
let ztHideHero = false;
let activeTemplateFilter = 'all';
let ztLastBillingState = null;
let ztUpgradeReturnState = null;
let ztBillingRefreshTimer = null;
let ztBillingRefreshStopTimer = null;

function closeTemplateActionMenus() {
  document.querySelectorAll('.zt-card-actions-popover').forEach((menu) => menu.remove());
  document.querySelectorAll('.zt-btn-more[aria-expanded="true"]').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
  });
}

function positionTemplateActionMenu(menu, anchor) {
  if (!menu || !anchor) return;
  const gap = 8;
  const margin = 10;
  menu.style.visibility = 'hidden';
  menu.style.left = '0px';
  menu.style.top = '0px';
  document.body.appendChild(menu);

  const anchorRect = anchor.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const left = Math.max(margin, Math.min(window.innerWidth - menuRect.width - margin, anchorRect.right - menuRect.width));
  let top = anchorRect.bottom + gap;
  if (top + menuRect.height > window.innerHeight - margin) {
    top = Math.max(margin, anchorRect.top - menuRect.height - gap);
  }

  menu.style.left = `${Math.round(left)}px`;
  menu.style.top = `${Math.round(top)}px`;
  menu.style.visibility = 'visible';
}

function openTemplateActionMenu(anchor, template, access) {
  if (!anchor || !template) return;
  const wasOpen = anchor.getAttribute('aria-expanded') === 'true';
  closeTemplateActionMenus();
  if (wasOpen) return;

  const makeAction = (label, icon, handler, options = {}) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `zt-card-action-menu-item${options.danger ? ' is-danger' : ''}`;
    button.disabled = !!options.disabled;
    button.innerHTML = `<span class="zt-card-action-menu-icon" aria-hidden="true">${icon}</span><span>${label}</span>`;
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeTemplateActionMenus();
      if (!button.disabled && typeof handler === 'function') handler();
    };
    return button;
  };

  const menu = document.createElement('div');
  menu.className = 'zt-card-actions-popover';
  menu.setAttribute('role', 'menu');
  menu.appendChild(makeAction('Copy Email', '<svg viewBox="0 0 24 24"><path d="M22 2 11 13"></path><path d="m22 2-7 20-4-9-9-4Z"></path></svg>', () => initiateTemplateInsertion(template), { disabled: access.locked }));
  menu.appendChild(makeAction('Duplicate', '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="13" height="13" rx="2"></rect><path d="M4 16H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path></svg>', () => guardTemplateDuplicate(template, () => duplicateTemplate(template)), { disabled: access.locked }));
  menu.appendChild(makeAction('Export', '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5 5 5-5"></path><path d="M12 15V3"></path></svg>', () => guardPremiumAction(() => exportSingleTemplate(template)), { disabled: access.locked }));
  menu.appendChild(makeAction('Delete', '<svg viewBox="0 0 24 24"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>', () => renderDeleteView(template), { danger: true }));
  menu.onclick = (event) => event.stopPropagation();

  anchor.setAttribute('aria-expanded', 'true');
  positionTemplateActionMenu(menu, anchor);
}

function loadHeroPreference() {
  if (!chrome?.storage?.sync) return;
  chrome.storage.sync.get([ZT_HIDE_HERO_KEY], (result) => {
    ztHideHero = !!(result && result[ZT_HIDE_HERO_KEY]);
  });
}

loadHeroPreference();

function loadTemplateFilterPreference() {
  if (!chrome?.storage?.sync) return;
  chrome.storage.sync.get([ZT_TEMPLATE_FILTER_KEY, ZT_TIER_FILTER_KEY], (result) => {
    const stored = result ? (result[ZT_TEMPLATE_FILTER_KEY] || result[ZT_TIER_FILTER_KEY]) : null;
    if (stored === 'examples' || stored === 'custom' || stored === 'all') {
      activeTemplateFilter = stored;
    }
    const area = document.getElementById('zt-content-area');
    if (area && area.dataset.view === 'home') {
      const searchValue = area.querySelector('.zt-search')?.value || '';
      const filterSelect = area.querySelector('#zt-template-filter');
      if (filterSelect) filterSelect.value = activeTemplateFilter;
      renderListItems(searchValue, false);
    }
  });
}

loadTemplateFilterPreference();

function updateUsageCTA(billing) {
  const cta = document.getElementById('zt-usage-cta');
  if (!cta) return;
  if (!isBillingConfigured()) {
    cta.style.display = 'none';
    cta.innerHTML = '';
    return;
  }
  let state = billing || ztLastBillingState;
  if (!state || state.billingConfigured === false) {
    state = { isPremium: false, isTrial: false, daysLeft: 0, licenseStatus: 'free' };
  }
  const isExpired = state.licenseStatus === 'expired' || (state.licenseStatus === 'trial' && state.daysLeft <= 0);
  const isFree = state.licenseStatus === 'free' && !state.isTrial && !state.isPremium;
  if (!isFree && !isExpired) {
    cta.style.display = 'none';
    cta.innerHTML = '';
    return;
  }
  const used = getUserTemplateCount();
  const limit = ZT_FREE_TEMPLATE_LIMIT;
  const usedDisplay = Math.min(used, limit);
  const pct = limit ? Math.min(100, Math.round((usedDisplay / limit) * 100)) : 0;
  const ctaLabel = 'Say Thanks';
  cta.classList.toggle('is-limit', used >= limit);
  cta.innerHTML = `
    <div class="zt-usage-cta__copy">
      <div class="zt-usage-cta__title">Templates used</div>
      <div class="zt-usage-cta__count">${usedDisplay}/${limit}</div>
    </div>
    <div class="zt-usage-cta__bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
    <button class="zt-usage-cta__btn" id="zt-usage-cta-btn">${ctaLabel}</button>
  `;
  cta.style.display = 'inline-flex';
  const btn = cta.querySelector('#zt-usage-cta-btn');
  if (btn) {
    btn.onclick = () => {
      window.open(MAILPAW_SUPPORT_URL, '_blank', 'noopener');
    };
  }
}

function applyBillingStateToBanner(billing) {
  const banner = document.getElementById('zt-billing-banner');
  if (!banner) return;
  const intro = document.getElementById('zt-library-intro');
  const templateCount = getUserTemplateCount();
  updateUsageCTA(billing);
  if (!isBillingConfigured()) {
    banner.classList.remove('show');
    banner.innerHTML = '';
    if (intro) intro.classList.remove('has-banner');
    updateHeaderTrialButton(null);
    updateUsageCTA(null);
    return;
  }
  if (ztHideHero) {
    banner.classList.remove('show');
    banner.innerHTML = '';
    if (intro) intro.classList.remove('has-banner');
    return;
  }
  if (!billing || billing.billingConfigured === false) {
    billing = {
      isPremium: false,
      isTrial: false,
      daysLeft: 0,
      licenseStatus: 'free',
      planLabel: 'Free',
      billingConfigured: true
    };
  }
  if (billing.isPremium) {
    hideIntro(true);
    return;
  }
  if (billing.isTrial) {
    hideIntro(true);
    return;
  }
  const isExpired = billing.licenseStatus === 'expired' || (billing.licenseStatus === 'trial' && billing.daysLeft <= 0);
  const isFree = billing.licenseStatus === 'free';
  let title = '';
  let subtitle = '';
  let primaryLabel = '';
  let secondaryLabel = '';
  const benefits = billing.isTrial
    ? [
        'Unlimited templates during trial',
        'Export email-ready HTML',
        'Download templates as JSON',
        'Share templates with your team',
        'Customize blocks and styles'
      ]
    : (isFree
      ? [
          `Save ${ZT_FREE_TEMPLATE_LIMIT} custom templates free`,
          'Unlimited templates during trial',
          'Export email-ready HTML',
          'Download templates as JSON',
          'Customize blocks and styles'
        ]
      : [
          'Unlimited templates after purchase',
          'Export email-ready HTML',
          'Download templates as JSON',
          'Share templates with your team',
          'Customize blocks and styles'
        ]);
  const benefitsHtml = benefits.map((item) => `
    <div class="zt-billing-banner__benefit">
      <span class="zt-billing-banner__dot" aria-hidden="true"></span>
      <span>${item}</span>
    </div>
  `).join('');
  if (billing.isTrial) {
    title = `Trial active • ${billing.daysLeft} day${billing.daysLeft === 1 ? '' : 's'} left`;
    subtitle = 'MailPaw is free and unlimited.';
    primaryLabel = 'Say Thanks';
    secondaryLabel = '';
  } else if (isExpired) {
    title = 'MailPaw is free';
    subtitle = 'There is no trial, subscription, or paid plan.';
    primaryLabel = 'Say Thanks';
  } else if (isFree) {
    title = 'MailPaw is free';
    subtitle = 'Templates, imports, exports, style presets, and copies are unlimited.';
    primaryLabel = 'Say Thanks';
    secondaryLabel = '';
  }
  banner.classList.add('show');
  if (intro) intro.classList.add('has-banner');
  banner.innerHTML = `
    <div class="zt-billing-banner__copy">
      <div class="zt-billing-banner__title">${title}</div>
      <div class="zt-billing-banner__sub">${subtitle}</div>
      <div class="zt-billing-banner__benefits">${benefitsHtml}</div>
    </div>
    <div class="zt-billing-banner__actions">
      <button class="zt-banner-cta" id="zt-banner-cta">${primaryLabel}</button>
      ${secondaryLabel ? `<button class="zt-banner-link" id="zt-banner-link">${secondaryLabel}</button>` : ''}
    </div>
    <button class="zt-billing-dismiss" id="zt-billing-dismiss" aria-label="Dismiss">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;
  const primaryBtn = document.getElementById('zt-banner-cta');
  if (primaryBtn) {
    primaryBtn.onclick = () => {
      if (isFree && typeof openTrialPage === 'function') {
        openTrialPage(`${ZT_TRIAL_DAYS}-day`);
        return;
      }
      if (billing.isTrial || isExpired) {
        if (typeof openPaymentPage === 'function') openPaymentPage();
        return;
      }
      if (typeof openPaymentPage === 'function') openPaymentPage();
    };
  }
  const secondaryBtn = document.getElementById('zt-banner-link');
  if (secondaryBtn) {
    secondaryBtn.onclick = () => {
      if (billing.isTrial && typeof openBillingPortal === 'function') {
        openBillingPortal();
        return;
      }
      if (typeof openPaymentPage === 'function') openPaymentPage();
    };
  }
  const dismissBtn = document.getElementById('zt-billing-dismiss');
  if (dismissBtn) {
    dismissBtn.onclick = () => hideIntro(true);
  }
}

function refreshBillingUI(options = {}) {
  if (!isBillingConfigured()) {
    updateHeaderTrialButton(null);
    return;
  }
  const prevStatus = ztLastBillingState ? ztLastBillingState.licenseStatus : null;
  getBillingState((billing) => {
    const nextStatus = billing ? billing.licenseStatus : null;
    ztLastBillingState = billing || null;
    updateHeaderTrialButton(billing);
    applyBillingStateToBanner(billing);
    const statusChanged = prevStatus !== nextStatus;
    if ((statusChanged || options.forceListRefresh) && document.querySelector('.zt-list')) {
      const searchValue = document.querySelector('.zt-search')?.value || '';
      renderListItems(searchValue, false);
    }
  });
}

function startBillingRefreshPolling() {
  if (!isBillingConfigured()) return;
  const panel = document.getElementById('zt-panel');
  if (panel && !panel.classList.contains('open')) return;
  refreshBillingUI({ forceListRefresh: true });
  if (ztBillingRefreshTimer) clearInterval(ztBillingRefreshTimer);
  if (ztBillingRefreshStopTimer) clearTimeout(ztBillingRefreshStopTimer);
  ztBillingRefreshTimer = setInterval(() => {
    if (document.visibilityState && document.visibilityState !== 'visible') return;
    refreshBillingUI();
  }, 3000);
  ztBillingRefreshStopTimer = setTimeout(() => {
    if (ztBillingRefreshTimer) clearInterval(ztBillingRefreshTimer);
    ztBillingRefreshTimer = null;
  }, 60000);
}

function initBillingRefreshWatcher() {
  if (window.ztBillingRefreshBound) return;
  window.ztBillingRefreshBound = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshBillingUI({ forceListRefresh: true });
  });
  window.addEventListener('focus', () => refreshBillingUI({ forceListRefresh: true }));
  window.addEventListener('zt-billing-activity', () => startBillingRefreshPolling());
}

initBillingRefreshWatcher();

function getStylePresets() {
  if (typeof TEMPLATE_STYLE_PRESETS !== 'undefined' && Array.isArray(TEMPLATE_STYLE_PRESETS)) {
    return TEMPLATE_STYLE_PRESETS;
  }
  return [];
}

function setActiveStylePreset(preset, options = {}) {
  if (!preset) return;
  window.ztPrevStylePreset = window.ztStylePreset || null;
  ztActiveStylePresetId = preset.id;
  window.ztStylePreset = { ...preset };
  if (typeof window.buildStylePresetDefaults === 'function') {
    window.ztStylePresetDefaults = window.buildStylePresetDefaults(preset);
  }
  if (options.persist !== false && chrome?.storage?.sync) {
    chrome.storage.sync.set({ [ZT_STYLE_PRESET_KEY]: preset.id });
  }
  if (options.applyToEditor !== false) {
    const editorLayer = document.getElementById('zt-fs-layer');
    if (editorLayer && editorLayer.classList.contains('show') && typeof window.applyStylePresetToEditor === 'function') {
      window.applyStylePresetToEditor(preset, { force: options.force === true });
    }
  }
  updateStylePresetUI();
}

function updateHeaderTrialButton(billing) {
  const trialBtn = document.getElementById('zt-header-trial');
  const buyBtn = document.getElementById('zt-header-buy');
  if (!trialBtn && !buyBtn) return;
  if (!isBillingConfigured()) {
    if (trialBtn) trialBtn.style.display = 'none';
    if (buyBtn) buyBtn.style.display = 'none';
    return;
  }
  const state = billing || ztLastBillingState;
  const isFree = !!state && state.licenseStatus === 'free' && !state.isTrial && !state.isPremium;
  const isExpired = !!state && (state.licenseStatus === 'expired' || (state.licenseStatus === 'trial' && state.daysLeft <= 0));
  const showHeader = ztHideHero && (isFree || isExpired);
  if (trialBtn) {
    trialBtn.style.display = showHeader && isFree ? 'inline-flex' : 'none';
    if (showHeader && isFree) {
      trialBtn.onclick = () => {
        if (typeof openTrialPage === 'function') openTrialPage(`${ZT_TRIAL_DAYS}-day`);
      };
    }
  }
  if (buyBtn) {
    buyBtn.style.display = showHeader ? 'inline-flex' : 'none';
    if (showHeader) {
      buyBtn.onclick = () => {
        if (typeof openPaymentPage === 'function') openPaymentPage();
      };
    }
  }
}

function hideIntro(persist = true) {
  ztHideHero = true;
  if (persist && chrome?.storage?.sync) {
    chrome.storage.sync.set({ [ZT_HIDE_HERO_KEY]: true });
  }
  const heroEl = document.querySelector('.zt-hero');
  if (heroEl) heroEl.remove();
  const intro = document.getElementById('zt-library-intro');
  if (intro) {
    intro.classList.remove('has-hero', 'has-banner');
    intro.classList.add('is-hidden');
  }
  const banner = document.getElementById('zt-billing-banner');
  if (banner) {
    banner.classList.remove('show');
    banner.innerHTML = '';
  }
  updateHeaderTrialButton(ztLastBillingState);
}

function ensureStylePresetLoaded(cb) {
  if (ztStylePresetLoaded) {
    if (typeof cb === 'function') cb();
    return;
  }
  const presets = getStylePresets();
  const fallback = presets[0] || null;
  if (!chrome?.storage?.sync) {
    if (fallback) setActiveStylePreset(fallback, { persist: false });
    ztStylePresetLoaded = true;
    if (typeof cb === 'function') cb();
    return;
  }
  chrome.storage.sync.get([ZT_STYLE_PRESET_KEY], (result) => {
    const storedId = result ? result[ZT_STYLE_PRESET_KEY] : null;
    const selected = presets.find((preset) => preset.id === storedId) || fallback;
    if (selected) setActiveStylePreset(selected, { persist: false, applyToEditor: false });
    ztStylePresetLoaded = true;
    if (typeof cb === 'function') cb();
  });
}

function updateStylePresetUI() {
  const containers = Array.from(document.querySelectorAll('[data-style-presets]'));
  if (!containers.length) {
    const fallback = document.getElementById('zt-style-presets');
    if (fallback) containers.push(fallback);
  }
  containers.forEach((container) => {
    container.querySelectorAll('.zt-style-preset').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.presetId === ztActiveStylePresetId);
    });
  });
}

function renderStylePresets() {
  const containers = Array.from(document.querySelectorAll('[data-style-presets]'));
  if (!containers.length) {
    const fallback = document.getElementById('zt-style-presets');
    if (fallback) containers.push(fallback);
  }
  if (!containers.length) return;
  const presets = getStylePresets();
  const renderWithBilling = (billing) => {
    const allowAll = !isBillingConfigured() || (billing && (billing.isPremium || billing.isTrial));
    containers.forEach((container) => {
      if (!presets.length) {
        container.innerHTML = '';
        return;
      }
      container.innerHTML = presets.map((preset, index) => {
        const locked = !allowAll && index >= ZT_FREE_STYLE_PRESET_LIMIT;
        const tooltip = locked ? `${preset.name} • Pro` : preset.name;
        return `
          <button class="zt-style-preset${locked ? ' is-locked' : ''}" type="button" data-preset-id="${preset.id}" data-tooltip="${tooltip}" data-locked="${locked ? 'true' : 'false'}">
            <span class="zt-style-thumb" style="
              --preset-bg:${preset.bgEmail};
              --preset-ink:${preset.preview?.ink || preset.fontColor || '#0f172a'};
              --preset-accent:${preset.accent};
              --preset-accent-text:${preset.accentText || '#ffffff'};
              --preset-glow:${preset.preview?.glow || 'rgba(15, 23, 42, 0.08)'};
              --preset-link:${preset.linkColor || preset.accent};
              --preset-divider:${preset.dividerColor || '#e2e8f0'};
            ">
              <span class="zt-style-thumb-banner"></span>
              <span class="zt-style-thumb-card">
                <span class="zt-style-thumb-line"></span>
                <span class="zt-style-thumb-line short"></span>
                <span class="zt-style-thumb-button"></span>
              </span>
              <span class="zt-style-thumb-link"></span>
            </span>
            ${locked ? '<span class="zt-style-lock">Pro</span>' : ''}
          </button>
        `;
      }).join('');
      container.querySelectorAll('.zt-style-preset').forEach((btn) => {
        btn.onclick = () => {
          const isLocked = btn.dataset.locked === 'true';
          if (isLocked) {
            if (typeof renderUpgradeView === 'function') {
              renderUpgradeView(billing, { reason: 'style-presets' });
            } else if (typeof openPaymentPage === 'function') {
              openPaymentPage();
            }
            return;
          }
          const presetId = btn.dataset.presetId;
          const preset = presets.find((item) => item.id === presetId);
          if (preset) setActiveStylePreset(preset, { force: true });
        };
      });
    });
    updateStylePresetUI();
  };
  if (!isBillingConfigured()) {
    renderWithBilling({ isPremium: true, isTrial: true, licenseStatus: 'dev' });
    return;
  }
  if (ztLastBillingState) {
    renderWithBilling(ztLastBillingState);
    return;
  }
  getBillingState((billing) => renderWithBilling(billing));
}

function applyPanelFullscreen(panel, isFullscreen) {
  if (!panel) return;
  const enable = !!isFullscreen;
  if (enable) {
    panel.style.top = '0';
    panel.style.left = '0';
    panel.style.right = '0';
    panel.style.bottom = '0';
    panel.style.width = '100%';
    panel.style.height = '100%';
    panel.classList.add('fullscreen');
  }
}

function captureUpgradeReturnState() {
  const area = document.getElementById('zt-content-area');
  if (!area || area.dataset.view === 'upgrade') return;
  const view = area.dataset.view || 'home';
  const state = { view };
  if (view === 'home') {
    const search = area.querySelector('.zt-search')?.value || '';
    const scrollEl = area.querySelector('.zt-library-scroll');
    state.search = search;
    state.scrollTop = scrollEl ? scrollEl.scrollTop : 0;
    state.activeCategory = activeCategory;
    state.currentSort = currentSort;
    state.listViewMode = listViewMode;
    state.activeTemplateFilter = activeTemplateFilter;
  }
  ztUpgradeReturnState = state;
}

function restoreUpgradeReturnState() {
  const state = ztUpgradeReturnState;
  if (!state || state.view !== 'home') {
    renderHomeView(true);
    return;
  }
  activeCategory = state.activeCategory || 'All';
  currentSort = state.currentSort || 'createdAt_desc';
  listViewMode = state.listViewMode || 'thumb';
  activeTemplateFilter = (state.activeTemplateFilter === 'examples' || state.activeTemplateFilter === 'custom' || state.activeTemplateFilter === 'all')
    ? state.activeTemplateFilter
    : 'all';
  renderHomeView(false);
  const area = document.getElementById('zt-content-area');
  const searchInput = area ? area.querySelector('.zt-search') : null;
  if (searchInput) {
    searchInput.value = state.search || '';
  }
  renderListItems(state.search || '', false);
  const scrollEl = area ? area.querySelector('.zt-library-scroll') : null;
  if (scrollEl) {
    requestAnimationFrame(() => {
      scrollEl.scrollTop = state.scrollTop || 0;
    });
  }
}

function toggleSidebar(anchorBtn) {
  let panel = document.getElementById('zt-panel');
  if (!panel) {
    createPanel();
    panel = document.getElementById('zt-panel');
  }
  if (panel.classList.contains('open')) {
    panel.classList.remove('open');
  } else {
    listViewMode = getDefaultListViewMode();
    currentSort = 'createdAt_desc';
    renderHomeView(true);
    applyPanelFullscreen(panel, true);
    panel.classList.add('open');
  }
}

function getDefaultListViewMode() {
  const isStandalone = typeof window !== 'undefined' && window.ZT_STANDALONE;
  return isStandalone ? 'preview' : 'thumb';
}

function createPanel() {
  const panel = document.createElement('div');
  panel.id = 'zt-panel';
  panel.innerHTML = `
    <div class="zt-header">
      <div class="zt-header-top">
        <div class="zt-header-left">
          <div class="zt-logo">
            <span class="zt-logo-mark" aria-hidden="true">
              <img src="${getMailPawIconSrc()}" alt="">
            </span>
            <span class="zt-logo-text">MailPaw</span>
          </div>
        </div>
        <div class="zt-header-actions">
          <button class="zt-header-create" id="zt-create-template">New Template</button>
          <button class="zt-header-trial" id="zt-header-trial">Say Thanks</button>
          <button class="zt-header-buy" id="zt-header-buy">Say Thanks</button>
          <button class="zt-icon-btn" id="zt-btn-settings" data-tooltip="Actions">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="7" x2="20" y2="7"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="17" x2="20" y2="17"></line>
            </svg>
          </button>
          <button class="zt-close" id="zt-close-main" data-tooltip="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      <div class="zt-tabs" id="zt-tabs-container"></div>
      <div class="zt-settings-menu" id="zt-settings-menu">
        <div class="zt-menu-section zt-standalone-compose-only" ${typeof window !== 'undefined' && window.ZT_STANDALONE ? 'style="display:none"' : ''}>
          <div class="zt-menu-title">Create</div>
          <button class="zt-menu-item" id="zt-save-current">Save Current Email</button>
        </div>
        <div class="zt-menu-section">
          <div class="zt-menu-title">Backup & Import</div>
          <button class="zt-menu-item" id="zt-import">Import Templates</button>
          <button class="zt-menu-item" id="zt-export-all">Download Backup Copy</button>
          <button class="zt-menu-item" id="zt-export-cat">Export Current Category</button>
        </div>
        <div class="zt-menu-section">
          <div class="zt-menu-title">Included Templates</div>
          <button class="zt-menu-item" id="zt-restore-defaults">Restore Included Templates</button>
          <button class="zt-menu-item" id="zt-delete-included">Delete Included Templates</button>
        </div>
        <div class="zt-menu-section">
          <div class="zt-menu-title">Delete</div>
          <button class="zt-menu-item" id="zt-delete-all">Delete All Templates</button>
        </div>
        <div class="zt-menu-section">
          <div class="zt-menu-title">About</div>
          <button class="zt-menu-item" id="zt-billing">About MailPaw</button>
          <button class="zt-menu-item" id="zt-support">Say Thanks</button>
        </div>
        <input type="file" id="zt-file-input" accept=".json" style="display:none" />
      </div>
    </div>
    <div class="zt-content" id="zt-content-area"></div>
  `;
  document.body.appendChild(panel);
  
  panel.querySelector('#zt-close-main').onclick = () => panel.classList.remove('open');
  const createBtn = panel.querySelector('#zt-create-template');
  if (createBtn) createBtn.onclick = () => guardTemplateCreation(() => renderEditorView());
  const settingsBtn = document.getElementById('zt-btn-settings');
  const menu = document.getElementById('zt-settings-menu');
  settingsBtn.onclick = (e) => {
    e.stopPropagation();
    menu.classList.toggle('show');
  };
  
  document.getElementById('zt-save-current').onclick = () => {
    guardTemplateCreation(() => {
      if (activeComposeBody) {
        const subjectEl = locateSubject(activeComposeBody);
        const subject = subjectEl ? subjectEl.value : '';
        const body = activeComposeBody.innerHTML;
        openFullScreenEditor({
          title: '',
          subject: subject,
          body: body,
          category: activeCategory === 'All' ? '' : activeCategory,
          shortcut: ''
        });
        menu.classList.remove('show');
      } else {
        alert("Please click in an email compose window first to activate it.");
      }
    });
  };
  
  document.getElementById('zt-export-all').onclick = () => {
    menu.classList.remove('show');
    guardPremiumAction(() => exportTemplates(true));
  };
  document.getElementById('zt-export-cat').onclick = () => {
    menu.classList.remove('show');
    guardPremiumAction(() => exportTemplates(false));
  };
  document.getElementById('zt-restore-defaults').onclick = () => {
    menu.classList.remove('show');
    renderRestoreDefaultsView();
  };
  document.getElementById('zt-delete-included').onclick = () => {
    menu.classList.remove('show');
    renderDeleteIncludedTemplatesView();
  };
  document.getElementById('zt-delete-all').onclick = () => {
    menu.classList.remove('show');
    renderDeleteAllView();
  };
  document.getElementById('zt-support').onclick = () => {
    menu.classList.remove('show');
    window.open(MAILPAW_SUPPORT_URL, '_blank', 'noopener');
  };
  document.getElementById('zt-billing').onclick = () => { renderBillingView(); menu.classList.remove('show'); };
  const fileInput = document.getElementById('zt-file-input');
  document.getElementById('zt-import').onclick = () => {
    menu.classList.remove('show');
    guardPremiumAction(() => { fileInput.value = ''; fileInput.click(); });
  };
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (Array.isArray(imported)) { renderImportView(imported); menu.classList.remove('show'); } else alert("Invalid file.");
      } catch(err) { alert("Error parsing JSON."); }
    };
    reader.readAsText(file);
  };
}

function getCategories() {
  const cats = new Set();
  templates.forEach(t => { if (t.category) cats.add(t.category); });
  // Removed forced 'Personal' injection.
  // We only show what exists.
  const finalCats = Array.from(cats).sort();
  if (finalCats.length === 0) {
       // If absolutely no categories exist, we might want a default or just 'All'.
       // But user request was specific about 'Personal'.
       // Let's just return 'All'.
  }
  return ['All', ...finalCats];
}

function getTemplateTier(template) {
  return template && template.tier ? template.tier : 'free';
}

function getUserTemplateCount() {
  if (!Array.isArray(templates)) return 0;
  return templates.filter(t => !t.isDefault).length;
}

function canCreateTemplate(billing) {
  if (!isBillingConfigured()) return true;
  if (billing && (billing.isPremium || billing.isTrial)) return true;
  return getUserTemplateCount() < ZT_FREE_TEMPLATE_LIMIT;
}

function guardTemplateInsertion(template, onAllowed) {
  if (!template) return;
  if (!isBillingConfigured()) {
    if (typeof onAllowed === 'function') onAllowed();
    return;
  }
  const isExample = !!template.isDefault;
  if (!isExample) {
    if (typeof onAllowed === 'function') onAllowed();
    return;
  }
  getBillingState((billing) => {
    if (billing && (billing.isPremium || billing.isTrial)) {
      if (typeof onAllowed === 'function') onAllowed();
      return;
    }
    const existingCopy = templates.find((t) => !t.isDefault && t.sourceId === template.id);
    if (existingCopy) {
      if (typeof runTemplateInsertion === 'function') {
        runTemplateInsertion(existingCopy);
        return;
      }
      if (typeof onAllowed === 'function') onAllowed();
      return;
    }
    if (getUserTemplateCount() >= ZT_FREE_TEMPLATE_LIMIT) {
      if (typeof renderUpgradeView === 'function') {
        renderUpgradeView(billing, { reason: 'limit' });
      }
      return;
    }

    const saveAndInsert = () => {
      const now = Date.now();
      const newTemplate = {
        ...template,
        id: now.toString(),
        createdAt: now,
        updatedAt: now,
        isDefault: false,
        sourceId: template.id
      };
      templates.push(newTemplate);
      saveTemplatesToStorage(templates, () => {
        renderHomeView(true);
        if (typeof runTemplateInsertion === 'function') {
          runTemplateInsertion(newTemplate);
          return;
        }
        if (typeof onAllowed === 'function') onAllowed();
      });
    };

    if (typeof showModal !== 'function') {
      saveAndInsert();
      return;
    }

    const content = `
      <div style="color:#475569; font-size:13px; line-height:1.5;">
        To edit or copy this template, save a copy to your personal library.
        <div style="margin-top:12px; padding:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:12px; color:#64748b;">
          <strong>Free app:</strong> Templates are stored locally in this browser for privacy.
        </div>
      </div>
    `;
    showModal('Save to Library', content, () => {
      saveAndInsert();
      return true;
    });
    const modal = document.querySelector('.zt-modal-overlay');
    if (modal) {
      const submit = modal.querySelector('#modal-submit');
      const cancel = modal.querySelector('#modal-cancel');
      if (submit) submit.textContent = 'Save & Insert';
      if (cancel) cancel.textContent = 'Not now';
      const trialBtn = modal.querySelector('#zt-example-start-trial');
      if (trialBtn) {
        trialBtn.onclick = () => {
          modal.remove();
          if (typeof openTrialPage === 'function') {
            openTrialPage(`${ZT_TRIAL_DAYS}-day`);
            return;
          }
          if (typeof renderUpgradeView === 'function') {
            renderUpgradeView(billing, { reason: 'usage' });
          }
        };
      }
    }
  });
}

function guardTemplateDuplicate(template, onAllowed) {
  if (!template) return;
  guardTemplateAccess(template, () => guardTemplateCreation(onAllowed));
}

function guardTemplateCreation(onAllowed) {
  if (!isBillingConfigured()) {
    onAllowed();
    return;
  }
  getBillingState((billing) => {
    if (billing.isPremium || billing.isTrial) {
      onAllowed();
      return;
    }
    if (getUserTemplateCount() < ZT_FREE_TEMPLATE_LIMIT) {
      onAllowed();
      return;
    }
    renderUpgradeView(billing, { reason: 'limit' });
  });
}

function resolveTemplateAccess(template, billing) {
  const isExample = !!(template && template.isDefault);
  const tier = isExample ? 'example' : 'custom';
  return { tier, isExample, locked: false };
}

function guardTemplateAccess(template, onAllowed, onBlocked) {
  if (!template) return;
  if (typeof onAllowed === 'function') onAllowed();
}

function guardPremiumAction(onAllowed, options = {}) {
  if (!isBillingConfigured()) {
    onAllowed();
    return;
  }
  getBillingState((billing) => {
    if (billing.isPremium || billing.isTrial) {
      onAllowed();
      return;
    }
    renderUpgradeView(billing, options);
  });
}

function renderUpgradeView(billing, options = {}) {
  let title = 'MailPaw is Free';
  let message = 'There is no trial, subscription, or paid plan. If MailPaw helps, a small coffee thank-you is always appreciated.';
  if (options.reason === 'limit') {
    message = 'Template creation is free in this standalone app. If you hit a saved browser setting from an older version, restore defaults or import a backup, then keep going.';
  }
  if (options.reason === 'insert') {
    title = 'Copy Email Anywhere';
    message = 'MailPaw copies rich email content for email clients that accept formatted paste. Each email client handles pasted content differently, so send yourself a test before using a template for a real message.';
  }
  if (options.reason === 'pro-template') {
    title = 'Templates are Free';
    message = 'Included and custom templates are free to use, duplicate, export, and back up locally.';
  }
  if (options.reason === 'style-presets') {
    title = 'Style Presets are Free';
    message = 'MailPaw no longer has paid style presets. You can use the available presets and save your own template copies locally.';
  }
  if (options.reason === 'component-defaults') {
    title = 'Brand Defaults are Free';
    message = 'Default block styling is part of the free local builder. Your choices stay in this browser.';
  }
  if (options.reason === 'usage') {
    title = 'Keep Building for Free';
    message = 'MailPaw is free and local-first. Download backup copies of important templates so you control your work.';
  }
  const ctaLabel = 'Say Thanks';
  const showPlansLink = false;
  const showBuyOption = true;
  if (typeof showModal !== 'function') return;
  const content = `
    <div style="text-align:center;">
      <div style="width:56px; height:56px; margin:0 auto 16px; background:rgba(15, 23, 42, 0.08); border-radius:16px; display:flex; align-items:center; justify-content:center; color:#0f172a;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="11" width="16" height="9" rx="2"></rect>
          <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
        </svg>
      </div>
      <div style="color:#475569; font-size:14px; margin-bottom:14px;">${message}</div>
      ${showPlansLink ? '<button class="zt-link-btn" id="zt-upgrade-plans">Trial details</button>' : ''}
      ${showBuyOption ? `
        <div class="zt-upgrade-actions" style="margin-top:12px;">
          <button class="zt-btn-secondary" id="zt-upgrade-buy">Say Thanks</button>
        </div>
      ` : ''}
    </div>
  `;
  showModal(title, content, () => {
    window.open(MAILPAW_SUPPORT_URL, '_blank', 'noopener');
    return true;
  });
  const modal = document.querySelector('.zt-modal-overlay');
  if (modal) {
    const submit = modal.querySelector('#modal-submit');
    const cancel = modal.querySelector('#modal-cancel');
    if (submit) submit.textContent = ctaLabel;
    if (cancel) cancel.textContent = 'Not Now';
    const plansLink = modal.querySelector('#zt-upgrade-plans');
    if (plansLink) {
      plansLink.onclick = () => {
        if (typeof openPaymentPage === 'function') {
          openPaymentPage();
        } else {
          alert('Billing is not ready yet.');
        }
      };
    }
    const buyBtn = modal.querySelector('#zt-upgrade-buy');
    if (buyBtn) {
      buyBtn.onclick = () => {
        if (typeof openPaymentPage === 'function') {
          openPaymentPage();
        } else {
          alert('Billing is not ready yet.');
        }
      };
    }
  }
}

function renderBillingBanner() {
  const banner = document.getElementById('zt-billing-banner');
  if (!banner) return;
  const intro = document.getElementById('zt-library-intro');
  if (!isBillingConfigured()) {
    banner.classList.remove('show');
    banner.innerHTML = '';
    if (intro) intro.classList.remove('has-banner');
    updateHeaderTrialButton(null);
    return;
  }
  getBillingState((billing) => {
    ztLastBillingState = billing || null;
    updateHeaderTrialButton(billing);
    applyBillingStateToBanner(billing);
  });
}

function ensureTemplateFilterControl(area) {
  const container = area ? area.querySelector('.zt-search-container') : null;
  if (!container) return null;
  let filterSelect = container.querySelector('#zt-template-filter');
  if (!filterSelect) {
    filterSelect = document.createElement('select');
    filterSelect.id = 'zt-template-filter';
    filterSelect.className = 'zt-select';
    filterSelect.setAttribute('aria-label', 'Filter templates by type');
    filterSelect.innerHTML = `
      <option value="all">All templates</option>
      <option value="examples">Included</option>
      <option value="custom">My templates</option>
    `;
    const sortSelect = container.querySelector('#zt-sort-select');
    if (sortSelect && sortSelect.parentNode === container) {
      container.insertBefore(filterSelect, sortSelect);
    } else {
      container.appendChild(filterSelect);
    }
  }
  return filterSelect;
}

function bindHomeControls(area) {
  if (!area) return;
  const searchInput = area.querySelector('.zt-search');
  if (searchInput) {
    searchInput.placeholder = `Search in ${activeCategory}...`;
    searchInput.onkeyup = (e) => renderListItems(e.target.value, false);
  }
  const sortSelect = area.querySelector('#zt-sort-select');
  if (sortSelect) {
    sortSelect.value = currentSort;
    sortSelect.onchange = (e) => {
      currentSort = e.target.value;
      renderListItems(area.querySelector('.zt-search')?.value || '', false);
    };
  }
  const filterSelect = ensureTemplateFilterControl(area);
  if (filterSelect) {
    if (!['all', 'examples', 'custom'].includes(activeTemplateFilter)) activeTemplateFilter = 'all';
    filterSelect.value = activeTemplateFilter;
    filterSelect.onchange = (e) => {
      activeTemplateFilter = e.target.value;
      if (chrome?.storage?.sync) {
        chrome.storage.sync.set({ [ZT_TEMPLATE_FILTER_KEY]: activeTemplateFilter });
      }
      renderListItems(area.querySelector('.zt-search')?.value || '', false);
    };
  }
  area.querySelectorAll('.zt-view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === listViewMode);
    btn.onclick = () => {
      listViewMode = btn.dataset.view;
      if (chrome?.storage?.sync) {
        chrome.storage.sync.set({ listViewMode });
      }
      area.querySelectorAll('.zt-view-btn').forEach(b => b.classList.toggle('active', b === btn));
      const mobileViewSelect = area.querySelector('#zt-mobile-view-select');
      if (mobileViewSelect) mobileViewSelect.value = listViewMode;
      renderListItems(area.querySelector('.zt-search')?.value || '', false);
    };
  });
  const mobileViewSelect = area.querySelector('#zt-mobile-view-select');
  if (mobileViewSelect) {
    mobileViewSelect.value = listViewMode;
    mobileViewSelect.onchange = (e) => {
      listViewMode = e.target.value;
      if (chrome?.storage?.sync) {
        chrome.storage.sync.set({ listViewMode });
      }
      area.querySelectorAll('.zt-view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === listViewMode);
      });
      renderListItems(area.querySelector('.zt-search')?.value || '', false);
    };
  }
}

function renderHomeView(animate = false) {
  renderHomeViewInner(animate);
}

function renderHomeViewInner(animate = false) {
  const area = document.getElementById('zt-content-area');
  if(!area) return;
  area.dataset.view = 'home';
  const categories = getCategories();
  if (!categories.includes(activeCategory)) activeCategory = 'All';
  const tabContainer = document.getElementById('zt-tabs-container');
  tabContainer.innerHTML = categories.map(cat => `<button class="zt-tab ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">${cat}</button>`).join('');
  tabContainer.querySelectorAll('.zt-tab').forEach(btn => { btn.onclick = () => { activeCategory = btn.dataset.cat; renderHomeView(false); }; });

  if (!area.querySelector('.zt-list')) {
    area.innerHTML = `
      <div class="zt-library-scroll">
        <div class="zt-library-intro is-hidden" id="zt-library-intro">
          <div class="zt-billing-banner" id="zt-billing-banner" aria-live="polite"></div>
        </div>
        <div class="zt-search-container">
          <input type="text" class="zt-search" placeholder="Search in ${activeCategory}..." />
          <select id="zt-template-filter" class="zt-select" aria-label="Filter templates by type">
            <option value="all">All templates</option>
            <option value="examples">Included</option>
            <option value="custom">My templates</option>
          </select>
          <select id="zt-sort-select" class="zt-select">
            <option value="createdAt_desc">Newest</option>
            <option value="createdAt_asc">Oldest</option>
            <option value="title_asc">Name (A-Z)</option>
            <option value="title_desc">Name (Z-A)</option>
          </select>
          <select id="zt-mobile-view-select" class="zt-select zt-mobile-view-select" aria-label="Choose template view">
            <option value="preview">Masonry</option>
            <option value="thumb">Gallery</option>
            <option value="list">List</option>
          </select>
          <div class="zt-view-toggle" aria-label="View options">
            <button class="zt-view-btn ${listViewMode === 'list' ? 'active' : ''}" data-view="list" data-tooltip="List">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            </button>
            <button class="zt-view-btn ${listViewMode === 'preview' ? 'active' : ''}" data-view="preview" data-tooltip="Masonry">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="4" width="6" height="9" rx="1"></rect>
                <rect x="14" y="4" width="6" height="5" rx="1"></rect>
                <rect x="4" y="16" width="6" height="4" rx="1"></rect>
                <rect x="14" y="12" width="6" height="8" rx="1"></rect>
              </svg>
            </button>
            <button class="zt-view-btn ${listViewMode === 'thumb' ? 'active' : ''}" data-view="thumb" data-tooltip="Gallery">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="8" height="7" rx="1"></rect>
                <rect x="13" y="4" width="8" height="7" rx="1"></rect>
                <rect x="3" y="13" width="8" height="7" rx="1"></rect>
                <rect x="13" y="13" width="8" height="7" rx="1"></rect>
              </svg>
            </button>
          </div>
          <div class="zt-usage-cta" id="zt-usage-cta" aria-live="polite"></div>
        </div>
        <div class="zt-list"></div>
      </div>
    `;
    area.querySelector('.zt-search').onkeyup = (e) => renderListItems(e.target.value, false);
    const sortSelect = document.getElementById('zt-sort-select');
    if (sortSelect) {
      sortSelect.value = currentSort;
    }
  }
  bindHomeControls(area);
  const searchValue = area.querySelector('.zt-search')?.value || '';
  renderListItems(searchValue, animate);
  renderBillingBanner();
}

let ztPreviewScaleResizeTimer = null;

function getPreviewCanvasContentHeight(canvas) {
  if (!canvas) return 0;
  const children = Array.from(canvas.children || []);
  if (!children.length) return canvas.scrollHeight || 0;
  return children.reduce((height, child) => {
    const style = window.getComputedStyle ? window.getComputedStyle(child) : null;
    const marginTop = style ? parseFloat(style.marginTop) || 0 : 0;
    const marginBottom = style ? parseFloat(style.marginBottom) || 0 : 0;
    const childBottom = child.offsetTop + marginTop + Math.max(child.scrollHeight || 0, child.offsetHeight || 0) + marginBottom;
    return Math.max(height, childBottom);
  }, 0);
}

function schedulePreviewScaleUpdate() {
  const fallbackWidth = 600;
  requestAnimationFrame(() => {
    document.querySelectorAll('.zt-preview-frame').forEach((frame) => {
      const canvas = frame.querySelector('.zt-preview-canvas');
      const frameStyle = window.getComputedStyle ? window.getComputedStyle(frame) : null;
      const previewInset = frameStyle ? parseFloat(frameStyle.getPropertyValue('--preview-inset')) || 0 : 0;
      const frameWidth = Math.max(1, (frame.clientWidth || fallbackWidth) - (previewInset * 2));
      const frameHeight = Math.max(1, (frame.clientHeight || 200) - (previewInset * 2));
      const baseWidth = (canvas && canvas.scrollWidth)
        ? Math.max(fallbackWidth, canvas.scrollWidth)
        : fallbackWidth;
      const contentHeight = getPreviewCanvasContentHeight(canvas);
      const baseHeight = contentHeight || ((canvas && canvas.scrollHeight) ? canvas.scrollHeight : 800);
      const scaleByWidth = frameWidth / baseWidth;
      const scaleByHeight = frameHeight / baseHeight;
      const shouldShowFullPreview = document.body.classList.contains('zt-standalone')
        && frame.closest('.zt-list.view-preview');
      const shouldFitFullPreview = document.body.classList.contains('zt-standalone')
        && window.innerWidth <= 700
        && !shouldShowFullPreview;
      const scale = shouldShowFullPreview
        ? Math.min(1, scaleByWidth)
        : shouldFitFullPreview
        ? Math.min(1, scaleByWidth, Math.max(scaleByHeight * 1.43, scaleByWidth * 0.72))
        : Math.min(1, Math.max(scaleByWidth, scaleByHeight));
      const offsetX = shouldFitFullPreview ? Math.max(0, (frameWidth - (baseWidth * scale)) / 2) : 0;
      const renderedHeight = Math.max(160, Math.ceil(baseHeight * scale) + (previewInset * 2));
      frame.style.setProperty('--preview-base-width', `${baseWidth}px`);
      frame.style.setProperty('--preview-scale', scale.toFixed(4));
      frame.style.setProperty('--preview-offset-x', `${offsetX.toFixed(1)}px`);
      frame.style.setProperty('--preview-rendered-height', `${renderedHeight}px`);
    });
  });
}

function queuePreviewScaleUpdate() {
  clearTimeout(ztPreviewScaleResizeTimer);
  ztPreviewScaleResizeTimer = setTimeout(schedulePreviewScaleUpdate, 80);
}

if (!window.ztPreviewScaleResizeBound) {
  window.ztPreviewScaleResizeBound = true;
  window.addEventListener('resize', queuePreviewScaleUpdate);
  window.addEventListener('orientationchange', queuePreviewScaleUpdate);
}

function getIncludedTemplateOrder(template) {
  if (!template || !template.isDefault) return null;
  const explicitOrder = Number(template.defaultOrder);
  if (Number.isFinite(explicitOrder)) return explicitOrder;
  if (typeof MAILPAW_EXAMPLE_TEMPLATE_ORDER_INDEX !== 'undefined' && MAILPAW_EXAMPLE_TEMPLATE_ORDER_INDEX.has(template.id)) {
    return MAILPAW_EXAMPLE_TEMPLATE_ORDER_INDEX.get(template.id);
  }
  return Number.MAX_SAFE_INTEGER;
}

function renderListItems(filter = '', animate = true) {
  closeTemplateActionMenus();
  const list = document.querySelector('.zt-list');
  if(!list) return;
  list.innerHTML = '';
  if (!['list', 'thumb', 'preview'].includes(listViewMode)) listViewMode = getDefaultListViewMode();
  list.classList.remove('view-list', 'view-preview', 'view-thumb');
  list.classList.add(`view-${listViewMode}`);
  const isListView = listViewMode === 'list';
  const formatSubject = (value) => String(value || '').replace(/{{(.*?)}}/g, (_, name) => formatVariableLabel(name));
  const normalizeDateValue = (value) => {
    if (!value) return value;
    if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
    return value;
  };
  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(normalizeDateValue(value));
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };
  let didUpdateTimestamps = false;
  templates.forEach((t) => {
    if (!t.createdAt) { t.createdAt = Date.now(); didUpdateTimestamps = true; }
    if (!t.updatedAt) { t.updatedAt = t.createdAt; didUpdateTimestamps = true; }
  });
  if (didUpdateTimestamps) saveTemplatesToStorage(templates);
  let filtered = templates.filter(t => {
    const catMatch = activeCategory === 'All' || (t.category || '') === activeCategory;
    const haystack = `${t.title || ''} ${t.subject || ''} ${t.shortcut || ''}`.toLowerCase();
    const searchMatch = haystack.includes(filter.toLowerCase());
    const isExample = !!t.isDefault;
    const filterMatch = activeTemplateFilter === 'all'
      || (activeTemplateFilter === 'examples' ? isExample : !isExample);
    return catMatch && searchMatch && filterMatch;
  });
  filtered.sort((a, b) => {
    const includedOrderA = getIncludedTemplateOrder(a);
    const includedOrderB = getIncludedTemplateOrder(b);
    if (includedOrderA !== null && includedOrderB !== null && includedOrderA !== includedOrderB) {
      return includedOrderA - includedOrderB;
    }
    const [field, dir] = currentSort.split('_');
    let valA, valB;
    if (field === 'title') { valA = (a.title || '').toLowerCase(); valB = (b.title || '').toLowerCase(); } else { valA = a.createdAt || 0; valB = b.createdAt || 0; }
    if (valA < valB) return dir === 'asc' ? -1 : 1;
    if (valA > valB) return dir === 'asc' ? 1 : -1;
    return 0;
  });
  if (filtered.length === 0) {
    const filterLabel = activeTemplateFilter === 'all'
      ? 'templates'
      : (activeTemplateFilter === 'examples' ? 'included templates' : 'custom templates');
    const emptyLabel = activeCategory === 'All'
      ? `No ${filterLabel} match your filters.`
      : `No ${filterLabel} in "${activeCategory}".`;
    list.innerHTML = `<div style="text-align:center; color:#94a3b8; padding-top:40px; font-size:14px;">${emptyLabel}</div>`;
    return;
  }

  const renderWithBilling = (billing) => {
    let needsPreviewScale = false;
    filtered.forEach(t => {
      const access = resolveTemplateAccess(t, billing);
      access.billing = billing;
      const item = document.createElement('div');
      item.className = animate ? 'zt-item animate' : 'zt-item';
      if (access.locked) item.classList.add('locked');
      item.dataset.templateType = access.tier || 'custom';
      const textDiv = document.createElement('div');
      textDiv.className = 'zt-item-body';
      textDiv.style.flex = '1';
      const titleRow = document.createElement('div');
      titleRow.className = 'zt-item-title';
      const titleText = document.createElement('span');
      titleText.textContent = t.title || 'Untitled Template';
      titleRow.appendChild(titleText);
      if (t.shortcut && !(typeof window !== 'undefined' && window.ZT_STANDALONE)) {
        const badge = document.createElement('span');
        badge.className = 'zt-shortcut-badge';
        badge.textContent = t.shortcut;
        titleRow.appendChild(badge);
      }
      const templateBadge = document.createElement('span');
      const isExample = access.tier === 'example';
      templateBadge.className = `zt-template-badge ${isExample ? 'is-example' : 'is-custom'}`;
      templateBadge.textContent = isExample ? 'Included' : 'Custom';
      titleRow.appendChild(templateBadge);
      textDiv.appendChild(titleRow);
      if (isListView) {
        const metaRow = document.createElement('div');
        metaRow.className = 'zt-item-meta';
        const subject = t.subject ? formatSubject(t.subject) : '';
        if (subject) {
          const subjectEl = document.createElement('span');
          subjectEl.className = 'zt-item-subject';
          subjectEl.textContent = subject;
          metaRow.appendChild(subjectEl);
        }
        const createdAt = t.createdAt || 0;
        const updatedAt = t.updatedAt || createdAt;
        const createdLabel = createdAt ? `Created ${formatDate(createdAt)}` : '';
        const updatedLabel = updatedAt && updatedAt !== createdAt ? `Updated ${formatDate(updatedAt)}` : '';
        const dateLabel = updatedLabel || createdLabel;
        if (dateLabel) {
          const dateEl = document.createElement('span');
          dateEl.className = 'zt-item-date';
          dateEl.textContent = dateLabel;
          metaRow.appendChild(dateEl);
        }
        if (metaRow.childElementCount) textDiv.appendChild(metaRow);
      } else {
        const preview = document.createElement('div');
        preview.className = 'zt-item-preview';
        const previewData = buildTemplatePreviewData(t);
        const previewFrame = document.createElement('div');
        previewFrame.className = 'zt-preview-frame';
        previewFrame.style.backgroundColor = previewData.bgEmail || '#ffffff';
        const previewCanvas = document.createElement('div');
        previewCanvas.className = 'zt-preview-canvas';
        previewCanvas.innerHTML = previewData.html || '';
        previewCanvas.style.backgroundColor = previewData.bgEmail || '#ffffff';
        if (previewData.fontFamily) previewCanvas.style.fontFamily = previewData.fontFamily;
        if (previewData.fontColor) previewCanvas.style.color = previewData.fontColor;
        previewCanvas.querySelectorAll('img').forEach((img) => {
          img.addEventListener('load', schedulePreviewScaleUpdate, { once: true });
        });
        previewFrame.appendChild(previewCanvas);
        preview.appendChild(previewFrame);

        if (previewData.subject) {
          const previewText = document.createElement('div');
          previewText.className = 'zt-preview-text';
          previewText.textContent = previewData.subject;
          preview.appendChild(previewText);
        }
        textDiv.appendChild(preview);
        needsPreviewScale = true;
      }
      textDiv.onclick = () => openTemplatePreview(t, access);
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'zt-actions';
      const useExpandedListActions = isListView
        && typeof window !== 'undefined'
        && window.ZT_STANDALONE;
      const labelListAction = (button, label) => {
        if (!useExpandedListActions || !button) return;
        button.classList.add('zt-action-labeled');
        button.setAttribute('aria-label', label);
        button.innerHTML = `${button.innerHTML}<span class="zt-action-label">${label}</span>`;
      };

      const previewBtn = document.createElement('button');
      previewBtn.className = 'zt-action-btn zt-btn-preview';
      previewBtn.setAttribute('data-tooltip', 'Preview template');
      previewBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      labelListAction(previewBtn, 'Preview');
      previewBtn.onclick = (e) => { e.stopPropagation(); openTemplatePreview(t, access); };

      const insertBtn = document.createElement('button');
      const insertIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
      const copyActionLabel = (typeof window !== 'undefined' && window.ZT_STANDALONE) ? 'Copy Email' : 'Copy HTML';
      if (isListView) {
        insertBtn.className = 'zt-action-btn zt-btn-insert';
        insertBtn.setAttribute('data-tooltip', copyActionLabel);
        insertBtn.innerHTML = insertIcon;
        labelListAction(insertBtn, copyActionLabel);
      } else {
        insertBtn.className = 'zt-insert-btn';
        insertBtn.innerHTML = `<span class="zt-btn-icon">${insertIcon}</span><span class="zt-btn-label">${copyActionLabel}</span>`;
      }
      insertBtn.onclick = (e) => {
        e.stopPropagation();
        initiateTemplateInsertion(t, insertBtn);
      };
      if (access.locked) insertBtn.disabled = true;
      let insertWrap = null;
      if (!isListView) {
        insertWrap = document.createElement('div');
        insertWrap.className = 'zt-item-insert';
        insertWrap.appendChild(insertBtn);
      }

      const editBtn = document.createElement('button');
      editBtn.className = 'zt-action-btn zt-btn-edit';
      editBtn.setAttribute('data-tooltip', 'Edit');
      editBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`;
      labelListAction(editBtn, 'Edit');
      editBtn.onclick = (e) => { e.stopPropagation(); guardTemplateAccess(t, () => renderEditorView(t)); };
      if (access.locked) editBtn.disabled = true;

      const duplicateBtn = document.createElement('button');
      duplicateBtn.className = 'zt-action-btn zt-btn-duplicate';
      duplicateBtn.setAttribute('data-tooltip', 'Duplicate');
      duplicateBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      labelListAction(duplicateBtn, 'Duplicate');
      duplicateBtn.onclick = (e) => { e.stopPropagation(); guardTemplateDuplicate(t, () => duplicateTemplate(t)); };
      if (access.locked) duplicateBtn.disabled = true;

      const delBtn = document.createElement('button');
      delBtn.className = 'zt-action-btn zt-btn-delete';
      delBtn.setAttribute('data-tooltip', 'Delete');
      delBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7c-1 0-2-1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
      labelListAction(delBtn, 'Delete');
      delBtn.onclick = (e) => { e.stopPropagation(); renderDeleteView(t); };

      const downBtn = document.createElement('button');
      downBtn.className = 'zt-action-btn zt-btn-download';
      downBtn.setAttribute('data-tooltip', 'Export');
      downBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
      labelListAction(downBtn, 'Export');
      downBtn.onclick = (e) => { e.stopPropagation(); guardPremiumAction(() => exportSingleTemplate(t)); };
      if (access.locked) downBtn.disabled = true;

      const moreBtn = document.createElement('button');
      moreBtn.className = 'zt-action-btn zt-btn-more';
      moreBtn.setAttribute('data-tooltip', 'More actions');
      moreBtn.setAttribute('aria-label', 'More template actions');
      moreBtn.setAttribute('aria-haspopup', 'menu');
      moreBtn.setAttribute('aria-expanded', 'false');
      moreBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle></svg>`;
      moreBtn.onclick = (e) => {
        e.stopPropagation();
        openTemplateActionMenu(moreBtn, t, access);
      };

      actionsDiv.appendChild(previewBtn);
      actionsDiv.appendChild(editBtn);
      if (useExpandedListActions) {
        actionsDiv.appendChild(duplicateBtn);
        actionsDiv.appendChild(downBtn);
        actionsDiv.appendChild(delBtn);
      } else if (window.ZT_STANDALONE) {
        actionsDiv.appendChild(moreBtn);
      } else {
        actionsDiv.appendChild(duplicateBtn);
        actionsDiv.appendChild(delBtn);
        actionsDiv.appendChild(downBtn);
      }
      if (isListView) actionsDiv.appendChild(insertBtn);
      item.appendChild(textDiv);
      item.appendChild(actionsDiv);
      if (insertWrap) item.appendChild(insertWrap);
      list.appendChild(item);
    });
    if (needsPreviewScale) schedulePreviewScaleUpdate();
  };

  if (isBillingConfigured()) {
    getBillingState((billing) => renderWithBilling(billing));
  } else {
    renderWithBilling({ isPremium: true, isTrial: true, licenseStatus: 'dev' });
  }
}

function renderEditorView(templateToEdit = null) {
  openFullScreenEditor(templateToEdit);
}

function renderDeleteView(t) {
  if (!t || typeof showModal !== 'function') return;
  const escapeHtml = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeTitle = escapeHtml(t.title || 'Untitled Template');
  const content = `
    <div class="zt-danger-text" style="margin-bottom:8px;">
      Are you sure you want to delete <strong>"${safeTitle}"</strong>?
    </div>
    <div style="font-size:12px; color:#94a3b8;">This cannot be undone.</div>
  `;
  showModal('Delete Template?', content, () => {
    templates = templates.filter(temp => temp.id !== t.id);
    saveTemplatesToStorage(templates);
    renderHomeView(true);
    return true;
  });
  const modal = document.querySelector('.zt-modal-overlay');
  if (modal) {
    const submit = modal.querySelector('#modal-submit');
    const cancel = modal.querySelector('#modal-cancel');
    if (submit) {
      submit.textContent = 'Delete';
      submit.classList.remove('zt-btn-save');
      submit.classList.add('zt-btn-danger');
    }
    if (cancel) cancel.textContent = 'Cancel';
  }
}

function getDefaultTemplatesSnapshot() {
  if (typeof buildDefaultTemplatesFromSpecs !== 'function') return [];
  const specs = (typeof DEFAULT_TEMPLATE_SPECS !== 'undefined') ? DEFAULT_TEMPLATE_SPECS : [];
  return buildDefaultTemplatesFromSpecs(specs);
}

function renderRestoreDefaultsView() {
  if (typeof showModal !== 'function') return;
  const defaults = getDefaultTemplatesSnapshot();
  if (!defaults.length) {
    alert('Included templates are unavailable right now.');
    return;
  }
  const content = `
    <div class="zt-danger-text" style="margin-bottom:8px;">
      Restore the ${defaults.length} included templates?
    </div>
    <div style="font-size:12px; color:#94a3b8;">They will return in the original MailPaw order. Your saved templates stay in place.</div>
  `;
  showModal('Restore Included Templates', content, () => {
    const defaultIds = new Set(defaults.map(t => t.id));
    const customTemplates = Array.isArray(templates) ? templates.filter(t => !defaultIds.has(t.id)) : [];
    templates = defaults.concat(customTemplates);
    saveTemplatesToStorage(templates);
    chrome.storage.sync.set({ hideDefaultTemplates: false });
    renderHomeView(true);
    return true;
  });
  const modal = document.querySelector('.zt-modal-overlay');
  if (modal) {
    const submit = modal.querySelector('#modal-submit');
    const cancel = modal.querySelector('#modal-cancel');
    if (submit) submit.textContent = 'Restore Included';
    if (cancel) cancel.textContent = 'Cancel';
  }
}

function renderDeleteIncludedTemplatesView() {
  if (typeof showModal !== 'function') return;
  const defaults = getDefaultTemplatesSnapshot();
  const defaultIds = new Set(defaults.map(t => t.id));
  const includedCount = Array.isArray(templates)
    ? templates.filter(t => t && (t.isDefault || defaultIds.has(t.id))).length
    : 0;
  const countLabel = includedCount === 1 ? '1 included template' : `${includedCount} included templates`;
  const content = `
    <div class="zt-danger-text" style="margin-bottom:8px;">
      Delete ${countLabel} from your library?
    </div>
    <div style="font-size:12px; color:#94a3b8;">Your saved templates stay in place. You can restore the included templates later from Actions.</div>
  `;
  showModal('Delete Included Templates?', content, () => {
    templates = Array.isArray(templates)
      ? templates.filter(t => t && !(t.isDefault || defaultIds.has(t.id)))
      : [];
    saveTemplatesToStorage(templates);
    chrome.storage.sync.set({ hideDefaultTemplates: true });
    renderHomeView(true);
    return true;
  });
  const modal = document.querySelector('.zt-modal-overlay');
  if (modal) {
    const submit = modal.querySelector('#modal-submit');
    const cancel = modal.querySelector('#modal-cancel');
    if (submit) {
      submit.textContent = 'Delete Included';
      submit.classList.remove('zt-btn-save');
      submit.classList.add('zt-btn-danger');
    }
    if (cancel) cancel.textContent = 'Cancel';
  }
}

function renderDeleteAllView() {
  if (typeof showModal !== 'function') return;
  const totalCount = Array.isArray(templates) ? templates.length : 0;
  const countLabel = totalCount === 1 ? '1 template' : `${totalCount} templates`;
  const content = `
    <div class="zt-danger-text" style="margin-bottom:8px;">
      Delete all ${countLabel} from your library?
    </div>
    <div style="font-size:12px; color:#94a3b8;">This removes defaults and imported templates too. Download a backup copy first if you want to keep them.</div>
  `;
  showModal('Delete All Templates?', content, () => {
    templates = [];
    saveTemplatesToStorage(templates);
    chrome.storage.sync.set({ hideDefaultTemplates: true });
    renderHomeView(true);
    return true;
  });
  const modal = document.querySelector('.zt-modal-overlay');
  if (modal) {
    const submit = modal.querySelector('#modal-submit');
    const cancel = modal.querySelector('#modal-cancel');
    if (submit) {
      submit.textContent = 'Delete All';
      submit.classList.remove('zt-btn-save');
      submit.classList.add('zt-btn-danger');
    }
    if (cancel) cancel.textContent = 'Cancel';
  }
}

function renderImportView(importedData) {
  if (!Array.isArray(importedData) || typeof showModal !== 'function') return;
  const escapeHtml = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const categories = getCategories().filter(c => c !== 'All');
  const options = `<option value="__ORIGINAL__">Keep Original Categories</option>` +
    categories.map(c => `<option value="${escapeHtml(c)}">Import into "${escapeHtml(c)}"</option>`).join('') +
    `<option value="__NEW__">+ Create New Category...</option>`;
  const content = `
    <div style="margin-bottom:12px; color:#64748b; font-size:13px;">
      Found <strong>${importedData.length}</strong> templates.
    </div>
    <div style="text-align:left;">
      <label class="zt-label">Destination Category</label>
      <select id="zt-import-cat" class="zt-input-select">${options}</select>
      <div id="zt-new-cat-wrapper" style="display:none; margin-top:10px;">
        <label class="zt-label">New Category Name</label>
        <input type="text" id="zt-new-cat-name" class="zt-input-title" placeholder="e.g. Marketing" />
      </div>
    </div>
  `;
  showModal('Import Templates', content, () => {
    const modal = document.querySelector('.zt-modal-overlay');
    if (!modal) return false;
    const dropdown = modal.querySelector('#zt-import-cat');
    if (!dropdown) return false;
    let targetCat = dropdown.value;
    if (targetCat === '__NEW__') {
      const newName = modal.querySelector('#zt-new-cat-name')?.value.trim();
      if (!newName) {
        alert('Please enter a category name.');
        return false;
      }
      targetCat = newName;
    }
    const existingIds = new Set(templates.map(t => t.id));
    importedData.forEach(t => {
      if (targetCat !== '__ORIGINAL__') t.category = targetCat;
      if (!t.category) t.category = 'Imported';
      if (!t.createdAt) t.createdAt = Date.now();
      if (!t.updatedAt) t.updatedAt = t.createdAt;
      if (!t.id || existingIds.has(t.id)) t.id = generateTemplateId();
      existingIds.add(t.id);
      templates.push(t);
    });
    saveTemplatesToStorage(templates);
    renderHomeView(true);
    return true;
  });
  const modal = document.querySelector('.zt-modal-overlay');
  if (modal) {
    const submit = modal.querySelector('#modal-submit');
    const cancel = modal.querySelector('#modal-cancel');
    if (submit) submit.textContent = 'Import';
    if (cancel) cancel.textContent = 'Cancel';
    const dropdown = modal.querySelector('#zt-import-cat');
    const newCatWrapper = modal.querySelector('#zt-new-cat-wrapper');
    if (dropdown && newCatWrapper) {
      dropdown.onchange = () => {
        if (dropdown.value === '__NEW__') {
          newCatWrapper.style.display = 'block';
          modal.querySelector('#zt-new-cat-name')?.focus();
        } else {
          newCatWrapper.style.display = 'none';
        }
      };
    }
  }
}

function renderBillingView() {
  if (typeof showModal !== 'function') return;
  showModal('MailPaw is Free', `
    <div style="color:#475569; font-size:14px; line-height:1.5;">
      MailPaw has no trial, subscription, template limit, export limit, or paid plan.
      Templates are stored locally in this browser on this computer for privacy. MailPaw does not need an account or cloud library to hold your email content.
      Download backup copies from the Actions menu so you can restore them later or move them to another browser.
      MailPaw copies rich email content for email clients that accept formatted paste. Each email client handles pasted content differently, so send yourself a test before using a template for a real message.
      <div style="margin-top:14px;">
        MailPaw is open source on <a href="${MAILPAW_REPO_URL}" target="_blank" rel="noopener" style="color:#111827; font-weight:700;">GitHub</a>.
        If MailPaw helped you, feel free to <a href="${MAILPAW_SUPPORT_URL}" target="_blank" rel="noopener" style="color:#111827; font-weight:700;">leave a coffee thank-you</a>.
      </div>
    </div>
  `, () => true);
  const modal = document.querySelector('.zt-modal-overlay');
  if (!modal) return;
  const submit = modal.querySelector('#modal-submit');
  const cancelBtn = modal.querySelector('#modal-cancel');
  if (submit) submit.textContent = 'OK';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

function buildTemplatePreviewData(template) {
  const previewWrapper = document.createElement('div');
  previewWrapper.innerHTML = template.body || '';
  previewWrapper.querySelectorAll('script, style, meta, link').forEach((el) => el.remove());

  const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22480%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23e2e8f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%2394a3b8%22 font-family=%22Arial%2C%20sans-serif%22 font-size=%2232%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage%3C/text%3E%3C/svg%3E';
  const varRegex = /{{(.*?)}}/g;
  const replaceVars = (value) => String(value || '').replace(varRegex, (_, name) => {
    const label = formatVariableLabel(name);
    return shouldAutoFillVariable(name) ? getAutoVariableValue(name, label) : label;
  });

  previewWrapper.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!src || src.includes('{{')) img.setAttribute('src', placeholderSvg);
  });

  previewWrapper.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes || []).forEach((attr) => {
      if (!attr.value || !attr.value.includes('{{')) return;
      if (attr.name === 'href') {
        el.setAttribute(attr.name, '#');
        return;
      }
      if (attr.name === 'src' && el.tagName === 'IMG') {
        el.setAttribute(attr.name, placeholderSvg);
        return;
      }
      el.setAttribute(attr.name, replaceVars(attr.value));
    });
  });

  const walker = document.createTreeWalker(previewWrapper, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue && node.nodeValue.includes('{{')) {
      node.nodeValue = replaceVars(node.nodeValue);
    }
    node = walker.nextNode();
  }

  return {
    html: previewWrapper.innerHTML,
    subject: replaceVars(template.subject || ''),
    bgEmail: template.bgEmail || '#ffffff',
    fontFamily: template.fontFamily || '',
    fontColor: template.fontColor || ''
  };
}

function copyTextToClipboard(text, onSuccess, onError) {
  const done = typeof onSuccess === 'function' ? onSuccess : () => {};
  const fail = typeof onError === 'function' ? onError : () => {};
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch((err) => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (success) done(); else fail(err);
      } catch (fallbackErr) {
        fail(fallbackErr);
      }
    });
    return;
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (success) done(); else fail(new Error('Copy failed'));
  } catch (err) {
    fail(err);
  }
}

function htmlToClipboardPlainText(html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html || '';
  wrapper.querySelectorAll('script, style, meta, link').forEach((el) => el.remove());
  wrapper.querySelectorAll('br').forEach((br) => br.replaceWith(document.createTextNode('\n')));
  wrapper.querySelectorAll('p, div, table, tr, h1, h2, h3, h4, h5, h6, blockquote, li').forEach((el) => {
    el.appendChild(document.createTextNode('\n'));
  });
  return (wrapper.textContent || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sanitizeClipboardHtml(html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html || '';
  wrapper.querySelectorAll('script').forEach((el) => el.remove());
  return wrapper.innerHTML;
}

function makeClipboardEmailMobileSafe(html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html || '';

  wrapper.querySelectorAll('table.mp-container').forEach((table) => {
    table.style.width = '100%';
    table.style.maxWidth = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.tableLayout = 'auto';
    table.style.display = 'block';
  });

  wrapper.querySelectorAll('table.mp-container tbody, table.mp-container tr').forEach((el) => {
    el.style.display = 'block';
    el.style.width = '100%';
    el.style.maxWidth = '100%';
  });

  wrapper.querySelectorAll('td.mp-stack').forEach((col) => {
    col.style.display = 'block';
    col.style.width = '100%';
    col.style.maxWidth = '100%';
    col.style.boxSizing = 'border-box';
    col.style.padding = col.style.padding || '10px';
    col.style.verticalAlign = 'top';
  });

  wrapper.querySelectorAll('td.mp-stack + td.mp-stack').forEach((col) => {
    col.style.paddingTop = col.style.paddingTop || '14px';
  });

  wrapper.querySelectorAll('img.mp-fluid').forEach((img) => {
    img.style.width = img.style.width || '100%';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
  });

  return wrapper.innerHTML;
}

function fallbackCopyRichHtml(html, plainText, onSuccess, onError) {
  const done = typeof onSuccess === 'function' ? onSuccess : () => {};
  const fail = typeof onError === 'function' ? onError : () => {};
  let host = null;
  try {
    host = document.createElement('div');
    host.setAttribute('contenteditable', 'true');
    host.setAttribute('aria-hidden', 'true');
    host.style.position = 'fixed';
    host.style.left = '-10000px';
    host.style.top = '0';
    host.style.width = '640px';
    host.style.background = '#ffffff';
    host.style.opacity = '0';
    host.innerHTML = html || plainText || '';
    document.body.appendChild(host);

    const selection = window.getSelection ? window.getSelection() : null;
    const range = document.createRange();
    range.selectNodeContents(host);
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    const success = document.execCommand && document.execCommand('copy');
    if (selection) selection.removeAllRanges();
    document.body.removeChild(host);
    if (success) {
      done();
      return;
    }
    copyTextToClipboard(html || plainText || '', done, fail);
  } catch (err) {
    if (host && host.parentNode) host.parentNode.removeChild(host);
    copyTextToClipboard(html || plainText || '', done, () => fail(err));
  }
}

function copyRichEmailToClipboard(html, onSuccess, onError) {
  const cleanHtml = makeClipboardEmailMobileSafe(sanitizeClipboardHtml(
    typeof sanitizeTemplateHtml === 'function' ? sanitizeTemplateHtml(html || '') : (html || '')
  ));
  const plainText = htmlToClipboardPlainText(cleanHtml);
  const done = typeof onSuccess === 'function' ? onSuccess : () => {};
  const fail = typeof onError === 'function' ? onError : () => {};

  if (navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem !== 'undefined') {
    const item = new ClipboardItem({
      'text/html': new Blob([cleanHtml], { type: 'text/html' }),
      'text/plain': new Blob([plainText], { type: 'text/plain' })
    });
    navigator.clipboard.write([item])
      .then(done)
      .catch(() => fallbackCopyRichHtml(cleanHtml, plainText, done, fail));
    return;
  }

  fallbackCopyRichHtml(cleanHtml, plainText, done, fail);
}

function openTemplatePreview(template, access = {}) {
  const existing = document.getElementById('zt-preview-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'zt-preview-overlay';
  overlay.className = 'zt-preview-overlay';
  overlay.tabIndex = -1;
  const isLocked = !!access.locked;

  const escapeHtml = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeTitle = escapeHtml(template.title || 'Untitled Template');
  const subject = template.subject ? escapeHtml(template.subject) : '';
  const isExample = !!template.isDefault;
  const badgeLabel = isExample ? 'Included' : 'Custom';
  const badgeClass = `zt-preview-badge ${isExample ? 'is-example' : 'is-custom'}${isLocked ? ' locked' : ''}`;
  overlay.innerHTML = `
    <div class="zt-preview-card">
      <div class="zt-preview-header">
        <div class="zt-preview-meta">
          <div class="zt-preview-title-row">
            <div class="zt-preview-title">${safeTitle}</div>
            <span class="${badgeClass}">${badgeLabel}</span>
          </div>
          ${subject ? `<div class="zt-preview-subject">${subject}</div>` : ''}
        </div>
        <div class="zt-preview-actions">
          <button class="zt-icon-btn" id="zt-preview-toggle" data-tooltip="Toggle full screen">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
          <button class="zt-icon-btn" id="zt-preview-close" data-tooltip="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="zt-preview-body">
        <div class="zt-preview-email"></div>
      </div>
      <div class="zt-preview-footer">
        <div class="zt-preview-footer-actions">
          <button class="zt-btn-secondary" id="zt-preview-edit">
            <span class="zt-btn-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </span>
            <span class="zt-btn-label">Edit</span>
          </button>
          <button class="zt-btn-secondary" id="zt-preview-duplicate">
            <span class="zt-btn-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </span>
            <span class="zt-btn-label">Duplicate</span>
          </button>
          <button class="zt-btn-cancel" id="zt-preview-delete">
            <span class="zt-btn-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7c-1 0-2-1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </span>
            <span class="zt-btn-label">Delete</span>
          </button>
          <button class="zt-btn-secondary" id="zt-preview-export">
            <span class="zt-btn-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </span>
            <span class="zt-btn-label">Export</span>
          </button>
        </div>
        <div class="zt-preview-footer-actions">
          <button class="zt-btn-secondary" id="zt-preview-copy">
            <span class="zt-btn-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </span>
            <span class="zt-btn-label">Copy HTML</span>
          </button>
          <button class="zt-btn-save" id="zt-preview-insert">
            <span class="zt-btn-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 2L11 13"></path>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </span>
            <span class="zt-btn-label">${(typeof window !== 'undefined' && window.ZT_STANDALONE) ? 'Copy Email' : 'Copy HTML'}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  if (window.ZT_STANDALONE) {
    const copyButton = overlay.querySelector('#zt-preview-copy');
    if (copyButton) copyButton.remove();
    const footerGroups = overlay.querySelectorAll('.zt-preview-footer-actions');
    if (footerGroups[1]) footerGroups[1].classList.add('zt-preview-primary-actions');

    const shouldUseCompactActions = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    const footerActions = overlay.querySelector('.zt-preview-footer-actions');
    const secondaryButtons = shouldUseCompactActions ? [
      overlay.querySelector('#zt-preview-duplicate'),
      overlay.querySelector('#zt-preview-export'),
      overlay.querySelector('#zt-preview-delete')
    ].filter(Boolean) : [];
    if (shouldUseCompactActions && footerActions && secondaryButtons.length) {
      const details = document.createElement('details');
      details.className = 'zt-preview-more';
      details.innerHTML = `
        <summary class="zt-btn-secondary">
          <span class="zt-btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.8"></circle>
              <circle cx="12" cy="12" r="1.8"></circle>
              <circle cx="19" cy="12" r="1.8"></circle>
            </svg>
          </span>
          <span class="zt-btn-label">More</span>
        </summary>
        <div class="zt-preview-more-menu"></div>
      `;
      const menu = details.querySelector('.zt-preview-more-menu');
      secondaryButtons.forEach((button) => menu.appendChild(button));
      footerActions.appendChild(details);
    }
  }
  requestAnimationFrame(() => overlay.classList.add('show'));
  setTimeout(() => overlay.focus(), 50);

  const email = overlay.querySelector('.zt-preview-email');
  const html = typeof sanitizeTemplateHtml === 'function' ? sanitizeTemplateHtml(template.body || '') : (template.body || '');
  email.innerHTML = html;
  if (template.bgEmail) email.style.backgroundColor = template.bgEmail;
  if (template.fontFamily) email.style.fontFamily = template.fontFamily;
  if (template.fontColor) email.style.color = template.fontColor;

  const closePreview = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 150);
  };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePreview(); });
  overlay.querySelector('#zt-preview-close').onclick = closePreview;
  overlay.querySelector('#zt-preview-toggle').onclick = () => overlay.classList.toggle('fullscreen');

  const setButtonLabel = (button, text) => {
    if (!button) return;
    const label = button.querySelector('.zt-btn-label');
    if (label) {
      label.textContent = text;
    } else {
      button.textContent = text;
    }
  };

  const getButtonLabel = (button) => {
    if (!button) return '';
    const label = button.querySelector('.zt-btn-label');
    return label ? label.textContent : button.textContent;
  };

  const editBtn = overlay.querySelector('#zt-preview-edit');
  if (editBtn) {
    if (isLocked) editBtn.disabled = true;
    editBtn.onclick = () => {
      closePreview();
      if (typeof guardTemplateAccess === 'function') {
        guardTemplateAccess(template, () => renderEditorView(template));
      } else {
        renderEditorView(template);
      }
    };
  }

  const duplicateBtn = overlay.querySelector('#zt-preview-duplicate');
  if (duplicateBtn) {
    if (isLocked) duplicateBtn.disabled = true;
    duplicateBtn.onclick = () => {
      closePreview();
      if (typeof guardTemplateDuplicate === 'function') {
        guardTemplateDuplicate(template, () => duplicateTemplate(template));
        return;
      }
      duplicateTemplate(template);
    };
  }

  const exportBtn = overlay.querySelector('#zt-preview-export');
  if (exportBtn) {
    if (isLocked) exportBtn.disabled = true;
    exportBtn.onclick = () => {
      const runExport = () => exportSingleTemplate(template);
      if (typeof guardPremiumAction === 'function') {
        guardPremiumAction(runExport);
        return;
      }
      runExport();
    };
  }

  const deleteBtn = overlay.querySelector('#zt-preview-delete');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      closePreview();
      renderDeleteView(template);
    };
  }

  const copyBtn = overlay.querySelector('#zt-preview-copy');
  const runCopy = () => {
    const originalText = getButtonLabel(copyBtn);
    copyBtn.disabled = true;
    copyTextToClipboard(html, () => {
      setButtonLabel(copyBtn, 'Copied');
      setTimeout(() => {
        setButtonLabel(copyBtn, originalText);
        copyBtn.disabled = false;
      }, 1400);
    }, () => {
      setButtonLabel(copyBtn, 'Copy failed');
      setTimeout(() => {
        setButtonLabel(copyBtn, originalText);
        copyBtn.disabled = false;
      }, 1600);
    });
  };
  if (copyBtn) {
    if (isLocked) {
      setButtonLabel(copyBtn, 'Unlock to copy');
      copyBtn.onclick = () => renderUpgradeView(access.billing || { isPremium: false, isTrial: false, daysLeft: 0, licenseStatus: 'expired' }, { reason: 'pro-template' });
    } else {
      copyBtn.onclick = () => {
        if (typeof guardPremiumAction === 'function') {
          guardPremiumAction(runCopy);
          return;
        }
        runCopy();
      };
    }
  }

  const insertBtn = overlay.querySelector('#zt-preview-insert');
  if (isLocked) {
    setButtonLabel(insertBtn, 'Unlock to copy');
    insertBtn.onclick = () => {
      closePreview();
      renderUpgradeView(access.billing || { isPremium: false, isTrial: false, daysLeft: 0, licenseStatus: 'expired' });
    };
  } else {
    insertBtn.onclick = () => {
      initiateTemplateInsertion(template, insertBtn);
      closePreview();
    };
  }

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closePreview();
      return;
    }
    if (e.key === 'Enter') {
      const target = e.target;
      if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (insertBtn) insertBtn.click();
    }
  });
}

function generateTemplateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatVariableLabel(name) {
  const raw = String(name || '').trim();
  if (!raw) return 'Variable';
  let spaced = raw.replace(/[_-]+/g, ' ');
  spaced = spaced.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  spaced = spaced.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  return spaced.split(/\s+/).filter(Boolean).map((token) => {
    const upper = token.toUpperCase();
    if (['URL', 'ID', 'CTA', 'FAQ', 'SMS', 'VIP', 'SKU', 'HTML'].includes(upper)) return upper;
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
  }).join(' ');
}

function getVariableTypeHint(name) {
  const lower = String(name || '').toLowerCase();
  if (lower.includes('url') || lower.includes('link') || lower.includes('href')) return 'URL';
  if (lower.includes('email')) return 'Email';
  if (lower.includes('date')) return 'Date';
  if (lower.includes('time')) return 'Time';
  if (lower.includes('price') || lower.includes('amount') || lower.includes('cost')) return 'Amount';
  if (lower.includes('percent') || lower.includes('discount') || lower.includes('off')) return 'Percent';
  if (lower.includes('phone') || lower.includes('tel')) return 'Phone';
  if (lower.includes('address')) return 'Address';
  return '';
}

function getVariablePlaceholder(name, label) {
  const lower = String(name || '').toLowerCase();
  if (lower.includes('url') || lower.includes('link') || lower.includes('href')) return 'https://example.com';
  if (lower.includes('email')) return 'hello@company.com';
  if (lower.includes('name')) return 'Name';
  if (lower.includes('brand') || lower.includes('company') || lower.includes('team')) return 'Brand name';
  if (lower.includes('date')) return 'Apr 8, 2025';
  if (lower.includes('time')) return '3:00 PM';
  if (lower.includes('price') || lower.includes('amount') || lower.includes('cost')) return '$49';
  if (lower.includes('percent') || lower.includes('discount') || lower.includes('off')) return '20%';
  if (lower.includes('address')) return '123 Market St';
  if (lower.includes('city') || lower.includes('location')) return 'San Francisco';
  if (lower.includes('phone') || lower.includes('tel')) return '(555) 123-4567';
  if (lower.includes('issue')) return 'Issue 24';
  if (lower.includes('quote')) return 'Short quote';
  if (lower.includes('summary') || lower.includes('intro') || lower.includes('note') || lower.includes('message') || lower.includes('description')) return 'Write a short paragraph...';
  if (lower.includes('story') || lower.includes('feature') || lower.includes('highlight')) return 'Short headline';
  if (lower.includes('cta') || lower.includes('button')) return 'Learn more';
  return `Enter ${label}...`;
}

function shouldAutoFillVariable(name) {
  const lower = String(name || '').toLowerCase();
  if (!lower) return true;
  if (/(url|link|href|website)/.test(lower)) return false;
  if (/(price|amount|cost|discount|promo|coupon|offer|plan|tier)/.test(lower)) return false;
  const identityMatch = /(brand|company|product|feature|collection|campaign|launch|eventname|eventtitle|event|webinar|workshop|summit|session|host|founder|team|speaker|customer|member|first|last|fullname)/.test(lower);
  const secondaryDetail = /(date|time|location|address|city|state|zip|postal)/.test(lower);
  if (identityMatch && !secondaryDetail) return false;
  return true;
}

function getAutoVariableValue(name, label) {
  const lower = String(name || '').toLowerCase();
  if (!lower) return label;
  if (lower.includes('date')) return 'June 24, 2025';
  if (lower.includes('time')) return '10:00 AM PT';
  if (lower.includes('location')) return 'Online';
  if (lower.includes('city')) return 'San Francisco';
  if (lower.includes('state')) return 'CA';
  if (lower.includes('address')) return '123 Market Street';
  if (lower.includes('email')) return 'hello@company.com';
  if (lower.includes('phone') || lower.includes('tel')) return '(555) 123-4567';
  if (lower.includes('price') || lower.includes('amount') || lower.includes('cost')) return '$49';
  if (lower.includes('discount') || lower.includes('percent') || lower.includes('off')) return '25%';
  if (lower.includes('first')) return 'Alex';
  if (lower.includes('last')) return 'Morgan';
  if (lower.includes('brand') || lower.includes('company') || lower.includes('team')) return 'MailPaw';
  if (lower.includes('product')) return 'Nova Studio';
  if (lower.includes('feature')) return 'Instant layouts';
  if (lower.includes('event')) return 'Studio Workshop';
  if (lower.includes('topic')) return 'modern email design';
  if (lower.includes('issue')) return 'Issue 24';
  if (lower.includes('season')) return 'Fall 2025';
  if (lower.includes('metric')) return '48%';
  if (lower.includes('step')) return 'Open, customize, and send.';
  if (lower.includes('title') || lower.includes('headline')) return 'A clearer path to launch';
  if (lower.includes('summary') || lower.includes('intro') || lower.includes('note') || lower.includes('message') || lower.includes('description')) {
    return 'A short, friendly paragraph that explains the update and why it matters.';
  }
  if (lower.includes('story') || lower.includes('highlight')) return 'A standout update with a clear takeaway.';
  if (lower.includes('cta') || lower.includes('button')) return 'Learn more';
  if (lower.includes('url') || lower.includes('link') || lower.includes('href') || lower.includes('website')) return 'https://example.com';
  if (lower.includes('name')) return 'Signature pick';
  return label;
}

function renderVariableForm(template, uniqueVars) {
  document.querySelectorAll('.zt-vars-overlay').forEach(el => el.remove());
  const escapeHtml = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapeAttr = (value) => String(value || '').replace(/"/g, '&quot;');
  const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const bodyMatches = template.body ? [...template.body.matchAll(/{{(.*?)}}/g)].map(m => m[1]) : [];
  const subjectMatches = template.subject ? [...template.subject.matchAll(/{{(.*?)}}/g)].map(m => m[1]) : [];
  const bodySet = new Set(bodyMatches);
  const subjectSet = new Set(subjectMatches);
  const autoVars = uniqueVars.filter((v) => shouldAutoFillVariable(v));
  const userVars = uniqueVars.filter((v) => !autoVars.includes(v));
  const buildVarRow = (v, options = {}) => {
    const label = formatVariableLabel(v);
    const inSubject = subjectSet.has(v);
    const inBody = bodySet.has(v);
    let usage = '';
    if (inSubject && inBody) usage = 'Used in subject and body';
    else if (inSubject) usage = 'Used in subject';
    else if (inBody) usage = 'Used in email body';
    const typeHint = getVariableTypeHint(v);
    const hint = [usage, typeHint].filter(Boolean).join(' | ');
    const placeholder = getVariablePlaceholder(v, label);
    const valueAttr = options.value ? ` value="${escapeAttr(options.value)}"` : '';
    return `
      <div class="zt-var-row">
        <div class="zt-var-label">
          <span>${escapeHtml(label)}</span>
          <span class="zt-var-name">{{${escapeHtml(v)}}}</span>
        </div>
        ${hint ? `<div class="zt-var-meta">${escapeHtml(hint)}</div>` : ''}
        <input type="text" class="zt-input-title zt-input-var" data-var="${escapeAttr(v)}"${valueAttr} placeholder="${escapeAttr(placeholder)}" autocomplete="off" />
      </div>
    `;
  };
  const requiredHTML = userVars.map((v) => buildVarRow(v)).join('');
  const optionalHTML = autoVars.map((v) => {
    const label = formatVariableLabel(v);
    const value = getAutoVariableValue(v, label);
    return buildVarRow(v, { value });
  }).join('');
  const overlay = document.createElement('div');
  overlay.className = 'zt-modal-overlay zt-vars-overlay';
  const hasOptional = autoVars.length > 0;
  const hasRequired = userVars.length > 0;
  const subtitle = hasOptional
    ? 'Required fields are below. Optional fields are prefilled—edit if needed.'
    : 'Add values so this template is ready to send.';
  const optionalExpanded = !hasRequired;
  overlay.innerHTML = `
    <div class="zt-modal zt-vars-modal" tabindex="-1">
      <div class="zt-modal-title">Fill Variables</div>
      <div class="zt-vars-subtitle">${subtitle}</div>
      <div class="zt-vars-scroll">
        ${hasRequired ? `
          <div class="zt-vars-section">
            <div class="zt-vars-section-title">Required</div>
            ${requiredHTML}
          </div>
        ` : ''}
        ${hasOptional ? `
          <div class="zt-vars-section">
            <button type="button" class="zt-vars-toggle" id="zt-vars-toggle">
              Optional fields (${autoVars.length})
              <span class="zt-vars-toggle-icon">${optionalExpanded ? '▾' : '▸'}</span>
            </button>
            <div class="zt-vars-optional${optionalExpanded ? '' : ' is-collapsed'}" id="zt-vars-optional">
              ${optionalHTML}
            </div>
          </div>
        ` : ''}
      </div>
      <div class="zt-btn-group">
        <button class="zt-btn-cancel" id="btn-cancel-var">Cancel</button>
        <button class="zt-btn-save" id="btn-insert-var">Insert</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const closeModal = () => {
    overlay.remove();
  };

  const firstInput = overlay.querySelector('input');
  if (firstInput) setTimeout(() => firstInput.focus(), 50);
  const cancelBtn = overlay.querySelector('#btn-cancel-var');
  const insertBtn = overlay.querySelector('#btn-insert-var');
  const toggleBtn = overlay.querySelector('#zt-vars-toggle');
  const optionalWrap = overlay.querySelector('#zt-vars-optional');
  const toggleIcon = overlay.querySelector('.zt-vars-toggle-icon');
  if (toggleBtn && optionalWrap) {
    toggleBtn.onclick = () => {
      const isCollapsed = optionalWrap.classList.toggle('is-collapsed');
      if (toggleIcon) toggleIcon.textContent = isCollapsed ? '▸' : '▾';
    };
  }
  if (cancelBtn) cancelBtn.onclick = () => { closeModal(); renderHomeView(true); };
  if (insertBtn) insertBtn.onclick = () => {
    let finalBody = template.body || '';
    let finalSubject = template.subject || '';
    const inputs = overlay.querySelectorAll('.zt-input-var');
    inputs.forEach(input => {
      const regex = new RegExp(`{{${escapeRegex(input.dataset.var)}}}`, 'g');
      finalBody = finalBody.replace(regex, () => input.value);
      finalSubject = finalSubject.replace(regex, () => input.value);
    });
    try {
      finalizeInsertion({ ...template, body: finalBody, subject: finalSubject });
    } finally {
      closeModal();
      renderHomeView(true);
    }
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeModal();
      renderHomeView(true);
    }
  };

  const modalCard = overlay.querySelector('.zt-vars-modal');
  if (modalCard) {
    modalCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (insertBtn) insertBtn.click();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (cancelBtn) cancelBtn.click();
      }
    });
  }
}
