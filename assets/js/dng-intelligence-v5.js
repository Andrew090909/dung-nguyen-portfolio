
document.addEventListener('DOMContentLoaded',()=>{
  const body=document.body;
  const skip=document.getElementById('skip');
  let timer=setTimeout(()=>{body.classList.remove('booting');body.classList.add('online')},4750);
  skip?.addEventListener('click',()=>{clearTimeout(timer);body.classList.remove('booting');body.classList.add('online')});

  const ui=window.DNG_UI||{};
  const phaseNames=Object.assign({origin:'ORIGIN',identity:'IDENTITY CORE',neural:'NEURAL EXPANSION',agent:'AI AGENT NETWORK',project:'CAPABILITY UNIVERSE',twin:'DIGITAL TWIN'}, ui.phaseNames||{});
  const menuToggle=document.getElementById('menuToggle'),mobileMenu=document.getElementById('mobileMenu');
  menuToggle?.addEventListener('click',()=>mobileMenu.classList.toggle('open'));
  document.addEventListener('click',e=>{
    if(!mobileMenu?.classList.contains('open'))return;
    if(!mobileMenu.contains(e.target)&&e.target!==menuToggle&&!menuToggle.contains(e.target))mobileMenu.classList.remove('open');
  });

  const globe=document.querySelector('[data-code-globe]');
  let ready=false;
  const activate=()=>{if(ready||!globe||globe.dataset.textureReady!=='true')return;ready=true;setTimeout(()=>globe.classList.add('globe-live'),350)};
  activate();
  if(globe)new MutationObserver(activate).observe(globe,{attributes:true,attributeFilter:['data-texture-ready']});

  const story=document.getElementById('story'),globeSystem=document.getElementById('globeSystem'),
    identity=document.getElementById('identityCopy'),keywords=[...document.querySelectorAll('.keyword')],
    neural=document.getElementById('neural'),nodes=[...document.querySelectorAll('.node')],paths=[...document.querySelectorAll('.neural path')],
    agent=document.getElementById('agentStage'),projects=document.getElementById('projectStage'),twin=document.getElementById('twinStage'),
    bar=document.getElementById('progressBar'),phase=document.getElementById('phase'),hint=document.getElementById('scrollHint');


  /* V6: separate physical globe motion from readable labels/keywords. */
  let globePhysical=null;
  if(globeSystem){
    const aura=globeSystem.querySelector('.globe-aura');
    const stage=globeSystem.querySelector('.globe-stage');
    if(aura && stage){
      globePhysical=document.createElement('div');
      globePhysical.className='globe-physical';
      globeSystem.insertBefore(globePhysical,aura);
      globePhysical.appendChild(aura);
      globePhysical.appendChild(stage);

      const scan=document.createElement('div');
      scan.className='ai-sphere-scan';
      globePhysical.appendChild(scan);
    }

    const orbitField=document.createElement('div');
    orbitField.className='ai-orbit-field';
    orbitField.innerHTML='<div class="ai-orbit-ring ai-r1"></div><div class="ai-orbit-ring ai-r2"></div><div class="ai-orbit-ring ai-r3"></div>';
    globeSystem.appendChild(orbitField);

    const pulse=document.createElement('div');
    pulse.className='ai-core-pulse';
    globeSystem.appendChild(pulse);

    const cloud=document.createElement('div');
    cloud.className='ai-data-cloud';
    for(let i=0;i<24;i++){
      const m=document.createElement('i');
      m.className='ai-data-mote';
      m.style.setProperty('--a',(i*15 + (i%3)*7)+'deg');
      m.style.setProperty('--r',(43 + (i%7)*3.1)+'%');
      m.style.setProperty('--s',(0.65 + (i%5)*0.16).toFixed(2));
      m.style.setProperty('--dur',(7.5 + (i%8)*0.75)+'s');
      m.style.setProperty('--delay',(-i*0.37)+'s');
      cloud.appendChild(m);
    }
    globeSystem.appendChild(cloud);

    const thought=document.createElement('div');
    thought.className='ai-thought-field';
    const thoughts=['SIGNAL','MODEL','MEMORY','PATTERN','INTENT','SYNTHESIS','FORECAST','LEARNING'];
    thoughts.forEach((text,i)=>{
      const t=document.createElement('span');
      t.className='ai-thought';
      t.textContent=text;
      const a=(i/thoughts.length)*Math.PI*2;
      t.style.left=(50 + Math.cos(a)*43)+'%';
      t.style.top=(50 + Math.sin(a)*41)+'%';
      t.style.setProperty('--tdur',(2.6+(i%4)*.55)+'s');
      t.style.setProperty('--tdelay',(-i*.31)+'s');
      thought.appendChild(t);
    });
    globeSystem.appendChild(thought);

    const earthAxis=document.createElement('div');
    earthAxis.className='earth-axis-field';
    globeSystem.appendChild(earthAxis);
  }

  let targetMouseX=0,targetMouseY=0,mouseX=0,mouseY=0;
  let lastP=0,lastFrame=performance.now(),scrollEnergy=0;
  const mobileMotion=()=>window.matchMedia('(max-width:680px)').matches;
  window.addEventListener('pointermove',e=>{
    targetMouseX=(e.clientX/innerWidth-.5)*2;
    targetMouseY=(e.clientY/innerHeight-.5)*2;
  },{passive:true});
  window.addEventListener('pointerleave',()=>{targetMouseX=0;targetMouseY=0},{passive:true});
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n)),map=(p,a,b,c,d)=>c+(d-c)*clamp((p-a)/(b-a)),fade=(p,a,b,c,d)=>map(p,a,b,0,1)*(1-map(p,c,d,0,1));

  function render(now=performance.now()){
    if(!story)return requestAnimationFrame(render);
    const r=story.getBoundingClientRect(),p=clamp(-r.top/(story.offsetHeight-innerHeight));
    if(bar)bar.style.height=p*100+'%';
    let gx=0,gy=0,gs=1,go=1,rot=0;
    const mobileUI=window.matchMedia('(max-width:680px)').matches;
    if(p<.16){gx=map(p,0,.16,0,16);gs=map(p,0,.16,1,mobileUI ? .90 : .92)}
    else if(p<.42){gx=map(p,.16,.42,16,0);gs=map(p,.16,.42,mobileUI ? .90 : .92,mobileUI ? .66 : .72);rot=map(p,.16,.42,0,-5);gy=mobileUI ? 3 : 0;go=mobileUI ? .90 : 1}
    else if(p<.60){gx=map(p,.42,.60,0,-20);gs=map(p,.42,.60,mobileUI ? .66 : .72,mobileUI ? .47 : .52);gy=mobileUI ? 6 : 2;go=mobileUI ? .82 : 1}
    else if(p<.74){gx=map(p,.60,.74,-20,0);gs=map(p,.60,.74,mobileUI ? .47 : .52,3.15);go=1-map(p,mobileUI ? .675 : .68,mobileUI ? .735 : .74,0,1)}
    else{gs=.2;go=0}
    /* Main path moves the whole intelligence system. The sphere itself rolls separately. */
    if(!body.classList.contains('booting')&&globeSystem){
      globeSystem.style.opacity=go;
      globeSystem.style.transform=`translate(calc(-50% + ${gx}vw),calc(-50% + ${gy}vh)) scale(${gs})`;

      const dt=Math.min(34,Math.max(8,now-lastFrame));
      lastFrame=now;
      const dp=p-lastP;
      lastP=p;

      /* Real-Earth behavior:
         - the V5 renderer rotates longitude continuously;
         - the globe canvas is permanently tilted -23.4deg, so the visual
           rotation axis runs SOUTHWEST -> NORTHEAST;
         - scrolling moves the planet through the composition but does not
           rotate/roll the planet like a wheel. */
      scrollEnergy += (Math.abs(dp)*420-scrollEnergy)*.16;
      scrollEnergy *= .93;

      mouseX += (targetMouseX-mouseX)*.075;
      mouseY += (targetMouseY-mouseY)*.075;

      if(globePhysical){
        globePhysical.style.transform='rotateZ(-23.4deg)';
      }

      /* Pointer remains AI parallax only; it never changes Earth's axis. */
      globeSystem.style.setProperty('--mx',(mouseX*.72).toFixed(3));
      globeSystem.style.setProperty('--my',(mouseY*.72).toFixed(3));
      globeSystem.classList.toggle('is-rolling',scrollEnergy>.10);
      globeSystem.classList.toggle('ai-neural',p>=.16 && p<.43);
      globeSystem.classList.toggle('ai-agent',p>=.405 && p<.615);
    }
    const io=fade(p,.015,.07,.14,.19);
    if(identity){identity.style.opacity=io;identity.style.transform=`translate(${(-44+44*map(p,.015,.07,0,1))}px,-50%)`}
    keywords.forEach((k,i)=>{const q=map(p,.035+i*.006,.09+i*.006,0,1)*(1-map(p,.145,.19,0,1));k.style.opacity=q;k.style.transform=`translateY(${(1-q)*14}px) scale(${.96+.04*q})`});
    if(neural)neural.style.opacity=mobileUI ? fade(p,.165,.215,.36,.405) : fade(p,.16,.205,.38,.43);
    nodes.forEach(n=>{const s=parseFloat(n.dataset.start),q=map(p,s,s+.055,0,1)*(1-map(p,.385,.43,0,1)),center=n.classList.contains('n5')||n.classList.contains('n6');n.style.opacity=q;n.style.transform=center?`translate(-50%,${(1-q)*20}px) scale(${.96+.04*q})`:`translateY(${(1-q)*20}px) scale(${.96+.04*q})`});
    const ao=mobileUI ? fade(p,.435,.49,.56,.60) : fade(p,.405,.46,.57,.615);if(agent){agent.style.opacity=ao;agent.style.transform=`translateY(${(1-map(p,mobileUI ? .435 : .405,mobileUI ? .49 : .46,0,1))*22}px)`;agent.style.pointerEvents=ao>.55?'auto':'none'}
    const po=mobileUI ? fade(p,.635,.69,.80,.845) : fade(p,.60,.665,.80,.845);if(projects){projects.style.opacity=po;projects.style.transform=`scale(${.97+.03*map(p,mobileUI ? .635 : .60,mobileUI ? .69 : .665,0,1)})`;projects.style.pointerEvents=po>.55?'auto':'none'}
    const to=map(p,.83,.91,0,1);if(twin){twin.style.opacity=to;twin.style.transform=`translateY(${(1-to)*20}px)`;twin.style.pointerEvents=to>.55?'auto':'none'}
    if(hint)hint.style.opacity=1-map(p,.02,.10,0,1);
    if(phase)phase.innerHTML=p<.02?`<b>00</b> / ${phaseNames.origin}`:p<.16?`<b>01</b> / ${phaseNames.identity}`:p<.42?`<b>02</b> / ${phaseNames.neural}`:p<.61?`<b>03</b> / ${phaseNames.agent}`:p<.84?`<b>04</b> / ${phaseNames.project}`:`<b>05</b> / ${phaseNames.twin}`;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  nodes.forEach(n=>{
    n.addEventListener('mouseenter',()=>{const k=n.dataset.key;nodes.forEach(o=>o.classList.toggle('active',o===n||paths.some(p=>(p.dataset.pair||'').includes(k)&&(p.dataset.pair||'').includes(o.dataset.key))));paths.forEach(p=>{const on=(p.dataset.pair||'').includes(k);p.style.stroke=on?'rgba(118,255,213,.92)':'rgba(130,248,238,.08)';p.style.strokeWidth=on?'2':'1.1'})});
    n.addEventListener('mouseleave',()=>{nodes.forEach(o=>o.classList.remove('active'));paths.forEach(p=>{p.style.stroke='rgba(130,248,238,.32)';p.style.strokeWidth='1.1'})});
  });


  /* V6: project planets react as spatial objects instead of flat circles. */
  document.querySelectorAll('.planet').forEach(pl=>{
    pl.addEventListener('pointermove',e=>{
      const r=pl.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
      pl.style.rotate=`${(-py*5).toFixed(1)}deg`;
      pl.style.translate=`${(px*3).toFixed(1)}px ${(py*3).toFixed(1)}px`;
    });
    pl.addEventListener('pointerleave',()=>{pl.style.rotate='';pl.style.translate=''});
  });

  const projectData=window.DNG_PROJECTS||{};
  const modal=document.getElementById('modal');
  document.querySelectorAll('.planet').forEach(b=>b.addEventListener('click',()=>{
    const d=projectData[b.dataset.project];if(!d)return;
    document.getElementById('modalTitle').textContent=d.title;
    document.getElementById('modalType').textContent=d.type;
    document.getElementById('modalProblem').textContent=d.problem;
    document.getElementById('modalApproach').textContent=d.approach;
    document.getElementById('modalSystem').textContent=d.system;
    document.getElementById('modalResult').textContent=d.result;
    modal.classList.add('open');
  }));
  const closeModal=()=>modal?.classList.remove('open');
  document.getElementById('modalClose')?.addEventListener('click',closeModal);
  modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});

  const log=document.getElementById('chatLog'),input=document.getElementById('chatInput');
  function chat(text){
    if(!text?.trim())return;
    const u=document.createElement('div');u.className='bubble user';u.textContent=text;log.appendChild(u);input.value='';
    setTimeout(()=>{const a=document.createElement('div');a.className='bubble ai';a.textContent=window.DNG_CHAT_REPLY||'';log.appendChild(a);log.scrollTop=log.scrollHeight},320);
  }
  document.getElementById('sendChat')?.addEventListener('click',()=>chat(input.value));
  input?.addEventListener('keydown',e=>{if(e.key==='Enter')chat(input.value)});
  document.querySelectorAll('.suggestions button').forEach(b=>b.addEventListener('click',()=>chat(b.textContent)));
});

