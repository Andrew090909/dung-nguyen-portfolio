(() => {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const panel = document.querySelector('.mobile-menu-panel');
  const backdrop = document.querySelector('.mobile-menu-backdrop');
  if (!toggle || !panel || !backdrop) return;

  let previousFocus = null;
  const focusable = () => [...panel.querySelectorAll('a[href],button:not([disabled])')];
  const close = () => {
    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.classList.remove('mobile-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    (previousFocus || toggle).focus({ preventScroll: true });
  };
  const open = () => {
    previousFocus = document.activeElement;
    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.classList.add('mobile-menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    focusable()[0]?.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => panel.classList.contains('is-open') ? close() : open());
  document.querySelectorAll('[data-mobile-menu-close]').forEach(el => el.addEventListener('click', close));
  panel.querySelectorAll('a').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) close();
    if (event.key !== 'Tab' || !panel.classList.contains('is-open')) return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 900 && panel.classList.contains('is-open')) close(); });
})();
