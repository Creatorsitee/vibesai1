import { useState, useEffect, useCallback, useRef } from 'react';
import { getStorageService, StorageOptions } from '../services/storageService';

/**
 * Custom hook for persistent state that syncs with localStorage
 * @param key - The storage key
 * @param initialValue - Initial value if not found in storage
 * @param options - Storage options (expiration, etc.)
 * @returns [value, setValue, isPersisted]
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  options?: StorageOptions
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const storageService = getStorageService();
  const isInitializedRef = useRef(false);

  // Initialize state from storage or use initial value
  const [state, setState] = useState<T>(() => {
    if (!isInitializedRef.current) {
      const stored = storageService.get<T>(key);
      isInitializedRef.current = true;
      return stored !== null ? stored : initialValue;
    }
    return initialValue;
  });

  const [isPersisted, setIsPersisted] = useState(false);

  // Persist state to storage whenever it changes
  useEffect(() => {
    storageService.set(key, state, options);
    setIsPersisted(true);
  }, [key, state, storageService, options]);

  // Handle external storage changes (e.g., from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `vibesai_${key}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(parsed.data);
        } catch {
          // Ignore parsing errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      return newValue;
    });
  }, []);

  return [state, setValue, isPersisted];
}

/**
 * Hook for persistent object state with automatic merging
 */
export function usePersistentObject<T extends Record<string, any>>(
  key: string,
  initialValue: T,
  options?: StorageOptions
): [T, (updates: Partial<T>) => void, boolean] {
  const [state, setState, isPersisted] = usePersistentState<T>(key, initialValue, options);

  const updateObject = useCallback(
    (updates: Partial<T>) => {
      setState((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    [setState]
  );

  return [state, updateObject, isPersisted];
}

/**
 * Hook for persistent array state
 */
export function usePersistentArray<T>(
  key: string,
  initialValue: T[] = [],
  options?: StorageOptions
): [
  T[],
  {
    push: (item: T) => void;
    remove: (index: number) => void;
    update: (index: number, item: T) => void;
    clear: () => void;
    set: (items: T[]) => void;
  },
  boolean
] {
  const [state, setState, isPersisted] = usePersistentState<T[]>(key, initialValue, options);

  const push = useCallback(
    (item: T) => {
      setState((prev) => [...prev, item]);
    },
    [setState]
  );

  const remove = useCallback(
    (index: number) => {
      setState((prev) => prev.filter((_, i) => i !== index));
    },
    [setState]
  );

  const update = useCallback(
    (index: number, item: T) => {
      setState((prev) => {
        const newArray = [...prev];
        newArray[index] = item;
        return newArray;
      });
    },
    [setState]
  );

  const clear = useCallback(() => {
    setState([]);
  }, [setState]);

  const set = useCallback(
    (items: T[]) => {
      setState(items);
    },
    [setState]
  );

  return [
    state,
    {
      push,
      remove,
      update,
      clear,
      set,
    },
    isPersisted,
  ];
}
