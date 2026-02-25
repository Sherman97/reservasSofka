import type { IStorageService } from '../../core/ports/services/IStorageService';

/**
 * LocalStorageService - Adapter Pattern implementation
 * Implements IStorageService using browser localStorage
 */
export class LocalStorageService implements IStorageService {
    get(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error(`Error getting item from localStorage: ${key}`, error);
            return null;
        }
    }

    set(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`Error setting item in localStorage: ${key}`, error);
            if ((error as DOMException).name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded');
            }
        }
    }

    remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item from localStorage: ${key}`, error);
        }
    }

    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage', error);
        }
    }

    has(key: string): boolean {
        try {
            return localStorage.getItem(key) !== null;
        } catch (error) {
            console.error(`Error checking if key exists in localStorage: ${key}`, error);
            return false;
        }
    }

    getJSON<T = unknown>(key: string): T | null {
        try {
            const value = this.get(key);
            return value ? (JSON.parse(value) as T) : null;
        } catch (error) {
            console.error(`Error parsing JSON from localStorage: ${key}`, error);
            return null;
        }
    }

    setJSON(key: string, value: unknown): void {
        try {
            this.set(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error stringifying JSON to localStorage: ${key}`, error);
        }
    }
}
