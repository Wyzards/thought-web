const CACHE_NAME = 'thought-web-cache-v5'; // <-- bump version to invalidate old cache
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
  console.log('[SW] Activate event');
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

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.mode === 'navigate') {
    // Network-first for navigation requests (HTML)
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache-first for everything else
    event.respondWith(
      caches.match(request).then(response => response || fetch(request))
    );
  }
});

function sendMessageToClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage(`[SW] ${message}`));
  });
}
