var CACHE_NAME = '%BUILD_UUID%';

var URLS_TO_CACHE = [
  // PAGES
  '/',

  // SERVICE WORKER STUFF
  '/manifest.json?v=OmyXOvd7JZ',

  // HTML
  '/index.html',
  '/safetrack.html',

  // CSS AND JS
  '/styles/main.css?v=%BUILD_UUID%',
  '/js/polyfill.min.js?v=%BUILD_UUID%',
  '/js/app.js?v=%BUILD_UUID%',

  // IMAGES
  '/favicon.ico?v=OmyXOvd7JZ',
  '/favicon-16x16.png?v=OmyXOvd7JZ',
  '/favicon-32x32.png?v=OmyXOvd7JZ',
  '/apple-touch-icon.png?v=OmyXOvd7JZ',
  '/images/metrohero_logo.svg',
  '/images/safari-pinned-tab.svg?v=OmyXOvd7JZ',
  '/images/mstile-150x150.png?v=OmyXOvd7JZ',
  '/images/facebook/og-image.jpg?v=OmyXOvd7JZ',

  // FONTS
  '/fonts/metrohero.eot?yjub33',
  // '/fonts/metrohero.eot?yjub33#iefix', // TODO: Safari for iOS doesn't like this for some reason
  '/fonts/metrohero.ttf?yjub33',
  '/fonts/metrohero.woff?yjub33',
  '/fonts/metrohero.svg?yjub33#metrohero',
  '/fonts/roboto-v16-latin-regular.eot',
  '/fonts/roboto-v16-latin-regular.eot?#iefix',
  '/fonts/roboto-v16-latin-regular.woff2',
  '/fonts/roboto-v16-latin-regular.woff',
  '/fonts/roboto-v16-latin-regular.ttf',
  '/fonts/roboto-v16-latin-regular.svg#Roboto',
  '/fonts/roboto-v16-latin-500.eot',
  '/fonts/roboto-v16-latin-500.eot?#iefix',
  '/fonts/roboto-v16-latin-500.woff2',
  '/fonts/roboto-v16-latin-500.woff',
  '/fonts/roboto-v16-latin-500.ttf',
  '/fonts/roboto-v16-latin-500.svg#Roboto',
  '/fonts/roboto-v16-latin-700.eot',
  '/fonts/roboto-v16-latin-700.eot?#iefix',
  '/fonts/roboto-v16-latin-700.woff2',
  '/fonts/roboto-v16-latin-700.woff',
  '/fonts/roboto-v16-latin-700.ttf',
  '/fonts/roboto-v16-latin-700.svg#Roboto'
];

function shouldBeCached(url) {
  if (!url) {
    return false;
  }

  return URLS_TO_CACHE.some(function(urlToCache) {
    return url === (self.location.origin + urlToCache);
  });
}

self.addEventListener('install', function(event) {
  // pre-cache all necessary files
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(URLS_TO_CACHE);
      })
  );

  // swap out for this service worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // delete all old caches created by any previous service workers
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (!shouldBeCached(event.request.url)) {
    // only some resources should be cached, and this is not one of them,
    // so don't do it and defer to the browser to perform a network request for the resource
    return;
  }

  // our cache should contain the resource we're looking for

  event.respondWith(
    caches.match(event.request)
      .then(function(cachedResponse) {
        if (cachedResponse) {
          // cache hit!
          return cachedResponse;
        }

        // cache miss!
        // maybe our pre-caching failed for this particular resource?
        // regardless, make a network request and try to cache the resource for next time

        var networkRequest = event.request.clone();
        return fetch(networkRequest).then(
          function(networkResponse) {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              var responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
            }

            return networkResponse;
          }
        );
      })
  );
});
