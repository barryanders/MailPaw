document.getElementById('open-gmail').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://mail.google.com/' });
});

function setBadgeVariant(badge, variant) {
  const variants = {
    trial: { bg: 'rgba(14, 165, 233, 0.12)', color: '#0284c7' },
    active: { bg: 'rgba(34, 197, 94, 0.15)', color: '#15803d' },
    lifetime: { bg: 'rgba(15, 23, 42, 0.12)', color: '#0f172a' },
    expired: { bg: 'rgba(239, 68, 68, 0.15)', color: '#b91c1c' },
    dev: { bg: 'rgba(59, 130, 246, 0.12)', color: '#1d4ed8' }
  };
  const palette = variants[variant] || variants.trial;
  badge.style.background = palette.bg;
  badge.style.color = palette.color;
}
