const offlineCacheName = 'zhengshi-articles-offline-2026-09-25-1';
const cachePrefix = 'zhengshi-articles-offline-';
const shellFiles = ['./', './index.html', './reader.js', './data/figures.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(offlineCacheName)
      .then(cache => cache.addAll(shellFiles))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(cachePrefix) && key !== offlineCacheName)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(offlineCacheName).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match(new URL('./', self.registration.scope), { ignoreSearch: true });
        }
        throw new Error('Offline asset is not cached');
      }),
  );
});
