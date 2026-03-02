import { describe, it, expect, vi } from 'vitest';
import { RemoveInventoryUseCase } from './RemoveInventoryUseCase';
import type { ILocationRepository } from '../../../core/ports/repositories/ILocationRepository';

describe('RemoveInventoryUseCase', () => {
    const createMockRepo = (overrides: Partial<ILocationRepository> = {}): ILocationRepository => ({
        getAll: vi.fn(),
        getById: vi.fn(),
        search: vi.fn(),
        assignInventory: vi.fn(),
        removeInventory: vi.fn().mockResolvedValue({ success: true }),
        ...overrides
    });

    it('debe remover inventario con datos válidos', async () => {
        const repo = createMockRepo();
        const useCase = new RemoveInventoryUseCase(repo);
        await useCase.execute({ locationId: 'l1', inventoryId: 'i1' });
        expect(repo.removeInventory).toHaveBeenCalledWith('l1', 'i1');
    });

    it('debe lanzar error si locationId falta', async () => {
        const repo = createMockRepo();
        const useCase = new RemoveInventoryUseCase(repo);
        await expect(useCase.execute({ locationId: '', inventoryId: 'i1' }))
            .rejects.toThrow('Location ID is required');
    });

    it('debe lanzar error si inventoryId falta', async () => {
        const repo = createMockRepo();
        const useCase = new RemoveInventoryUseCase(repo);
        await expect(useCase.execute({ locationId: 'l1', inventoryId: '' }))
            .rejects.toThrow('Inventory ID is required');
    });
});
