import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DurationSelector } from './DurationSelector';

describe('DurationSelector', () => {
    const defaultProps = {
        startTime: '09:00',
        endTime: '12:00',
        onStartTimeChange: vi.fn(),
        onEndTimeChange: vi.fn(),
        busySlots: [],
        loadingSlots: false,
        hasTimeConflict: false,
        selectedDate: null,
        slotsUpdatedFlag: false,
        successMessage: null
    };

    beforeEach(() => { vi.clearAllMocks(); });

    it('debe renderizar inputs de hora', () => {
        render(<DurationSelector {...defaultProps} />);
        expect(screen.getByLabelText('INICIO')).toBeDefined();
        expect(screen.getByLabelText('FIN')).toBeDefined();
    });

    it('debe mostrar info de horario', () => {
        render(<DurationSelector {...defaultProps} />);
        expect(screen.getByText('solo se puede reservar de: 8:00 AM - 6:00 PM')).toBeDefined();
    });

    it('debe llamar onStartTimeChange al cambiar hora inicio', () => {
        render(<DurationSelector {...defaultProps} />);
        fireEvent.change(screen.getByLabelText('INICIO'), { target: { value: '10:00' } });
        expect(defaultProps.onStartTimeChange).toHaveBeenCalledWith('10:00');
    });

    it('debe llamar onEndTimeChange al cambiar hora fin', () => {
        render(<DurationSelector {...defaultProps} />);
        fireEvent.change(screen.getByLabelText('FIN'), { target: { value: '14:00' } });
        expect(defaultProps.onEndTimeChange).toHaveBeenCalledWith('14:00');
    });

    it('debe mostrar warning de conflicto cuando hasTimeConflict=true', () => {
        render(<DurationSelector {...defaultProps} hasTimeConflict={true} />);
        expect(screen.getByText('El horario seleccionado se solapa con una reserva existente')).toBeDefined();
    });

    it('no debe mostrar warning de conflicto si hay successMessage', () => {
        render(<DurationSelector {...defaultProps} hasTimeConflict={true} successMessage="Creada!" />);
        expect(screen.queryByText('El horario seleccionado se solapa con una reserva existente')).toBeNull();
    });

    it('debe mostrar timeline cuando hay selectedDate', () => {
        render(<DurationSelector {...defaultProps} selectedDate={15} />);
        expect(screen.getByText('Disponibilidad del día')).toBeDefined();
        // Should show HOURS labels (08:00 to 17:00)
        expect(screen.getByText('08:00')).toBeDefined();
    });

    it('no debe mostrar timeline sin selectedDate', () => {
        render(<DurationSelector {...defaultProps} />);
        expect(screen.queryByText('Disponibilidad del día')).toBeNull();
    });

    it('debe mostrar "Cargando..." cuando loadingSlots=true', () => {
        render(<DurationSelector {...defaultProps} selectedDate={15} loadingSlots={true} />);
        expect(screen.getByText('Cargando...')).toBeDefined();
    });

    it('debe mostrar banner de actualización en tiempo real', () => {
        render(<DurationSelector {...defaultProps} selectedDate={15} slotsUpdatedFlag={true} />);
        expect(screen.getByText('🔄 Disponibilidad actualizada en tiempo real')).toBeDefined();
    });

    it('debe mostrar leyenda de slots', () => {
        render(<DurationSelector {...defaultProps} selectedDate={15} />);
        expect(screen.getByText('Disponible')).toBeDefined();
        expect(screen.getByText('Ocupado')).toBeDefined();
        expect(screen.getByText('Seleccionado')).toBeDefined();
    });

    it('debe mostrar slots busy con clase busy', () => {
        const { container } = render(
            <DurationSelector {...defaultProps} selectedDate={15}
                busySlots={[{ start: '10:00', end: '11:00' }]}
                startTime="08:00" endTime="09:00"
            />
        );
        const busySlots = container.querySelectorAll('.time-slot.busy');
        expect(busySlots.length).toBeGreaterThan(0);
    });

    it('debe mostrar slots selected con clase selected', () => {
        const { container } = render(
            <DurationSelector {...defaultProps} selectedDate={15}
                startTime="09:00" endTime="11:00"
            />
        );
        const selectedSlots = container.querySelectorAll('.time-slot.selected');
        expect(selectedSlots.length).toBeGreaterThan(0);
    });

    it('debe mostrar reservas existentes', () => {
        render(
            <DurationSelector {...defaultProps} selectedDate={15}
                busySlots={[{ start: '10:00', end: '12:00' }]}
            />
        );
        expect(screen.getByText('Reservas existentes:')).toBeDefined();
        expect(screen.getByText('10:00 - 12:00')).toBeDefined();
    });

    it('debe aplicar clase time-conflict a inputs cuando hay conflicto', () => {
        render(<DurationSelector {...defaultProps} hasTimeConflict={true} />);
        const startInput = screen.getByLabelText('INICIO');
        expect(startInput.className).toContain('time-conflict');
    });
});
