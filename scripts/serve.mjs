import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png':'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
export function createStaticServer({ root = resolve('app'), basePath = '/' } = {}) {
root = resolve(root);
const prefix = basePath === '/' ? '' : '/' + basePath.replace(/^\/+|\/+$/g, '');
return http.createServer(async (req, res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, { Allow:'GET, HEAD' }).end('Method not allowed');return; }
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (prefix) {
      if(pathname === prefix) { res.writeHead(308,{Location:prefix+'/'}).end();return; }
      if(!pathname.startsWith(prefix+'/')) { res.writeHead(404).end('Not found');return; }
      pathname=pathname.slice(prefix.length);
    }
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length':body.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options':'nosniff' }).end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404).end('Not found'); }
});
}
if(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const server = createStaticServer();
  server.listen(Number(process.env.PORT || 5173), '127.0.0.1', () => console.log(`Travel Now: http://127.0.0.1:${server.address().port}`));
}
