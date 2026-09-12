const CACHE_NAME = "profit-kalkukator-v1";
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/storage.js",
  "./js/calculations.js",
  "./js/file-manager.js",
  "./js/table-manager.js",
  "./js/calculator.js",
  "./js/notes.js",
  "./js/backup.js",
  "./js/settings.js",
  "./js/navigation.js",
  "./js/app.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)));
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});