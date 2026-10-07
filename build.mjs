import {mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/client',{recursive:true});
copyFileSync('worker.mjs','dist/server/index.js');
for(const file of ['index.html','app.js','style.css'])copyFileSync('web/'+file,'dist/client/'+file);
writeFileSync('dist/server/wrangler.json',JSON.stringify({name:'highland-watch',main:'index.js',compatibility_date:'2026-10-01',assets:{directory:'../client',binding:'ASSETS',run_worker_first:['/api/*']}}));
console.log('Built dependency-free dashboard and Worker');
