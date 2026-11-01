/* SWQS-BMY optimized photographic homepage hero; model remains in Prediction Lab. */
(()=>{
 'use strict';
 const root=document.getElementById('heroViewer');if(!root)return;
 const facts={
  ph:['pH','Acidity and alkalinity. A calibrated pH probe measures this property, but pH alone cannot establish drinking-water safety.'],
  hardness:['Hardness','Dissolved calcium and magnesium. Measuring hardness requires an appropriate chemical or analytical method.'],
  solids:['Solids','Dissolved substances in the dataset. A low-cost conductivity-derived TDS estimate is not an equivalent measurement.'],
  chloramines:['Chloramines','Disinfection chemistry requires a suitable chemical test rather than a basic sensor probe.'],
  sulfate:['Sulfate','Sulfate ion concentration needs appropriate chemical testing and is not directly read by our proposed sensor kit.'],
  conductivity:['Conductivity','How readily water carries electric current. A calibrated electrical-conductivity probe can measure it.'],
  organic_carbon:['Organic carbon','Carbon present in organic compounds, requiring specialized analytical measurement.'],
  trihalomethanes:['Trihalomethanes','Disinfection by-products measured using appropriate laboratory methods, not by water clarity.'],
  turbidity:['Turbidity','Optical cloudiness. A calibrated turbidity sensor can estimate it, but clear water can still be unsafe.']
 };
 const buttons=[...root.querySelectorAll('.hero-water-point')];
 const tag=root.querySelector('#heroInspectorTag'),title=root.querySelector('#heroInspectorTitle'),copy=root.querySelector('#heroInspectorCopy');
 function select(key){
  if(!facts[key])return;const index=buttons.findIndex(b=>b.dataset.waterFeature===key);
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.waterFeature===key)));
  tag.textContent='FEATURE '+String(index+1).padStart(2,'0')+' / 09';
  title.textContent=facts[key][0];copy.textContent=facts[key][1];
 }
 buttons.forEach(b=>b.addEventListener('click',()=>select(b.dataset.waterFeature)));
 select('ph');
 // Heavy 3D code loads only when the optional architecture section is about to be seen.
 const section=document.getElementById('architecture');
 if(section){
  let loaded=false;
  const load=()=>{if(loaded)return;loaded=true;
   import('./sensor-architecture.js?v=3').catch(error=>{
    console.warn('Optional sensor 3D unavailable',error);
    const info=document.getElementById('swqsSensorStatus');
    if(info)info.textContent='Optional 3D module unavailable; the system architecture is described below.';
   });
  };
  if('IntersectionObserver'in window){
   const obs=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){obs.disconnect();load();}},{rootMargin:'450px 0px'});
   obs.observe(section);
  }else load();
 }
})();