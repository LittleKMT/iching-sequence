// Run with Playwright available on NODE_PATH; uses the installed Chrome browser.
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (!pathname.startsWith('/iching-sequence/')) { res.writeHead(404).end(); return; }
  const file = path.resolve(root, pathname.slice('/iching-sequence/'.length) + (pathname.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, bytes) => {
    res.writeHead(error ? 404 : 200, { 'Content-Type': mime[path.extname(file)] || 'text/plain' });
    res.end(error ? 'Not found' : bytes);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/iching-sequence/`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    let page = await context.newPage();
    const errors = [];
    context.on('page', tab => tab.on('pageerror', error => errors.push(error.message)));
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.locator('.offline-panel summary').click();
    await page.waitForFunction(() => !document.getElementById('offline-download-all').disabled);
    // Basic offline startup works even before the full book download.
    await context.setOffline(true);
    await page.reload();
    await page.waitForFunction(() => document.getElementById('offline-message').textContent.includes('基本功能已可離線'));
    await context.setOffline(false);
    await page.locator('.offline-panel summary').click();
    await page.locator('#offline-download-all').click();
    await page.waitForFunction(() => document.getElementById('offline-message').textContent.includes('完整離線版已儲存'), null, { timeout: 120000 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(require('node:os').tmpdir(), 'iching-offline-phone.png'), fullPage: false });
    // An interrupted re-download must not report success or erase the saved copy.
    await context.setOffline(true);
    await page.locator('#offline-download-all').click();
    await page.waitForFunction(() => document.getElementById('offline-message').textContent.includes('下載未完成'));
    await page.close();
    page = await context.newPage();
    await page.goto(base);
    await page.waitForFunction(() => document.getElementById('offline-message').textContent.includes('完整離線版已儲存'));
    await page.locator('[data-mode="eightfold"]').click();
    await page.waitForFunction(() => document.getElementById('eightfold-screen').textContent.includes('正見'));
    for (const reader of ['zhengshi/', 'zhengshi-articles/']) {
      await page.goto(base + reader);
      await page.waitForFunction(() => document.getElementById('chapter').options.length > 1);
      if (reader === 'zhengshi-articles/') await page.locator('#reader-settings summary').click();
      await page.locator('#volume').selectOption('19');
      await page.waitForFunction(() => document.getElementById('status').textContent.includes('20｜'));
      assert((await page.locator('#content').innerText()).length > 30);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('#next').click();
      assert((await page.locator('#content').innerText()).length > 30);
    }
    await page.goto(base);
    const result = await page.evaluate(async () => {
      const [script, labels] = await Promise.all([fetch('heartmind-lecture-data.js'), fetch('zhengshi-articles/data/figures.json')]);
      const figures = await labels.json();
      const image = await fetch(`zhengshi-articles/figures/${encodeURIComponent(figures[0])}.png`);
      return { script: script.ok, image: image.ok };
    });
    assert(result.script && result.image);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.locator('.offline-panel summary').click();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(require('node:os').tmpdir(), 'iching-offline-tablet.png') });
    assert.deepEqual(errors, []);
    console.log('PASS: basic offline startup, complete download, failed update recovery, offline reopening, both volume-20 readers, navigation, figures, phone/tablet layout.');
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
