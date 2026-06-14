/* --- EDITOR LAYOUT --- */

function getEditorLayoutHTML(isEdit) {
  return `
    <div class="zt-fs-header">
      <div class="zt-header-group zt-header-left">
        <div class="zt-logo zt-logo-studio">
          <span class="zt-logo-mark" aria-hidden="true">
            <img src="${getMailPawIconSrc()}" alt="">
          </span>
          <span class="zt-logo-text">MailPaw <span class="zt-logo-sub">Studio</span></span>
        </div>
      </div>
      <div class="zt-header-group zt-header-toolbar" id="zt-inline-toolbar">
        <div class="zt-mobile-editor-controls" id="zt-mobile-editor-controls">
          <button class="zt-mobile-editor-toggle" id="zt-mobile-blocks-toggle" type="button" aria-pressed="false">Blocks</button>
          <button class="zt-mobile-editor-toggle" id="zt-mobile-details-toggle" type="button" aria-pressed="false">Details</button>
        </div>
        <div class="zt-inline-tools" id="zt-inline-tools">
          <span class="zt-toolbar-empty">Select a block to edit</span>
        </div>
      </div>
      <div class="zt-header-group zt-header-right">
        <button class="zt-icon-btn" id="zt-undo-btn-fs" data-tooltip="Undo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 14 4 9l5-5"></path>
            <path d="M4 9h10a6 6 0 0 1 6 6v1"></path>
          </svg>
        </button>
        <button class="zt-icon-btn" id="zt-redo-btn-fs" data-tooltip="Redo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 14 20 9l-5-5"></path>
            <path d="M20 9H10a6 6 0 0 0-6 6v1"></path>
          </svg>
        </button>
        <button class="zt-icon-btn" id="zt-help-btn-fs" data-tooltip="Help"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></button>
        <button class="zt-btn-cancel" id="fs-close">Close</button>
        <button class="zt-btn-save" id="fs-save">${isEdit ? 'Update' : 'Save'}</button>
      </div>
    </div>
    <div class="zt-fs-grid">
      <div class="zt-fs-col zt-fs-modules">
        <div class="zt-fs-label-bar"><div class="zt-fs-label">${window.ZT_STANDALONE ? 'Paw Library' : 'Components'}</div></div>
        <div class="zt-fs-modules-content"></div>
      </div>
      <div class="zt-fs-col zt-fs-col-main">
          <div class="zt-fs-canvas-wrapper" id="zt-canvas-wrapper">
            <div class="zt-visual-editor" id="fs-visual"></div>
          </div>
      </div>
      <div class="zt-fs-col zt-fs-settings-col">
         <div class="zt-fs-label-bar"><div class="zt-fs-label">Template Details</div></div>
         <div id="zt-fs-settings-form"></div>
      </div>
    </div>
  `;
}
