import {cp,mkdir,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
await import('./sync-home.mjs');
await import('./check.mjs');
const root=fileURLToPath(new URL('..',import.meta.url));
const dist=path.join(root,'dist');
// Only ever clean the fixed generated dist directory in this checkout.
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const name of ['index.html','404.html','.nojekyll','robots.txt','sitemap.xml','css','js','img','audio','2025','blog','archives','about','credits'])await cp(path.join(root,name),path.join(dist,name),{recursive:true});
console.log('GitHub Pages files are ready in dist/');
