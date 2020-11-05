var cacheName = 'multiplicar-pwa';
var filesToCache = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/assets/js/code.js',
    '/assets/fonts/lcd.ttf',
    '/assets/fonts/major.ttf',
    '/assets/icon/start.svg',
    '/assets/icon/stop.svg',
    '/assets/icon/bin.svg',
    '/favicon.ico',
    '/assets/icon/icon-144x144.png',
    '/assets/icon/apple-icon-180x180.png'];
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
});
/* Serve cached content when offline */
self.addEventListener('fetch', function (e) {
    e.respondWith(caches.match(e.request).then(function (response) {
        return response || fetch(e.request);
    })
    );
});