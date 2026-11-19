/* Offline shell + font cache. Network-first for the app page so updates always arrive. */
const V='tls-v2.9.2',SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 const font=/fonts\.(googleapis|gstatic)\.com$|cdnjs\.cloudflare\.com$/.test(u.hostname);
 if(font){e.respondWith(caches.open(V).then(c=>c.match(r).then(h=>{
   /* never give a cached opaque (no-cors) copy to a CORS request: it errors and export fonts silently fall back */
   if(h&&!(h.type==='opaque'&&r.mode==='cors'))return h;
   return fetch(r).then(n=>{if(n.ok||(n.type==='opaque'&&r.mode!=='cors'))c.put(r,n.clone());return n})})));return}
 if(u.origin===location.origin)e.respondWith(fetch(r).then(n=>{const cp=n.clone();caches.open(V).then(c=>c.put(r,cp));return n}).catch(()=>caches.match(r)))});
