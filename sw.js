const CACHE_VERSION = "v3";
const CACHE_NAME = `ricardo-portfolio-${CACHE_VERSION}`;

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/profile.jpg",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

const OPTIONAL_ASSETS = [
  "/Ricardo-Tuazon-Jr.pdf",
  "/Recommendation%20Letter.pdf"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        await Promise.all(
          [...CORE_ASSETS, ...OPTIONAL_ASSETS].map(async url => {
            try {
              const response = await fetch(url, { cache: "no-cache" });
              if (response.ok) await cache.put(url, response);
            } catch {
              // Optional assets may not exist yet; do not fail SW installation.
            }
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith("ricardo-portfolio-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function isNavigation(request) {
  return request.mode === "navigate" ||
    request.destination === "document" ||
    new URL(request.url).pathname.endsWith(".html");
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match("/")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const refresh = fetch(request)
        .then(response => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || refresh;
    })
  );
});
