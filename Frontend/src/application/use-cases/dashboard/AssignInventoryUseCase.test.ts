import { describe, it, expect, vi } from 'vitest';
import { AssignInventoryUseCase } from './AssignInventoryUseCase';
import type { ILocationRepository } from '../../../core/ports/repositories/ILocationRepository';

describe('AssignInventoryUseCase', () => {
    const createMockRepo = (overrides: Partial<ILocationRepository> = {}): ILocationRepository => ({
        getAll: vi.fn(),
        getById: vi.fn(),
        search: vi.fn(),
        assignInventory: vi.fn().mockResolvedValue({ success: true }),
        removeInventory: vi.fn(),
        ...overrides
    });

    it('debe asignar inventario con datos válidos', async () => {
        const repo = createMockRepo();
        const useCase = new AssignInventoryUseCase(repo);
        await useCase.execute({ locationId: 'l1', inventoryId: 'i1', qty: 3 });
        expect(repo.assignInventory).toHaveBeenCalledWith('l1', 'i1', 3);
    });

    it('debe lanzar error si locationId falta', async () => {
        const repo = createMockRepo();
        const useCase = new AssignInventoryUseCase(repo);
        await expect(useCase.execute({ locationId: '', inventoryId: 'i1', qty: 3 }))
            .rejects.toThrow('Location ID is required');
    });

    it('debe lanzar error si inventoryId falta', async () => {
        const repo = createMockRepo();
        const useCase = new AssignInventoryUseCase(repo);
        await expect(useCase.execute({ locationId: 'l1', inventoryId: '', qty: 3 }))
            .rejects.toThrow('Inventory ID is required');
    });

    it('debe lanzar error si qty es 0', async () => {
        const repo = createMockRepo();
        const useCase = new AssignInventoryUseCase(repo);
        await expect(useCase.execute({ locationId: 'l1', inventoryId: 'i1', qty: 0 }))
            .rejects.toThrow('Valid quantity is required');
    });

    it('debe lanzar error si qty es negativo', async () => {
        const repo = createMockRepo();
        const useCase = new AssignInventoryUseCase(repo);
        await expect(useCase.execute({ locationId: 'l1', inventoryId: 'i1', qty: -1 }))
            .rejects.toThrow('Valid quantity is required');
    });
});
