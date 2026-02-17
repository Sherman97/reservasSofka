import { useState, useEffect, useMemo } from 'react';
import { useDependencies } from '../providers/DependencyProvider';

/**
 * useDashboard - Adapter Hook
 * Connects UI to Dashboard use cases (GetLocations, GetInventory)
 * Manages UI state for dashboard items, search, and filters
 */
export const useDashboard = () => {
    const { getLocationsUseCase, getInventoryUseCase } = useDependencies();

    const [locations, setLocations] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        room: true,
        equipment: false,
        capacity: 0
    });

    // Load locations and inventory on mount
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Load locations and inventory in parallel
            const [locationsData, inventoryData] = await Promise.all([
                getLocationsUseCase.execute(),
                getInventoryUseCase.execute()
            ]);

            setLocations(locationsData);
            setInventory(inventoryData);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError(err.message || 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    // Combine locations and inventory into items array for UI
    const items = useMemo(() => {
        const locationItems = locations.map(loc => ({
            ...loc.getDisplayInfo(),
            capacity: loc.capacity,
            tags: loc.amenities,
            _type: 'location',
            _entity: loc
        }));

        const inventoryItems = inventory.map(item => ({
            ...item.getDisplayInfo(),
            tags: [item.category],
            _type: 'inventory',
            _entity: item
        }));

        return [...locationItems, ...inventoryItems];
    }, [locations, inventory]);

    // Filter items based on search query and filters
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Search filter
            const matchesSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.tags && item.tags.some(tag =>
                    tag.toLowerCase().includes(searchQuery.toLowerCase())
                ));

            // Category filter
            let matchesCategory = true;
            if (filters.room && filters.equipment) {
                matchesCategory = true; // Both selected
            } else if (filters.room) {
                matchesCategory = item._type === 'location';
            } else if (filters.equipment) {
                matchesCategory = item._type === 'inventory';
            }

            // Capacity filter (only for rooms/locations)
            let matchesCapacity = true;
            if (filters.capacity > 0 && item._type === 'location') {
                matchesCapacity = item.capacity >= filters.capacity;
            }

            return matchesSearch && matchesCategory && matchesCapacity;
        });
    }, [items, searchQuery, filters]);

    return {
        items: filteredItems,
        locations,
        inventory,
        loading,
        error,
        searchQuery,
        handleSearch,
        filters,
        handleFilterChange,
        reload: loadDashboardData
    };
};
