function checkContext() {
  const panel = document.getElementById('zt-panel');
  if (panel && panel.classList.contains('open')) {
    if (!activeComposeBody || !activeComposeBody.isConnected) {
      panel.classList.remove('open');
      activeComposeBody = null;
    }
  }
}

function scanForButtons() {
  const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
  buttons.forEach(btn => {
    const label = (btn.getAttribute('aria-label') || btn.getAttribute('data-tooltip') || btn.innerText || '').trim();
    if (label.startsWith('Send') && btn.offsetParent !== null) {
      const toolbar = findParentToolbar(btn);
      if (toolbar) {
        injectButton(toolbar, btn);
        const form = btn.closest('form') || btn.closest('div[role="dialog"]');
        if (form) attachShortcutListener(form);
      }
    }
  });
}

function findParentToolbar(btn) {
  let el = btn.parentElement;
  while (el && el.tagName !== 'BODY') {
    if (el.tagName === 'TR' || el.classList.contains('btC')) return el;
    el = el.parentElement;
  }
  return null;
}

function attachShortcutListener(container) {
  const body = container.querySelector('div[contenteditable="true"]');
  if (!body) return;
  if (body.dataset.ztListening === "true") return;
  body.dataset.ztListening = "true";
}

function locateBody(sendBtn) {
  const container = sendBtn.closest('div[role="dialog"]') || sendBtn.closest('table[role="presentation"]');
  if (!container) return null;
  return container.querySelector('div[contenteditable="true"]');
}

function locateSubject(bodyElement) {
  const container = bodyElement.closest('div[role="dialog"]') || bodyElement.closest('table[role="presentation"]');
  if (!container) return null;
  return container.querySelector('input[name="subjectbox"]');
}

function injectButton(toolbar, sendBtn) {
  if (toolbar.querySelector('.zt-trigger-btn')) return;

  const templatesBtn = document.createElement('div');
  templatesBtn.className = 'zt-trigger-btn';
  templatesBtn.innerHTML = `<img src="${getMailPawIconSrc()}" alt="" aria-hidden="true">`;
  templatesBtn.title = 'MailPaw Templates';
  templatesBtn.setAttribute('aria-label', 'Open MailPaw templates');
  templatesBtn.style.verticalAlign = 'middle';
  templatesBtn.style.alignSelf = 'center';
  templatesBtn.style.marginLeft = '6px';
  templatesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    activeComposeBody = locateBody(sendBtn);
    if (activeComposeBody) {
      toggleSidebar(templatesBtn);
      activeComposeBody.focus();
    } else {
      alert("Click inside the email text box first.");
    }
  });

  const sendContainer = sendBtn.closest('td') || sendBtn.parentElement;
  const containerStyles = window.getComputedStyle(sendContainer);
  if (containerStyles.display === 'flex') {
    sendContainer.style.alignItems = 'center';
    sendContainer.style.gap = '6px';
  }
  if (sendContainer.tagName === 'TD') {
    sendContainer.style.verticalAlign = 'middle';
  }
  const sendRect = sendBtn.getBoundingClientRect();
  if (sendRect.height) {
    const size = Math.round(sendRect.height);
    templatesBtn.style.width = `${size}px`;
    templatesBtn.style.height = `${size}px`;
    templatesBtn.style.borderRadius = `${Math.max(10, Math.round(size * 0.25))}px`;
    const iconSize = Math.max(14, Math.round(size * 0.5));
    const icon = templatesBtn.querySelector('svg');
    if (icon) {
      icon.setAttribute('width', iconSize);
      icon.setAttribute('height', iconSize);
    }
    if (containerStyles.display !== 'flex') {
      const containerRect = sendContainer.getBoundingClientRect();
      const targetOffset = Math.round((sendRect.top + sendRect.height / 2) - (containerRect.top + size / 2)) + 5;
      templatesBtn.style.position = 'relative';
      templatesBtn.style.top = `${targetOffset}px`;
    }
  }
  sendContainer.appendChild(templatesBtn);
}
