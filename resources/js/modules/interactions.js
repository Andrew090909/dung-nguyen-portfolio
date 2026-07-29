export function initInteractions() {
  const cursor = document.querySelector('.cursor-orbit');
  if (cursor && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      cursor.style.opacity = '1';
      cursor.style.transform = `translate(${event.clientX - 14}px, ${event.clientY - 14}px)`;
    }, { passive: true });
    document.querySelectorAll('a,button,.tilt-card').forEach((element) => {
      element.addEventListener('pointerenter', () => { cursor.style.width = '48px'; cursor.style.height = '48px'; });
      element.addEventListener('pointerleave', () => { cursor.style.width = '28px'; cursor.style.height = '28px'; });
    });
  }

  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (!window.matchMedia('(pointer:fine)').matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 7}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}
