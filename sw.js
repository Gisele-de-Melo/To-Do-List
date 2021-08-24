// This is the service worker with the Cache-first network

const CACHE = "pwabuilder-precache";
const precacheFiles = [
  './', 
  './assets/bg-desktop-dark-splash.png', 
  './assets/favicon.png', 
  './assets/bg-desktop-light-mobile.png', 
  './assets/bg-desktop-dark-mobile.png', 
  './assets/icon-check.svg', 
  './assets/icon-sun.svg',
  './assets/icon-moon.svg']

self.addEventListener("install", function (event) {
  console.log("[PWA Builder] Install Event processing");

  console.log("[PWA Builder] Skip waiting on install");
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      console.log("[PWA Builder] Caching pages during install");
      return cache.addAll(precacheFiles);
    })
  );
});

// Allow sw to control of current page
self.addEventListener("activate", function (event) {
  console.log("[PWA Builder] Claiming clients for current page");
  event.waitUntil(self.clients.claim());
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) { 
  if (event.request.method !== "GET") return;

  event.respondWith(
    fromCache(event.request).then(
      function (response) {
        // The response was found in the cache so we responde with it and update the entry

        // This is where we call the server to get the newest version of the
        // file to use the next time we show view
        event.waitUntil(
          fetch(event.request).then(function (response) {
            return updateCache(event.request, response);
          })
        );

        return response;
      },
      function () {
        // The response was not found in the cache so we look for it on the server
        return fetch(event.request)
          .then(function (response) {
            // If request was success, add or update it in the cache
            event.waitUntil(updateCache(event.request, response.clone()));

            return response;
          })
          .catch(function (error) {
            console.log("[PWA Builder] Network request failed and no cache." + error);
          });
      }
    )
  );
});

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match");
      }

      return matching;
    });
  });
}

function updateCache(request, response) {
  return caches.open(CACHE).then(function (cache) {
    return cache.put(request, response);
  });
}











// self.addEventListener('install', e =>{
//   e.waitUntil(
//     caches.open('static').then(cache =>{
//       return cache.addAll(['./', './assets/bg-desktop-dark-splash.png', './assets/favicon.png', './assets/bg-desktop-dark-mobile.png', './assets/icon-check.svg', './assets/icon-sun.svg'])
//     }

//     )
//   )
// })

// self.addEventListener('fetch', e => {
//   e.respondWith(
//     caches.match(e.request).then(response => {
//       return response || fetch(e.request);
//     })
//   )
// })

// self.addEventListener("activate", function(event) {
//   /* Just like with the install event, event.waitUntil blocks activate on a promise.
//      Activation will fail unless the promise is fulfilled.
//   */
//   console.log('WORKER: activate event in progress.');

//   event.waitUntil(
//     caches
//       /* This method returns a promise which will resolve to an array of available
//          cache keys.
//       */
//       .keys()
//       .then(function (keys) {
//         // We return a promise that settles when all outdated caches are deleted.
//         return Promise.all(
//           keys
//             .filter(function (key) {
//               // Filter by keys that don't start with the latest version prefix.
//               return !key.startsWith('1.0.0');
//             })
//             .map(function (key) {
//               /* Return a promise that's fulfilled
//                  when each outdated cache is deleted.
//               */
//               return caches.delete(key);
//             })
//         );
//       })
//       .then(function() {
//         console.log('WORKER: activate completed.');
//       })
//   );
// });