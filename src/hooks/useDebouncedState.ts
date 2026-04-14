import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for managing debounced state
 * Useful for: form inputs, code editor changes, search queries
 * 
 * @param initialValue - Initial value
 * @param delay - Debounce delay in milliseconds
 * @returns [displayValue, debouncedValue, setValue]
 */
export function useDebouncedState<T>(initialValue: T, delay: number = 500) {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    isDirtyRef.current = true;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      isDirtyRef.current = false;
      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  const isDirty = isDirtyRef.current;

  return {
    value,
    debouncedValue,
    setValue,
    isDirty,
  };
}
