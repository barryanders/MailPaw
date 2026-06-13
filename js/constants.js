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

const DEFAULT_TEMPLATE_SPECS = [
  {
    id: 'tpl-news-brief',
    title: 'Weekly Newsletter - Brief',
    category: 'Newsletter',
    subject: '{{Brand}} Weekly Brief | {{Issue}}',
    shortcut: '/brief',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'heading', text: 'Weekly Brief', size: '28px' },
      { type: 'text', html: 'Issue {{Issue}} | {{Date}} | {{Brand}}', size: '12px', color: '#64748b' },
      { type: 'text', html: 'Top takeaway: {{TopTakeaway}}', color: '#475569' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-001/1200/720', radius: '14px' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Lead story', size: '16px' },
            { type: 'text', html: '<strong>{{PrimaryStoryTitle}}</strong><br>{{PrimaryStorySummary}}', color: '#475569' },
            { type: 'button', text: 'Read the story', href: '{{PrimaryStoryUrl}}', align: 'left' }
          ],
          [
            { type: 'heading', text: 'Quick hits', size: '16px' },
            { type: 'text', html: '&bull; {{QuickHitOne}}<br>&bull; {{QuickHitTwo}}<br>&bull; {{QuickHitThree}}', color: '#475569' },
            { type: 'text', html: 'Also: {{SecondaryNote}}', size: '12px', color: '#64748b' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>What we are watching</strong><br>{{WatchOne}}<br>{{WatchTwo}}',
        color: '#0f172a',
        background: '#f8fafc',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
      },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] },
      { type: 'text', html: 'You are receiving this because you subscribed at {{Website}}.', size: '11px', color: '#94a3b8', align: 'center' }
    ]
  },
  {
    id: 'tpl-news-digest',
    title: 'Visual Newsletter - Digest',
    category: 'Newsletter',
    subject: '{{Brand}} Visual Digest | {{Date}}',
    shortcut: '/digest',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-002/1200/720', radius: '18px' },
      { type: 'heading', text: 'Visual Digest', size: '28px', align: 'center' },
      { type: 'text', html: 'A curated recap from {{Brand}}.', color: '#475569', align: 'center' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-003/900/540', radius: '12px' },
            { type: 'text', html: '{{StoryOneCategory}}', size: '12px', color: '#64748b' },
            { type: 'heading', text: '{{StoryOneTitle}}', size: '16px' },
            { type: 'text', html: '{{StoryOneSummary}}', color: '#475569' },
            { type: 'button', text: 'Open story', href: '{{StoryOneUrl}}', align: 'left' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-004/900/540', radius: '12px' },
            { type: 'text', html: '{{StoryTwoCategory}}', size: '12px', color: '#64748b' },
            { type: 'heading', text: '{{StoryTwoTitle}}', size: '16px' },
            { type: 'text', html: '{{StoryTwoSummary}}', color: '#475569' },
            { type: 'button', text: 'Open story', href: '{{StoryTwoUrl}}', align: 'left' }
          ]
        ]
      },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            {
              type: 'text',
              html: '<strong>{{MetricOneValue}}</strong><br>{{MetricOneLabel}}',
              color: '#0f172a',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{MetricTwoValue}}</strong><br>{{MetricTwoLabel}}',
              color: '#0f172a',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{MetricThreeValue}}</strong><br>{{MetricThreeLabel}}',
              color: '#0f172a',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Spotlight</strong><br>{{SpotlightCopy}}',
        color: '#0f172a',
        background: '#ffffff',
        layout: { padding: '14px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
      },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-news-letter',
    title: 'Founder Update - Letter',
    category: 'Newsletter',
    subject: 'Founder letter from {{Brand}}',
    shortcut: '/letter',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      { type: 'heading', text: 'Founder Letter', size: '28px' },
      { type: 'text', html: 'From {{FounderName}} | {{Date}}', size: '12px', color: '#6b7280' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-005/1200/720', radius: '16px' },
      { type: 'text', html: 'Hi {{FirstName}},<br><br>{{Intro}}', color: '#475569', lineHeight: '1.7' },
      { type: 'text', html: '<blockquote>{{Quote}}</blockquote>', color: '#1f2937' },
      { type: 'heading', text: 'Highlights', size: '18px' },
      { type: 'text', html: '&bull; {{UpdateOne}}<br>&bull; {{UpdateTwo}}<br>&bull; {{UpdateThree}}', color: '#475569' },
      {
        type: 'text',
        html: '<strong>Looking ahead</strong><br>{{LookingAhead}}',
        color: '#1f2937',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
      },
      { type: 'button', text: 'Read the full update', href: '{{LetterUrl}}', align: 'left' },
      { type: 'text', html: 'Thanks,<br>{{FounderName}}', color: '#475569' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-launch-neon',
    title: 'Product Launch - Hype',
    category: 'Launch',
    subject: 'Introducing {{ProductName}}',
    shortcut: '/neon',
    tier: 'free',
    stylePresetId: 'midnight-neon',
    bgEmail: '#0b1120',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#e2e8f0',
    blocks: [
      { type: 'heading', text: 'Introducing {{ProductName}}', size: '30px', align: 'center', color: '#f8fafc' },
      { type: 'text', html: 'Built to {{PrimaryBenefit}} in half the time.', align: 'center', color: '#cbd5e1' },
      { type: 'button', text: 'Launch now', href: '{{LaunchUrl}}', align: 'center', bg: '#38bdf8', color: '#0b1120', radius: '999px' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-006/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'heading', text: 'Speed', size: '15px', color: '#f8fafc' },
            { type: 'text', html: '{{FeatureOne}}', color: '#cbd5e1' }
          ],
          [
            { type: 'heading', text: 'Control', size: '15px', color: '#f8fafc' },
            { type: 'text', html: '{{FeatureTwo}}', color: '#cbd5e1' }
          ],
          [
            { type: 'heading', text: 'Scale', size: '15px', color: '#f8fafc' },
            { type: 'text', html: '{{FeatureThree}}', color: '#cbd5e1' }
          ]
        ]
      },
      {
        type: 'grid',
        cols: 2,
        background: '#111827',
        layout: { padding: '12px', radius: '14px', borderWidth: '1', borderColor: '#1f2937' },
        columns: [
          [
            { type: 'heading', text: 'Included', size: '16px', color: '#f8fafc' },
            { type: 'text', html: '&bull; {{IncludedOne}}<br>&bull; {{IncludedTwo}}<br>&bull; {{IncludedThree}}', color: '#cbd5e1' }
          ],
          [
            { type: 'heading', text: 'Best for', size: '16px', color: '#f8fafc' },
            { type: 'text', html: '&bull; {{UseCaseOne}}<br>&bull; {{UseCaseTwo}}<br>&bull; {{UseCaseThree}}', color: '#cbd5e1' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Launch window</strong><br>{{LaunchWindow}}',
        color: '#e2e8f0',
        background: '#0f172a',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#1f2937' }
      },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-launch-focus',
    title: 'Feature Release - Walkthrough',
    category: 'Launch',
    subject: 'Feature release: {{FeatureName}}',
    shortcut: '/focus',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      { type: 'heading', text: 'Feature Release: {{FeatureName}}', size: '26px' },
      { type: 'text', html: 'A faster way to {{Benefit}} inside {{Brand}}.', color: '#475569' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-007/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Why it matters', size: '16px' },
            { type: 'text', html: '&bull; {{ImpactOne}}<br>&bull; {{ImpactTwo}}<br>&bull; {{ImpactThree}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: 'How it works', size: '16px' },
            { type: 'text', html: '1. {{StepOne}}<br>2. {{StepTwo}}<br>3. {{StepThree}}', color: '#475569' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Results</strong><br>{{MetricOne}}<br>{{MetricTwo}}',
        color: '#111827',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#c7d2fe' }
      },
      { type: 'button', text: 'Try the feature', href: '{{FeatureUrl}}', align: 'left' }
    ]
  },
  {
    id: 'tpl-launch-gallery',
    title: 'Collection Launch - Lookbook',
    category: 'Launch',
    subject: '{{CollectionName}} Lookbook',
    shortcut: '/gallery',
    tier: 'free',
    stylePresetId: 'vapor-peach',
    bgEmail: '#fff1f2',
    fontFamily: 'Trebuchet MS, Verdana, sans-serif',
    fontColor: '#4c0519',
    blocks: [
      { type: 'heading', text: '{{CollectionName}} Lookbook', size: '28px', align: 'center', color: '#4c0519' },
      { type: 'text', html: 'A curated drop for {{Season}}.', color: '#9f1239', align: 'center' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-008/600/360', radius: '12px' },
            { type: 'text', html: '{{LookOneName}}', size: '12px', color: '#9f1239', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-009/600/360', radius: '12px' },
            { type: 'text', html: '{{LookTwoName}}', size: '12px', color: '#9f1239', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-010/600/360', radius: '12px' },
            { type: 'text', html: '{{LookThreeName}}', size: '12px', color: '#9f1239', align: 'center' }
          ]
        ]
      },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            {
              type: 'text',
              html: '<strong>Materials</strong><br>{{Materials}}',
              color: '#4c0519',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#fecdd3' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>Sizing</strong><br>{{SizingNotes}}',
              color: '#4c0519',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#fecdd3' }
            }
          ]
        ]
      },
      { type: 'button', text: 'Explore the collection', href: '{{CollectionUrl}}', align: 'center', bg: '#e11d48', color: '#ffffff', radius: '999px' },
      { type: 'text', html: 'Free shipping over {{FreeShipThreshold}}.', size: '12px', color: '#9f1239', align: 'center' }
    ]
  },
  {
    id: 'tpl-event-session',
    title: 'Workshop Invite',
    category: 'Events',
    subject: 'Workshop invite: {{EventName}}',
    shortcut: '/session',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-011/1200/720', radius: '16px' },
      { type: 'heading', text: 'Workshop: {{EventName}}', size: '26px' },
      { type: 'text', html: 'Join {{HostName}} for a live session on {{Topic}}.', color: '#475569' },
      {
        type: 'text',
        html: '<strong>Event details</strong><br>Date: {{EventDate}}<br>Time: {{EventTime}}<br>Location: {{EventLocation}}',
        color: '#0f172a',
        background: '#ffffff',
        layout: { padding: '14px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
      },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'You will learn', size: '16px' },
            { type: 'text', html: '&bull; {{LessonOne}}<br>&bull; {{LessonTwo}}<br>&bull; {{LessonThree}}', color: '#475569' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-012/700/420', radius: '12px' },
            { type: 'text', html: 'Hosted by {{HostName}}', size: '12px', color: '#64748b', align: 'center' }
          ]
        ]
      },
      { type: 'button', text: 'Reserve my seat', href: '{{EventUrl}}', align: 'left' },
      { type: 'text', html: 'Replay available to attendees.', size: '12px', color: '#64748b' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-event-agenda',
    title: 'Summit Agenda - Invite',
    category: 'Events',
    subject: 'Summit agenda: {{EventName}}',
    shortcut: '/agenda',
    tier: 'free',
    stylePresetId: 'rose-noir',
    bgEmail: '#1f1134',
    fontFamily: 'Verdana, sans-serif',
    fontColor: '#f8fafc',
    blocks: [
      { type: 'heading', text: 'Summit Agenda: {{EventName}}', size: '28px', align: 'center', color: '#f8fafc' },
      { type: 'text', html: 'Two days of strategy, design, and community.', align: 'center', color: '#f3e8ff' },
      { type: 'button', text: 'Get tickets', href: '{{EventUrl}}', align: 'center', bg: '#f472b6', color: '#1f1134', radius: '999px' },
      {
        type: 'grid',
        cols: 2,
        background: '#2a1845',
        layout: { padding: '12px', radius: '14px', borderWidth: '1', borderColor: '#3b1d59' },
        columns: [
          [
            { type: 'heading', text: 'Day one', size: '16px', color: '#f8fafc' },
            { type: 'text', html: '09:00 - {{SessionOne}}<br>11:00 - {{SessionTwo}}<br>14:00 - {{SessionThree}}', color: '#f3e8ff' }
          ],
          [
            { type: 'heading', text: 'Day two', size: '16px', color: '#f8fafc' },
            { type: 'text', html: '09:00 - {{SessionFour}}<br>11:00 - {{SessionFive}}<br>14:00 - {{SessionSix}}', color: '#f3e8ff' }
          ]
        ]
      },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-013/600/360', radius: '12px' },
            { type: 'text', html: '<strong>{{SpeakerOne}}</strong><br>{{SpeakerOneRole}}', size: '12px', color: '#f3e8ff', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-014/600/360', radius: '12px' },
            { type: 'text', html: '<strong>{{SpeakerTwo}}</strong><br>{{SpeakerTwoRole}}', size: '12px', color: '#f3e8ff', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-015/600/360', radius: '12px' },
            { type: 'text', html: '<strong>{{SpeakerThree}}</strong><br>{{SpeakerThreeRole}}', size: '12px', color: '#f3e8ff', align: 'center' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Venue</strong><br>{{Venue}}<br>{{VenueAddress}}',
        color: '#f8fafc',
        background: '#2a1845',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#3b1d59' }
      },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-event-gathering',
    title: 'Community Meetup Invite',
    category: 'Events',
    subject: '{{City}} Community Meetup',
    shortcut: '/gather',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-016/1200/720', radius: '18px' },
      { type: 'heading', text: '{{City}} Community Meetup', size: '26px' },
      { type: 'text', html: 'An evening of conversation and connection with {{Brand}}.', color: '#475569' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            {
              type: 'text',
              html: '<strong>When + where</strong><br>{{EventDate}} at {{EventTime}}<br>{{Venue}}',
              color: '#1f2937',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>What to expect</strong><br>{{MeetupHighlights}}',
              color: '#1f2937',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ]
        ]
      },
      { type: 'button', text: 'Save my spot', href: '{{EventUrl}}', align: 'left' },
      { type: 'text', html: 'Dress code: {{DressCode}}', size: '12px', color: '#6b7280' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-promo-member',
    title: 'Member Perk Offer',
    category: 'Promotion',
    subject: 'Member perk: {{OfferName}}',
    shortcut: '/perk',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    blocks: [
      { type: 'heading', text: 'Member Perk: {{OfferName}}', size: '26px' },
      { type: 'text', html: 'Exclusive access for {{Brand}} members.', color: '#065f46' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-017/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            {
              type: 'text',
              html: '<strong>What is included</strong><br>{{PerkOne}}<br>{{PerkTwo}}<br>{{PerkThree}}',
              color: '#064e3b',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#bbf7d0' }
            }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-018/700/420', radius: '12px' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Member code</strong><br>{{PromoCode}}<br>Valid through {{EndDate}}',
        color: '#064e3b',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#bbf7d0' }
      },
      { type: 'button', text: 'Redeem perk', href: '{{PerkUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-promo-sale',
    title: 'Seasonal Sale Promo',
    category: 'Promotion',
    subject: '{{Season}} Sale: {{Discount}} Off',
    shortcut: '/sale',
    tier: 'free',
    stylePresetId: 'citrus-pop',
    bgEmail: '#fffbeb',
    fontFamily: 'Verdana, sans-serif',
    fontColor: '#78350f',
    blocks: [
      { type: 'heading', text: '{{Season}} Sale', size: '30px', align: 'center', color: '#78350f' },
      { type: 'text', html: '{{Discount}} off best sellers at {{Brand}}.', color: '#92400e', align: 'center' },
      { type: 'button', text: 'Shop the sale', href: '{{SaleUrl}}', align: 'center', bg: '#f97316', color: '#1f1300', radius: '999px' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-019/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-020/700/420', radius: '12px' },
            { type: 'text', html: '<strong>{{ProductOneName}}</strong><br>{{ProductOnePrice}}', size: '12px', color: '#92400e', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-021/700/420', radius: '12px' },
            { type: 'text', html: '<strong>{{ProductTwoName}}</strong><br>{{ProductTwoPrice}}', size: '12px', color: '#92400e', align: 'center' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Use code</strong><br>{{PromoCode}}<br>Ends {{EndDate}}',
        color: '#78350f',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#fde68a' }
      },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-promo-bundle',
    title: 'Bundle Offer',
    category: 'Promotion',
    subject: '{{BundleName}} Bundle Offer',
    shortcut: '/bundle',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#f5f5f4',
    fontFamily: "'Courier New', monospace",
    fontColor: '#1c1917',
    blocks: [
      { type: 'heading', text: '{{BundleName}} Bundle', size: '28px', align: 'center' },
      { type: 'text', html: 'Everything you need to ship faster, bundled for {{BundlePrice}}.', align: 'center', color: '#57534e' },
      { type: 'button', text: 'Get the bundle', href: '{{BundleUrl}}', align: 'center', bg: '#111827', color: '#ffffff', radius: '999px' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'What is inside', size: '16px' },
            { type: 'text', html: '&bull; {{BundleOne}}<br>&bull; {{BundleTwo}}<br>&bull; {{BundleThree}}', color: '#57534e' }
          ],
          [
            { type: 'heading', text: 'Bonus', size: '16px' },
            { type: 'text', html: '{{Bonus}}<br>Ends {{EndDate}}', color: '#57534e' }
          ]
        ]
      },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-022/1200/720', radius: '16px' },
      { type: 'text', html: 'Bundle ends {{EndDate}}.', size: '12px', color: '#78716c', align: 'center' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-news-monthly',
    title: 'Monthly Newsletter - Highlights',
    category: 'Newsletter',
    subject: '{{Brand}} Monthly Highlights | {{Month}}',
    shortcut: '/monthly',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'heading', text: 'Monthly Highlights', size: '28px' },
      { type: 'text', html: 'Edition {{Month}} {{Year}} | {{Brand}}', size: '12px', color: '#64748b' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-023/1200/720', radius: '14px' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Top story', size: '16px' },
            { type: 'text', html: '<strong>{{TopStoryTitle}}</strong><br>{{TopStorySummary}}', color: '#475569' },
            { type: 'button', text: 'Read full story', href: '{{TopStoryUrl}}', align: 'left' }
          ],
          [
            { type: 'heading', text: 'In this issue', size: '16px' },
            { type: 'text', html: '&bull; {{StoryTwoTitle}}<br>&bull; {{StoryThreeTitle}}<br>&bull; {{StoryFourTitle}}', color: '#475569' },
            { type: 'text', html: 'Plus: {{BonusNote}}', size: '12px', color: '#64748b' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Editor note</strong><br>{{EditorNote}}',
        color: '#0f172a',
        background: '#f8fafc',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
      },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            {
              type: 'text',
              html: '<strong>{{MetricOneValue}}</strong><br>{{MetricOneLabel}}',
              color: '#0f172a',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{MetricTwoValue}}</strong><br>{{MetricTwoLabel}}',
              color: '#0f172a',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{MetricThreeValue}}</strong><br>{{MetricThreeLabel}}',
              color: '#0f172a',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ]
        ]
      },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] },
      { type: 'text', html: 'You are receiving this because you subscribed at {{Website}}.', size: '11px', color: '#94a3b8', align: 'center' }
    ]
  },
  {
    id: 'tpl-news-insight',
    title: 'Insights Newsletter - Trends',
    category: 'Newsletter',
    subject: '{{Brand}} Insight Brief | {{Date}}',
    shortcut: '/insight',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-024/1200/720', radius: '16px' },
      { type: 'heading', text: 'Insight Brief', size: '28px', align: 'center' },
      { type: 'text', html: 'Trends shaping {{Industry}} this week.', color: '#475569', align: 'center' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Trend: {{TrendOneTitle}}', size: '16px' },
            { type: 'text', html: '{{TrendOneSummary}}', color: '#475569' },
            { type: 'button', text: 'Read analysis', href: '{{TrendOneUrl}}', align: 'left' }
          ],
          [
            { type: 'heading', text: 'Trend: {{TrendTwoTitle}}', size: '16px' },
            { type: 'text', html: '{{TrendTwoSummary}}', color: '#475569' },
            { type: 'button', text: 'Read analysis', href: '{{TrendTwoUrl}}', align: 'left' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Key data point</strong><br>{{KeyDataPoint}}',
        color: '#111827',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#c7d2fe' }
      },
      { type: 'text', html: '<strong>Forecast</strong><br>{{ForecastSummary}}', color: '#475569' },
      { type: 'button', text: 'See full report', href: '{{ReportUrl}}', align: 'center' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-news-metrics',
    title: 'Metrics Newsletter - Snapshot',
    category: 'Newsletter',
    subject: '{{Brand}} Metrics Snapshot | {{Date}}',
    shortcut: '/metrics',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#f5f5f4',
    fontFamily: "'Courier New', monospace",
    fontColor: '#1c1917',
    blocks: [
      { type: 'heading', text: 'Metrics Snapshot', size: '28px' },
      { type: 'text', html: 'Performance for {{Period}} at a glance.', color: '#57534e' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            {
              type: 'text',
              html: '<strong>{{MetricOneValue}}</strong><br>{{MetricOneLabel}}',
              color: '#1c1917',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e7e5e4' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{MetricTwoValue}}</strong><br>{{MetricTwoLabel}}',
              color: '#1c1917',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e7e5e4' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{MetricThreeValue}}</strong><br>{{MetricThreeLabel}}',
              color: '#1c1917',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e7e5e4' }
            }
          ]
        ]
      },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Growth drivers', size: '16px' },
            { type: 'text', html: '&bull; {{DriverOne}}<br>&bull; {{DriverTwo}}<br>&bull; {{DriverThree}}', color: '#57534e' }
          ],
          [
            { type: 'heading', text: 'Challenges', size: '16px' },
            { type: 'text', html: '&bull; {{ChallengeOne}}<br>&bull; {{ChallengeTwo}}<br>&bull; {{ChallengeThree}}', color: '#57534e' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Focus this week</strong><br>{{FocusTheme}}',
        color: '#1c1917',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e7e5e4' }
      },
      { type: 'button', text: 'Open dashboard', href: '{{DashboardUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-news-story',
    title: 'Brand Newsletter - Story',
    category: 'Newsletter',
    subject: '{{Brand}} Story Edition | {{Issue}}',
    shortcut: '/story',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-025/1200/720', radius: '16px' },
      { type: 'heading', text: 'Story Edition', size: '28px' },
      { type: 'text', html: 'Issue {{Issue}} | {{Date}}', size: '12px', color: '#6b7280' },
      { type: 'text', html: '{{StoryIntro}}', color: '#475569', lineHeight: '1.7' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Feature story', size: '16px' },
            { type: 'text', html: '<strong>{{FeatureTitle}}</strong><br>{{FeatureSummary}}', color: '#475569' },
            { type: 'button', text: 'Read the feature', href: '{{FeatureUrl}}', align: 'left' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-026/700/420', radius: '12px' },
            { type: 'text', html: '{{PhotoCaption}}', size: '12px', color: '#6b7280', align: 'center' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Quote of the month</strong><br>{{Quote}}',
        color: '#1f2937',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#fed7aa' }
      },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-launch-redesign',
    title: 'Product Redesign - Reveal',
    category: 'Launch',
    subject: 'Meet the new {{ProductName}}',
    shortcut: '/redesign',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      { type: 'heading', text: 'Meet the new {{ProductName}}', size: '30px', align: 'center' },
      { type: 'text', html: 'A cleaner, faster experience built for {{Audience}}.', color: '#475569', align: 'center' },
      { type: 'button', text: 'Explore the redesign', href: '{{RedesignUrl}}', align: 'center' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-027/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'heading', text: 'Speed', size: '15px' },
            { type: 'text', html: '{{RedesignFeatureOne}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: 'Clarity', size: '15px' },
            { type: 'text', html: '{{RedesignFeatureTwo}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: 'Control', size: '15px' },
            { type: 'text', html: '{{RedesignFeatureThree}}', color: '#475569' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>What changed</strong><br>{{ChangeSummary}}',
        color: '#111827',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#c7d2fe' }
      },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-launch-beta',
    title: 'Beta Access - Early List',
    category: 'Launch',
    subject: '{{ProductName}} Beta Access',
    shortcut: '/beta',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-028/1200/720', radius: '16px' },
      { type: 'heading', text: 'Get beta access', size: '26px' },
      { type: 'text', html: 'Be the first to try {{ProductName}} before launch.', color: '#475569' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Why beta', size: '16px' },
            { type: 'text', html: '&bull; {{BetaWhyOne}}<br>&bull; {{BetaWhyTwo}}<br>&bull; {{BetaWhyThree}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: 'What you get', size: '16px' },
            { type: 'text', html: '&bull; {{BetaPerkOne}}<br>&bull; {{BetaPerkTwo}}<br>&bull; {{BetaPerkThree}}', color: '#475569' }
          ]
        ]
      },
      { type: 'button', text: 'Request access', href: '{{BetaUrl}}', align: 'left' },
      { type: 'text', html: 'Spots are limited. {{BetaCloseDate}}', size: '12px', color: '#64748b' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-launch-partner',
    title: 'Partnership Launch - Co-Brand',
    category: 'Launch',
    subject: '{{Brand}} x {{Partner}} launch',
    shortcut: '/partner',
    tier: 'free',
    stylePresetId: 'vapor-peach',
    bgEmail: '#fff1f2',
    fontFamily: 'Trebuchet MS, Verdana, sans-serif',
    fontColor: '#4c0519',
    blocks: [
      { type: 'heading', text: '{{Brand}} x {{Partner}}', size: '28px', align: 'center', color: '#4c0519' },
      { type: 'text', html: 'A collaboration built for {{Audience}}.', color: '#9f1239', align: 'center' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-029/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'What we built', size: '16px', color: '#4c0519' },
            { type: 'text', html: '&bull; {{CollabOne}}<br>&bull; {{CollabTwo}}<br>&bull; {{CollabThree}}', color: '#9f1239' }
          ],
          [
            { type: 'heading', text: 'Why it matters', size: '16px', color: '#4c0519' },
            { type: 'text', html: '{{CollabImpact}}', color: '#9f1239' }
          ]
        ]
      },
      { type: 'button', text: 'See the collaboration', href: '{{CollabUrl}}', align: 'center' },
      { type: 'text', html: 'Launch window: {{LaunchWindow}}', size: '12px', color: '#9f1239', align: 'center' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-launch-drop',
    title: 'New Collection - Drop',
    category: 'Launch',
    subject: 'New drop: {{CollectionName}}',
    shortcut: '/drop',
    tier: 'free',
    stylePresetId: 'citrus-pop',
    bgEmail: '#fffbeb',
    fontFamily: 'Verdana, sans-serif',
    fontColor: '#78350f',
    blocks: [
      { type: 'heading', text: '{{CollectionName}} drop', size: '30px', align: 'center', color: '#78350f' },
      { type: 'text', html: 'Limited release for {{Season}}.', color: '#92400e', align: 'center' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-030/600/360', radius: '12px' },
            { type: 'text', html: '{{DropOneName}}', size: '12px', color: '#92400e', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-031/600/360', radius: '12px' },
            { type: 'text', html: '{{DropTwoName}}', size: '12px', color: '#92400e', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-032/600/360', radius: '12px' },
            { type: 'text', html: '{{DropThreeName}}', size: '12px', color: '#92400e', align: 'center' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Available</strong><br>{{AvailabilityWindow}}',
        color: '#78350f',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#fde68a' }
      },
      { type: 'button', text: 'Shop the drop', href: '{{CollectionUrl}}', align: 'center' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-event-webinar',
    title: 'Webinar Invite - Live Demo',
    category: 'Events',
    subject: 'Live demo: {{EventName}}',
    shortcut: '/webinar',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-033/1200/720', radius: '16px' },
      { type: 'heading', text: 'Live demo: {{EventName}}', size: '26px' },
      { type: 'text', html: 'Join {{HostName}} for a walkthrough of {{Topic}}.', color: '#475569' },
      {
        type: 'text',
        html: '<strong>Event details</strong><br>{{EventDate}} | {{EventTime}} | {{EventLocation}}',
        color: '#0f172a',
        background: '#ffffff',
        layout: { padding: '14px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
      },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'You will learn', size: '16px' },
            { type: 'text', html: '&bull; {{LessonOne}}<br>&bull; {{LessonTwo}}<br>&bull; {{LessonThree}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: 'Speakers', size: '16px' },
            { type: 'text', html: '<strong>{{SpeakerOne}}</strong><br>{{SpeakerOneRole}}<br><strong>{{SpeakerTwo}}</strong><br>{{SpeakerTwoRole}}', color: '#475569' }
          ]
        ]
      },
      { type: 'button', text: 'Reserve my seat', href: '{{EventUrl}}', align: 'left' },
      { type: 'text', html: 'Replay available to registered attendees.', size: '12px', color: '#64748b' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-event-savedate',
    title: 'Save the Date - Conference',
    category: 'Events',
    subject: 'Save the date: {{EventName}}',
    shortcut: '/savedate',
    tier: 'free',
    stylePresetId: 'rose-noir',
    bgEmail: '#1f1134',
    fontFamily: 'Verdana, sans-serif',
    fontColor: '#f8fafc',
    blocks: [
      { type: 'heading', text: 'Save the Date: {{EventName}}', size: '28px', align: 'center', color: '#f8fafc' },
      { type: 'text', html: '{{EventDate}} | {{City}}', align: 'center', color: '#f3e8ff' },
      { type: 'button', text: 'Get early tickets', href: '{{EventUrl}}', align: 'center' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-034/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 2,
        background: '#2a1845',
        layout: { padding: '12px', radius: '14px', borderWidth: '1', borderColor: '#3b1d59' },
        columns: [
          [
            { type: 'heading', text: 'Why attend', size: '16px', color: '#f8fafc' },
            { type: 'text', html: '&bull; {{ReasonOne}}<br>&bull; {{ReasonTwo}}<br>&bull; {{ReasonThree}}', color: '#f3e8ff' }
          ],
          [
            { type: 'heading', text: 'Featured tracks', size: '16px', color: '#f8fafc' },
            { type: 'text', html: '&bull; {{TrackOne}}<br>&bull; {{TrackTwo}}<br>&bull; {{TrackThree}}', color: '#f3e8ff' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Venue</strong><br>{{Venue}}<br>{{VenueAddress}}',
        color: '#f8fafc',
        background: '#2a1845',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#3b1d59' }
      },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-event-recap',
    title: 'Event Recap - Highlights',
    category: 'Events',
    subject: '{{EventName}} recap + highlights',
    shortcut: '/recap',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'heading', text: 'Highlights from {{EventName}}', size: '28px' },
      { type: 'text', html: 'Thank you for joining us on {{EventDate}}.', color: '#475569' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-035/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Top moments', size: '16px' },
            { type: 'text', html: '&bull; {{MomentOne}}<br>&bull; {{MomentTwo}}<br>&bull; {{MomentThree}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: 'Key takeaways', size: '16px' },
            { type: 'text', html: '&bull; {{TakeawayOne}}<br>&bull; {{TakeawayTwo}}<br>&bull; {{TakeawayThree}}', color: '#475569' }
          ]
        ]
      },
      { type: 'button', text: 'Watch the replay', href: '{{ReplayUrl}}', align: 'left' },
      { type: 'text', html: 'Share your feedback: {{FeedbackUrl}}', size: '12px', color: '#64748b' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-event-series',
    title: 'Workshop Series - Multi-Session',
    category: 'Events',
    subject: '{{SeriesName}} workshop series',
    shortcut: '/series',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    blocks: [
      { type: 'heading', text: 'Workshop Series: {{SeriesName}}', size: '26px' },
      { type: 'text', html: 'A multi-week deep dive into {{Topic}}.', color: '#065f46' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            {
              type: 'text',
              html: '<strong>Session schedule</strong><br>{{SessionOne}}<br>{{SessionTwo}}<br>{{SessionThree}}',
              color: '#064e3b',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#bbf7d0' }
            }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-036/700/420', radius: '12px' },
            { type: 'text', html: 'Led by {{InstructorName}}', size: '12px', color: '#6b7280', align: 'center' }
          ]
        ]
      },
      { type: 'button', text: 'Join the series', href: '{{SeriesUrl}}', align: 'left' },
      { type: 'text', html: 'Includes recordings and worksheets.', size: '12px', color: '#6b7280' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-promo-limited',
    title: 'Limited-Time Offer',
    category: 'Promotion',
    subject: '{{OfferName}} ends {{EndDate}}',
    shortcut: '/limited',
    tier: 'free',
    stylePresetId: 'citrus-pop',
    bgEmail: '#fffbeb',
    fontFamily: 'Verdana, sans-serif',
    fontColor: '#78350f',
    blocks: [
      { type: 'heading', text: '{{OfferName}}', size: '30px', align: 'center', color: '#78350f' },
      { type: 'text', html: '{{Discount}} off until {{EndDate}}.', color: '#92400e', align: 'center' },
      { type: 'button', text: 'Claim the offer', href: '{{OfferUrl}}', align: 'center' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-037/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'What is included', size: '16px', color: '#78350f' },
            { type: 'text', html: '&bull; {{OfferDetailOne}}<br>&bull; {{OfferDetailTwo}}<br>&bull; {{OfferDetailThree}}', color: '#92400e' }
          ],
          [
            { type: 'heading', text: 'Perfect for', size: '16px', color: '#78350f' },
            { type: 'text', html: '&bull; {{OfferAudienceOne}}<br>&bull; {{OfferAudienceTwo}}<br>&bull; {{OfferAudienceThree}}', color: '#92400e' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Use code</strong><br>{{PromoCode}}',
        color: '#78350f',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#fde68a' }
      },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-promo-referral',
    title: 'Referral Program',
    category: 'Promotion',
    subject: 'Invite friends, earn {{Reward}}',
    shortcut: '/referral',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    blocks: [
      { type: 'heading', text: 'Invite friends, earn {{Reward}}', size: '26px' },
      { type: 'text', html: 'Share {{Brand}} and get rewarded when they join.', color: '#065f46' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'heading', text: '1. Share', size: '14px' },
            { type: 'text', html: '{{StepOne}}', color: '#065f46' }
          ],
          [
            { type: 'heading', text: '2. Invite', size: '14px' },
            { type: 'text', html: '{{StepTwo}}', color: '#065f46' }
          ],
          [
            { type: 'heading', text: '3. Earn', size: '14px' },
            { type: 'text', html: '{{StepThree}}', color: '#065f46' }
          ]
        ]
      },
      { type: 'button', text: 'Get my referral link', href: '{{ReferralUrl}}', align: 'left' },
      { type: 'text', html: 'Rewards apply after {{Requirement}}.', size: '12px', color: '#6b7280' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-promo-vip',
    title: 'VIP Early Access',
    category: 'Promotion',
    subject: 'VIP early access to {{LaunchName}}',
    shortcut: '/vip',
    tier: 'free',
    stylePresetId: 'midnight-neon',
    bgEmail: '#0b1120',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#e2e8f0',
    blocks: [
      { type: 'heading', text: 'VIP Early Access', size: '30px', align: 'center', color: '#f8fafc' },
      { type: 'text', html: 'Be first to experience {{LaunchName}}.', align: 'center', color: '#cbd5e1' },
      { type: 'button', text: 'Unlock access', href: '{{VipUrl}}', align: 'center' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-038/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 2,
        background: '#111827',
        layout: { padding: '12px', radius: '14px', borderWidth: '1', borderColor: '#1f2937' },
        columns: [
          [
            { type: 'heading', text: 'VIP perks', size: '16px', color: '#f8fafc' },
            { type: 'text', html: '&bull; {{VipPerkOne}}<br>&bull; {{VipPerkTwo}}<br>&bull; {{VipPerkThree}}', color: '#cbd5e1' }
          ],
          [
            { type: 'heading', text: 'Timeline', size: '16px', color: '#f8fafc' },
            { type: 'text', html: '{{VipTimeline}}', color: '#cbd5e1' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Access opens</strong><br>{{AccessDate}}',
        color: '#e2e8f0',
        background: '#0f172a',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#1f2937' }
      },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-promo-gift',
    title: 'Gift Guide - Seasonal Picks',
    category: 'Promotion',
    subject: '{{Season}} gift guide from {{Brand}}',
    shortcut: '/gift',
    tier: 'free',
    stylePresetId: 'vapor-peach',
    bgEmail: '#fff1f2',
    fontFamily: 'Trebuchet MS, Verdana, sans-serif',
    fontColor: '#4c0519',
    blocks: [
      { type: 'heading', text: '{{Season}} Gift Guide', size: '28px', align: 'center', color: '#4c0519' },
      { type: 'text', html: 'Curated picks from {{Brand}}.', color: '#9f1239', align: 'center' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-039/600/360', radius: '12px' },
            { type: 'text', html: '<strong>{{GiftOneName}}</strong><br>{{GiftOnePrice}}', size: '12px', color: '#9f1239', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-040/600/360', radius: '12px' },
            { type: 'text', html: '<strong>{{GiftTwoName}}</strong><br>{{GiftTwoPrice}}', size: '12px', color: '#9f1239', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-041/600/360', radius: '12px' },
            { type: 'text', html: '<strong>{{GiftThreeName}}</strong><br>{{GiftThreePrice}}', size: '12px', color: '#9f1239', align: 'center' }
          ]
        ]
      },
      { type: 'button', text: 'Shop the guide', href: '{{GuideUrl}}', align: 'center' },
      { type: 'text', html: 'Free shipping over {{FreeShipThreshold}}.', size: '12px', color: '#9f1239', align: 'center' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-product-changelog',
    title: 'Product Update - Changelog',
    category: 'Product',
    subject: '{{ProductName}} updates | {{Date}}',
    shortcut: '/changelog',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'heading', text: 'Product Updates', size: '28px' },
      { type: 'text', html: 'New in {{ProductName}} - {{Date}}', size: '12px', color: '#64748b' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'New features', size: '16px' },
            { type: 'text', html: '&bull; {{FeatureOne}}<br>&bull; {{FeatureTwo}}<br>&bull; {{FeatureThree}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: 'Improvements', size: '16px' },
            { type: 'text', html: '&bull; {{ImprovementOne}}<br>&bull; {{ImprovementTwo}}<br>&bull; {{ImprovementThree}}', color: '#475569' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Bug fixes</strong><br>{{FixesSummary}}',
        color: '#0f172a',
        background: '#f8fafc',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
      },
      { type: 'button', text: 'View full changelog', href: '{{ChangelogUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-product-roadmap',
    title: 'Roadmap Preview',
    category: 'Product',
    subject: '{{ProductName}} roadmap preview',
    shortcut: '/roadmap',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      { type: 'heading', text: 'Roadmap Preview', size: '28px' },
      { type: 'text', html: 'A look at what is coming next for {{ProductName}}.', color: '#475569' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'heading', text: '{{QuarterOne}}', size: '15px' },
            { type: 'text', html: '&bull; {{Q1ItemOne}}<br>&bull; {{Q1ItemTwo}}<br>&bull; {{Q1ItemThree}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: '{{QuarterTwo}}', size: '15px' },
            { type: 'text', html: '&bull; {{Q2ItemOne}}<br>&bull; {{Q2ItemTwo}}<br>&bull; {{Q2ItemThree}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: '{{QuarterThree}}', size: '15px' },
            { type: 'text', html: '&bull; {{Q3ItemOne}}<br>&bull; {{Q3ItemTwo}}<br>&bull; {{Q3ItemThree}}', color: '#475569' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Feedback focus</strong><br>{{FeedbackFocus}}',
        color: '#111827',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#c7d2fe' }
      },
      { type: 'button', text: 'Share feedback', href: '{{FeedbackUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-product-spotlight',
    title: 'Feature Spotlight',
    category: 'Product',
    subject: '{{FeatureName}} spotlight',
    shortcut: '/spotlight',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-042/1200/720', radius: '16px' },
      { type: 'heading', text: '{{FeatureName}} Spotlight', size: '26px' },
      { type: 'text', html: '{{FeatureTagline}}', color: '#475569' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Use cases', size: '16px' },
            { type: 'text', html: '&bull; {{UseCaseOne}}<br>&bull; {{UseCaseTwo}}<br>&bull; {{UseCaseThree}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: 'How it works', size: '16px' },
            { type: 'text', html: '1. {{StepOne}}<br>2. {{StepTwo}}<br>3. {{StepThree}}', color: '#475569' }
          ]
        ]
      },
      { type: 'button', text: 'Try the feature', href: '{{FeatureUrl}}', align: 'left' },
      { type: 'text', html: 'Available on {{Availability}}.', size: '12px', color: '#64748b' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-product-integration',
    title: 'Integration Announcement',
    category: 'Product',
    subject: '{{ProductName}} + {{IntegrationName}}',
    shortcut: '/integration',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#f5f5f4',
    fontFamily: "'Courier New', monospace",
    fontColor: '#1c1917',
    blocks: [
      { type: 'heading', text: '{{ProductName}} + {{IntegrationName}}', size: '28px', align: 'center' },
      { type: 'text', html: 'Connect your workflow in minutes.', color: '#57534e', align: 'center' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-043/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'What you can do', size: '16px' },
            { type: 'text', html: '&bull; {{IntegrationBenefitOne}}<br>&bull; {{IntegrationBenefitTwo}}<br>&bull; {{IntegrationBenefitThree}}', color: '#57534e' }
          ],
          [
            { type: 'heading', text: 'Setup steps', size: '16px' },
            { type: 'text', html: '1. {{SetupStepOne}}<br>2. {{SetupStepTwo}}<br>3. {{SetupStepThree}}', color: '#57534e' }
          ]
        ]
      },
      { type: 'button', text: 'Enable the integration', href: '{{IntegrationUrl}}', align: 'center' },
      { type: 'text', html: 'Documentation: {{DocsUrl}}', size: '12px', color: '#78716c' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-product-case',
    title: 'Customer Story - Case Study',
    category: 'Product',
    subject: '{{Customer}} story with {{ProductName}}',
    shortcut: '/case',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-044/1200/720', radius: '16px' },
      { type: 'heading', text: '{{Customer}} x {{ProductName}}', size: '28px' },
      { type: 'text', html: 'How {{Customer}} achieved {{Outcome}}.', color: '#475569' },
      { type: 'text', html: '<blockquote>{{Quote}}</blockquote>', color: '#1f2937' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            {
              type: 'text',
              html: '<strong>{{ResultOneValue}}</strong><br>{{ResultOneLabel}}',
              color: '#1f2937',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{ResultTwoValue}}</strong><br>{{ResultTwoLabel}}',
              color: '#1f2937',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{ResultThreeValue}}</strong><br>{{ResultThreeLabel}}',
              color: '#1f2937',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ]
        ]
      },
      { type: 'button', text: 'Read the full story', href: '{{CaseStudyUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-product-playbook',
    title: 'Use Case Playbook',
    category: 'Product',
    subject: '{{UseCase}} playbook',
    shortcut: '/playbook',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    blocks: [
      { type: 'heading', text: '{{UseCase}} Playbook', size: '26px' },
      { type: 'text', html: 'A practical guide to using {{ProductName}} for {{UseCase}}.', color: '#065f46' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Playbook steps', size: '16px' },
            { type: 'text', html: '1. {{StepOne}}<br>2. {{StepTwo}}<br>3. {{StepThree}}', color: '#065f46' }
          ],
          [
            { type: 'heading', text: 'Recommended tools', size: '16px' },
            { type: 'text', html: '&bull; {{ToolOne}}<br>&bull; {{ToolTwo}}<br>&bull; {{ToolThree}}', color: '#065f46' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Time to value</strong><br>{{TimeToValue}}',
        color: '#064e3b',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#bbf7d0' }
      },
      { type: 'button', text: 'Download the playbook', href: '{{PlaybookUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-product-plans',
    title: 'Plan Comparison',
    category: 'Product',
    subject: 'Find the right {{ProductName}} plan',
    shortcut: '/plans',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'heading', text: 'Choose the right plan', size: '28px' },
      { type: 'text', html: 'Compare {{ProductName}} plans at a glance.', color: '#475569' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'heading', text: 'Starter', size: '16px' },
            { type: 'text', html: '<strong>{{StarterPrice}}</strong><br>{{StarterDesc}}<br>&bull; {{StarterFeatureOne}}<br>&bull; {{StarterFeatureTwo}}', color: '#475569' },
            { type: 'button', text: 'Select Starter', href: '{{StarterUrl}}', align: 'center' }
          ],
          [
            { type: 'heading', text: 'Growth', size: '16px' },
            { type: 'text', html: '<strong>{{GrowthPrice}}</strong><br>{{GrowthDesc}}<br>&bull; {{GrowthFeatureOne}}<br>&bull; {{GrowthFeatureTwo}}', color: '#475569' },
            { type: 'button', text: 'Select Growth', href: '{{GrowthUrl}}', align: 'center' }
          ],
          [
            { type: 'heading', text: 'Scale', size: '16px' },
            { type: 'text', html: '<strong>{{ScalePrice}}</strong><br>{{ScaleDesc}}<br>&bull; {{ScaleFeatureOne}}<br>&bull; {{ScaleFeatureTwo}}', color: '#475569' },
            { type: 'button', text: 'Select Scale', href: '{{ScaleUrl}}', align: 'center' }
          ]
        ]
      },
      { type: 'text', html: 'Need a custom plan? {{SalesEmail}}', size: '12px', color: '#64748b' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-community-spotlight',
    title: 'Community Spotlight',
    category: 'Community',
    subject: 'Community spotlight: {{MemberName}}',
    shortcut: '/community',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-045/1200/720', radius: '16px' },
      { type: 'heading', text: 'Community Spotlight: {{MemberName}}', size: '26px' },
      { type: 'text', html: '{{MemberRole}} at {{MemberCompany}}', size: '12px', color: '#6b7280' },
      { type: 'text', html: '{{SpotlightIntro}}', color: '#065f46' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Favorite tools', size: '16px' },
            { type: 'text', html: '&bull; {{ToolOne}}<br>&bull; {{ToolTwo}}<br>&bull; {{ToolThree}}', color: '#065f46' }
          ],
          [
            { type: 'heading', text: 'Advice to newcomers', size: '16px' },
            { type: 'text', html: '{{Advice}}', color: '#065f46' }
          ]
        ]
      },
      { type: 'button', text: 'Say hello', href: '{{ProfileUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-community-ambassador',
    title: 'Ambassador Program',
    category: 'Community',
    subject: 'Join the {{Brand}} ambassador program',
    shortcut: '/ambassador',
    tier: 'free',
    stylePresetId: 'vapor-peach',
    bgEmail: '#fff1f2',
    fontFamily: 'Trebuchet MS, Verdana, sans-serif',
    fontColor: '#4c0519',
    blocks: [
      { type: 'heading', text: '{{Brand}} Ambassador Program', size: '26px' },
      { type: 'text', html: 'Become a voice for {{Brand}} and earn rewards.', color: '#9f1239' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-046/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Program benefits', size: '16px', color: '#4c0519' },
            { type: 'text', html: '&bull; {{BenefitOne}}<br>&bull; {{BenefitTwo}}<br>&bull; {{BenefitThree}}', color: '#9f1239' }
          ],
          [
            { type: 'heading', text: 'Who is a fit', size: '16px', color: '#4c0519' },
            { type: 'text', html: '{{AmbassadorFit}}', color: '#9f1239' }
          ]
        ]
      },
      { type: 'button', text: 'Apply to join', href: '{{ProgramUrl}}', align: 'left' },
      { type: 'text', html: 'Applications close {{Deadline}}.', size: '12px', color: '#9f1239' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-community-survey',
    title: 'Member Survey',
    category: 'Community',
    subject: 'Help shape {{Brand}}',
    shortcut: '/survey',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'heading', text: 'We want your feedback', size: '26px' },
      { type: 'text', html: 'Help shape the next version of {{Brand}}.', color: '#475569' },
      {
        type: 'text',
        html: '<strong>Survey topics</strong><br>{{SurveyTopics}}',
        color: '#0f172a',
        background: '#f8fafc',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
      },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            {
              type: 'text',
              html: '<strong>{{TimeEstimate}}</strong><br>Minutes to complete',
              color: '#0f172a',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{Incentive}}</strong><br>Thank you gift',
              color: '#0f172a',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{SurveyDeadline}}</strong><br>Deadline',
              color: '#0f172a',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
            }
          ]
        ]
      },
      { type: 'button', text: 'Take the survey', href: '{{SurveyUrl}}', align: 'left' },
      { type: 'text', html: 'Thank you for being part of the community.', size: '12px', color: '#64748b' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-community-gallery',
    title: 'User Gallery - Showcase',
    category: 'Community',
    subject: 'See what the community created',
    shortcut: '/galleryc',
    tier: 'free',
    stylePresetId: 'citrus-pop',
    bgEmail: '#fffbeb',
    fontFamily: 'Verdana, sans-serif',
    fontColor: '#78350f',
    blocks: [
      { type: 'heading', text: 'Community Showcase', size: '28px', align: 'center', color: '#78350f' },
      { type: 'text', html: 'What members built with {{Brand}}.', color: '#92400e', align: 'center' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-047/600/360', radius: '12px' },
            { type: 'text', html: '{{ShowcaseOne}}', size: '12px', color: '#92400e', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-048/600/360', radius: '12px' },
            { type: 'text', html: '{{ShowcaseTwo}}', size: '12px', color: '#92400e', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-049/600/360', radius: '12px' },
            { type: 'text', html: '{{ShowcaseThree}}', size: '12px', color: '#92400e', align: 'center' }
          ]
        ]
      },
      { type: 'button', text: 'Submit your work', href: '{{SubmitUrl}}', align: 'center' },
      { type: 'text', html: 'Explore the full gallery at {{GalleryUrl}}.', size: '12px', color: '#92400e', align: 'center' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-community-recap',
    title: 'Community Event Recap',
    category: 'Community',
    subject: '{{EventName}} community recap',
    shortcut: '/communityrecap',
    tier: 'free',
    stylePresetId: 'aqua-studio',
    bgEmail: '#ecfeff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-050/1200/720', radius: '16px' },
      { type: 'heading', text: '{{EventName}} Recap', size: '26px' },
      { type: 'text', html: 'Highlights from our community gathering.', color: '#475569' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Top moments', size: '16px' },
            { type: 'text', html: '&bull; {{MomentOne}}<br>&bull; {{MomentTwo}}<br>&bull; {{MomentThree}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: 'Favorite quotes', size: '16px' },
            { type: 'text', html: '"{{QuoteOne}}"<br>"{{QuoteTwo}}"', color: '#475569' }
          ]
        ]
      },
      { type: 'button', text: 'View the photo album', href: '{{AlbumUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-content-digest',
    title: 'Content Digest - Blog',
    category: 'Content',
    subject: '{{Brand}} blog digest | {{Month}}',
    shortcut: '/digestblog',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'heading', text: 'Blog Digest', size: '28px' },
      { type: 'text', html: '{{Month}} highlights from {{Brand}}.', color: '#64748b' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-051/900/540', radius: '12px' },
            { type: 'heading', text: '{{PostOneTitle}}', size: '16px' },
            { type: 'text', html: '{{PostOneSummary}}', color: '#475569' },
            { type: 'button', text: 'Read post', href: '{{PostOneUrl}}', align: 'left' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-052/900/540', radius: '12px' },
            { type: 'heading', text: '{{PostTwoTitle}}', size: '16px' },
            { type: 'text', html: '{{PostTwoSummary}}', color: '#475569' },
            { type: 'button', text: 'Read post', href: '{{PostTwoUrl}}', align: 'left' }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Popular now</strong><br>{{PopularPostTitle}}',
        color: '#0f172a',
        background: '#f8fafc',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e2e8f0' }
      },
      { type: 'button', text: 'See all posts', href: '{{BlogUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-content-podcast',
    title: 'Podcast Episode',
    category: 'Content',
    subject: 'New episode: {{EpisodeTitle}}',
    shortcut: '/podcast',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-053/1200/720', radius: '16px' },
      { type: 'heading', text: 'New Episode: {{EpisodeTitle}}', size: '26px' },
      { type: 'text', html: 'Featuring {{GuestName}} | {{EpisodeNumber}}', size: '12px', color: '#6b7280' },
      { type: 'text', html: '{{EpisodeSummary}}', color: '#475569' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Key moments', size: '16px' },
            { type: 'text', html: '&bull; {{MomentOne}}<br>&bull; {{MomentTwo}}<br>&bull; {{MomentThree}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: 'About the guest', size: '16px' },
            { type: 'text', html: '{{GuestBio}}', color: '#475569' }
          ]
        ]
      },
      { type: 'button', text: 'Listen now', href: '{{EpisodeUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-content-video',
    title: 'Video Series Launch',
    category: 'Content',
    subject: '{{SeriesName}} video series',
    shortcut: '/video',
    tier: 'free',
    stylePresetId: 'midnight-neon',
    bgEmail: '#0b1120',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#e2e8f0',
    blocks: [
      { type: 'heading', text: '{{SeriesName}} Video Series', size: '30px', align: 'center', color: '#f8fafc' },
      { type: 'text', html: 'New episodes every {{Cadence}}.', align: 'center', color: '#cbd5e1' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-054/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'heading', text: 'Episode 1', size: '14px', color: '#f8fafc' },
            { type: 'text', html: '{{EpisodeOneTitle}}', color: '#cbd5e1' }
          ],
          [
            { type: 'heading', text: 'Episode 2', size: '14px', color: '#f8fafc' },
            { type: 'text', html: '{{EpisodeTwoTitle}}', color: '#cbd5e1' }
          ],
          [
            { type: 'heading', text: 'Episode 3', size: '14px', color: '#f8fafc' },
            { type: 'text', html: '{{EpisodeThreeTitle}}', color: '#cbd5e1' }
          ]
        ]
      },
      { type: 'button', text: 'Watch episode 1', href: '{{SeriesUrl}}', align: 'center' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-content-guide',
    title: 'Guide Release',
    category: 'Content',
    subject: 'New guide: {{GuideTitle}}',
    shortcut: '/guide',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-055/1200/720', radius: '16px' },
      { type: 'heading', text: '{{GuideTitle}}', size: '28px' },
      { type: 'text', html: 'A step-by-step guide for {{Audience}}.', color: '#475569' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'What you will learn', size: '16px' },
            { type: 'text', html: '&bull; {{LessonOne}}<br>&bull; {{LessonTwo}}<br>&bull; {{LessonThree}}', color: '#475569' }
          ],
          [
            { type: 'heading', text: 'Includes', size: '16px' },
            { type: 'text', html: '&bull; {{IncludeOne}}<br>&bull; {{IncludeTwo}}<br>&bull; {{IncludeThree}}', color: '#475569' }
          ]
        ]
      },
      { type: 'button', text: 'Download the guide', href: '{{GuideUrl}}', align: 'left' },
      { type: 'text', html: 'Format: {{Format}} | Length: {{Length}}', size: '12px', color: '#64748b' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-content-report',
    title: 'Research Report',
    category: 'Content',
    subject: '{{ReportTitle}} report',
    shortcut: '/report',
    tier: 'free',
    stylePresetId: 'mono-ink',
    bgEmail: '#f5f5f4',
    fontFamily: "'Courier New', monospace",
    fontColor: '#1c1917',
    blocks: [
      { type: 'heading', text: '{{ReportTitle}}', size: '28px' },
      { type: 'text', html: 'Key findings from {{SampleSize}} responses.', color: '#57534e' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-056/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            {
              type: 'text',
              html: '<strong>{{StatOneValue}}</strong><br>{{StatOneLabel}}',
              color: '#1c1917',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e7e5e4' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{StatTwoValue}}</strong><br>{{StatTwoLabel}}',
              color: '#1c1917',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e7e5e4' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{StatThreeValue}}</strong><br>{{StatThreeLabel}}',
              color: '#1c1917',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e7e5e4' }
            }
          ]
        ]
      },
      {
        type: 'text',
        html: '<strong>Top insight</strong><br>{{TopInsight}}',
        color: '#1c1917',
        background: '#ffffff',
        layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#e7e5e4' }
      },
      { type: 'button', text: 'Download the report', href: '{{ReportUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-content-interview',
    title: 'Expert Interview',
    category: 'Content',
    subject: 'Interview with {{GuestName}}',
    shortcut: '/interview',
    tier: 'free',
    stylePresetId: 'vapor-peach',
    bgEmail: '#fff1f2',
    fontFamily: 'Trebuchet MS, Verdana, sans-serif',
    fontColor: '#4c0519',
    blocks: [
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-057/1200/720', radius: '16px' },
      { type: 'heading', text: 'Interview: {{GuestName}}', size: '26px' },
      { type: 'text', html: '{{GuestRole}} at {{GuestCompany}}', size: '12px', color: '#9f1239' },
      { type: 'text', html: '{{InterviewIntro}}', color: '#4c0519' },
      { type: 'text', html: '<blockquote>{{Quote}}</blockquote>', color: '#4c0519' },
      { type: 'button', text: 'Read the interview', href: '{{InterviewUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-company-milestone',
    title: 'Company Milestone',
    category: 'Company',
    subject: '{{Brand}} milestone: {{Milestone}}',
    shortcut: '/milestone',
    tier: 'free',
    stylePresetId: 'cobalt-cloud',
    bgEmail: '#eef2ff',
    fontFamily: 'Tahoma, sans-serif',
    fontColor: '#111827',
    blocks: [
      { type: 'heading', text: 'We reached {{Milestone}}', size: '28px' },
      { type: 'text', html: 'Thank you for helping {{Brand}} get here.', color: '#475569' },
      { type: 'image', src: 'https://picsum.photos/seed/zt-template-058/1200/720', radius: '16px' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            {
              type: 'text',
              html: '<strong>{{MilestoneOneValue}}</strong><br>{{MilestoneOneLabel}}',
              color: '#111827',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#c7d2fe' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{MilestoneTwoValue}}</strong><br>{{MilestoneTwoLabel}}',
              color: '#111827',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#c7d2fe' }
            }
          ],
          [
            {
              type: 'text',
              html: '<strong>{{MilestoneThreeValue}}</strong><br>{{MilestoneThreeLabel}}',
              color: '#111827',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#c7d2fe' }
            }
          ]
        ]
      },
      { type: 'button', text: 'See the story', href: '{{StoryUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-company-press',
    title: 'Press Roundup',
    category: 'Company',
    subject: '{{Brand}} in the news',
    shortcut: '/press',
    tier: 'free',
    stylePresetId: 'editorial-serif',
    bgEmail: '#fff7ed',
    fontFamily: 'Georgia, serif',
    fontColor: '#1f2937',
    blocks: [
      { type: 'heading', text: 'In the news', size: '28px' },
      { type: 'text', html: 'Recent coverage of {{Brand}}.', color: '#6b7280' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            {
              type: 'text',
              html: '"{{PressQuoteOne}}"<br><strong>{{PressSourceOne}}</strong>',
              color: '#1f2937',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#fed7aa' }
            }
          ],
          [
            {
              type: 'text',
              html: '"{{PressQuoteTwo}}"<br><strong>{{PressSourceTwo}}</strong>',
              color: '#1f2937',
              background: '#ffffff',
              layout: { padding: '12px', radius: '12px', borderWidth: '1', borderColor: '#fed7aa' }
            }
          ]
        ]
      },
      { type: 'button', text: 'Read all coverage', href: '{{PressUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-company-team',
    title: 'Team Update',
    category: 'Company',
    subject: '{{Brand}} team update | {{Month}}',
    shortcut: '/team',
    tier: 'free',
    stylePresetId: 'ghost-minimal',
    bgEmail: '#ffffff',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    fontColor: '#0f172a',
    blocks: [
      { type: 'heading', text: 'Team update', size: '28px' },
      { type: 'text', html: '{{Month}} {{Year}} | {{Brand}}', size: '12px', color: '#64748b' },
      {
        type: 'grid',
        cols: 3,
        columns: [
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-059/600/360', radius: '12px' },
            { type: 'text', html: '<strong>{{TeamMemberOne}}</strong><br>{{TeamMemberOneRole}}', size: '12px', color: '#475569', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-060/600/360', radius: '12px' },
            { type: 'text', html: '<strong>{{TeamMemberTwo}}</strong><br>{{TeamMemberTwoRole}}', size: '12px', color: '#475569', align: 'center' }
          ],
          [
            { type: 'image', src: 'https://picsum.photos/seed/zt-template-061/600/360', radius: '12px' },
            { type: 'text', html: '<strong>{{TeamMemberThree}}</strong><br>{{TeamMemberThreeRole}}', size: '12px', color: '#475569', align: 'center' }
          ]
        ]
      },
      { type: 'text', html: 'We are growing in {{Teams}}.', color: '#475569' },
      { type: 'button', text: 'Meet the team', href: '{{TeamUrl}}', align: 'left' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  },
  {
    id: 'tpl-company-hiring',
    title: 'Hiring Highlights',
    category: 'Company',
    subject: 'We are hiring: {{Role}}',
    shortcut: '/hiring',
    tier: 'free',
    stylePresetId: 'mint-labs',
    bgEmail: '#ecfdf5',
    fontFamily: 'Arial, sans-serif',
    fontColor: '#064e3b',
    blocks: [
      { type: 'heading', text: 'We are hiring', size: '28px' },
      { type: 'text', html: 'Join {{Brand}} and help build {{Mission}}.', color: '#065f46' },
      {
        type: 'grid',
        cols: 2,
        columns: [
          [
            { type: 'heading', text: 'Open roles', size: '16px' },
            { type: 'text', html: '&bull; {{RoleOne}}<br>&bull; {{RoleTwo}}<br>&bull; {{RoleThree}}', color: '#065f46' }
          ],
          [
            { type: 'heading', text: 'Why join', size: '16px' },
            { type: 'text', html: '{{HiringHighlights}}', color: '#065f46' }
          ]
        ]
      },
      { type: 'button', text: 'View open roles', href: '{{CareersUrl}}', align: 'left' },
      { type: 'text', html: 'Remote-friendly | {{Location}}', size: '12px', color: '#6b7280' },
      { type: 'social', networks: ['Instagram', 'TikTok', 'YouTube'] }
    ]
  }
];

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
  'tpl-promo-flash'
];

function getMailPawIconSrc() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return chrome.runtime.getURL('mailpaw-icon-64.png');
  }
  return 'mailpaw-icon-64.png';
}
