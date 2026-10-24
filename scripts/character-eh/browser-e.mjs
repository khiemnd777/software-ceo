import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const base='http://127.0.0.1:4192';
const url=base+'/art-source/character-eh/review-e.html';
const output=fileURLToPath(new URL('../../evidence/character-eh/browser-e/',import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
try {
  const context=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:1});
  const page=await context.newPage(),errors=[],failed=[],external=[],samples=[],layouts=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
  page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));
  await context.route('**/*',route=>{if(new URL(route.request().url()).origin===base)return route.continue();external.push(route.request().url());return route.abort();});
  await page.goto(url);
  const loaded=()=>page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  await loaded();
  for(const model of ['male','female']){
    await page.locator(`[data-model="${model}"]`).click();
    for(const view of ['three-quarter','front','profile','back','clay','head','game']){
      await page.locator(`[data-view="${view}"]`).click();await loaded();
      await expect(page.locator('#model')).toHaveAttribute('src',`../../evidence/character-eh/${model}-${view}.png`);
      await expect(page.locator(`[data-model="${model}"]`)).toHaveAttribute('aria-pressed','true');
      await expect(page.locator(`[data-view="${view}"]`)).toHaveAttribute('aria-pressed','true');
      if(view==='game'){
        await expect(page.locator('#model')).toHaveJSProperty('naturalWidth',256);
        const width=await page.locator('#model').evaluate(i=>i.getBoundingClientRect().width);expect(width).toBe(267);
      }
      samples.push({model,view,file:`${model}-${view}.png`,imageDecoded:true});
    }
  }
  await page.locator('[data-model="lineup"]').click();await loaded();
  await expect(page.locator('#model')).toHaveAttribute('src','../../evidence/character-eh/lineup-e.png');
  const downloads=[];
  for(const file of ['base-models-e.blend','male-base-e.glb','female-base-e.glb','manifest-e.json']){
    const response=await context.request.get(new URL(file,url).href);expect(response.status()).toBe(200);
    const sha256=hash(await response.body());
    expect(sha256).toBe(hash(await readFile(fileURLToPath(new URL('../../art-source/character-eh/'+file,import.meta.url)))));
    downloads.push({file,sha256,status:200});
  }
  const reference=await context.request.get(base+'/art-source/character-redesign-ac/references/approved-body.png');
  expect(reference.status()).toBe(200);
  expect(hash(await reference.body())).toBe(hash(await readFile(fileURLToPath(new URL('../../art-source/character-redesign-ac/references/approved-body.png',import.meta.url)))));
  const denied=[];
  for(const path of ['/src/main.tsx','/package.json','/scripts/character-eh/prepare-base.py','/art-source/character-eh/','/%2e%2e/package.json']){
    const r=await context.request.get(base+path);expect(r.status()).toBe(404);denied.push({path,status:r.status()});
  }
  for(const [name,viewport] of [['desktop',{width:1440,height:1050}],['mobile',{width:390,height:844}]]){
    await page.setViewportSize(viewport);await loaded();
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const layout=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.width);layouts.push({name,...layout});
    await expect(page.locator('header')).toHaveCount(1);await expect(page.locator('main')).toHaveCount(1);
    await page.screenshot({path:output+name+'.png',fullPage:name==='desktop',animations:'disabled'});
    if(name==='desktop')await page.screenshot({path:output+'desktop-viewport.png'});
    if(name==='mobile'){
      await page.locator('.compare').scrollIntoViewIfNeeded();
      await page.screenshot({path:output+'mobile-comparison.png',animations:'disabled'});
    }
  }
  expect(errors).toEqual([]);expect(failed).toEqual([]);expect(external).toEqual([]);
  const result={url,browser:await browser.version(),browserSandbox:true,samples,lineupLoaded:true,gameNaturalPixels:256,gameDisplayPixelsAtZoom1:267,layouts,downloads,approvedReferenceLoaded:true,denied,errors,failed,external,pass:true,mobileEvidence:'Settled viewport and comparison fold; no full-page screenshot claim for the vh layout',scope:'Static E gallery only; owner visual review, rig, animation and game integration remain separate gates'};
  await writeFile(output+'receipt.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
