// Service worker mínimo, escrito à mão: cuida apenas de tornar o app
// instalável e de manter o "app shell" disponível offline. Não faz cache
// agressivo de dados (transações, dashboards) — esses continuam sempre
// buscando a rede, já que são financeiros e precisam estar atualizados.
const CACHE_NAME = "gastos-da-casa-shell-v1"
const APP_SHELL = ["/", "/manifest.webmanifest", "/icons/icon.svg", "/icons/icon-maskable.svg"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/api/")) return

  // Navegação (trocar de página): tenta a rede primeiro, cai para o cache
  // (app shell) quando offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/").then((res) => res ?? Response.error()))
    )
    return
  }

  // Assets estáticos: cache-first.
  if (request.destination === "style" || request.destination === "script" || request.destination === "image") {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
            return response
          })
      )
    )
  }
})
