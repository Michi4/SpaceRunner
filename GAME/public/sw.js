/* SpaceRunner service worker – static-asset cache only.
   Strategy: cache-first for versioned static assets (css/js/img/font),
   network-first for navigations, network-only for APIs/sockets. */
'use strict';

const CACHE = 'spacerunner-static-v1';
const STATIC_RE = /\.(css|js|png|jpg|jpeg|gif|webp|avif|svg|woff2?|ttf|eot|mp3|ogg|webmanifest)$/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(['/', '/css/style.css', '/js/common.js', '/img/icon-192.png'])
    ).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache dynamic endpoints or the multiplayer socket
  if (url.pathname.startsWith('/php/') ||
      url.pathname.startsWith('/socket.io/') ||
      url.pathname.endsWith('.php') ||
      url.pathname.startsWith('/login/') && url.pathname.endsWith('.php')) {
    return;
  }

  if (request.mode === 'navigate') {
    // Network first for pages, offline fallback to cached home
    event.respondWith(
      fetch(request).catch(() => caches.match('/').then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  if (STATIC_RE.test(url.pathname)) {
    // Cache first for static assets
    event.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit;
        return fetch(request).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        });
      })
    );
  }
});
