(() => {
  const root = document.documentElement;
  const hex = value => /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : null;
  const number = (value, fallback, min, max) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
  };

  fetch('/content/theme.json?ts=' + Date.now(), { cache: 'no-store' })
    .then(response => response.ok ? response.json() : null)
    .then(theme => {
      if (!theme) return;
      const variables = {
        '--paper': hex(theme.paper),
        '--paper-2': hex(theme.paper2),
        '--ink': hex(theme.ink),
        '--navy': hex(theme.navy),
        '--text': hex(theme.text),
        '--muted': hex(theme.muted),
        '--violet': hex(theme.primary),
        '--violet-2': hex(theme.primarySoft),
        '--blue': hex(theme.secondary),
        '--cyan': hex(theme.accent),
        '--orange': hex(theme.warm),
        '--gold': hex(theme.gold),
        '--radius-xl': number(theme.radius, 28, 8, 48) + 'px',
        '--radius-lg': Math.max(8, number(theme.radius, 28, 8, 48) - 4) + 'px',
        '--radius-md': Math.max(8, number(theme.radius, 28, 8, 48) - 8) + 'px',
        '--container': `min(${number(theme.containerWidth, 1240, 960, 1480)}px, calc(100vw - 48px))`,
        '--cms-section-space': number(theme.sectionSpacing, 112, 64, 160) + 'px',
        '--cms-hero-desktop': number(theme.heroDesktop, 74, 52, 100) + 'px',
        '--cms-hero-mobile': number(theme.heroMobile, 56, 38, 68) + 'px'
      };
      Object.entries(variables).forEach(([key, value]) => value && root.style.setProperty(key, value));
      root.dataset.motion = ['soft','off'].includes(theme.animation) ? theme.animation : 'normal';
    })
    .catch(() => {});
})();
