(() => {
  'use strict';

  const body = document.body;
  if (!body || body.dataset.digitalBackgroundReady === 'true') return;
  body.dataset.digitalBackgroundReady = 'true';
  body.classList.add('digital-era');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'site-digital-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  body.prepend(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let running = true;
  let lastFrame = 0;
  const isMobile = window.matchMedia('(max-width: 700px)').matches;
  const fpsInterval = 1000 / (isMobile ? 20 : 30);
  const nodeCount = isMobile ? 36 : 72;

  const nodes = Array.from({ length: nodeCount }, (_, index) => ({
    x: ((index * 73 + 11) % 101) / 100,
    y: ((index * 47 + (index % 8) * 13) % 103) / 102,
    radius: 0.75 + (index % 4) * 0.35,
    phase: index * 0.79,
    speed: 0.55 + (index % 5) * 0.07,
    tone: index % 3
  }));

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.2 : 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawDataStream = (time, band, color) => {
    const baseline = height * (0.12 + band * 0.165);
    const amplitude = 9 + band * 1.7;
    ctx.beginPath();
    for (let x = -50; x <= width + 50; x += 26) {
      const y = baseline
        + Math.sin(x * 0.0065 + time * (0.75 + band * 0.06) + band * 1.4) * amplitude
        + pointerY * (2 + band * 0.35);
      if (x === -50) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = band % 3 === 0 ? 1.25 : 0.8;
    ctx.stroke();
  };

  const draw = (now) => {
    if (!running) return;
    requestAnimationFrame(draw);
    if (now - lastFrame < fpsInterval) return;
    lastFrame = now;

    pointerX += (targetPointerX - pointerX) * 0.045;
    pointerY += (targetPointerY - pointerY) * 0.045;
    const time = now * 0.00016;

    ctx.clearRect(0, 0, width, height);

    // Soft moving data streams. They read as infrastructure, not as a star field.
    for (let band = 0; band < 6; band += 1) {
      drawDataStream(
        time,
        band,
        band % 2
          ? 'rgba(10, 137, 85, 0.085)'
          : 'rgba(33, 145, 184, 0.080)'
      );
    }

    const positions = nodes.map((node) => ({
      x: node.x * width + Math.sin(time * node.speed * 5 + node.phase) * 7 + pointerX * 8,
      y: node.y * height + Math.cos(time * node.speed * 4 + node.phase) * 5 + pointerY * 6
    }));

    // Connect only nearby nodes to keep the visual light and performant.
    for (let i = 0; i < positions.length; i += 1) {
      const a = positions[i];
      for (let j = i + 1; j < Math.min(positions.length, i + 8); j += 1) {
        const b = positions[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > 175) continue;
        const alpha = (1 - distance / 175) * 0.105;
        ctx.strokeStyle = i % 2
          ? `rgba(10, 137, 85, ${alpha})`
          : `rgba(33, 145, 184, ${alpha})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    positions.forEach((position, index) => {
      const node = nodes[index];
      const pulse = reducedMotion ? 1 : 0.82 + Math.sin(time * 7 + node.phase) * 0.18;
      const alpha = node.tone === 0 ? 0.17 : 0.135;
      ctx.fillStyle = node.tone === 0
        ? `rgba(10, 156, 94, ${alpha * pulse})`
        : `rgba(31, 151, 190, ${alpha * pulse})`;
      ctx.beginPath();
      ctx.arc(position.x, position.y, node.radius * pulse, 0, Math.PI * 2);
      ctx.fill();

      if (index % 12 === 0) {
        ctx.strokeStyle = `rgba(32, 160, 126, ${0.07 * pulse})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(position.x, position.y, 7 + pulse * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Small moving packets imply data flow without decorative icons.
    for (let index = 0; index < 7; index += 1) {
      const x = ((time * (58 + index * 7) + index * 191) % (width + 160)) - 80;
      const y = height * (0.15 + (index % 5) * 0.17) + Math.sin(time * 3 + index) * 9;
      ctx.fillStyle = index % 2
        ? 'rgba(13, 151, 96, 0.16)'
        : 'rgba(34, 151, 189, 0.15)';
      ctx.fillRect(x, y, 3.5, 3.5);
    }
  };

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (event) => {
    targetPointerX = event.clientX / Math.max(1, width) - 0.5;
    targetPointerY = event.clientY / Math.max(1, height) - 0.5;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      lastFrame = performance.now();
      requestAnimationFrame(draw);
    }
  });

  resize();
  if (reducedMotion) {
    draw(performance.now());
    running = false;
  } else {
    requestAnimationFrame(draw);
  }
})();
