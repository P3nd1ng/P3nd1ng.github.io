import {readFile,writeFile,mkdir,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {marked} from 'marked';

const site='https://p3nd1ng.github.io';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const legacy={date:'2025-10-27',title:'Hello World',url:'/2025/10/27/hello-world/',tags:[]};

export async function generatePosts(source, output){
  const articleDir=path.join(source,'articles');
  async function findArticles(dir,parts=[]){
    const entries=await readdir(dir,{withFileTypes:true}).catch(e=>e.code==='ENOENT'?[]:Promise.reject(e));
    const found=[];
    for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name))){
      if(entry.name.startsWith('.'))continue;
      if(entry.isDirectory())found.push(...await findArticles(path.join(dir,entry.name),[...parts,entry.name]));
      else if(entry.isFile()&&entry.name.toLowerCase().endsWith('.md'))found.push({name:entry.name,parts});
    }
    return found;
  }
  const names=await findArticles(articleDir);
  const posts=[],routes=new Set();
  for(const {name,parts} of names){
    const relative=[...parts,name].join('/');
    const match=/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/i.exec(name);
    if(!match)throw Error(`文章文件名请使用 YYYY-MM-DD-文章名称.md：${relative}`);
    const [,year,month,day,slug]=match, date=`${year}-${month}-${day}`;
    if(Number.isNaN(Date.parse(date)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0,10)!==date)throw Error(`文章日期无效：${name}`);
    const text=(await readFile(path.join(articleDir,...parts,name),'utf8')).replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
    let body=text.trim(),title='',cover='/img/wallpapers/alpine.webp';
    const fields=new Map();
    const heading=/^#[ \t]+([^\n]+)(?:\n|$)/.exec(body);
    if(heading){title=heading[1].trim();body=body.slice(heading[0].length).trimStart();}
    while(true){
      const field=/^(标题|分类|标签|封面)[ \t]*[：:][ \t]*([^\n]*)(?:\n|$)/.exec(body);
      if(!field)break;
      if(fields.has(field[1]))throw Error(`重复的文章设置：${field[1]}（${relative}）`);
      fields.set(field[1],field[2].trim());body=body.slice(field[0].length);
    }
    title=fields.get('标题')||title;
    if(!title)throw Error(`文章开头请填写“标题：文章标题”：${relative}`);
    body=body.trim();
    const tags=[...new Set([fields.get('分类'),fields.get('标签')].filter(Boolean).flatMap(s=>s.split(/[,，、]/)).map(s=>s.trim()).filter(Boolean))];
    if(fields.get('封面'))cover=fields.get('封面');
    if(fields.get('封面')&&cover.startsWith('/img/')){
      const imagePath=decodeURIComponent(new URL(cover,site).pathname);
      const imageFile=path.resolve(source,'.'+imagePath),imageRoot=path.join(source,'img')+path.sep;
      if(!imageFile.startsWith(imageRoot)||!(await stat(imageFile).catch(()=>null))?.isFile())throw Error(`找不到封面图片：${cover}（${relative}）`);
      cover=new URL(cover,site).pathname;
    }else if(!cover.startsWith('/img/')&&!/^https:\/\//i.test(cover))throw Error(`封面请填写 /img/ 开头的图片路径或 HTTPS 图片网址：${relative}`);
    if(!body)throw Error(`文章正文为空：${name}`);
    const url=`/${year}/${month}/${day}/${encodeURIComponent(slug)}/`;
    if(routes.has(url))throw Error(`多篇文章使用了相同网址，请调整文件名：${url}`);
    routes.add(url);
    const target=path.join(output,year,month,day,slug,'index.html');
    if(await stat(target).catch(()=>null))throw Error(`文章路径已存在，避免覆盖：${url}`);
    const plain=body.replace(/```[\s\S]*?```/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[#>*_`~\[\]]/g,'').replace(/\s+/g,' ').trim();
    posts.push({date,title,body,url,target,tags,cover,summary:plain.slice(0,110)||title});
  }
  if(!posts.length)return;
  const postTemplate=await readFile(path.join(output,'2025/10/27/hello-world/index.html'),'utf8');
  for(const p of posts){
    const title=escape(p.title),summary=escape(p.summary),url=escape(site+p.url);
    let html=postTemplate;
    html=html.replace(/<title>[\s\S]*?<\/title>/,()=>`<title>${title} · P3nd1ng's Journal</title>`)
      .replace(/<meta name="description" content="[^"]*">/,()=>`<meta name="description" content="${summary}">`)
      .replace(/<link rel="canonical" href="[^"]*">/,()=>`<link rel="canonical" href="${url}">`)
      .replace(/<meta property="og:title" content="[^"]*">/,()=>`<meta property="og:title" content="${title}">`)
      .replace(/<meta property="og:url" content="[^"]*">/,()=>`<meta property="og:url" content="${url}">`)
      .replace(/<meta property="og:image" content="[^"]*">/,()=>`<meta property="og:image" content="${escape(new URL(p.cover,site).href)}">`)
      .replace(/<img class="post-banner"[^>]*>/,()=>`<img class="post-banner" src="${escape(p.cover)}" alt="${title}">`)
      .replace(/(<nav class="breadcrumbs"[^>]*>)[\s\S]*?<\/nav>/,(_,opening)=>opening+`<a href="/blog/">文章</a><span>/</span><span>${title}</span></nav>`)
      .replace(/<header class="post-header">[\s\S]*?<\/header>/,()=>`<header class="post-header"><div class="eyebrow">Stories / 记录</div><h1>${title}</h1><div class="article-meta"><time datetime="${p.date}">${p.date.replaceAll('-','.')}</time><span>·</span><span>${escape(p.tags.join(' · ')||'未分类')}</span><span>·</span><span>P3nd1ng</span></div></header>`)
      .replace(/<article class="container post-content" id="article-container">[\s\S]*?<\/article>/,()=>`<article class="container post-content" id="article-container">${marked.parse(p.body)}</article>`)
      .replace(/<div class="copyright-box">[\s\S]*?<\/div>/,()=>`<div class="copyright-box">文章作者：<a href="/about/">P3nd1ng</a><br>文章链接：<a href="${url}">${url}</a><br>版权声明：本博客所有文章除特别声明外，均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a> 许可协议。转载请注明来源。</div>`)
      .replace(/<aside class="toc-panel"[\s\S]*?<\/aside>/,'');
    await mkdir(path.dirname(p.target),{recursive:true}); await writeFile(p.target,html);
  }
  const all=[legacy,...posts].sort((a,b)=>b.date.localeCompare(a.date)||a.url.localeCompare(b.url));
  const blogFile=path.join(output,'blog/index.html'); let blog=await readFile(blogFile,'utf8');
  const oldCard=blog.match(/<a class="article-card"[\s\S]*?<\/a>/)?.[0];
  if(!oldCard)throw Error('无法找到原文章卡片');
  const cards=all.map(p=>p===legacy?oldCard.replace('class="article-card"',`class="article-card" data-tags="${escape(JSON.stringify([]))}"`):`<a class="article-card" href="${p.url}" data-tags="${escape(JSON.stringify(p.tags))}" data-search="${escape((p.title+' '+p.summary+' '+p.tags.join(' ')).toLocaleLowerCase())}"><div class="article-cover"><img src="${escape(p.cover)}" width="1200" height="800" loading="lazy" alt="${escape(p.title)}"><span class="pill">${escape(p.tags.join(' · ')||'未分类')}</span></div><div class="article-card-body"><div class="article-meta"><time datetime="${p.date}">${p.date.replaceAll('-','.')}</time></div><h3>${escape(p.title)}</h3><p class="article-excerpt">${escape(p.summary)}</p><div class="article-card-footer"><span>${escape(p.tags.join(' · ')||'未分类')}</span><span>阅读全文 ↗</span></div></div></a>`).join('\n');
  blog=blog.replace(oldCard,()=>cards).replace(/(<div class="tab-current">全部文章 <span>)\d+(<\/span>)/,`$1${String(all.length).padStart(2,'0')}$2`).replace(/(<div class="profile-stats"><a href="\/archives\/"><strong>)\d+(<\/strong>)/,`$1${String(all.length).padStart(2,'0')}$2`).replace('故事才刚刚开始，谢谢你来读我的第一篇记录。','谢谢你来到这里，下一篇故事正在路上。');
  const tags=[...new Set(all.flatMap(p=>p.tags))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
  const selector=`<div class="category-filter"><label for="article-category">文章分类</label><select id="article-category"><option value="">全部分类</option><option value="untagged">未分类</option>${tags.map(tag=>`<option value="tag:${escape(tag)}">${escape(tag)}</option>`).join('')}</select></div>`;
  blog=blog.replace('<a class="article-card"',()=>`${selector}<a class="article-card"`);
  await writeFile(blogFile,blog);
  let home=await readFile(path.join(output,'index.html'),'utf8');
  const main=blog.match(/<main class="blog-content"[\s\S]*?<\/main>/)?.[0],footer=blog.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)?.[0];
  if(!main||!footer)throw Error('无法同步首页文章列表');
  const section=['<!-- home-journal:start -->','<section class="blog-page home-journal" id="journal" tabindex="-1" aria-label="文章列表">',main.replace('<main ','<div ').replace('</main>','</div>').replace('id="journal"','id="article-list"').replaceAll('href="/blog/"','href="#journal"'),footer,'</section>','<!-- home-journal:end -->'].join('\n');
  home=home.replace(/<!-- home-journal:start -->[\s\S]*?<!-- home-journal:end -->/,()=>section);await writeFile(path.join(output,'index.html'),home);
  const archiveTemplate=await readFile(path.join(output,'archives/index.html'),'utf8');
  const groups=new Map();for(const p of all){const year=p.date.slice(0,4);if(!groups.has(year))groups.set(year,[]);groups.get(year).push(p);}
  async function archive(url,title,items){
    const years=[...new Set(items.map(p=>p.date.slice(0,4)))];
    const content=years.map(y=>`<h2 class="archive-year"><a href="/archives/${y}/">${y}</a></h2>`+items.filter(p=>p.date.startsWith(y)).map(p=>`<a class="archive-entry" href="${p.url}"><time datetime="${p.date}">${p.date.slice(5).replace('-','.')}</time><h2>${escape(p.title)}</h2><span class="pill">记录</span><span aria-hidden="true">↗</span></a>`).join('')).join('');
    let html=archiveTemplate.replace(/<title>[\s\S]*?<\/title>/,`<title>${title} · P3nd1ng's Journal</title>`).replace(/<link rel="canonical" href="[^"]*">/,`<link rel="canonical" href="${site}${url}">`).replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${title}">`).replace(/<meta property="og:url" content="[^"]*">/,`<meta property="og:url" content="${site}${url}">`).replace(/<main class="page-container"[\s\S]*?<\/main>/,`<main class="page-container" id="main-content"><nav class="breadcrumbs" aria-label="面包屑"><a href="/blog/">文章</a><span>/</span><span>${title}</span></nav><header class="archive-heading"><div class="eyebrow">Collected moments / 时间的索引</div><h1>${title}</h1><p>共 ${items.length} 篇文章。每一次记录，都值得收藏。</p></header>${content}</main>`);
    const file=path.join(output,url.slice(1),'index.html');await mkdir(path.dirname(file),{recursive:true});await writeFile(file,html);
  }
  await archive('/archives/','文章归档',all);
  for(const [year,items] of groups){await archive(`/archives/${year}/`,`${year} 年归档`,items);for(const month of new Set(items.map(p=>p.date.slice(5,7))))await archive(`/archives/${year}/${month}/`,`${year} 年 ${month} 月归档`,items.filter(p=>p.date.slice(5,7)===month));}
  const sitemapFile=path.join(output,'sitemap.xml');let sitemap=await readFile(sitemapFile,'utf8');
  const urls=[...posts.map(p=>p.url),...[...groups].flatMap(([year,items])=>[`/archives/${year}/`,...new Set(items.map(p=>`/archives/${year}/${p.date.slice(5,7)}/`))])];
  for(const url of urls)if(!sitemap.includes(`<loc>${site}${url}</loc>`))sitemap=sitemap.replace('</urlset>',`  <url><loc>${site}${url}</loc></url>\n</urlset>`);await writeFile(sitemapFile,sitemap);
  console.log(`Generated ${posts.length} Markdown article(s).`);
}
