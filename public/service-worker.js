
const CACHE_NAME = 'cutelist-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/87c72f50-f842-4d3f-b009-26dd2477ed51.png',
  '/offline.html'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event with network-first strategy for API requests, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // For API requests (to Supabase), try network first, then fall back to offline page
  if (url.pathname.includes('/rest/') || url.pathname.includes('/auth/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html') || caches.match('/');
        })
    );
    return;
  }

  // For all other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            // Cache the newly fetched resources
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html') || new Response('You are offline');
          }
          
          // Return a default response for other resources
          return new Response('Network error occurred', { 
            status: 408, 
            headers: { 'Content-Type': 'text/plain' } 
          });
        });
      })
  );
});

// Add sync event for background syncing when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-todos') {
    event.waitUntil(syncData('todos'));
  } else if (event.tag === 'sync-memories') {
    event.waitUntil(syncData('memories'));
  } else if (event.tag === 'sync-pomodoro') {
    event.waitUntil(syncData('pomodoro'));
  }
});

// Function to sync data when back online
async function syncData(dataType) {
  try {
    // Get offline data from IndexedDB using localforage
    const offlineData = await self.localforage?.getItem(`offline-${dataType}`);
    if (!offlineData) return;
    
    // Code to sync with server would go here based on data type
    console.log(`Syncing offline ${dataType} data:`, offlineData);
    
    // Clear synced data
    await self.localforage?.removeItem(`offline-${dataType}`);
  } catch (error) {
    console.error(`Sync failed for ${dataType}:`, error);
  }
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic sync for keeping data fresh (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-data') {
    event.waitUntil(refreshBackgroundData());
  }
});

// Background data refresh function
async function refreshBackgroundData() {
  try {
    // Refresh cached data in the background
    console.log('Performing background data refresh');
    
    // Example: update cached homepage
    const cache = await caches.open(CACHE_NAME);
    await cache.add('/');
    
  } catch (error) {
    console.error('Background refresh failed:', error);
  }
}

// Initialize localforage in the service worker scope
self.importScripts('https://unpkg.com/localforage@1.10.0/dist/localforage.min.js');
