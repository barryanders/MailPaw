/* --- COMPONENT DATA & DEFAULTS --- */

const BASE_LAYOUT = {
    background: '',
    paddingTop: '',
    paddingRight: '',
    paddingBottom: '',
    paddingLeft: '',
    marginTop: '',
    marginRight: '',
    marginBottom: '',
    marginLeft: '',
    borderWidth: '',
    borderTop: '',
    borderRight: '',
    borderBottom: '',
    borderLeft: '',
    borderColor: '#e2e8f0',
    radius: ''
};
const createLayoutDefaults = () => ({ ...BASE_LAYOUT });

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

const mergeDefaults = (target, source) => {
    if (!isPlainObject(target) || !isPlainObject(source)) return target;
    Object.keys(source).forEach((key) => {
        if (!(key in target)) return;
        const next = source[key];
        const current = target[key];
        if (isPlainObject(current) && isPlainObject(next)) mergeDefaults(current, next);
        else target[key] = next;
    });
    return target;
};

function applyComponentDefaultsFromStorage(stored) {
    if (!stored || typeof stored !== 'object') return;
    Object.keys(componentDefaults).forEach((type) => {
        if (stored[type]) mergeDefaults(componentDefaults[type], stored[type]);
    });
}

function persistComponentDefaults() {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) return;
    const payload = JSON.parse(JSON.stringify(componentDefaults));
    chrome.storage.sync.set({ componentDefaults: payload });
}

const componentDefaults = {
    heading: { font: 'inherit', color: '#111827', size: '24px', layout: createLayoutDefaults() },
    text: {
        font: 'inherit', color: '#4b5563', size: '16px', lineHeight: '1.6',
        link: { color: '#6366f1', underline: true },
        list: { style: 'disc', customMarker: '' },
        layout: createLayoutDefaults()
    },
    button: { font: 'inherit', bg: '#6366f1', color: '#ffffff', size: '14px', padding: '12px 24px', radius: '6px', layout: createLayoutDefaults() },
    image: { radius: '8px', layout: createLayoutDefaults() },
    divider: { color: '#e5e7eb', margin: '10px 0', thickness: '1px', width: '100%', layout: createLayoutDefaults() },
    grid: { cols: 2, layout: createLayoutDefaults() },
    html: { code: '', layout: createLayoutDefaults() },
    spacer: { height: '24px', layout: createLayoutDefaults() },
    social: { networks: ['Instagram', 'TikTok', 'YouTube'], layout: createLayoutDefaults() }
};

if (typeof window !== 'undefined') {
    window.COMPONENT_DEFAULTS_BASE = JSON.parse(JSON.stringify(componentDefaults));
    window.applyComponentDefaultsFromStorage = applyComponentDefaultsFromStorage;
    window.persistComponentDefaults = persistComponentDefaults;
}

const FONT_OPTIONS = `
    <option value="inherit">Inherit / System</option>
    <option value="Arial, sans-serif">Arial</option>
    <option value="'Arial Black', sans-serif">Arial Black</option>
    <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica Neue</option>
    <option value="Helvetica, sans-serif">Helvetica</option>
    <option value="Verdana, sans-serif">Verdana</option>
    <option value="Tahoma, sans-serif">Tahoma</option>
    <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
    <option value="'Times New Roman', serif">Times New Roman</option>
    <option value="Georgia, serif">Georgia</option>
    <option value="'Palatino Linotype', 'Book Antiqua', Palatino, serif">Palatino</option>
    <option value="Garamond, serif">Garamond</option>
    <option value="'Courier New', monospace">Courier New</option>
    <option value="'Lucida Sans Unicode', 'Lucida Grande', sans-serif">Lucida Sans</option>
    <option value="'Lucida Console', monospace">Lucida Console</option>
    <option value="Impact, sans-serif">Impact</option>
    <option value="'Comic Sans MS', 'Comic Sans', cursive">Comic Sans MS</option>
`;
