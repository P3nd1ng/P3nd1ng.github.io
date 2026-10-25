import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const port=Number(process.env.PORT||4311);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.ico':'image/x-icon','.wav':'audio/wav','.json':'application/json; charset=utf-8','.gif':'image/gif','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  try{
    const urlPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,`.${urlPath}`);
    const relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative)||relative.split(path.sep).some(s=>s.startsWith('.'))||['node_modules','scripts','tests'].includes(relative.split(path.sep)[0])){res.writeHead(403);res.end();return;}
    let info=await stat(file).catch(()=>null);
    if(info?.isDirectory()){
      if(!urlPath.endsWith('/')){res.writeHead(301,{Location:`${urlPath}/${new URL(req.url,'http://localhost').search}`});res.end();return;}
      file=path.join(file,'index.html');info=await stat(file).catch(()=>null);
    }
    let status=200;
    if(!info?.isFile()){file=path.join(root,'404.html');info=await stat(file);status=404;}
    const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
    const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
    if(range&&status===200){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),info.size-1):info.size-1;if(start> end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${info.size}`});if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);}
    else{res.writeHead(status,{...headers,'Content-Length':info.size});if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);}
  }catch{res.writeHead(500);res.end('Server error');}
}).listen(port,'127.0.0.1',()=>console.log(`Journal preview: http://localhost:${port}`));
