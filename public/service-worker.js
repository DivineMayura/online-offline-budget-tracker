const CACHE_NAME = "budget-tracker-cache-v1";
const DATA_CACHE_NAME = "budget-tracker-data-v1";

// Alll of the files I have chosen to be in the cache
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/db.js",
  "/styles.css",
  "/index.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// install
self.addEventListener("install", function (evt) {

  // pre cache all static assets
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE)) 
    //This is allll the static content
  );
  // tells the browser to activate the waiting service worker as soon as it
  // has finished installing
  self.skipWaiting();
});

// this activates / Cleans Up  and clears the cache of all items that don't match in CACHE_NAME, like things from an old cache
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => { //Cache name
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
// This line tells the new service worker to take over.
  self.clients.claim();
});

// fetch 
self.addEventListener("fetch", function(evt) {

  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
            // If the response was positive, clone it and store it in the cache.        
          .then(response => {
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            // then return the response.
            return response;
          })
          .catch(err => {
            // Happens when the network request fails, tries to get it from the cache.
            return cache.match(evt.request);
          });
        //   Log the error
      }).catch(err => console.log(err))
    );
    return;
  }


  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});
