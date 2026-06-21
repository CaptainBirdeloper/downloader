const CACHE_NAME = 'yt-downloader-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/static/css/reset.css',
  '/static/css/layout.css',
  '/static/css/form.css',
  '/static/css/status.css',
  '/static/js/api.js',
  '/static/js/status-display.js',
  '/static/js/form-handler.js',
  '/static/js/segmented-button.js',
  '/static/js/main.js',
  '/static/images/icon.svg',
  '/static/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only intercept GET requests, skip dynamic APIs/streams
  if (event.request.method !== 'GET' || 
      event.request.url.includes('/download-stream') || 
      event.request.url.includes('/status') ||
      event.request.url.includes('/browse')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetch(event.request).catch(() => {
          // Offline fallback
          return caches.match('/');
        });
      })
  );
});
