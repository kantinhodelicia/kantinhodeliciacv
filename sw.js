// Service Worker Self-Destruct
// This script unregisters itself and clears all caches to fix stale build issues.

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.registration.unregister()
    .then(() => self.clients.matchAll())
    .then((clients) => {
      clients.forEach(client => client.navigate(client.url));
    });
});

caches.keys().then((names) => {
  for (let name of names) caches.delete(name);
});
