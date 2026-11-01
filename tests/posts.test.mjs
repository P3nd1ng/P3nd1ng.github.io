import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,mkdir,readFile,writeFile,rm,unlink} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {generatePosts} from '../scripts/generate-posts.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
test('Markdown articles generate the page, homepage, archives, and sitemap without changing the legacy article',async()=>{
  const tmp=await mkdtemp(path.join(os.tmpdir(),'journal-post-test-'));
  try {
    const source=path.join(tmp,'source'),out=path.join(tmp,'out');
    await mkdir(path.join(source,'articles'),{recursive:true});await mkdir(out,{recursive:true});
    for(const name of ['2025','archives','blog','index.html','sitemap.xml'])await cp(path.join(root,name),path.join(out,name),{recursive:true});
    await writeFile(path.join(source,'articles/2026-10-28-test.md'),'# 测试 $& 文章\n\n正文有 **加粗** 与 $&。\n');
    await mkdir(path.join(source,'articles','2026','10'),{recursive:true});
    await mkdir(path.join(source,'img','articles'),{recursive:true});
    await cp(path.join(root,'img/site-icon-64.png'),path.join(source,'img/articles/cover.png'));
    await writeFile(path.join(source,'articles','2026','10','2026-10-29-一次出行.md'),'标题：一次出行\n分类：生活，旅行\n封面：/img/articles/missing.png\n\n旅行见闻。\n');
    await assert.rejects(generatePosts(source,out),/找不到封面图片/);
    await writeFile(path.join(source,'articles','2026','10','2026-10-29-一次出行.md'),'标题：一次出行\n分类：生活，旅行\n封面：/img/articles/cover.png\n\n旅行见闻。\n');
    const duplicate=path.join(source,'articles','2026','2026-10-28-test.md');
    await writeFile(duplicate,'# 另一个标题\n\n正文。\n');
    await assert.rejects(generatePosts(source,out),/相同网址/);
    await unlink(duplicate);
    const old=await readFile(path.join(out,'2025/10/27/hello-world/index.html'),'utf8');
    await generatePosts(source,out);
    const post=await readFile(path.join(out,'2026/10/28/test/index.html'),'utf8');
    assert.match(post,/<h1>测试 \$&amp; 文章<\/h1>/);
    assert.match(post,/<strong>加粗<\/strong>/);
    assert.match(post,/\$&amp;。/);
    assert.match(post,/comments-section/);
    const categorized=await readFile(path.join(out,'2026/10/29/一次出行/index.html'),'utf8');
    assert.match(categorized,/生活 · 旅行/);
    assert.doesNotMatch(categorized,/分类：生活/);
    assert.match(categorized,/<h1>一次出行<\/h1>/);
    assert.match(categorized,/<img class="post-banner" src="\/img\/articles\/cover.png"/);
    assert.match(categorized,/<meta property="og:image" content="https:\/\/p3nd1ng.github.io\/img\/articles\/cover.png">/);
    assert.equal(await readFile(path.join(out,'2025/10/27/hello-world/index.html'),'utf8'),old);
    for(const name of ['index.html','blog/index.html','archives/index.html','archives/2026/index.html','archives/2026/10/index.html','sitemap.xml'])assert.match(await readFile(path.join(out,name),'utf8'),/\/2026\/10\/28\/test\//,name);
    for(const name of ['index.html','blog/index.html']){
      const list=await readFile(path.join(out,name),'utf8');
      assert.match(list,/<select id="article-category">/);
      assert.match(list,/<option value="tag:生活">/);
      assert.match(list,/<option value="tag:旅行">/);
      assert.match(list,/data-tags="\[&quot;生活&quot;,&quot;旅行&quot;\]"/);
      assert.match(list,/data-tags="\[\]"/);
      assert.match(list,/<img src="\/img\/articles\/cover.png"/);
      assert.ok(list.indexOf('id="article-category"')<list.indexOf('class="article-card"'));
    }
    await assert.rejects(generatePosts(source,out),/避免覆盖/);
  } finally {await rm(tmp,{recursive:true,force:true});}
});
