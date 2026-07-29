import gsap from 'gsap';

export function initMotion() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');

  if (reduced) {
    reveals.forEach((element) => { element.style.opacity = '1'; });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      gsap.fromTo(entry.target, { opacity: 0, y: 42 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', clearProps: 'transform' });
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });

  reveals.forEach((element) => {
    gsap.set(element, { opacity: 0, y: 42 });
    observer.observe(element);
  });

  const phases = document.querySelectorAll('[data-phase]');
  const phaseNumber = document.querySelector('[data-phase-number]');
  const phaseTitle = document.querySelector('[data-phase-title]');
  if (phases.length) {
    const phaseObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        phases.forEach((phase) => phase.classList.remove('is-active'));
        entry.target.classList.add('is-active');
        const index = Number(entry.target.dataset.phase || 0);
        if (phaseNumber) phaseNumber.textContent = String(index + 1).padStart(2, '0');
        if (phaseTitle) phaseTitle.textContent = entry.target.dataset.phaseTitle || '';
        window.dispatchEvent(new CustomEvent('globe:phase', { detail: { index } }));
      });
    }, { threshold: .55 });
    phases.forEach((phase) => phaseObserver.observe(phase));
  }
}
