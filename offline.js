(async () => {
  const button = document.getElementById('offline-download-all');
  const message = document.getElementById('offline-message');
  const progress = document.getElementById('offline-progress');
  const installButton = document.getElementById('install-app');
  let installPrompt;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener('click', async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    installPrompt = null;
    installButton.hidden = true;
  });
  if (!('serviceWorker' in navigator) || !('caches' in window) || !window.isSecureContext) {
    message.textContent = '離線功能需要使用 HTTPS 網址，並以 Safari 或 Chrome 開啟。';
    return;
  }
  try {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'offline-assets.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
    const registration = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
    await navigator.serviceWorker.ready;
    const base = new URL('./', location.href);
    const prefix = `iching-sequence:${base.href}:`;
    const fullCache = `${prefix}full:${ICHING_OFFLINE_VERSION}`;
    const marker = new URL('__offline_complete__', base).href;
    let busy = false;
    const showStatus = async () => {
      if (busy) return;
      const cache = await caches.open(fullCache);
      const receipt = await cache.match(marker);
      let complete = false;
      if (receipt) {
        const urls = await receipt.json();
        const saved = new Set((await cache.keys()).map(request => request.url));
        complete = urls.every(url => saved.has(url));
      }
      message.textContent = complete
        ? `${navigator.onLine ? '完整離線版已儲存' : '目前沒有網路・完整離線版已儲存'}：主 App 與兩個閱讀入口全二十冊可離線開啟。`
        : '主 App 基本功能已可離線使用。請下載完整版，保存全二十冊與圖檔。';
      button.textContent = complete ? '重新下載／更新完整離線版' : '下載完整離線版';
    };
    button.disabled = false;
    await showStatus();
    window.addEventListener('online', showStatus);
    window.addEventListener('offline', showStatus);
    button.addEventListener('click', async () => {
      busy = true;
      button.disabled = true;
      progress.hidden = false;
      progress.value = 0;
      message.textContent = '正在下載，請保持畫面開啟…';
      // A staging cache preserves the last complete copy if an update fails.
      const stagingName = `${prefix}staging:${Date.now()}`;
      try {
        const response = await fetch('zhengshi-articles/data/figures.json', { cache: 'reload' });
        if (!response.ok) throw new Error('無法讀取圖檔清單');
        const labels = await response.json();
        const urls = [...new Set([...ICHING_CORE_FILES, ...ICHING_READING_FILES,
          ...labels.map(label => `zhengshi-articles/figures/${encodeURIComponent(label)}.png`)]
          .map(path => new URL(path, base).href))];
        const staging = await caches.open(stagingName);
        progress.max = urls.length;
        for (const url of urls) {
          const asset = await fetch(url, { cache: 'reload' });
          if (!asset.ok) throw new Error('檔案下載失敗');
          await staging.put(url, asset);
          progress.value++;
          message.textContent = `正在下載 ${progress.value} / ${urls.length}，請保持畫面開啟…`;
        }
        const target = await caches.open(fullCache);
        await target.delete(marker);
        for (const url of urls) await target.put(url, await staging.match(url));
        await target.put(marker, new Response(JSON.stringify(urls)));
        for (const key of await caches.keys()) {
          if (key.startsWith(`${prefix}full:`) && key !== fullCache) await caches.delete(key);
        }
        await navigator.storage?.persist?.().catch(() => false);
        busy = false;
        await showStatus();
      } catch (error) {
        message.textContent = '下載未完成，尚不能保證全部內容可離線使用。請確認網路與裝置剩餘空間，再按一次重試。';
        button.textContent = '重試下載完整離線版';
      } finally {
        await caches.delete(stagingName);
        busy = false;
        button.disabled = false;
        progress.hidden = true;
      }
    });
    if (registration.waiting) message.textContent += ' 有新版本，關閉所有 App 視窗後重新開啟即可套用。';
  } catch {
    message.textContent = '離線準備未完成，請連網重新開啟此頁再試。';
  }
})();
