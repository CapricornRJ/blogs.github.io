'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "7ec804def52e3b51d4881d28de944e3c",
"index.html": "330651867dd64a2f0d07843cb5b34ea6",
"/": "330651867dd64a2f0d07843cb5b34ea6",
"main.dart.js": "263b30332b4adb69a9a47d797c03ff7e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "1e608d89d44eb1607db73a451c28bcd3",
"assets/AssetManifest.json": "b5e60fa9b8813a5bed748782ea8fe463",
"assets/NOTICES": "3d0c1d66107c4af8a6ad1d304e3d0bd0",
"assets/FontManifest.json": "26ed026e363eb27d37efce26a26e777b",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/assets/images/rander/rander_02.webp": "6088ae0bb1c4166b010b953928c12a79",
"assets/assets/images/rander/rander_03.webp": "ed6d032d2b9510d9c625f11dbc46a394",
"assets/assets/images/rander/rander_08.png": "25202c8d594387e729d669c04c00bcf1",
"assets/assets/images/rander/rander_09.png": "2bd300fa0412e3fbdb3ac933c1842f8f",
"assets/assets/images/rander/rander_04.png": "0cee69c6f32326f727bef22f6b81a1cb",
"assets/assets/images/rander/rander_05.png": "a121faf42462ba438d8d74f12595f26a",
"assets/assets/images/rander/rander_07.png": "d3177fe96c5f21571f0dc662bc4105a6",
"assets/assets/images/rander/rander_06.png": "350663935c2c471f6f65e2523ef407ff",
"assets/assets/images/rander/rander_01.webp": "3540cb0cf8c4fb2ce31b1da21ca76c25",
"assets/assets/images/plugin/plugin_01.png": "a2349d0e857e1e7903adcd3c73327296",
"assets/assets/images/plugin/plugin_03.png": "736562147c8eb0968c10cea608944a15",
"assets/assets/images/plugin/plugin_02.png": "73f663d2efc95a524fa00517f24db9dd",
"assets/assets/images/main_page/header.jpeg": "4d5813e56412b361a71864ba4c6c9919",
"assets/assets/images/main_page/main_page_01.jpg": "61ad3ce1eaf1b8dfa4c1aa3483972c18",
"assets/assets/images/main_page/main_page_04.webp": "efe8bf2fdaa35726eb86281ce1ffbfed",
"assets/assets/images/main_page/main_page_03.jpg": "5dcbfd9946fae870b03ff958472aa67d",
"assets/assets/images/main_page/top_bg.jpg": "10f3e3cf901a4d033fc208efff20e9a4",
"assets/assets/images/main_page/main_page_02.webp": "41c12dd250d8c1b45e4fb14e4a8d84ea",
"assets/assets/images/thread/thread_02.png": "eaab31250401c3a71c36b0d6d21abcc1",
"assets/assets/images/thread/thread_01.png": "2a60bc45e28214512ab867fec96b5d33",
"assets/assets/images/thread/thread_03.webp": "66b8abc5d68a9d6a6ff0cbae345b0eea",
"assets/assets/fonts/iconfont_color.ttf": "666d32f61fe01ea3f063d9e9763a1116",
"assets/assets/fonts/iconfont.ttf": "435862ecc45c9f793b0ba76c86715a7a"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
