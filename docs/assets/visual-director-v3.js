/* SWQS-BMY: chapter-aware motion, feature explorer and scientific interactions.
   Readability, reduced motion and keyboard navigation always take priority. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  // Each major part participates in the narrative; do not hide content when JS fails.
  const sections = [...document.querySelectorAll('main > section')];
  for (const sec of sections) {
    sec.classList.add('swqs-chapter');
    if (!sec.querySelector(':scope > .swqs-section-progress')) {
      const track = document.createElement('div');
      track.className = 'swqs-section-progress';
      track.setAttribute('aria-hidden', 'true');
      sec.prepend(track);
    }
  }
  const reveal = [...document.querySelectorAll(
    'main .section-index,main .section-heading-paired,main .opening-grid > *,main .journey-card,'+
    'main .model-header > *,main .flow-visual > div,main .method-stage,main .method-tabs,'+
    'main .science-copy,main .science-art,main .team-story-copy,main .team-story-media,'+
    'main .team-card,main .paper-figure,main .paper-h1,main .paper-h2,main .swqs-architecture-header > *,'+
    'main .swqs-architecture-viewport,main .swqs-architecture-side,main .end-cta > *,main .next'
  )];
  reveal.forEach((el,i)=>{if (!el.hasAttribute('data-swqs-appear')){el.setAttribute('data-swqs-appear','');el.style.setProperty('--stagger',`${(i % 3) * 85}ms`);}});
  if (!reduced && 'IntersectionObserver' in window) {
    document.body.classList.add('swqs-motion-enabled');
    const observer = new IntersectionObserver(entries => entries.forEach(e=>{
      if (e.isIntersecting) {e.target.classList.add('swqs-in');observer.unobserve(e.target);}
    }), {threshold:.045,rootMargin:'0px 0px 48px 0px'});
    reveal.forEach(el=>observer.observe(el));
  } else reveal.forEach(el=>el.classList.add('swqs-in'));
  // Tiny light-responsive parallax on the scientific visual, no perpetual layout work.
  const sci = document.querySelector('.swqs-material-shell');
  if (sci && fine && !reduced) {
    let request=0;
    sci.addEventListener('pointermove',e=>{
      if(request)return;
      request=requestAnimationFrame(()=>{
        request=0;
        const r=sci.getBoundingClientRect();
        const x=((e.clientX-r.left)/r.width-.5)*9;
        const y=((e.clientY-r.top)/r.height-.5)*9;
        const stage=sci.querySelector('.swqs-molecule-stage');
        if(stage)stage.style.filter=`drop-shadow(${x}px ${y}px 25px #78d4e347)`;
      });
    },{passive:true});
    sci.addEventListener('pointerleave',()=>{const stage=sci.querySelector('.swqs-molecule-stage');if(stage)stage.style.filter='';});
  }
  // Parameter choices are explanatory, not a fake live measurement or model prediction.
  const featureContent = {
    ph:['pH','Acidity or alkalinity of water. A calibrated pH electrode can measure this value.','Direct probe · calibration required'],
    hardness:['Hardness','Calcium and magnesium mineral hardness. A dedicated chemical/analytical method is needed.','Not measured by basic sensor kit'],
    solids:['Solids','Concentration of dissolved substances in the source dataset. Budget TDS readings are an imperfect proxy.','Approximate proxy, not equivalent'],
    chloramines:['Chloramines','Chlorine-containing disinfectant compounds require dedicated chemical tests.','Not measured by basic sensor kit'],
    sulfate:['Sulfate','Sulfate ion concentration is a laboratory-defined chemical indicator.','Not measured by basic sensor kit'],
    conductivity:['Conductivity','Electrical conductivity reflects dissolved ions. A calibrated EC probe can measure it.','Optional calibrated EC probe'],
    organic_carbon:['Organic carbon','Concentration of carbon within organic compounds, requiring suitable analytical measurement.','Not measured by basic sensor kit'],
    trihalomethanes:['Trihalomethanes','Disinfection by-products that require analytical testing; clarity is not a substitute.','Not measured by basic sensor kit'],
    turbidity:['Turbidity','Optical cloudiness from suspended particles, measurable with a calibrated turbidity sensor.','Direct optical sensor · calibration required']
  };
  const featureBtns=[...document.querySelectorAll('[data-swqs-feature]')];
  const box=document.getElementById('swqsFeatureReading');
  if(featureBtns.length && box){
    const choose=k=>{
      if(!featureContent[k])return;
      featureBtns.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.swqsFeature===k)));
      const d=featureContent[k];
      box.querySelector('.micro').textContent='MEASUREMENT / '+String(featureBtns.findIndex(btn=>btn.dataset.swqsFeature===k)+1).padStart(2,'0');
      box.querySelector('h3').textContent=d[0];
      box.querySelector('p').textContent=d[1];
      box.querySelector('.status').textContent=d[2];
    };
    featureBtns.forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.swqsFeature)));
    choose('ph');
  }
  if(!reduced){
    let pending=false;
    function update(){pending=false;const viewH=innerHeight;
      for(const sec of sections){const box=sec.getBoundingClientRect();if(box.bottom<0 || box.top>viewH)continue;
        const progress=Math.max(0,Math.min(1,(viewH*.72-box.top)/(box.height+viewH*.35)));
        sec.style.setProperty('--chapter-scroll',(progress*100).toFixed(1)+'%');
      }
    }
    addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update)}},{passive:true});update();
  }
})();
