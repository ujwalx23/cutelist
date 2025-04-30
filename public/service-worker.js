
const CACHE_NAME = 'cutelist-v5';
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

// Create IndexedDB stores for offline data
const initializeDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offlineData', 1);
    
    request.onerror = (event) => reject('Error opening IndexedDB');
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores for different data types
      if (!db.objectStoreNames.contains('memories')) {
        db.createObjectStore('memories', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('todos')) {
        db.createObjectStore('todos', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('timetables')) {
        db.createObjectStore('timetables', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pendingUploads')) {
        db.createObjectStore('pendingUploads', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pendingChanges')) {
        db.createObjectStore('pendingChanges', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
  });
};

// Function to save data to IndexedDB
const saveToIndexedDB = async (storeName, data) => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = Array.isArray(data) 
      ? Promise.all(data.map(item => store.put(item)))
      : store.put(data);
      
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = (event) => reject(event);
  });
};

// Function to get data from IndexedDB
const getFromIndexedDB = async (storeName) => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event);
  });
};

// Fetch event with network-first strategy for API requests, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // For API requests (to Supabase), try network first, then fall back to IndexedDB or offline page
  if (url.pathname.includes('/rest/') || url.pathname.includes('/auth/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If it's a GET request, we can cache the response
          if (event.request.method === 'GET') {
            const responseClone = response.clone();
            responseClone.json().then(data => {
              // Store API response in IndexedDB based on the path
              const path = url.pathname;
              if (path.includes('/memories')) {
                saveToIndexedDB('memories', data);
              } else if (path.includes('/todos')) {
                saveToIndexedDB('todos', data);
              } else if (path.includes('/timetables')) {
                saveToIndexedDB('timetables', data);
              }
            }).catch(err => console.error('Error storing API response:', err));
          }
          return response;
        })
        .catch(async () => {
          // If offline and it's a GET request, try to get data from IndexedDB
          if (event.request.method === 'GET') {
            const path = url.pathname;
            let offlineData;
            
            if (path.includes('/memories')) {
              offlineData = await getFromIndexedDB('memories');
            } else if (path.includes('/todos')) {
              offlineData = await getFromIndexedDB('todos');
            } else if (path.includes('/timetables')) {
              offlineData = await getFromIndexedDB('timetables');
            }
            
            if (offlineData && offlineData.length > 0) {
              return new Response(JSON.stringify({ data: offlineData }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
          } 
          
          // If it's a POST/PUT/DELETE request, store it for later syncing
          else if (['POST', 'PUT', 'DELETE'].includes(event.request.method)) {
            const reqClone = event.request.clone();
            const content = await reqClone.json();
            
            await saveToIndexedDB('pendingChanges', {
              id: Date.now().toString(),
              url: event.request.url,
              method: event.request.method,
              body: content,
              time: new Date().toISOString()
            });
            
            return new Response(JSON.stringify({ 
              success: true, 
              message: 'Saved offline, will sync when online' 
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          // Return offline page for navigation requests or error message for API
          return event.request.mode === 'navigate' 
            ? caches.match('/offline.html') || caches.match('/') 
            : new Response(JSON.stringify({ error: 'You are offline' }), { 
                status: 503, 
                headers: { 'Content-Type': 'application/json' } 
              });
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
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Function to sync all offline data when back online
async function syncOfflineData() {
  console.log('Starting to sync offline data');
  
  try {
    // Sync pending changes (API calls)
    const pendingChanges = await getFromIndexedDB('pendingChanges');
    console.log('Pending changes to sync:', pendingChanges.length);
    
    if (pendingChanges && pendingChanges.length > 0) {
      for (const change of pendingChanges) {
        try {
          // Make the actual API call
          const response = await fetch(change.url, {
            method: change.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(change.body)
          });
          
          if (response.ok) {
            // Remove from pending changes
            const db = await initializeDB();
            const transaction = db.transaction('pendingChanges', 'readwrite');
            const store = transaction.objectStore('pendingChanges');
            store.delete(change.id);
          } else {
            console.error(`Failed to sync change ${change.id}: ${response.statusText}`);
          }
        } catch (error) {
          console.error(`Error syncing change ${change.id}:`, error);
        }
      }
    }
    
    // Sync pending uploads (files/images)
    const pendingUploads = await getFromIndexedDB('pendingUploads');
    console.log('Pending uploads to sync:', pendingUploads?.length || 0);
    
    if (pendingUploads && pendingUploads.length > 0) {
      // Handle file uploads logic here
      // This would need to convert stored base64 back to files and upload
    }
    
    console.log('Offline data sync completed');
  } catch (error) {
    console.error('Error during offline data sync:', error);
  }
}

// Register periodic sync if supported
if ('periodicSync' in self.registration) {
  const registerPeriodicSync = async () => {
    try {
      await self.registration.periodicSync.register('sync-offline-data', {
        minInterval: 60 * 60 * 1000 // Once per hour
      });
    } catch (error) {
      console.error('Periodic sync could not be registered:', error);
    }
  };
  
  registerPeriodicSync();
}

// Check for online status changes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ONLINE_STATUS_CHANGE') {
    if (event.data.online) {
      // Trigger sync when the app comes online
      self.registration.sync.register('sync-offline-data');
    }
  }
  
  // Handle skip waiting message
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listen for network status changes from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ONLINE_STATUS_CHANGE') {
    if (event.data.online) {
      // When back online, trigger sync
      self.registration.sync.register('sync-offline-data');
    }
  }
});

// Initialize IndexedDB when service worker starts
initializeDB().then(() => {
  console.log('IndexedDB initialized for offline storage');
}).catch(err => {
  console.error('Failed to initialize IndexedDB:', err);
});
