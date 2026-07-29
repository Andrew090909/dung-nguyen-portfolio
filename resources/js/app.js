import { initNavigation } from './modules/navigation';
import { initInteractions } from './modules/interactions';
import { initForms } from './modules/forms';

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initInteractions();
  initForms();

  const { initMotion } = await import('./modules/motion');
  initMotion();

  if (!document.querySelector('[data-globe]')) return;

  const startGlobe = async () => {
    const { initGlobe } = await import('./modules/globe');
    initGlobe();
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(startGlobe, { timeout: 1200 });
  } else {
    window.setTimeout(startGlobe, 180);
  }
});
