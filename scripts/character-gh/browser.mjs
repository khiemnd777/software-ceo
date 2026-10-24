import { chromium, expect } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { decodeSave, encodeSave } from '../../src/persistence/saves.ts';
import { APPEARANCE_IDS } from '../../src/characters/catalog.ts';

const root=fileURLToPath(new URL('../../',import.meta.url));
const out=root+'evidence/character-gh/browser';await mkdir(out,{recursive:true});
const base='http://127.0.0.1:4194';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const runtime=JSON.parse(await readFile(root+'public/assets/characters/manifest.json','utf8'));
const legacyText=await readFile(root+'tests/fixtures/character-legacy-v2.json','utf8');
const fixture=await decodeSave(await readFile(root+'evidence/fixtures/office-12-profile.json','utf8'));
expect(fixture.employees.length).toBe(12);
fixture.employees.forEach((person,i)=>person.appearance=APPEARANCE_IDS[i%APPEARANCE_IDS.length]);
const fixturePath=root+'evidence/character-gh/office-12-all-appearances.json';
await writeFile(fixturePath,await encodeSave(fixture));

const browser=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  await context.addInitScript(()=>{
    window.__characterDraws=[];
    const original=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(image,...values){
      Reflect.apply(original,this,[image,...values]);
      if(this.canvas.isConnected && image instanceof HTMLImageElement && image.src.includes('/assets/characters/') && values.length===8){
        const [sx,sy,sw,sh,x,y,w,h]=values;
        const point=new DOMPoint(x+w*.5,y+h*.25).matrixTransform(this.getTransform());
        const bounds=this.canvas.getBoundingClientRect();
        window.__characterDraws.push({file:image.src.split('/').at(-1),rect:[sx,sy,sw,sh],
          point:{x:bounds.left+point.x/this.canvas.width*bounds.width,y:bounds.top+point.y/this.canvas.height*bounds.height}});
        if(window.__characterDraws.length>2400)window.__characterDraws.splice(0,1200);
      }
    };
  });
  const page=await context.newPage(),errors=[],failed=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  page.on('requestfailed',r=>failed.push(r.url()));
  await context.route('**/*',route=>{
    if(new URL(route.request().url()).origin===base)return route.continue();
    external.push(route.request().url());return route.abort();
  });
  await page.goto(base);
  await page.waitForFunction(()=>new Set(window.__characterDraws.map(r=>r.file)).size===2);
  const menuFiles=await page.evaluate(()=>[...new Set(window.__characterDraws.map(r=>r.file))].sort());
  expect(menuFiles).toEqual(['female-trousers-short.webp','male-trousers.webp']);
  await page.getByRole('button',{name:'Bắt đầu công ty mới'}).click();
  await page.getByRole('button',{name:'Mở cửa công ty'}).click();
  async function load(path){
    await page.getByRole('button',{name:'Lưu và tải',exact:true}).click();
    await page.locator('input[type=file]').setInputFiles(path);
    await expect(page.locator('.save-message')).toContainText('Đã phục hồi bản lưu');
    await page.getByRole('button',{name:'Đóng cửa sổ lưu'}).click();
  }
  async function exported(name){
    await page.getByRole('button',{name:'Lưu và tải',exact:true}).click();
    const download=page.waitForEvent('download');
    await page.getByRole('button',{name:'Xuất JSON',exact:true}).click();
    const path=out+'/'+name;await(await download).saveAs(path);
    await page.getByRole('button',{name:'Đóng cửa sổ lưu'}).click();
    return decodeSave(await readFile(path,'utf8'));
  }
  const pixels=()=>page.locator('canvas').evaluate(canvas=>canvas.toDataURL());
  await load(root+'tests/fixtures/character-legacy-v2.json');
  const afterLegacy=await exported('legacy-after.json');
  expect(afterLegacy).toEqual(JSON.parse(legacyText).state);
  expect(afterLegacy.employees.every(person=>person.appearance===undefined)).toBe(true);
  await page.screenshot({path:out+'/legacy-office.png'});
  await page.evaluate(()=>window.__characterDraws.length=0);
  await load(fixturePath);
  await page.waitForFunction(()=>new Set(window.__characterDraws.map(r=>r.file)).size===8);
  await page.getByRole('button',{name:'Tạm dừng',exact:true}).click();
  const toggle=page.getByRole('button',{name:'Thu gọn hoặc mở hướng dẫn'});
  if(await toggle.count())await toggle.click();
  const files=await page.evaluate(()=>[...new Set(window.__characterDraws.map(r=>r.file))].sort());
  expect(files).toEqual(APPEARANCE_IDS.map(id=>id+'.webp').sort());
  const actual=await exported('all-appearances-after.json');expect(actual).toEqual(fixture);
  await page.waitForTimeout(300);const paused=await pixels();await page.waitForTimeout(500);
  expect(await pixels()).toBe(paused);
  const layouts=[];
  for(const viewport of [{width:1280,height:720},{width:1920,height:1080}]){
    await page.setViewportSize(viewport);await page.waitForTimeout(250);
    await page.screenshot({path:out+`/office-${viewport.width}.png`});
    const measure=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      canvasWidth:document.querySelector('canvas').width,canvasHeight:document.querySelector('canvas').height}));
    expect(measure.scrollWidth).toBeLessThanOrEqual(viewport.width);layouts.push({...viewport,...measure});
  }
  await page.getByRole('button',{name:'1×',exact:true}).click();
  const moving=await pixels();await page.waitForTimeout(450);
  expect(await pixels()).not.toBe(moving);
  await page.getByRole('button',{name:'Cài đặt',exact:true}).click();
  await page.getByLabel('Giảm chuyển động').check();
  await page.getByRole('button',{name:'Đóng',exact:true}).click();
  await page.waitForTimeout(250);const reduced=await pixels();await page.waitForTimeout(600);
  expect(await pixels()).toBe(reduced);
  await page.getByRole('button',{name:'Cài đặt',exact:true}).click();
  await page.getByLabel('Giảm chuyển động').uncheck();
  await page.getByRole('button',{name:'Đóng',exact:true}).click();
  await page.getByRole('button',{name:'Tạm dừng',exact:true}).click();
  await page.waitForTimeout(100);
  const point=await page.evaluate(()=>window.__characterDraws.at(-1).point);
  await page.mouse.click(point.x,point.y);
  await expect(page.locator('.management-shell')).toBeVisible();
  await page.screenshot({path:out+'/canvas-person-selected.png'});
  const downloads=[];
  for(const id of APPEARANCE_IDS){
    const file=runtime.models[id].file;const response=await context.request.get(base+'/assets/'+file);
    expect(response.status()).toBe(200);const sha256=hash(await response.body());
    expect(sha256).toBe(hash(await readFile(root+'public/assets/'+file)));downloads.push({id,file,sha256});
  }
  expect(errors).toEqual([]);expect(failed).toEqual([]);expect(external).toEqual([]);
  const receipt={pass:true,browser:await browser.version(),chromiumSandbox:true,base,
    menuFiles,actualCanvasFiles:files,allEightActualCanvasAtlases:true,legacyStateUnchanged:true,newMetadataRoundTrip:true,
    pausedCanvasStable:true,reducedMotionCanvasStable:true,unpausedCanvasChanges:true,
    canvasHitTestOpensPeople:true,layouts,downloads,pageErrors:errors,failedRequests:failed,externalRequests:external,
    limits:['Synthetic test storage only','Chrome on this host; native Safari and owner art/runtime acceptance remain open']};
  await writeFile(out+'/receipt.json',JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({pass:true,models:files.length,legacyStateUnchanged:true,layouts:layouts.length,errors:errors.length}));
} finally {await browser.close();}
