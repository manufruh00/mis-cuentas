// Guarda la app en el dispositivo para que abra sin internet.
// Los archivos de código tienen nombre único por versión, así que se guardan una vez;
// la página principal se pide siempre a internet primero, para recibir las mejoras.
const CACHE = 'mis-cuentas-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  const esPagina = req.mode === 'navigate';
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      if (esPagina) {
        try {
          const res = await fetch(req);
          cache.put(req, res.clone());
          return res;
        } catch {
          return (await cache.match(req)) || (await cache.match('./')) || Response.error();
        }
      }
      const guardado = await cache.match(req);
      if (guardado) return guardado;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    }),
  );
});
