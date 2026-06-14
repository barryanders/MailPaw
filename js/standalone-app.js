(function initStandaloneApp() {
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

  window.initiateTemplateInsertion = function initiateStandaloneTemplateCopy(template, button) {
    if (!template) return;
    copyTemplateHtml(template, button || (document.activeElement && document.activeElement.closest('button')));
  };

  window.renderBillingView = function renderStandaloneAboutView() {
    if (typeof showModal !== 'function') return;
    showModal('MailPaw is Free', `
      <div style="color:#475569; font-size:14px; line-height:1.5;">
        This standalone version has no trial, subscription, template limit, export limit, or paid plan.
        Templates are stored locally in this browser on this computer for privacy. MailPaw does not need an account or cloud library to hold your email content.
        Download backup copies from the Actions menu so you can restore them later or move them to another browser.
        MailPaw copies rich email content for clients that accept formatted paste, including Gmail and many desktop email apps. Each email client handles pasted HTML differently, so send yourself a test before using a template for a real message.
        <div style="margin-top:14px;">
          If MailPaw helped you, you can <a href="${MAILPAW_SUPPORT_URL}" target="_blank" rel="noopener" style="color:#9b4f63; font-weight:700;">say thanks on Buy Me a Coffee</a>.
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
    if (typeof renderHomeView === 'function') {
      renderHomeView(false);
    }
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
