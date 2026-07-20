// Interactive browser test with network enabled
// Verifies: geocoding, map rendering, challenge generation, location pipeline
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

server.listen(8889, '0.0.0.0', () => {
  console.log('Server ready on 8889');

  const chrome = '/playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell';

  // Test script that runs in the browser - uses real network for geocoding
  const testScript = `
    const results = {};
    
    // Wait for page to render
    await new Promise(r => setTimeout(r, 2000));
    
    // 1. Check page rendered
    results.title = document.title;
    results.bodyText = document.body.innerText.slice(0, 500);
    results.hasGenerateButton = !!document.querySelector('button');
    results.buttonCount = document.querySelectorAll('button').length;
    
    // 2. Find location input
    const inputs = document.querySelectorAll('input');
    results.inputCount = inputs.length;
    results.inputTypes = Array.from(inputs).map(i => ({ type: i.type, placeholder: i.placeholder, name: i.name }));
    
    // 3. Find the location text input (type text)
    const textInputs = Array.from(inputs).filter(i => i.type === 'text');
    results.hasLocationInput = textInputs.length > 0;
    
    // 4. Try entering a location and generating
    if (textInputs.length > 0) {
      const locationInput = textInputs[0];
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(locationInput, 'Brisbane, Australia');
      locationInput.dispatchEvent(new Event('input', { bubbles: true }));
      locationInput.dispatchEvent(new Event('change', { bubbles: true }));
      results.enteredLocation = locationInput.value;
    }
    
    // 5. Click the generate button (look for button with "Generate" text)
    const buttons = Array.from(document.querySelectorAll('button'));
    const generateBtn = buttons.find(b => /generate/i.test(b.textContent));
    if (generateBtn) {
      results.generateBtnText = generateBtn.textContent.trim().slice(0, 50);
      generateBtn.click();
      results.clickedGenerate = true;
    }
    
    // 6. Wait for async generation (geocoding + route generation)
    await new Promise(r => setTimeout(r, 8000));
    
    // 7. Check what rendered after generation
    results.postGenText = document.body.innerText.slice(0, 1000);
    results.postGenButtonCount = document.querySelectorAll('button').length;
    results.hasMap = !!document.querySelector('.leaflet-container') || !!document.querySelector('[class*="map"]') || !!document.querySelector('[class*="Map"]');
    results.hasLeaflet = !!document.querySelector('.leaflet-container');
    results.checkpointCount = document.querySelectorAll('[class*="checkpoint"], [class*="Checkpoint"]').length;
    
    // 8. Check for error messages
    results.hasError = /error|failed|unable|cannot|invalid/i.test(document.body.innerText);
    results.errorSnippet = (document.body.innerText.match(/[^\\n]*(error|failed|unable|cannot|invalid)[^\\n]*/i) || [''])[0].slice(0, 200);
    
    // 9. Check for London (should never appear as a default)
    results.mentionsLondon = /London/i.test(document.body.innerText);
    
    // 10. Check for adventure content
    results.hasCheckpoint = /checkpoint/i.test(document.body.innerText);
    results.hasChallenge = /challenge/i.test(document.body.innerText);
    results.hasDistance = /km|distance/i.test(document.body.innerText);
    results.hasDuration = /min|hour|duration/i.test(document.body.innerText);
    
    // 11. Screenshot path for reference
    results.screenshotTaken = true;
    
    JSON.stringify(results, null, 2);
  `;

  // Write the test script to a temp file
  const scriptPath = path.join(__dirname, 'browser-test-script.js');
  fs.writeFileSync(scriptPath, testScript);

  // Run Chrome with network ENABLED and execute the test script
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--enable-network',
    '--disable-web-security',  // Allow cross-origin for Nominatim
    '--virtual-time-budget=15000',
    '--window-size=390,844',
    '--screenshot=' + path.join(__dirname, 'screenshot-interactive.png'),
    '--dump-dom',
    'http://127.0.0.1:8889/',
  ];

  // We need to inject the test script. Use a different approach:
  // Create a test page that loads the app and runs the test
  const testHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Zeviqo Test</title></head><body>
    <iframe id="appFrame" src="http://127.0.0.1:8889/" style="width:390px;height:844px;border:0;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
    <script>
      window.onload = async () => {
        const results = {};
        await new Promise(r => setTimeout(r, 3000));
        
        try {
          const frame = document.getElementById('appFrame');
          const fdoc = frame.contentDocument;
          const fwin = frame.contentWindow;
          
          results.title = fdoc.title;
          results.bodyText = fdoc.body.innerText.slice(0, 500);
          results.buttonCount = fdoc.querySelectorAll('button').length;
          
          const inputs = fdoc.querySelectorAll('input');
          results.inputCount = inputs.length;
          results.inputTypes = Array.from(inputs).map(i => ({ type: i.type, placeholder: i.placeholder }));
          
          const textInputs = Array.from(inputs).filter(i => i.type === 'text');
          results.hasLocationInput = textInputs.length > 0;
          
          if (textInputs.length > 0) {
            const locationInput = textInputs[0];
            const setter = Object.getOwnPropertyDescriptor(fwin.HTMLInputElement.prototype, 'value').set;
            setter.call(locationInput, 'Brisbane, Australia');
            locationInput.dispatchEvent(new fwin.Event('input', { bubbles: true }));
            locationInput.dispatchEvent(new fwin.Event('change', { bubbles: true }));
            results.enteredLocation = locationInput.value;
          }
          
          const buttons = Array.from(fdoc.querySelectorAll('button'));
          const generateBtn = buttons.find(b => /generate/i.test(b.textContent));
          if (generateBtn) {
            results.generateBtnText = generateBtn.textContent.trim().slice(0, 50);
            generateBtn.click();
            results.clickedGenerate = true;
          }
          
          await new Promise(r => setTimeout(r, 10000));
          
          results.postGenText = fdoc.body.innerText.slice(0, 1500);
          results.hasMap = !!fdoc.querySelector('.leaflet-container');
          results.hasLeaflet = !!fdoc.querySelector('.leaflet-container');
          results.checkpointCount = fdoc.querySelectorAll('.leaflet-marker-icon').length;
          results.hasError = /error|failed|unable|cannot|invalid/i.test(fdoc.body.innerText);
          results.errorSnippet = (fdoc.body.innerText.match(/[^\\n]*(error|failed|unable|cannot|invalid)[^\\n]*/i) || [''])[0].slice(0, 200);
          results.mentionsLondon = /London/i.test(fdoc.body.innerText);
          results.hasCheckpoint = /checkpoint/i.test(fdoc.body.innerText);
          results.hasChallenge = /challenge/i.test(fdoc.body.innerText);
          results.hasDistance = /km|distance/i.test(fdoc.body.innerText);
          results.hasDuration = /min|hour|duration/i.test(fdoc.body.innerText);
        } catch (e) {
          results.error = e.message;
          results.stack = e.stack;
        }
        
        document.title = 'TEST_RESULTS:' + JSON.stringify(results);
        document.body.innerHTML = '<pre>' + JSON.stringify(results, null, 2) + '</pre>';
      };
    </script>
  </body></html>`;

  fs.writeFileSync(path.join(dist, 'test-runner.html'), testHtml);

  console.log('Running interactive test with network enabled...');

  execFile(chrome, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--virtual-time-budget=20000',
    '--window-size=390,1000',
    '--screenshot=' + path.join(__dirname, 'screenshot-interactive.png'),
    '--dump-dom',
    'http://127.0.0.1:8889/test-runner.html',
  ], { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    const dom = stdout || '';
    
    console.log('\n====== INTERACTIVE BROWSER TEST RESULTS ======\n');
    
    // Extract test results from the DOM
    const match = dom.match(/TEST_RESULTS:({.*?})</);
    if (match) {
      try {
        const results = JSON.parse(match[1]);
        console.log('Test Results:');
        console.log(JSON.stringify(results, null, 2));
        
        console.log('\n=== Assertions ===');
        console.log(results.title ? 'PASS: Page loaded' : 'FAIL: No title');
        console.log(results.buttonCount > 0 ? `PASS: ${results.buttonCount} buttons rendered` : 'FAIL: No buttons');
        console.log(results.hasLocationInput ? 'PASS: Location input found' : 'FAIL: No location input');
        console.log(results.clickedGenerate ? 'PASS: Generate button clicked' : 'FAIL: No generate button');
        console.log(results.hasLeaflet ? 'PASS: Leaflet map rendered' : 'FAIL: No map rendered');
        console.log(results.checkpointCount > 0 ? `PASS: ${results.checkpointCount} checkpoint markers on map` : 'WARN: No checkpoint markers visible');
        console.log(results.mentionsLondon ? 'FAIL: London mentioned in output' : 'PASS: No London default');
        console.log(results.hasCheckpoint ? 'PASS: Checkpoint content shown' : 'WARN: No checkpoint text');
        console.log(results.hasChallenge ? 'PASS: Challenge content shown' : 'WARN: No challenge text');
        console.log(results.hasDistance ? 'PASS: Distance info shown' : 'WARN: No distance info');
        console.log(results.hasDuration ? 'PASS: Duration info shown' : 'WARN: No duration info');
        console.log(results.hasError ? `WARN: Error shown: ${results.errorSnippet}` : 'PASS: No error messages');
      } catch (e) {
        console.log('Could not parse results:', e.message);
        console.log('DOM snippet:', dom.slice(0, 2000));
      }
    } else {
      console.log('Could not find test results in DOM');
      console.log('DOM snippet:', dom.slice(0, 2000));
      if (stderr) console.log('Stderr:', stderr.slice(0, 500));
    }
    
    // Check screenshot
    try {
      const sz = fs.statSync(path.join(__dirname, 'screenshot-interactive.png')).size;
      console.log(`\nScreenshot: ${sz} bytes`);
    } catch { console.log('\nNo screenshot'); }
    
    // Clean up test file
    try { fs.unlinkSync(path.join(dist, 'test-runner.html')); } catch {}
    try { fs.unlinkSync(scriptPath); } catch {}
    
    server.close();
    process.exit(0);
  });
});
