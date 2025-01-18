const CACHE_NAME = 'habit-tracker-v1';
const urlsToCache = [
  '/cycle-tracker/',
  '/cycle-tracker/index.html',
  '/cycle-tracker/styles.css',
  '/cycle-tracker/script.js',
  '/cycle-tracker/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
