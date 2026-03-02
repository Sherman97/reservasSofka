import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemCard } from './ItemCard';

// Mock useReservation hook
const mockReservation = {
    isOpen: false,
    openModal: vi.fn(),
    closeModal: vi.fn(),
    handleConfirm: vi.fn(),
    currentDate: new Date(2026, 5, 1),
    selectedDate: null,
    selectedEquipment: [],
    startTime: '08:00',
    endTime: '18:00',
    availability: {},
    loading: false,
    error: null,
    busySlots: [],
    loadingSlots: false,
    hasTimeConflict: false,
    successMessage: null,
    slotsUpdatedFlag: false,
    handleDateSelect: vi.fn(),
    handleEquipmentToggle: vi.fn(),
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
    goToPreviousMonth: vi.fn(),
    goToNextMonth: vi.fn(),
    canConfirm: false
};

vi.mock('../../../core/adapters/hooks/useReservation', () => ({
    useReservation: () => mockReservation
}));

// Mock ReservationModal to simplify
vi.mock('./modal/ReservationModal', () => ({
    ReservationModal: ({ isOpen }) => isOpen ? <div data-testid="reservation-modal">Modal</div> : null
}));

describe('ItemCard', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    const locationItem = {
        id: 'loc1', title: 'Sala A', subtitle: 'Capacidad: 10 personas',
        image: 'img.png', available: true, _type: 'location',
        tags: ['wifi', 'pizarra'], _entity: { id: 'loc1', name: 'Sala A' }
    };

    const inventoryItem = {
        id: 'inv1', title: 'Proyector', subtitle: 'Disponibles: 5',
        image: 'proj.png', available: true, _type: 'inventory',
        tags: ['equipo'], category: 'Multimedia'
    };

    it('debe renderizar item de tipo location', () => {
        render(<ItemCard item={locationItem} />);
        expect(screen.getByText('Sala A')).toBeDefined();
        expect(screen.getByText('📍 Capacidad: 10 personas')).toBeDefined();
    });

    it('debe mostrar badge DISPONIBLE', () => {
        render(<ItemCard item={locationItem} />);
        expect(screen.getByText('DISPONIBLE')).toBeDefined();
    });

    it('debe mostrar badge NO DISPONIBLE', () => {
        render(<ItemCard item={{ ...locationItem, available: false }} />);
        expect(screen.getByText('NO DISPONIBLE')).toBeDefined();
    });

    it('debe mostrar botón Reservar para locations', () => {
        render(<ItemCard item={locationItem} />);
        expect(screen.getByText('📅 Reservar')).toBeDefined();
    });

    it('debe mostrar botón Ver Detalles para inventory', () => {
        render(<ItemCard item={inventoryItem} />);
        expect(screen.getByText('ℹ️ Ver Detalles')).toBeDefined();
    });

    it('debe mostrar categoría Sala para locations', () => {
        render(<ItemCard item={locationItem} />);
        expect(screen.getByText('🏢 Sala')).toBeDefined();
    });

    it('debe mostrar categoría de equipo para inventory', () => {
        render(<ItemCard item={inventoryItem} />);
        expect(screen.getByText('🎧 Multimedia')).toBeDefined();
    });

    it('debe mostrar tags', () => {
        render(<ItemCard item={locationItem} />);
        expect(screen.getByText('wifi')).toBeDefined();
        expect(screen.getByText('pizarra')).toBeDefined();
    });

    it('debe llamar openModal al hacer clic en Reservar', () => {
        render(<ItemCard item={locationItem} />);
        fireEvent.click(screen.getByText('📅 Reservar'));
        expect(mockReservation.openModal).toHaveBeenCalled();
    });

    it('debe mostrar modal cuando isOpen es true', () => {
        mockReservation.isOpen = true;
        render(<ItemCard item={locationItem} />);
        expect(screen.getByTestId('reservation-modal')).toBeDefined();
        mockReservation.isOpen = false;
    });

    it('no debe mostrar modal para inventory', () => {
        const { container } = render(<ItemCard item={inventoryItem} />);
        expect(container.querySelector('[data-testid="reservation-modal"]')).toBeNull();
    });

    it('debe mostrar imagen del item', () => {
        render(<ItemCard item={locationItem} />);
        const img = screen.getByAltText('Sala A');
        expect(img).toBeDefined();
    });
});
