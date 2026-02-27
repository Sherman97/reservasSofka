/**
 * Integration Tests: Dashboard Flow
 * 
 * Tests de integración que verifican la interacción entre capas:
 * UseCase → Repository (fake) → Mapper → Entity
 * 
 * Valida que la obtención de ubicaciones e inventario
 * fluye correctamente desde el use case hasta las entidades de dominio.
 */
import { describe, it, expect } from 'vitest';
import { GetLocationsUseCase } from '../../application/use-cases/dashboard/GetLocationsUseCase';
import { GetInventoryUseCase } from '../../application/use-cases/dashboard/GetInventoryUseCase';
import { AssignInventoryUseCase } from '../../application/use-cases/dashboard/AssignInventoryUseCase';
import { RemoveInventoryUseCase } from '../../application/use-cases/dashboard/RemoveInventoryUseCase';
import { Location } from '../../core/domain/entities/Location';
import { InventoryItem } from '../../core/domain/entities/InventoryItem';
import { LocationMapper } from '../../infrastructure/mappers/LocationMapper';
import { InventoryMapper } from '../../infrastructure/mappers/InventoryMapper';
import type { ILocationRepository } from '../../core/ports/repositories/ILocationRepository';
import type { IInventoryRepository } from '../../core/ports/repositories/IInventoryRepository';

describe('Integration: Dashboard Flow (UseCase + Mapper + Entity)', () => {
    function createFakeLocationRepo(): ILocationRepository {
        const locationDTOs = [
            { id: 'l1', name: 'Sala Bogotá', description: 'Grande', image: 'img1.jpg', capacity: 20, type: 'sala', cityId: 'bogota', tags: ['wifi', 'proyector'] },
            { id: 'l2', name: 'Escritorio 1', description: 'Individual', imageUrl: 'img2.jpg', maxCapacity: 1, type: 'escritorio', cityId: 'medellin', amenities: ['monitor'] },
            { spaceId: 'l3', spaceName: 'Sala Cali', description: 'Media', imageURL: 'img3.jpg', capacity: 10, type: 'sala', cityId: 'cali' }
        ];

        const inventory: Record<string, string[]> = {};

        return {
            async getAll() {
                return LocationMapper.toDomainList(locationDTOs as any);
            },
            async getById(id: string) {
                const dto = locationDTOs.find(d => (d.id || (d as any).spaceId) === id);
                if (!dto) throw new Error('Not found');
                return LocationMapper.toDomain(dto as any)!;
            },
            async search(criteria) {
                let filtered = [...locationDTOs];
                if (criteria.type) filtered = filtered.filter(d => d.type === criteria.type);
                if (criteria.cityId) filtered = filtered.filter(d => d.cityId === criteria.cityId);
                return LocationMapper.toDomainList(filtered as any);
            },
            async assignInventory(locationId, inventoryId, qty) {
                if (!inventory[locationId]) inventory[locationId] = [];
                inventory[locationId].push(inventoryId);
                return { success: true };
            },
            async removeInventory(locationId, inventoryId) {
                if (inventory[locationId]) {
                    inventory[locationId] = inventory[locationId].filter(id => id !== inventoryId);
                }
                return { success: true };
            }
        };
    }

    function createFakeInventoryRepo(): IInventoryRepository {
        const inventoryDTOs = [
            { id: 'i1', name: 'Proyector', description: 'HD', image: 'img.jpg', quantity: 5, category: 'tech', available: true },
            { itemId: 'i2', itemName: 'Monitor', description: '24"', imageUrl: 'img2.jpg', qty: 10, category: 'tech', available: true },
            { id: 'i3', name: 'Silla', description: 'Ergonómica', imageURL: 'img3.jpg', available_qty: 20, category: 'mobiliario', available: false }
        ];

        return {
            async getAll() {
                return InventoryMapper.toDomainList(inventoryDTOs as any);
            },
            async getById(id: string) {
                const dto = inventoryDTOs.find(d => (d.id || (d as any).itemId) === id);
                if (!dto) throw new Error('Not found');
                return InventoryMapper.toDomain(dto as any)!;
            },
            async getByCityId(_cityId: string) {
                return InventoryMapper.toDomainList(inventoryDTOs.slice(0, 2) as any);
            },
            async search(_criteria) {
                return InventoryMapper.toDomainList(inventoryDTOs as any);
            }
        };
    }

    it('getLocations sin filtros → mapper transforma alias → entities con domain methods', async () => {
        const repo = createFakeLocationRepo();
        const useCase = new GetLocationsUseCase(repo);

        const locations = await useCase.execute();
        expect(locations).toHaveLength(3);

        // Verifica que el mapper transformó los alias correctamente
        expect(locations[0]).toBeInstanceOf(Location);
        expect(locations[0].name).toBe('Sala Bogotá');
        expect(locations[0].isMeetingRoom()).toBe(true);
        expect(locations[0].hasAmenity('wifi')).toBe(true);
        expect(locations[0].canAccommodate(15)).toBe(true);

        // spaceId → id, spaceName → name
        expect(locations[2].id).toBe('l3');
        expect(locations[2].name).toBe('Sala Cali');
    });

    it('getLocations con filtro type → search con mapper', async () => {
        const repo = createFakeLocationRepo();
        const useCase = new GetLocationsUseCase(repo);

        const salas = await useCase.execute({ type: 'sala' });
        expect(salas).toHaveLength(2);
        salas.forEach(loc => expect(loc.isMeetingRoom()).toBe(true));
    });

    it('getInventory sin filtros → mapper con diferentes formatos DTO', async () => {
        const repo = createFakeInventoryRepo();
        const useCase = new GetInventoryUseCase(repo);

        const items = await useCase.execute();
        expect(items).toHaveLength(3);

        // itemId → id, itemName → name
        expect(items[1]).toBeInstanceOf(InventoryItem);
        expect(items[1].id).toBe('i2');
        expect(items[1].name).toBe('Monitor');
        expect(items[1].quantity).toBe(10);

        // available_qty → quantity, available: false
        expect(items[2].quantity).toBe(20);
        expect(items[2].available).toBe(false);
        expect(items[2].isAvailable()).toBe(false);
        expect(items[2].getAvailableQuantity()).toBe(0);
    });

    it('getInventory con cityId → getByCityId', async () => {
        const repo = createFakeInventoryRepo();
        const useCase = new GetInventoryUseCase(repo);

        const items = await useCase.execute({ cityId: 'bogota' });
        expect(items).toHaveLength(2);
    });

    it('assignInventory → removeInventory flow', async () => {
        const repo = createFakeLocationRepo();
        const assignUseCase = new AssignInventoryUseCase(repo);
        const removeUseCase = new RemoveInventoryUseCase(repo);

        // Asignar
        const result1 = await assignUseCase.execute({ locationId: 'l1', inventoryId: 'i1', qty: 3 });
        expect(result1).toEqual({ success: true });

        // Remover
        const result2 = await removeUseCase.execute({ locationId: 'l1', inventoryId: 'i1' });
        expect(result2).toEqual({ success: true });
    });

    it('getDisplayInfo devuelve formato correcto tras mapeo', async () => {
        const repo = createFakeLocationRepo();
        const useCase = new GetLocationsUseCase(repo);

        const locations = await useCase.execute();
        const info = locations[0].getDisplayInfo();
        expect(info).toEqual({
            id: 'l1',
            title: 'Sala Bogotá',
            subtitle: 'Capacidad: 20 personas',
            image: 'img1.jpg',
            type: 'location'
        });
    });
});
