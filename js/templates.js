function exportTemplates(all = true) {
  const exportAll = all || activeCategory === 'All';
  const dataToExport = exportAll ? templates : templates.filter(t => (t.category || '') === activeCategory);
  const dateStr = new Date().toISOString().split('T')[0];
  const catPart = all ? 'All' : activeCategory;
  const name = `MailPaw Backup | ${catPart} | ${dateStr}.json`;
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  document.getElementById('zt-settings-menu').classList.remove('show');
}

function exportSingleTemplate(t) {
  const dateStr = new Date().toISOString().split('T')[0];
  const cleanTitle = t.title.replace(/[^a-z0-9 ]/gi, '').trim();
  const name = `MailPaw Template | ${cleanTitle} | ${dateStr}.json`;
  const blob = new Blob([JSON.stringify([t], null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
}

function saveTemplate(existingId, templateData) {
  const { category, title, subject, body, shortcut, design, bgEmail, fontFamily, fontColor, stylePresetId } = templateData;

  if (!title || !body) {
    alert("⚠️ Missing required fields: Template Name and Content cannot be empty.");
    return;
  }

  const now = Date.now();
  const newTemplate = {
    id: now.toString(),
    category, title, subject, body, shortcut, design, bgEmail, fontFamily, fontColor, stylePresetId,
    createdAt: now,
    updatedAt: now,
    isDefault: false
  };

  if (existingId) {
    const index = templates.findIndex(t => t.id === existingId);
    if (index !== -1) {
      const existing = templates[index];
      if (existing.isDefault) {
        newTemplate.sourceId = existing.id;
        templates.push(newTemplate);
      } else {
        const createdAt = existing.createdAt || now;
        templates[index] = {
          ...existing,
          category, title, subject, body, shortcut, design, bgEmail, fontFamily, fontColor, stylePresetId,
          createdAt,
          updatedAt: now
        };
      }
    } else {
      templates.push(newTemplate);
    }
  } else {
    templates.push(newTemplate);
  }
  activeCategory = category;
  saveTemplatesToStorage(templates);
}

function initiateTemplateInsertion(template) {
  if (typeof guardTemplateInsertion === 'function') {
    guardTemplateInsertion(template, () => runTemplateInsertion(template));
    return;
  }
  if (typeof guardTemplateAccess === 'function' && typeof isBillingConfigured === 'function') {
    const isProTemplate = typeof getTemplateTier === 'function' ? getTemplateTier(template) !== 'free' : !!(template && template.tier);
    if (isProTemplate && isBillingConfigured()) {
      guardTemplateAccess(template, () => runTemplateInsertion(template));
      return;
    }
  }
  runTemplateInsertion(template);
}

function ensureComposeReady() {
  if (activeComposeBody && activeComposeBody.isConnected) return true;
  if (typeof showModal === 'function') {
    showModal('Open a Draft', `
      <div style="color:#64748b; font-size:13px; line-height:1.5;">
        Click inside a Gmail draft body, then choose a template again.
      </div>
    `, () => true);
    const modal = document.querySelector('.zt-modal-overlay');
    if (modal) {
      const submit = modal.querySelector('#modal-submit');
      const cancel = modal.querySelector('#modal-cancel');
      if (submit) {
        submit.textContent = 'OK';
      }
      if (cancel) cancel.style.display = 'none';
    }
  } else {
    alert('Click inside a Gmail draft body, then choose a template again.');
  }
  return false;
}

function runTemplateInsertion(template) {
  if (!ensureComposeReady()) return;
  const regex = /{{(.*?)}}/g;
  const bodyMatches = template.body ? [...template.body.matchAll(regex)].map(m => m[1]) : [];
  const subjectMatches = template.subject ? [...template.subject.matchAll(regex)].map(m => m[1]) : [];
  const uniqueVars = [...new Set([...bodyMatches, ...subjectMatches])];
  if (uniqueVars.length > 0) {
    renderVariableForm(template, uniqueVars);
    const panel = document.getElementById('zt-panel');
    if (!panel.classList.contains('open')) panel.classList.add('open');
  } else {
    finalizeInsertion(template);
  }
}

function finalizeInsertion(templateData) {
  if (!activeComposeBody) return;
  if (templateData.subject) {
    try {
      const form = activeComposeBody.closest('form') || activeComposeBody.closest('div[role="dialog"]');
      const subjectBox = form.querySelector('input[name="subjectbox"]');
      if (subjectBox) {
        subjectBox.value = templateData.subject;
        subjectBox.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (e) {}
  }

  // FIX: Only convert newlines to <br> for legacy text templates.
  // Builder templates (with .design) are already valid HTML.
  let htmlContent = sanitizeTemplateHtml(templateData.body || '');
  if (!templateData.design) {
      htmlContent = htmlContent.replace(/\n/g, '<br>');
  }

  activeComposeBody.focus();
  document.execCommand('insertHTML', false, htmlContent);
  const panel = document.getElementById('zt-panel');
  if(panel) panel.classList.remove('open');
  maybePromptForReview();
}

function sanitizeTemplateHtml(html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html || '';
  wrapper.querySelectorAll('script').forEach((el) => el.remove());
  return wrapper.innerHTML;
}

function duplicateTemplate(templateToDuplicate) {
  const runDuplicate = () => {
    const sourceId = templateToDuplicate.isDefault
      ? templateToDuplicate.id
      : templateToDuplicate.sourceId;
    const newTemplate = {
      ...templateToDuplicate,
      id: Date.now().toString(),
      title: `${templateToDuplicate.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: false,
      sourceId: sourceId
    };
    templates.push(newTemplate);
    saveTemplatesToStorage(templates, () => {
      renderHomeView(true);
    });
  };
  if (typeof guardTemplateCreation === 'function') {
    guardTemplateCreation(runDuplicate);
    return;
  }
  runDuplicate();
}

const ZT_SUPPORT_STATE_KEY = 'ztSupportState';
const ZT_SUPPORT_MIN_ACTIONS = 5;
const ZT_SUPPORT_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 30;

function loadReviewState(cb) {
  if (!chrome?.storage?.local) {
    cb(null);
    return;
  }
  chrome.storage.local.get([ZT_SUPPORT_STATE_KEY], (result) => {
    cb(result ? result[ZT_SUPPORT_STATE_KEY] : null);
  });
}

function saveReviewState(state) {
  if (!chrome?.storage?.local) return;
  chrome.storage.local.set({ [ZT_SUPPORT_STATE_KEY]: state });
}

function maybePromptForSupport() {
  if (typeof showModal !== 'function' || !chrome?.storage?.local) return;
  loadReviewState((state) => {
    const now = Date.now();
    const nextState = {
      actionCount: 0,
      lastPromptAt: 0,
      supported: false,
      ...state
    };
    nextState.actionCount = (Number(nextState.actionCount || nextState.insertCount) || 0) + 1;
    const cooldownOk = !nextState.lastPromptAt || (now - nextState.lastPromptAt) > ZT_SUPPORT_COOLDOWN_MS;
    const shouldPrompt = nextState.actionCount >= ZT_SUPPORT_MIN_ACTIONS && !nextState.supported && cooldownOk;
    if (!shouldPrompt) {
      saveReviewState(nextState);
      return;
    }
    nextState.lastPromptAt = now;
    saveReviewState(nextState);
    const content = `
      <div style="color:#475569; font-size:14px; line-height:1.5;">
        MailPaw is free, private, and local-first. If it saved you time, you can support Barry Anders and help keep the project moving.
      </div>
    `;
    showModal('Support MailPaw?', content, () => {
      nextState.supported = true;
      saveReviewState(nextState);
      window.open(MAILPAW_SUPPORT_URL, '_blank', 'noopener');
      return true;
    });
    const modal = document.querySelector('.zt-modal-overlay');
    if (modal) {
      const submit = modal.querySelector('#modal-submit');
      const cancel = modal.querySelector('#modal-cancel');
      if (submit) submit.textContent = 'Support MailPaw';
      if (cancel) cancel.textContent = 'Not now';
    }
  });
}

function maybePromptForReview() {
  maybePromptForSupport();
}
