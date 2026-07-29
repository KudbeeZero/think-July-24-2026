import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

export function usePageDatabase<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    
    get<T>(key).then(val => {
      if (val !== undefined) {
        setStoredValue(val);
      } else {
        // If not in IndexedDB, let's try to migrate from localStorage just in case
        const localItem = window.localStorage.getItem(key);
        if (localItem) {
          try {
            const parsed = JSON.parse(localItem);
            setStoredValue(parsed);
            set(key, parsed); // Save migrated value
          } catch (e) {
            console.warn(`Error parsing localStorage for migration key "${key}":`, e);
          }
        }
      }
      setIsLoading(false);
    }).catch(error => {
      console.warn(`Error reading IndexedDB key "${key}":`, error);
      setIsLoading(false);
    });
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        set(key, valueToStore).catch(err => {
          console.warn(`Error writing to IndexedDB key "${key}":`, err);
        });
      }
    } catch (error) {
      console.warn(`Error setting page database key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoading] as const;
}
