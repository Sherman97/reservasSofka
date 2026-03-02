import { describe, it, expect } from 'vitest';
import { InventoryMapper } from './InventoryMapper';
import { InventoryItem } from '../../core/domain/entities/InventoryItem';

describe('InventoryMapper', () => {
    describe('toDomain()', () => {
        it('debe mapear DTO estándar a dominio', () => {
            const dto = {
                id: 'i1', name: 'Proyector', description: 'HD', image: 'img.jpg',
                quantity: 5, category: 'tech', available: true
            };
            const item = InventoryMapper.toDomain(dto);
            expect(item).toBeInstanceOf(InventoryItem);
            expect(item!.id).toBe('i1');
            expect(item!.name).toBe('Proyector');
            expect(item!.imageUrl).toBe('img.jpg');
            expect(item!.quantity).toBe(5);
        });

        it('debe usar itemId si id no existe', () => {
            const dto = { itemId: 'item1', name: 'Test' };
            const item = InventoryMapper.toDomain(dto);
            expect(item!.id).toBe('item1');
        });

        it('debe usar itemName si name no existe', () => {
            const dto = { id: 'i1', itemName: 'Nombre Alt' };
            const item = InventoryMapper.toDomain(dto);
            expect(item!.name).toBe('Nombre Alt');
        });

        it('debe usar imageUrl como fallback de image', () => {
            const dto = { id: 'i1', imageUrl: 'url.jpg' };
            const item = InventoryMapper.toDomain(dto);
            expect(item!.imageUrl).toBe('url.jpg');
        });

        it('debe usar imageURL como fallback', () => {
            const dto = { id: 'i1', imageURL: 'URL.jpg' };
            const item = InventoryMapper.toDomain(dto);
            expect(item!.imageUrl).toBe('URL.jpg');
        });

        it('debe usar qty como fallback de quantity', () => {
            const dto = { id: 'i1', qty: 10 };
            const item = InventoryMapper.toDomain(dto);
            expect(item!.quantity).toBe(10);
        });

        it('debe usar available_qty como fallback', () => {
            const dto = { id: 'i1', available_qty: 7 };
            const item = InventoryMapper.toDomain(dto);
            expect(item!.quantity).toBe(7);
        });

        it('debe asignar available true por defecto', () => {
            const dto = { id: 'i1', name: 'Test' };
            const item = InventoryMapper.toDomain(dto);
            expect(item!.available).toBe(true);
        });

        it('debe respetar available false', () => {
            const dto = { id: 'i1', name: 'Test', available: false };
            const item = InventoryMapper.toDomain(dto);
            expect(item!.available).toBe(false);
        });

        it('debe retornar null si dto es null', () => {
            expect(InventoryMapper.toDomain(null as any)).toBeNull();
        });

        it('debe asignar defaults para campos faltantes', () => {
            const dto = { id: 'i1' };
            const item = InventoryMapper.toDomain(dto);
            expect(item!.name).toBe('');
            expect(item!.description).toBe('');
            expect(item!.imageUrl).toBe('');
            expect(item!.quantity).toBe(0);
            expect(item!.category).toBe('general');
        });
    });

    describe('toDTO()', () => {
        it('debe mapear dominio a DTO', () => {
            const item = new InventoryItem({
                id: 'i1', name: 'Test', description: 'Desc', imageUrl: 'img.jpg',
                quantity: 5, category: 'tech', available: true
            });
            const dto = InventoryMapper.toDTO(item);
            expect(dto!.id).toBe('i1');
            expect(dto!.name).toBe('Test');
        });

        it('debe retornar null si item es null', () => {
            expect(InventoryMapper.toDTO(null as any)).toBeNull();
        });
    });

    describe('toDomainList()', () => {
        it('debe mapear lista de DTOs', () => {
            const dtos = [
                { id: 'i1', name: 'A' },
                { id: 'i2', name: 'B' }
            ];
            const items = InventoryMapper.toDomainList(dtos);
            expect(items).toHaveLength(2);
            expect(items[0]).toBeInstanceOf(InventoryItem);
        });

        it('debe retornar array vacío si no es array', () => {
            expect(InventoryMapper.toDomainList(null as any)).toEqual([]);
        });
    });
});
