/**
 * Storage service for handling localStorage and session storage with type safety
 */

export interface StorageOptions {
  expires?: number; // in milliseconds
  encryption?: boolean;
}

export interface StoredData<T> {
  data: T;
  timestamp: number;
  expires?: number;
}

class StorageService {
  private prefix = 'vibesai_';
  private supportedStorage = this.checkStorageSupport();

  /**
   * Check if localStorage is supported
   */
  private checkStorageSupport(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get prefixed key
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Set item in storage
   */
  set<T>(key: string, value: T, options?: StorageOptions): void {
    if (!this.supportedStorage) {
      console.warn('[StorageService] localStorage not supported');
      return;
    }

    try {
      const stored: StoredData<T> = {
        data: value,
        timestamp: Date.now(),
        expires: options?.expires ? Date.now() + options.expires : undefined,
      };

      localStorage.setItem(this.getKey(key), JSON.stringify(stored));
    } catch (error) {
      console.error('[StorageService] Error setting item:', error);
    }
  }

  /**
   * Get item from storage
   */
  get<T>(key: string, defaultValue?: T): T | null {
    if (!this.supportedStorage) {
      return defaultValue ?? null;
    }

    try {
      const stored = localStorage.getItem(this.getKey(key));
      if (!stored) {
        return defaultValue ?? null;
      }

      const parsed: StoredData<T> = JSON.parse(stored);

      // Check expiration
      if (parsed.expires && Date.now() > parsed.expires) {
        this.remove(key);
        return defaultValue ?? null;
      }

      return parsed.data;
    } catch (error) {
      console.error('[StorageService] Error getting item:', error);
      return defaultValue ?? null;
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: string): void {
    if (!this.supportedStorage) return;

    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('[StorageService] Error removing item:', error);
    }
  }

  /**
   * Clear all items with our prefix
   */
  clear(): void {
    if (!this.supportedStorage) return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('[StorageService] Error clearing storage:', error);
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    if (!this.supportedStorage) return [];

    try {
      return Object.keys(localStorage)
        .filter((key) => key.startsWith(this.prefix))
        .map((key) => key.substring(this.prefix.length));
    } catch (error) {
      console.error('[StorageService] Error getting keys:', error);
      return [];
    }
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    if (!this.supportedStorage) return 0;

    try {
      let size = 0;
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          size += localStorage.getItem(key)?.length ?? 0;
        }
      });
      return size;
    } catch (error) {
      console.error('[StorageService] Error calculating size:', error);
      return 0;
    }
  }

  /**
   * Export all data as JSON
   */
  export(): Record<string, any> {
    const data: Record<string, any> = {};

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          const cleanKey = key.substring(this.prefix.length);
          data[cleanKey] = this.get(cleanKey);
        }
      });
    } catch (error) {
      console.error('[StorageService] Error exporting data:', error);
    }

    return data;
  }

  /**
   * Import data from JSON
   */
  import(data: Record<string, any>): void {
    try {
      Object.entries(data).forEach(([key, value]) => {
        this.set(key, value);
      });
    } catch (error) {
      console.error('[StorageService] Error importing data:', error);
    }
  }

  /**
   * Clean expired items
   */
  cleanExpired(): number {
    if (!this.supportedStorage) return 0;

    let cleaned = 0;
    const keys = this.keys();

    keys.forEach((key) => {
      const stored = localStorage.getItem(this.getKey(key));
      if (stored) {
        try {
          const parsed: StoredData<any> = JSON.parse(stored);
          if (parsed.expires && Date.now() > parsed.expires) {
            this.remove(key);
            cleaned++;
          }
        } catch {
          // Ignore parsing errors
        }
      }
    });

    return cleaned;
  }
}

// Singleton instance
let instance: StorageService | null = null;

export const getStorageService = (): StorageService => {
  if (!instance) {
    instance = new StorageService();
  }
  return instance;
};
