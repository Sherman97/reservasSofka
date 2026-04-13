import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalStorageService } from './LocalStorageService';

describe('LocalStorageService', () => {
    let service: LocalStorageService;
    let mockStorage: Record<string, string>;

    beforeEach(() => {
        mockStorage = {};
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key: string) => mockStorage[key] ?? null),
            setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
            removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
            clear: vi.fn(() => { mockStorage = {}; })
        });
        service = new LocalStorageService();
    });

    describe('get()', () => {
        it('debe retornar valor existente', () => {
            mockStorage['key1'] = 'value1';
            expect(service.get('key1')).toBe('value1');
        });

        it('debe retornar null para key inexistente', () => {
            expect(service.get('nonexistent')).toBeNull();
        });

        it('debe retornar null si localStorage lanza error', () => {
            vi.mocked(localStorage.getItem).mockImplementation(() => { throw new Error('Access denied'); });
            expect(service.get('key')).toBeNull();
        });
    });

    describe('set()', () => {
        it('debe guardar un valor', () => {
            service.set('key1', 'value1');
            expect(localStorage.setItem).toHaveBeenCalledWith('key1', 'value1');
        });

        it('debe manejar QuotaExceededError sin lanzar', () => {
            const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
            vi.mocked(localStorage.setItem).mockImplementation(() => { throw quotaError; });
            expect(() => service.set('key', 'val')).not.toThrow();
        });

        it('debe manejar errores genéricos sin lanzar', () => {
            vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('Error'); });
            expect(() => service.set('key', 'val')).not.toThrow();
        });
    });

    describe('remove()', () => {
        it('debe remover un valor', () => {
            service.remove('key1');
            expect(localStorage.removeItem).toHaveBeenCalledWith('key1');
        });

        it('debe manejar errores sin lanzar', () => {
            vi.mocked(localStorage.removeItem).mockImplementation(() => { throw new Error('Error'); });
            expect(() => service.remove('key')).not.toThrow();
        });
    });

    describe('clear()', () => {
        it('debe limpiar todo', () => {
            service.clear();
            expect(localStorage.clear).toHaveBeenCalled();
        });

        it('debe manejar errores sin lanzar', () => {
            vi.mocked(localStorage.clear).mockImplementation(() => { throw new Error('Error'); });
            expect(() => service.clear()).not.toThrow();
        });
    });

    describe('has()', () => {
        it('debe retornar true si key existe', () => {
            mockStorage['key1'] = 'value';
            expect(service.has('key1')).toBe(true);
        });

        it('debe retornar false si key no existe', () => {
            expect(service.has('nonexistent')).toBe(false);
        });

        it('debe retornar false si localStorage lanza error', () => {
            vi.mocked(localStorage.getItem).mockImplementation(() => { throw new Error('Error'); });
            expect(service.has('key')).toBe(false);
        });
    });

    describe('getJSON()', () => {
        it('debe retornar objeto parseado', () => {
            mockStorage['obj'] = JSON.stringify({ name: 'test' });
            const result = service.getJSON<{ name: string }>('obj');
            expect(result).toEqual({ name: 'test' });
        });

        it('debe retornar null si no existe', () => {
            expect(service.getJSON('nonexistent')).toBeNull();
        });

        it('debe retornar null si JSON es inválido', () => {
            mockStorage['bad'] = 'not-json';
            expect(service.getJSON('bad')).toBeNull();
        });
    });

    describe('setJSON()', () => {
        it('debe guardar objeto como JSON', () => {
            service.setJSON('obj', { name: 'test' });
            expect(localStorage.setItem).toHaveBeenCalledWith('obj', JSON.stringify({ name: 'test' }));
        });

        it('debe manejar errores de stringify sin lanzar', () => {
            const circular: Record<string, unknown> = {};
            circular['self'] = circular;
            expect(() => service.setJSON('key', circular)).not.toThrow();
        });
    });
});
