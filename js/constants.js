const TEMPLATE_STYLE_PRESETS = [
  {
    id: 'ghost-minimal',
    name: 'Ghost Minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    accent: '#111827',
    accentText: '#ffffff',
    linkColor: '#2563eb',
    dividerColor: '#e2e8f0',
    preview: { ink: '#0f172a', glow: 'rgba(15, 23, 42, 0.08)' }
  },
  {
    id: 'citrus-pop',
    name: 'Citrus Pop',
    bgEmail: '#fffbeb',
    fontFamily: 'Verdana, sans-serif',
    fontColor: '#78350f',
    accent: '#f97316',
    accentText: '#1f1300',
    linkColor: '#ea580c',
    dividerColor: '#fde68a',
    preview: { ink: '#78350f', glow: 'rgba(249, 115, 22, 0.2)' }
  },
  {
    id: 'vapor-peach',
    name: 'Vapor Peach',
    bgEmail: '#fff1f2',
    fontFamily: 'Trebuchet MS, Verdana, sans-serif',
    fontColor: '#4c0519',
    accent: '#fb7185',
    accentText: '#4c0519',
    linkColor: '#e11d48',
    dividerColor: '#fecdd3',
    preview: { ink: '#4c0519', glow: 'rgba(251, 113, 133, 0.2)' }
  },
  {
    id: 'aqua-studio',
    name: 'Aqua Studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    accent: '#06b6d4',
    accentText: '#0b1120',
    linkColor: '#0284c7',
    dividerColor: '#bae6fd',
    preview: { ink: '#0f172a', glow: 'rgba(6, 182, 212, 0.2)' }
  },
  {
    id: 'mint-labs',
    name: 'Mint Labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    accent: '#10b981',
    accentText: '#ffffff',
    linkColor: '#047857',
    dividerColor: '#bbf7d0',
    preview: { ink: '#064e3b', glow: 'rgba(16, 185, 129, 0.2)' }
  },
  {
    id: 'editorial-serif',
    name: 'Editorial Serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    accent: '#7c2d12',
    accentText: '#ffffff',
    linkColor: '#b45309',
    dividerColor: '#fed7aa',
    preview: { ink: '#1f2937', glow: 'rgba(124, 45, 18, 0.2)' }
  },
  {
    id: 'mono-ink',
    name: 'Mono Ink',
    bgEmail: '#f5f5f4',
    fontFamily: "'Courier New', monospace",
    fontColor: '#1c1917',
    accent: '#111827',
    accentText: '#ffffff',
    linkColor: '#111827',
    dividerColor: '#e7e5e4',
    preview: { ink: '#1c1917', glow: 'rgba(28, 25, 23, 0.12)' }
  },
  {
    id: 'midnight-neon',
    name: 'Midnight Neon',
    bgEmail: '#0b1120',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#e2e8f0',
    accent: '#38bdf8',
    accentText: '#0b1120',
    linkColor: '#22d3ee',
    dividerColor: '#1e293b',
    preview: { ink: '#e2e8f0', glow: 'rgba(56, 189, 248, 0.3)' }
  },
  {
    id: 'rose-noir',
    name: 'Rose Noir',
    bgEmail: '#1f1134',
    fontFamily: 'Verdana, sans-serif',
    fontColor: '#f8fafc',
    accent: '#f472b6',
    accentText: '#1f1134',
    linkColor: '#f9a8d4',
    dividerColor: '#3b1d59',
    preview: { ink: '#f8fafc', glow: 'rgba(244, 114, 182, 0.28)' }
  },
  {
    id: 'cobalt-cloud',
    name: 'Cobalt Cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    accent: '#6366f1',
    accentText: '#ffffff',
    linkColor: '#4338ca',
    dividerColor: '#c7d2fe',
    preview: { ink: '#111827', glow: 'rgba(99, 102, 241, 0.2)' }
  }
];

const MAILPAW_SUPPORT_URL = 'https://buymeacoffee.com/barryanders';
const MAILPAW_REPO_URL = 'https://github.com/barryanders/MailPaw';

const STYLE_PRESET_BG_FALLBACKS = {
  '#f8fafc': 'ghost-minimal',
  '#f1f5f9': 'ghost-minimal',
  '#0f172a': 'midnight-neon'
};

const normalizeColorToken = (value) => String(value || '').trim().toLowerCase();

function findStylePresetById(presetId) {
  if (!presetId || !Array.isArray(TEMPLATE_STYLE_PRESETS)) return null;
  return TEMPLATE_STYLE_PRESETS.find((preset) => preset.id === presetId) || null;
}

function resolveStylePresetForTemplate(template) {
  if (!Array.isArray(TEMPLATE_STYLE_PRESETS) || !TEMPLATE_STYLE_PRESETS.length) return null;
  if (!template) return TEMPLATE_STYLE_PRESETS[0] || null;
  const directId = template.stylePresetId || template.presetId || template.preset;
  if (directId) return findStylePresetById(directId) || TEMPLATE_STYLE_PRESETS[0];
  const bg = normalizeColorToken(template.bgEmail || template.background || '');
  if (bg) {
    const fallbackId = STYLE_PRESET_BG_FALLBACKS[bg];
    if (fallbackId) return findStylePresetById(fallbackId) || TEMPLATE_STYLE_PRESETS[0];
    const exact = TEMPLATE_STYLE_PRESETS.find((preset) => normalizeColorToken(preset.bgEmail) === bg);
    if (exact) return exact;
  }
  return TEMPLATE_STYLE_PRESETS[0] || null;
}

if (typeof window !== 'undefined') {
  window.findStylePresetById = findStylePresetById;
  window.resolveStylePresetForTemplate = resolveStylePresetForTemplate;
}

const MP_SOCIALS = ['Instagram', 'LinkedIn', 'YouTube'];
const MP_SITE = 'https://example.com';

function mpImage(seed, width = 1200, height = 720) {
  return 'https://picsum.photos/seed/mailpaw-' + seed + '/' + width + '/' + height;
}

function mpLayout(options = {}) {
  const layout = {};
  if (options.padding) layout.padding = options.padding;
  if (options.marginBottom) layout.marginBottom = options.marginBottom;
  if (options.radius) layout.radius = options.radius;
  if (options.borderWidth) layout.borderWidth = options.borderWidth;
  if (options.borderColor) layout.borderColor = options.borderColor;
  return layout;
}

function mpText(html, options = {}) {
  return {
    type: 'text',
    html,
    color: options.color,
    size: options.size,
    align: options.align,
    lineHeight: options.lineHeight,
    background: options.background,
    layout: options.layout
  };
}

function mpHeading(text, options = {}) {
  return {
    type: 'heading',
    text,
    size: options.size || '28px',
    color: options.color,
    align: options.align,
    weight: options.weight
  };
}

function mpButton(text, href = MP_SITE, options = {}) {
  return {
    type: 'button',
    text,
    href,
    align: options.align || 'left',
    bg: options.bg,
    color: options.color,
    radius: options.radius || '999px'
  };
}

function mpCard(html, options = {}) {
  return mpText(html, {
    color: options.color,
    size: options.size,
    align: options.align,
    lineHeight: options.lineHeight,
    background: options.background || '#ffffff',
    layout: mpLayout({
      padding: options.padding || '14px',
      radius: options.radius || '14px',
      borderWidth: options.borderWidth || '1',
      borderColor: options.borderColor || '#e2e8f0',
      marginBottom: options.marginBottom
    })
  });
}

function mpMetric(value, label, options = {}) {
  return mpCard('<strong style="font-size:22px;">' + value + '</strong><br>' + label, {
    color: options.color,
    background: options.background,
    borderColor: options.borderColor,
    align: options.align || 'center',
    padding: options.padding || '12px'
  });
}

function mpGrid(cols, columns, options = {}) {
  return {
    type: 'grid',
    cols,
    columns,
    background: options.background,
    layout: options.layout
  };
}

function mpHero(seed, options = {}) {
  return {
    type: 'image',
    src: mpImage(seed, options.width || 1200, options.height || 720),
    alt: options.alt || 'Decorative email image',
    radius: options.radius || '18px'
  };
}

function mpDivider(color = '#e2e8f0', width = '100%') {
  return { type: 'divider', color, width, thickness: '1px' };
}

function mpSocial(networks = MP_SOCIALS) {
  return { type: 'social', networks };
}

function mpFooter(text, color = '#94a3b8') {
  return mpText(text, { size: '11px', color, align: 'center' });
}

