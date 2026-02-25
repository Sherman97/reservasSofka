import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from 'react';
import { useReservationDependencies } from '../providers/DependencyProvider';
import type { Location } from '../../../core/domain/entities/Location';
import type { InventoryItem } from '../../../core/domain/entities/InventoryItem';

interface DashboardFilters {
    room: boolean;
    equipment: boolean;
    capacity: number;
}

interface DashboardItem {
    title: string;
    capacity?: number;
    tags?: string[];
    _type: 'location' | 'inventory';
    _entity: Location | InventoryItem;
    [key: string]: unknown;
}

interface UseDashboardReturn {
    items: DashboardItem[];
    locations: Location[];
    inventory: InventoryItem[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
    filters: DashboardFilters;
    handleFilterChange: (filterName: keyof DashboardFilters, value: boolean | number) => void;
    reload: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
    const { getLocationsUseCase, getInventoryUseCase } = useReservationDependencies();

    const [locations, setLocations] = useState<Location[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<DashboardFilters>({ room: true, equipment: false, capacity: 0 });

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [locationsData, inventoryData] = await Promise.all([
                getLocationsUseCase.execute(),
                getInventoryUseCase.execute()
            ]);
            setLocations(locationsData);
            setInventory(inventoryData);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError((err as Error).message || 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    }, [getLocationsUseCase, getInventoryUseCase]);

    useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

    const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => { setSearchQuery(e.target.value); };
    const handleFilterChange = (filterName: keyof DashboardFilters, value: boolean | number): void => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const items = useMemo((): DashboardItem[] => {
        const locationItems: DashboardItem[] = locations.map(loc => ({
            ...loc.getDisplayInfo(), capacity: loc.capacity, tags: loc.amenities, _type: 'location' as const, _entity: loc
        }));
        const inventoryItems: DashboardItem[] = inventory.map(item => ({
            ...item.getDisplayInfo(), tags: [item.category], _type: 'inventory' as const, _entity: item
        }));
        return [...locationItems, ...inventoryItems];
    }, [locations, inventory]);

    const filteredItems = useMemo((): DashboardItem[] => {
        return items.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
            let matchesCategory = true;
            if (filters.room && filters.equipment) matchesCategory = true;
            else if (filters.room) matchesCategory = item._type === 'location';
            else if (filters.equipment) matchesCategory = item._type === 'inventory';
            let matchesCapacity = true;
            if (filters.capacity > 0 && item._type === 'location') matchesCapacity = (item.capacity ?? 0) >= filters.capacity;
            return matchesSearch && matchesCategory && matchesCapacity;
        });
    }, [items, searchQuery, filters]);

    return { items: filteredItems, locations, inventory, loading, error, searchQuery, handleSearch, filters, handleFilterChange, reload: loadDashboardData };
};
