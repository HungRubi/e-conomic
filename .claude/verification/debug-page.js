const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9334;
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'economic-chrome-debug-'));

function fetchJson(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: opts.method || 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`bad json ${url}: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForChrome() {
  for (let i = 0; i < 60; i += 1) {
    try { return await fetchJson(`http://127.0.0.1:${port}/json/version`); }
    catch { await wait(250); }
  }
  throw new Error('chrome did not start');
}
function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const pending = new Map();
    let id = 0;
    ws.onopen = () => resolve({
      send(method, params = {}) {
        const msgId = ++id;
        ws.send(JSON.stringify({ id: msgId, method, params }));
        return new Promise((res, rej) => pending.set(msgId, { res, rej, method }));
      },
      close() { ws.close(); },
    });
    ws.onerror = reject;
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') console.log('console', msg.params.type, msg.params.args?.map(a => a.value || a.description).join(' '));
      if (msg.method === 'Runtime.exceptionThrown') console.log('exception', JSON.stringify(msg.params.exceptionDetails, null, 2));
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.rej(new Error(`${p.method}: ${JSON.stringify(msg.error)}`));
        else p.res(msg.result);
      }
    };
  });
}
async function evalJson(page, expression) {
  const res = await page.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return res.result?.value ?? res.exceptionDetails;
}

const proc = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`, 'about:blank',
], { stdio: 'ignore', detached: false });

(async () => {
  try {
    await waitForChrome();
    await fetchJson(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).catch(() => null);
    const targets = await fetchJson(`http://127.0.0.1:${port}/json`);
    const target = targets.find((item) => item.type === 'page');
    const page = await connect(target.webSocketDebuggerUrl);
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await page.send('Page.navigate', { url: 'http://localhost:3000/san-pham/ao-thun-cotton-cao-cap' });
    await wait(6000);
    const info = await evalJson(page, `(() => ({
      href: location.href,
      title: document.title,
      body: document.body.innerText.slice(0, 3000),
      hasProduct: document.body.innerText.includes('Áo Thun Cotton Cao Cấp'),
      buttons: [...document.querySelectorAll('button')].map(b => b.innerText || b.getAttribute('aria-label')).filter(Boolean).slice(0, 30),
      html: document.body.innerHTML.slice(0, 1000)
    }))()`);
    console.log(JSON.stringify(info, null, 2));
    page.close();
  } finally {
    proc.kill();
  }
})().catch((err) => { proc.kill(); console.error(err.stack || err.message); process.exit(1); });
