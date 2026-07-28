/* =========================================================
   SERVER MAINTENANCE PWA
   Service Worker v1.1.0
========================================================= */

const CACHE_VERSION = "server-maintenance-pwa-v1.1.0";

const APP_SHELL = [
  "./",
  "./index.html",
  "./teacher.html",
  "./offline.html",

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

  "./manifest.json",

  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/favicon.png",

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
   INSTALL
========================================================= */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);

      await Promise.allSettled(
        APP_SHELL.map(async (file) => {
          try {
            await cache.add(file);
            console.log("[PWA] Dicache:", file);
          } catch (error) {
            console.warn(
              "[PWA] Gagal cache:",
              file,
              error
            );
          }
        })
      );

      await self.skipWaiting();
    })()
  );
});

/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith(
                "server-maintenance-pwa-"
              ) &&
              cacheName !== CACHE_VERSION
          )
          .map((oldCache) =>
            caches.delete(oldCache)
          )
      );

      await self.clients.claim();

      console.log(
        "[PWA] Service Worker aktif:",
        CACHE_VERSION
      );
    })()
  );
});

/* =========================================================
   TAPIS PERMINTAAN
========================================================= */

function shouldSkipRequest(request) {
  if (request.method !== "GET") {
    return true;
  }

  const url = new URL(request.url);

  if (
    url.hostname.includes("firebasedatabase.app") ||
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com")
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   NAVIGASI HTML
   Network dahulu, cache jika offline
========================================================= */

async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);

    if (
      networkResponse &&
      networkResponse.ok
    ) {
      const cache = await caches.open(CACHE_VERSION);

      await cache.put(
        request,
        networkResponse.clone()
      );
    }

    return networkResponse;
  } catch (error) {
    const cachedPage = await caches.match(request);

    if (cachedPage) {
      return cachedPage;
    }

    const offlinePage =
      await caches.match("./offline.html");

    if (offlinePage) {
      return offlinePage;
    }

    const indexPage =
      await caches.match("./index.html");

    if (indexPage) {
      return indexPage;
    }

    return new Response(
      `
        <!doctype html>
        <html lang="ms">
        <head>
          <meta charset="utf-8">

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          >

          <title>
            SERVER MAINTENANCE – Offline
          </title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              padding: 24px;
              background:
                linear-gradient(
                  135deg,
                  #071a2d,
                  #0b3357
                );
              color: #ffffff;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
              text-align: center;
            }

            .offline-card {
              width: min(520px, 100%);
              padding: 32px;
              border: 1px solid
                rgba(255,255,255,.18);
              border-radius: 24px;
              background:
                rgba(0,0,0,.28);
              box-shadow:
                0 20px 60px
                rgba(0,0,0,.35);
            }

            h1 {
              margin-top: 0;
              color: #ffad1f;
            }

            button {
              margin-top: 18px;
              padding: 12px 22px;
              border: 0;
              border-radius: 12px;
              background: #168cff;
              color: white;
              font-weight: 700;
              cursor: pointer;
            }
          </style>
        </head>

        <body>
          <main class="offline-card">

            <div style="font-size:56px">
              🖥️
            </div>

            <h1>
              SERVER MAINTENANCE
            </h1>

            <p>
              Aplikasi sedang digunakan tanpa
              sambungan Internet.
            </p>

            <p>
              Sila buka aplikasi sekali dengan
              Internet supaya semua halaman dapat
              disimpan untuk penggunaan offline.
            </p>

            <button onclick="location.reload()">
              Cuba Semula
            </button>

          </main>
        </body>
        </html>
      `,
      {
        headers: {
          "Content-Type":
            "text/html; charset=utf-8"
        }
      }
    );
  }
}

/* =========================================================
   FAIL STATIK
   Cache dahulu, kemudian kemas kini
========================================================= */

async function handleStaticRequest(request) {
  const cachedResponse =
    await caches.match(request);

  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      if (
        networkResponse &&
        (
          networkResponse.ok ||
          networkResponse.type === "opaque"
        )
      ) {
        const cache =
          await caches.open(CACHE_VERSION);

        await cache.put(
          request,
          networkResponse.clone()
        );
      }

      return networkResponse;
    })
    .catch(() => null);

  if (cachedResponse) {
    networkPromise.catch(() => null);
    return cachedResponse;
  }

  const networkResponse =
    await networkPromise;

  if (networkResponse) {
    return networkResponse;
  }

  return new Response("", {
    status: 504,
    statusText: "Offline"
  });
}

/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (shouldSkipRequest(request)) {
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
   MESSAGE
========================================================= */

self.addEventListener("message", (event) => {
  if (
    event.data &&
    event.data.type === "SKIP_WAITING"
  ) {
    self.skipWaiting();
  }
});
