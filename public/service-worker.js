const CACHE_NAME = 'cutelist-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/e8d0228f-76c5-4898-8b2c-1ef215ce52b4.png',
  '/offline.html',
  '/src/main.tsx',
  '/src/index.css'
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
  // Activate immediately
  self.skipWaiting();
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
  // Ensure the service worker takes control immediately
  return self.clients.claim();
});

// Fetch event with network-first strategy for API requests, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // For API requests (to Supabase), try network first, then fall back to offline handling
  if (url.pathname.includes('/rest/') || url.pathname.includes('/auth/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(async () => {
          // If offline and this is a task-related API call, handle it locally
          if (url.pathname.includes('/rest/v1/todos')) {
            // Use IndexedDB to handle offline todos actions
            return handleOfflineTodosRequest(event.request);
          }
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

// Handle offline todos requests using IndexedDB
async function handleOfflineTodosRequest(request) {
  // Extract request data
  const url = new URL(request.url);
  const method = request.method;
  
  try {
    // Open or create the offline-actions database
    const db = await openDB();
    
    if (method === 'POST') {
      // Store the new task in IndexedDB for later sync
      const taskData = await request.clone().json();
      const offlineId = 'offline_' + Date.now();
      
      await db.add('offlineTodos', {
        id: offlineId,
        action: 'add',
        data: taskData,
        timestamp: Date.now()
      });
      
      // Return a mock successful response
      return new Response(JSON.stringify({
        id: offlineId,
        content: taskData.content,
        is_complete: false,
        created_at: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    else if (method === 'PATCH' || method === 'PUT') {
      // Extract ID from URL
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      const taskData = await request.clone().json();
      
      await db.add('offlineTodos', {
        id: id,
        action: 'update',
        data: taskData,
        timestamp: Date.now()
      });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    else if (method === 'DELETE') {
      // Extract ID from URL
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      
      await db.add('offlineTodos', {
        id: id,
        action: 'delete',
        timestamp: Date.now()
      });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Unsupported method' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cutelist-offline', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineTodos')) {
        db.createObjectStore('offlineTodos', { keyPath: 'timestamp' });
      }
      if (!db.objectStoreNames.contains('cachedTodos')) {
        db.createObjectStore('cachedTodos', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Add sync event for background syncing when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-todos') {
    event.waitUntil(syncOfflineTodos());
  } else if (event.tag === 'sync-memories') {
    event.waitUntil(syncData('memories'));
  } else if (event.tag === 'sync-pomodoro') {
    event.waitUntil(syncData('pomodoro'));
  }
});

// Function to sync offline todos when back online
async function syncOfflineTodos() {
  try {
    const db = await openDB();
    const tx = db.transaction('offlineTodos', 'readwrite');
    const store = tx.objectStore('offlineTodos');
    
    // Get all offline actions
    const offlineActions = await store.getAll();
    
    // Process each action
    for (const action of offlineActions) {
      try {
        let url, options;
        
        switch(action.action) {
          case 'add':
            url = new URL(location.origin + '/rest/v1/todos');
            options = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${self.SUPABASE_AUTH_TOKEN}` // We'll need to pass this from the main app
              },
              body: JSON.stringify(action.data)
            };
            break;
            
          case 'update':
            url = new URL(`${location.origin}/rest/v1/todos?id=eq.${action.id}`);
            options = {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${self.SUPABASE_AUTH_TOKEN}`
              },
              body: JSON.stringify(action.data)
            };
            break;
            
          case 'delete':
            url = new URL(`${location.origin}/rest/v1/todos?id=eq.${action.id}`);
            options = {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${self.SUPABASE_AUTH_TOKEN}`
              }
            };
            break;
        }
        
        // Send the request to the server
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        // If successful, remove the action from IndexedDB
        await store.delete(action.timestamp);
        
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        // Keep failed actions in the store for next sync attempt
      }
    }
    
    await tx.complete;
    console.log('Sync completed');
    
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

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
  
  // Store auth token for later use during sync
  if (event.data && event.data.type === 'SET_AUTH_TOKEN') {
    self.SUPABASE_AUTH_TOKEN = event.data.token;
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
