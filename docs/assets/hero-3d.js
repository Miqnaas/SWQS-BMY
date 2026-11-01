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
const status = {active: 'intro', running: true, drag: false, lastX:0, lastY:0, ry: .12, rx: -.06, toY:.12, toX:-.06, visible:true};
const facts = {
 intro:['01 / WATER MODEL','Clear water, nine measurements','Rotate the transparent water-like droplet. Select a point to explore a dataset feature; the visual is illustrative, not proof of potability.'],
 ph:['02 / pH','Acidity and alkalinity','A calibrated pH probe can measure acidity or alkalinity. A pH reading alone cannot certify drinking-water safety.'],
 hardness:['03 / HARDNESS','Calcium and magnesium','Water hardness reflects dissolved minerals, especially calcium and magnesium. It requires an appropriate measurement.'],
 solids:['04 / SOLIDS','Dissolved substances','The dataset Solids feature is not interchangeable with TDS estimated from a low-cost conductivity sensor.'],
 chloramines:['05 / CHLORAMINES','Disinfection compounds','Chloramines are chlorine-based disinfectants. Their concentration cannot be measured by a generic turbidity probe.'],
 sulfate:['06 / SULFATE','Sulfate concentration','Sulfate ions require a suitable chemical measurement; the proposed low-cost sensor set cannot measure them directly.'],
 conductivity:['07 / CONDUCTIVITY','Electrical conductivity','A conductivity sensor measures how readily water carries current, influenced by dissolved ions.'],
 organic_carbon:['08 / ORGANIC CARBON','Organic carbon content','This indicator quantifies carbon in organic compounds and is not directly available from the proposed low-cost sensor set.'],
 trihalomethanes:['09 / TRIHALOMETHANES','Disinfection by-products','Trihalomethanes require suitable laboratory testing rather than estimation from the visible clarity of water.'],
 turbidity:['10 / TURBIDITY','Optical clarity','A calibrated turbidity sensor measures light scattering. Transparent water can still contain contaminants.']
};
function select(key){status.active=key;const f=facts[key]||facts.intro;tag.textContent=f[0];title.textContent=f[1];explanation.textContent=f[2];document.querySelectorAll('[data-water-feature]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.waterFeature===key)));}
document.querySelectorAll('[data-water-feature]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.waterFeature)));
select('intro');
const pause = document.querySelector('#heroPause');const reset=document.querySelector('#heroReset');
pause.addEventListener('click',()=>{status.running=!status.running;pause.textContent=status.running?'Ⅱ Pause':'▶ Resume';pause.setAttribute('aria-pressed',String(!status.running));});
reset.addEventListener('click',()=>{status.toY=.12;status.toX=-.06;select('intro');});
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches){status.running=false;pause.textContent='▶ Resume';pause.setAttribute('aria-pressed','true');}
const heroObserver=new IntersectionObserver(entries=>{status.visible=entries[0]?.isIntersecting||false;},{threshold:0});heroObserver.observe(host);
async function start(){let THREE;
 try{THREE=await import('https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js')}catch(e){console.info('SWQS hero: 3D CDN unavailable; showing static fallback.');return;}
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});}catch(e){console.info('SWQS hero: WebGL unavailable; showing static fallback.');return;}
 renderer.setClearColor(0xffffff,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.86;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.35));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,.18,8.9);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xf0ffff,0x507c99,1.18));
 const key=new THREE.DirectionalLight(0xf7ffff,2.25);key.position.set(-4,5,6);scene.add(key);
 const fill=new THREE.DirectionalLight(0x42b7d4,1.5);fill.position.set(4,-2,4);scene.add(fill);
 // Procedural softbox reflection environment, no external image download.
 const studio=document.createElement('canvas');studio.width=1024;studio.height=512;const ctx=studio.getContext('2d');
 if(ctx){
  const g=ctx.createLinearGradient(0,0,0,512);g.addColorStop(0,'#edfefe');g.addColorStop(.2,'#2d7088');g.addColorStop(.49,'#8dd7e8');g.addColorStop(.72,'#0d5b7e');g.addColorStop(1,'#defbfe');
  ctx.fillStyle=g;ctx.fillRect(0,0,1024,512);ctx.fillStyle='#ffffff';ctx.fillRect(95,50,175,355);ctx.fillRect(715,55,180,340);
  ctx.fillStyle='#24526a';ctx.fillRect(492,40,25,380);ctx.fillStyle='#ebffff';ctx.fillRect(357,40,14,410);
  const tex=new THREE.CanvasTexture(studio);tex.mapping=THREE.EquirectangularReflectionMapping;
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(tex).texture;
  tex.dispose();pmrem.dispose();
 }
 const model=new THREE.Group();scene.add(model);
 const path=new THREE.SplineCurve([
  new THREE.Vector2(0,-1.85),new THREE.Vector2(.51,-1.80),
  new THREE.Vector2(1.14,-1.44),new THREE.Vector2(1.45,-.74),
  new THREE.Vector2(1.42,-.08),new THREE.Vector2(1.12,.61),
  new THREE.Vector2(.55,1.41),new THREE.Vector2(0,2.13)
 ]);
 const geometry=new THREE.LatheGeometry(path.getPoints(136),128);geometry.computeVertexNormals();
 // Water is optically colourless: glass refraction with IOR close to 1.333,
 // contrasted by subtle reflected studio lights, never a cyan opaque core.
 const shellMat=new THREE.MeshPhysicalMaterial({
  color:0x65bbd3,metalness:0,roughness:.024,transmission:.64,thickness:1.55,
  ior:1.333,clearcoat:1,clearcoatRoughness:.009,envMapIntensity:1.45,side:THREE.FrontSide
 });
 const shell=new THREE.Mesh(geometry,shellMat);model.add(shell);
 // A translucent water-volume shade adds optical depth without making the drop opaque.
 const volumeMaterial=new THREE.MeshBasicMaterial({color:0x1598b9,transparent:true,opacity:.27,
  side:THREE.DoubleSide,depthWrite:false,blending:THREE.NormalBlending});
 const volume=new THREE.Mesh(geometry,volumeMaterial);volume.scale.setScalar(.996);volume.renderOrder=0;model.add(volume);
 // Micro-droplets echo specular highlights; they are decorative, not measured pollutants.
 const dropletMat=new THREE.MeshPhysicalMaterial({color:0xe8ffff,metalness:0,roughness:.035,
  transmission:.67,ior:1.333,thickness:.24,envMapIntensity:1.75,transparent:true,opacity:.73});
 const waterGlints=[];const bubbleGeo=new THREE.SphereGeometry(1,16,12);
 for(let i=0;i<16;i++){
  const a=i*2.39996;const r=.37+(i%4)*.23;
  const g=new THREE.Mesh(bubbleGeo,dropletMat);
  g.position.set(Math.cos(a)*r,(i%7)*.43-1.28,Math.sin(a)*.19+.88);
  g.scale.setScalar(.025+(i%4)*.018);g.renderOrder=3;model.add(g);waterGlints.push(g);
 }

 // Fresnel surface contribution keeps a clear droplet readable on white.
 const edgeMat=new THREE.ShaderMaterial({
  vertexShader:[
   'varying vec3 n; varying vec3 eye;',
   'void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);',
   'n=normalize(normalMatrix*normal);eye=normalize(-mv.xyz);',
   'gl_Position=projectionMatrix*mv;}'
  ].join('\n'),
  fragmentShader:[
   'varying vec3 n; varying vec3 eye;',
   'void main(){float f=pow(1.0-abs(dot(normalize(n),normalize(eye))),2.8);',
   'vec3 tint=mix(vec3(.46,.83,.91),vec3(.06,.31,.45),f);',
   'gl_FragColor=vec4(tint,.14+.74*f);}'
  ].join('\n'),
  transparent:true,depthWrite:false,side:THREE.FrontSide
 });
 const edge=new THREE.Mesh(geometry,edgeMat);edge.renderOrder=1;model.add(edge);
 // Thin softbox highlight arcs, reflecting external light—not a coloured fill.
 const reflections=[];const highlightMaterial=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.45,depthWrite:false});
 for(const pts of [
  [[-.86,.75,.7],[-1.06,.2,.73],[-1.10,-.4,.71],[-.77,-1.12,.81]],
  [[.80,.95,.56],[1.12,.33,.7],[1.20,-.3,.66],[.89,-.91,.8]]
 ]){
  const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));
  const line=new THREE.Mesh(new THREE.TubeGeometry(curve,42,.013,6,false),highlightMaterial.clone());
  line.renderOrder=2;model.add(line);reflections.push(line);
 }
 // Internal caustic filaments: subtle flowing highlights to suggest refracted water
 // while the main mesh remains genuinely rotatable 3D geometry.
 const caustics=[];const streaks=[
  {color:0xf7ffff,opacity:.52,width:.027,pts:[
   [-.14,1.24,.65],[-.38,.83,.91],[.29,.37,1.10],[.46,-.06,1.15],[-.31,-.51,1.12],[-.36,-1.03,.84],[.15,-1.45,.48]]},
  {color:0x98f3f9,opacity:.46,width:.018,pts:[
   [.28,1.16,.66],[.55,.62,.91],[-.18,.17,1.22],[-.46,-.28,1.08],[.21,-.87,.97],[.44,-1.25,.69]]},
  {color:0xffffff,opacity:.28,width:.012,pts:[
   [-.56,.72,.87],[-.06,.26,1.25],[.52,-.25,1.03],[.08,-.72,1.11],[-.09,-1.28,.73]]}
 ];
 for(const line of streaks){
  const curve=new THREE.CatmullRomCurve3(line.pts.map(p=>new THREE.Vector3(...p)));
  const geo=new THREE.TubeGeometry(curve,90,line.width,8,false);
  const mat=new THREE.MeshBasicMaterial({color:line.color,transparent:true,opacity:line.opacity,depthWrite:false,depthTest:false});
  const mesh=new THREE.Mesh(geo,mat);mesh.renderOrder=5;model.add(mesh);caustics.push(mesh);
 }

 // The nine HTML hotspots are positioned by 3D projection each frame.
 const anchorCoords={
  ph:[-.96,.35,.76],hardness:[-.86,-.59,.9],solids:[.91,.37,.81],
  chloramines:[1.10,-.41,.67],sulfate:[-.40,-1.24,.82],
  conductivity:[.46,-1.14,.89],organic_carbon:[-.21,1.08,.70],
  trihalomethanes:[.13,-.07,1.35],turbidity:[.09,-.83,1.24]
 };
 const hotspotNodes=[...document.querySelectorAll('.hero-water-point')].map(el=>({el,p:new THREE.Vector3(...anchorCoords[el.dataset.waterFeature])}));
 const current=new THREE.Vector3();
 const setSize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();model.scale.setScalar(w<450?.76:w<700?.88:.96);};
 new ResizeObserver(setSize).observe(host);setSize();
 let hasMoved=false;
 canvas.addEventListener('pointerdown',e=>{status.drag=true;status.lastX=e.clientX;status.lastY=e.clientY;hasMoved=false;canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!status.drag)return;const dx=e.clientX-status.lastX,dy=e.clientY-status.lastY;if(Math.abs(dx)+Math.abs(dy)>2)hasMoved=true;status.toY+=dx*.007;status.toX=Math.max(-.7,Math.min(.7,status.toX+dy*.004));status.lastX=e.clientX;status.lastY=e.clientY});
 canvas.addEventListener('pointerup',()=>{status.drag=false});canvas.addEventListener('pointercancel',()=>{status.drag=false});
 canvas.addEventListener('click',()=>{if(!hasMoved){const ks=Object.keys(facts).filter(k=>k!=='intro');select(ks[(ks.indexOf(status.active)+1+ks.length)%ks.length]);}});
 const clock=new THREE.Clock();let frame;
 function render(){
  frame=requestAnimationFrame(render);
  if(!status.visible||document.hidden)return;
  const t=clock.getElapsedTime();
  status.ry+=(status.toY-status.ry)*.065;
  status.rx+=(status.toX-status.rx)*.065;
  if(status.running&&!status.drag){status.toY+=.0010;model.position.y=Math.sin(t*.85)*.045;}
  model.rotation.y=status.ry;model.rotation.x=status.rx;
  model.updateMatrixWorld(true);
  for(const item of hotspotNodes){
   current.copy(item.p).applyMatrix4(model.matrixWorld);
   const front=current.z>model.position.z+.06;
   current.project(camera);
   const visible=front&&current.z<1&&Math.abs(current.x)<.95&&Math.abs(current.y)<.94;
   item.el.style.left=((current.x+1)*50).toFixed(2)+'%';
   item.el.style.top=((1-current.y)*50).toFixed(2)+'%';
   item.el.style.opacity=visible?'1':'0';
   item.el.style.pointerEvents=visible?'auto':'none';
  }
  renderer.render(scene,camera);
 }
 fallback.classList.add('hidden');
 host.classList.add('webgl-ready');
 canvas.classList.add('ready');
 render();
 addEventListener('pagehide',()=>{
  cancelAnimationFrame(frame);
  renderer.dispose();geometry.dispose();shellMat.dispose();edgeMat.dispose();volumeMaterial.dispose();dropletMat.dispose();bubbleGeo.dispose();
  reflections.forEach(line=>{line.geometry.dispose();line.material.dispose()});caustics.forEach(line=>{line.geometry.dispose();line.material.dispose()});
 },{once:true});
}
start();
