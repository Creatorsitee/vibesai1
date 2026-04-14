import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Custom hook for undo/redo functionality
 * @param initialValue - Initial state value
 * @param maxHistorySize - Maximum number of history items to keep
 * @returns State management object with undo/redo capabilities
 */
export function useUndoRedo<T>(
  initialValue: T,
  maxHistorySize: number = 50
) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialValue,
    future: [],
    canUndo: false,
    canRedo: false,
  });

  const maxSizeRef = useRef(maxHistorySize);

  /**
   * Set a new value and add current value to history
   */
  const set = useCallback((newValue: T) => {
    setState((prevState) => {
      const newPast = [...prevState.past, prevState.present];

      // Limit history size
      if (newPast.length > maxSizeRef.current) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: newValue,
        future: [],
        canUndo: newPast.length > 0,
        canRedo: false,
      };
    });
  }, []);

  /**
   * Undo to previous state
   */
  const undo = useCallback(() => {
    setState((prevState) => {
      if (prevState.past.length === 0) return prevState;

      const newPast = [...prevState.past];
      const newPresent = newPast.pop()!;
      const newFuture = [prevState.present, ...prevState.future];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
        canUndo: newPast.length > 0,
        canRedo: true,
      };
    });
  }, []);

  /**
   * Redo to next state
   */
  const redo = useCallback(() => {
    setState((prevState) => {
      if (prevState.future.length === 0) return prevState;

      const newFuture = [...prevState.future];
      const newPresent = newFuture.shift()!;
      const newPast = [...prevState.past, prevState.present];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
      };
    });
  }, []);

  /**
   * Reset to initial value
   */
  const reset = useCallback((value: T = initialValue) => {
    setState({
      past: [],
      present: value,
      future: [],
      canUndo: false,
      canRedo: false,
    });
  }, [initialValue]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    }));
  }, []);

  /**
   * Get history state
   */
  const getHistory = useCallback(() => {
    return {
      past: [...state.past],
      present: state.present,
      future: [...state.future],
    };
  }, [state]);

  /**
   * Get history stats
   */
  const getStats = useCallback(() => {
    return {
      undoCount: state.past.length,
      redoCount: state.future.length,
      totalHistory: state.past.length + state.future.length,
    };
  }, [state]);

  return {
    // State
    value: state.present,
    past: state.past,
    future: state.future,
    
    // Capabilities
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    
    // Methods
    set,
    undo,
    redo,
    reset,
    clearHistory,
    getHistory,
    getStats,
  };
}
