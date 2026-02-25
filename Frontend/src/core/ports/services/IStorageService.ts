/**
 * IStorageService - Port (Interface)
 * Defines the contract for data storage
 */
export interface IStorageService {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
    clear(): void;
    has(key: string): boolean;
    getJSON<T = unknown>(key: string): T | null;
    setJSON(key: string, value: unknown): void;
}
