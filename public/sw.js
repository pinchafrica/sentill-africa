self.addEventListener('install', (event) => {
  console.log('Service worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});

// A simple fetch listener is required for some browsers to trigger the PWA install prompt.
self.addEventListener('fetch', (event) => {
  // Let the browser handle standard requests for now. 
  // Advanced caching can be implemented in v2.
});
