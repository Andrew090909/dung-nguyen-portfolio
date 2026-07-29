import * as THREE from 'three';

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

function fibonacciPoint(index, total, radius = 1) {
  const phi = Math.acos(1 - (2 * index + 1) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  return new THREE.Vector3(
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi),
  );
}

export function initGlobe() {
  const canvas = document.querySelector('[data-globe]');
  const root = document.querySelector('[data-globe-root]');
  if (!canvas || !root || !supportsWebGL() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  camera.position.set(0, 0, 4.7);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const group = new THREE.Group();
  scene.add(group);
  const baseColor = new THREE.Color('#00a884');
  const phaseColors = ['#00a884', '#28a8d8', '#7868f2', '#00b98f', '#ff895b'];

  const sphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.42, 4),
    new THREE.MeshBasicMaterial({ color: baseColor, wireframe: true, transparent: true, opacity: .22 }),
  );
  group.add(sphere);

  const count = 520;
  const pointPositions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const point = fibonacciPoint(i, count, 1.45 + Math.random() * .035);
    pointPositions.set([point.x, point.y, point.z], i * 3);
  }
  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
  const pointsMaterial = new THREE.PointsMaterial({ color: '#78f0c5', size: .018, transparent: true, opacity: .88, sizeAttenuation: true });
  group.add(new THREE.Points(pointsGeometry, pointsMaterial));

  const ringMaterial = new THREE.LineBasicMaterial({ color: '#28a8d8', transparent: true, opacity: .34 });
  [1.72, 1.94, 2.16].forEach((radius, index) => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * (.36 + index * .08), 0, Math.PI * 2, false, index * .5);
    const pts = curve.getPoints(180).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), ringMaterial.clone());
    ring.rotation.set(.55 + index * .36, .28 + index * .46, index * .62);
    group.add(ring);
  });

  const arcMaterial = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: .4 });
  for (let i = 0; i < 12; i += 1) {
    const start = fibonacciPoint(Math.floor(Math.random() * count), count, 1.46);
    const end = fibonacciPoint(Math.floor(Math.random() * count), count, 1.46);
    const midpoint = start.clone().add(end).multiplyScalar(.5).normalize().multiplyScalar(1.9 + Math.random() * .35);
    const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
    const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), arcMaterial.clone());
    group.add(arc);
  }

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.52, 48, 48),
    new THREE.MeshBasicMaterial({ color: '#00a884', transparent: true, opacity: .045, side: THREE.BackSide }),
  );
  group.add(glow);

  let pointerX = 0;
  let pointerY = 0;
  let running = true;
  let targetColor = new THREE.Color(phaseColors[0]);
  const pointerHandler = (event) => {
    const rect = root.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - .5) * .45;
    pointerY = ((event.clientY - rect.top) / rect.height - .5) * .3;
  };
  root.addEventListener('pointermove', pointerHandler, { passive: true });
  root.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(root);

  window.addEventListener('globe:phase', (event) => {
    const index = Number(event.detail?.index || 0) % phaseColors.length;
    targetColor = new THREE.Color(phaseColors[index]);
  });

  const visibilityObserver = new IntersectionObserver(([entry]) => { running = entry.isIntersecting; }, { threshold: .01 });
  visibilityObserver.observe(root);

  const clock = new THREE.Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    if (!running) return;
    const elapsed = clock.getElapsedTime();
    group.rotation.y += (.0016 + pointerX * .0022);
    group.rotation.x += (pointerY - group.rotation.x) * .018;
    group.rotation.z = Math.sin(elapsed * .22) * .035;
    sphere.material.color.lerp(targetColor, .025);
    glow.material.color.lerp(targetColor, .02);
    renderer.render(scene, camera);
  };

  root.querySelector('.globe-shell')?.classList.add('is-webgl');
  animate();
}
