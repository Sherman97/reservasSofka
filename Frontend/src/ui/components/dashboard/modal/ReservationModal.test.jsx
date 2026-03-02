import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReservationModal } from './ReservationModal';

// Mock sub-components
vi.mock('./Calendar', () => ({
    Calendar: () => <div data-testid="calendar">Calendar</div>
}));
vi.mock('./EquipmentSelector', () => ({
    EquipmentSelector: () => <div data-testid="equipment-selector">Equipment</div>
}));
vi.mock('./DurationSelector', () => ({
    DurationSelector: () => <div data-testid="duration-selector">Duration</div>
}));
vi.mock('../../../styles/dashboard/ReservationModal.css', () => ({}));

describe('ReservationModal', () => {
    const defaultProps = {
        isOpen: true,
        item: { title: 'Sala A', image: 'img.png', location: 'Sede Central', _type: 'location' },
        currentDate: new Date(2026, 5, 1),
        selectedDate: null,
        selectedEquipment: [],
        startTime: '08:00',
        endTime: '18:00',
        availability: {},
        onDateSelect: vi.fn(),
        onEquipmentToggle: vi.fn(),
        onStartTimeChange: vi.fn(),
        onEndTimeChange: vi.fn(),
        onPreviousMonth: vi.fn(),
        onNextMonth: vi.fn(),
        onClose: vi.fn(),
        onConfirm: vi.fn(),
        canConfirm: true,
        loading: false,
        error: null,
        busySlots: [],
        loadingSlots: false,
        hasTimeConflict: false,
        successMessage: null,
        slotsUpdatedFlag: false
    };

    beforeEach(() => { vi.clearAllMocks(); });

    it('no debe renderizar si isOpen=false', () => {
        const { container } = render(<ReservationModal {...defaultProps} isOpen={false} />);
        expect(container.innerHTML).toBe('');
    });

    it('debe renderizar modal cuando isOpen=true', () => {
        render(<ReservationModal {...defaultProps} />);
        expect(screen.getByText('Sala A')).toBeDefined();
    });

    it('debe mostrar ubicación', () => {
        render(<ReservationModal {...defaultProps} />);
        expect(screen.getByText('📍 Sede Central')).toBeDefined();
    });

    it('debe mostrar tipo locación', () => {
        render(<ReservationModal {...defaultProps} />);
        expect(screen.getByText('🏢 Locación')).toBeDefined();
    });

    it('debe mostrar Calendar', () => {
        render(<ReservationModal {...defaultProps} />);
        expect(screen.getByTestId('calendar')).toBeDefined();
    });

    it('debe mostrar DurationSelector', () => {
        render(<ReservationModal {...defaultProps} />);
        expect(screen.getByTestId('duration-selector')).toBeDefined();
    });

    it('debe mostrar EquipmentSelector', () => {
        render(<ReservationModal {...defaultProps} />);
        expect(screen.getByTestId('equipment-selector')).toBeDefined();
    });

    it('debe mostrar botón confirmar habilitado', () => {
        render(<ReservationModal {...defaultProps} />);
        const btn = screen.getByText('Confirmar Reserva');
        expect(btn.disabled).toBe(false);
    });

    it('debe deshabilitar botón cuando canConfirm=false', () => {
        render(<ReservationModal {...defaultProps} canConfirm={false} />);
        const btn = screen.getByText('Confirmar Reserva');
        expect(btn.disabled).toBe(true);
    });

    it('debe mostrar "Confirmando..." cuando loading', () => {
        render(<ReservationModal {...defaultProps} loading={true} canConfirm={true} />);
        expect(screen.getByText('Confirmando...')).toBeDefined();
    });

    it('debe llamar onClose al hacer clic en Cancelar', () => {
        render(<ReservationModal {...defaultProps} />);
        fireEvent.click(screen.getByText('Cancelar'));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('debe llamar onConfirm al hacer clic en Confirmar', () => {
        render(<ReservationModal {...defaultProps} />);
        fireEvent.click(screen.getByText('Confirmar Reserva'));
        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    it('debe mostrar error', () => {
        render(<ReservationModal {...defaultProps} error="Horario no disponible" />);
        expect(screen.getByText('Horario no disponible')).toBeDefined();
    });

    it('debe mostrar mensaje de éxito', () => {
        render(<ReservationModal {...defaultProps} successMessage="¡Reserva creada!" />);
        expect(screen.getByText('¡Reserva creada!')).toBeDefined();
    });

    it('debe mostrar "Cerrar" en vez de "Cancelar" al tener successMessage', () => {
        render(<ReservationModal {...defaultProps} successMessage="¡Reserva creada!" />);
        expect(screen.getByText('Cerrar')).toBeDefined();
    });

    it('debe cerrar al hacer clic en el overlay', () => {
        render(<ReservationModal {...defaultProps} />);
        const overlay = document.querySelector('.modal-overlay');
        fireEvent.click(overlay);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('no debe cerrar al hacer clic en el contenido', () => {
        render(<ReservationModal {...defaultProps} />);
        const content = document.querySelector('.modal-content');
        fireEvent.click(content);
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('debe cerrar al hacer clic en botón X', () => {
        render(<ReservationModal {...defaultProps} />);
        fireEvent.click(screen.getByText('✕'));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
