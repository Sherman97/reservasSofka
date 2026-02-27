import { describe, it, expect } from 'vitest';
import { InventoryItem } from './InventoryItem';

describe('InventoryItem - Domain Entity', () => {
    const validData = {
        id: 'inv-1',
        name: 'Proyector Epson',
        description: 'Proyector HD para presentaciones',
        imageUrl: '/img/projector.jpg',
        quantity: 3,
        category: 'Audiovisual',
        available: true,
    };

    describe('constructor', () => {
        it('should create an inventory item with all properties', () => {
            const item = new InventoryItem(validData);
            expect(item.id).toBe('inv-1');
            expect(item.name).toBe('Proyector Epson');
            expect(item.quantity).toBe(3);
            expect(item.category).toBe('Audiovisual');
            expect(item.available).toBe(true);
        });

        it('should default available to true', () => {
            const item = new InventoryItem({ ...validData, available: undefined });
            expect(item.available).toBe(true);
        });
    });

    describe('isAvailable', () => {
        it('should return true when available and quantity > 0', () => {
            expect(new InventoryItem(validData).isAvailable()).toBe(true);
        });

        it('should return false when not available', () => {
            const item = new InventoryItem({ ...validData, available: false });
            expect(item.isAvailable()).toBe(false);
        });

        it('should return false when quantity is 0', () => {
            const item = new InventoryItem({ ...validData, quantity: 0 });
            expect(item.isAvailable()).toBe(false);
        });
    });

    describe('hasSufficientQuantity', () => {
        it('should return true when quantity is enough', () => {
            const item = new InventoryItem(validData);
            expect(item.hasSufficientQuantity(2)).toBe(true);
        });

        it('should return true for exact quantity', () => {
            const item = new InventoryItem(validData);
            expect(item.hasSufficientQuantity(3)).toBe(true);
        });

        it('should return false when quantity is insufficient', () => {
            const item = new InventoryItem(validData);
            expect(item.hasSufficientQuantity(5)).toBe(false);
        });
    });

    describe('getAvailableQuantity', () => {
        it('should return quantity when available', () => {
            expect(new InventoryItem(validData).getAvailableQuantity()).toBe(3);
        });

        it('should return 0 when not available', () => {
            const item = new InventoryItem({ ...validData, available: false });
            expect(item.getAvailableQuantity()).toBe(0);
        });
    });

    describe('getDisplayInfo', () => {
        it('should return formatted display info', () => {
            const item = new InventoryItem(validData);
            const info = item.getDisplayInfo();
            expect(info.id).toBe('inv-1');
            expect(info.title).toBe('Proyector Epson');
            expect(info.subtitle).toContain('3');
            expect(info.type).toBe('inventory');
        });
    });

    describe('serialization', () => {
        it('should serialize and deserialize correctly', () => {
            const item = new InventoryItem(validData);
            const json = item.toJSON();
            const restored = InventoryItem.fromJSON(json);
            expect(restored).toBeInstanceOf(InventoryItem);
            expect(restored.id).toBe('inv-1');
            expect(restored.category).toBe('Audiovisual');
        });
    });
});
