// Direct app screenshot after generating an adventure for Brisbane
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const dist = path.join(__dirname, 'dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

// Serve the actual app directly — no wrapper iframe
const server = http.createServer((req, res) => {
  let p = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const fp = path.join(dist, p);
  try {
    const data = fs.readFileSync(fp);
    res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(dist, 'index.html')));
  }
});

server.listen(8890, '0.0.0.0', () => {
  console.log('Server on 8890');
  const chrome = '/playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell';

  // Step 1: screenshot of home screen
  execFile(chrome, [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--window-size=390,844',
    '--screenshot=' + path.join(__dirname, 'ss-home.png'),
    '--virtual-time-budget=5000',
    'http://127.0.0.1:8890/',
  ], { timeout: 15000 }, (err, stdout, stderr) => {
    try { console.log('Home screenshot:', fs.statSync(path.join(__dirname, 'ss-home.png')).size, 'bytes'); } catch (e) { console.log('Home screenshot failed:', stderr?.slice(0, 200)); }
    server.close();
    process.exit(0);
  });
});
