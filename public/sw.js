const CACHE_NAME = 'fer-tracker-v1'

// Assets to pre-cache on install
const PRE_CACHE = [
  '/fer-tracker/',
  '/fer-tracker/index.html',
]

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE))
  )
  // Activate immediately without waiting for old clients to close
  self.skipWaiting()
})

// ── Activate: purge old caches ────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: cache-first for assets, network-first for navigation ───────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== location.origin) return

  // Navigation requests: network-first, fallback to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          return res
        })
        .catch(() => caches.match('/fer-tracker/index.html'))
    )
    return
  }

  // Static assets (JS, CSS, fonts, images): cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(res => {
        // Only cache valid responses
        if (!res || res.status !== 200 || res.type === 'opaque') return res
        const clone = res.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        return res
      })
    })
  )
})
