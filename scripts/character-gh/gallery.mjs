import { chromium, expect } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root=fileURLToPath(new URL('../../',import.meta.url));
const out=root+'evidence/character-gh/gallery';await mkdir(out,{recursive:true});
const base='http://127.0.0.1:4195';
const models=JSON.parse(await readFile(root+'art-source/character-gh/manifest-g.json','utf8')).models;
const runtime=JSON.parse(await readFile(root+'public/assets/characters/manifest.json','utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const browser=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
try {
  const context=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:1});
  const page=await context.newPage(),errors=[],failed=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)failed.push(response.url());});
  page.on('requestfailed',request=>failed.push(request.url()));
  await context.route('**/*',route=>{
    if(new URL(route.request().url()).origin===base)return route.continue();
    external.push(route.request().url());return route.abort();
  });
  await page.goto(base+'/art-source/character-gh/review.html');
  await page.waitForFunction(()=>document.body.dataset.ready==='true');
  await expect(page.locator('.card')).toHaveCount(8);
  await expect(page.getByRole('link',{name:'Mở game LOCAL ↗'})).toHaveAttribute('href','http://127.0.0.1:4194/');
  await page.screenshot({path:out+'/desktop.png'});
  const views=[],sprites=[],downloads=[];
  for(const model of models){
    const opener=page.locator(`[data-open-model="${model.id}"]`);
    await opener.click();
    await expect(page.locator('#detail')).toBeVisible();
    for(const view of ['front','back','seated','walk']){
      await page.locator(`button[data-view="${view}"]`).click();
      const image=await page.locator('#model-image').evaluate(async element=>{
        await element.decode();return {width:element.naturalWidth,height:element.naturalHeight,src:element.src};
      });
      expect(image.width).toBeGreaterThanOrEqual(650);expect(image.height).toBeGreaterThanOrEqual(650);
      const response=await context.request.get(image.src);
      expect(response.ok()).toBe(true);
      expect(hash(await response.body())).toBe(hash(await readFile(root+`evidence/character-gh/studies/${model.id}-${view}.png`)));
      views.push({model:model.id,view,...image});
    }
    await page.locator('button[data-mode="sprite"]').click();
    await page.waitForFunction(()=>document.body.dataset.spriteReady==='true');
    for(const track of Object.keys(runtime.models[model.id].tracks)){
      await page.locator('#track').selectOption(track);
      const frames=[];
      for(const frame of [0,8,15]){
        await page.locator('#frame').fill(String(frame));
        await page.waitForFunction(value=>document.body.dataset.frame===String(value),frame);
        const pixels=await page.locator('#sprite').evaluate(canvas=>{
          const rgba=canvas.getContext('2d').getImageData(0,0,192,192).data;
          let alphaPixels=0;for(let i=3;i<rgba.length;i+=4)if(rgba[i])alphaPixels++;
          return {data:canvas.toDataURL(),alphaPixels};
        });
        expect(pixels.alphaPixels).toBeGreaterThan(500);
        frames.push({frame,sha256:hash(pixels.data),alphaPixels:pixels.alphaPixels});
      }
      expect(new Set(frames.map(frame=>frame.sha256)).size).toBeGreaterThan(1);
      sprites.push({model:model.id,track,frames});
    }
    await page.locator('#track').selectOption('walkRight');
    await page.locator('#frame').fill('0');
    await page.locator('#play').click();
    await page.waitForFunction(()=>Number(document.body.dataset.frame)>=2);
    await page.locator('#play').click();
    const paused=await page.locator('#sprite').evaluate(canvas=>canvas.toDataURL());
    await page.waitForTimeout(180);
    expect(await page.locator('#sprite').evaluate(canvas=>canvas.toDataURL())).toBe(paused);
    if(model.id==='male-trousers'){
      await page.screenshot({path:out+'/sprite-desktop.png'});
      await page.locator('#track').selectOption('stand');
      await page.locator('#play').click();
      await page.waitForFunction(()=>document.body.dataset.frame==='15'&&document.body.dataset.playing==='false');
    }
    if(['male-trousers','female-skirt-long-long'].includes(model.id)){
      const event=page.waitForEvent('download');await page.locator('#glb').click();
      const download=await event;
      expect(download.suggestedFilename()).toBe(model.glb);
      const path=out+'/'+model.glb;await download.saveAs(path);
      expect(hash(await readFile(path))).toBe(hash(await readFile(root+'art-source/character-gh/'+model.glb)));
      downloads.push({model:model.id,file:model.glb,sha256:hash(await readFile(path))});
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('#detail')).not.toBeVisible();
    await expect(opener).toBeFocused();
  }
  const layouts=[];
  for(const viewport of [{width:1440,height:1050},{width:390,height:844}]){
    await page.setViewportSize(viewport);await page.evaluate(()=>scrollTo(0,0));
    const measure=async()=>page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,
      dialogWidth:document.querySelector('#detail').scrollWidth,dialogClient:document.querySelector('#detail').clientWidth}));
    expect((await measure()).documentWidth).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({path:out+`/gallery-${viewport.width}.png`});
    await page.locator('[data-open-model="female-skirt-long-long"]').click();
    await page.locator('#model-image').evaluate(image=>image.decode());
    expect((await measure()).dialogWidth).toBeLessThanOrEqual((await measure()).dialogClient+1);
    await page.screenshot({path:out+`/model-${viewport.width}.png`});
    await page.locator('button[data-mode="sprite"]').click();
    await page.waitForFunction(()=>document.body.dataset.spriteReady==='true');
    expect((await measure()).dialogWidth).toBeLessThanOrEqual((await measure()).dialogClient+1);
    await page.screenshot({path:out+`/sprite-${viewport.width}.png`});
    layouts.push({...viewport,...await measure()});
    await page.locator('#close').click();
  }
  const denied=[];
  for(const path of ['/PROJECT_STATE.md','/src/renderer/Office.tsx','/../PROJECT_STATE.md','/art-source/character-gh/','/public/assets/manifest.json']){
    const response=await context.request.get(base+path);expect(response.status()).toBe(404);denied.push(path);
  }
  expect(errors).toEqual([]);expect(failed).toEqual([]);expect(external).toEqual([]);
  const receipt={pass:true,browser:browser.version(),chromiumSandbox:true,models:models.length,
    imageViews:views,spriteTracks:sprites,playPauseScrub:true,standStopsAtEnd:true,escapeFocusReturn:true,
    downloads,layouts,denied,errors,failed,external,limits:['Rendered GLB views and true shipping sprite playback; no live editable 3D viewport or human art acceptance']};
  await writeFile(out+'/receipt.json',JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({pass:true,models:models.length,views:views.length,spriteTracks:sprites.length,layouts:layouts.length}));
} catch(error){
  await writeFile(out+'/failure.txt',String(error.stack??error)+'\n');throw error;
} finally {await browser.close();}
