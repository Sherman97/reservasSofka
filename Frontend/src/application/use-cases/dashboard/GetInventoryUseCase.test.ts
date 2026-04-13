import { describe, it, expect, vi } from 'vitest';
import { GetInventoryUseCase } from './GetInventoryUseCase';
import { InventoryItem } from '../../../core/domain/entities/InventoryItem';
import type { IInventoryRepository } from '../../../core/ports/repositories/IInventoryRepository';

describe('GetInventoryUseCase', () => {
    const mockItems = [
        new InventoryItem({ id: 'i1', name: 'Proyector', description: '', imageUrl: '', quantity: 3, category: 'tech', available: true }),
        new InventoryItem({ id: 'i2', name: 'Pizarra', description: '', imageUrl: '', quantity: 5, category: 'office', available: true })
    ];

    const createMockRepo = (overrides: Partial<IInventoryRepository> = {}): IInventoryRepository => ({
        getAll: vi.fn().mockResolvedValue(mockItems),
        getById: vi.fn(),
        getByCityId: vi.fn().mockResolvedValue([mockItems[0]]),
        search: vi.fn(),
        ...overrides
    });

    it('debe retornar todos los items sin parámetros', async () => {
        const repo = createMockRepo();
        const useCase = new GetInventoryUseCase(repo);
        const result = await useCase.execute();
        expect(result).toEqual(mockItems);
        expect(repo.getAll).toHaveBeenCalled();
    });

    it('debe retornar todos los items con objeto vacío', async () => {
        const repo = createMockRepo();
        const useCase = new GetInventoryUseCase(repo);
        const result = await useCase.execute({});
        expect(result).toEqual(mockItems);
        expect(repo.getAll).toHaveBeenCalled();
    });

    it('debe filtrar por cityId', async () => {
        const repo = createMockRepo();
        const useCase = new GetInventoryUseCase(repo);
        const result = await useCase.execute({ cityId: 'c1' });
        expect(result).toEqual([mockItems[0]]);
        expect(repo.getByCityId).toHaveBeenCalledWith('c1');
    });
});
