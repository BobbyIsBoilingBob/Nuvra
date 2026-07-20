const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const dist = path.join(__dirname, 'dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

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

server.listen(8891, '0.0.0.0', () => {
  const chrome = '/playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell';

  // Interactive test: load app, check home screen nav, click each screen, verify back button
  const testHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
  <iframe id="f" src="http://127.0.0.1:8891/" style="width:390px;height:844px;border:0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
  <script>
  window.onload = async () => {
    const r = {};
    await new Promise(x => setTimeout(x, 3000));
    try {
      const f = document.getElementById('f');
      const d = f.contentDocument, w = f.contentWindow;
      r.title = d.title;
      r.homeText = d.body.innerText.slice(0, 300);
      r.navButtons = d.querySelectorAll('button').length;

      // Click AI Adventure Generator
      let btns = Array.from(d.querySelectorAll('button'));
      let gen = btns.find(b => /AI Adventure Generator/i.test(b.textContent));
      if (gen) { gen.click(); r.clickedGenerator = true; }
      await new Promise(x => setTimeout(x, 1500));
      r.generatorText = d.body.innerText.slice(0, 200);
      r.hasBack = /Back/i.test(d.body.innerText);

      // Go back
      let back = Array.from(d.querySelectorAll('button')).find(b => /Back/i.test(b.textContent));
      if (back) { back.click(); r.clickedBack = true; }
      await new Promise(x => setTimeout(x, 1000));
      r.afterBackText = d.body.innerText.slice(0, 200);
      r.backWorked = /Zeviqo/i.test(d.body.innerText) && /AI Adventure Generator/i.test(d.body.innerText);

      // Test each nav item
      r.screens = [];
      const screenLabels = ['Profile', 'Community', 'Friends', 'Party', 'Leaderboard', 'Challenges', 'Quests', 'History', 'Rewards', 'Inventory', 'Avatar', 'Seasonal', 'Shop', 'Settings', 'Creator'];
      for (const label of screenLabels) {
        btns = Array.from(d.querySelectorAll('button'));
        const target = btns.find(b => b.textContent.includes(label));
        if (target) {
          target.click();
          await new Promise(x => setTimeout(x, 800));
          const screenText = d.body.innerText.slice(0, 100);
          const hasBack2 = /Back/i.test(d.body.innerText);
          r.screens.push({ label, opened: true, snippet: screenText.slice(0, 60), hasBack: hasBack2 });
          // Go back
          const back2 = Array.from(d.querySelectorAll('button')).find(b => /Back/i.test(b.textContent));
          if (back2) back2.click();
          await new Promise(x => setTimeout(x, 600));
        } else {
          r.screens.push({ label, opened: false });
        }
      }

      r.allScreensOpened = r.screens.filter(s => s.opened).length;
      r.allScreensHaveBack = r.screens.filter(s => s.hasBack).length;
    } catch(e) { r.error = e.message; r.stack = e.stack; }
    document.title = 'RESULTS:' + JSON.stringify(r);
    document.body.innerHTML = '<pre>' + JSON.stringify(r, null, 2) + '</pre>';
  };
  </script></body></html>`;

  fs.writeFileSync(path.join(dist, 'nav-test.html'), testHtml);

  execFile(chrome, [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--virtual-time-budget=30000',
    '--window-size=390,1000',
    '--screenshot=' + path.join(__dirname, 'nav-screenshot.png'),
    '--dump-dom',
    'http://127.0.0.1:8891/nav-test.html',
  ], { timeout: 45000, maxBuffer: 20*1024*1024 }, (err, stdout, stderr) => {
    const dom = stdout || '';
    const m = dom.match(/RESULTS:({.*?})</);
    if (m) {
      try {
        const r = JSON.parse(m[1]);
        console.log('\n====== NAVIGATION TEST RESULTS ======\n');
        console.log('Title:', r.title);
        console.log('Nav buttons on home:', r.navButtons);
        console.log('Clicked Generator:', r.clickedGenerator);
        console.log('Generator screen text:', r.generatorText?.slice(0, 100));
        console.log('Has Back button:', r.hasBack);
        console.log('Clicked Back:', r.clickedBack);
        console.log('Back worked (returned to home):', r.backWorked);
        console.log('\n--- Screen Tests ---');
        for (const s of r.screens) {
          console.log(`  ${s.opened ? 'PASS' : 'FAIL'}: ${s.label} ${s.hasBack ? '(Back ✓)' : '(Back ✗)'}`);
        }
        console.log(`\nTotal screens opened: ${r.allScreensOpened}/${r.screens.length}`);
        console.log(`Total screens with Back: ${r.allScreensHaveBack}/${r.screens.length}`);
        if (r.error) console.log('Error:', r.error);
      } catch(e) { console.log('Parse error:', e.message); console.log(dom.slice(0, 2000)); }
    } else {
      console.log('No results found. DOM snippet:', dom.slice(0, 2000));
      if (stderr) console.log('Stderr:', stderr.slice(0, 500));
    }
    try { fs.unlinkSync(path.join(dist, 'nav-test.html')); } catch {}
    try { console.log('\nScreenshot:', fs.statSync(path.join(__dirname, 'nav-screenshot.png')).size, 'bytes'); } catch {}
    server.close();
    process.exit(0);
  });
});
