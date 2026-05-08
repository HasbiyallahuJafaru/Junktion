const CACHE = 'junktion-v1'

const PRECACHE = [
  '/',
  '/logo.png',
  '/manifest.json',
]

/* Install — precache shell assets */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  )
  self.skipWaiting()
})

/* Activate — delete old caches */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

/* Fetch — network-first for API/admin, cache-first for static assets */
self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  /* Always network for API routes and admin */
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) {
    return
  }

  /* Network-first for navigation (HTML pages) */
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() =>
        caches.match('/').then((r) => r ?? Response.error())
      )
    )
    return
  }

  /* Cache-first for static assets (fonts, images, JS, CSS) */
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }
        const clone = response.clone()
        caches.open(CACHE).then((c) => c.put(request, clone))
        return response
      })
    })
  )
})
