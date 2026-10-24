import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const output = fileURLToPath(new URL(`../../evidence/character-redesign-ac/${process.argv.includes('--final') ? 'final' : 'iteration-02'}`, import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, chromiumSandbox: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1040 }, deviceScaleFactor: 1 });
await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
const page = await context.newPage(), errors = [], requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { requests.push({ url: r.url(), status: r.status() }); });
await page.goto('http://127.0.0.1:4191/art-source/character-redesign-ac/review.html');
await page.waitForFunction(() => window.reviewControl && window.reviewState?.loaded);
await page.evaluate(() => window.reviewControl.setTime(0));
const requestedModel=process.argv.find(a=>a.startsWith('--model='))?.slice(8);
if(requestedModel)await page.evaluate(async file=>{await window.reviewControl.setModel(file);window.reviewControl.setClip('working');window.reviewControl.setCamera('side');window.reviewControl.setTime(.25);},requestedModel);
await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
await page.screenshot({ path: `${output}/first-model.png` });
if (process.argv.includes('--quick')) {
  console.log(await page.evaluate(() => window.reviewState));
} else {
  const manifest = await (await page.request.get('http://127.0.0.1:4191/art-source/character-redesign-ac/models-manifest.json')).json();
  const inputs = await Promise.all(manifest.models.map(async m => ({ file:m.file, sha256:createHash('sha256').update(await readFile(fileURLToPath(new URL(`../../art-source/character-redesign-ac/models/${m.file}`,import.meta.url)))).digest('hex') })));
  if(inputs.some((m,i)=>m.sha256!==manifest.models[i].sha256))throw Error('GLB does not match authoring manifest');
  const samples = [];
  for (const m of manifest.models) {
    for (const [clip, camera, time] of [['rest', 'beauty', 0], ['rest', 'face', 0], ['working', 'side', .25], ['walk', 'beauty', .25], ['stand-up', 'side', .5], ['rest', 'game', 0]]) {
      await page.evaluate(async ({ file, clip, camera, time }) => { await window.reviewControl.setModel(file); window.reviewControl.setClip(clip); window.reviewControl.setCamera(camera); window.reviewControl.setTime(time); }, { file: m.file, clip, camera, time });
      await page.waitForFunction(({ file, clip }) => window.reviewState?.model === file && window.reviewState?.clip === clip, { file: m.file, clip });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const name = `${m.file.replace('.glb', '')}-${clip}-${camera}`;
      await page.locator('canvas').screenshot({ path: `${output}/${name}.png` });
      samples.push({ name, ...await page.evaluate(() => window.reviewState) });
    }
  }
  await page.evaluate(async () => {
    const canvas = document.querySelector('canvas'), stream = canvas.captureStream(24), chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 3500000 });
    window.reviewRecording = { recorder, chunks, stream, startedAt:performance.now() };
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.start();
  });
  const motionProof=[];
  for (const [file, clip, camera] of [['male-trousers.glb','working','beauty'],['male-shorts.glb','walk','beauty'],['female-short-short.glb','working','side'],['female-long-long.glb','walk','beauty'],['female-long-long.glb','stand-up','side'],['female-long-trousers.glb','meeting','beauty']]) {
    await page.evaluate(async ({ file, clip, camera }) => { await window.reviewControl.setModel(file); window.reviewControl.setClip(clip); window.reviewControl.setCamera(camera); window.reviewControl.play(); }, { file, clip, camera });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const before=await page.evaluate(()=>({time:window.reviewState.time,pixels:document.querySelector('canvas').toDataURL()}));
    await page.waitForTimeout(3500);
    const after=await page.evaluate(()=>({time:window.reviewState.time,pixels:document.querySelector('canvas').toDataURL()}));
    const hash=value=>createHash('sha256').update(value).digest('hex');
    motionProof.push({file,clip,beforeTime:before.time,afterTime:after.time,beforePixels:hash(before.pixels),afterPixels:hash(after.pixels)});
  }
  const video = await page.evaluate(async () => {
    const { recorder, chunks, stream, startedAt } = window.reviewRecording;
    await new Promise(resolve => { recorder.onstop = resolve; recorder.stop(); });
    stream.getTracks().forEach(t => t.stop());
    const blob = new Blob(chunks, { type: 'video/webm' });
    const elapsedMs=performance.now()-startedAt;
    return new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve({base64:reader.result.split(',')[1],elapsedMs}); reader.readAsDataURL(blob); });
  });
  await writeFile(`${output}/model-motion-review.webm`, Buffer.from(video.base64, 'base64'));
  const finalInputs=await Promise.all(inputs.map(async m=>({...m,finalSha256:createHash('sha256').update(await readFile(fileURLToPath(new URL(`../../art-source/character-redesign-ac/models/${m.file}`,import.meta.url)))).digest('hex')})));
  const fixedModels=finalInputs.every(m=>m.sha256===m.finalSha256);
  await writeFile(`${output}/browser-receipt.json`, JSON.stringify({ browser: browser.version(), chromiumSandbox: true, scope: 'Isolated GLB authoring viewer, not production game', fixedModels, inputs:finalInputs,videoElapsedMs:video.elapsedMs,motionProof,samples, errors, requests }, null, 2));
  if (!fixedModels || motionProof.some(p=>p.beforePixels===p.afterPixels||p.beforeTime===p.afterTime) || errors.length || samples.some(s => s.webglError !== 0) || requests.some(r => r.status >= 400)) throw Error('Review browser errors, unchanged animation pixels or changed GLB; inspect receipt');
  console.log(`${samples.length} real-GLB canvas samples; video recorded; errors ${errors.length}`);
}
await page.close({runBeforeUnload:false});await context.close();await browser.close();
