const CACHE_NAME = 'thought-web-cache-v2'; // <-- bump version to invalidate old cache
const urlsToCache = ['/', '/index.html', '/manifest.json']; // always include '/' for proper root caching

// 🔁 Cache assets on install and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting(); // force install phase to activate right away
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ✅ Take control of uncontrolled pages right after activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  return self.clients.claim(); // immediately control all tabs
});

// 🔄 Cache-first fetch, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});