/* data particles -> compressed globe -> explosion */
(()=>{
 const c=document.getElementById('particles');if(!c)return;
 const x=c.getContext('2d');let w,h,dpr,stars=[],matter=[],blast=[],start=performance.now();
 function resize(){
  dpr=Math.min(2,devicePixelRatio||1);w=innerWidth;h=innerHeight;c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';x.setTransform(dpr,0,0,dpr,0,0);
  stars=Array.from({length:Math.floor(w*h/9000)},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.1+.15,a:Math.random()*.55+.15,s:Math.random()*.002+.0006}));
  matter=Array.from({length:220},()=>{const side=Math.floor(Math.random()*4),m=35;let px,py;if(side===0){px=Math.random()*w;py=-m}if(side===1){px=w+m;py=Math.random()*h}if(side===2){px=Math.random()*w;py=h+m}if(side===3){px=-m;py=Math.random()*h}return{x:px,y:py,ox:px,oy:py,r:Math.random()*1.8+.35,a:Math.random()*.55+.35,delay:Math.random()*.32}});
  blast=Array.from({length:260},()=>{const a=Math.random()*Math.PI*2,sp=Math.random()*6.5+1.4;return{x:w/2,y:h/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:Math.random()*2+.4,a:1}});
 }
 addEventListener('resize',resize);resize();
 function draw(t){
  x.clearRect(0,0,w,h);
  stars.forEach(s=>{const tw=.58+.42*Math.sin(t*s.s+s.x*.02);x.fillStyle=`rgba(210,255,244,${s.a*tw})`;x.beginPath();x.arc(s.x,s.y,s.r,0,Math.PI*2);x.fill()});
  const e=(t-start)/1000;
  if(e<1.65){const q=Math.min(1,e/1.55);matter.forEach(p=>{const qq=Math.max(0,Math.min(1,(q-p.delay)/(1-p.delay))),ease=1-Math.pow(1-qq,3),px=p.ox+(w/2-p.ox)*ease,py=p.oy+(h/2-p.oy)*ease;x.fillStyle=`rgba(151,255,225,${p.a*(1-qq*.35)})`;x.beginPath();x.arc(px,py,p.r,0,Math.PI*2);x.fill()})}
  if(e>1.48&&e<3.5){const q=Math.min(1,(e-1.48)/.58);blast.forEach(p=>{p.x+=p.vx*(1+q*3.1);p.y+=p.vy*(1+q*3.1);p.a*=.982;x.fillStyle=`rgba(178,255,234,${p.a})`;x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill()})}
  requestAnimationFrame(draw)
 }requestAnimationFrame(draw)
})();
