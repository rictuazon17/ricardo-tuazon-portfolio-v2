const CACHE_VERSION = "v9-visual-restoration";
const CACHE_NAME = `ricardo-portfolio-${CACHE_VERSION}`;

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/script.js",
  "/visual-fix.js",
  "/assets/css/design-system.css",
  "/assets/css/style.css",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

const OPTIONAL_ASSETS = [
  "/og-image.jpg",
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
              const response = await fetch(url, { cache: "no-store" });
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

async function injectVisualFix(response) {
  if (!response || !response.ok) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  const original = await response.text();
  const cleaned = original
    .replace(/^\s*```(?:html)?\s*$/gim, "")
    .replace(/^\s*```\s*$/gim, "");

  if (cleaned.includes('/visual-fix.js')) {
    return new Response(cleaned, { status: response.status, statusText: response.statusText, headers: response.headers });
  }

  const injected = cleaned.replace(
    /<\/head>/i,
    '  <script src="/visual-fix.js?v=9" defer></script>\n</head>'
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
      fetch(request, { cache: "no-store" })
        .then(injectVisualFix)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put("/index.html", copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match("/index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const refresh = fetch(request, { cache: "no-store" })
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
