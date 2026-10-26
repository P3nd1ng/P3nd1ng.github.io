import {readFile,writeFile} from 'node:fs/promises';

// Keep the landing-page article section in sync with the standalone list.
// The list is authored once in blog/index.html and works without JavaScript.
const homeUrl=new URL('../index.html',import.meta.url);
const blog=await readFile(new URL('../blog/index.html',import.meta.url),'utf8');
let home=await readFile(homeUrl,'utf8');
const list=blog.match(/<main class="blog-content"[\s\S]*?<\/main>/)?.[0];
const footer=blog.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)?.[0];
if(!list||!footer)throw new Error('The article list is missing its content or footer.');
const content=[
  '<!-- home-journal:start -->',
  '<section class="blog-page home-journal" id="journal" tabindex="-1" aria-label="文章列表">',
  list.replace('<main ','<div ').replace('</main>','</div>').replace('id="journal"','id="article-list"').replaceAll('href="/blog/"','href="#journal"'),
  footer,
  '</section>',
  '<!-- home-journal:end -->'
].join('\n');
const marker=/<!-- home-journal:start -->[\s\S]*?<!-- home-journal:end -->/;
if(!marker.test(home))throw new Error('Missing home article-section markers.');
const updated=home.replace(marker,content);
if(updated!==home)await writeFile(homeUrl,updated);
