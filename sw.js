const CACHE_VERSION = "v7-production-fix";
const CACHE_NAME = `ricardo-portfolio-${CACHE_VERSION}`;

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/hotfix.css",
  "/hotfix.js",
  "/assets/css/design-system.css",
  "/assets/css/style.css",
  "/assets/js/nav.js",
  "/assets/js/home.js",
  "/assets/js/script.js",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

const OPTIONAL_ASSETS = [
  "/og-image.jpg",
  "/profile.jpg",
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
            } catch (_) {}
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
  return request.mode === "navigate" || request.destination === "document";
}

async function injectHotfixes(response) {
  if (!response || !response.ok) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  const original = await response.text();
  const cleaned = original
    .replace(/^\s*```(?:html)?\s*$/gim, "")
    .replace(/^\s*```\s*$/gim, "");

  const injected = cleaned.replace(
    /<\/head>/i,
    '  <link rel="stylesheet" href="/hotfix.css?v=7"><script src="/hotfix.js?v=7" defer></script>\n</head>'
  );

  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.delete("content-length");

  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isNavigation(request)) {
    event.respondWith(
      fetch(request, { cache: "no-cache" })
        .then(injectHotfixes)
        .then(response => {
          if (response && response.ok) {
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
      const refresh = fetch(request, { cache: "no-cache" })
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
