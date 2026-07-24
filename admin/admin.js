(() => {
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  let user=null, translations=null, site=null, posts=null, portfolio=null;
  let currentLang='vi', postLang='vi', editingPost=-1;
  const labels={home:'Trang chủ',pricing:'Báo giá',contact:'Liên hệ',portfolio:'Portfolio',posts:'Bài viết'};
  const status=$('#status');
  const setStatus=(text,error=false)=>{status.textContent=text;status.style.color=error?'#c33':''};

  function showAdmin(){ $('#loginView').classList.add('hidden'); $('#adminView').classList.remove('hidden'); $('#userEmail').textContent=user?.email||'Demo mode'; loadData(); }
  function showLogin(){ $('#adminView').classList.add('hidden'); $('#loginView').classList.remove('hidden'); }
  const authParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const hasInviteToken = authParams.has('invite_token');
  const hasRecoveryToken = authParams.has('recovery_token');
  const hasConfirmationToken = authParams.has('confirmation_token');
  const authHelp = $('#authHelp');

  if(window.netlifyIdentity){
    netlifyIdentity.on('init',u=>{
      user=u;
      if(u){
        showAdmin();
        return;
      }
      // Netlify appends invite/recovery tokens to the URL hash. Opening the
      // widget after init lets it process the token and show the password form.
      if(hasInviteToken){
        if(authHelp) authHelp.textContent='Lời mời hợp lệ. Hãy đặt mật khẩu Admin trong cửa sổ đang mở.';
        setTimeout(()=>netlifyIdentity.open('signup'),80);
      }else if(hasRecoveryToken || hasConfirmationToken){
        if(authHelp) authHelp.textContent='Đang xác nhận tài khoản. Hoàn tất bước trong cửa sổ đang mở.';
        setTimeout(()=>netlifyIdentity.open(),80);
      }
    });
    netlifyIdentity.on('login',u=>{
      user=u;
      netlifyIdentity.close();
      if(window.location.hash) history.replaceState(null,'',window.location.pathname);
      showAdmin();
    });
    netlifyIdentity.on('logout',()=>{user=null;showLogin()});
    netlifyIdentity.on('error',err=>{
      console.error(err);
      if(authHelp) authHelp.textContent='Liên kết mời có thể đã hết hạn hoặc đã dùng. Vào Netlify → Identity → Users để gửi lại lời mời hoặc email đặt lại mật khẩu.';
    });
    netlifyIdentity.init();
  }
  $('#loginBtn').onclick=()=>netlifyIdentity?.open('login');
    $('#logoutBtn').onclick=()=>netlifyIdentity?.logout();

  $$('.tab').forEach(btn=>btn.onclick=()=>{
    $$('.tab').forEach(x=>x.classList.toggle('active',x===btn));
    $$('.panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===btn.dataset.tab));
    $('#panelTitle').textContent=labels[btn.dataset.tab];
  });

  async function loadData(){
    try{
      [translations,site,posts]=await Promise.all([
        fetch('/content/translations.json?'+Date.now()).then(r=>r.json()),
        fetch('/content/site.json?'+Date.now()).then(r=>r.json()),
        fetch('/content/posts.json?'+Date.now()).then(r=>r.json())
      ]);
      buildLangTabs(); fillTranslationFields(); fillContact(); fillVisibilitySettings(); renderPosts(); setStatus('Dữ liệu đã tải.');
    }catch(e){setStatus('Không tải được dữ liệu: '+e.message,true)}
  }

  function buildLangTabs(){
    $$('[data-lang-tabs]').forEach(root=>{
      root.innerHTML=['vi','en','zh'].map(l=>`<button class="lang-tab ${l===currentLang?'active':''}" data-lang="${l}">${l==='vi'?'Tiếng Việt':l==='en'?'English':'中文'}</button>`).join('');
      root.querySelectorAll('button').forEach(b=>b.onclick=()=>{currentLang=b.dataset.lang;buildLangTabs();fillTranslationFields()});
    });
  }
  function getPath(obj,path){return path.split('.').reduce((o,k)=>o?.[k],obj)}
  function setPath(obj,path,value){const ks=path.split('.');let o=obj;ks.slice(0,-1).forEach(k=>o=o[k]??={});o[ks.at(-1)]=value}
  function fillTranslationFields(){
    $$('[data-t-path]').forEach(el=>{el.value=getPath(translations[currentLang],el.dataset.tPath)??'';el.oninput=()=>setPath(translations[currentLang],el.dataset.tPath,el.value)});
    $$('[data-t-json]').forEach(el=>{const path=el.dataset.tJson;el.value=JSON.stringify(getPath(translations[currentLang],path)??[],null,2);el.onchange=()=>{try{setPath(translations[currentLang],path,JSON.parse(el.value));el.style.borderColor=''}catch(e){el.style.borderColor='#c33'}}});
  }
  function fillContact(){
    $('#contactEmail').value=site?.vi?.contact?.email||''; $('#contactZalo').value=site?.vi?.contact?.zalo||'';
    $('#contactEmail').oninput=()=>['vi','en','zh'].forEach(l=>site[l].contact.email=$('#contactEmail').value);
    $('#contactZalo').oninput=()=>['vi','en','zh'].forEach(l=>site[l].contact.zalo=$('#contactZalo').value);
  }

  function fillVisibilitySettings(){ site.settings ??= {}; site.settings.showHomePortfolio=false; const toggle=$('#showHomePortfolio'); if(toggle){toggle.checked=false;toggle.disabled=true;} }

  async function token(){return user?await user.jwt():null}
  async function commit(file,data,message){
    const t=await token(); if(!t) throw new Error('Bạn chưa đăng nhập.');
    const r=await fetch('/.netlify/functions/cms',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},body:JSON.stringify({action:'write',file,content:JSON.stringify(data,null,2),message})});
    const out=await r.json().catch(()=>({})); if(!r.ok) throw new Error(out.error||'Publish failed'); return out;
  }
  $('#publishAll').onclick=async()=>{
    try{
      setStatus('Đang đăng thay đổi…'); $('#publishAll').disabled=true;
      ['vi','en','zh'].forEach(lang => {
        site[lang] ??= {}; site[lang].home ??= {};
        site[lang].home.heroTitle = translations[lang].heroTitle;
        site[lang].home.heroLead = translations[lang].heroLead;
      });
      site.settings ??= {}; site.settings.showHomePortfolio=false;
      await commit('content/translations.json',translations,'Update website copy from Admin');
      await commit('content/site.json',site,'Update site settings from Admin');
      await commit('content/posts.json',posts,'Update posts from Admin');
      if(portfolio){const pass=$('#portfolioPassword').value.trim();if(!pass)throw new Error('Nhập mật khẩu Portfolio trước khi đăng thay đổi dự án.');const enc=await encryptPortfolio(portfolio,pass);await commit('content/portfolio-v72.enc.json',enc,'Update encrypted portfolio from Admin')}
      setStatus('Đã commit. Netlify sẽ tự deploy lại website.');
    }catch(e){setStatus(e.message,true)}finally{$('#publishAll').disabled=false}
  };

  // Portfolio crypto editor
  const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)); const b64e=u=>btoa(String.fromCharCode(...u)); const encText=new TextEncoder();
  async function derive(password,salt,iterations){const material=await crypto.subtle.importKey('raw',encText.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
  async function decryptPortfolio(password){const p=await fetch('/content/portfolio-v72.enc.json?'+Date.now()).then(r=>r.json());const key=await derive(password,b64(p.salt),p.iterations);const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(p.iv)},key,b64(p.data));return JSON.parse(new TextDecoder().decode(plain))}
  async function encryptPortfolio(data,password){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),iterations=210000,key=await derive(password,salt,iterations),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,encText.encode(JSON.stringify(data)));return {salt:b64e(salt),iv:b64e(iv),data:b64e(new Uint8Array(ct)),iterations}}
  $('#loadPortfolio').onclick=async()=>{try{setStatus('Đang giải mã Portfolio…');portfolio=await decryptPortfolio($('#portfolioPassword').value.trim());renderPortfolioEditors();setStatus('Portfolio đã mở.')}catch(e){setStatus('Mật khẩu Portfolio không đúng.',true)}};
  function renderPortfolioEditors(){
    const root=$('#portfolioEditors');root.innerHTML=portfolio.cases.map((c,i)=>`<div class="project-editor"><h3>0${i+1} — ${c.vi.title}</h3><div class="lang-tabs">${['vi','en','zh'].map(l=>`<button class="lang-tab ${l==='vi'?'active':''}" data-p-lang="${l}" data-p-index="${i}">${l.toUpperCase()}</button>`).join('')}</div><div data-project-fields="${i}"></div></div>`).join('');
    $$('[data-p-lang]').forEach(b=>b.onclick=()=>{const wrap=b.closest('.project-editor');wrap.querySelectorAll('[data-p-lang]').forEach(x=>x.classList.toggle('active',x===b));renderProjectFields(+b.dataset.pIndex,b.dataset.pLang)});
    portfolio.cases.forEach((_,i)=>renderProjectFields(i,'vi'));
  }
  function renderProjectFields(i,l){const c=portfolio.cases[i],t=c[l];const root=$(`[data-project-fields="${i}"]`);root.innerHTML=`<div class="grid"><div class="field"><label>Tiêu đề</label><input data-p="title" value="${esc(t.title)}"></div><div class="field"><label>Ngành</label><input data-p="industry" value="${esc(t.industry)}"></div><div class="field full"><label>Bối cảnh</label><textarea data-p="context">${esc(t.context)}</textarea></div><div class="field full"><label>Vai trò</label><textarea data-p="role">${esc(t.role)}</textarea></div><div class="field full"><label>Bài toán</label><textarea data-p="problem">${esc(t.problem)}</textarea></div><div class="field full"><label>Hướng triển khai</label><textarea data-p="approach">${esc(t.approach)}</textarea></div><div class="field full"><label>Hạng mục — mỗi dòng một mục</label><textarea data-p="deliverables">${esc(t.deliverables.join('\n'))}</textarea></div><div class="field full"><label>Danh sách ảnh — mỗi dòng một tên file</label><textarea data-images>${esc(c.images.join('\n'))}</textarea></div></div>`;root.querySelectorAll('[data-p]').forEach(el=>el.oninput=()=>{const k=el.dataset.p;t[k]=k==='deliverables'?el.value.split('\n').map(x=>x.trim()).filter(Boolean):el.value});root.querySelector('[data-images]').oninput=e=>c.images=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean)}
  function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  // Posts editor
  function renderPosts(){
    const root=$('#postList');root.innerHTML=(posts.posts||[]).map((p,i)=>`<div class="post-row"><div><h4>${esc(p.vi?.title||p.slug)}</h4><p>${p.status} · ${p.slug}</p></div><button class="btn ghost" data-edit-post="${i}">Sửa</button></div>`).join('')||'<p>Chưa có bài viết.</p>';
    $$('[data-edit-post]').forEach(b=>b.onclick=()=>openPost(+b.dataset.editPost));
  }
  $('#newPost').onclick=()=>{posts.posts.push({slug:'new-post-'+Date.now(),status:'draft',cover:'',vi:{category:'',title:'',excerpt:'',body:'<p></p>'},en:{category:'',title:'',excerpt:'',body:'<p></p>'},zh:{category:'',title:'',excerpt:'',body:'<p></p>'}});openPost(posts.posts.length-1)};
  function openPost(i){editingPost=i;postLang='vi';$('#postEditor').classList.remove('hidden');$('#postEditor').scrollIntoView({behavior:'smooth'});renderPostLangTabs();fillPost()}
  function renderPostLangTabs(){$('#postLangTabs').innerHTML=['vi','en','zh'].map(l=>`<button class="lang-tab ${l===postLang?'active':''}" data-post-lang="${l}">${l.toUpperCase()}</button>`).join('');$$('[data-post-lang]').forEach(b=>b.onclick=()=>{savePostFields();postLang=b.dataset.postLang;renderPostLangTabs();fillPost()})}
  function fillPost(){const p=posts.posts[editingPost],t=p[postLang];$('#postSlug').value=p.slug;$('#postStatus').value=p.status;$('#postCover').value=p.cover||'';$('#postCategory').value=t.category||'';$('#postTitle').value=t.title||'';$('#postExcerpt').value=t.excerpt||'';$('#postBody').value=t.body||'';if(p.cover){$('#coverPreview').src=p.cover;$('#coverPreview').classList.remove('hidden')}else $('#coverPreview').classList.add('hidden')}
  function savePostFields(){if(editingPost<0)return;const p=posts.posts[editingPost],t=p[postLang];p.slug=$('#postSlug').value.trim();p.status=$('#postStatus').value;p.cover=$('#postCover').value.trim();t.category=$('#postCategory').value;t.title=$('#postTitle').value;t.excerpt=$('#postExcerpt').value;t.body=$('#postBody').value}
  $('#savePost').onclick=()=>{savePostFields();renderPosts();setStatus('Bài viết đã lưu trong bản nháp Admin. Bấm “Đăng thay đổi” để publish.');$('#postEditor').classList.add('hidden')};
  $('#cancelPost').onclick=()=>{$('#postEditor').classList.add('hidden')};
  $('#deletePost').onclick=()=>{if(editingPost>=0&&confirm('Xóa bài viết này?')){posts.posts.splice(editingPost,1);editingPost=-1;$('#postEditor').classList.add('hidden');renderPosts()}};
  $('#coverFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{$('#coverPreview').src=rd.result;$('#coverPreview').classList.remove('hidden')};rd.readAsDataURL(f);try{setStatus('Đang tải ảnh…');const p=await uploadFile(f);$('#postCover').value=p;setStatus('Đã tải ảnh. Bấm lưu bài viết.')}catch(err){setStatus(err.message,true)}};
  async function uploadFile(file){const t=await token();const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(file)});const safe=(file.name||'image').toLowerCase().replace(/[^a-z0-9._-]+/g,'-');const dest=`assets/images/uploads/${Date.now()}-${safe}`;const r=await fetch('/.netlify/functions/cms',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},body:JSON.stringify({action:'upload',file:dest,base64,message:'Upload image from Admin'})});const out=await r.json();if(!r.ok)throw new Error(out.error||'Upload failed');return '/'+dest}
})();
