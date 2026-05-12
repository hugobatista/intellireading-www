/* Intellireading Service Worker
 *
 * Improves repeat-visit performance and offline capability by caching:
 *   - Pyodide WebAssembly assets (loaded from jsDelivr CDN)
 *   - Python package wheels (from files.pythonhosted.org / pypi.org)
 *   - Same-origin page assets (network-first, cache fallback)
 *
 * Caching strategy for CDN resources:  cache-first with TTL expiry,
 * falling back to network.  Stale entries are refreshed on the next
 * request after the TTL window elapses.
 *
 * Caching strategy for same-origin:   network-first, so HTML etc stays fresh
 * while cached assets serve as offline fallback.
 *
 * The Service Worker is registered from index.html and is scoped to the site root.
 */

var CACHE = 'intellireading-pyodide-v0.29.4';
var CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — CDN assets are refreshed after this window

// CDN prefixes whose responses should always be cached (cache-first with TTL on re-visit)
var STATIC_CDNS = [
  'https://cdn.jsdelivr.net/pyodide/',
  'https://files.pythonhosted.org/',
  'https://pypi.org/',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/',
];

/* ---- Install -----------------------------------------------------------
 * Don't block on pre-caching – assets are cached progressively on first fetch.
 * Skip waiting so the SW activates immediately.
 */
self.addEventListener('install', function () {
  self.skipWaiting();
});

/* ---- Activate ----------------------------------------------------------
 * Delete old caches so stale data doesn't linger.
 */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return k !== CACHE;
            })
            .map(function (k) {
              return caches.delete(k);
            }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

/* ---- Fetch -----------------------------------------------------------
 * 1) CDN assets (Pyodide, PyPI, etc.): cache-first, populate on first fetch.
 * 2) Same-origin: network-first so pages stay fresh, cache as offline backup.
 * 3) Everything else: network-only.
 */
self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  // --- CDN assets (cache-first) ---
  if (STATIC_CDNS.some(function (prefix) {
    return url.startsWith(prefix);
  })) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // --- Cloudflare Turnstile: always network-only ---
  if (url.startsWith('https://challenges.cloudflare.com/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // --- Same-origin (network-first, cache fallback) ---
  if (url.startsWith(self.location.origin)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // --- Everything else: pass through ---
});

/* ---- Cache-first strategy (with TTL expiry) ----------------------------*/
function cacheFirst(request) {
  return caches.match(request).then(function (cached) {
    if (!cached) return fetchAndCache(request);

    return isFresh(request).then(function (fresh) {
      if (fresh) return cached;

      return fetch(request).then(function (response) {
        if (response && response.ok) {
          var clone = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(request, clone);
            cache.put(request.url + '@ts', new Response(String(Date.now())));
          });
        }
        return response;
      }).catch(function () {
        return cached;
      });
    }).catch(function () {
      return cached || fetchAndCache(request);
    });
  });
}

function isFresh(request) {
  return caches.match(request.url + '@ts').then(function (meta) {
    if (!meta) return false;
    return meta.text().then(function (ts) {
      return Date.now() - Number(ts) < CACHE_TTL_MS;
    });
  });
}

function fetchAndCache(request) {
  return fetch(request).then(function (response) {
    if (response && response.ok) {
      var clone = response.clone();
      caches.open(CACHE).then(function (cache) {
        cache.put(request, clone);
        cache.put(request.url + '@ts', new Response(String(Date.now())));
      });
    }
    return response;
  }).catch(function () {
    return new Response('Network error', { status: 408 });
  });
}

/* ---- Network-first strategy -------------------------------------------*/
function networkFirst(request) {
  return fetch(request)
    .then(function (response) {
      if (response && response.ok) {
        var clone = response.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(request, clone);
        });
      }
      return response;
    })
    .catch(function () {
      return caches.match(request).then(function (cached) {
        return cached || new Response('Offline', { status: 503 });
      });
    });
}
