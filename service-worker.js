/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* global self, caches, Promise, fetch */

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v20240226-101017';
const RUNTIME = 'runtime';

/**
 * How to build cache list?
 * 
 * 1. FilelistCreator 
 * 2. String replace
 */

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  "dist/4.js",
  "dist/5.js",
  "dist/7.js",
  "dist/7.js.map",
  "dist/asset/brand-icons.eot",
  "dist/asset/brand-icons.svg",
  "dist/asset/brand-icons.ttf",
  "dist/asset/brand-icons.woff",
  "dist/asset/brand-icons.woff2",
  "dist/asset/bunny-rabbit-usagi-fN4xUMSYESWeF8sZoC.gif",
  "dist/asset/bunny-rabbit.gif",
  "dist/asset/confused-bunny.gif",
  "dist/asset/demo.png",
  "dist/asset/easter-bunny-illustration-gif-by-emilia-desert.gif",
  "dist/asset/flags.png",
  "dist/asset/happy-bunny-rabbit-gif-by-lisa-vertudaches.gif",
  "dist/asset/heart-117_256.gif",
  "dist/asset/heart-love.gif",
  "dist/asset/holiday-festival2.gif",
  "dist/asset/icons.eot",
  "dist/asset/icons.svg",
  "dist/asset/icons.ttf",
  "dist/asset/icons.woff",
  "dist/asset/icons.woff2",
  "dist/asset/jump-bunny-gif-by-oliver-sin.gif",
  "dist/asset/molangofficialpage-love-cute-5bdhq6YF0szPaCEk9Y.gif",
  "dist/asset/outline-icons.eot",
  "dist/asset/outline-icons.svg",
  "dist/asset/outline-icons.ttf",
  "dist/asset/outline-icons.woff",
  "dist/asset/outline-icons.woff2",
  "dist/asset/qrcode.png",
  "dist/asset/qrcode.svg",
  "dist/asset/rabbit-chasing-carrot.gif",
  "dist/asset/white-rabbit.gif",
  "dist/components/ConfigurationPanel.js",
  "dist/components/ConfigurationPanel.js.map",
  "dist/components/ConfigurationToggleButton.js",
  "dist/components/ConfigurationToggleButton.js.map",
  "dist/components/VotePanel.js",
  "dist/components/VotePanel.js.map",
  "dist/components/WebcamVideo.js",
  "dist/components/WebcamVideo.js.map",
  "dist/index.js",
  "dist/index.js.map",
  "dist/vendors/semantic-ui-niwsf.js",
  "dist/vendors/semantic-ui-niwsf.js.map",
  "dist/vendors~components/VotePanel.js",
  "dist/vendors~components/VotePanel.js.map",
  "assets/cast-qr-code.svg",
  "assets/favicon/README.md",
  "assets/favicon/favicon.png",
  "assets/favicon/generator/android-icon-144x144.png",
  "assets/favicon/generator/android-icon-192x192.png",
  "assets/favicon/generator/android-icon-36x36.png",
  "assets/favicon/generator/android-icon-48x48.png",
  "assets/favicon/generator/android-icon-72x72.png",
  "assets/favicon/generator/android-icon-96x96.png",
  "assets/favicon/generator/apple-icon-114x114.png",
  "assets/favicon/generator/apple-icon-120x120.png",
  "assets/favicon/generator/apple-icon-144x144.png",
  "assets/favicon/generator/apple-icon-152x152.png",
  "assets/favicon/generator/apple-icon-180x180.png",
  "assets/favicon/generator/apple-icon-57x57.png",
  "assets/favicon/generator/apple-icon-60x60.png",
  "assets/favicon/generator/apple-icon-72x72.png",
  "assets/favicon/generator/apple-icon-76x76.png",
  "assets/favicon/generator/apple-icon-precomposed.png",
  "assets/favicon/generator/apple-icon.png",
  "assets/favicon/generator/browserconfig.xml",
  "assets/favicon/generator/favicon-16x16.png",
  "assets/favicon/generator/favicon-32x32.png",
  "assets/favicon/generator/favicon-96x96.png",
  "assets/favicon/generator/favicon.ico",
  "assets/favicon/generator/manifest.json",
  "assets/favicon/generator/ms-icon-144x144.png",
  "assets/favicon/generator/ms-icon-150x150.png",
  "assets/favicon/generator/ms-icon-310x310.png",
  "assets/favicon/generator/ms-icon-70x70.png",
  "assets/nic-drivers/Linux/AX88179_178A_LINUX_DRIVER_v1.20.0_SOURCE.tar.bz2",
  "assets/nic-drivers/macos/ASIX_USB_Device_Installer_macOS_11.0_above_Driver_v1.2.0.zip",
  "assets/nic-drivers/macos/ASIX_USB_Device_Installer_macOS_11.3_to11.6_Driver_v1.3.0.zip",
  "assets/nic-drivers/macos/ASIX_USB_Device_Installer_macOS_12_Driver_v2.1.0.zip",
  "assets/nic-drivers/macos/AX88179_178A_macOS_10.9_to_10.15_Driver_Installer_v2.19.0.zip",
  "assets/nic-drivers/windows/Windows 10/AX88179x_178A_772D_Win10_v2.20.8.0_Drivers_Setup_v1.0.10.0.zip",
  "assets/nic-drivers/windows/Windows 11/AX88179x_178A_772D_Win11_v2.22.3.0_Drivers_Setup_v1.0.1.0.zip",
  "assets/nic-drivers/windows/Windows 7/AX88179_178A_Win7_v1.x.11.0_Drivers_Setup_v3.0.6.0.zip",
  "assets/nic-drivers/windows/Windows 8/AX88179_178A_Win8.x_v1.18.5.0_Drivers_Setup_v1.0.4.0.zip",
  "assets/nic-drivers/windows/Windows XP_Vista/AX88179_178A_WinXP_Vista_v1.x.2.0_Drivers_Setup_v1.0.4.0.zip",
  "assets/setup-hotspot.ps1",
  "assets/setup.bat",
  "assets/share-network.ps1",
  "index.html",
  "manifest.json",
  "service-worker.js"
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});