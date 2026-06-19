(function initStandaloneApp() {
  const COPY_COUNT_KEY = 'mailpawCopyCount';
  const COFFEE_PROMPT_SESSION_KEY = 'mailpawCoffeePromptShown';
  const COFFEE_PROMPT_EVERY = 25;
  const COPY_HINT_TEXT = 'Now paste it into your mail app.';
  let copyHintTimer = null;
  let copyHintRemoveTimer = null;
  let renderHomeViewWrapped = false;

  const showCopyHint = () => {
    if (!document.body) return;

    let hint = document.getElementById('mailpaw-copy-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'mailpaw-copy-hint';
      hint.className = 'mailpaw-copy-hint';
      hint.setAttribute('role', 'status');
      hint.setAttribute('aria-live', 'polite');
      document.body.appendChild(hint);
    }

    hint.textContent = COPY_HINT_TEXT;
    clearTimeout(copyHintTimer);
    clearTimeout(copyHintRemoveTimer);

    const show = () => hint.classList.add('show');
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(show);
    } else {
      setTimeout(show, 0);
    }

    copyHintTimer = setTimeout(() => {
      hint.classList.remove('show');
      copyHintRemoveTimer = setTimeout(() => {
        if (hint.parentNode && !hint.classList.contains('show')) hint.remove();
      }, 220);
    }, 2600);
  };

  const maybeShowCoffeePrompt = () => {
    let count = 0;
    try {
      count = Number(localStorage.getItem(COPY_COUNT_KEY) || '0') + 1;
      localStorage.setItem(COPY_COUNT_KEY, String(count));
    } catch (_) {
      return;
    }
    let shouldPrompt = count === 1 || (count >= COFFEE_PROMPT_EVERY && count % COFFEE_PROMPT_EVERY === 0);
    try {
      if (sessionStorage.getItem(COFFEE_PROMPT_SESSION_KEY)) shouldPrompt = false;
      if (shouldPrompt) sessionStorage.setItem(COFFEE_PROMPT_SESSION_KEY, '1');
    } catch (_) {
      if (maybeShowCoffeePrompt.seen) shouldPrompt = false;
      if (shouldPrompt) maybeShowCoffeePrompt.seen = true;
    }
    if (!shouldPrompt) return;
    if (document.querySelector('.zt-modal-overlay')) return;
    if (typeof showModal !== 'function') return;

    showModal('Email ready', `
      <div style="color:#475569; font-size:14px; line-height:1.5;">
        If MailPaw helped, coffee is appreciated.
      </div>
    `, () => {
      window.open(MAILPAW_SUPPORT_URL, '_blank', 'noopener');
      return true;
    });
    const modal = document.querySelector('.zt-modal-overlay');
    if (!modal) return;
    const submit = modal.querySelector('#modal-submit');
    const cancel = modal.querySelector('#modal-cancel');
    if (submit) submit.textContent = 'Buy me a coffee';
    if (cancel) cancel.textContent = 'Maybe later';
  };

  const renderStandaloneIntro = () => {
    const intro = document.getElementById('zt-library-intro');
    if (!intro || intro.dataset.mailpawStandaloneIntroDismissed === '1') return;
    if (intro.dataset.mailpawStandaloneIntro === '1' && document.getElementById('mailpaw-start-building')) return;
    intro.dataset.mailpawStandaloneIntro = '1';
    intro.classList.remove('is-hidden');
    intro.classList.add('has-hero', 'has-banner');
    intro.innerHTML = `
      <div class="zt-hero">
        <div class="zt-hero-card">
          <button type="button" class="zt-hero-dismiss" id="mailpaw-intro-dismiss" aria-label="Dismiss intro">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="zt-hero-copy">
            <div class="zt-hero-kicker">Free local email builder</div>
            <div class="zt-hero-title">Reusable HTML email templates without another marketing account.</div>
            <div class="zt-hero-subtitle">Build newsletters, announcements, outreach, customer updates, and everyday email layouts. Copy rich email content, paste into your mail app, and keep your template library in this browser.</div>
            <button type="button" class="zt-hero-btn zt-hero-primary" id="mailpaw-start-building">Start with a template</button>
            <div class="zt-hero-tags" aria-label="MailPaw highlights">
              <span class="zt-hero-tag">No account</span>
              <span class="zt-hero-tag">No ads</span>
              <span class="zt-hero-tag">Local storage</span>
              <span class="zt-hero-tag">Backup export</span>
            </div>
          </div>
          <div class="zt-hero-preview" aria-hidden="true">
            <div class="zt-hero-preview-card card-back"></div>
            <div class="zt-hero-preview-card card-mid"></div>
            <div class="zt-hero-preview-card card-front">
              <span class="zt-hero-preview-bar accent"></span>
              <span class="zt-hero-preview-line"></span>
              <span class="zt-hero-preview-line short"></span>
              <span class="zt-hero-preview-chip"></span>
              <span class="zt-hero-preview-button"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="zt-billing-banner show" id="mailpaw-trust-panel" aria-live="polite">
        <div class="zt-billing-banner__copy">
          <div class="zt-billing-banner__title">Free, private, and built for reusable email work.</div>
          <div class="zt-billing-banner__sub">MailPaw is for people who need polished email templates without subscriber lists, analytics, automations, or a cloud library holding their drafts.</div>
          <div class="zt-billing-banner__benefits">
            <div class="zt-billing-banner__benefit"><span class="zt-billing-banner__dot" aria-hidden="true"></span><span>Copy-ready rich email output</span></div>
            <div class="zt-billing-banner__benefit"><span class="zt-billing-banner__dot" aria-hidden="true"></span><span>Newsletter and outreach starters</span></div>
            <div class="zt-billing-banner__benefit"><span class="zt-billing-banner__dot" aria-hidden="true"></span><span>Local template storage</span></div>
            <div class="zt-billing-banner__benefit"><span class="zt-billing-banner__dot" aria-hidden="true"></span><span>Downloadable backups</span></div>
          </div>
        </div>
        <div class="zt-billing-banner__actions">
          <button type="button" class="zt-banner-cta" id="mailpaw-about">How it works</button>
          <button type="button" class="zt-banner-link" id="mailpaw-support">Coffee</button>
        </div>
      </div>
    `;
    const dismiss = document.getElementById('mailpaw-intro-dismiss');
    if (dismiss) {
      dismiss.onclick = () => {
        intro.dataset.mailpawStandaloneIntroDismissed = '1';
        intro.classList.add('is-hidden');
        intro.classList.remove('has-hero', 'has-banner');
        intro.innerHTML = '';
      };
    }
    const start = document.getElementById('mailpaw-start-building');
    if (start) {
      start.onclick = () => {
        const search = document.querySelector('.zt-search');
        if (search) search.focus();
      };
    }
    const about = document.getElementById('mailpaw-about');
    if (about) about.onclick = () => window.renderBillingView?.();
    const support = document.getElementById('mailpaw-support');
    if (support) support.onclick = () => window.open(MAILPAW_SUPPORT_URL, '_blank', 'noopener');
  };

  const wrapRenderHomeView = () => {
    if (renderHomeViewWrapped || typeof window.renderHomeView !== 'function') return;
    const originalRenderHomeView = window.renderHomeView;
    window.renderHomeView = function renderStandaloneHomeView(...args) {
      const result = originalRenderHomeView.apply(this, args);
      renderStandaloneIntro();
      return result;
    };
    renderHomeViewWrapped = true;
  };

  const relabelAppActions = () => {
    document.querySelectorAll('#zt-billing').forEach((button) => {
      if (button.textContent !== 'About MailPaw') button.textContent = 'About MailPaw';
    });
    document.querySelectorAll('#zt-preview-insert .zt-btn-label, .zt-insert-btn .zt-btn-label').forEach((label) => {
      if (label.textContent !== 'Copy Email') label.textContent = 'Copy Email';
    });
  };

  const copyTemplateHtml = (template, button) => {
    const rawHtml = typeof materializeStandaloneTemplateText === 'function'
      ? materializeStandaloneTemplateText(template.body || '')
      : (template.body || '');
    const html = typeof sanitizeTemplateHtml === 'function' ? sanitizeTemplateHtml(rawHtml) : rawHtml;
    const original = button ? button.innerHTML : '';
    const copy = typeof copyRichEmailToClipboard === 'function' ? copyRichEmailToClipboard : copyTextToClipboard;
    copy(html, () => {
      maybeShowCoffeePrompt();
      showCopyHint();
      if (button) button.innerHTML = '<span class="zt-btn-label">Copied</span>';
      setTimeout(() => {
        if (button) button.innerHTML = original;
        relabelAppActions();
      }, 1200);
    }, () => {
      if (button) button.innerHTML = '<span class="zt-btn-label">Copy failed</span>';
      setTimeout(() => {
        if (button) button.innerHTML = original;
        relabelAppActions();
      }, 1400);
    });
  };

  window.initiateStandaloneTemplateCopy = function initiateStandaloneTemplateCopy(template, button) {
    if (!template) return;
    copyTemplateHtml(template, button || (document.activeElement && document.activeElement.closest('button')));
  };

  window.initiateTemplateInsertion = window.initiateStandaloneTemplateCopy;

  window.showMailpawCopyHint = showCopyHint;

  window.renderBillingView = function renderStandaloneAboutView() {
    if (typeof showModal !== 'function') return;
    showModal('MailPaw is Free', `
      <div style="color:#475569; font-size:14px; line-height:1.5;">
        This standalone version has no trial, subscription, template limit, export limit, or paid plan.
        Templates are stored locally in this browser on this computer for privacy. MailPaw does not need an account or cloud library to hold your email content.
        Download backup copies from the Actions menu so you can restore them later or move them to another browser.
        MailPaw copies rich email content for clients that accept formatted paste, including Gmail and many desktop email apps. Each email client handles pasted content differently, so send yourself a test before using a template for a real message.
        <div style="margin-top:14px;">
          MailPaw is open source on <a href="${MAILPAW_REPO_URL}" target="_blank" rel="noopener" style="color:#111827; font-weight:700;">GitHub</a>.
          If MailPaw helped, <a href="${MAILPAW_SUPPORT_URL}" target="_blank" rel="noopener" style="color:#111827; font-weight:700;">coffee is appreciated</a>.
        </div>
      </div>
    `, () => true);
    const modal = document.querySelector('.zt-modal-overlay');
    if (modal) {
      const submit = modal.querySelector('#modal-submit');
      const cancel = modal.querySelector('#modal-cancel');
      if (submit) submit.textContent = 'OK';
      if (cancel) cancel.style.display = 'none';
    }
  };

  let openAttempts = 0;
  const openApp = () => {
    openAttempts += 1;
    if (typeof toggleSidebar !== 'function' || typeof renderHomeView !== 'function') {
      if (openAttempts < 40) setTimeout(openApp, 100);
      return;
    }
    let panel = document.getElementById('zt-panel');
    try {
      if (!panel || !panel.classList.contains('open')) toggleSidebar();
    } catch (err) {
      if (openAttempts < 40) setTimeout(openApp, 100);
      return;
    }
    panel = document.getElementById('zt-panel');
    if (panel) {
      panel.classList.add('fullscreen');
      panel.classList.add('zt-standalone-panel');
      document.body.classList.add('mailpaw-ready');
    }
    wrapRenderHomeView();
    if (typeof window.renderHomeView === 'function') {
      window.renderHomeView(false);
    }
    renderStandaloneIntro();
    relabelAppActions();
  };

  window.addEventListener('DOMContentLoaded', () => {
    const fallback = document.getElementById('mailpaw-open-fallback');
    if (fallback) fallback.addEventListener('click', openApp);
  }, { once: true });
  window.addEventListener('zt-templates-ready', openApp, { once: true });
  window.addEventListener('DOMContentLoaded', () => setTimeout(openApp, 0), { once: true });
  window.addEventListener('load', () => setTimeout(openApp, 0), { once: true });
  setTimeout(openApp, 250);
})();
