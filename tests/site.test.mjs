import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:'4317'},windowsHide:true,stdio:['ignore','pipe','pipe']});
server.stderr.on('data',b=>process.stderr.write(b));
await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Test server exited');})]);
after(()=>server.kill());
const base='http://127.0.0.1:4317';
test('all existing and new routes return readable pages',async()=>{
  for(const route of ['/','/blog/','/archives/','/archives/2025/','/archives/2025/10/','/2025/10/27/hello-world/','/about/','/credits/']){
    const r=await fetch(base+route);assert.equal(r.status,200,route);assert.match(await r.text(),/<h1[ >]/);
  }
});
test('original article body is byte-identical after line-ending normalization',async()=>{
  const html=await readFile(new URL('../2025/10/27/hello-world/index.html',import.meta.url),'utf8');
  const body=html.match(/<article[^>]*id="article-container"[\s\S]*?<\/article>/)[0].replace(/\r\n/g,'\n');
  const expected=(await readFile(new URL('./article-body.sha256',import.meta.url),'utf8')).trim();
  assert.equal(createHash('sha256').update(body).digest('hex'),expected);
});
test('the entrance reaches real article content in the same document',async()=>{
  const home=await(await fetch(base+'/')).text();
  assert.match(home,/<a class="enter-button" href="#journal">/);
  assert.equal((home.match(/id="journal"/g)||[]).length,1);
  assert.equal((home.match(/class="hero-image home-backdrop"/g)||[]).length,1,'the entrance and reading area share one backdrop');
  const section=home.slice(home.indexOf('<!-- home-journal:start -->'));
  assert.doesNotMatch(section,/class="blog-banner"/,'the landing image must lead straight into the article list');
  assert.match(section,/class="article-card" href="\/2025\/10\/27\/hello-world\/"/);
  assert.match(section,/id="article-search"/);
  assert.equal((home.match(/id="site-header"/g)||[]).length,1);
});
test('local music supports partial reads needed for seeking',async()=>{
  for(const name of ['mountain-letter','forest-rest']){
    const r=await fetch(`${base}/audio/${name}.wav`,{headers:{Range:'bytes=0-43'}});assert.equal(r.status,206);assert.match(r.headers.get('content-range'),/^bytes 0-43\//);const b=Buffer.from(await r.arrayBuffer());assert.equal(b.length,44);assert.equal(b.toString('ascii',0,4),'RIFF');
  }
  const bad=await fetch(`${base}/audio/mountain-letter.wav`,{headers:{Range:'bytes=999999999-'}});assert.equal(bad.status,416);
});
test('not-found routes return the custom 404 and directory redirects keep queries',async()=>{
  const r=await fetch(base+'/a-missing-page/');assert.equal(r.status,404);assert.match(await r.text(),/走到了一条小路/);
  const redirect=await fetch(base+'/archives?year=2025',{redirect:'manual'});assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),'/archives/?year=2025');
});
test('preview cannot expose hidden repository files or tooling',async()=>{
  for(const route of ['/.git/config','/node_modules/playwright/package.json','/scripts/serve.mjs','/tests/site.test.mjs']){assert.equal((await fetch(base+route)).status,403,route);}
});
test('site runtime uses only local CSS, JS and media',async()=>{
  const html=await (await fetch(base)).text();assert.doesNotMatch(html,/<(?:script|img)[^>]*src="https?:/);assert.doesNotMatch(html,/<link[^>]*rel="(?:stylesheet|preload|icon)"[^>]*href="https?:/);
  const js=await readFile(new URL('../js/journal.js',import.meta.url),'utf8');assert.doesNotMatch(js,/https?:\/\/(?:cdn|api)\./);
});
