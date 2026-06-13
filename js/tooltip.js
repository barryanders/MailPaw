/* --- TOOLTIP LOGIC --- */
function setupTooltipLogic() {
  let tooltip = document.getElementById('zt-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'zt-tooltip';
    document.body.appendChild(tooltip);
  }

  document.body.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
      const text = target.dataset.tooltip;
      if (target.getAttribute('title')) target.removeAttribute('title'); // Remove default browser tooltip
      if (text) {
        tooltip.innerText = text;
        tooltip.classList.add('show'); // Use class to show/hide
        const rect = target.getBoundingClientRect();
        const toolRect = tooltip.getBoundingClientRect();
        let top = rect.top - toolRect.height - 10;
        let left = rect.left + (rect.width / 2) - (toolRect.width / 2);
        if (top < 10) top = rect.bottom + 10; // If too high, show below
        if (left + toolRect.width > window.innerWidth) left = window.innerWidth - toolRect.width - 10; // If too far right
        if (left < 10) left = 10; // If too far left

        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
      }
    }
  });

  document.body.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-tooltip]')) {
      tooltip.classList.remove('show');
    }
  });
}
