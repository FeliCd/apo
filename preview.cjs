const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/script.js', ['script.js', 'text/javascript; charset=utf-8']]
]);

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1:4173').pathname;
  const file = files.get(pathname);
  if (!file || !['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(404);
    response.end();
    return;
  }
  fs.readFile(path.join(__dirname, file[0]), (error, content) => {
    if (error) {
      response.writeHead(500);
      response.end();
      return;
    }
    response.writeHead(200, {
      'Content-Type': file[1],
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-store'
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  });
});

server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.listen(4173, '127.0.0.1', () => {
  console.log('Preview available at http://127.0.0.1:4173');
});
