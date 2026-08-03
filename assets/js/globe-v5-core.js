
(() => {
  'use strict';

  const stage = document.querySelector('[data-code-globe]');
  if (!stage) return;

  const globeCanvas = stage.querySelector('.digital-globe-webgl');
  const netCanvas = stage.querySelector('.digital-globe-network');
  const codeLayer = stage.querySelector('.digital-globe-code-layer');
  if (!globeCanvas || !netCanvas || !codeLayer) return;

  const gctx = globeCanvas.getContext('2d', { alpha: true });
  const nctx = netCanvas.getContext('2d', { alpha: true });
  if (!gctx || !nctx) return;

  const FULL = Math.PI * 2;
  const PERIOD = 26000; // one complete Earth rotation every 26s
  const FRAME_MS = 42;  // ~24 fps: enough for smooth mobile spin
  const startTime = performance.now();

  let cssSize = 1;
  let dpr = 1;
  let texture = null;
  let textureW = 0;
  let textureH = 0;
  let sphereMap = null;
  let lastDraw = 0;
  let visible = true;
  let pointerX = 0, pointerY = 0;
  let targetX = 0, targetY = 0;

  const nodes = [
    {lat:40.71,lon:-74.00},{lat:34.05,lon:-118.24},{lat:19.43,lon:-99.13},{lat:-23.55,lon:-46.63},
    {lat:51.51,lon:-0.13},{lat:48.86,lon:2.35},{lat:52.52,lon:13.40},{lat:25.20,lon:55.27},
    {lat:19.08,lon:72.88},{lat:28.70,lon:77.10},{lat:39.90,lon:116.40},{lat:31.23,lon:121.47},
    {lat:35.68,lon:139.69},{lat:37.57,lon:126.98},{lat:1.35,lon:103.82},{lat:10.82,lon:106.63},
    {lat:-6.21,lon:106.85},{lat:-33.87,lon:151.21},{lat:-37.81,lon:144.96},{lat:-33.93,lon:18.42}
  ];
  const links = [[0,4],[0,3],[0,1],[4,6],[4,8],[6,10],[8,14],[8,15],[10,11],[11,12],[12,13],[14,15],[15,16],[14,17],[3,19],[17,18],[1,12],[3,15],[5,9],[9,10]];

  // This is the critical local-preview fix:
  // request the GitHub Pages image in CORS mode BEFORE assigning src.
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.decoding = 'async';

  img.onload = () => {
    try {
      const oc = document.createElement('canvas');
      oc.width = img.naturalWidth;
      oc.height = img.naturalHeight;
      const ocx = oc.getContext('2d', { willReadFrequently: true });
      ocx.drawImage(img, 0, 0);
      const pixels = ocx.getImageData(0, 0, oc.width, oc.height);
      texture = pixels.data;
      textureW = oc.width;
      textureH = oc.height;
      stage.dataset.textureReady = 'true';
      stage.classList.add('globe-live');
      resize();
    } catch (err) {
      console.error('DNG globe texture CORS error', err);
      stage.dataset.textureReady = 'false';
    }
  };
  img.onerror = () => {
    stage.dataset.textureReady = 'false';
    console.error('DNG globe texture failed to load', stage.dataset.texture);
  };
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
    const cx = size / 2, cy = size / 2;
    const lx = -0.34, ly = 0.62, lz = 0.72;
    const ln = Math.hypot(lx, ly, lz);
    let i = 0;

    for (let py = 0; py < size; py++) {
      const y = -(py + .5 - cy) / r;
      for (let px = 0; px < size; px++, i++) {
        const x = (px + .5 - cx) / r;
        const rr = x*x + y*y;
        if (rr > 1) continue;
        const z = Math.sqrt(1 - rr);
        valid[i] = 1;
        vx[i] = x; vy[i] = y; vz[i] = z;
        const diff = Math.max(0, (x*lx + y*ly + z*lz) / ln);
        const edge = Math.pow(1 - z, 2.1);
        shade[i] = 1.03 + diff*.11 + edge*.025;
        rim[i] = edge;
      }
    }
    return {size, valid, vx, vy, vz, shade, rim, image:new ImageData(size,size)};
  }

  function tone(r,g,b,sh,edge) {
    const gr = Math.pow(r/255,.73)*255;
    const gg = Math.pow(g/255,.69)*255;
    const gb = Math.pow(b/255,.66)*255;
    const lum = r*.2126 + g*.7152 + b*.0722;
    const dark = Math.max(0,1-lum/120);
    return [
      Math.min(255, gr*sh + dark*12 + edge*10),
      Math.min(255, gg*sh + dark*24 + edge*27),
      Math.min(255, gb*sh + dark*40 + edge*50)
    ];
  }

  function resize() {
    const rect = globeCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    cssSize = Math.max(1, Math.min(rect.width, rect.height));
    dpr = Math.min(devicePixelRatio || 1, 1.65);
    const w = Math.max(1, Math.round(rect.width*dpr));
    const h = Math.max(1, Math.round(rect.height*dpr));
    if (globeCanvas.width !== w || globeCanvas.height !== h) {
      globeCanvas.width = w; globeCanvas.height = h;
    }
    if (netCanvas.width !== w || netCanvas.height !== h) {
      netCanvas.width = w; netCanvas.height = h;
    }
    nctx.setTransform(dpr,0,0,dpr,0,0);

    const mobile = innerWidth <= 680;
    const size = Math.max(220, Math.min(mobile ? 300 : 390, Math.round(cssSize*dpr*.78)));
    if (!sphereMap || sphereMap.size !== size) sphereMap = buildSphereMap(size);
  }

  function inverseRotate(x,y,z,rotation) {
    const c = Math.cos(-rotation), s = Math.sin(-rotation);
    return [c*x + s*z, y, -s*x + c*z];
  }

  function drawSphere(rotation) {
    if (!texture || !sphereMap) return;
    const {size,valid,vx,vy,vz,shade,rim,image} = sphereMap;
    const out = image.data;

    for (let i=0,o=0;i<valid.length;i++,o+=4) {
      if (!valid[i]) {
        out[o]=out[o+1]=out[o+2]=out[o+3]=0;
        continue;
      }
      const p = inverseRotate(vx[i],vy[i],vz[i],rotation);
      const lon = Math.atan2(p[2],p[0]);
      const lat = Math.asin(Math.max(-1,Math.min(1,p[1])));
      let u = lon/FULL + .5;
      u -= Math.floor(u);
      let v = .5 - lat/Math.PI;
      v = Math.max(0,Math.min(.9999,v));
      const sx = Math.min(textureW-1,Math.floor(u*textureW));
      const sy = Math.min(textureH-1,Math.floor(v*textureH));
      const si = (sy*textureW+sx)*4;
      const rgb = tone(texture[si],texture[si+1],texture[si+2],shade[i],rim[i]);
      out[o]=rgb[0];out[o+1]=rgb[1];out[o+2]=rgb[2];out[o+3]=255;
    }

    const off = drawSphere.off || (drawSphere.off=document.createElement('canvas'));
    if (off.width !== size || off.height !== size) { off.width=size; off.height=size; }
    off.getContext('2d').putImageData(image,0,0);

    gctx.clearRect(0,0,globeCanvas.width,globeCanvas.height);
    gctx.imageSmoothingEnabled = true;
    gctx.imageSmoothingQuality = 'high';
    gctx.drawImage(off,0,0,globeCanvas.width,globeCanvas.height);

    const cx=globeCanvas.width*.5, cy=globeCanvas.height*.5, rr=globeCanvas.width*.49;
    gctx.save();
    gctx.globalCompositeOperation='screen';
    const at=gctx.createRadialGradient(cx,cy,rr*.74,cx,cy,rr);
    at.addColorStop(0,'rgba(0,90,255,0)');
    at.addColorStop(.82,'rgba(65,198,235,.035)');
    at.addColorStop(.94,'rgba(100,230,219,.16)');
    at.addColorStop(1,'rgba(226,255,249,.48)');
    gctx.fillStyle=at;gctx.beginPath();gctx.arc(cx,cy,rr,0,FULL);gctx.fill();

    const light=gctx.createRadialGradient(globeCanvas.width*.69,globeCanvas.height*.21,0,globeCanvas.width*.69,globeCanvas.height*.21,globeCanvas.width*.38);
    light.addColorStop(0,'rgba(250,255,255,.32)');
    light.addColorStop(.46,'rgba(119,237,220,.08)');
    light.addColorStop(1,'rgba(0,0,0,0)');
    gctx.fillStyle=light;gctx.beginPath();gctx.arc(cx,cy,rr,0,FULL);gctx.fill();
    gctx.restore();
  }

  function vec(lat,lon,r=1.025) {
    const la=lat*Math.PI/180, lo=lon*Math.PI/180;
    return [r*Math.cos(la)*Math.cos(lo), r*Math.sin(la), r*Math.cos(la)*Math.sin(lo)];
  }

  function rotateVec(v,rotation) {
    const c=Math.cos(rotation),s=Math.sin(rotation);
    return [c*v[0]+s*v[2],v[1],-s*v[0]+c*v[2]];
  }

  function project(v,rotation) {
    const [x,y,z]=rotateVec(v,rotation);
    const camera=3.2;
    const scale=(cssSize*.43)*camera/(camera-z);
    return {x:cssSize/2+x*scale,y:cssSize/2-y*scale,z,visible:z>.02};
  }

  function slerp(a,b,t) {
    let dot=a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
    dot=Math.max(-1,Math.min(1,dot));
    const omega=Math.acos(dot);
    if (omega<1e-5) return a.slice();
    const so=Math.sin(omega), s1=Math.sin((1-t)*omega)/so, s2=Math.sin(t*omega)/so;
    const h=1+Math.sin(Math.PI*t)*.08;
    return [(a[0]*s1+b[0]*s2)*h,(a[1]*s1+b[1]*s2)*h,(a[2]*s1+b[2]*s2)*h];
  }

  function drawNetwork(now,rotation) {
    nctx.clearRect(0,0,cssSize,cssSize);
    nctx.save();
    nctx.beginPath();nctx.arc(cssSize/2,cssSize/2,cssSize*.43,0,FULL);nctx.clip();
    nctx.globalCompositeOperation='screen';

    for (const [ia,ib] of links) {
      const a=vec(nodes[ia].lat,nodes[ia].lon), b=vec(nodes[ib].lat,nodes[ib].lon);
      let drawing=false;
      nctx.beginPath();
      for(let i=0;i<=28;i++){
        const p=project(slerp(a,b,i/28),rotation);
        if(!p.visible){drawing=false;continue}
        if(!drawing){nctx.moveTo(p.x,p.y);drawing=true}else nctx.lineTo(p.x,p.y);
      }
      nctx.strokeStyle='rgba(184,247,236,.30)';
      nctx.lineWidth=Math.max(.7,cssSize/820);
      nctx.stroke();
    }

    nodes.forEach((n,i)=>{
      const p=project(vec(n.lat,n.lon,1.035),rotation);
      if(!p.visible)return;
      const pulse=1+Math.sin(now*.0024+i*.77)*.2;
      const r=Math.max(1.45,cssSize/250)*pulse;
      const grd=nctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*5);
      grd.addColorStop(0,'rgba(255,255,255,1)');
      grd.addColorStop(.2,'rgba(110,255,222,.95)');
      grd.addColorStop(.55,'rgba(23,211,170,.48)');
      grd.addColorStop(1,'rgba(23,211,170,0)');
      nctx.fillStyle=grd;nctx.beginPath();nctx.arc(p.x,p.y,r*5,0,FULL);nctx.fill();
    });
    nctx.restore();
  }

  stage.addEventListener('pointermove',e=>{
    const rect=stage.getBoundingClientRect();
    targetX=Math.max(-1,Math.min(1,((e.clientX-rect.left)/rect.width)*2-1));
    targetY=Math.max(-1,Math.min(1,((e.clientY-rect.top)/rect.height)*2-1));
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{targetX=targetY=0},{passive:true});

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden || !texture) return;
    if (now-lastDraw < FRAME_MS) return;
    lastDraw=now;

    resize();
    const rotation=((now-startTime)%PERIOD)/PERIOD*FULL;

    // Pointer affects only the AI layer, never the Earth axis or spin.
    pointerX+=(targetX-pointerX)*.08;
    pointerY+=(targetY-pointerY)*.08;
    codeLayer.style.transform=`translate3d(${(pointerX*2.8).toFixed(2)}px,${(pointerY*2.2).toFixed(2)}px,0)`;

    drawSphere(rotation);
    drawNetwork(now,rotation);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting)},{threshold:.01}).observe(stage);
  }
  addEventListener('resize',resize,{passive:true});
  requestAnimationFrame(frame);

  window.__globePreview={
    getRotation:()=>((performance.now()-startTime)%PERIOD)/PERIOD*FULL
  };
})();
