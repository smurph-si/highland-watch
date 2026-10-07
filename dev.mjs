import http from 'node:http';
import {readFile} from 'node:fs/promises';
import worker from './worker.mjs';
const types={html:'text/html',css:'text/css',js:'text/javascript'};
http.createServer(async(req,res)=>{try{
 const response=await worker.fetch(new Request('http://localhost:4173'+req.url),{ASSETS:{async fetch(request){const path=new URL(request.url).pathname;const filename=path==='/'?'index.html':path.slice(1);if(!['index.html','style.css','app.js'].includes(filename))return new Response('Not found',{status:404});return new Response(await readFile('web/'+filename),{headers:{'Content-Type':types[filename.split('.').pop()]}});}}});
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
}catch{res.writeHead(500);res.end('Unable to serve request');}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
