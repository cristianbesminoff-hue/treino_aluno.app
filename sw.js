const C = 'treino-aluno-v1', P = ['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => Promise.all([...P.map(u => fetch(u, { mode: 'no-cors' }).then(r => c.put(u, r)).catch(() => { })), c.addAll(['./', 'aluno.html', 'manifest.json', 'icon-192.png', 'icon-512.png']).catch(() => { })]))) });
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
    const r = e.request, u = new URL(r.url);
    if (r.method !== 'GET') return;
    if (u.origin === location.origin) e.respondWith(fetch(r).then(x => { const k = x.clone(); caches.open(C).then(c => c.put(r, k)); return x }).catch(() => caches.match(r).then(m => m || caches.match('aluno.html'))));
    else e.respondWith(caches.match(r).then(m => m || fetch(r)));
});
