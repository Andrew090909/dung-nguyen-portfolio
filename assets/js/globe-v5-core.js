(() => {
  'use strict';

  const stage = document.querySelector('[data-code-globe]');
  if (!stage) return;

  const globeCanvas = stage.querySelector('.digital-globe-webgl');
  const netCanvas = stage.querySelector('.digital-globe-network');
  const codeLayer = stage.querySelector('.digital-globe-code-layer');
  const capabilities = [...stage.querySelectorAll('.digital-capability')];
  const gctx = globeCanvas.getContext('2d', { alpha: true });
  const nctx = netCanvas.getContext('2d', { alpha: true });
  if (!gctx || !nctx || !codeLayer) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const baseSpeed = reducedMotion ? 0 : (Math.PI * 2) / 38;
  const BASE_TILT_X = 0;
  const BASE_TILT_Z = 0;
  const longitudeAlignment = 0;

  let rotationY = 0;
  let tiltX = BASE_TILT_X;
  let tiltZ = BASE_TILT_Z;
  let targetTiltX = BASE_TILT_X;
  let targetTiltZ = BASE_TILT_Z;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let hoverAmount = 0;
  let targetHoverAmount = 0;
  let speedFactor = 1;
  let targetSpeedFactor = 1;
  let last = performance.now();
  let running = true;
  let cssSize = 500;
  let dpr = 1;
  let sphereMap = null;
  let texture = null;
  let textureW = 0;
  let textureH = 0;
  let lastSphereDraw = 0;

  const nodes = [
    {lat:40.71,lon:-74.00},{lat:34.05,lon:-118.24},{lat:19.43,lon:-99.13},{lat:-23.55,lon:-46.63},
    {lat:51.51,lon:-0.13},{lat:48.86,lon:2.35},{lat:52.52,lon:13.40},{lat:25.20,lon:55.27},
    {lat:19.08,lon:72.88},{lat:28.70,lon:77.10},{lat:39.90,lon:116.40},{lat:31.23,lon:121.47},
    {lat:35.68,lon:139.69},{lat:37.57,lon:126.98},{lat:1.35,lon:103.82},{lat:10.82,lon:106.63},
    {lat:-6.21,lon:106.85},{lat:-33.87,lon:151.21},{lat:-37.81,lon:144.96},{lat:-33.93,lon:18.42}
  ];
  const links = [[0,4],[0,3],[0,1],[4,6],[4,8],[6,10],[8,14],[8,15],[10,11],[11,12],[12,13],[14,15],[15,16],[14,17],[3,19],[17,18],[1,12],[3,15],[5,9],[9,10]];

  const img = new Image();
  img.onload = () => {
    const oc = document.createElement('canvas');
    oc.width = img.naturalWidth;
    oc.height = img.naturalHeight;
    const ocx = oc.getContext('2d', { willReadFrequently: true });
    ocx.drawImage(img, 0, 0);
    texture = ocx.getImageData(0, 0, oc.width, oc.height).data;
    textureW = oc.width;
    textureH = oc.height;
    stage.dataset.textureReady = 'true';
  };
  img.onerror = () => { stage.dataset.textureReady = 'false'; };
  img.src = stage.dataset.texture;

  function buildSphereMap(size) {
    const count = size * size;
    const valid = new Uint8Array(count);
    const vx = new Float32Array(count);
    const vy = new Float32Array(count);
    const vz = new Float32Array(count);
    const shade = new Float32Array(count);
    const rim = new Float32Array(count);
    const r = size * 0.486;
    const cx = size / 2;
    const cy = size / 2;
    const lx = -0.34;
    const ly = 0.62;
    const lz = 0.72;
    const ln = Math.hypot(lx, ly, lz);
    let i = 0;

    for (let py = 0; py < size; py++) {
      const y = -(py + 0.5 - cy) / r;
      for (let px = 0; px < size; px++, i++) {
        const x = (px + 0.5 - cx) / r;
        const rr = x * x + y * y;
        if (rr > 1) continue;
        const z = Math.sqrt(1 - rr);
        valid[i] = 1;
        vx[i] = x;
        vy[i] = y;
        vz[i] = z;
        const diff = Math.max(0, (x * lx + y * ly + z * lz) / ln);
        const edge = Math.pow(1 - z, 2.15);
        shade[i] = 1.055 + diff * 0.095 + edge * 0.028;
        rim[i] = edge;
      }
    }

    return { size, valid, vx, vy, vz, shade, rim, image: new ImageData(size, size) };
  }

  function inverseRotate(x, y, z) {
    let c = Math.cos(-tiltZ), s = Math.sin(-tiltZ);
    [x, y] = [c * x - s * y, s * x + c * y];
    c = Math.cos(-tiltX); s = Math.sin(-tiltX);
    [y, z] = [c * y - s * z, s * y + c * z];
    c = Math.cos(-rotationY); s = Math.sin(-rotationY);
    [x, z] = [c * x + s * z, -s * x + c * z];
    c = Math.cos(-longitudeAlignment); s = Math.sin(-longitudeAlignment);
    [x, z] = [c * x + s * z, -s * x + c * z];
    return [x, y, z];
  }

  function toneMap(r, g, b, sh, edge) {
    // High-key commercial grade: retain geographic detail while lifting the
    // navy texture into the website's white / cyan / emerald visual system.
    const gammaR = Math.pow(r / 255, 0.72) * 255;
    const gammaG = Math.pow(g / 255, 0.68) * 255;
    const gammaB = Math.pow(b / 255, 0.64) * 255;
    const lum = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const darkLift = Math.max(0, 1 - lum / 118);
    const blueDominance = Math.max(0, (b - Math.max(r, g)) / 255);
    const golden = Math.max(0, (r - b) / 255) * Math.max(0, (g - b * 0.62) / 255);
    const exposure = 1.035 * sh;
    return [
      Math.max(0, Math.min(255, gammaR * exposure + darkLift * 17 + edge * 12 + golden * 38)),
      Math.max(0, Math.min(255, gammaG * exposure + darkLift * 31 + edge * 35 + blueDominance * 12 + golden * 28)),
      Math.max(0, Math.min(255, gammaB * exposure + darkLift * 48 + edge * 67 + blueDominance * 22))
    ];
  }

  function drawSphere(now) {
    if (!texture || !sphereMap) return;
    if (now - lastSphereDraw < 50 && !reducedMotion) return;
    lastSphereDraw = now;

    const { size, valid, vx, vy, vz, shade, rim, image } = sphereMap;
    const out = image.data;
    const tw = textureW;
    const th = textureH;

    for (let i = 0, o = 0; i < valid.length; i++, o += 4) {
      if (!valid[i]) {
        out[o] = 0; out[o + 1] = 0; out[o + 2] = 0; out[o + 3] = 0;
        continue;
      }

      const p = inverseRotate(vx[i], vy[i], vz[i]);
      const lon = Math.atan2(p[2], p[0]);
      const lat = Math.asin(Math.max(-1, Math.min(1, p[1])));
      let u = lon / (Math.PI * 2) + 0.5;
      u -= Math.floor(u);
      let v = 0.5 - lat / Math.PI;
      v = Math.max(0, Math.min(0.9999, v));
      const sx = Math.min(tw - 1, Math.floor(u * tw));
      const sy = Math.min(th - 1, Math.floor(v * th));
      const si = (sy * tw + sx) * 4;
      const rgb = toneMap(texture[si], texture[si + 1], texture[si + 2], shade[i], rim[i]);

      out[o] = rgb[0];
      out[o + 1] = rgb[1];
      out[o + 2] = rgb[2];
      out[o + 3] = 255;
    }

    const off = drawSphere.off || (drawSphere.off = document.createElement('canvas'));
    off.width = size;
    off.height = size;
    const oc = off.getContext('2d');
    oc.putImageData(image, 0, 0);

    gctx.clearRect(0, 0, globeCanvas.width, globeCanvas.height);
    gctx.imageSmoothingEnabled = true;
    gctx.imageSmoothingQuality = 'high';
    gctx.drawImage(off, 0, 0, globeCanvas.width, globeCanvas.height);

    // Atmosphere and soft top-right daylight, rendered as code rather than a black backing panel.
    gctx.save();
    gctx.globalCompositeOperation = 'screen';
    const cx = globeCanvas.width * 0.5;
    const cy = globeCanvas.height * 0.5;
    const r = globeCanvas.width * 0.49;
    const atmosphere = gctx.createRadialGradient(cx, cy, r * 0.73, cx, cy, r);
    atmosphere.addColorStop(0, 'rgba(0,90,255,0)');
    atmosphere.addColorStop(0.78, 'rgba(27,145,255,0.025)');
    atmosphere.addColorStop(0.93, 'rgba(100,220,241,0.16)');
    atmosphere.addColorStop(1, 'rgba(225,252,255,0.50)');
    gctx.fillStyle = atmosphere;
    gctx.beginPath();
    gctx.arc(cx, cy, r, 0, Math.PI * 2);
    gctx.fill();

    const daylight = gctx.createRadialGradient(
      globeCanvas.width * 0.70, globeCanvas.height * 0.22, 0,
      globeCanvas.width * 0.70, globeCanvas.height * 0.22, globeCanvas.width * 0.38
    );
    daylight.addColorStop(0, 'rgba(245,255,255,0.34)');
    daylight.addColorStop(0.45, 'rgba(112,224,226,0.09)');
    daylight.addColorStop(1, 'rgba(0,0,0,0)');
    gctx.fillStyle = daylight;
    gctx.beginPath();
    gctx.arc(cx, cy, r, 0, Math.PI * 2);
    gctx.fill();
    gctx.restore();
  }

  function vecFromLatLon(lat, lon, radius = 1.025) {
    const la = lat * Math.PI / 180;
    const lo = lon * Math.PI / 180;
    return [radius * Math.cos(la) * Math.cos(lo), radius * Math.sin(la), radius * Math.cos(la) * Math.sin(lo)];
  }

  function rotateVec(v) {
    let [x, y, z] = v;
    let c = Math.cos(longitudeAlignment), s = Math.sin(longitudeAlignment);
    [x, z] = [c * x + s * z, -s * x + c * z];
    c = Math.cos(rotationY); s = Math.sin(rotationY);
    [x, z] = [c * x + s * z, -s * x + c * z];
    c = Math.cos(tiltX); s = Math.sin(tiltX);
    [y, z] = [c * y - s * z, s * y + c * z];
    c = Math.cos(tiltZ); s = Math.sin(tiltZ);
    [x, y] = [c * x - s * y, s * x + c * y];
    return [x, y, z];
  }

  function project(v) {
    const [x, y, z] = rotateVec(v);
    const camera = 3.2;
    const scale = (cssSize * 0.43) * camera / (camera - z);
    return { x: cssSize / 2 + x * scale, y: cssSize / 2 - y * scale, z, visible: z > 0.02 };
  }

  function slerp(a, b, t) {
    let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    dot = Math.max(-1, Math.min(1, dot));
    const omega = Math.acos(dot);
    if (omega < 1e-5) return a.slice();
    const so = Math.sin(omega);
    const s1 = Math.sin((1 - t) * omega) / so;
    const s2 = Math.sin(t * omega) / so;
    const h = 1 + Math.sin(Math.PI * t) * 0.08;
    return [(a[0] * s1 + b[0] * s2) * h, (a[1] * s1 + b[1] * s2) * h, (a[2] * s1 + b[2] * s2) * h];
  }

  function drawNetwork(now) {
    nctx.clearRect(0, 0, cssSize, cssSize);
    nctx.save();
    nctx.beginPath();
    nctx.arc(cssSize / 2, cssSize / 2, cssSize * 0.43, 0, Math.PI * 2);
    nctx.clip();
    nctx.globalCompositeOperation = 'screen';

    for (const [ia, ib] of links) {
      const a = vecFromLatLon(nodes[ia].lat, nodes[ia].lon);
      const b = vecFromLatLon(nodes[ib].lat, nodes[ib].lon);
      let drawing = false;
      nctx.beginPath();
      for (let i = 0; i <= 36; i++) {
        const p = project(slerp(a, b, i / 36));
        if (!p.visible) { drawing = false; continue; }
        if (!drawing) { nctx.moveTo(p.x, p.y); drawing = true; }
        else nctx.lineTo(p.x, p.y);
      }
      nctx.strokeStyle = 'rgba(189,232,255,.36)';
      nctx.lineWidth = Math.max(0.72, cssSize / 790);
      nctx.stroke();
    }

    nodes.forEach((n, i) => {
      const p = project(vecFromLatLon(n.lat, n.lon, 1.038));
      if (!p.visible) return;
      const pulse = 1 + Math.sin(now * 0.0022 + i * 0.83) * 0.22;
      const r = Math.max(1.7, cssSize / 220) * pulse;
      const grd = nctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5.2);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(0.18, 'rgba(97,200,255,1)');
      grd.addColorStop(0.48, 'rgba(16,126,255,.62)');
      grd.addColorStop(1, 'rgba(25,127,255,0)');
      nctx.fillStyle = grd;
      nctx.beginPath();
      nctx.arc(p.x, p.y, r * 5.2, 0, Math.PI * 2);
      nctx.fill();
      nctx.fillStyle = 'rgba(255,255,255,.98)';
      nctx.beginPath();
      nctx.arc(p.x, p.y, r * 0.72, 0, Math.PI * 2);
      nctx.fill();
    });

    nctx.restore();
  }

  function resize() {
    const rect = globeCanvas.getBoundingClientRect();
    cssSize = Math.max(1, Math.min(rect.width, rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (globeCanvas.width !== w || globeCanvas.height !== h) {
      globeCanvas.width = w;
      globeCanvas.height = h;
    }
    if (netCanvas.width !== w || netCanvas.height !== h) {
      netCanvas.width = w;
      netCanvas.height = h;
    }
    nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const nextSize = Math.max(260, Math.min(420, Math.round(cssSize * dpr * 0.86)));
    if (!sphereMap || sphereMap.size !== nextSize) {
      sphereMap = buildSphereMap(nextSize);
      lastSphereDraw = 0;
    }
  }

  function updateInteractiveLayer(now) {
    const t = now / 1000;
    pointerX += (targetPointerX - pointerX) * 0.075;
    pointerY += (targetPointerY - pointerY) * 0.075;
    hoverAmount += (targetHoverAmount - hoverAmount) * 0.075;
    speedFactor += (targetSpeedFactor - speedFactor) * 0.045;
    tiltX += (targetTiltX - tiltX) * 0.055;
    tiltZ += (targetTiltZ - tiltZ) * 0.055;

    const floatY = reducedMotion ? 0 : Math.sin(t * 0.85) * 3.2;
    const followX = pointerX * 10 * hoverAmount;
    const followY = pointerY * 7 * hoverAmount + floatY;
    codeLayer.style.transform = `translate3d(${followX.toFixed(2)}px, ${followY.toFixed(2)}px, 0) scale(${(1 + hoverAmount * 0.012).toFixed(4)})`;
    stage.style.setProperty('--pointer-x', `${(pointerX * 8).toFixed(2)}px`);
    stage.style.setProperty('--pointer-y', `${(pointerY * 6).toFixed(2)}px`);
    stage.style.setProperty('--hover', hoverAmount.toFixed(3));

    capabilities.forEach((el, i) => {
      const phase = i * 1.34;
      const ampX = i === 4 ? 5 : 7;
      const ampY = i === 4 ? 4 : 6;
      const orbitX = reducedMotion ? 0 : Math.sin(t * (0.47 + i * 0.025) + phase) * ampX;
      const orbitY = reducedMotion ? 0 : Math.cos(t * (0.41 + i * 0.021) + phase * 0.84) * ampY;
      const follow = 1 + (i % 2) * 0.14;
      el.style.setProperty('--cap-x', `${(orbitX + pointerX * 3.8 * follow * hoverAmount).toFixed(2)}px`);
      el.style.setProperty('--cap-y', `${(orbitY + pointerY * 3.0 * follow * hoverAmount).toFixed(2)}px`);
      el.style.setProperty('--cap-r', `${(Math.sin(t * 0.38 + phase) * 0.65).toFixed(2)}deg`);
    });
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    rotationY += baseSpeed * speedFactor * dt;
    updateInteractiveLayer(now);
    resize();
    drawSphere(now);
    drawNetwork(now);
    requestAnimationFrame(frame);
  }

  function setPointerFromEvent(event) {
    const rect = stage.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    targetPointerX = Math.max(-1, Math.min(1, nx));
    targetPointerY = Math.max(-1, Math.min(1, ny));
    targetTiltX = BASE_TILT_X + targetPointerY * 0.095;
    targetTiltZ = BASE_TILT_Z + targetPointerX * 0.105;
  }

  stage.addEventListener('pointerenter', (event) => {
    targetHoverAmount = 1;
    targetSpeedFactor = 0.08;
    setPointerFromEvent(event);
    stage.classList.add('is-interacting');
  });

  stage.addEventListener('pointermove', setPointerFromEvent, { passive: true });

  stage.addEventListener('pointerleave', () => {
    targetHoverAmount = 0;
    targetSpeedFactor = 1;
    targetPointerX = 0;
    targetPointerY = 0;
    targetTiltX = BASE_TILT_X;
    targetTiltZ = BASE_TILT_Z;
    stage.classList.remove('is-interacting');
  });

  const io = new IntersectionObserver(entries => {
    running = entries.some(e => e.isIntersecting);
    if (running) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  }, { threshold: 0.05 });
  io.observe(stage);

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  window.addEventListener('resize', resize, { passive: true });

  window.__globePreview = {
    setRotation(value) {
      rotationY = value;
      resize();
      drawSphere(performance.now() + 1000);
      drawNetwork(performance.now() + 1000);
      return rotationY;
    },
    getRotation() { return rotationY; },
    pause() { running = false; },
    resume() {
      if (!running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
      }
    },
    setHover(value, x = 0, y = 0) {
      targetHoverAmount = value ? 1 : 0;
      targetSpeedFactor = value ? 0.08 : 1;
      targetPointerX = Math.max(-1, Math.min(1, x));
      targetPointerY = Math.max(-1, Math.min(1, y));
      targetTiltX = BASE_TILT_X + targetPointerY * 0.095;
      targetTiltZ = BASE_TILT_Z + targetPointerX * 0.105;
    }
,
    demoFrame({ rotation = rotationY, time = 0, hover = 0, x = 0, y = 0 } = {}) {
      rotationY = rotation;
      targetPointerX = pointerX = Math.max(-1, Math.min(1, x));
      targetPointerY = pointerY = Math.max(-1, Math.min(1, y));
      targetHoverAmount = hoverAmount = hover ? 1 : 0;
      targetSpeedFactor = speedFactor = hover ? 0.08 : 1;
      targetTiltX = tiltX = BASE_TILT_X + pointerY * 0.095;
      targetTiltZ = tiltZ = BASE_TILT_Z + pointerX * 0.105;
      resize();
      updateInteractiveLayer(time * 1000 + 1000);
      lastSphereDraw = 0;
      drawSphere(time * 1000 + 1000);
      drawNetwork(time * 1000 + 1000);
    }
  };

  requestAnimationFrame(frame);
})();
