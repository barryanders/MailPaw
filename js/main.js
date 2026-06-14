function applyTextStyles(element, spec) {
  if (!element || !spec) return;
  if (spec.align) element.style.textAlign = spec.align;
  if (spec.color) element.style.color = spec.color;
  if (spec.size) element.style.fontSize = spec.size;
  if (spec.weight) element.style.fontWeight = spec.weight;
  if (spec.lineHeight) element.style.lineHeight = spec.lineHeight;
}

function buildBlockFromSpec(spec, options = {}) {
  if (!spec || !spec.type || typeof createBlockHTML !== 'function') return null;
  const applyPreset = options.applyPreset === true;
  const templateSpacing = options.templateSpacing === true;
  const defaultTemplateMargin = '16px';
  const applyDefaultSpacing = (layout) => {
    if (!templateSpacing) return layout;
    const safeLayout = layout ? { ...layout } : {};
    const hasMargin = safeLayout.margin || safeLayout.marginTop || safeLayout.marginRight || safeLayout.marginBottom || safeLayout.marginLeft;
    if (!hasMargin && spec.type !== 'spacer') safeLayout.marginBottom = defaultTemplateMargin;
    return safeLayout;
  };

  if (spec.type === 'grid') {
    const columns = Array.isArray(spec.columns) ? spec.columns : null;
    const cols = spec.cols || (columns ? columns.length : spec.param || 2);
    const gridBlock = createBlockHTML('grid', cols);
    if (!gridBlock) return null;
    if (typeof applyBlockLayoutDefaults === 'function') {
      const layout = applyDefaultSpacing(spec.layout || null);
      if (layout && Object.keys(layout).length) applyBlockLayoutDefaults(gridBlock, layout);
    }
    if (spec.background) gridBlock.style.backgroundColor = spec.background;
    if (columns) {
      const columnEls = gridBlock.querySelectorAll('.zt-column');
      columnEls.forEach((colEl, index) => {
        const columnSpecs = columns[index] || [];
        colEl.innerHTML = '';
        columnSpecs.forEach(childSpec => {
          const child = buildBlockFromSpec(childSpec, options);
          if (child) colEl.appendChild(child);
        });
      });
    }
    return gridBlock;
  }

  const param = spec.param || (spec.type === 'social' ? spec.networks : null);
  const block = createBlockHTML(spec.type, param);
  if (!block) return null;

  if (typeof applyBlockLayoutDefaults === 'function') {
    const layout = applyDefaultSpacing(spec.layout || null);
    if (layout && Object.keys(layout).length) applyBlockLayoutDefaults(block, layout);
  }
  if (spec.background) block.style.backgroundColor = spec.background;

  if (spec.type === 'heading') {
    const heading = block.querySelector('h2');
    if (heading && spec.text) heading.textContent = spec.text;
    applyTextStyles(heading, spec);
  } else if (spec.type === 'text') {
    const text = block.querySelector('p');
    if (text) {
      if (spec.html) text.innerHTML = spec.html;
      else if (spec.text) text.textContent = spec.text;
      applyTextStyles(text, spec);
      if (templateSpacing && !spec.lineHeight) text.style.lineHeight = '1.7';
    }
  } else if (spec.type === 'button') {
    const btn = block.querySelector('a');
    if (btn) {
      if (spec.text) btn.textContent = spec.text;
      if (spec.href) btn.setAttribute('href', spec.href);
      if (!applyPreset) {
        if (spec.bg) btn.style.backgroundColor = spec.bg;
        if (spec.color) btn.style.color = spec.color;
      }
      if (spec.radius) btn.style.borderRadius = spec.radius;
      applyTextStyles(btn, spec);
      const align = spec.align || 'left';
      if (btn.parentElement) btn.parentElement.style.textAlign = align;
    }
  } else if (spec.type === 'image') {
    const img = block.querySelector('img');
    if (img) {
      if (spec.src) img.src = spec.src;
      if (spec.alt) img.alt = spec.alt;
      if (spec.radius) img.style.borderRadius = spec.radius;
      if (spec.width) img.style.width = spec.width;
      if (spec.height) img.style.height = spec.height;
    }
  } else if (spec.type === 'divider') {
    const hr = block.querySelector('hr');
    if (hr) {
      if (!applyPreset && spec.color) hr.style.borderTopColor = spec.color;
      if (spec.thickness) hr.style.borderTopWidth = spec.thickness;
      if (spec.width) hr.style.width = spec.width;
    }
  } else if (spec.type === 'spacer') {
    const spacer = block.querySelector('div');
    if (spacer && spec.height) {
      spacer.style.height = spec.height;
      spacer.style.lineHeight = spec.height;
    }
  }

  return block;
}

function isStandaloneMailPaw() {
  return typeof window !== 'undefined' && !!window.ZT_STANDALONE;
}

