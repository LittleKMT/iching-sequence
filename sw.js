importScripts('./offline-assets.js');
const scopeUrl = self.registration.scope;
const cachePrefix = `iching-sequence:${scopeUrl}:`;
const coreCache = `${cachePrefix}core:${ICHING_OFFLINE_VERSION}`;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(coreCache).then(cache => cache.addAll(ICHING_CORE_FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(`${cachePrefix}core:`) && key !== coreCache)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || !url.href.startsWith(scopeUrl)) return;
  // Explicit downloads must fail on network loss, never silently reuse old data.
  if (event.request.cache === 'reload') return;
  // The independent Najia app is outside this offline package.
  if (url.pathname.startsWith(new URL('najia/', scopeUrl).pathname)) return;
  url.search = '';
  url.hash = '';
  event.respondWith((async () => {
    const keys = await caches.keys();
    let cached;
    for (const key of [coreCache, ...keys.filter(key => key.startsWith(`${cachePrefix}full:`)).reverse()]) {
      cached = await (await caches.open(key)).match(url.href);
      if (cached) break;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(event.request, { signal: controller.signal });
      if (response.ok) return response;
      return cached || response;
    } catch {
      return cached || new Response('此頁尚未下載。請連網回到首頁下載完整離線版。', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    } finally {
      clearTimeout(timer);
    }
  })());
});
