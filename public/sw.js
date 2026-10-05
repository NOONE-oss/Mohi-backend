// Minimal service worker: makes the site installable. Pages always come from the network first,
// so a new deploy shows up straight away; the saved copy is only used when the phone is offline.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || r.mode !== 'navigate') return; // never touch API calls
  e.respondWith(
    fetch(r).then((res) => {
      const copy = res.clone();
      caches.open('mohi-shell').then((c) => c.put('/', copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('/'))
  );
});
