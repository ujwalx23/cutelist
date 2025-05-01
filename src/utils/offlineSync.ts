
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Task } from "@/types/task";

// Register the service worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Request background sync permission if supported
      if ('permissions' in navigator && 'sync' in registration) {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as any,
        });
        if (status.state === 'granted') {
          await registration.periodicSync.register('refresh-data', {
            minInterval: 24 * 60 * 60 * 1000, // Once per day
          }).catch(console.error);
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
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.sync.register('sync-todos');
      return true;
    } catch (error) {
      console.error('Background sync failed:', error);
      return false;
    }
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
  if (!localforage) return;
  try {
    await localforage.setItem('cached-tasks', tasks);
  } catch (e) {
    console.error('Failed to store tasks locally', e);
  }
};

// Function to retrieve local task data
export const getLocalTasks = async (): Promise<Task[]> => {
  if (!localforage) return [];
  try {
    const tasks = await localforage.getItem<Task[]>('cached-tasks');
    return tasks || [];
  } catch (e) {
    console.error('Failed to get local tasks', e);
    return [];
  }
};

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
    await db.add('offlineTodos', {
      id: offlineId,
      action: 'add',
      data: {
        content: text,
        user_id: userId
      },
      timestamp: Date.now()
    });
    
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
    await db.add('offlineTodos', {
      id: id,
      action: 'update',
      data: { is_complete: completed },
      timestamp: Date.now()
    });
    
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
    await db.add('offlineTodos', {
      id: id,
      action: 'delete',
      timestamp: Date.now()
    });
    
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
