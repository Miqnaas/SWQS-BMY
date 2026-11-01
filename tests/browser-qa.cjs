const { chromium }=require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:4173';
const views=[
 {name:'desktop',width:1440,height:900},
 {name:'laptop',width:1024,height:768},
 {name:'tablet',width:768,height:1024},
 {name:'mobile',width:390,height:844},
 {name:'small-mobile',width:320,height:720}
];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
 try{
  for(const v of views){
   const page=await browser.newPage({viewport:{width:v.width,height:v.height},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/',{waitUntil:'domcontentloaded'});
   await page.evaluate(()=>document.fonts.ready);
   await page.locator('#heroInspectorTitle').waitFor({state:'visible'});
   const m=await page.evaluate(()=>{
    const box=sel=>{const r=document.querySelector(sel)?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}:null};
    const style=sel=>getComputedStyle(document.querySelector(sel)).display;
    return {
     width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,
     canvas:document.querySelectorAll('#heroCanvas').length,
     points:document.querySelectorAll('.hero-water-point').length,
     moleculeO:document.querySelectorAll('.swqs-v6-atom.oxygen').length,
     moleculeH:document.querySelectorAll('.swqs-v6-atom.hydrogen').length,
     moleculeDisplay:style('.swqs-molecule-stage'),
     closing:box('.closing-section'),closingCopy:box('.closing-copy'),closingScene:box('.swqs-v6-discover-scene'),
     heroCopy:box('.hero-copy'),heroViewer:box('#heroViewer')
    };
   });
   assert.ok(m.overflow<=3,v.name+': horizontal overflow '+m.overflow);
   assert.equal(m.canvas,1,'WebGL canvas');
   assert.equal(m.points,9,'hotspots');
   assert.equal(m.moleculeO,1,'oxygen');
   assert.equal(m.moleculeH,2,'hydrogen');
   assert.notEqual(m.moleculeDisplay,'none','H2O visible');
   assert.ok(m.closingCopy.w >= (v.width<=380?240:270),v.name+': closing text width '+m.closingCopy.w);
   assert.ok(m.closingScene.w>180,v.name+': closing visual width');
   if(v.width>850){
    assert.ok(m.heroCopy.right<=m.heroViewer.x+45,v.name+': hero desktop layout');
    assert.ok(m.closingCopy.right<=m.closingScene.x+55,v.name+': closing desktop layout');
   }else{
    assert.ok(m.heroCopy.bottom<=m.heroViewer.y+35,v.name+': hero stacked layout');
    assert.ok(m.closingCopy.bottom<=m.closingScene.y+35,v.name+': closing stacked layout');
   }
   await page.locator('[data-water-select="solids"]').click();
   await page.waitForFunction(()=>document.querySelector('#heroInspectorTitle')?.textContent==='Dissolved substances');
   await page.locator('[data-water-select="turbidity"]').click();
   await page.waitForFunction(()=>document.querySelector('#heroInspectorTitle')?.textContent==='Optical clarity');
   if(v.width<=600){
    await page.locator('.nav-toggle').click();
    assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'true','mobile menu');
    await page.locator('.nav-toggle').click();
   }
   // Scroll to each chapter before a full-page screenshot so intersection-based
   // motion is exercised rather than producing blank offscreen sections.
   for(const selector of ['#question','#journey','#science','.model-section','#method-lab','#architecture','#team-story','.closing-section','.end-cta']){
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(130);
   }
   if(v.name==='desktop'||v.name==='mobile'){
    await page.locator('#science').scrollIntoViewIfNeeded();
    await page.waitForTimeout(750);
    await page.locator('#science').screenshot({path:'/tmp/swqs-v6-section03-'+v.name+'.png'});
    await page.locator('.closing-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(750);
    await page.locator('.closing-section').screenshot({path:'/tmp/swqs-v6-section07-'+v.name+'.png'});
   }
   await page.locator('#start').scrollIntoViewIfNeeded();
   await page.waitForTimeout(450);
   await page.screenshot({path:'/tmp/swqs-v6-'+v.name+'.png',fullPage:true});
   console.log('PASS',v.name,JSON.stringify({overflow:m.overflow,canvas:m.canvas,hotspots:m.points,closingWidth:Math.round(m.closingCopy.w),errors}));
   await page.close();
  }
  for(const path of ['research.html','lab.html','paper.html','team.html','experience.html','presentation.html']){
   const p=await browser.newPage({viewport:{width:390,height:844}});
   await p.goto(base+'/'+path,{waitUntil:'domcontentloaded'});
   const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=3,path+' horizontal overflow '+overflow);
   console.log('SUBPAGE PASS',path);
   await p.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});