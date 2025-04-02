// public/service-worker.js
const CACHE_NAME = 'richbook-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/encrypted/page1.ifp',
  '/encrypted/page2.ifp',
  '/encrypted/page3.ifp',
  '/encrypted/page4.ifp',
  '/encrypted/page5.ifp',
  '/encrypted/page6.ifp',
  '/encrypted/page7.ifp',
  // diğer sayfalar...
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});