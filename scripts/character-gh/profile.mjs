import { chromium, expect } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import os from 'node:os';
import { decodeSave, encodeSave } from '../../src/persistence/saves.ts';
import { transition } from '../../src/simulation/engine.ts';

const root=fileURLToPath(new URL('../../',import.meta.url)),out=root+'evidence/character-gh/profile';
await mkdir(out,{recursive:true});const base='http://127.0.0.1:4194';
const fixed=JSON.parse(await readFile(root+'evidence/character-gh/dist-manifest.json','utf8'));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
async function fixedBuild(){for(const [file,sha] of Object.entries(fixed))expect(digest(await readFile(root+'dist/'+file))).toBe(sha)}
await fixedBuild();
let state=await decodeSave(await readFile(root+'evidence/character-gh/office-12-all-appearances.json','utf8'));
const trace=[];
for(const person of state.employees){const command={type:'unassign',employeeId:person.id};const next=transition(state,command);expect(next.ok).toBe(true);state=next.state;trace.push(command)}
const fixture=out+'/walking-fixture.json';await writeFile(fixture,await encodeSave(state));
await writeFile(out+'/public-command-trace.json',JSON.stringify(trace,null,2)+'\n');
const runtime=JSON.parse(await readFile(root+'public/assets/characters/manifest.json','utf8'));
const keys={};for(const [id,model] of Object.entries(runtime.models))for(const [track,frames] of Object.entries(model.tracks))for(const frame of frames)keys[id+'.webp/'+frame.rect.join(',')]=track;
const browser=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
try {
 const context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1});
 await context.addInitScript(keys=>{
  window.__visiblePaints=0;window.__drawnCharacterTracks=new Set();
  const original=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(image,...values){
   Reflect.apply(original,this,[image,...values]);
   if(this.canvas.isConnected && image instanceof HTMLCanvasElement)window.__visiblePaints++;
   if(this.canvas.isConnected && image instanceof HTMLImageElement && image.src.includes('/assets/characters/') && values.length===8){
    const track=keys[image.src.split('/').at(-1)+'/'+values.slice(0,4).join(',')];
    if(track)window.__drawnCharacterTracks.add(track);
   }
  };
 },keys);
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url())});
 await page.goto(base);await page.getByRole('button',{name:'Bắt đầu công ty mới'}).click();await page.getByRole('button',{name:'Mở cửa công ty'}).click();
 await page.getByRole('button',{name:'Lưu và tải',exact:true}).click();await page.locator('input[type=file]').setInputFiles(fixture);
 await expect(page.locator('.save-message')).toContainText('Đã phục hồi bản lưu');await page.getByRole('button',{name:'Đóng cửa sổ lưu'}).click();
 await page.getByRole('button',{name:'Thu gọn hoặc mở hướng dẫn'}).click();await page.getByRole('button',{name:'1×',exact:true}).click();
 await page.waitForTimeout(1200);
 const samples=[];
 for(const viewport of [{width:1280,height:720},{width:1920,height:1080},{width:1280,height:720},{width:1920,height:1080}]){
  await page.setViewportSize(viewport);await page.waitForTimeout(350);
  const sample=await page.evaluate(()=>new Promise(resolve=>{
   const intervals=[];let start,last;const paints=window.__visiblePaints;
   function tick(now){if(start===undefined){start=last=now;requestAnimationFrame(tick);return}intervals.push(now-last);last=now;
    if(now-start<10000){requestAnimationFrame(tick);return}const ordered=[...intervals].sort((a,b)=>a-b);
    resolve({durationMs:now-start,frames:intervals.length,rafFps:intervals.length/(now-start)*1000,
     p50Ms:ordered[Math.floor(ordered.length*.5)],p95Ms:ordered[Math.floor(ordered.length*.95)],p99Ms:ordered[Math.floor(ordered.length*.99)],
     visibleCanvasPaints:window.__visiblePaints-paints,dpr:devicePixelRatio})}
   requestAnimationFrame(tick);
  }));
  expect(sample.durationMs).toBeGreaterThanOrEqual(10000);expect(sample.visibleCanvasPaints).toBeGreaterThan(40);
  expect(sample.rafFps).toBeGreaterThanOrEqual(50);expect(sample.p95Ms).toBeLessThanOrEqual(33.4);
  samples.push({viewport,...sample});await page.screenshot({path:out+`/sample-${samples.length}-${viewport.width}.png`});
  await writeFile(out+'/progress.json',JSON.stringify(samples,null,2)+'\n');
 }
 const drawnTracks=await page.evaluate(()=>[...window.__drawnCharacterTracks]);
 for(const track of ['stand','turnRight','walkRight','turnLeft','walkLeft'])expect(drawnTracks).toContain(track);
 const box=await page.locator('canvas').boundingBox();const paintsBefore=await page.evaluate(()=>window.__visiblePaints);
 await page.mouse.move(box.x+box.width*.5,box.y+box.height*.65);await page.mouse.down();
 for(let i=0;i<60;i++){await page.mouse.move(box.x+box.width*.5+Math.sin(i/10)*35,box.y+box.height*.65+Math.cos(i/10)*15);await page.waitForTimeout(16)}
 await page.mouse.up();expect(await page.evaluate(()=>window.__visiblePaints)).toBeGreaterThan(paintsBefore+10);
 await page.locator('canvas').focus();await page.keyboard.press('0');
 const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
 async function metrics(){await cdp.send('HeapProfiler.collectGarbage');const m=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));return {heap:m.JSHeapUsedSize,nodes:m.Nodes,listeners:m.JSEventListeners}}
 async function views(){for(const name of ['Công việc','Nhân sự','Tài chính','Văn phòng'])await page.locator('footer').getByRole('button',{name,exact:true}).click()}
 await views();await views();const before=await metrics();for(let i=0;i<8;i++)await views();const after=await metrics();
 expect(after.heap-before.heap).toBeLessThan(8*1024*1024);expect(after.listeners-before.listeners).toBeLessThan(100);
 const browserCDP=await browser.newBrowserCDPSession();let gpu;
 try{const info=await browserCDP.send('SystemInfo.getInfo');gpu={devices:info.gpu.devices.map(d=>({vendor:d.vendorString,device:d.deviceString})),renderer:info.gpu.auxAttributes?.glRenderer}}catch(error){gpu={unavailable:String(error)}}
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/assets/characters/')).map(r=>({file:r.name.split('/').at(-1),transferSize:r.transferSize,encodedBodySize:r.encodedBodySize})));
 await fixedBuild();expect(errors).toEqual([]);
 const result={pass:true,browser:await browser.version(),chromiumSandbox:true,host:{platform:os.platform(),arch:os.arch(),cpu:os.cpus()[0].model},gpu,
  fixedDistFiles:Object.keys(fixed).length,staff:12,appearanceModels:8,authoredSpriteFps:8,samples,actualCanvasTracks:drawnTracks,
  cameraPanRepainted:true,postGC:{before,after,growthBytes:after.heap-before.heap},resources,errors,
  limits:['rAF frequency and visible Canvas paints are separate from 8 authored sprite poses per second','JS heap excludes decoded image/GPU memory','Four 10-second samples on this host, not a soak or acceptance on every browser/device']};
 await writeFile(out+'/receipt.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({pass:true,samples:samples.length,fps:samples.map(s=>s.rafFps),p95:samples.map(s=>s.p95Ms),tracks:drawnTracks,heapGrowthBytes:after.heap-before.heap}));
}finally{await browser.close()}
