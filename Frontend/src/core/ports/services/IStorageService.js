/**
 * IStorageService - Interface for data storage
 * Abstracts storage mechanism (localStorage, sessionStorage, IndexedDB, etc.)
 * This enables easy testing and switching storage implementations
 */
export class IStorageService {
    /**
     * Get item from storage
     * @param {string} key - Storage key
     * @returns {string|null} Stored value or null if not found
     */
    get(_key) {
        throw new Error('Method not implemented: get');
    }

    /**
     * Set item in storage
     * @param {string} key - Storage key
     * @param {string} value - Value to store
     */
    set(_key, _value) {
        throw new Error('Method not implemented: set');
    }

    /**
     * Remove item from storage
     * @param {string} key - Storage key
     */
    remove(_key) {
        throw new Error('Method not implemented: remove');
    }

    /**
     * Clear all items from storage
     */
    clear() {
        throw new Error('Method not implemented: clear');
    }

    /**
     * Check if key exists in storage
     * @param {string} key - Storage key
     * @returns {boolean} True if key exists
     */
    has(_key) {
        throw new Error('Method not implemented: has');
    }
}
