/* Offline app shell. NEVER cache authenticated WebDAV responses. */
const CACHE_NAME = 'kcal-lite-shell-2026-10-17-v5';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    await cache.addAll(APP_SHELL);
    // The HTML currently uses Tailwind's CDN compiler. Store a copy for offline reopening.
    try {
      const url = 'https://cdn.tailwindcss.com/';
      const response = await fetch(url, {mode: 'no-cors'});
      await cache.put(url, response);
    } catch (_) { /* best-effort; app shell still installs */ }
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('kcal-lite-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Absolutely no handling/caching of user data, even unauthenticated reads.
  if (url.hostname === 'pica.tailda1815.ts.net') return;
  const isLocal = url.origin === self.location.origin;
  const isExternalAsset = ['cdn.tailwindcss.com', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname);
  if (!isLocal && !isExternalAsset) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy)); }
      return response;
    }).catch(async () => (await caches.match('./index.html')) || Response.error()));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok || response.type === 'opaque') {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
    }
    return response;
  })));
});
