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

server.listen(8893, '0.0.0.0', () => {
  const chrome = '/playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell';

  const testHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
  <iframe id="f" src="http://127.0.0.1:8893/" style="width:390px;height:844px;border:0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
  <script>
  window.onload = async () => {
    const r = {};
    await new Promise(x => setTimeout(x, 3000));
    try {
      const f = document.getElementById('f');
      const d = f.contentDocument, w = f.contentWindow;
      r.title = d.title;
      r.initialText = d.body.innerText.slice(0, 200);

      // Check if login screen - login with existing test account
      const hasLogin = /Sign In|Email|Password/i.test(d.body.innerText);

      if (hasLogin) {
        // Login with the previously created test account
        const emailInput = d.querySelector('input[type="email"]');
        const passInput = d.querySelector('input[type="password"]');
        const signInBtn = Array.from(d.querySelectorAll('button')).find(b => /Sign In/i.test(b.textContent));

        if (emailInput && passInput && signInBtn) {
          const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set;
          setter.call(emailInput, 'beta_test_1784540822031@zeviqo.com');
          emailInput.dispatchEvent(new w.Event('input', { bubbles: true }));
          setter.call(passInput, 'BetaTest2026!Secure');
          passInput.dispatchEvent(new w.Event('input', { bubbles: true }));
          signInBtn.click();
          r.clickedSignIn = true;
          await new Promise(x => setTimeout(x, 5000));
          r.afterLoginText = d.body.innerText.slice(0, 300);
          r.loggedIn = /Welcome back/i.test(d.body.innerText);
        }
      }

      // If on home screen, test navigation
      if (/Zeviqo|Adventure System/i.test(d.body.innerText) && !/Sign In|Sign up|Create Account/i.test(d.body.innerText)) {
        r.homeLoaded = true;
        r.navButtonCount = d.querySelectorAll('button').length;

        r.screens = [];
        const screenLabels = ['AI Adventure', 'Challenges', 'Quests', 'Leaderboard', 'Community', 'Friends', 'Party', 'Profile', 'Avatar', 'History', 'Rewards', 'Inventory', 'Seasonal', 'Shop', 'Notifications', 'Settings', 'Creator'];
        for (const label of screenLabels) {
          await new Promise(x => setTimeout(x, 500));
          let btns = Array.from(d.querySelectorAll('button'));
          const target = btns.find(b => b.textContent.includes(label));
          if (target) {
            target.click();
            await new Promise(x => setTimeout(x, 1500));
            const screenText = d.body.innerText.slice(0, 150);
            const hasBack = /Back/i.test(d.body.innerText);
            const hasContent = screenText.length > 20;
            r.screens.push({ label, opened: hasContent, snippet: screenText.slice(0, 80), hasBack });
            const back = Array.from(d.querySelectorAll('button')).find(b => /^Back$/i.test(b.textContent.trim()));
            if (back) back.click();
            await new Promise(x => setTimeout(x, 800));
          } else {
            r.screens.push({ label, opened: false, reason: 'button not found' });
          }
        }
        r.allScreensOpened = r.screens.filter(s => s.opened).length;
        r.allScreensHaveBack = r.screens.filter(s => s.hasBack).length;
      }
    } catch(e) { r.error = e.message; r.stack = e.stack; }
    document.title = 'RESULTS:' + JSON.stringify(r);
    document.body.innerHTML = '<pre>' + JSON.stringify(r, null, 2) + '</pre>';
  };
  </script></body></html>`;

  fs.writeFileSync(path.join(dist, 'nav-test.html'), testHtml);

  execFile(chrome, [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--virtual-time-budget=60000',
    '--window-size=390,1000',
    '--screenshot=' + path.join(__dirname, 'final-screenshot.png'),
    '--dump-dom',
    'http://127.0.0.1:8893/nav-test.html',
  ], { timeout: 90000, maxBuffer: 20*1024*1024 }, (err, stdout, stderr) => {
    const dom = stdout || '';
    const m = dom.match(/RESULTS:({.*?})</);
    if (m) {
      try {
        const r = JSON.parse(m[1]);
        console.log('\n====== FINAL VERIFICATION RESULTS ======\n');
        console.log('Title:', r.title);
        console.log('Signup Screen Loaded:', Boolean(r.signupScreenText));
        console.log('Clicked Signup:', r.clickedSignup);
        console.log('Test Email:', r.testEmail);
        console.log('After Signup:', r.afterSignupText?.slice(0, 100));
        console.log('Signed Up:', r.signedUp);
        console.log('Home Loaded:', r.homeLoaded);
        console.log('Nav Buttons:', r.navButtonCount);
        console.log('\n--- Screen Navigation Tests ---');
        if (r.screens) {
          for (const s of r.screens) {
            console.log(`  ${s.opened ? 'PASS' : 'FAIL'}: ${s.label} ${s.hasBack ? '(Back ✓)' : '(Back ✗)'} ${s.snippet ? '→ ' + s.snippet.slice(0, 40) : ''}`);
          }
          console.log(`\nScreens opened: ${r.allScreensOpened}/${r.screens.length}`);
          console.log(`Screens with Back: ${r.allScreensHaveBack}/${r.screens.length}`);
        }
        if (r.error) console.log('Error:', r.error);
      } catch(e) { console.log('Parse error:', e.message); console.log(dom.slice(0, 2000)); }
    } else {
      console.log('No results. DOM:', dom.slice(0, 2000));
      if (stderr) console.log('Stderr:', stderr.slice(0, 500));
    }
    try { fs.unlinkSync(path.join(dist, 'nav-test.html')); } catch {}
    try { console.log('\nScreenshot:', fs.statSync(path.join(__dirname, 'final-screenshot.png')).size, 'bytes'); } catch {}
    server.close();
    process.exit(0);
  });
});
