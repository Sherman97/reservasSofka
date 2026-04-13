import { describe, it, expect, vi } from 'vitest';
import { GetLocationsUseCase } from './GetLocationsUseCase';
import { Location } from '../../../core/domain/entities/Location';
import type { ILocationRepository } from '../../../core/ports/repositories/ILocationRepository';

describe('GetLocationsUseCase', () => {
    const mockLocations = [
        new Location({ id: 'l1', name: 'Sala A', description: '', imageUrl: '', capacity: 10, type: 'sala', cityId: 'c1' }),
        new Location({ id: 'l2', name: 'Sala B', description: '', imageUrl: '', capacity: 20, type: 'sala', cityId: 'c1' })
    ];

    const createMockRepo = (overrides: Partial<ILocationRepository> = {}): ILocationRepository => ({
        getAll: vi.fn().mockResolvedValue(mockLocations),
        getById: vi.fn(),
        search: vi.fn().mockResolvedValue([mockLocations[0]]),
        assignInventory: vi.fn(),
        removeInventory: vi.fn(),
        ...overrides
    });

    it('debe retornar todas las ubicaciones sin filtros', async () => {
        const repo = createMockRepo();
        const useCase = new GetLocationsUseCase(repo);
        const result = await useCase.execute();
        expect(result).toEqual(mockLocations);
        expect(repo.getAll).toHaveBeenCalled();
    });

    it('debe retornar todas las ubicaciones con filtros vacíos', async () => {
        const repo = createMockRepo();
        const useCase = new GetLocationsUseCase(repo);
        const result = await useCase.execute({});
        expect(result).toEqual(mockLocations);
        expect(repo.getAll).toHaveBeenCalled();
    });

    it('debe buscar ubicaciones cuando hay filtros', async () => {
        const repo = createMockRepo();
        const useCase = new GetLocationsUseCase(repo);
        const result = await useCase.execute({ type: 'sala' });
        expect(result).toEqual([mockLocations[0]]);
        expect(repo.search).toHaveBeenCalledWith({ type: 'sala' });
    });

    it('debe buscar con filtro cityId', async () => {
        const repo = createMockRepo();
        const useCase = new GetLocationsUseCase(repo);
        await useCase.execute({ cityId: 'c1' });
        expect(repo.search).toHaveBeenCalledWith({ cityId: 'c1' });
    });
});
