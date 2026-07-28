/* =========================================================
   SERVER MAINTENANCE PWA
   Service Worker v2.0.0
========================================================= */

const CACHE_NAME = "server-maintenance-pwa-v2.0.0";

const OFFLINE_URL = "./offline.html";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./teacher.html",
  "./offline.html",
  "./manifest.json",

  "./style.css",
  "./teacher.css",

  "./storage.js",
  "./text.js",
  "./missions.js",
  "./badges.js",
  "./app.js",
  "./teacher.js",

  "./firebase-sync.js",
  "./firebase-config.js",

  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/favicon.png",
  "./assets/logo-mentari.jpg",

  "./kp/kp01.html",
  "./kp/kp01.css",
  "./kp/kp01.js",
  "./kp/kp02.html",
  "./kp/kp03.html",
  "./kp/kp04.html",
  "./kp/kp05.html",
  "./kp/kp06.html",
  "./kp/kp07.html",
  "./kp/kp08.html",
  "./kp/kp09.html",
  "./kp/kp10.html",

  "./kt/kt01.html",
  "./kt/kt02.html",
  "./kt/kt03.html",
  "./kt/kt04.html",
  "./kt/kt05.html",
  "./kt/kt06.html",
  "./kt/kt07.html",
  "./kt/kt08.html",
  "./kt/kt09.html",
  "./kt/kt10.html"
];

/* =========================================================
   INSTALL — CACHE SEMUA FAIL
========================================================= */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const file of FILES_TO_CACHE) {
        try {
          const absoluteURL = new URL(
            file,
            self.registration.scope
          ).href;

          const response = await fetch(
            new Request(absoluteURL, {
              cache: "reload"
            })
          );

          if (!response.ok) {
            throw new Error(
              `${response.status} ${response.statusText}`
            );
          }

          await cache.put(
            absoluteURL,
            response.clone()
          );

          console.log("[PWA] Cache berjaya:", file);
        } catch (error) {
          console.error(
            "[PWA] Cache gagal:",
            file,
            error
          );
        }
      }

      await self.skipWaiting();
    })()
  );
});

/* =========================================================
   ACTIVATE — PADAM CACHE LAMA
========================================================= */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith(
                "server-maintenance-pwa-"
              ) &&
              name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();

      console.log(
        "[PWA] Service Worker v2 aktif."
      );
    })()
  );
});

/* =========================================================
   JANGAN CACHE FIREBASE
========================================================= */

function isFirebaseRequest(url) {
  return (
    url.hostname.includes("firebasedatabase.app") ||
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebaseapp.com")
  );
}

/* =========================================================
   CARI FAIL DALAM CACHE
========================================================= */

async function findCachedResponse(request) {
  const cache = await caches.open(CACHE_NAME);

  let response = await cache.match(request, {
    ignoreSearch: true
  });

  if (response) {
    return response;
  }

  const requestURL = new URL(request.url);

  response = await cache.match(requestURL.href, {
    ignoreSearch: true
  });

  return response || null;
}

/* =========================================================
   NAVIGASI HTML
   CACHE DAHULU, INTERNET SEBAGAI SANDARAN
========================================================= */

async function handleNavigation(request) {
  const cachedResponse =
    await findCachedResponse(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse?.ok) {
      const cache = await caches.open(CACHE_NAME);

      await cache.put(
        request,
        networkResponse.clone()
      );
    }

    return networkResponse;
  } catch (error) {
    const offlinePage = await caches.match(
      new URL(
        OFFLINE_URL,
        self.registration.scope
      ).href
    );

    if (offlinePage) {
      return offlinePage;
    }

    return new Response(
      "SERVER MAINTENANCE sedang offline.",
      {
        status: 503,
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8"
        }
      }
    );
  }
}

/* =========================================================
   FAIL CSS, JS DAN GAMBAR
========================================================= */

async function handleStaticRequest(request) {
  const cachedResponse =
    await findCachedResponse(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (
      networkResponse &&
      (
        networkResponse.ok ||
        networkResponse.type === "opaque"
      )
    ) {
      const cache = await caches.open(CACHE_NAME);

      await cache.put(
        request,
        networkResponse.clone()
      );
    }

    return networkResponse;
  } catch (error) {
    return new Response("", {
      status: 504,
      statusText: "Offline"
    });
  }
}

/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (isFirebaseRequest(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      handleNavigation(request)
    );

    return;
  }

  event.respondWith(
    handleStaticRequest(request)
  );
});

/* =========================================================
   ONLINE SEMULA
========================================================= */

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
