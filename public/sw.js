// Stock Pulse Service Worker (네트워크 우선 + 자동 캐시 갱신)
const CACHE_NAME = 'stock-pulse-cache-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name); // 이전 캐시 강제 삭제
          }
        })
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 외부 API 호출(토스증권 등) 또는 API 프록시 경로, 비-GET 요청은 캐시 fallback을 타지 않음
  const isApiRequest =
    url.hostname.includes('tossinvest.com') ||
    url.pathname.includes('/toss-api') ||
    event.request.method !== 'GET';

  if (isApiRequest) {
    // API 요청은 네트워크로만 직행하며, 네트워크 에러 시 index.html을 fallback으로 반환하지 않음
    return;
  }

  // 정적 리소스(HTML, JS, CSS, 이미지) 네트워크 우선 전략
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          // 탐색(페이지 이동) 요청일 때만 index.html 반환
          if (event.request.mode === 'navigate') {
            return cached || caches.match('./');
          }
          return cached;
        });
      })
  );
});
