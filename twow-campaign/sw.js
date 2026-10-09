// Offline cache for the GitHub Pages build. The build replaces 35742fe988, so every release gets a fresh cache.
const CACHE = 'twow-campaign-35742fe988';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('twow-campaign-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// The page: the network first (so a new release arrives), the cached copy when offline or slow.
// Fonts: the cached copy first, fetched and kept on the first visit with a connection.
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(CACHE).then(async c => (await c.match(req)) || fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; })));
    return;
  }
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      // GitHub Pages lets browsers keep the page for 10 minutes: ask the server every time (cache: no-cache)
      const net = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => { if (r.ok) c.put('index.html', r.clone()); return r; });
      const slow = new Promise(res => setTimeout(res, 4000));
      try {
        const r = await Promise.race([net, slow.then(() => null)]);
        if (r) return r;
      } catch {}
      return (await c.match('index.html')) || net;
    })());
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
