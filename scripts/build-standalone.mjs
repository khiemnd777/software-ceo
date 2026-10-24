import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'..'),dist=join(root,'dist');
const original=readFileSync(join(dist,'index.html'),'utf8');
const jsPath=original.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)?.[1];
const cssPath=original.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)?.[1];
if(!jsPath||!cssPath)throw Error('Run npm run build first.');
const themeColor=original.match(/<meta name="theme-color" content="([^"]+)"/)?.[1];
if(!themeColor)throw Error('Production build is missing theme-color.');
const resources={};const types={'.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg'};
function collect(dir,prefix=''){for(const file of readdirSync(dir,{withFileTypes:true})){const rel=prefix+file.name;if(file.isDirectory())collect(join(dir,file.name),rel+'/');else{const ext=file.name.slice(file.name.lastIndexOf('.'));if(types[ext])resources[rel]=`data:${types[ext]};base64,${readFileSync(join(dir,file.name)).toString('base64')}`}}}
collect(join(root,'public/assets'));
const js=readFileSync(resolve(dist,jsPath),'utf8').replace(/\/\/# sourceMappingURL=.*$/m,'').replaceAll('</script','<\\/script');
const css=readFileSync(resolve(dist,cssPath),'utf8');
const html=`<!doctype html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="${themeColor}"><title>Software CEO — Local Game</title><style>${css}</style></head><body><div id="root"></div><script>globalThis.__SOFTWARE_CEO_ASSETS__=${JSON.stringify(resources)};</script><script type="module">${js}</script></body></html>`;
writeFileSync(join(root,'PLAY_SOFTWARE_CEO.html'),html);console.log(`Standalone game: ${Buffer.byteLength(html)} bytes, ${Object.keys(resources).length} embedded assets, no external resource dependencies.`);
