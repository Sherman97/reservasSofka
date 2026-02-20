import { IStorageService } from '../../core/ports/services/IStorageService';

/**
 * LocalStorageService - Adapter Pattern implementation
 * Adapts browser's localStorage to our IStorageService interface
 * This allows easy testing and switching to other storage mechanisms
 */
export class LocalStorageService extends IStorageService {
    get(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error(`Error getting item from localStorage: ${key}`, error);
            return null;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`Error setting item in localStorage: ${key}`, error);
            // Handle quota exceeded errors, etc.
            if (error.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded');
            }
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item from localStorage: ${key}`, error);
        }
    }

    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage', error);
        }
    }

    has(key) {
        try {
            return localStorage.getItem(key) !== null;
        } catch (error) {
            console.error(`Error checking if key exists in localStorage: ${key}`, error);
            return false;
        }
    }

    /**
     * Get and parse JSON value
     * @param {string} key - Storage key
     * @returns {any|null} Parsed JSON or null
     */
    getJSON(key) {
        try {
            const value = this.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Error parsing JSON from localStorage: ${key}`, error);
            return null;
        }
    }

    /**
     * Stringify and set JSON value
     * @param {string} key - Storage key
     * @param {any} value - Value to stringify and store
     */
    setJSON(key, value) {
        try {
            this.set(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error stringifying JSON to localStorage: ${key}`, error);
        }
    }
}
