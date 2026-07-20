const http = require('http');
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let p = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const fp = path.join(dist, p);
  try {
    const data = fs.readFileSync(fp);
    const ext = path.extname(fp);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    try {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(path.join(dist, 'index.html')));
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  }
});

server.listen(8888, '0.0.0.0', () => console.log('serving on 8888'));
