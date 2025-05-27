const CACHE_NAME = 'nutriscan-ai-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add paths to key icons used in manifest & apple-touch-icons if they were actual files
  // These are placeholders. Actual files should be added to the /icons/ directory.
  '/icons/icon-192x192.png', 
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon-180x180.png'
  // The main JS bundle will be implicitly handled by the browser or cached if fetched via network-first strategy.
  // For esm.sh imports, the browser's cache and esm.sh's own CDN caching are primary.
  // This service worker focuses on caching the app's own static shell.
];

// Install event: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell:', error);
      })
  );
});

// Fetch event: Serve cached assets if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  // Let the browser handle requests for external resources like esm.sh, Google Fonts
  if (event.request.url.startsWith('https://esm.sh') || 
      event.request.url.startsWith('https://fonts.googleapis.com') || 
      event.request.url.startsWith('https://fonts.gstatic.com') ||
      event.request.url.startsWith('https://cdn.tailwindcss.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Serve from cache
        }
        // Not in cache, fetch from network
        return fetch(event.request).then(
          (networkResponse) => {
            // If request is successful, clone it and cache it for future use.
            // Only cache GET requests with successful responses.
            if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
              // Ensure we only cache responses that are not opaque (e.g. no-cors requests to third-party CDNs that don't set CORS headers)
              // For simplicity here, assuming 'basic' type covers our own assets.
              if (networkResponse.type === 'basic' || urlsToCache.includes(new URL(event.request.url).pathname)) {
                 const responseToCache = networkResponse.clone();
                 caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
            }
            return networkResponse;
          }
        );
      }
    ).catch(() => {
      // Fallback for navigation requests if network fails and not in cache
      // This is a very basic offline handling. For a better experience,
      // you might want to serve a dedicated offline.html page.
      if (event.request.mode === 'navigate' && event.request.destination === 'document') {
        return caches.match('/index.html');
      }
      // For other types of requests (images, scripts, etc.), if they fail and are not cached,
      // they will just fail, which is standard browser behavior.
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the new service worker takes control immediately.
  return self.clients.claim();
});
