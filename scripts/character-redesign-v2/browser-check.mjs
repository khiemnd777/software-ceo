import { chromium, expect } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const output=fileURLToPath(new URL('../../evidence/character-redesign-v2/browser/',import.meta.url));
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
const context=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:1});
const page=await context.newPage(),errors=[],failed=[],external=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()})});
await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname==='127.0.0.1')return route.continue();external.push(url.origin);return route.abort()});
await page.goto('http://127.0.0.1:4191/art-source/character-redesign-v2/review.html');
const loaded=()=>page.waitForFunction(()=>[...document.images].filter(img=>img.loading!=='lazy').every(img=>img.complete&&img.naturalWidth>0));
await loaded();
const samples=[];
const views=[['Toàn thân','beauty'],['Chính diện','front'],['Góc ngang','side'],['Mặt sau','back'],['Cận mặt','heads'],['Clay','clay'],['Clay · ngang','clay-profile'],['Xoay 360°','turntable/frame-00']];
for(const [label,file] of views){
  await page.getByRole('button',{name:label,exact:true}).click();
  await page.waitForFunction(file=>{const img=document.querySelector('#study');return img.src.endsWith(file+'.png')&&img.complete&&img.naturalWidth>0},file);
  await expect(page.getByRole('button',{name:label,exact:true})).toHaveAttribute('aria-pressed','true');
  samples.push({view:label,source:await page.locator('#study').getAttribute('src')});
}
await page.locator('#angle').evaluate(input=>{input.value='6';input.dispatchEvent(new Event('input',{bubbles:true}))});
await expect(page.locator('#degrees')).toHaveText('90°');
await page.waitForFunction(()=>document.querySelector('#study').src.endsWith('frame-06.png')&&document.querySelector('#study').complete);
await page.getByRole('button',{name:'Phát vòng xoay',exact:true}).click();
await page.waitForFunction(()=>!document.querySelector('#study').src.endsWith('frame-06.png'));
await page.getByRole('button',{name:'Tạm dừng',exact:true}).click();
await page.getByRole('button',{name:'Về chính diện',exact:true}).click();
await expect(page.locator('#degrees')).toHaveText('0°');
await page.getByRole('button',{name:'Zoom game 200%',exact:true}).click();await loaded();
await expect(page.locator('#male-native')).toHaveJSProperty('naturalWidth',534);
await page.getByRole('button',{name:'Zoom game 100%',exact:true}).click();await loaded();
const native=await page.locator('#male-native').evaluate(img=>({naturalWidth:img.naturalWidth,displayWidth:img.getBoundingClientRect().width}));
expect(native).toEqual({naturalWidth:267,displayWidth:267});
await page.locator('summary').click();
await page.locator('details img').evaluate(img=>img.decode());
await expect(page.locator('details')).toHaveAttribute('open','');
await page.locator('summary').click();
await page.getByRole('button',{name:'Toàn thân',exact:true}).click();await loaded();
await page.screenshot({path:output+'desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await loaded();
const layout=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,imageVisible:document.querySelector('#study').getBoundingClientRect().width>0}));
expect(layout.documentWidth).toBeLessThanOrEqual(layout.width);
await page.screenshot({path:output+'mobile.png',fullPage:true});
const manifest=JSON.parse(await readFile(fileURLToPath(new URL('../../art-source/character-redesign-v2/manifest.json',import.meta.url)),'utf8'));
for(const model of manifest.models){
 const bytes=await readFile(fileURLToPath(new URL('../../art-source/character-redesign-v2/'+model.file,import.meta.url)));
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(model.sha256);
}
expect(errors).toEqual([]);expect(failed).toEqual([]);expect(external).toEqual([]);
const receipt={browser:await browser.version(),browserSandbox:true,url:page.url(),samples,native,layout,turntable:{scrub90:true,playPause:true,reset:true},referenceCanOpen:true,modelsMatchManifest:true,errors,failed,external,scope:'Gallery of offline real GLB renders; no gameplay or deformation test'};
await writeFile(output+'receipt.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));await browser.close();
