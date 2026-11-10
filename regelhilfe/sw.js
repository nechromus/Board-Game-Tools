// Regelhilfe: Offline-Kopie der App selbst. Die Spieldaten speichert die Seite in IndexedDB.
// Bei jeder neuen App-Version wird VERSION erhöht, damit der Browser den Service Worker erneuert.
const VERSION = '1.2.0';
const CACHE = 'regelhilfe-' + VERSION;
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'favicon.png', 'lib/qrcode.js', 'lib/jsQR.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('regelhilfe-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // GitHub-API geht direkt ans Netz
  if (url.pathname.endsWith('/version.json')) return;                  // Update-Prüfung immer frisch
  if (req.mode === 'navigate') {
    // Seite: zuerst das Netz (damit neue Versionen ankommen), sonst die gespeicherte Kopie
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const net = fetch(url.origin + url.pathname + url.search, { cache: 'no-cache', credentials: 'same-origin' })
        .then(r => { if (r.ok) c.put('index.html', r.clone()); return r; });
      const slow = new Promise(res => setTimeout(res, 4000));
      try { const r = await Promise.race([net, slow.then(() => null)]); if (r) return r; } catch (err) {}
      return (await c.match('index.html')) || net;
    })());
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
