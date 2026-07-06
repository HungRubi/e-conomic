const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9333;
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'economic-chrome-'));
const outDir = path.join(process.cwd(), '.claude', 'verification');
fs.mkdirSync(outDir, { recursive: true });

function fetchJson(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: opts.method || 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`bad json ${url}: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForChrome() {
  for (let i = 0; i < 60; i += 1) {
    try {
      return await fetchJson(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await wait(250);
    }
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
      close() {
        ws.close();
      },
    });
    ws.onerror = reject;
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.rej(new Error(`${p.method}: ${JSON.stringify(msg.error)}`));
        else p.res(msg.result);
      }
    };
  });
}

async function waitFor(page, expr, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const res = await page.send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (res.result.value) return res.result.value;
    await wait(200);
  }
  throw new Error(`timeout waiting for ${expr}`);
}

async function evalJson(page, expression) {
  const res = await page.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
  return res.result.value;
}

async function screenshot(page, file) {
  const res = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const target = path.join(outDir, file);
  fs.writeFileSync(target, Buffer.from(res.data, 'base64'));
  return target;
}

async function setViewport(page, width, height, mobile) {
  await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await page.send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
}

async function navigate(page, url) {
  await page.send('Page.navigate', { url });
  await waitFor(page, `document.body && document.body.innerText.includes('Áo Thun Cotton Cao Cấp')`);
  await wait(700);
}

const proc = spawn(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  'about:blank',
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

    const url = 'http://localhost:3000/san-pham/ao-thun-cotton-cao-cap';

    await setViewport(page, 390, 844, true);
    await navigate(page, url);
    await evalJson(page, `localStorage.removeItem('e-conomic-cart')`);
    const mobileBefore = await evalJson(page, `(() => {
      const fixed = [...document.querySelectorAll('body *')].filter((el) => {
        const s = getComputedStyle(el);
        return s.position === 'fixed' && el.innerText.includes('Thêm vào giỏ') && el.innerText.includes('Mua ngay');
      });
      const cta = fixed[0];
      const r = cta?.getBoundingClientRect();
      return {
        viewport: innerWidth + 'x' + innerHeight,
        hasProduct: document.body.innerText.includes('Áo Thun Cotton Cao Cấp'),
        fixedCtaCount: fixed.length,
        fixedCtaRect: r ? { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) } : null,
        bottomTabVisible: [...document.querySelectorAll('nav')].some((el) => getComputedStyle(el).position === 'fixed' && el.innerText.includes('Giỏ hàng')),
        visibleButtons: [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null).map((b) => b.innerText.trim()).filter(Boolean).slice(-8)
      };
    })()`);
    await screenshot(page, 'product-mobile-390.png');

    const gallery = await evalJson(page, `(() => {
      const before = [...document.querySelectorAll('button[aria-pressed="true"]')].map((b) => b.getAttribute('aria-label'));
      document.querySelector('button[aria-label="Xem ảnh 2"]')?.click();
      return { before, clicked: !!document.querySelector('button[aria-label="Xem ảnh 2"]') };
    })()`);
    await wait(500);
    const galleryAfter = await evalJson(page, `[...document.querySelectorAll('button[aria-pressed="true"]')].map((b) => b.getAttribute('aria-label'))`);

    const addResult = await evalJson(page, `(() => {
      const fixed = [...document.querySelectorAll('body *')].find((el) => getComputedStyle(el).position === 'fixed' && el.innerText.includes('Thêm vào giỏ') && el.innerText.includes('Mua ngay'));
      const add = [...fixed.querySelectorAll('button')].find((b) => b.innerText.includes('Thêm vào giỏ'));
      add?.click();
      return { clicked: !!add, buttonText: add?.innerText.trim() };
    })()`);
    await wait(900);
    const cartAfterAdd = await evalJson(page, `(() => ({
      toast: document.body.innerText.includes('Đã thêm vào giỏ hàng'),
      storage: localStorage.getItem('e-conomic-cart'),
      cartBadgeVisible: document.body.innerText.includes('Giỏ hàng')
    }))()`);

    const buyResult = await evalJson(page, `(() => {
      const fixed = [...document.querySelectorAll('body *')].find((el) => getComputedStyle(el).position === 'fixed' && el.innerText.includes('Thêm vào giỏ') && el.innerText.includes('Mua ngay'));
      const buy = [...fixed.querySelectorAll('button')].find((b) => b.innerText.includes('Mua ngay'));
      buy?.click();
      return { clicked: !!buy, buttonText: buy?.innerText.trim() };
    })()`);
    await waitFor(page, `location.pathname === '/cart'`, 10000);
    const buyAfter = await evalJson(page, `(() => ({ pathname: location.pathname, cartPage: document.body.innerText.includes('Giỏ hàng'), checkoutText: document.body.innerText.includes('Thanh toán') }))()`);

    await setViewport(page, 820, 1180, false);
    await navigate(page, url);
    const tablet = await evalJson(page, `(() => {
      const fixed = [...document.querySelectorAll('body *')].filter((el) => {
        const s = getComputedStyle(el);
        return s.position === 'fixed' && s.display !== 'none' && el.getBoundingClientRect().height > 0 && el.innerText.includes('Thêm vào giỏ') && el.innerText.includes('Mua ngay');
      });
      return { viewport: innerWidth + 'x' + innerHeight, fixedCtaCount: fixed.length, inlineAddButtons: [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null && b.innerText.includes('Thêm vào giỏ')).length };
    })()`);
    await screenshot(page, 'product-tablet-820.png');

    await setViewport(page, 1440, 900, false);
    await navigate(page, url);
    const desktop = await evalJson(page, `(() => {
      const fixed = [...document.querySelectorAll('body *')].filter((el) => {
        const s = getComputedStyle(el);
        return s.position === 'fixed' && s.display !== 'none' && el.getBoundingClientRect().height > 0 && el.innerText.includes('Thêm vào giỏ') && el.innerText.includes('Mua ngay');
      });
      const stickyPanels = [...document.querySelectorAll('aside')].filter((el) => getComputedStyle(el).position === 'sticky').length;
      return { viewport: innerWidth + 'x' + innerHeight, fixedCtaCount: fixed.length, inlineAddButtons: [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null && b.innerText.includes('Thêm vào giỏ')).length, stickyPanels };
    })()`);
    await screenshot(page, 'product-desktop-1440.png');

    console.log(JSON.stringify({
      screenshots: {
        mobile: path.join(outDir, 'product-mobile-390.png'),
        tablet: path.join(outDir, 'product-tablet-820.png'),
        desktop: path.join(outDir, 'product-desktop-1440.png'),
      },
      mobileBefore,
      gallery,
      galleryAfter,
      addResult,
      cartAfterAdd: { ...cartAfterAdd, storage: cartAfterAdd.storage ? JSON.parse(cartAfterAdd.storage) : null },
      buyResult,
      buyAfter,
      tablet,
      desktop,
    }, null, 2));

    page.close();
  } finally {
    proc.kill();
  }
})().catch((err) => {
  proc.kill();
  console.error(err.stack || err.message);
  process.exit(1);
});
