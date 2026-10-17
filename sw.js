const CACHE = 'treino-aluno-v4';

const FIREBASE_LIBS = [
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
];

const LOCAL_FILES = [
  './',
  './index.html',
  './aluno.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all([
        ...FIREBASE_LIBS.map(url =>
          fetch(url, { mode: 'no-cors' })
            .then(res => cache.put(url, res))
            .catch(() => {})
        ),
        ...LOCAL_FILES.map(url => cache.add(url).catch(() => {}))
      ])
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Arquivos do próprio site: tenta rede, cai pro cache se estiver offline
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then(m => m || caches.match('./index.html'))
        )
    );
    return;
  }

  // Só as bibliotecas do Firebase (gstatic) usam cache.
  // Firestore, Auth e qualquer outro domínio vão direto pela rede.
  if (url.hostname === 'www.gstatic.com') {
    event.respondWith(caches.match(req).then(m => m || fetch(req)));
  }
});
