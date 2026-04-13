import { describe, it, expect } from 'vitest';
import { InventoryItem } from './InventoryItem';

describe('InventoryItem Entity', () => {
    const defaultProps = {
        id: 'inv1',
        name: 'Proyector Epson',
        description: 'Proyector HD para reuniones',
        imageUrl: 'https://img.com/proyector.jpg',
        quantity: 5,
        category: 'tecnología',
        available: true
    };

    describe('constructor', () => {
        it('debe crear un item con todas las propiedades', () => {
            const item = new InventoryItem(defaultProps);
            expect(item.id).toBe('inv1');
            expect(item.name).toBe('Proyector Epson');
            expect(item.description).toBe('Proyector HD para reuniones');
            expect(item.imageUrl).toBe('https://img.com/proyector.jpg');
            expect(item.quantity).toBe(5);
            expect(item.category).toBe('tecnología');
            expect(item.available).toBe(true);
        });

        it('debe asignar available true por defecto', () => {
            const item = new InventoryItem({ ...defaultProps, available: undefined });
            expect(item.available).toBe(true);
        });
    });

    describe('isAvailable()', () => {
        it('debe retornar true si available es true y quantity > 0', () => {
            const item = new InventoryItem(defaultProps);
            expect(item.isAvailable()).toBe(true);
        });

        it('debe retornar false si available es false', () => {
            const item = new InventoryItem({ ...defaultProps, available: false });
            expect(item.isAvailable()).toBe(false);
        });

        it('debe retornar false si quantity es 0', () => {
            const item = new InventoryItem({ ...defaultProps, quantity: 0 });
            expect(item.isAvailable()).toBe(false);
        });
    });

    describe('hasSufficientQuantity()', () => {
        it('debe retornar true si hay suficiente cantidad', () => {
            const item = new InventoryItem(defaultProps);
            expect(item.hasSufficientQuantity(5)).toBe(true);
        });

        it('debe retornar true si se pide menos de lo disponible', () => {
            const item = new InventoryItem(defaultProps);
            expect(item.hasSufficientQuantity(3)).toBe(true);
        });

        it('debe retornar false si se pide más de lo disponible', () => {
            const item = new InventoryItem(defaultProps);
            expect(item.hasSufficientQuantity(6)).toBe(false);
        });
    });

    describe('getAvailableQuantity()', () => {
        it('debe retornar quantity si available es true', () => {
            const item = new InventoryItem(defaultProps);
            expect(item.getAvailableQuantity()).toBe(5);
        });

        it('debe retornar 0 si available es false', () => {
            const item = new InventoryItem({ ...defaultProps, available: false });
            expect(item.getAvailableQuantity()).toBe(0);
        });
    });

    describe('getDisplayInfo()', () => {
        it('debe retornar info de display correcta', () => {
            const item = new InventoryItem(defaultProps);
            const info = item.getDisplayInfo();
            expect(info).toEqual({
                id: 'inv1',
                title: 'Proyector Epson',
                subtitle: 'Disponibles: 5',
                image: 'https://img.com/proyector.jpg',
                type: 'inventory'
            });
        });

        it('debe mostrar 0 disponibles si no está disponible', () => {
            const item = new InventoryItem({ ...defaultProps, available: false });
            const info = item.getDisplayInfo();
            expect(info.subtitle).toBe('Disponibles: 0');
        });
    });

    describe('toJSON()', () => {
        it('debe serializar correctamente', () => {
            const item = new InventoryItem(defaultProps);
            expect(item.toJSON()).toEqual(defaultProps);
        });
    });

    describe('fromJSON()', () => {
        it('debe deserializar correctamente', () => {
            const item = InventoryItem.fromJSON(defaultProps);
            expect(item).toBeInstanceOf(InventoryItem);
            expect(item.name).toBe('Proyector Epson');
        });

        it('roundtrip toJSON/fromJSON debe preservar datos', () => {
            const original = new InventoryItem(defaultProps);
            const restored = InventoryItem.fromJSON(original.toJSON());
            expect(restored.toJSON()).toEqual(original.toJSON());
        });
    });
});