const DEFAULT_TEMPLATE_SPECS = [
  {
    id: 'tpl-curated-radar-newsletter',
    title: 'Signal Radar Newsletter',
    category: 'Newsletter',
    subject: 'This week on the radar: three useful signals',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpText('WEEKLY RADAR / ISSUE 18', { size: '12px', color: '#64748b', align: 'center' }),
      mpHeading('Three signals worth your attention', { size: '32px', align: 'center' }),
      mpText('A tight briefing for people who want the useful part first: one trend, one tactic, one question to carry into the week.', { color: '#475569', align: 'center' }),
      mpHero('signal-radar', { alt: 'Abstract desk with notebook and color cards' }),
      mpGrid(3, [
        [mpCard('<strong>01 / Trend</strong><br>Small teams are replacing bloated campaign calendars with compact weekly editorial rituals.', { background: '#f8fafc' })],
        [mpCard('<strong>02 / Tactic</strong><br>Write the subject line after the CTA. It keeps the email honest about the action you want.', { background: '#f8fafc' })],
        [mpCard('<strong>03 / Question</strong><br>What would this email look like if it only had to earn one click?', { background: '#f8fafc' })]
      ]),
      mpButton('Read the full briefing', MP_SITE + '/briefing'),
      mpFooter('You are receiving this because you asked for practical marketing notes.')
    ]
  },
  {
    id: 'tpl-curated-founder-field-note',
    title: 'Founder Field Note',
    category: 'Newsletter',
    subject: 'A field note from the founder',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      mpText('FIELD NOTE', { size: '12px', color: '#9a3412' }),
      mpHeading('What changed after we listened harder', { size: '30px' }),
      mpText('Hi there,<br><br>This month we stopped trying to add more features and started removing every step that made the product feel heavy. The result is quieter, faster, and easier to trust.', { color: '#475569', lineHeight: '1.8' }),
      mpCard('<blockquote>The best product work this month came from asking what people were already trying to do.</blockquote>', { background: '#ffffff', borderColor: '#fed7aa', color: '#1f2937' }),
      mpGrid(2, [
        [mpHeading('Shipped', { size: '17px' }), mpText('&bull; Faster first-run setup<br>&bull; Cleaner exports<br>&bull; Simpler account settings', { color: '#475569' })],
        [mpHeading('Next', { size: '17px' }), mpText('&bull; Better examples<br>&bull; More reusable patterns<br>&bull; A smaller learning curve', { color: '#475569' })]
      ]),
      mpButton('Read the full note', MP_SITE + '/founder-note'),
      mpText('Thanks for building with us,<br>Maya', { color: '#475569' })
    ]
  },
  {
    id: 'tpl-curated-visual-digest',
    title: 'Visual Digest',
    category: 'Newsletter',
    subject: 'A visual digest for your week',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpHero('visual-digest-hero', { alt: 'Colorful workspace collage' }),
      mpHeading('The visual digest', { size: '31px', align: 'center' }),
      mpText('A curated set of stories, tools, and small ideas to make the next thing easier to ship.', { color: '#475569', align: 'center' }),
      mpGrid(2, [
        [mpHero('visual-digest-one', { width: 800, height: 520, radius: '14px' }), mpText('DESIGN', { size: '11px', color: '#0891b2' }), mpHeading('A calmer way to launch', { size: '17px' }), mpText('Why fewer sections can make a product email feel more expensive.', { color: '#475569' })],
        [mpHero('visual-digest-two', { width: 800, height: 520, radius: '14px' }), mpText('OPERATIONS', { size: '11px', color: '#0891b2' }), mpHeading('The tiny checklist that saved Friday', { size: '17px' }), mpText('A five-minute QA ritual for emails that go out under pressure.', { color: '#475569' })]
      ]),
      mpCard('<strong>Reader prompt</strong><br>Reply with the one email you keep rewriting from scratch. We may turn it into a future template.', { background: '#ffffff', borderColor: '#bae6fd' }),
      mpButton('Open the archive', MP_SITE + '/archive', { align: 'center' })
    ]
  },
  {
    id: 'tpl-curated-metrics-memo',
    title: 'Metrics Memo',
    category: 'Newsletter',
    subject: 'The monthly metrics memo',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#f5f5f4',
    fontFamily: "'Courier New', monospace",
    fontColor: '#1c1917',
    blocks: [
      mpText('MONTHLY MEMO', { size: '12px', color: '#78716c' }),
      mpHeading('The numbers moved. Here is why.', { size: '28px' }),
      mpGrid(3, [
        [mpMetric('+18%', 'Activation lift', { borderColor: '#d6d3d1' })],
        [mpMetric('2.4x', 'More saved templates', { borderColor: '#d6d3d1' })],
        [mpMetric('-31%', 'Support questions', { borderColor: '#d6d3d1' })]
      ]),
      mpGrid(2, [
        [mpHeading('What worked', { size: '16px' }), mpText('&bull; The new welcome flow explained less and showed more.<br>&bull; Templates were grouped by job, not by department.<br>&bull; Backup reminders reduced anxiety.', { color: '#57534e' })],
        [mpHeading('What needs attention', { size: '16px' }), mpText('&bull; Mobile editing still needs fewer visible controls.<br>&bull; Export language should be plainer.<br>&bull; Examples need stronger finished copy.', { color: '#57534e' })]
      ]),
      mpCard('<strong>Focus for next month</strong><br>Make the first useful export happen in under three minutes.', { borderColor: '#d6d3d1' }),
      mpButton('Open the dashboard', MP_SITE + '/dashboard')
    ]
  },
  {
    id: 'tpl-curated-editorial-roundup',
    title: 'Editorial Roundup',
    category: 'Newsletter',
    subject: 'Five links worth saving',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      mpHeading('Five links worth saving', { size: '30px' }),
      mpText('A sharp, skimmable roundup for readers who want useful links without a wall of commentary.', { color: '#475569' }),
      mpDivider('#c7d2fe'),
      mpCard('<strong>01. The launch teardown</strong><br>A practical breakdown of why a simple release email outperformed a full campaign.', { borderColor: '#c7d2fe' }),
      mpCard('<strong>02. The retention map</strong><br>A visual model for spotting where customers quietly drift away.', { borderColor: '#c7d2fe' }),
      mpCard('<strong>03. The writing checklist</strong><br>Ten questions that make newsletter drafts more useful before they get prettier.', { borderColor: '#c7d2fe' }),
      mpGrid(2, [
        [mpCard('<strong>Save for later</strong><br>The two reads that pair best with a coffee break.', { background: '#ffffff', borderColor: '#c7d2fe' })],
        [mpCard('<strong>Share with</strong><br>A teammate who keeps asking for cleaner launch examples.', { background: '#ffffff', borderColor: '#c7d2fe' })]
      ]),
      mpButton('Browse all links', MP_SITE + '/links'),
      mpFooter('Forwarded by a friend? Subscribe for next week.')
    ]
  },
  {
    id: 'tpl-curated-neon-launch',
    title: 'Neon Product Launch',
    category: 'Launch',
    subject: 'Meet Nightlight Studio',
    tier: 'free',
    stylePresetId: 'midnight-neon',
    bgEmail: '#0b1120',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#e2e8f0',
    blocks: [
      mpText('NEW RELEASE', { size: '12px', color: '#38bdf8', align: 'center' }),
      mpHeading('Meet Nightlight Studio', { size: '34px', align: 'center', color: '#f8fafc' }),
      mpText('A faster way to shape campaign assets, export clean HTML, and keep the final draft close to your team.', { color: '#cbd5e1', align: 'center' }),
      mpButton('Try the new studio', MP_SITE + '/launch', { align: 'center', bg: '#38bdf8', color: '#0b1120' }),
      mpHero('neon-launch', { alt: 'Dark product scene with bright blue highlights' }),
      mpGrid(3, [
        [mpHeading('Fast', { size: '16px', color: '#f8fafc' }), mpText('Start from strong examples instead of blank screens.', { color: '#cbd5e1' })],
        [mpHeading('Local', { size: '16px', color: '#f8fafc' }), mpText('Keep saved drafts in your browser unless you export them.', { color: '#cbd5e1' })],
        [mpHeading('Portable', { size: '16px', color: '#f8fafc' }), mpText('Copy finished email content for tools that accept formatted paste.', { color: '#cbd5e1' })]
      ], { background: '#111827', layout: mpLayout({ padding: '12px', radius: '16px', borderWidth: '1', borderColor: '#1f2937' }) }),
      mpFooter('You are getting this because you joined the launch list.', '#94a3b8')
    ]
  },
  {
    id: 'tpl-curated-waitlist-open',
    title: 'Waitlist Opening',
    category: 'Launch',
    subject: 'The waitlist is open',
    tier: 'free',
    stylePresetId: 'vapor-peach',
    bgEmail: '#fff1f2',
    fontFamily: 'Trebuchet MS, Verdana, sans-serif',
    fontColor: '#4c0519',
    blocks: [
      mpHeading('The waitlist is open', { size: '30px', align: 'center', color: '#4c0519' }),
      mpText('Early access starts with the people who helped shape the idea. You are invited to claim a spot before the public launch.', { color: '#9f1239', align: 'center' }),
      mpHero('waitlist-open', { alt: 'Soft product preview on pink background' }),
      mpGrid(2, [
        [mpCard('<strong>What you get</strong><br>Early onboarding, a private setup guide, and direct feedback windows with the team.', { borderColor: '#fecdd3', color: '#4c0519' })],
        [mpCard('<strong>Who it is for</strong><br>Creators, founders, and operators who send useful emails without wanting another heavy platform.', { borderColor: '#fecdd3', color: '#4c0519' })]
      ]),
      mpButton('Join the waitlist', MP_SITE + '/waitlist', { align: 'center', bg: '#e11d48', color: '#ffffff' }),
      mpFooter('Early access invitations go out in small weekly batches.', '#9f1239')
    ]
  },
  {
    id: 'tpl-curated-feature-reveal',
    title: 'Feature Reveal',
    category: 'Launch',
    subject: 'New: smarter reusable blocks',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpText('FEATURE RELEASE', { size: '12px', color: '#0891b2' }),
      mpHeading('Reusable blocks just got smarter', { size: '29px' }),
      mpText('You can now start with polished sections, tune the details, and export a finished email without rebuilding the same layout every week.', { color: '#475569' }),
      mpGrid(2, [
        [mpHeading('Before', { size: '16px' }), mpText('Copy last week&apos;s email, delete the wrong parts, fix broken spacing, then hope nothing shifted.', { color: '#475569' })],
        [mpHeading('Now', { size: '16px' }), mpText('Add a section, edit the content, save the template, and keep a backup copy when it matters.', { color: '#475569' })]
      ]),
      mpCard('<strong>Available today</strong><br>The update is live for everyone. No plan, trial, or account required.', { borderColor: '#bae6fd' }),
      mpButton('Open the builder', MP_SITE + '/app', { bg: '#06b6d4', color: '#0b1120' })
    ]
  },
  {
    id: 'tpl-curated-collection-drop',
    title: 'Collection Drop',
    category: 'Launch',
    subject: 'The Sunday Goods drop is live',
    tier: 'free',
    stylePresetId: 'citrus-pop',
    bgEmail: '#fffbeb',
    fontFamily: 'Verdana, sans-serif',
    fontColor: '#78350f',
    blocks: [
      mpHeading('Sunday Goods is live', { size: '32px', align: 'center', color: '#78350f' }),
      mpText('A small seasonal drop built around warm color, practical carry, and things that age well.', { color: '#92400e', align: 'center' }),
      mpGrid(3, [
        [mpHero('drop-canvas', { width: 640, height: 420, radius: '14px' }), mpText('<strong>Canvas Tote</strong><br>$48', { size: '12px', color: '#92400e', align: 'center' })],
        [mpHero('drop-mug', { width: 640, height: 420, radius: '14px' }), mpText('<strong>Studio Mug</strong><br>$28', { size: '12px', color: '#92400e', align: 'center' })],
        [mpHero('drop-blanket', { width: 640, height: 420, radius: '14px' }), mpText('<strong>Desk Blanket</strong><br>$72', { size: '12px', color: '#92400e', align: 'center' })]
      ]),
      mpCard('<strong>Launch window</strong><br>Available through Sunday night or until the first run sells out.', { borderColor: '#fde68a', color: '#78350f' }),
      mpButton('Shop the drop', MP_SITE + '/shop', { align: 'center', bg: '#f97316', color: '#1f1300' })
    ]
  },
  {
    id: 'tpl-curated-partner-collab',
    title: 'Partner Collaboration',
    category: 'Launch',
    subject: 'A new collaboration with Northstar Studio',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      mpText('COLLABORATION', { size: '12px', color: '#4338ca', align: 'center' }),
      mpHeading('Northstar Studio x Fieldkit', { size: '30px', align: 'center' }),
      mpHero('partner-collab', { alt: 'Two creative teams reviewing product boards' }),
      mpText('We teamed up to create a compact planning kit for launch teams who need fewer meetings and clearer handoffs.', { color: '#475569', align: 'center' }),
      mpGrid(2, [
        [mpCard('<strong>Inside the kit</strong><br>Launch checklist, asset map, status email, and retrospective prompts.', { borderColor: '#c7d2fe' })],
        [mpCard('<strong>Best for</strong><br>Small teams coordinating launches across design, content, and operations.', { borderColor: '#c7d2fe' })]
      ]),
      mpButton('See the collaboration', MP_SITE + '/collab', { align: 'center' })
    ]
  },
  {
    id: 'tpl-curated-seasonal-sale',
    title: 'Seasonal Sale',
    category: 'Promotion',
    subject: 'A warm weekend sale',
    tier: 'free',
    stylePresetId: 'citrus-pop',
    bgEmail: '#fffbeb',
    fontFamily: 'Verdana, sans-serif',
    fontColor: '#78350f',
    blocks: [
      mpText('WEEKEND ONLY', { size: '12px', color: '#ea580c', align: 'center' }),
      mpHeading('Warm up your workspace', { size: '31px', align: 'center', color: '#78350f' }),
      mpText('Take 20% off reader favorites through Monday. No mystery countdowns, just a straightforward seasonal thank you.', { color: '#92400e', align: 'center' }),
      mpButton('Shop the sale', MP_SITE + '/sale', { align: 'center', bg: '#f97316', color: '#1f1300' }),
      mpHero('seasonal-sale', { alt: 'Warm desktop product arrangement' }),
      mpGrid(2, [
        [mpCard('<strong>Use code</strong><br>WARM20', { align: 'center', borderColor: '#fde68a', color: '#78350f' })],
        [mpCard('<strong>Ends</strong><br>Monday at midnight', { align: 'center', borderColor: '#fde68a', color: '#78350f' })]
      ]),
      mpFooter('Discount applies at checkout while supplies last.', '#92400e')
    ]
  },
  {
    id: 'tpl-curated-vip-access',
    title: 'VIP Early Access',
    category: 'Promotion',
    subject: 'Your early access window is open',
    tier: 'free',
    stylePresetId: 'midnight-neon',
    bgEmail: '#0b1120',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#e2e8f0',
    blocks: [
      mpHeading('Your early access window is open', { size: '31px', align: 'center', color: '#f8fafc' }),
      mpText('You are receiving this before the public announcement because you joined the first-look list.', { color: '#cbd5e1', align: 'center' }),
      mpButton('Unlock early access', MP_SITE + '/vip', { align: 'center', bg: '#38bdf8', color: '#0b1120' }),
      mpGrid(3, [
        [mpMetric('48 hrs', 'Private access', { background: '#111827', borderColor: '#1f2937', color: '#e2e8f0' })],
        [mpMetric('15%', 'Launch savings', { background: '#111827', borderColor: '#1f2937', color: '#e2e8f0' })],
        [mpMetric('1:1', 'Setup help', { background: '#111827', borderColor: '#1f2937', color: '#e2e8f0' })]
      ]),
      mpCard('<strong>Access note</strong><br>When the public page opens, early access pricing will disappear automatically.', { background: '#0f172a', borderColor: '#1f2937', color: '#e2e8f0' })
    ]
  },
  {
    id: 'tpl-curated-referral-invite',
    title: 'Referral Invite',
    category: 'Promotion',
    subject: 'Give a month, get a month',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    blocks: [
      mpHeading('Give a month, get a month', { size: '28px' }),
      mpText('Invite a friend who would actually use this. When they join, you both get a free month added to your accounts.', { color: '#065f46' }),
      mpGrid(3, [
        [mpHeading('1', { size: '22px', align: 'center' }), mpText('Share your referral link.', { color: '#065f46', align: 'center' })],
        [mpHeading('2', { size: '22px', align: 'center' }), mpText('They create their first project.', { color: '#065f46', align: 'center' })],
        [mpHeading('3', { size: '22px', align: 'center' }), mpText('You both get credit.', { color: '#065f46', align: 'center' })]
      ], { background: '#ffffff', layout: mpLayout({ padding: '12px', radius: '16px', borderWidth: '1', borderColor: '#bbf7d0' }) }),
      mpButton('Get my referral link', MP_SITE + '/referral'),
      mpFooter('Credits apply after the referred account is active.', '#047857')
    ]
  },
  {
    id: 'tpl-curated-bundle-offer',
    title: 'Bundle Offer',
    category: 'Promotion',
    subject: 'The operator bundle is live',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#f5f5f4',
    fontFamily: "'Courier New', monospace",
    fontColor: '#1c1917',
    blocks: [
      mpText('BUNDLE / 04', { size: '12px', color: '#78716c' }),
      mpHeading('The operator bundle', { size: '30px' }),
      mpText('Templates, checklists, and example messages for people who coordinate launches without wanting a project-management theater production.', { color: '#57534e' }),
      mpGrid(2, [
        [mpHeading('Included', { size: '16px' }), mpText('&bull; Launch status email<br>&bull; Weekly metrics memo<br>&bull; Customer update<br>&bull; Event recap', { color: '#57534e' })],
        [mpHeading('Bonus', { size: '16px' }), mpText('A one-page QA checklist for catching broken links, unclear CTAs, and weird spacing before sending.', { color: '#57534e' })]
      ]),
      mpHero('bundle-offer', { alt: 'Organized bundle of cards and checklists' }),
      mpButton('Download the bundle', MP_SITE + '/bundle', { bg: '#111827', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-curated-gift-guide',
    title: 'Gift Guide',
    category: 'Promotion',
    subject: 'A useful gift guide',
    tier: 'free',
    stylePresetId: 'vapor-peach',
    bgEmail: '#fff1f2',
    fontFamily: 'Trebuchet MS, Verdana, sans-serif',
    fontColor: '#4c0519',
    blocks: [
      mpHeading('Gifts that will not become clutter', { size: '29px', align: 'center', color: '#4c0519' }),
      mpText('A short guide for practical people, desk people, cozy people, and the person who says they do not need anything.', { color: '#9f1239', align: 'center' }),
      mpGrid(3, [
        [mpHero('gift-notebook', { width: 640, height: 420, radius: '14px' }), mpText('<strong>For note-takers</strong><br>The daily desk set', { size: '12px', color: '#9f1239', align: 'center' })],
        [mpHero('gift-coffee', { width: 640, height: 420, radius: '14px' }), mpText('<strong>For slow mornings</strong><br>The thermal mug', { size: '12px', color: '#9f1239', align: 'center' })],
        [mpHero('gift-bag', { width: 640, height: 420, radius: '14px' }), mpText('<strong>For commuters</strong><br>The canvas carryall', { size: '12px', color: '#9f1239', align: 'center' })]
      ]),
      mpButton('Shop the guide', MP_SITE + '/gift-guide', { align: 'center', bg: '#e11d48', color: '#ffffff' }),
      mpFooter('Order by December 15 for standard holiday delivery.', '#9f1239')
    ]
  },
  {
    id: 'tpl-curated-changelog-clean',
    title: 'Clean Changelog',
    category: 'Product',
    subject: 'What changed this week',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpText('CHANGELOG', { size: '12px', color: '#64748b' }),
      mpHeading('What changed this week', { size: '29px' }),
      mpText('A focused update for people who want to know what is better, what is fixed, and whether they need to do anything.', { color: '#475569' }),
      mpGrid(2, [
        [mpHeading('New', { size: '16px' }), mpText('&bull; Faster export previews<br>&bull; Cleaner mobile editor controls<br>&bull; More useful example templates', { color: '#475569' })],
        [mpHeading('Fixed', { size: '16px' }), mpText('&bull; Toolbar buttons no longer disappear<br>&bull; Empty-state language matches the app<br>&bull; Copy Email is clearer', { color: '#475569' })]
      ]),
      mpCard('<strong>Do you need to do anything?</strong><br>No. The update is available the next time you open the app.', { background: '#f8fafc' }),
      mpButton('View all changes', MP_SITE + '/changelog')
    ]
  },
  {
    id: 'tpl-curated-roadmap-preview',
    title: 'Roadmap Preview',
    category: 'Product',
    subject: 'A preview of what is next',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      mpHeading('A preview of what is next', { size: '29px' }),
      mpText('Here is where the product is headed and how your feedback is shaping the order of work.', { color: '#475569' }),
      mpGrid(3, [
        [mpCard('<strong>Now</strong><br>Cleaner editing on mobile and stronger built-in examples.', { borderColor: '#c7d2fe' })],
        [mpCard('<strong>Next</strong><br>Better import previews and safer backup restore flows.', { borderColor: '#c7d2fe' })],
        [mpCard('<strong>Later</strong><br>Optional theme packs and more email-client testing notes.', { borderColor: '#c7d2fe' })]
      ]),
      mpText('If one of these matters more than the others, reply and tell us where the pain is strongest.', { color: '#475569' }),
      mpButton('Share feedback', MP_SITE + '/feedback')
    ]
  },
  {
    id: 'tpl-curated-feature-spotlight',
    title: 'Feature Spotlight',
    category: 'Product',
    subject: 'Feature spotlight: local backups',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    blocks: [
      mpHero('backup-spotlight', { alt: 'Folder and backup drive on a desk' }),
      mpHeading('Feature spotlight: local backups', { size: '28px' }),
      mpText('Your templates live in your browser for privacy. Backups give you the same local control without putting all your work at the mercy of one device.', { color: '#065f46' }),
      mpGrid(2, [
        [mpHeading('Why it matters', { size: '16px' }), mpText('&bull; Move templates between browsers<br>&bull; Keep a copy before clearing storage<br>&bull; Restore after switching devices', { color: '#065f46' })],
        [mpHeading('How to use it', { size: '16px' }), mpText('Open Actions, choose Download Backup Copy, and store the JSON file somewhere you already trust.', { color: '#065f46' })]
      ]),
      mpButton('Open backup guide', MP_SITE + '/backup'),
      mpFooter('Tip: download a backup after any template you would hate to lose.', '#047857')
    ]
  },
  {
    id: 'tpl-curated-integration-announce',
    title: 'Integration Announcement',
    category: 'Product',
    subject: 'New integration: Notion export',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#f5f5f4',
    fontFamily: "'Courier New', monospace",
    fontColor: '#1c1917',
    blocks: [
      mpHeading('New integration: Notion export', { size: '28px', align: 'center' }),
      mpText('Document finished campaigns where your team already keeps project notes.', { color: '#57534e', align: 'center' }),
      mpHero('integration-notion', { alt: 'Connected cards showing workflow integration' }),
      mpGrid(2, [
        [mpHeading('What it sends', { size: '16px' }), mpText('&bull; Subject line<br>&bull; Final HTML<br>&bull; Backup JSON<br>&bull; Send notes', { color: '#57534e' })],
        [mpHeading('When to use it', { size: '16px' }), mpText('After approval, before send, or when archiving a reusable campaign for the next cycle.', { color: '#57534e' })]
      ]),
      mpButton('Connect Notion', MP_SITE + '/integrations', { align: 'center', bg: '#111827', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-curated-case-study',
    title: 'Customer Case Study',
    category: 'Product',
    subject: 'How Little Lantern shipped twice as fast',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      mpHero('case-study-lantern', { alt: 'Small team reviewing a launch board' }),
      mpHeading('How Little Lantern shipped twice as fast', { size: '29px' }),
      mpText('The team replaced scattered docs with three reusable email templates: launch, update, and recap.', { color: '#475569' }),
      mpCard('<blockquote>We stopped rewriting the same email every Friday and started improving the message instead.</blockquote>', { borderColor: '#fed7aa', color: '#1f2937' }),
      mpGrid(3, [
        [mpMetric('2x', 'Faster campaign setup', { borderColor: '#fed7aa' })],
        [mpMetric('38%', 'More replies', { borderColor: '#fed7aa' })],
        [mpMetric('0', 'Lost drafts', { borderColor: '#fed7aa' })]
      ]),
      mpButton('Read the story', MP_SITE + '/customers/little-lantern')
    ]
  },
  {
    id: 'tpl-curated-webinar-invite',
    title: 'Webinar Invite',
    category: 'Events',
    subject: 'Live workshop: better emails in 30 minutes',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpHero('webinar-invite', { alt: 'Workshop desk setup' }),
      mpHeading('Better emails in 30 minutes', { size: '29px' }),
      mpText('Join a live workshop on turning rough updates into emails people can actually scan, understand, and act on.', { color: '#475569' }),
      mpCard('<strong>Thursday, June 24</strong><br>10:00 AM Central<br>Replay available to everyone who registers.', { borderColor: '#bae6fd' }),
      mpGrid(2, [
        [mpHeading('You will learn', { size: '16px' }), mpText('&bull; How to shape one clear CTA<br>&bull; How to avoid design clutter<br>&bull; How to test formatted paste', { color: '#475569' })],
        [mpHeading('Good for', { size: '16px' }), mpText('Founders, creators, operators, and anyone sending updates without a full marketing team.', { color: '#475569' })]
      ]),
      mpButton('Reserve a seat', MP_SITE + '/workshop')
    ]
  },
  {
    id: 'tpl-curated-event-agenda',
    title: 'Event Agenda',
    category: 'Events',
    subject: 'The full agenda is here',
    tier: 'free',
    stylePresetId: 'rose-noir',
    bgEmail: '#1f1134',
    fontFamily: 'Verdana, sans-serif',
    fontColor: '#f8fafc',
    blocks: [
      mpText('AGENDA RELEASE', { size: '12px', color: '#f9a8d4', align: 'center' }),
      mpHeading('The full agenda is here', { size: '30px', color: '#f8fafc', align: 'center' }),
      mpText('Two days of practical sessions, calm networking, and examples you can adapt immediately.', { color: '#f3e8ff', align: 'center' }),
      mpButton('Get tickets', MP_SITE + '/tickets', { align: 'center', bg: '#f472b6', color: '#1f1134' }),
      mpGrid(2, [
        [mpHeading('Day one', { size: '16px', color: '#f8fafc' }), mpText('09:00 Opening notes<br>10:30 Campaign teardown<br>13:00 Working session<br>15:30 Founder panel', { color: '#f3e8ff' })],
        [mpHeading('Day two', { size: '16px', color: '#f8fafc' }), mpText('09:00 Customer stories<br>10:30 Email QA lab<br>13:00 Design clinic<br>15:00 Closing recap', { color: '#f3e8ff' })]
      ], { background: '#2a1845', layout: mpLayout({ padding: '12px', radius: '16px', borderWidth: '1', borderColor: '#3b1d59' }) }),
      mpFooter('Venue details and calendar holds arrive after registration.', '#f3e8ff')
    ]
  },
  {
    id: 'tpl-curated-event-recap',
    title: 'Event Recap',
    category: 'Events',
    subject: 'Highlights from yesterday',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpHeading('Highlights from yesterday', { size: '29px' }),
      mpText('Thank you for joining the workshop. Here are the notes, links, and next steps in one place.', { color: '#475569' }),
      mpHero('event-recap', { alt: 'Audience and workshop materials' }),
      mpGrid(2, [
        [mpHeading('Top takeaways', { size: '16px' }), mpText('&bull; Start with the reader&apos;s next action.<br>&bull; Keep section count low.<br>&bull; Always send yourself a test.', { color: '#475569' })],
        [mpHeading('Resources', { size: '16px' }), mpText('&bull; Slide deck<br>&bull; Replay link<br>&bull; Email QA checklist', { color: '#475569' })]
      ]),
      mpButton('Watch the replay', MP_SITE + '/replay'),
      mpFooter('Have feedback? Reply directly to this email.')
    ]
  },
  {
    id: 'tpl-curated-community-meetup',
    title: 'Community Meetup',
    category: 'Events',
    subject: 'Join us for a local meetup',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      mpHero('community-meetup', { alt: 'People gathered around a warm table' }),
      mpHeading('A small evening for useful conversations', { size: '28px' }),
      mpText('No stage, no pitch, no awkward badge wall. Just a relaxed meetup for people building independent projects.', { color: '#475569' }),
      mpGrid(2, [
        [mpCard('<strong>When</strong><br>Thursday, June 24<br>6:00 PM', { borderColor: '#fed7aa' })],
        [mpCard('<strong>Where</strong><br>The Cozy Studio<br>123 Market Street', { borderColor: '#fed7aa' })]
      ]),
      mpButton('Save my spot', MP_SITE + '/meetup'),
      mpFooter('Space is limited so the room stays conversational.', '#9a3412')
    ]
  },
  {
    id: 'tpl-curated-blog-digest',
    title: 'Blog Digest',
    category: 'Content',
    subject: 'Three posts for better launches',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpHeading('Three posts for better launches', { size: '29px' }),
      mpText('A short digest for teams trying to make launches feel clearer, calmer, and less improvised.', { color: '#475569' }),
      mpGrid(2, [
        [mpHero('blog-post-one', { width: 800, height: 520, radius: '14px' }), mpHeading('The launch email audit', { size: '16px' }), mpText('A practical way to find unclear CTAs before readers do.', { color: '#475569' })],
        [mpHero('blog-post-two', { width: 800, height: 520, radius: '14px' }), mpHeading('Better examples beat blank templates', { size: '16px' }), mpText('Why finished copy helps people customize faster.', { color: '#475569' })]
      ]),
      mpCard('<strong>Popular now</strong><br>The tiny checklist that catches broken links, weak subject lines, and layout drift.', { background: '#f8fafc' }),
      mpButton('Read the digest', MP_SITE + '/blog')
    ]
  },
  {
    id: 'tpl-curated-podcast-episode',
    title: 'Podcast Episode',
    category: 'Content',
    subject: 'New episode: designing for trust',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      mpHero('podcast-episode', { alt: 'Microphone and notes' }),
      mpText('EPISODE 42', { size: '12px', color: '#9a3412' }),
      mpHeading('Designing for trust before delight', { size: '28px' }),
      mpText('This week, designer Lena Ortiz joins us to talk about interfaces that explain themselves without flattening the brand.', { color: '#475569' }),
      mpGrid(2, [
        [mpHeading('Key moments', { size: '16px' }), mpText('&bull; Why onboarding should feel reversible<br>&bull; The danger of decorative complexity<br>&bull; How to make defaults feel thoughtful', { color: '#475569' })],
        [mpCard('<strong>Quote</strong><br>Trust is built when the user can predict what happens next.', { borderColor: '#fed7aa' })]
      ]),
      mpButton('Listen now', MP_SITE + '/podcast')
    ]
  },
  {
    id: 'tpl-curated-guide-release',
    title: 'Guide Release',
    category: 'Content',
    subject: 'New guide: the plain-English email QA checklist',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      mpHero('guide-release', { alt: 'Guide pages on a desk' }),
      mpHeading('The plain-English email QA checklist', { size: '29px' }),
      mpText('A compact guide for checking your message, links, layout, and backup plan before you send.', { color: '#475569' }),
      mpGrid(2, [
        [mpHeading('Inside', { size: '16px' }), mpText('&bull; Subject line checks<br>&bull; CTA clarity prompts<br>&bull; Mobile layout notes<br>&bull; Backup/export reminders', { color: '#475569' })],
        [mpHeading('Best for', { size: '16px' }), mpText('Newsletter writers, small teams, founders, and anyone who sends without a dedicated email QA department.', { color: '#475569' })]
      ]),
      mpButton('Download the guide', MP_SITE + '/guide'),
      mpFooter('PDF and checklist formats are both included.')
    ]
  },
  {
    id: 'tpl-curated-report-release',
    title: 'Research Report',
    category: 'Content',
    subject: 'New report: what readers actually click',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#f5f5f4',
    fontFamily: "'Courier New', monospace",
    fontColor: '#1c1917',
    blocks: [
      mpHeading('What readers actually click', { size: '28px' }),
      mpText('Findings from 1,200 small-team newsletters, product updates, and community emails.', { color: '#57534e' }),
      mpGrid(3, [
        [mpMetric('61%', 'Clicked a clear single CTA', { borderColor: '#d6d3d1' })],
        [mpMetric('27%', 'Clicked image-heavy layouts', { borderColor: '#d6d3d1' })],
        [mpMetric('3x', 'More replies to plain asks', { borderColor: '#d6d3d1' })]
      ]),
      mpCard('<strong>Top insight</strong><br>The most effective emails looked designed, but they read like a helpful person wrote them.', { borderColor: '#d6d3d1' }),
      mpButton('Download report', MP_SITE + '/report', { bg: '#111827', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-curated-video-series',
    title: 'Video Series',
    category: 'Content',
    subject: 'New video series: ship the useful thing',
    tier: 'free',
    stylePresetId: 'midnight-neon',
    bgEmail: '#0b1120',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#e2e8f0',
    blocks: [
      mpHeading('Ship the useful thing', { size: '32px', color: '#f8fafc', align: 'center' }),
      mpText('A three-part video series on cutting scope without making the work feel cheap.', { color: '#cbd5e1', align: 'center' }),
      mpHero('video-series', { alt: 'Video editing timeline and lights' }),
      mpGrid(3, [
        [mpHeading('01', { size: '18px', color: '#38bdf8', align: 'center' }), mpText('Find the useful core', { color: '#cbd5e1', align: 'center' })],
        [mpHeading('02', { size: '18px', color: '#38bdf8', align: 'center' }), mpText('Design for scanning', { color: '#cbd5e1', align: 'center' })],
        [mpHeading('03', { size: '18px', color: '#38bdf8', align: 'center' }), mpText('Make handoff boring', { color: '#cbd5e1', align: 'center' })]
      ], { background: '#111827', layout: mpLayout({ padding: '12px', radius: '16px', borderWidth: '1', borderColor: '#1f2937' }) }),
      mpButton('Watch episode one', MP_SITE + '/series', { align: 'center', bg: '#38bdf8', color: '#0b1120' })
    ]
  },
  {
    id: 'tpl-curated-welcome-lifecycle',
    title: 'Welcome Email',
    category: 'Lifecycle',
    subject: 'Welcome in. Here is the simple start.',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    blocks: [
      mpHeading('Welcome in', { size: '30px' }),
      mpText('You are set up. The fastest way to get value is to start with one useful template, customize it, and download a backup copy.', { color: '#065f46' }),
      mpGrid(3, [
        [mpHeading('1', { size: '22px', align: 'center' }), mpText('Pick an example that matches your job.', { color: '#065f46', align: 'center' })],
        [mpHeading('2', { size: '22px', align: 'center' }), mpText('Replace the copy with your voice.', { color: '#065f46', align: 'center' })],
        [mpHeading('3', { size: '22px', align: 'center' }), mpText('Copy the email or export a backup.', { color: '#065f46', align: 'center' })]
      ], { background: '#ffffff', layout: mpLayout({ padding: '12px', radius: '16px', borderWidth: '1', borderColor: '#bbf7d0' }) }),
      mpButton('Create my first template', MP_SITE + '/app'),
      mpFooter('No account required. Your work stays in local browser storage.', '#047857')
    ]
  },
  {
    id: 'tpl-curated-onboarding-day-one',
    title: 'Onboarding Day One',
    category: 'Lifecycle',
    subject: 'Day one: make one reusable email',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpText('DAY ONE', { size: '12px', color: '#0891b2' }),
      mpHeading('Make one reusable email today', { size: '28px' }),
      mpText('Do not try to organize everything at once. Start with the email you send most often and turn it into a clean reusable template.', { color: '#475569' }),
      mpCard('<strong>Suggested first template</strong><br>A weekly update, customer follow-up, event invite, or product announcement.', { borderColor: '#bae6fd' }),
      mpGrid(2, [
        [mpHeading('Keep', { size: '16px' }), mpText('The structure, spacing, and any sections that match your real workflow.', { color: '#475569' })],
        [mpHeading('Replace', { size: '16px' }), mpText('The sample copy, links, images, and any claims that are not yours.', { color: '#475569' })]
      ], { background: '#ffffff', layout: mpLayout({ padding: '12px', radius: '16px', borderWidth: '1', borderColor: '#bae6fd' }) }),
      mpButton('Open examples', MP_SITE + '/examples'),
      mpFooter('Tomorrow: how to save a backup before you start relying on local storage.')
    ]
  },
  {
    id: 'tpl-curated-backup-reminder',
    title: 'Backup Reminder',
    category: 'Lifecycle',
    subject: 'A quick reminder to back up your templates',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpHeading('Back up anything you would hate to lose', { size: '28px' }),
      mpText('Local storage is private and convenient, but it belongs to this browser. Download a backup copy when your template library starts to matter.', { color: '#475569' }),
      mpGrid(2, [
        [mpHeading('Good moments to back up', { size: '16px' }), mpText('&bull; After creating a template set<br>&bull; Before clearing browser data<br>&bull; Before switching devices', { color: '#475569' })],
        [mpHeading('Where to keep it', { size: '16px' }), mpText('Use a folder or drive you already trust for important documents. The backup is a JSON file.', { color: '#475569' })]
      ]),
      mpButton('Download a backup', MP_SITE + '/backup'),
      mpFooter('Privacy works best when you keep your own copy too.')
    ]
  },
  {
    id: 'tpl-curated-winback-note',
    title: 'Winback Note',
    category: 'Lifecycle',
    subject: 'Still useful, or should we part ways?',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      mpHeading('Still useful?', { size: '30px' }),
      mpText('We noticed you have not opened the last few updates. No hard feelings. Inboxes are crowded, and useful email should earn its place.', { color: '#475569', lineHeight: '1.8' }),
      mpCard('<strong>Stay if you want:</strong><br>Practical templates, small product notes, and examples you can adapt quickly.', { borderColor: '#fed7aa' }),
      mpGrid(2, [
        [mpButton('Keep me subscribed', MP_SITE + '/stay')],
        [mpButton('Pause updates', MP_SITE + '/pause', { bg: '#7c2d12', color: '#ffffff' })]
      ]),
      mpFooter('You can change this anytime from the footer of future emails.', '#9a3412')
    ]
  },
  {
    id: 'tpl-curated-trial-ending',
    title: 'Trial Ending',
    category: 'Lifecycle',
    subject: 'Your trial wraps up tomorrow',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      mpHeading('Your trial wraps up tomorrow', { size: '28px' }),
      mpText('Here is what you created, what happens next, and how to keep momentum without surprises.', { color: '#475569' }),
      mpGrid(3, [
        [mpMetric('6', 'Templates created', { borderColor: '#c7d2fe' })],
        [mpMetric('18', 'Exports copied', { borderColor: '#c7d2fe' })],
        [mpMetric('1', 'Backup saved', { borderColor: '#c7d2fe' })]
      ]),
      mpCard('<strong>Recommended next step</strong><br>Review your saved templates and download a fresh backup before the trial closes.', { borderColor: '#c7d2fe' }),
      mpButton('Review my workspace', MP_SITE + '/workspace')
    ]
  },
  {
    id: 'tpl-curated-order-confirmation',
    title: 'Order Confirmation',
    category: 'Transactional',
    subject: 'Order confirmed: #1048',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpHeading('Your order is confirmed', { size: '28px' }),
      mpText('Thanks for your order. We will send tracking as soon as it ships.', { color: '#475569' }),
      mpCard('<strong>Order #1048</strong><br>Studio Mug x 1<br>Canvas Tote x 1<br><br><strong>Total</strong> $76.00', { background: '#f8fafc' }),
      mpGrid(2, [
        [mpHeading('Shipping to', { size: '16px' }), mpText('Maya Chen<br>123 Cozy Lane<br>Portland, OR 97205', { color: '#475569' })],
        [mpHeading('Estimated arrival', { size: '16px' }), mpText('June 24-26<br>Standard shipping', { color: '#475569' })]
      ]),
      mpButton('View order', MP_SITE + '/orders/1048'),
      mpFooter('Need help? Reply to this email and we will take a look.')
    ]
  },
  {
    id: 'tpl-curated-shipping-update',
    title: 'Shipping Update',
    category: 'Transactional',
    subject: 'Your order is on the way',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    blocks: [
      mpHeading('Your order is on the way', { size: '28px' }),
      mpText('The package left our studio and should arrive soon. Tracking can take a few hours to update.', { color: '#065f46' }),
      mpCard('<strong>Tracking</strong><br>MP-8492-1138<br><strong>Carrier</strong><br>Ground', { borderColor: '#bbf7d0', color: '#064e3b' }),
      mpGrid(3, [
        [mpMetric('Packed', 'Step 1', { borderColor: '#bbf7d0', color: '#064e3b' })],
        [mpMetric('Shipped', 'Step 2', { borderColor: '#bbf7d0', color: '#064e3b' })],
        [mpMetric('Soon', 'Step 3', { borderColor: '#bbf7d0', color: '#064e3b' })]
      ]),
      mpButton('Track package', MP_SITE + '/tracking')
    ]
  },
  {
    id: 'tpl-curated-password-reset',
    title: 'Password Reset',
    category: 'Transactional',
    subject: 'Reset your password',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#f5f5f4',
    fontFamily: "'Courier New', monospace",
    fontColor: '#1c1917',
    blocks: [
      mpHeading('Reset your password', { size: '28px' }),
      mpText('We received a request to reset the password for your account. This link expires in 30 minutes.', { color: '#57534e' }),
      mpButton('Reset password', MP_SITE + '/reset-password', { bg: '#111827', color: '#ffffff' }),
      mpCard('<strong>Did not request this?</strong><br>You can ignore this email. Your password will stay the same.', { borderColor: '#d6d3d1' }),
      mpGrid(2, [
        [mpCard('<strong>Expires</strong><br>30 minutes', { background: '#ffffff', borderColor: '#d6d3d1', align: 'center' })],
        [mpCard('<strong>Requested from</strong><br>Portland, OR', { background: '#ffffff', borderColor: '#d6d3d1', align: 'center' })]
      ]),
      mpFooter('For security, never forward password reset emails.')
    ]
  },
  {
    id: 'tpl-curated-community-spotlight',
    title: 'Community Spotlight',
    category: 'Community',
    subject: 'Community spotlight: Lena Ortiz',
    tier: 'free',
    stylePresetId: 'vapor-peach',
    bgEmail: '#fff1f2',
    fontFamily: 'Trebuchet MS, Verdana, sans-serif',
    fontColor: '#4c0519',
    blocks: [
      mpHero('community-spotlight', { alt: 'Portrait-style workspace scene' }),
      mpHeading('Community spotlight: Lena Ortiz', { size: '28px' }),
      mpText('Lena runs a one-person design studio and uses reusable templates to keep client communication calm and consistent.', { color: '#9f1239' }),
      mpGrid(2, [
        [mpHeading('Favorite workflow', { size: '16px', color: '#4c0519' }), mpText('A Friday recap template with three sections: what shipped, what is blocked, and what needs a decision.', { color: '#9f1239' })],
        [mpHeading('Advice', { size: '16px', color: '#4c0519' }), mpText('Do not make every client email custom. Make the care custom and the structure reusable.', { color: '#9f1239' })]
      ]),
      mpButton('Read the spotlight', MP_SITE + '/community/lena', { bg: '#e11d48', color: '#ffffff' }),
      mpSocial(['Instagram', 'LinkedIn', 'YouTube'])
    ]
  },
  {
    id: 'tpl-curated-community-survey',
    title: 'Community Survey',
    category: 'Community',
    subject: 'Help shape what we build next',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpHeading('Help shape what we build next', { size: '28px' }),
      mpText('This short survey helps us understand which workflows deserve better examples, clearer docs, or fewer steps.', { color: '#475569' }),
      mpGrid(3, [
        [mpMetric('4 min', 'Time to complete', { borderColor: '#bae6fd' })],
        [mpMetric('12', 'Questions', { borderColor: '#bae6fd' })],
        [mpMetric('Friday', 'Deadline', { borderColor: '#bae6fd' })]
      ]),
      mpCard('<strong>Topics</strong><br>Mobile editing, backup habits, copy/export workflows, and the template categories you want next.', { borderColor: '#bae6fd' }),
      mpButton('Take the survey', MP_SITE + '/survey')
    ]
  },
  {
    id: 'tpl-curated-ambassador-program',
    title: 'Ambassador Program',
    category: 'Community',
    subject: 'Join the studio ambassador program',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    blocks: [
      mpHeading('Join the studio ambassador program', { size: '28px' }),
      mpText('We are looking for thoughtful operators and creators who like sharing tools that make work feel lighter.', { color: '#065f46' }),
      mpHero('ambassador-program', { alt: 'Creative community table' }),
      mpGrid(2, [
        [mpHeading('Ambassadors get', { size: '16px' }), mpText('&bull; Early feature previews<br>&bull; A private feedback channel<br>&bull; Shareable template packs', { color: '#065f46' })],
        [mpHeading('Good fit', { size: '16px' }), mpText('You teach, write, consult, build, or regularly help people send clearer messages.', { color: '#065f46' })]
      ]),
      mpButton('Apply to join', MP_SITE + '/ambassador')
    ]
  },
  {
    id: 'tpl-curated-company-milestone',
    title: 'Company Milestone',
    category: 'Company',
    subject: 'A milestone worth pausing for',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      mpHeading('A milestone worth pausing for', { size: '29px' }),
      mpText('This week we crossed 10,000 templates created. More importantly, those templates stayed in the hands of the people who made them.', { color: '#475569' }),
      mpGrid(3, [
        [mpMetric('10k', 'Templates created', { borderColor: '#c7d2fe' })],
        [mpMetric('84%', 'Used more than once', { borderColor: '#c7d2fe' })],
        [mpMetric('0', 'Accounts required', { borderColor: '#c7d2fe' })]
      ]),
      mpHero('company-milestone', { alt: 'Team celebrating a milestone' }),
      mpButton('Read the milestone note', MP_SITE + '/milestone')
    ]
  },
  {
    id: 'tpl-curated-hiring-highlight',
    title: 'Hiring Highlight',
    category: 'Company',
    subject: 'We are hiring a product designer',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpHeading('We are hiring a product designer', { size: '29px' }),
      mpText('We are looking for someone who can make powerful tools feel calm, obvious, and kind to the person using them.', { color: '#475569' }),
      mpGrid(2, [
        [mpHeading('You will work on', { size: '16px' }), mpText('&bull; Mobile editing flows<br>&bull; Template previews<br>&bull; Backup and import UX<br>&bull; Example library polish', { color: '#475569' })],
        [mpHeading('You might be a fit if', { size: '16px' }), mpText('You care about clarity, write strong interface copy, and can explain design decisions without hiding behind taste.', { color: '#475569' })]
      ]),
      mpButton('View the role', MP_SITE + '/careers'),
      mpFooter('Remote-friendly. Small team. Practical work.')
    ]
  },
  {
    id: 'tpl-curated-press-roundup',
    title: 'Press Roundup',
    category: 'Company',
    subject: 'Recent coverage and notes',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      mpHeading('Recent coverage and notes', { size: '29px' }),
      mpText('A few thoughtful mentions from people discussing local-first tools, email workflows, and simpler software.', { color: '#475569' }),
      mpGrid(2, [
        [mpCard('&quot;A reminder that privacy-first software can still feel friendly.&quot;<br><strong>Small Tools Weekly</strong>', { borderColor: '#fed7aa' })],
        [mpCard('&quot;The template examples are useful enough to teach the product.&quot;<br><strong>Operator Notes</strong>', { borderColor: '#fed7aa' })]
      ]),
      mpButton('Read all coverage', MP_SITE + '/press'),
      mpFooter('For interviews or media questions, reply to this email.', '#9a3412')
    ]
  }
];

