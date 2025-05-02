
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Task } from "@/types/task";

// Register the service worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Check if background sync is supported before trying to use it
      if ('permissions' in navigator && 'periodicSync' in registration) {
        try {
          const status = await navigator.permissions.query({
            name: 'periodic-background-sync' as any,
          });
          if (status.state === 'granted') {
            await (registration as any).periodicSync.register('refresh-data', {
              minInterval: 24 * 60 * 60 * 1000, // Once per day
            }).catch(console.error);
          }
        } catch (e) {
          console.error('Periodic sync registration error:', e);
        }
      }
      
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
      return null;
    }
  }
  return null;
};

// Update auth token in service worker for syncing
export const updateServiceWorkerAuth = async () => {
  if (!navigator.serviceWorker.controller) return;
  
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  
  if (token) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SET_AUTH_TOKEN',
      token
    });
  }
};

// Request sync when online
export const syncOfflineData = async () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await (registration as any).sync.register('sync-todos');
        return true;
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
    return false;
  } else {
    console.log('Background Sync not supported');
    return false;
  }
};

// Create a hook to track online/offline status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// Function to store task data locally
export const storeLocalTasks = async (tasks: Task[]) => {
  try {
    // Using localStorage instead of localforage
    localStorage.setItem('cached-tasks', JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to store tasks locally', e);
  }
};

// Function to retrieve local task data
export const getLocalTasks = async (): Promise<Task[]> => {
  try {
    const tasksString = localStorage.getItem('cached-tasks');
    return tasksString ? JSON.parse(tasksString) as Task[] : [];
  } catch (e) {
    console.error('Failed to get local tasks', e);
    return [];
  }
};

interface OfflineTodoItem {
  id: string;
  action: 'add' | 'update' | 'delete';
  data?: any;
  timestamp: number;
}

// Function to add a task when offline
export const addOfflineTask = async (text: string, userId: string): Promise<Task | null> => {
  try {
    const offlineId = `offline_${Date.now()}`;
    const newTask: Task = {
      id: offlineId,
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    // Store for syncing later
    const db = await openDB();
    const transaction = db.transaction('offlineTodos', 'readwrite');
    const store = transaction.objectStore('offlineTodos');
    store.add({
      id: offlineId,
      action: 'add',
      data: {
        content: text,
        user_id: userId
      },
      timestamp: Date.now()
    } as OfflineTodoItem);
    
    // Add to local cache
    const localTasks = await getLocalTasks();
    await storeLocalTasks([newTask, ...localTasks]);
    
    return newTask;
  } catch (e) {
    console.error('Failed to add offline task', e);
    return null;
  }
};

// Function to toggle task when offline
export const toggleOfflineTask = async (id: string, completed: boolean): Promise<boolean> => {
  try {
    const db = await openDB();
    const transaction = db.transaction('offlineTodos', 'readwrite');
    const store = transaction.objectStore('offlineTodos');
    store.add({
      id: id,
      action: 'update',
      data: { is_complete: completed },
      timestamp: Date.now()
    } as OfflineTodoItem);
    
    // Update in local cache
    const localTasks = await getLocalTasks();
    const updatedTasks = localTasks.map(task => 
      task.id === id ? { ...task, completed } : task
    );
    await storeLocalTasks(updatedTasks);
    
    return true;
  } catch (e) {
    console.error('Failed to toggle offline task', e);
    return false;
  }
};

// Function to delete task when offline
export const deleteOfflineTask = async (id: string): Promise<boolean> => {
  try {
    const db = await openDB();
    const transaction = db.transaction('offlineTodos', 'readwrite');
    const store = transaction.objectStore('offlineTodos');
    store.add({
      id: id,
      action: 'delete',
      timestamp: Date.now()
    } as OfflineTodoItem);
    
    // Remove from local cache
    const localTasks = await getLocalTasks();
    const updatedTasks = localTasks.filter(task => task.id !== id);
    await storeLocalTasks(updatedTasks);
    
    return true;
  } catch (e) {
    console.error('Failed to delete offline task', e);
    return false;
  }
};

// IndexedDB helper function
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cutelist-offline', 1);
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offlineTodos')) {
        db.createObjectStore('offlineTodos', { keyPath: 'timestamp' });
      }
      if (!db.objectStoreNames.contains('cachedTodos')) {
        db.createObjectStore('cachedTodos', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event: Event) => {
      resolve(request.result);
    };
    
    request.onerror = (event: Event) => {
      reject(request.error);
    };
  });
}
