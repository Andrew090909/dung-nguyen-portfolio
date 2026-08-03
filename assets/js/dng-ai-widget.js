(() => {
  'use strict';
  if (document.getElementById('dng-ai-global-trigger') || document.getElementById('aiTrigger')) return;

  const base = String(window.DNG_AI_WORKER_BASE || document.documentElement.dataset.dngAiEndpoint || '').trim().replace(/\/$/,'');
  const endpoint = base ? base + '/chat' : '';

  const trigger = document.createElement('button');
  trigger.id = 'dng-ai-global-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-label','Mở DNG AI');
  trigger.innerHTML = '<i aria-hidden="true"></i><span>DNG AI</span>';

  const panel = document.createElement('section');
  panel.id = 'dng-ai-global-panel';
  panel.setAttribute('aria-label','DNG AI');
  panel.innerHTML = `
    <div class="dng-ai-global-head"><strong>DNG AI</strong><button type="button" aria-label="Đóng">×</button></div>
    <div class="dng-ai-global-body"></div>
    <form class="dng-ai-global-form"><input aria-label="Câu hỏi" autocomplete="off" placeholder="Bạn cần tìm gì?"><button>Gửi</button></form>`;

  document.body.append(trigger, panel);

  const body = panel.querySelector('.dng-ai-global-body');
  const input = panel.querySelector('input');
  const close = panel.querySelector('.dng-ai-global-head button');
  const form = panel.querySelector('form');
  let hiddenFixed = [];

  function fixedContactElements(){
    const anchors = [...document.querySelectorAll('a[href^="tel:"],a[href*="zalo.me"]')];
    return anchors.filter(a => {
      const cs = getComputedStyle(a);
      if (cs.position === 'fixed') return true;
      let p=a.parentElement, n=0;
      while(p && n++<4){
        const ps=getComputedStyle(p);
        if(ps.position==='fixed') return true;
        p=p.parentElement;
      }
      return false;
    });
  }
  function hideContacts(){
    hiddenFixed = fixedContactElements().map(el => ({el,visibility:el.style.visibility}));
    hiddenFixed.forEach(x => x.el.style.visibility='hidden');
  }
  function restoreContacts(){
    hiddenFixed.forEach(x => x.el.style.visibility=x.visibility);
    hiddenFixed=[];
  }
  function open(prefill=''){
    panel.classList.add('open');
    hideContacts();
    if(prefill) input.value=prefill;
    setTimeout(()=>input.focus(),60);
    updateViewport();
  }
  function shut(){
    panel.classList.remove('open');
    restoreContacts();
  }
  function bubble(text,user=false){
    const d=document.createElement('div');
    d.className='dng-ai-bubble'+(user?' user':'');
    d.textContent=text;
    body.appendChild(d);
    body.scrollTop=body.scrollHeight;
  }
  async function ask(q){
    bubble(q,true);
    if(!endpoint){
      bubble('AI chưa được kết nối.');
      return;
    }
    try{
      const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:q,mode:'auto',url:location.href,title:document.title})});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const j=await r.json();
      bubble(j.answer || 'Không có phản hồi.');
      if(Array.isArray(j.sources) && j.sources.length){
        const wrap=document.createElement('div');
        wrap.className='dng-ai-sources';
        j.sources.slice(0,5).forEach(src=>{
          const a=document.createElement('a');
          a.href=src.url; a.target='_blank'; a.rel='noopener';
          a.textContent=(src.id?src.id+' · ':'')+(src.title||'Nguồn');
          wrap.appendChild(a);
        });
        body.appendChild(wrap);
        body.scrollTop=body.scrollHeight;
      }
    }catch(e){
      bubble('Không thể kết nối DNG AI lúc này.');
    }
  }
  function updateViewport(){
    if(!window.visualViewport) return;
    const vv=visualViewport;
    const kb=Math.max(0,innerHeight-vv.height-vv.offsetTop);
    panel.style.bottom=(kb+12)+'px';
    panel.style.maxHeight=Math.max(260,vv.height-24)+'px';
  }

  trigger.addEventListener('click',()=>open());
  close.addEventListener('click',shut);
  form.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim();if(!q)return;input.value='';ask(q)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')shut()});
  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-ask-dng-ai]');
    if(a) open(a.getAttribute('data-ask-dng-ai')||'');
  });
  if(window.visualViewport){
    visualViewport.addEventListener('resize',updateViewport);
    visualViewport.addEventListener('scroll',updateViewport);
  }
})();
