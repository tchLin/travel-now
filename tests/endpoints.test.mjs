import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createStaticServer } from '../scripts/serve.mjs';
import { activityArt } from '../app/activity-art.js';

test('HTTP endpoints serve the app beneath its GitHub Pages path', async t => {
  const server=createStaticServer({basePath:'/travel-now/'});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const origin=`http://127.0.0.1:${server.address().port}`;
  try {
    await t.test('root and module endpoints return matching source with correct MIME types',async()=>{
      for(const [file,mime] of [['','text/html'],['app.js','text/javascript'],['trip.js','text/javascript'],['export.js','text/javascript'],['i18n.js','text/javascript'],['dropdowns.js','text/javascript'],['places.js','text/javascript'],['guidance.js','text/javascript'],['opening-hours.js','text/javascript'],['hours-view.js','text/javascript'],['activity-art.js','text/javascript'],['guidance.css','text/css'],['styles.css','text/css'],['assets/favicon.svg','image/svg+xml']]) {
        const response=await fetch(`${origin}/travel-now/${file}?test=1`);
        assert.equal(response.status,200,file);assert.equal(response.headers.get('content-type'),mime);
        assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(`app/${file||'index.html'}`));
      }
    });
    await t.test('every illustration and its portable PNG companion is served intact',async()=>{
      for(const art of activityArt)for(const path of [art.src,art.rasterSrc]){
        const response=await fetch(`${origin}/travel-now/${path}`);
        assert.equal(response.status,200,path);assert.equal(response.headers.get('content-type'),path.endsWith('.svg')?'image/svg+xml':'image/png');
        assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile('app/'+path));
      }
    });
    await t.test('HEAD returns metadata without a body',async()=>{
      const response=await fetch(`${origin}/travel-now/assets/japan.jpg`,{method:'HEAD'});
      assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/jpeg');assert.ok(Number(response.headers.get('content-length'))>0);assert.equal(await response.text(),'');
    });
    await t.test('unsupported methods, unknown API routes, and path traversal are rejected',async()=>{
      assert.equal((await fetch(`${origin}/travel-now/`,{method:'POST'})).status,405);
      assert.equal((await fetch(`${origin}/travel-now/api/places`)).status,404);
      assert.equal((await fetch(`${origin}/travel-now/missing-file`)).status,404);
      assert.equal((await fetch(`${origin}/travel-now/..%2fpackage.json`)).status,403);
      assert.equal((await fetch(`${origin}/app.js`)).status,404);
    });
    await t.test('project path without trailing slash redirects correctly',async()=>{
      const response=await fetch(`${origin}/travel-now`,{redirect:'manual'});assert.equal(response.status,308);assert.equal(response.headers.get('location'),'/travel-now/');
    });
  } finally { server.closeAllConnections();await new Promise(resolve=>server.close(resolve)); }
});
