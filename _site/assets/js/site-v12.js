
const base=(()=>{const p=location.pathname.split('/').filter(Boolean);return location.hostname.includes('github.io')&&p.length?'/'+p[0]+'/':'/';})();
document.documentElement.style.setProperty('--base',base);
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
document.querySelectorAll('.project').forEach((c,i)=>{c.style.transitionDelay=`${(i%3)*90}ms`});
const gate=document.querySelector('#portfolio-gate');if(gate){const ok=sessionStorage.getItem('portfolio-v12')==='ok';if(ok)gate.remove();else{gate.querySelector('form').addEventListener('submit',e=>{e.preventDefault();if(gate.querySelector('input').value==='999999'){sessionStorage.setItem('portfolio-v12','ok');gate.remove()}else gate.querySelector('small').textContent='Mật khẩu chưa đúng.'})}}


// v12.2 portfolio lightbox
const lb=document.querySelector('#lightbox');
if(lb){const image=lb.querySelector('img');let items=[],idx=0;const open=(el)=>{items=[...el.closest('.case-gallery').querySelectorAll('[data-lightbox]')];idx=items.indexOf(el);image.src=el.dataset.lightbox;lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'};document.querySelectorAll('[data-lightbox]').forEach(el=>el.addEventListener('click',()=>open(el)));const move=d=>{if(!items.length)return;idx=(idx+d+items.length)%items.length;image.src=items[idx].dataset.lightbox};lb.querySelector('.lightbox-close').onclick=()=>{lb.classList.remove('open');lb.setAttribute('aria-hidden','true');document.body.style.overflow=''};lb.querySelector('.lightbox-prev').onclick=()=>move(-1);lb.querySelector('.lightbox-next').onclick=()=>move(1);lb.addEventListener('click',e=>{if(e.target===lb)lb.querySelector('.lightbox-close').click()});document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')lb.querySelector('.lightbox-close').click();if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)})}
