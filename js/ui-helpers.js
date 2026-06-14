/* --- UI HELPERS --- */

function rgbToHex(rgb) {
    if (!rgb || !rgb.startsWith('rgb')) {
        if (typeof rgb === 'string' && rgb.startsWith('#') && rgb.length === 7) return rgb;
        return '#000000';
    }
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    rgb = rgb.substr(4).split(")")[0].split(sep);
    let r = (+rgb[0]).toString(16), g = (+rgb[1]).toString(16), b = (+rgb[2]).toString(16);
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;
    return "#" + r + g + b;
}

const SOCIAL_ICON_SVGS = {
    LinkedIn: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="6.5" cy="7" r="1.5"></circle>
            <rect x="5" y="10" width="3" height="9" rx="1"></rect>
            <path d="M11 10h2.6v1.4c.5-.9 1.6-1.7 3.4-1.7 2.6 0 4 1.6 4 4.6V19h-3v-4c0-1.6-.6-2.7-2.1-2.7-1.1 0-1.7.7-2 1.4-.1.3-.1.7-.1 1.1V19H11z"></path>
        </svg>
    `,
    X: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M5 4h3.3l3.5 4.8L15.5 4H19l-5.1 7.1L19.6 20h-3.3l-3.8-5.3L8.4 20H5l5.5-8z"></path>
        </svg>
    `,
    Instagram: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="5"></rect>
            <circle cx="12" cy="12" r="3.5"></circle>
            <circle cx="17" cy="7" r="1.2"></circle>
        </svg>
    `,
    TikTok: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M14 4c1.2 1.9 3 3 5 3.1v3.1c-1.8-.1-3.5-.7-5-1.9v6.4c0 2.8-2.2 4.9-5 4.9-2.4 0-4.3-1.7-4.3-4 0-2.4 2.1-4.2 4.9-4.2.4 0 .8 0 1.2.1v3c-.3-.1-.6-.1-.9-.1-1.2 0-2.1.7-2.1 1.7 0 .9.7 1.6 1.7 1.6 1.4 0 2.3-.9 2.3-2.3V4z"></path>
        </svg>
    `,
    YouTube: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="6 5 19 12 6 19"></polygon>
        </svg>
    `
};

const DEFAULT_SOCIAL_ICON = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
`;

const ZT_SOCIAL_NETWORKS = {
    LinkedIn: { label: 'LinkedIn', href: 'https://linkedin.com', color: '#0a66c2', icon: SOCIAL_ICON_SVGS.LinkedIn },
    X: { label: 'X', href: 'https://x.com', color: '#0f172a', icon: SOCIAL_ICON_SVGS.X },
    Instagram: { label: 'Instagram', href: 'https://instagram.com', color: '#ec4899', icon: SOCIAL_ICON_SVGS.Instagram },
    TikTok: { label: 'TikTok', href: 'https://tiktok.com', color: '#111827', icon: SOCIAL_ICON_SVGS.TikTok },
    YouTube: { label: 'YouTube', href: 'https://youtube.com', color: '#ef4444', icon: SOCIAL_ICON_SVGS.YouTube }
};

function getSocialNetworkOptions() {
    return Object.keys(ZT_SOCIAL_NETWORKS);
}

function buildSocialLinksHTML(networks, options = {}) {
    const list = Array.isArray(networks) && networks.length ? networks : getSocialNetworkOptions();
    const align = options.align || 'center';
    const hrefMap = options.hrefMap || {};
    const tableStyle = [
        'border-collapse:collapse',
        align === 'center' ? 'margin:0 auto' : '',
        align === 'right' ? 'margin-left:auto' : ''
    ].filter(Boolean).join(';');

    const cells = list.map((name) => {
        const info = ZT_SOCIAL_NETWORKS[name] || { label: name, href: 'https://', color: '#0f172a', icon: DEFAULT_SOCIAL_ICON };
        const href = hrefMap[name] || info.href;
        const icon = info.icon || DEFAULT_SOCIAL_ICON;
        return `
            <td data-network="${name}" style="padding:4px 6px;">
                <a data-network="${name}" href="${href}" aria-label="${info.label}" style="display:inline-flex; align-items:center; justify-content:center; text-decoration:none;">
                    <span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; background:${info.color}; color:#ffffff;">
                        ${icon}
                    </span>
                </a>
            </td>
        `;
    }).join('');

    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="${tableStyle}"><tr>${cells}</tr></table>`;
}

function showModal(title, content, onSubmit) {
  // Remove any existing modals first
  document.querySelectorAll('.zt-modal-overlay').forEach(el => el.remove());

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'zt-modal-overlay';
  modalOverlay.innerHTML = `
    <div class="zt-modal" tabindex="-1">
      <div class="zt-modal-title">${title}</div>
      <div class="zt-modal-content">${content}</div>
      <div class="zt-btn-group">
        <button class="zt-btn-cancel" id="modal-cancel">Cancel</button>
        <button class="zt-btn-save" id="modal-submit">Confirm</button>
      </div>
    </div>
  `;

  // Append to BODY to ensure it's on top of everything
  document.body.appendChild(modalOverlay);

  const modalCard = modalOverlay.querySelector('.zt-modal');
  const firstInput = modalOverlay.querySelector('input');
  if (firstInput) {
      setTimeout(() => firstInput.focus(), 50);
  } else if (modalCard) {
      setTimeout(() => modalCard.focus(), 50);
  }

  document.getElementById('modal-cancel').onclick = () => modalOverlay.remove();
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) modalOverlay.remove();
  };

  document.getElementById('modal-submit').onclick = () => {
    if (onSubmit()) {
      modalOverlay.remove();
    }
  };

  modalOverlay.querySelector('.zt-modal').addEventListener('keydown', (e) => {
      if(e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          document.getElementById('modal-submit').click();
      }
      if(e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          document.getElementById('modal-cancel').click();
      }
  });
}

if (typeof window !== 'undefined') {
    window.ZT_SOCIAL_NETWORKS = ZT_SOCIAL_NETWORKS;
    window.buildSocialLinksHTML = buildSocialLinksHTML;
    window.getSocialNetworkOptions = getSocialNetworkOptions;
}

function renderHelpModal() {
    const standalone = typeof window !== 'undefined' && window.ZT_STANDALONE;
    const workflowHelp = standalone
        ? `
        <p><strong>Mobile editing</strong><br>Use Blocks and Details in the top bar when you need them. The email canvas stays front and center.</p>
        <p><strong>Using a template</strong><br>Preview it, then Copy HTML. Paste into an email client that accepts HTML, or export a backup copy from Actions.</p>
        <p><strong>Privacy</strong><br>Your templates stay in this browser's local storage unless you export or share them.</p>
        `
        : `
        <p><strong>Shortcuts</strong><br>Undo and redo: Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z.</p>
        <p><strong>Variables</strong><br>Use <code>{{name}}</code> to create merge fields.</p>
        `;
    showModal('Help', `
        <p><strong>Quick start</strong><br>Drag components from the left, then click to edit text or buttons. Use the crosshair handle to reorder blocks.</p>
        <p><strong>Formatting</strong><br>Select text to open the toolbar. Use the link icon to manage text or block links in the popup. For images, use the block link control.</p>
        <p><strong>Columns</strong><br>Drop blocks into columns to build side-by-side layouts. Each column supports its own blocks.</p>
        <p><strong>HTML block</strong><br>Edit in the Code tab. Preview is read-only.</p>
        ${workflowHelp}
    `, () => true);

    const modal = document.querySelector('.zt-modal-overlay');
    if (modal) {
        modal.querySelector('#modal-submit').style.display = 'none';
        const cancelBtn = modal.querySelector('#modal-cancel');
        cancelBtn.textContent = 'Got it';
        cancelBtn.style.flex = '1';
    }
}
