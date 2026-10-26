import {expect} from '@playwright/test';import {launchBrowser} from './browser-runtime.mjs';import {writeFileSync} from 'node:fs';
const browser=await launchBrowser();
const results=[];
for(const strategy of ['outsourcing','product','startup']){
 const context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:strategy==='product'?2:1});
 await context.addInitScript(()=>{window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push({directive:e.violatedDirective,blockedURI:e.blockedURI}));});
 const page=await context.newPage(),errors=[],network=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>network.push(r.url()));
 const response=await page.goto('http://127.0.0.1:4174/');const headers=response.headers();expect(headers['content-security-policy']).toContain("script-src 'self'");expect(headers['x-content-type-options']).toBe('nosniff');
 await page.getByRole('button',{name:'Bắt đầu công ty mới'}).click();await page.getByLabel('Tên công ty').fill('<img src=x onerror=alert(1)>');await page.getByLabel('Chiến lược',{exact:true}).selectOption(strategy);await page.getByRole('button',{name:'Mở cửa công ty'}).click();await expect(page.locator('.company-bar strong')).toHaveText('<img src=x onerror=alert(1)>');await expect(page.locator('.company-bar img')).toHaveCount(0);
 await page.waitForTimeout(1500);await expect(page.locator('.canvas-error')).toHaveCount(0);
 const canvas=await page.locator('canvas').evaluate(c=>({width:c.width,height:c.height,cssWidth:c.getBoundingClientRect().width,cssHeight:c.getBoundingClientRect().height,dpr:devicePixelRatio}));expect(Math.abs(canvas.width/canvas.cssWidth-Math.min(canvas.dpr,2))).toBeLessThan(.01);
 await page.getByRole('button',{name:'Cài đặt',exact:true}).click();await page.getByLabel('Nhạc nền').check();await page.getByRole('button',{name:'Đóng',exact:true}).click();
 for(let i=0;i<7;i++)await page.getByRole('button',{name:'Qua ngày'}).click();await page.getByRole('button',{name:'Lưu và tải',exact:true}).click();await page.locator('.save-slot').first().getByRole('button',{name:'Lưu',exact:true}).click();await expect(page.getByRole('status')).toContainText('Đã lưu');
 const violations=await page.evaluate(()=>window.__csp);expect(violations).toEqual([]);expect(errors).toEqual([]);expect(network.filter(u=>!u.startsWith('http://127.0.0.1:4174/'))).toEqual([]);
 results.push({strategy,headers,canvas,violations,errors,externalRequests:[],nameEscaped:true,saveWorked:true});await context.close();
}
writeFileSync('evidence/security-smoke.json',JSON.stringify({result:'PASS',browser:browser.version(),scope:'Local HTTP static server only. All three starts, malicious-looking company name rendered as text, CSP, first scene, audio gesture, 7 days, IndexedDB. DPR2 checked on Product. No external release or HTTPS hosting claim.',results},null,2));await browser.close();console.log('LOCAL STATIC SECURITY SMOKE PASS');
