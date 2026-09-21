// Stock Pulse Service Worker (오프라인 캐시 지원)
const CACHE_NAME = 'stock-pulse-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 캐시 우선 및 네트워크 폴백
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // 오프라인 폴백
        return caches.match('/');
      });
    })
  );
});
