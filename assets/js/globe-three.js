import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.180.0/three.module.min.js';

const stages = document.querySelectorAll('[data-globe-stage]');

for (const stage of stages) {
  const canvas = stage.querySelector('canvas[data-globe-canvas]');
  const fallback = stage.querySelector('.globe-fallback');
  if (!canvas) continue;

  try {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 5.1);

    const root = new THREE.Group();
    root.rotation.x = -0.12;
    scene.add(root);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    const earthMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    earthMap.colorSpace = THREE.SRGBColorSpace;
    const nightMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_lights_2048.png');
    nightMap.colorSpace = THREE.SRGBColorSpace;

    const globeGeo = new THREE.SphereGeometry(1.46, 96, 96);
    const globeMat = new THREE.MeshStandardMaterial({
      map: earthMap,
      emissiveMap: nightMap,
      emissive: new THREE.Color(0x82ffbd),
      emissiveIntensity: 0.48,
      roughness: 0.72,
      metalness: 0.03,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    root.add(globe);

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(1.485, 42, 28),
      new THREE.MeshBasicMaterial({ color: 0x39e89a, wireframe: true, transparent: true, opacity: 0.11, depthWrite: false })
    );
    root.add(wire);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.57, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: { glowColor: { value: new THREE.Color(0x2cff9a) } },
        vertexShader: `varying vec3 vNormal; void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `uniform vec3 glowColor; varying vec3 vNormal; void main(){float i=pow(0.72-dot(vNormal,vec3(0.0,0.0,1.0)),2.3);gl_FragColor=vec4(glowColor,i*0.52);}`,
      })
    );
    root.add(atmosphere);

    const nodes = new THREE.Group();
    root.add(nodes);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x5affad });
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xbaffdc, transparent: true, opacity: 0.24, blending: THREE.AdditiveBlending, depthWrite: false });
    const latLon = [[12,15],[28,52],[-4,88],[40,115],[-28,135],[50,-52],[2,-82],[-34,-20],[18,168]];
    const toVec = (lat, lon, radius=1.51) => {
      const phi = THREE.MathUtils.degToRad(90-lat);
      const theta = THREE.MathUtils.degToRad(lon+180);
      return new THREE.Vector3(-radius*Math.sin(phi)*Math.cos(theta), radius*Math.cos(phi), radius*Math.sin(phi)*Math.sin(theta));
    };
    const nodePositions = latLon.map(([lat,lon],i)=>{
      const p=toVec(lat,lon);
      const dot=new THREE.Mesh(new THREE.SphereGeometry(i%3===0?0.035:0.026,16,16),nodeMat);
      dot.position.copy(p); nodes.add(dot);
      const pulse=new THREE.Mesh(new THREE.SphereGeometry(0.07,16,16),pulseMat.clone()); pulse.position.copy(p); pulse.userData.phase=i*.7; nodes.add(pulse);
      return p;
    });

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x54f3a3, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending });
    const links = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,0],[1,6],[3,8]];
    for(const [a,b] of links){
      const p1=nodePositions[a], p2=nodePositions[b];
      const mid=p1.clone().add(p2).multiplyScalar(.5).normalize().multiplyScalar(1.82);
      const curve=new THREE.QuadraticBezierCurve3(p1,mid,p2);
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(36)),lineMaterial.clone());
      nodes.add(line);
    }

    const ambient = new THREE.AmbientLight(0xffffff, 0.78);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-3,2,4); scene.add(key);
    const rim = new THREE.PointLight(0x29ff9b, 22, 9); rim.position.set(2.4,-1.2,3); scene.add(rim);
    const cool = new THREE.PointLight(0x6fd9ff, 15, 8); cool.position.set(-3.2,1.4,1); scene.add(cool);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 450;
    const starPos = new Float32Array(starCount*3);
    for(let i=0;i<starCount;i++){
      const r=3.5+Math.random()*2.8, a=Math.random()*Math.PI*2, z=(Math.random()-.5)*4.8;
      starPos[i*3]=Math.cos(a)*r; starPos[i*3+1]=Math.sin(a)*r; starPos[i*3+2]=z;
    }
    starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));
    const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x61e7ae,size:.017,transparent:true,opacity:.42,depthWrite:false}));
    scene.add(stars);

    let targetX=0,targetY=0,currentX=0,currentY=0;
    stage.addEventListener('pointermove',e=>{
      const r=stage.getBoundingClientRect();
      targetY=((e.clientX-r.left)/r.width-.5)*0.42;
      targetX=((e.clientY-r.top)/r.height-.5)*-0.28;
    });
    stage.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});

    const resize=()=>{
      const rect=stage.getBoundingClientRect();
      const w=Math.max(280,rect.width), h=Math.max(300,rect.height);
      renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
    };
    const ro=new ResizeObserver(resize); ro.observe(stage); resize();

    let visible=true;
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{rootMargin:'120px'}); observer.observe(stage);
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock=new THREE.Clock();
    const loop=()=>{
      requestAnimationFrame(loop);
      if(!visible) return;
      const t=clock.getElapsedTime();
      if(!reduced) root.rotation.y += 0.00475; // ~22s per revolution at 60fps
      currentX += (targetX-currentX)*0.055;
      currentY += (targetY-currentY)*0.055;
      root.rotation.x = -0.12 + currentX;
      root.rotation.z = currentY*0.18;
      camera.position.x += ((currentY*0.46)-camera.position.x)*0.045;
      camera.position.y += ((-currentX*0.32)-camera.position.y)*0.045;
      camera.lookAt(0,0,0);
      nodes.children.forEach(obj=>{if(obj.userData.phase!==undefined){const s=1+Math.sin(t*2.2+obj.userData.phase)*.35;obj.scale.setScalar(s);obj.material.opacity=.14+(s-1)*.18;}});
      stars.rotation.z=t*.006;
      renderer.render(scene,camera);
    };
    loop();
    canvas.classList.add('is-ready');
    fallback?.classList.add('is-hidden');
  } catch (error) {
    console.warn('3D globe fallback enabled', error);
  }
}
