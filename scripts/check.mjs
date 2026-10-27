import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
async function htmlFiles(dir){const items=await readdir(dir,{withFileTypes:true});const files=[];for(const i of items){if(i.name.startsWith('.')||['node_modules','dist','test-results'].includes(i.name))continue;const f=path.join(dir,i.name);if(i.isDirectory())files.push(...await htmlFiles(f));else if(f.endsWith('.html'))files.push(f);}return files;}
const files=await htmlFiles(root);const errors=[];
for(const f of files){const html=await readFile(f,'utf8');if(!/<html lang="zh-CN"/.test(html))errors.push(`${f}: missing language`);if(!/<h1[ >]/.test(html))errors.push(`${f}: missing h1`);if(html.includes('http://example.com'))errors.push(`${f}: placeholder domain`);
  for(const [,url] of html.matchAll(/(?:href|src)="([^"#]+)"/g)){if(/^(https?:|data:|mailto:)/.test(url))continue;const clean=url.split(/[?#]/)[0];let target=path.resolve(url.startsWith('/')?root:path.dirname(f),url.startsWith('/')?'.'+clean:clean);if(clean.endsWith('/'))target=path.join(target,'index.html');if(!await stat(target).catch(()=>null))errors.push(`${path.relative(root,f)}: missing ${url}`);}
}
for(const asset of ['alpine','summit','forest']){if((await stat(path.join(root,'img/wallpapers',asset+'.jpg'))).size<10000)errors.push(`${asset}: invalid image`);}
const adventure=await readFile(path.join(root,'img/wallpapers/adventure.png'));
if(adventure.length<10000 || !adventure.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))errors.push('adventure: invalid PNG');
for(const name of ['mountain-letter','forest-rest']){const wav=await readFile(path.join(root,'audio',name+'.wav'));if(wav.toString('ascii',0,4)!=='RIFF'||wav.length<100000)errors.push(`${name}: invalid audio`);}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;throw new Error('Static site checks failed');}
console.log(`Checked ${files.length} pages: local links, metadata and media passed.`);
