/* Tourism Layout Studio service worker (v2.3.0): makes the app open offline.
   - App shell: network first (so updates arrive), cache fallback.
   - Fonts and export libraries from Google Fonts / cdnjs: cached after first load. */
const V = 'tls-v2.3.0';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const EXT = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const put = (req, res) => {
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    caches.open(V).then(c => c.put(req, copy));
  }
  return res;
};

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const same = u.origin === location.origin;
  if (!same && !EXT.includes(u.hostname)) return;

  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r).then(res => put(r, res)).catch(() => caches.match(r).then(h => h || caches.match('./index.html')))
    );
    return;
  }
  // stale-while-revalidate for everything else
  e.respondWith(
    caches.match(r).then(hit => {
      const net = fetch(r).then(res => put(r, res)).catch(() => hit);
      return hit || net;
    })
  );
});
