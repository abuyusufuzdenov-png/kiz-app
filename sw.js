const CACHE = "kiz-scanner-v2";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "xlsx.full.min.js"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
// Network first (so updates arrive), cache as fallback for offline use
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res && (res.ok || res.type === "opaque")) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(e.request).then((m) => m || (e.request.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
