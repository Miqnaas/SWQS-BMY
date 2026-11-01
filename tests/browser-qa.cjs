const { chromium } = require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:4173';
const viewports=[
 {name:'desktop',width:1440,height:900},
 {name:'tablet',width:768,height:1024},
 {name:'mobile',width:390,height:844},
 {name:'small-mobile',width:320,height:720}
];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const v of viewports){
   const page=await browser.newPage({viewport:{width:v.width,height:v.height},deviceScaleFactor:1});
   const jsErrors=[];page.on('pageerror',e=>jsErrors.push(e.message));
   let threeRequested=false;
   page.on('request',r=>{if(/three(?:\.module)?\.js|cdn\.jsdelivr\.net\/npm\/three/i.test(r.url()))threeRequested=true;});
   await page.goto(base+'/',{waitUntil:'domcontentloaded'});
   await page.locator('.hero-still-image').waitFor({state:'visible'});
   await page.evaluate(()=>document.fonts.ready);
   const result=await page.evaluate(()=>({
    overflow:Math.round(document.documentElement.scrollWidth-innerWidth),
    pictureLoaded:!!document.querySelector('.hero-still-image')?.naturalWidth,
    canvas:document.querySelectorAll('#heroCanvas').length,
    title:document.querySelector('.hero-copy h1')?.getBoundingClientRect().toJSON(),
    image:document.querySelector('.hero-still-frame')?.getBoundingClientRect().toJSON(),
    inspector:document.querySelector('#heroInspector')?.getBoundingClientRect().toJSON(),
    buttons:document.querySelectorAll('.hero-water-point').length
   }));
   assert.equal(result.buttons,9,'nine real feature hotspots');
   assert.ok(result.pictureLoaded,'water image loads');
   assert.equal(result.canvas,0,'no homepage WebGL');
   assert.ok(result.overflow<=3,'no mobile/desktop horizontal scroll: '+v.name+' '+result.overflow);
   assert.equal(threeRequested,false,'heavy Three.js is deferred: '+v.name);
   if(v.width>=921)assert.ok(result.title.right<=result.image.left+14,'headline/image separation: '+v.name);
   else assert.ok(result.title.bottom<=result.image.top+16,'stacked title/image separation: '+v.name);
   await page.locator('[data-water-feature=solids]').click();
   assert.equal(await page.locator('#heroInspectorTitle').innerText(),'Solids');
   await page.locator('[data-water-feature=turbidity]').click();
   assert.equal(await page.locator('#heroInspectorTitle').innerText(),'Turbidity');
   if(v.width<=600){await page.locator('.nav-toggle').click();assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'true')}
   await page.screenshot({path:'/tmp/swqs-'+v.name+'.png',fullPage:true});
   console.log('PASS',v.name,JSON.stringify({overflow:result.overflow,image:result.pictureLoaded,hotspots:result.buttons,threeAboveFold:threeRequested,jsErrors}));
   await page.close();
  }
  for(const path of ['research.html','lab.html','paper.html','team.html','experience.html','presentation.html']){
   const page=await browser.newPage({viewport:{width:390,height:844}});
   await page.goto(base+'/'+path,{waitUntil:'domcontentloaded'});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   console.log('SUBPAGE',path,'mobile overflow',overflow);
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});