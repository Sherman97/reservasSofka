import { useState, useEffect, useMemo } from 'react';
import { getItems } from '../services/dashboardService';

export const useDashboard = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        room: true,
        equipment: false,
        capacity: 0
    });

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await getItems();
            setItems(data);
        } catch (error) {
            console.error("Failed to load dashboard items", error);
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

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Search filter
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            // Category filter
            let matchesCategory = true;
            if (filters.room && filters.equipment) {
                matchesCategory = true; // Both selected
            } else if (filters.room) {
                matchesCategory = item.type === 'Room';
            } else if (filters.equipment) {
                matchesCategory = item.type === 'Equipment';
            }

            // Capacity filter (simplified)
            let matchesCapacity = true;
            if (filters.capacity > 0) {
                matchesCapacity = item.capacity >= filters.capacity;
            }

            return matchesSearch && matchesCategory && matchesCapacity;
        });
    }, [items, searchQuery, filters]);

    return {
        items: filteredItems,
        loading,
        searchQuery,
        handleSearch,
        filters,
        handleFilterChange
    };
};
