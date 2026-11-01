/* SWQS-BMY cinematic v6: quick feature access, lazy cosmetics and accessible controls.
   Real ML prediction is deliberately unaffected. */
(()=>{
 'use strict';
 if(!document.body.classList.contains('page-home'))return;
 const quick=[...document.querySelectorAll('[data-water-select]')];
 const hotspots=[...document.querySelectorAll('.hero-water-point')];
 const t=document.querySelector('#heroInspectorTitle');
 quick.forEach(btn=>{
  btn.addEventListener('click',()=>{
   const target=hotspots.find(x=>x.dataset.waterFeature===btn.dataset.waterSelect);
   if(target)target.click();
  });
 });
 const sync=()=>{
  const active=document.querySelector('.hero-water-point[aria-pressed=true]')?.dataset.waterFeature;
  quick.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.waterSelect===active)));
 };
 if(t){const observer=new MutationObserver(sync);observer.observe(t,{childList:true});sync();}
 // A subtle light response on the molecule, without replacing the continuous 3D rotation.
 const water=document.querySelector('#waterMolecule');
 if(water&&matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches){
  let ticking=false;
  water.addEventListener('pointermove',event=>{
   if(ticking)return;ticking=true;requestAnimationFrame(()=>{
    ticking=false;const r=water.getBoundingClientRect();
    const x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;
    water.style.setProperty('--light-x',(45+x*12).toFixed(1)+'%');
    water.style.setProperty('--light-y',(38+y*10).toFixed(1)+'%');
   });
  },{passive:true});
 }
 // Prevent canvas fallback controls from appearing as nine overlapping points if the 3D library cannot load.
 const viewer=document.getElementById('heroViewer');
 if(viewer){
  const useFallback=()=>{if(viewer.classList.contains('webgl-ready'))return;
   viewer.classList.add('swqs-v6-fallback');
  };
  window.addEventListener('load',()=>{setTimeout(useFallback,3500)},{once:true});
 }
 // Load the optional ESP32 3D scene near the sensor architecture chapter.
 // This restores the useful lazy-loading behavior from the old static hero script.
 const architecture=document.getElementById('architecture');
 if(architecture){
  let loaded=false;
  const load=()=>{
   if(loaded)return;loaded=true;
   import('./sensor-architecture.js?v=3').catch(err=>{
    console.warn('Optional sensor explorer could not load',err);
    const status=document.getElementById('swqsArchitectureStatus');
    if(status)status.textContent='3D module unavailable; the conceptual architecture is described in the adjacent panel.';
   });
  };
  if('IntersectionObserver'in window){
   const io=new IntersectionObserver(items=>{
    if(items.some(x=>x.isIntersecting)){io.disconnect();load();}
   },{rootMargin:'420px 0px'});
   io.observe(architecture);
  }else load();
 }
 // Calm secondary animations when tab is hidden.
 document.addEventListener('visibilitychange',()=>document.body.classList.toggle('swqs-page-hidden',document.hidden));
})();