const MAILPAW_EXAMPLE_TEMPLATE_SPECS = [
  {
    id: 'tpl-example-ink-gallery',
    title: 'Ink Gallery',
    category: 'Examples',
    subject: 'A stark gallery note with room to breathe',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpText('MAILPAW EXAMPLE 01', { size: '11px', color: '#64748b', align: 'center' }),
      mpHeading('Ink, white space, and one clear move', { size: '34px', align: 'center', color: '#0f172a' }),
      mpText('A crisp editorial layout for messages that need confidence without visual noise.', { color: '#475569', align: 'center' }),
      mpHero('ink-gallery-studio', { alt: 'Black and white studio desk with prints' }),
      mpDivider('#e2e8f0'),
      mpCard('<strong>Composition note</strong><br>Lead with one image, one idea, and one action. Everything else should earn its place.', { background: '#f8fafc', borderColor: '#e2e8f0', color: '#334155' }),
      mpButton('Open the collection', MP_SITE + '/collection', { align: 'center', bg: '#0f172a', color: '#ffffff' }),
      mpFooter('Made with MailPaw. Edit freely and keep your own backup.')
    ]
  },
  {
    id: 'tpl-example-noir-product',
    title: 'Noir Product',
    category: 'Examples',
    subject: 'The midnight product card',
    tier: 'free',
    stylePresetId: 'midnight-neon',
    bgEmail: '#0b1120',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontColor: '#e2e8f0',
    blocks: [
      mpText('NIGHT EDITION', { size: '12px', color: '#67e8f9', align: 'center' }),
      mpHeading('A darker frame for a brighter feature', { size: '33px', align: 'center', color: '#f8fafc' }),
      mpText('Use contrast, compact copy, and one electric accent to make a product feel premium without adding complexity.', { color: '#cbd5e1', align: 'center' }),
      mpButton('See what changed', MP_SITE + '/feature', { align: 'center', bg: '#67e8f9', color: '#0b1120' }),
      mpHero('noir-product-panel', { alt: 'Dark product interface with cyan highlights' }),
      mpCard('<strong>Designed for scanning</strong><br>Short blocks, generous spacing, and a single CTA keep the email readable on small screens.', { background: '#111827', borderColor: '#243044', color: '#dbeafe' }),
      mpFooter('You can replace the image, button, and copy in seconds.', '#94a3b8')
    ]
  },
  {
    id: 'tpl-example-soft-cloud',
    title: 'Soft Cloud',
    category: 'Examples',
    subject: 'A calm note with soft edges',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#f8fafc',
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontColor: '#0f172a',
    blocks: [
      mpHero('soft-cloud-letter', { alt: 'Soft blue workspace with folded paper' }),
      mpText('SOFT CLOUD', { size: '11px', color: '#64748b', align: 'center' }),
      mpHeading('A gentle layout for thoughtful updates', { size: '30px', align: 'center' }),
      mpText('A cool, airy example for personal notes, studio updates, or any message that should feel considered.', { color: '#475569', align: 'center' }),
      mpCard('<strong>Why it works</strong><br>The image gives the email warmth while the surrounding frame stays quiet and easy to read.', { background: '#ffffff', borderColor: '#dbe4ef', color: '#334155' }),
      mpButton('Read the update', MP_SITE + '/update', { align: 'center', bg: '#2563eb', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-museum-card',
    title: 'Museum Card',
    category: 'Examples',
    subject: 'A label-style feature card',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fbfbf9',
    fontFamily: 'Georgia, Times, serif',
    fontColor: '#1f2937',
    blocks: [
      mpText('CATALOGUE NO. 12', { size: '11px', color: '#6b7280' }),
      mpHeading('The object gets the spotlight', { size: '32px', color: '#111827' }),
      mpHero('museum-card-object', { alt: 'Minimal product object on a gallery plinth' }),
      mpCard('<strong>Label</strong><br>A refined single-column card inspired by gallery labels and exhibition notes. Best when the subject is visual and the copy can stay precise.', { background: '#ffffff', borderColor: '#d4d4d8', color: '#374151' }),
      mpDivider('#d4d4d8'),
      mpText('Replace the image, label, and CTA to turn this into a product feature, portfolio note, or curator-style announcement.', { color: '#4b5563', lineHeight: '1.8' }),
      mpButton('View details', MP_SITE + '/details', { bg: '#1f2937', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-color-block',
    title: 'Color Block',
    category: 'Examples',
    subject: 'A bold block-built email',
    tier: 'free',
    stylePresetId: 'citrus-pop',
    bgEmail: '#fffdf5',
    fontFamily: 'Verdana, Geneva, sans-serif',
    fontColor: '#111827',
    blocks: [
      mpCard('<span style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#075985;">Color Block</span><br><span style="font-size:30px;line-height:1.15;font-weight:800;color:#111827;">Big shapes, clean copy, no layout tricks.</span><br><br><span style="color:#475569;">A vivid example that still stays mobile-safe because the structure is vertical.</span>', { background: '#dff7ff', borderColor: '#bae6fd', color: '#111827' }),
      mpCard('<strong>01</strong><br>Use a bright card for the main message.', { background: '#fef3c7', borderColor: '#fde68a', color: '#713f12' }),
      mpCard('<strong>02</strong><br>Use a second block for proof, context, or a short list.', { background: '#dcfce7', borderColor: '#bbf7d0', color: '#14532d' }),
      mpButton('Use this structure', MP_SITE + '/blocks', { align: 'center', bg: '#111827', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-type-poster',
    title: 'Type Poster',
    category: 'Examples',
    subject: 'A poster-like email made from type',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#f4f4f5',
    fontFamily: "'Courier New', Courier, monospace",
    fontColor: '#18181b',
    blocks: [
      mpText('POSTER / EMAIL / SYSTEM', { size: '12px', color: '#71717a' }),
      mpHeading('Make the message the visual.', { size: '36px', color: '#18181b' }),
      mpDivider('#a1a1aa'),
      mpCard('<strong>When images are not the point</strong><br>Use scale, rhythm, and hard-working copy. This template feels designed without needing a complex composition.', { background: '#ffffff', borderColor: '#d4d4d8', color: '#3f3f46' }),
      mpText('01 / Short headline<br>02 / One useful paragraph<br>03 / One unmistakable action', { color: '#52525b', lineHeight: '1.9' }),
      mpButton('Start from type', MP_SITE + '/type', { bg: '#18181b', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-photo-letter',
    title: 'Photo Letter',
    category: 'Examples',
    subject: 'A warm photo-led letter',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontColor: '#111827',
    blocks: [
      mpHero('photo-letter-window', { alt: 'Natural light photo of a desk beside a window' }),
      mpHeading('A note that starts with atmosphere', { size: '31px' }),
      mpText('Hi there,<br><br>This example uses one strong photo and plain language so the email feels personal without becoming fragile or hard to paste.', { color: '#4b5563', lineHeight: '1.8' }),
      mpCard('<strong>Keep it human</strong><br>Use this when a message should sound like it came from a person, not a campaign machine.', { background: '#f8fafc', borderColor: '#e5e7eb', color: '#374151' }),
      mpButton('Reply with a thought', MP_SITE + '/reply', { bg: '#111827', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-luxe-minimal',
    title: 'Luxe Minimal',
    category: 'Examples',
    subject: 'A quiet luxury email layout',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fcfcfd',
    fontFamily: 'Georgia, Times, serif',
    fontColor: '#111827',
    blocks: [
      mpText('PRIVATE PREVIEW', { size: '11px', color: '#71717a', align: 'center' }),
      mpHeading('Less decoration. More presence.', { size: '34px', align: 'center' }),
      mpText('A premium-looking example built from restraint: centered type, a single image, thin rules, and controlled spacing.', { color: '#52525b', align: 'center', lineHeight: '1.8' }),
      mpDivider('#d4d4d8', '72%'),
      mpHero('luxe-minimal-materials', { alt: 'Minimal premium materials on a light surface' }),
      mpCard('<strong>Detail</strong><br>Use a short paragraph here for materials, process, availability, or one beautiful reason to click.', { background: '#ffffff', borderColor: '#d4d4d8', color: '#3f3f46' }),
      mpButton('Reserve a preview', MP_SITE + '/preview', { align: 'center', bg: '#111827', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-terminal-note',
    title: 'Terminal Note',
    category: 'Examples',
    subject: 'A technical note with style',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#09090b',
    fontFamily: "'Courier New', Courier, monospace",
    fontColor: '#e4e4e7',
    blocks: [
      mpText('> STATUS: READY', { size: '12px', color: '#86efac' }),
      mpHeading('A technical email that still feels designed', { size: '28px', color: '#fafafa' }),
      mpCard('<span style="color:#86efac;">$ mailpaw build</span><br><span style="color:#a1a1aa;">Rendering mobile-safe email blocks...</span><br><span style="color:#86efac;">Done.</span>', { background: '#18181b', borderColor: '#3f3f46', color: '#e4e4e7' }),
      mpText('Use this style for release notes, developer updates, changelogs, internal announcements, or any message where the technical tone is part of the brand.', { color: '#d4d4d8', lineHeight: '1.8' }),
      mpButton('View the notes', MP_SITE + '/notes', { bg: '#86efac', color: '#052e16' }),
      mpFooter('Plain HTML. Easy to edit. Safe to back up.', '#a1a1aa')
    ]
  },
  {
    id: 'tpl-example-studio-index',
    title: 'Studio Index',
    category: 'Examples',
    subject: 'A clean index of highlights',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontColor: '#111827',
    blocks: [
      mpText('STUDIO INDEX', { size: '12px', color: '#64748b' }),
      mpHeading('Three things worth opening', { size: '30px' }),
      mpCard('<strong>01 / The visual system</strong><br>A short note about how the new examples were designed to stay clean in email clients.', { background: '#f8fafc', borderColor: '#e2e8f0', color: '#334155' }),
      mpCard('<strong>02 / The new copy pass</strong><br>Practical filler copy that sounds usable instead of placeholder-flat.', { background: '#f8fafc', borderColor: '#e2e8f0', color: '#334155' }),
      mpCard('<strong>03 / The export check</strong><br>A reminder to copy the email body and keep backup downloads when your library matters.', { background: '#f8fafc', borderColor: '#e2e8f0', color: '#334155' }),
      mpButton('Open the index', MP_SITE + '/index', { bg: '#111827', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-greenhouse',
    title: 'Greenhouse',
    category: 'Examples',
    subject: 'A fresh green announcement',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#f0fdf4',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontColor: '#052e16',
    blocks: [
      mpHero('greenhouse-table', { alt: 'Fresh green studio table with plants and paper' }),
      mpText('GREENHOUSE', { size: '11px', color: '#15803d', align: 'center' }),
      mpHeading('A fresh start without visual clutter', { size: '30px', align: 'center', color: '#052e16' }),
      mpText('A bright example for seasonal notes, positive updates, or anything that should feel clean and alive.', { color: '#166534', align: 'center' }),
      mpCard('<strong>Design move</strong><br>Let green carry the mood, but keep the structure simple enough to paste into real inboxes.', { background: '#ffffff', borderColor: '#bbf7d0', color: '#14532d' }),
      mpButton('Start fresh', MP_SITE + '/fresh', { align: 'center', bg: '#15803d', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-redacted',
    title: 'Redacted',
    category: 'Examples',
    subject: 'A confidential-feeling update',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#f8fafc',
    fontFamily: "'Courier New', Courier, monospace",
    fontColor: '#0f172a',
    blocks: [
      mpText('CONFIDENTIAL DRAFT', { size: '12px', color: '#64748b' }),
      mpHeading('The details are almost ready', { size: '30px' }),
      mpCard('<span style="background:#0f172a;color:#0f172a;">████████████</span><br><br><strong>What can be shared now</strong><br>A concise update is ready. The final asset, release note, or announcement can drop into this frame when approved.', { background: '#ffffff', borderColor: '#cbd5e1', color: '#334155' }),
      mpDivider('#cbd5e1'),
      mpText('Use this for teaser notes, early previews, private updates, or launch windows where restraint creates attention.', { color: '#475569', lineHeight: '1.8' }),
      mpButton('Get the first look', MP_SITE + '/first-look', { bg: '#0f172a', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-signal-card',
    title: 'Signal Card',
    category: 'Examples',
    subject: 'One metric, one message',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontColor: '#0f172a',
    blocks: [
      mpText('SIGNAL CARD', { size: '12px', color: '#0e7490', align: 'center' }),
      mpMetric('84%', 'Readers scanned the full card', { background: '#ffffff', borderColor: '#a5f3fc', color: '#0f172a' }),
      mpHeading('Build around the strongest signal', { size: '29px', align: 'center' }),
      mpText('A metric-led design for reports, proof points, short updates, or any message where one number should set the frame.', { color: '#155e75', align: 'center' }),
      mpCard('<strong>Supporting note</strong><br>Keep the explanation short. The number earns attention, and the copy explains what to do with it.', { background: '#ffffff', borderColor: '#a5f3fc', color: '#164e63' }),
      mpButton('See the signal', MP_SITE + '/signal', { align: 'center', bg: '#0891b2', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-object-story',
    title: 'Object Story',
    category: 'Examples',
    subject: 'A product story in one column',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontColor: '#111827',
    blocks: [
      mpHeading('The story behind the object', { size: '31px' }),
      mpText('Use this example when the product, service, or idea needs context before the click.', { color: '#4b5563' }),
      mpHero('object-story-detail', { alt: 'Close-up detail of a carefully made object' }),
      mpCard('<strong>Made for</strong><br>People who appreciate a clearer explanation before being asked to act.', { background: '#f9fafb', borderColor: '#e5e7eb', color: '#374151' }),
      mpCard('<strong>What to replace</strong><br>The image, the object story, and this second proof card. The rhythm can stay exactly the same.', { background: '#f9fafb', borderColor: '#e5e7eb', color: '#374151' }),
      mpButton('Explore the object', MP_SITE + '/object', { bg: '#111827', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-blueprint',
    title: 'Blueprint',
    category: 'Examples',
    subject: 'A structured blueprint email',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eff6ff',
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontColor: '#0f172a',
    blocks: [
      mpText('BLUEPRINT', { size: '12px', color: '#1d4ed8' }),
      mpHeading('A plan people can scan quickly', { size: '30px' }),
      mpCard('<strong>Step 1</strong><br>Set the frame with a plain-English headline.', { background: '#ffffff', borderColor: '#bfdbfe', color: '#1e3a8a' }),
      mpCard('<strong>Step 2</strong><br>Show the most important detail in its own block.', { background: '#ffffff', borderColor: '#bfdbfe', color: '#1e3a8a' }),
      mpCard('<strong>Step 3</strong><br>End with one clear action and no competing buttons.', { background: '#ffffff', borderColor: '#bfdbfe', color: '#1e3a8a' }),
      mpButton('Use the blueprint', MP_SITE + '/blueprint', { bg: '#1d4ed8', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-brutalist-note',
    title: 'Brutalist Note',
    category: 'Examples',
    subject: 'A bold black-border email',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#ffffff',
    fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
    fontColor: '#000000',
    blocks: [
      mpCard('<span style="font-size:12px;letter-spacing:1px;">NO. 16</span><br><span style="font-size:34px;line-height:1.05;font-weight:900;">LOUD STRUCTURE. CLEAN HTML.</span>', { background: '#ffffff', borderColor: '#000000', color: '#000000' }),
      mpText('A punchy example for brands that want directness, sharp edges, and no decorative softness.', { color: '#27272a' }),
      mpCard('<strong>Important line</strong><br>This is intentionally simple: border, type, copy, button.', { background: '#f4f4f5', borderColor: '#000000', color: '#000000' }),
      mpButton('Make it bold', MP_SITE + '/bold', { bg: '#000000', color: '#ffffff' })
    ]
  },
  {
    id: 'tpl-example-tiny-magazine',
    title: 'Tiny Magazine',
    category: 'Examples',
    subject: 'A small magazine-style issue',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#ffffff',
    fontFamily: 'Georgia, Times, serif',
    fontColor: '#111827',
    blocks: [
      mpText('TINY MAGAZINE / VOL. 04', { size: '11px', color: '#71717a', align: 'center' }),
      mpHeading('A pocket-sized issue for busy readers', { size: '32px', align: 'center' }),
      mpHero('tiny-magazine-cover', { alt: 'Magazine cover and coffee on a table' }),
      mpCard('<strong>Feature</strong><br>A short essay about making useful work feel finished without overbuilding the page.', { background: '#fafafa', borderColor: '#d4d4d8', color: '#3f3f46' }),
      mpCard('<strong>Small find</strong><br>A tool, link, or object worth saving for later.', { background: '#fafafa', borderColor: '#d4d4d8', color: '#3f3f46' }),
      mpButton('Read the issue', MP_SITE + '/issue', { align: 'center', bg: '#111827', color: '#ffffff' }),
      mpFooter('Forward to someone who likes compact useful things.')
    ]
  },
  {
    id: 'tpl-example-clear-receipt',
    title: 'Clear Receipt',
    category: 'Examples',
    subject: 'A polished receipt-style layout',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#f8fafc',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      mpHeading('Everything is recorded clearly', { size: '28px' }),
      mpText('A receipt-inspired example that works for confirmations, summaries, handoffs, or simple status notes.', { color: '#475569' }),
      mpCard('<strong>Summary</strong><br>Design review complete<br>Files exported<br>Backup saved', { background: '#ffffff', borderColor: '#e2e8f0', color: '#334155' }),
      mpCard('<strong>Next action</strong><br>Open the saved copy and replace this sample content with your real details.', { background: '#ffffff', borderColor: '#e2e8f0', color: '#334155' }),
      mpButton('Open saved copy', MP_SITE + '/saved', { bg: '#111827', color: '#ffffff' }),
      mpFooter('Your templates live locally in this browser. Download backups for anything important.')
    ]
  }
];

const MAILPAW_EXAMPLE_TEMPLATE_ORDER = [
  'tpl-example-tiny-magazine',
  'tpl-example-blueprint',
  'tpl-example-signal-card',
  'tpl-example-greenhouse',
  'tpl-example-terminal-note',
  'tpl-example-photo-letter',
  'tpl-example-color-block',
  'tpl-example-soft-cloud',
  'tpl-example-ink-gallery',
  'tpl-example-clear-receipt',
  'tpl-example-brutalist-note',
  'tpl-example-object-story',
  'tpl-example-redacted',
  'tpl-example-studio-index',
  'tpl-example-luxe-minimal',
  'tpl-example-type-poster',
  'tpl-example-museum-card',
  'tpl-example-noir-product'
];

const MAILPAW_EXAMPLE_TEMPLATE_ORDER_INDEX = new Map(MAILPAW_EXAMPLE_TEMPLATE_ORDER.map((id, index) => [id, index]));
MAILPAW_EXAMPLE_TEMPLATE_SPECS.sort((a, b) => {
  const orderA = MAILPAW_EXAMPLE_TEMPLATE_ORDER_INDEX.has(a.id) ? MAILPAW_EXAMPLE_TEMPLATE_ORDER_INDEX.get(a.id) : Number.MAX_SAFE_INTEGER;
  const orderB = MAILPAW_EXAMPLE_TEMPLATE_ORDER_INDEX.has(b.id) ? MAILPAW_EXAMPLE_TEMPLATE_ORDER_INDEX.get(b.id) : Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;
  return String(a.title || '').localeCompare(String(b.title || ''));
});

DEFAULT_TEMPLATE_SPECS.splice(0, DEFAULT_TEMPLATE_SPECS.length, ...MAILPAW_EXAMPLE_TEMPLATE_SPECS);

const LEGACY_DEFAULT_TEMPLATE_IDS = [
  'tpl-welcome-onboarding',
  'tpl-email-verification',
  'tpl-password-reset',
  'tpl-order-confirmation',
  'tpl-shipping-update',
  'tpl-abandoned-cart',
  'tpl-trial-ending',
  'tpl-subscription-renewal',
  'tpl-invoice-receipt',
  'tpl-event-registration',
  'tpl-meeting-followup',
  'tpl-event-invite',
  'tpl-support-resolution',
  'tpl-creator-newsletter',
  'tpl-weekly-update',
  'tpl-product-launch',
  'tpl-release-notes',
  'tpl-customer-story',
  'tpl-renewal-reminder',
  'tpl-hiring-outreach',
  'tpl-studio-dispatch',
  'tpl-lookbook-launch',
  'tpl-founder-letter',
  'tpl-community-spotlight',
  'tpl-live-workshop',
  'tpl-product-tour',
  'tpl-seasonal-sale',
  'tpl-weekly-brief',
  'tpl-partner-announcement',
  'tpl-case-study',
  'tpl-neon-launch',
  'tpl-atelier-digest',
  'tpl-studio-portfolio',
  'tpl-community-roundup',
  'tpl-event-rsvp',
  'tpl-product-shelf',
  'tpl-news-signal',
  'tpl-news-capsule',
  'tpl-news-journal',
  'tpl-launch-midnight',
  'tpl-launch-feature',
  'tpl-launch-lookbook',
  'tpl-event-workshop',
  'tpl-event-summit',
  'tpl-event-meetup',
  'tpl-promo-perk',
  'tpl-promo-seasonal',
  'tpl-promo-flash',
  'tpl-news-brief',
  'tpl-news-digest',
  'tpl-news-letter',
  'tpl-launch-neon',
  'tpl-launch-focus',
  'tpl-launch-gallery',
  'tpl-event-session',
  'tpl-event-agenda',
  'tpl-event-gathering',
  'tpl-promo-member',
  'tpl-promo-sale',
  'tpl-promo-bundle',
  'tpl-news-monthly',
  'tpl-news-insight',
  'tpl-news-metrics',
  'tpl-news-story',
  'tpl-launch-redesign',
  'tpl-launch-beta',
  'tpl-launch-partner',
  'tpl-launch-drop',
  'tpl-event-webinar',
  'tpl-event-savedate',
  'tpl-event-recap',
  'tpl-event-series',
  'tpl-promo-limited',
  'tpl-promo-referral',
  'tpl-promo-vip',
  'tpl-promo-gift',
  'tpl-product-changelog',
  'tpl-product-roadmap',
  'tpl-product-spotlight',
  'tpl-product-integration',
  'tpl-product-case',
  'tpl-product-playbook',
  'tpl-product-plans',
  'tpl-community-ambassador',
  'tpl-community-survey',
  'tpl-community-gallery',
  'tpl-community-recap',
  'tpl-content-digest',
  'tpl-content-podcast',
  'tpl-content-video',
  'tpl-content-guide',
  'tpl-content-report',
  'tpl-content-interview',
  'tpl-company-milestone',
  'tpl-company-press',
  'tpl-company-team',
  'tpl-company-hiring'
];

LEGACY_DEFAULT_TEMPLATE_IDS.push(
  'tpl-curated-radar-newsletter',
  'tpl-curated-founder-field-note',
  'tpl-curated-visual-digest',
  'tpl-curated-metrics-memo',
  'tpl-curated-editorial-roundup',
  'tpl-curated-neon-launch',
  'tpl-curated-waitlist-open',
  'tpl-curated-feature-reveal',
  'tpl-curated-collection-drop',
  'tpl-curated-partner-collab',
  'tpl-curated-seasonal-sale',
  'tpl-curated-vip-access',
  'tpl-curated-referral-invite',
  'tpl-curated-bundle-offer',
  'tpl-curated-gift-guide',
  'tpl-curated-changelog-clean',
  'tpl-curated-roadmap-preview',
  'tpl-curated-feature-spotlight',
  'tpl-curated-integration-announce',
  'tpl-curated-case-study',
  'tpl-curated-webinar-invite',
  'tpl-curated-event-agenda',
  'tpl-curated-event-recap',
  'tpl-curated-community-meetup',
  'tpl-curated-blog-digest',
  'tpl-curated-podcast-episode',
  'tpl-curated-guide-release',
  'tpl-curated-report-release',
  'tpl-curated-video-series',
  'tpl-curated-welcome-lifecycle',
  'tpl-curated-onboarding-day-one',
  'tpl-curated-backup-reminder',
  'tpl-curated-winback-note',
  'tpl-curated-trial-ending',
  'tpl-curated-order-confirmation',
  'tpl-curated-shipping-update',
  'tpl-curated-password-reset',
  'tpl-curated-community-spotlight',
  'tpl-curated-community-survey',
  'tpl-curated-ambassador-program',
  'tpl-curated-company-milestone',
  'tpl-curated-hiring-highlight',
  'tpl-curated-press-roundup'
);

function getMailPawIconSrc() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return chrome.runtime.getURL('mailpaw-icon.png') + '?v=20260617-catletter';
  }
  return 'mailpaw-icon.png?v=20260617-catletter';
}
