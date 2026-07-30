
(() => {
 const toggle=document.querySelector('.mobile-menu-toggle');
 const panel=document.querySelector('.mobile-menu-panel');
 const backdrop=document.querySelector('.mobile-menu-backdrop');
 if(!toggle||!panel||!backdrop)return;
 const close=()=>{panel.classList.remove('is-open');backdrop.classList.remove('is-open');document.body.classList.remove('mobile-menu-open');toggle.setAttribute('aria-expanded','false');panel.setAttribute('aria-hidden','true')};
 const open=()=>{panel.classList.add('is-open');backdrop.classList.add('is-open');document.body.classList.add('mobile-menu-open');toggle.setAttribute('aria-expanded','true');panel.setAttribute('aria-hidden','false');panel.querySelector('a,button')?.focus()};
 toggle.addEventListener('click',()=>panel.classList.contains('is-open')?close():open());
 document.querySelectorAll('[data-mobile-menu-close]').forEach(x=>x.addEventListener('click',close));
 panel.querySelectorAll('a').forEach(x=>x.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