function getStandalonePlaceholderValue(rawName) {
  const name = String(rawName || '').trim();
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const titleized = name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();

  if (!key) return 'Sample content';
  if (key.includes('url') || key.includes('link') || key.includes('href') || key.includes('website')) return 'https://example.com';
  if (key.includes('email')) return 'hello@example.com';
  if (key.includes('phone')) return '(555) 014-2026';
  if (key.includes('date') || key.includes('deadline')) return 'June 24, 2026';
  if (key.includes('time')) return '10:00 AM';
  if (key.includes('address')) return '123 Cozy Lane';
  if (key.includes('city')) return 'Portland';
  if (key.includes('location') || key.includes('venue')) return 'The Cozy Studio';
  if (key.includes('company') || key.includes('brand') || key.includes('team') || key.includes('organization')) return 'Whisker & Co.';
  if (key.includes('firstname')) return 'Maya';
  if (key === 'name' || key.includes('founder') || key.includes('host') || key.includes('speaker') || key.includes('author')) return 'Maya Chen';
  if (key.includes('price')) return '$49';
  if (key.includes('discount') || key.includes('percent')) return '20%';
  if (key.includes('code') || key.includes('promo')) return 'PAW20';
  if (key.includes('metric')) return '42%';
  if (key.includes('product') || key.includes('feature') || key.includes('plan')) return 'Pawprint Pro';
  if (key.includes('event') || key.includes('session') || key.includes('webinar')) return 'Cozy Launch Workshop';
  if (key.includes('title') || key.includes('headline')) return titleized || 'A useful update for your readers';
  if (key.includes('quote')) return 'Make the useful thing feel effortless.';
  if (key.includes('summary') || key.includes('intro') || key.includes('copy') || key.includes('description') || key.includes('note')) {
    return 'A concise note with the context your readers need.';
  }
  return titleized || 'Sample content';
}

function materializeStandaloneTemplateText(value) {
  if (!isStandaloneMailPaw() || typeof value !== 'string') return value;
  return value.replace(/{{\s*([^}]+?)\s*}}/g, (_, name) => getStandalonePlaceholderValue(name));
}

function materializeStandaloneTemplateSpec(value, key = '') {
  if (!isStandaloneMailPaw()) return value;
  if (typeof value === 'string') return key === 'shortcut' ? '' : materializeStandaloneTemplateText(value);
  if (Array.isArray(value)) return value.map(item => materializeStandaloneTemplateSpec(item));
  if (value && typeof value === 'object') {
    const next = {};
    Object.keys(value).forEach(childKey => {
      next[childKey] = materializeStandaloneTemplateSpec(value[childKey], childKey);
    });
    return next;
  }
  return value;
}

function buildDefaultTemplatesFromSpecs(specs) {
  if (!Array.isArray(specs) || typeof buildEmailHtmlFromCanvas !== 'function') return [];
  return specs.map((spec, index) => {
    const templateSpec = materializeStandaloneTemplateSpec(spec);
    const preset = (typeof resolveStylePresetForTemplate === 'function')
      ? resolveStylePresetForTemplate(templateSpec)
      : null;
    const prevPresetDefaults = (typeof window !== 'undefined') ? window.ztStylePresetDefaults : null;
    const prevGlobalFontColor = (typeof window !== 'undefined') ? window.ztGlobalFontColor : null;
    const prevGlobalFontColorActive = (typeof window !== 'undefined') ? window.ztGlobalFontColorActive : false;
    if (preset && typeof buildStylePresetDefaults === 'function' && typeof window !== 'undefined') {
      window.ztStylePresetDefaults = buildStylePresetDefaults(preset);
      window.ztGlobalFontColor = preset.fontColor || '';
      window.ztGlobalFontColorActive = !!preset.fontColor;
    }
    const canvas = document.createElement('div');
    (templateSpec.blocks || []).forEach(blockSpec => {
      const block = buildBlockFromSpec(blockSpec, { applyPreset: !!preset, templateSpacing: true });
      if (block) canvas.appendChild(block);
    });
    const bgEmail = templateSpec.bgEmail || preset?.bgEmail || '#ffffff';
    const fontFamily = templateSpec.fontFamily || preset?.fontFamily || '';
    const fontColor = templateSpec.fontColor || preset?.fontColor || '';
    const { designState, body } = buildEmailHtmlFromCanvas(canvas, bgEmail, fontFamily, fontColor);
    if (typeof window !== 'undefined') {
      window.ztStylePresetDefaults = prevPresetDefaults;
      window.ztGlobalFontColor = prevGlobalFontColor;
      window.ztGlobalFontColorActive = prevGlobalFontColorActive;
    }
    return {
      id: templateSpec.id,
      title: templateSpec.title,
      category: templateSpec.category,
      subject: templateSpec.subject,
      shortcut: isStandaloneMailPaw() ? '' : (templateSpec.shortcut || ''),
      tier: templateSpec.tier || 'free',
      design: designState,
      body: body,
      bgEmail: bgEmail,
      fontFamily: fontFamily,
      fontColor: fontColor,
      stylePresetId: preset?.id || templateSpec.stylePresetId || '',
      createdAt: Date.now() - (index * 1000),
      updatedAt: Date.now() - (index * 1000),
      isDefault: true
    };
  });
}

