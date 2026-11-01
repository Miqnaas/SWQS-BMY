/* SWQS-BMY / identity v4 • animated water background and explorable system.
   No changes to datasets, scientific results, or classifier inference.
*/
(()=>{'use strict';
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 if(!document.body.classList.contains('page-home'))return;
 const material=document.querySelector('.swqs-material-shell');
 if(material){
  const ribbon=document.createElement('div');ribbon.className='swqs-current-ribbon';ribbon.setAttribute('aria-hidden','true');
  const second=ribbon.cloneNode();material.append(ribbon,second);
  const canvas=document.createElement('canvas');canvas.className='swqs-fluid-field';canvas.setAttribute('aria-hidden','true');material.append(canvas);
  const c=canvas.getContext('2d',{alpha:true});
  if(c){
   let w=1,h=1,scale=1,visible=false,raf=0,bubbles=[];
   const count=innerWidth<660?24:48;
   const resize=()=>{
    const r=material.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);
    scale=Math.min(1.5,devicePixelRatio||1);canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);
    canvas.style.width=w+'px';canvas.style.height=h+'px';c.setTransform(scale,0,0,scale,0,0);
    bubbles=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,
     size:1+Math.random()*4,speed:.16+Math.random()*.58,
     offset:Math.random()*Math.PI*2,wave:7+Math.random()*24,alpha:.16+Math.random()*.42}));
   };
   resize();
   const ro='ResizeObserver'in window?new ResizeObserver(resize):null;ro?.observe(material);
   const frame=t=>{
    raf=0;if(!visible||reduced.matches||document.hidden)return;
    c.clearRect(0,0,w,h);const sec=t*.00038;
    for(let i=0;i<6;i++){
     const y=h*(.15+i*.147),phase=sec*(i%2?-.84:.72)+i;
     c.beginPath();
     for(let x=-24;x<w+24;x+=8){
      const vy=y+Math.sin(x*.011+phase)*18+Math.sin(x*.023-phase*1.4)*9;
      if(x===-24)c.moveTo(x,vy);else c.lineTo(x,vy);
     }
     c.strokeStyle='rgba(248,255,255,'+(.07+(i%3)*.025)+')';
     c.lineWidth=i%2?1.5:2.8;c.stroke();
    }
    for(const b of bubbles){
     b.y-=b.speed;if(b.y< -18){b.y=h+18;b.x=Math.random()*w;}
     const x=b.x+Math.sin(sec+b.offset)*b.wave;
     c.beginPath();c.arc(x,b.y,b.size,0,Math.PI*2);
     c.fillStyle='rgba(250,255,255,'+b.alpha+')';c.fill();
     c.strokeStyle='rgba(8,127,153,'+(b.alpha*.38)+')';c.lineWidth=.5;c.stroke();
    }
    raf=requestAnimationFrame(frame);
   };
   const io=new IntersectionObserver(a=>{visible=a[0]?.isIntersecting||false;
    if(visible&&!raf&&!reduced.matches)raf=requestAnimationFrame(frame);
    else if(!visible){cancelAnimationFrame(raf);raf=0;}
   },{threshold:0});io.observe(material);
   reduced.addEventListener?.('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);raf=0;c.clearRect(0,0,w,h);}else if(visible&&!raf)raf=requestAnimationFrame(frame);});
   document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible&&!raf&&!reduced.matches)raf=requestAnimationFrame(frame)});
   addEventListener('pagehide',()=>{cancelAnimationFrame(raf);io.disconnect();ro?.disconnect();},{once:true});
  }
 }
 const closing=document.querySelector('.closing-section');
 if(closing){
  const f=document.createElement('div');f.className='swqs-flow-visual';f.setAttribute('aria-hidden','true');
  f.innerHTML='<div class="swqs-flow-path"><span class="swqs-flow-node">Sensing</span><span class="swqs-flow-node">Data</span><span class="swqs-flow-node">Model</span><span class="swqs-flow-node">Explore</span></div>';
  closing.append(f);
  const content=closing.querySelector('.closing-copy');
  if(content){
   const links=document.createElement('div');links.className='swqs-discover-path';
   links.innerHTML='<a href="./research.html#explorer">01 / Explore real data ↗</a><a href="./experience.html">02 / Open 3D lab ↗</a><a href="./lab.html#prediction-form">03 / Try real inference ↗</a>';
   content.append(links);
  }
 }
})();