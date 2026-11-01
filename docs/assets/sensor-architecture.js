/** SWQS-BMY / educational sensor architecture.
 * Fully navigable, standalone Three.js scene. It does NOT sample a real device.
 * No live predictions are performed on incomplete hardware readings.
 */
const container=document.getElementById('swqsSensorCanvasWrap');
if(container){
 const canvas=document.getElementById('swqsSensorCanvas');
 const moduleButtons=[...document.querySelectorAll('[data-architecture-module]')];
 const reading=document.getElementById('swqsArchitectureReading');
 const statusEl=document.getElementById('swqsArchitectureStatus');
 const explodeButton=document.getElementById('swqsArchExplode');
 const pauseButton=document.getElementById('swqsArchPause');
 const resetButton=document.getElementById('swqsArchReset');
 const records={
   esp32:{index:'01 / CONTROLLER',title:'ESP32 microcontroller',copy:'Collects compatible sensor readings. This is a conceptual board layout, not a verified wiring diagram.'},
   ph:{index:'02 / MEASUREMENT',title:'Calibrated pH probe',copy:'Measures acidity and alkalinity. One relevant feature, never a water-safety certificate.'},
   tds:{index:'03 / PROXY',title:'Conductivity-derived TDS',copy:'Estimates dissolved-solids concentration. The output is not automatically equal to the dataset Solids feature.'},
   turbidity:{index:'04 / MEASUREMENT',title:'Optical turbidity sensor',copy:'Measures light scattering from suspended particles, after suitable calibration. It cannot detect all chemical contaminants.'},
   temperature:{index:'05 / SUPPORT SIGNAL',title:'Temperature probe',copy:'Aids measurement logging and compensation. Temperature is not one of the nine trained model inputs.'},
   ec:{index:'06 / OPTIONAL',title:'Conductivity probe',copy:'An optional electrical-conductivity sensor measures ion-influenced conductivity. It requires calibration and unit checks.'}
 };
 let selected='esp32',running=true,exploded=false,sceneReady=false;
 function choose(id){selected=records[id]?id:'esp32';const d=records[selected];reading.querySelector('.topline').textContent=d.index;reading.querySelector('h4').textContent=d.title;reading.querySelector('p').textContent=d.copy;moduleButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.architectureModule===selected)));}
 moduleButtons.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.architectureModule)));
 choose('esp32');
 const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');if(reduced.matches)running=false;
 pauseButton.addEventListener('click',()=>{running=!running;pauseButton.textContent=running?'Ⅱ Pause':'▶ Rotate';pauseButton.setAttribute('aria-pressed',String(!running));});
 explodeButton.addEventListener('click',()=>{exploded=!exploded;explodeButton.textContent=exploded?'Collapse layers':'Explode layers';explodeButton.setAttribute('aria-pressed',String(exploded));});
 let onReset=()=>{};
 resetButton.addEventListener('click',()=>{choose('esp32');exploded=false;explodeButton.textContent='Explode layers';explodeButton.setAttribute('aria-pressed','false');onReset();});
 async function setup(){
  let THREE;try{THREE=await import('https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js');}catch(err){statusEl.textContent='3D library could not load. Use the module buttons to explore the architecture.';return;}
  let renderer;try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});}catch(err){statusEl.textContent='WebGL is not available. Use the module buttons to explore the architecture.';return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x0c2635,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,100);
  camera.position.set(8.2,5.5,11.5);camera.lookAt(0,0,0);
  scene.add(new THREE.AmbientLight(0xd0f7ff,1.6));
  const a=new THREE.DirectionalLight(0xffffff,3.4);a.position.set(-5,8,6);scene.add(a);
  const b=new THREE.DirectionalLight(0x72ded7,1.5);b.position.set(5,2,-6);scene.add(b);
  const root=new THREE.Group();scene.add(root);
  const steel=new THREE.MeshStandardMaterial({color:0xbbd5df,metalness:.74,roughness:.23});
  const pcb=new THREE.MeshStandardMaterial({color:0x0d7375,metalness:.16,roughness:.48});
  const dark=new THREE.MeshStandardMaterial({color:0x0b2837,metalness:.16,roughness:.39});
  const accents=new THREE.MeshStandardMaterial({color:0x38cfc3,metalness:.37,roughness:.23,emissive:0x076f75,emissiveIntensity:.17});
  const glass=new THREE.MeshPhysicalMaterial({color:0xf7ffff,metalness:0,roughness:.05,transmission:.88,thickness:.48,ior:1.48,transparent:true,opacity:.72});
  const water=new THREE.MeshPhysicalMaterial({color:0xc0f4fa,metalness:0,roughness:.09,transparent:true,opacity:.45,transmission:.45,ior:1.333,thickness:.5});
  const colored={ph:0x4edbd4,tds:0x4ba9e1,turbidity:0xffc885,temperature:0xae9ce3,ec:0x53d39c,esp32:0x66d5da};
  const activeMeshes=[],modules={};
  function material(id){return new THREE.MeshStandardMaterial({color:colored[id]||0x62e2df,metalness:.25,roughness:.34,emissive:colored[id]||0x62e2df,emissiveIntensity:.15});}
  function box(target,w,h,d,mat,x,y,z,id){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);if(id){mesh.userData.moduleId=id;activeMeshes.push(mesh);}target.add(mesh);return mesh;}
  function cylinder(target,r1,r2,len,mat,x,y,z,id){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,24),mat);mesh.position.set(x,y,z);if(id){mesh.userData.moduleId=id;activeMeshes.push(mesh);}target.add(mesh);return mesh;}
  function module(id,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);g.userData.origin=g.position.clone();g.userData.dir=new THREE.Vector3(x/Math.max(1,Math.abs(x)),.18,z/Math.max(1,Math.abs(z)));root.add(g);modules[id]=g;return g;}
  // Base, transparent housing and accurate conceptual electronics hierarchy.
  const base=box(root,5,.12,3.1,dark,0,-1.05,0,'esp32');
  box(root,4.8,.065,2.93,pcb,0,-.96,0,'esp32');
  box(root,1.45,.24,.9,dark,-.45,-.76,-.02,'esp32');
  box(root,.65,.12,.65,steel,1.53,-.79,.65,'esp32');
  box(root,.5,.16,.28,steel,-2.18,-.79,-1,'esp32');
  // Lower-case engraved component pads remain decorative, no fake reading labels.
  for(let i=0;i<15;i++){const x=-2.12+i*.3;box(root,.09,.045,.11,steel,x,-.84,-1.35,'esp32');box(root,.09,.045,.11,steel,x,-.84,1.35,'esp32');}
  for(let i=0;i<8;i++)box(root,.055,.025,.8,accents,-1.65+i*.49,-.87,.13,'esp32');
  const boardGlass=box(root,5.2,1.7,3.3,glass,0,-.07,0);boardGlass.renderOrder=2;
  const shellEdges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.25,1.78,3.35)),new THREE.LineBasicMaterial({color:0x96d9e2,transparent:true,opacity:.4}));shellEdges.position.set(0,-.07,0);root.add(shellEdges);
  // Clear water cuvette adjacent to the ESP32. Designed to demonstrate sensing.
  const tank=module('turbidity',2.85,.18,2.58);
  cylinder(tank,.74,.74,1.6,glass,0,0,0,'turbidity');
  cylinder(tank,.67,.67,1.04,water,0,-.24,0,'turbidity');
  cylinder(tank,.77,.77,.07,steel,0,-.83,0,'turbidity');
  // Probes above the cuvette. The colored tips represent sensors, not chemistry.
  const ph=module('ph',2.37,1.65,2.34);cylinder(ph,.10,.12,1.35,steel,0,0,0,'ph');cylinder(ph,.11,.09,.26,material('ph'),0,-.7,0,'ph');
  const tds=module('tds',3.35,1.6,2.3);cylinder(tds,.1,.13,1.35,steel,0,0,0,'tds');cylinder(tds,.13,.1,.26,material('tds'),0,-.68,0,'tds');
  const temp=module('temperature',1.95,1.15,2.95);cylinder(temp,.08,.08,1.07,steel,0,0,0,'temperature');cylinder(temp,.1,.1,.19,material('temperature'),0,-.57,0,'temperature');
  const ec=module('ec',-2.95,.32,1.4);box(ec,.68,.2,.55,material('ec'),0,0,0,'ec');box(ec,.29,.11,.3,dark,0,.15,0,'ec');
  // Wires connect modules to the MCU; no claims of verified electrical pinout.
  const routes=[{id:'ph',from:[2.37,2.28,2.34],to:[.95,-.55,.55]},{id:'tds',from:[3.35,2.25,2.3],to:[1.65,-.55,.55]},{id:'temperature',from:[1.95,1.72,2.95],to:[1.8,-.55,-.05]},{id:'ec',from:[-2.95,.45,1.4],to:[-1.8,-.55,.1]}];
  for(const item of routes){const one=new THREE.Vector3(...item.from),end=new THREE.Vector3(...item.to);const mid=one.clone().lerp(end,.5);mid.y+=.7;const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([one,mid,end]),28,.026,7,false),new THREE.MeshBasicMaterial({color:colored[item.id],transparent:true,opacity:.7}));root.add(tube);}
  // Instrument stage, spatial grid and hardware glass shadows.
  const stage=box(root,9,.18,7,dark,.25,-1.82,.65);stage.material=new THREE.MeshStandardMaterial({color:0x102f42,roughness:.48,metalness:.29});
  const rim=new THREE.Mesh(new THREE.TorusGeometry(3.5,.022,8,132),new THREE.MeshBasicMaterial({color:0x2a969d,transparent:true,opacity:.35}));rim.rotation.x=Math.PI/2;rim.position.set(.25,-1.7,.65);root.add(rim);
  let drag=false,downX=0,downY=0,targetY=-.32,rotY=-.32,targetX=.08,rotX=.08,zoom=12,aimZoom=12;
  const ray=new THREE.Raycaster();const mouse=new THREE.Vector2();let moved=false;
  canvas.addEventListener('pointerdown',e=>{drag=true;moved=false;downX=e.clientX;downY=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-downX,dy=e.clientY-downY;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;targetY+=dx*.006;targetX=Math.max(-.42,Math.min(.42,targetX+dy*.004));downX=e.clientX;downY=e.clientY;});
  canvas.addEventListener('pointerup',e=>{drag=false;if(moved)return;const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(activeMeshes,false)[0];if(hit?.object?.userData?.moduleId)choose(hit.object.userData.moduleId);});
  canvas.addEventListener('pointercancel',()=>drag=false);
  canvas.addEventListener('wheel',e=>{e.preventDefault();aimZoom=Math.max(9,Math.min(16,aimZoom+Math.sign(e.deltaY)*.4));},{passive:false});
  onReset=()=>{targetX=.08;targetY=-.32;aimZoom=12;};
  function resize(){const w=container.clientWidth,h=container.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}}const ro=new ResizeObserver(resize);ro.observe(container);resize();
  sceneReady=true;statusEl.textContent='Illustrative 3D architecture · No physical device connected';
  let visible=true;const io=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting||false},{threshold:0});io.observe(container);
  const clock=new THREE.Clock();let last=clock.getElapsedTime();let frame;
  function render(){frame=requestAnimationFrame(render);if(!visible||document.hidden)return;let now=clock.getElapsedTime(),dt=Math.min(.05,now-last);last=now;const blend=1-Math.exp(-6*dt);
   rotY+=(targetY-rotY)*blend;rotX+=(targetX-rotX)*blend;zoom+=(aimZoom-zoom)*blend;
   if(running&&!drag&&!reduced.matches)targetY+=dt*.065;
   root.rotation.set(rotX,rotY,0);
   camera.position.set(zoom*.3,zoom*.34,zoom);camera.lookAt(0,.15,.2);
   Object.entries(modules).forEach(([id,group])=>{const org=group.userData.origin,dir=group.userData.dir;const k=exploded?1.0:0;const target=org.clone().addScaledVector(dir,k);group.position.lerp(target,blend*.9);group.scale.lerp(new THREE.Vector3(1,1,1).multiplyScalar(id===selected?1.09:1),blend*.4);});
   renderer.render(scene,camera);
  }render();
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);ro.disconnect();io.disconnect();renderer.dispose();},{once:true});
 }
 const watch=new IntersectionObserver(entries=>{if(entries.some(x=>x.isIntersecting)){watch.disconnect();setup();}},{rootMargin:'250px 0px',threshold:0});watch.observe(container);
}
