/** SWQS cinematic water sample: a procedural, inspectable Three.js illustration.
 * Input controls are explanatory only; they never change the trained classifier.
 * CDN failure and missing WebGL fall back to the editorial photographic hero.
 */
const host = document.querySelector('#heroViewer');
const canvas = document.querySelector('#heroCanvas');
const fallback = document.querySelector('#hero3dFallback');
const title = document.querySelector('#heroInspectorTitle');
const tag = document.querySelector('#heroInspectorTag');
const explanation = document.querySelector('#heroInspectorCopy');
const status = {active: 'intro', running: true, drag: false, lastX:0, lastY:0, ry: .36, rx: -.08, toY:.36, toX:-.08, visible:true};
const facts = {
  intro:['01 / WATER SAMPLE','Water under the lens','Rotate this conceptual water sample and choose a feature to inspect.'],
  ph:['02 / FEATURE · pH','Acidity & alkalinity','A calibrated pH probe measures one dataset feature. Its reading alone does not establish safe drinking water.'],
  solids:['03 / FEATURE · SOLIDS','Dissolved solids','The dataset Solids values are not interchangeable with readings from a low-cost conductivity-derived TDS module.'],
  turbidity:['04 / FEATURE · TURBIDITY','Clarity under inspection','Optical turbidity can be measured after calibration, but it cannot detect all dissolved chemicals or microbes.']
};
function select(key){status.active=key;const f=facts[key]||facts.intro;tag.textContent=f[0];title.textContent=f[1];explanation.textContent=f[2];document.querySelectorAll('[data-water-feature]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.waterFeature===key)));}
document.querySelectorAll('[data-water-feature]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.waterFeature)));
select('intro');
const pause = document.querySelector('#heroPause');const reset=document.querySelector('#heroReset');
pause.addEventListener('click',()=>{status.running=!status.running;pause.textContent=status.running?'Ⅱ Pause':'▶ Resume';pause.setAttribute('aria-pressed',String(!status.running));});
reset.addEventListener('click',()=>{status.toY=.36;status.toX=-.08;select('intro');});
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches){status.running=false;pause.textContent='▶ Resume';pause.setAttribute('aria-pressed','true');}
const heroObserver=new IntersectionObserver(entries=>{status.visible=entries[0]?.isIntersecting||false;},{threshold:0});heroObserver.observe(host);
async function start(){let THREE;
 try{THREE=await import('https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js')}catch(e){console.info('SWQS hero: 3D CDN unavailable; showing static fallback.');return;}
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});}catch(e){console.info('SWQS hero: WebGL unavailable; showing static fallback.');return;}
 renderer.setClearColor(0x061823,0);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,.25,8.9);camera.lookAt(0,.05,0);
 scene.add(new THREE.HemisphereLight(0xc1fffc,0x091c2e,2.2));const key=new THREE.DirectionalLight(0xd4ffff,3.4);key.position.set(-4,5,6);scene.add(key);
 const rim=new THREE.PointLight(0x00dbd2,95,15);rim.position.set(3,0,2);scene.add(rim);
 const back=new THREE.PointLight(0x367cec,55,14);back.position.set(0,-2,-3);scene.add(back);
 const model=new THREE.Group();scene.add(model);
 // Water-droplet outline is formed by rotating its smooth cross-section.
 const path=new THREE.SplineCurve([new THREE.Vector2(0,-1.85),new THREE.Vector2(.62,-1.79),new THREE.Vector2(1.21,-1.40),new THREE.Vector2(1.47,-.73),new THREE.Vector2(1.40,-.03),new THREE.Vector2(1.08,.62),new THREE.Vector2(.53,1.34),new THREE.Vector2(0,2.07)]);
 const shellMat=new THREE.MeshPhysicalMaterial({color:0x57e4ee,metalness:.03,roughness:.058,transparent:true,opacity:.82,transmission:.26,ior:1.33,thickness:.7,clearcoat:1,clearcoatRoughness:.04,side:THREE.DoubleSide,depthWrite:false});
 const shell=new THREE.Mesh(new THREE.LatheGeometry(path.getPoints(100),96),shellMat);model.add(shell);
 const coreMat=new THREE.MeshPhysicalMaterial({color:0x1dc8d3,transparent:true,opacity:.25,roughness:.13,metalness:.28,emissive:0x0b3449,depthWrite:false});
 const core=new THREE.Mesh(new THREE.SphereGeometry(.84,48,32),coreMat);core.position.set(0,-.45,0);model.add(core);
 const haloMat=new THREE.MeshBasicMaterial({color:0x64ffe6,transparent:true,opacity:.65,depthWrite:false});
 const orbitRings=[];for(let i=0;i<4;i++){let ring=new THREE.Mesh(new THREE.TorusGeometry(2.1+i*.18,.009,6,154),haloMat.clone());ring.rotation.set((.25+i*.25)*Math.PI,0,i*.4);model.add(ring);orbitRings.push(ring);}
 const random=(()=>{let s=18771;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}})();
 const positions=[];for(let i=0;i<185;i++){const theta=random()*Math.PI*2,rad=1.95+random()*.85,y=(random()-.5)*4.5;positions.push(Math.cos(theta)*rad,y,Math.sin(theta)*rad)}
 const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const particleSystem=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0x8afce6,size:.038,transparent:true,opacity:.82,depthWrite:false}));model.add(particleSystem);
 // Three anchored inspection dots visibly mark the explorable volume.
 const dots=[];for(const [i,p] of [[0,[-1.58,.5,.5]],[1,[1.55,.28,.5]],[2,[0,-1.76,1.0]]]){const orb=new THREE.Mesh(new THREE.SphereGeometry(.06,20,12),new THREE.MeshBasicMaterial({color:i===0?0x99fdec:0xffdaa2}));orb.position.set(...p);model.add(orb);dots.push(orb)}
 const setSize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();model.scale.setScalar(w<450?.76:1);};
 new ResizeObserver(setSize).observe(host);setSize();
 let hasMoved=false;
 canvas.addEventListener('pointerdown',e=>{status.drag=true;status.lastX=e.clientX;status.lastY=e.clientY;hasMoved=false;canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!status.drag)return;const dx=e.clientX-status.lastX,dy=e.clientY-status.lastY;if(Math.abs(dx)+Math.abs(dy)>2)hasMoved=true;status.toY+=dx*.007;status.toX=Math.max(-.7,Math.min(.7,status.toX+dy*.004));status.lastX=e.clientX;status.lastY=e.clientY});
 canvas.addEventListener('pointerup',()=>{status.drag=false});canvas.addEventListener('pointercancel',()=>{status.drag=false});
 canvas.addEventListener('click',()=>{if(!hasMoved){const ks=['ph','solids','turbidity'];select(ks[(ks.indexOf(status.active)+1+ks.length)%ks.length]);}});
 const clock=new THREE.Clock();let frame;
 function render(){frame=requestAnimationFrame(render);if(!status.visible||document.hidden)return;const t=clock.getElapsedTime();status.ry+=(status.toY-status.ry)*.065;status.rx+=(status.toX-status.rx)*.065;
 if(status.running&&!status.drag){status.toY+=.0015;model.position.y=Math.sin(t*.95)*.085;orbitRings.forEach((r,i)=>{r.rotation.z+=.00055*(i%2?1:-1)});core.material.opacity=.25+Math.sin(t*1.3)*.045;}
 model.rotation.y=status.ry;model.rotation.x=status.rx;
 const col=status.active==='ph'?0x7feaff:status.active==='solids'?0xe4c68c:status.active==='turbidity'?0x9affe0:0x64ffe6;
 orbitRings.forEach(r=>r.material.color.lerp(new THREE.Color(col),.035));renderer.render(scene,camera);
 }
 fallback.classList.add('hidden');canvas.classList.add('ready');render();
 addEventListener('pagehide',()=>{cancelAnimationFrame(frame);renderer.dispose();shell.geometry.dispose();core.geometry.dispose();particleGeo.dispose();}, {once:true});
}
start();
