// VidyaMagic Service Worker — offline-first
const CACHE = 'vidyamagic-v3';
const ASSETS = [
  '/',
  '/prototype.html',
  '/topic-addition.html',
  '/manifest.json',
  '/css/themes.css',
  '/js/theme.js',
  '/js/progress.js',
  '/js/adaptive.js',
  '/js/api.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // never cache API calls
  if (e.request.url.includes('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match('/prototype.html')))
  );
});
