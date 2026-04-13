import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboard } from './useDashboard';
import { Location } from '../../../core/domain/entities/Location';
import { InventoryItem } from '../../../core/domain/entities/InventoryItem';

const mockGetLocationsExecute = vi.fn();
const mockGetInventoryExecute = vi.fn();

vi.mock('../providers/DependencyProvider', () => ({
    useReservationDependencies: () => ({
        getLocationsUseCase: { execute: mockGetLocationsExecute },
        getInventoryUseCase: { execute: mockGetInventoryExecute }
    })
}));

const createLocation = (overrides: Partial<import('../../../core/domain/entities/Location').LocationProps> = {}) =>
    new Location({ id: 'loc1', name: 'Sala A', description: 'desc', imageUrl: 'img.png', capacity: 10, type: 'sala', cityId: 'c1', amenities: ['wifi'], ...overrides });

const createInventory = (overrides: Partial<import('../../../core/domain/entities/InventoryItem').InventoryItemProps> = {}) =>
    new InventoryItem({ id: 'inv1', name: 'Proyector', description: 'desc', imageUrl: 'img.png', quantity: 5, category: 'equipo', ...overrides });

describe('useDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockGetLocationsExecute.mockResolvedValue([createLocation()]);
        mockGetInventoryExecute.mockResolvedValue([createInventory()]);
    });

    afterEach(() => { vi.restoreAllMocks(); });

    it('debe iniciar en estado loading', () => {
        const { result } = renderHook(() => useDashboard());
        expect(result.current.loading).toBe(true);
    });

    it('debe cargar locations e inventory', async () => {
        const { result } = renderHook(() => useDashboard());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.locations).toHaveLength(1);
        expect(result.current.inventory).toHaveLength(1);
        // Default filter: room=true, equipment=false → only locations shown
        expect(result.current.items).toHaveLength(1);
        expect(result.current.error).toBeNull();
    });

    it('debe mapear items con _type location e inventory', async () => {
        const { result } = renderHook(() => useDashboard());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Enable both filters to see all items
        act(() => { result.current.handleFilterChange('equipment', true); });

        const locationItem = result.current.items.find(i => i._type === 'location');
        const inventoryItem = result.current.items.find(i => i._type === 'inventory');
        expect(locationItem?.title).toBe('Sala A');
        expect(inventoryItem?.title).toBe('Proyector');
    });

    it('debe filtrar por búsqueda', async () => {
        mockGetLocationsExecute.mockResolvedValue([
            createLocation({ id: 'l1', name: 'Sala A' }),
            createLocation({ id: 'l2', name: 'Sala B' })
        ]);
        const { result } = renderHook(() => useDashboard());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.handleSearch({ target: { value: 'Sala B' } } as React.ChangeEvent<HTMLInputElement>);
        });

        const locationItems = result.current.items.filter(i => i._type === 'location');
        expect(locationItems).toHaveLength(1);
        expect(locationItems[0].title).toBe('Sala B');
    });

    it('debe filtrar solo locations cuando room=true y equipment=false', async () => {
        const { result } = renderHook(() => useDashboard());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Default: room=true, equipment=false → solo locations
        const types = result.current.items.map(i => i._type);
        expect(types).toContain('location');
        expect(types).not.toContain('inventory');
    });

    it('debe mostrar todos cuando room=true y equipment=true', async () => {
        const { result } = renderHook(() => useDashboard());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => { result.current.handleFilterChange('equipment', true); });

        expect(result.current.items.map(i => i._type)).toContain('location');
        expect(result.current.items.map(i => i._type)).toContain('inventory');
    });

    it('debe filtrar solo inventory cuando room=false y equipment=true', async () => {
        const { result } = renderHook(() => useDashboard());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.handleFilterChange('room', false);
            result.current.handleFilterChange('equipment', true);
        });

        const types = result.current.items.map(i => i._type);
        expect(types).toContain('inventory');
        expect(types).not.toContain('location');
    });

    it('debe filtrar por capacidad mínima', async () => {
        mockGetLocationsExecute.mockResolvedValue([
            createLocation({ id: 'l1', name: 'Pequeña', capacity: 5 }),
            createLocation({ id: 'l2', name: 'Grande', capacity: 20 })
        ]);
        const { result } = renderHook(() => useDashboard());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => { result.current.handleFilterChange('capacity', 10); });

        const locationItems = result.current.items.filter(i => i._type === 'location');
        expect(locationItems).toHaveLength(1);
        expect(locationItems[0].title).toBe('Grande');
    });

    it('debe manejar error de carga', async () => {
        mockGetLocationsExecute.mockRejectedValue(new Error('Network error'));
        const { result } = renderHook(() => useDashboard());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Network error');
    });

    it('reload debe volver a cargar datos', async () => {
        const { result } = renderHook(() => useDashboard());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const callsBefore = mockGetLocationsExecute.mock.calls.length;

        await act(async () => { await result.current.reload(); });

        expect(mockGetLocationsExecute).toHaveBeenCalledTimes(callsBefore + 1);
    });

    it('debe buscar por tags', async () => {
        mockGetLocationsExecute.mockResolvedValue([
            createLocation({ id: 'l1', name: 'Sala X', amenities: ['wifi', 'pizarra'] })
        ]);
        mockGetInventoryExecute.mockResolvedValue([]);
        const { result } = renderHook(() => useDashboard());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.handleSearch({ target: { value: 'pizarra' } } as React.ChangeEvent<HTMLInputElement>);
        });

        expect(result.current.items).toHaveLength(1);
    });
});