function buildDefaultTemplatesFromSpecsAsync(specs, callback) {
  if (!Array.isArray(specs) || !specs.length) {
    callback([]);
    return;
  }
  const output = [];
  let index = 0;
  const step = () => {
    const batch = specs.slice(index, index + 2);
    output.push(...buildDefaultTemplatesFromSpecs(batch));
    index += batch.length;
    if (index < specs.length) {
      setTimeout(step, 0);
      return;
    }
    callback(output);
  };
  setTimeout(step, 0);
}

function applyLoadedTemplates(storedTemplates, defaults, hideDefaultTemplates, legacyIds) {
  const storedList = Array.isArray(storedTemplates) ? storedTemplates : null;
  if (storedList) {
    const cleaned = storedList.filter(t => !legacyIds.has(t.id));
    const removedLegacy = cleaned.length !== storedList.length;
    if (hideDefaultTemplates) {
      templates = cleaned;
      if (removedLegacy) saveTemplatesToStorage(templates);
    } else {
      const existingIds = new Set(cleaned.map(t => t.id));
      const defaultsToAdd = defaults.filter(t => !existingIds.has(t.id));
      templates = cleaned.concat(defaultsToAdd);
      if (removedLegacy || defaultsToAdd.length) saveTemplatesToStorage(templates);
    }
  } else {
    if (hideDefaultTemplates) {
      templates = [];
      saveTemplatesToStorage(templates);
    } else {
      templates = defaults;
      saveTemplatesToStorage(templates);
    }
  }

  templates.forEach(t => {
    if(!t.createdAt) t.createdAt = Date.now();
    if(!t.updatedAt) t.updatedAt = t.createdAt;
    if(!t.tier) t.tier = 'free';
  });
  const defaultsById = new Map(defaults.map(t => [t.id, t]));
  let refreshedDefaults = false;
  templates = templates.map((t) => {
    if (!t.isDefault) return t;
    const fresh = defaultsById.get(t.id);
    if (!fresh) return t;
    const unchanged = t.updatedAt === t.createdAt;
    const needsStandaloneRefresh = isStandaloneMailPaw() && ((t.body || '').includes('{{') || !!t.shortcut);
    if (!unchanged && !needsStandaloneRefresh) return t;
    refreshedDefaults = true;
    return {
      ...fresh,
      createdAt: t.createdAt || fresh.createdAt,
      updatedAt: t.updatedAt || fresh.updatedAt,
    };
  });
  if (refreshedDefaults) saveTemplatesToStorage(templates);
}

chrome.storage.sync.get(['listViewMode', 'componentDefaults', 'hideDefaultTemplates'], (result) => {
  if (result.componentDefaults && typeof applyComponentDefaultsFromStorage === 'function') {
    applyComponentDefaultsFromStorage(result.componentDefaults);
  }
  const hideDefaultTemplates = result.hideDefaultTemplates === true;
  const defaultSpecs = typeof DEFAULT_TEMPLATE_SPECS !== 'undefined' ? DEFAULT_TEMPLATE_SPECS : [];
  const legacyIds = new Set((typeof LEGACY_DEFAULT_TEMPLATE_IDS !== 'undefined' && Array.isArray(LEGACY_DEFAULT_TEMPLATE_IDS)) ? LEGACY_DEFAULT_TEMPLATE_IDS : []);

  const finishBoot = () => {
    listViewMode = result.listViewMode || 'thumb';
    if (listViewMode === 'preview') listViewMode = 'thumb';
    if (!result.listViewMode || result.listViewMode === 'preview') chrome.storage.sync.set({ listViewMode });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zt-templates-ready'));
    }
  };

  if (typeof window !== 'undefined' && window.ZT_STANDALONE) {
    loadTemplatesFromStorage((storedTemplates) => {
      buildDefaultTemplatesFromSpecsAsync(defaultSpecs, (defaults) => {
        applyLoadedTemplates(storedTemplates, defaults, hideDefaultTemplates, legacyIds);
        finishBoot();
      });
    });
    return;
  }

  const defaults = buildDefaultTemplatesFromSpecs(defaultSpecs);
  loadTemplatesFromStorage((storedTemplates) => {
    applyLoadedTemplates(storedTemplates, defaults, hideDefaultTemplates, legacyIds);
    finishBoot();
  });
});

if (!(typeof window !== 'undefined' && window.ZT_STANDALONE)) {
  setInterval(scanForButtons, 1000);
  setInterval(checkContext, 500);
}

setupTooltipLogic();
