(()=>{
  'use strict';

  if(!/(^|\/)insights(?:\/|\.html)?$/.test(location.pathname.toLowerCase())) return;

  const lang=(document.documentElement.lang||'vi').toLowerCase();
  const copy=lang.startsWith('zh')?{
    updated:'更新',loading:'正在加载最新资讯…',error:'暂时无法加载最新资讯，正在显示备用内容。',open:'打开原文 ↗'
  }:lang.startsWith('en')?{
    updated:'Updated',loading:'Loading the latest news…',error:'Latest feed is temporarily unavailable. Showing fallback content.',open:'Open source ↗'
  }:{
    updated:'Cập nhật',loading:'Đang tải tin mới nhất…',error:'Tạm thời chưa tải được bản tin mới — đang hiển thị nội dung dự phòng.',open:'Bài gốc ↗'
  };

  const fallback='/assets/images/social/og-insights-2026.png';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl=v=>{
    try{
      const u=new URL(String(v||''),location.origin);
      return /^https?:$/.test(u.protocol)?u.href:'#';
    }catch(_){return '#'}
  };

  function storyCard(it){
    const image=safeUrl(it?.image||fallback);
    const meta=[it?.source||'',it?.time||''].filter(Boolean).join(' · ');
    return `<article class="story reveal in" data-title="${esc(it?.title||'')}" data-summary="${esc(it?.summary||'')}" data-url="${esc(safeUrl(it?.url))}">
      <img alt="" loading="lazy" decoding="async" src="${esc(image)}" onerror="this.onerror=null;this.src='${fallback}'">
      <div class="story-copy">
        <div class="story-meta">${esc(meta)}</div>
        <h3>${esc(it?.title||'')}</h3>
        <p>${esc(it?.summary||'')}</p>
      </div>
    </article>`;
  }

  function mediaCard(it){
    return `<article class="media-card">
      <div class="src">${esc(it?.source||'')}</div>
      <h3>${esc(it?.title||'')}</h3>
      <a href="${esc(safeUrl(it?.url))}" rel="noopener noreferrer" target="_blank">${esc(copy.open)}</a>
    </article>`;
  }

  function setGrid(el,items,renderer=storyCard){
    if(!el||!Array.isArray(items)||!items.length) return false;
    el.innerHTML=items.map(renderer).join('');
    return true;
  }

  const domestic=document.getElementById('domesticGrid');
  const statusHost=domestic?.closest('.container')||document.querySelector('main .container');
  let status=document.getElementById('dngNewsFreshness');
  if(statusHost&&!status){
    status=document.createElement('div');
    status.id='dngNewsFreshness';
    status.setAttribute('aria-live','polite');
    const row=statusHost.querySelector('.section-title-row');
    if(row) row.insertAdjacentElement('afterend',status); else statusHost.prepend(status);
  }

  const style=document.createElement('style');
  style.textContent='#dngNewsFreshness{margin:-6px 0 18px;color:#91a59e;font-size:11px;letter-spacing:.05em}#dngNewsFreshness.is-live{color:#8ff5d2}#dngNewsFreshness.is-error{color:#f3c577}';
  document.head.appendChild(style);
  if(status) status.textContent=copy.loading;

  function openReader(story){
    const reader=document.getElementById('reader');
    const title=document.getElementById('rTitle');
    const summary=document.getElementById('rSummary');
    const origin=document.getElementById('rOrigin');
    if(!reader||!title||!summary||!origin) return;
    title.textContent=story.dataset.title||'';
    summary.textContent=story.dataset.summary||'';
    origin.href=safeUrl(story.dataset.url||'#');
    reader.classList.add('open');
  }

  document.addEventListener('click',e=>{
    const story=e.target.closest?.('.story');
    if(story) openReader(story);
  });

  function render(data){
    const storySections=[...document.querySelectorAll('section.section-sm')].filter(s=>s.querySelector('.stories'));
    const domesticSection=domestic?.closest('section.section-sm');
    const remaining=storySections.filter(s=>s!==domesticSection);
    const worldGrid=remaining[0]?.querySelector('.stories');
    const marketsGrid=remaining[1]?.querySelector('.stories');
    const aiGrid=remaining[2]?.querySelector('.stories');
    const mediaGrid=document.querySelector('.media-grid');

    let mode='latest';
    const drawDomestic=()=>setGrid(domestic,mode==='popular'?data.popular_vn:data.latest_vn);
    drawDomestic();

    document.querySelectorAll('[data-domestic]').forEach(btn=>{
      btn.onclick=()=>{
        document.querySelectorAll('[data-domestic]').forEach(x=>x.classList.remove('on'));
        btn.classList.add('on');
        mode=btn.dataset.domestic==='popular'?'popular':'latest';
        drawDomestic();
      };
    });

    setGrid(worldGrid,data.world);
    setGrid(marketsGrid,data.markets);
    setGrid(aiGrid,data.ai_news);
    setGrid(mediaGrid,data.media,mediaCard);

    if(status){
      const d=new Date(data.updated_at||Date.now());
      const locale=lang.startsWith('zh')?'zh-CN':lang.startsWith('en')?'en-GB':'vi-VN';
      const stamp=Number.isNaN(d.getTime())?String(data.updated_at||''):d.toLocaleString(locale,{
        dateStyle:'short',timeStyle:'short',timeZone:'Asia/Ho_Chi_Minh'
      });
      status.textContent=`${copy.updated}: ${stamp}`;
      status.classList.remove('is-error');
      status.classList.add('is-live');
    }
  }

  fetch('/data/news.json?ts='+Date.now(),{
    cache:'no-store',
    headers:{Accept:'application/json'}
  })
  .then(r=>{
    if(!r.ok) throw new Error(`News HTTP ${r.status}`);
    return r.json();
  })
  .then(data=>{
    if(!data||!Array.isArray(data.latest_vn)) throw new Error('Invalid news payload');
    render(data);
  })
  .catch(err=>{
    console.error('DNG Insights live feed failed:',err);
    if(status){
      status.textContent=copy.error;
      status.classList.add('is-error');
      status.classList.remove('is-live');
    }
  });
})();