
const base=(()=>{const p=location.pathname.split('/').filter(Boolean);return location.hostname.includes('github.io')&&p.length?'/'+p[0]+'/':'/';})();
document.documentElement.style.setProperty('--base',base);
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
document.querySelectorAll('.project').forEach((c,i)=>{c.style.transitionDelay=`${(i%3)*90}ms`});
const gate=document.querySelector('#portfolio-gate');if(gate){const ok=sessionStorage.getItem('portfolio-v12')==='ok';if(ok)gate.remove();else{gate.querySelector('form').addEventListener('submit',e=>{e.preventDefault();if(gate.querySelector('input').value==='999999'){sessionStorage.setItem('portfolio-v12','ok');gate.remove()}else gate.querySelector('small').textContent='Mật khẩu chưa đúng.'})}}
