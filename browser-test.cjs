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
    const ext = path.extname(fp);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(dist, 'index.html')));
  }
});

server.listen(8888, '0.0.0.0', () => {
  console.log('Server ready on 8888');

  const chrome = '/playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell';
  const results = [];

  function runTest(name, args, timeoutMs) {
    return new Promise((resolve) => {
      console.log(`Running: ${name}`);
      const child = execFile(chrome, args, { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        resolve({ name, err, stdout, stderr });
      });
    });
  }

  async function runAll() {
    // Test 1: DOM dump
    const t1 = await runTest('Page loads', [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-network',
      '--dump-dom', 'http://127.0.0.1:8888/',
    ], 15000);

    const dom = t1.stdout || '';
    if (dom.includes('Zeviqo')) {
      console.log('PASS: Page loads with Zeviqo title');
    } else if (dom.length > 0) {
      console.log('FAIL: Page loaded but no Zeviqo found');
      console.log('DOM snippet:', dom.slice(0, 800));
    } else {
      console.log('FAIL: Empty DOM. stderr:', (t1.stderr || '').slice(0, 300));
    }

    if (dom.includes('Generate') || dom.includes('Adventure')) {
      console.log('PASS: Adventure generator text found');
    } else {
      console.log('WARN: Generator text not found in static DOM (may be JS-rendered)');
    }

    // Test 2: Screenshot
    const t2 = await runTest('Screenshot', [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-network',
      '--screenshot=' + path.join(__dirname, 'screenshot.png'),
      '--window-size=390,844',
      'http://127.0.0.1:8888/',
    ], 15000);

    try {
      const sz = fs.statSync(path.join(__dirname, 'screenshot.png')).size;
      console.log(`PASS: Screenshot captured (${sz} bytes)`);
    } catch {
      console.log('FAIL: No screenshot file. stderr:', (t2.stderr || '').slice(0, 300));
    }

    // Test 3: Check JS bundle for London coords
    console.log('\n=== Bundle analysis ===');
    const jsFiles = fs.readdirSync(path.join(dist, 'assets')).filter(f => f.endsWith('.js'));
    const jsContent = fs.readFileSync(path.join(dist, 'assets', jsFiles[0]), 'utf8');

    if (jsContent.includes('51.5074') || jsContent.includes('51.507') || jsContent.includes('-0.1278')) {
      console.log('FAIL: London coordinates found in JS bundle!');
    } else {
      console.log('PASS: No London coordinates in JS bundle');
    }

    if (jsContent.includes('nominatim')) {
      console.log('PASS: Nominatim geocoding in bundle');
    } else {
      console.log('WARN: Nominatim not found in bundle (may be minified)');
    }

    if (jsContent.includes('getCurrentPosition') || jsContent.includes('geolocation')) {
      console.log('PASS: GPS/geolocation code in bundle');
    } else {
      console.log('WARN: Geolocation not found in bundle');
    }

    if (jsContent.includes('DeviceOrientation') || jsContent.includes('compass')) {
      console.log('PASS: Sensor/compass code in bundle');
    } else {
      console.log('WARN: Sensor code not found in bundle');
    }

    if (jsContent.includes('leaflet') || jsContent.includes('Leaflet')) {
      console.log('PASS: Leaflet map in bundle');
    } else {
      console.log('WARN: Leaflet not found in bundle');
    }

    // Count challenge IDs in bundle
    const challengeMatches = jsContent.match(/obs-|nav-|trivia-|photo-|mem-|compass-|fit-|puzzle-|timed-|decision-|sensor-|objective-|mixed-|collect-|lm-|nature-|team-|reaction-|explore-|walk-/g);
    if (challengeMatches && challengeMatches.length > 20) {
      console.log(`PASS: Challenge library in bundle (${challengeMatches.length} challenge ID prefixes found)`);
    } else {
      console.log(`WARN: Only ${challengeMatches?.length || 0} challenge IDs found in bundle`);
    }

    server.close();
    process.exit(0);
  }

  runAll();
});
