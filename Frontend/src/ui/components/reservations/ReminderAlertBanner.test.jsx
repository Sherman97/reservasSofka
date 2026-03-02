import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReminderAlertBanner } from './ReminderAlertBanner';

vi.mock('../../styles/reservations/ReminderAlerts.css', () => ({}));

describe('ReminderAlertBanner', () => {
    const mockOnDismiss = vi.fn();
    const mockOnClearAll = vi.fn();

    beforeEach(() => { vi.clearAllMocks(); });

    const createAlert = (overrides = {}) => ({
        id: 'alert-1',
        reservationId: 42,
        type: 'reminder_15m',
        message: 'Faltan 15 minutos',
        timestamp: new Date(),
        ...overrides
    });

    it('no debe renderizar nada cuando alerts está vacío', () => {
        const { container } = render(
            <ReminderAlertBanner alerts={[]} onDismiss={mockOnDismiss} onClearAll={mockOnClearAll} />
        );
        expect(container.innerHTML).toBe('');
    });

    it('no debe renderizar nada cuando alerts es null', () => {
        const { container } = render(
            <ReminderAlertBanner alerts={null} onDismiss={mockOnDismiss} onClearAll={mockOnClearAll} />
        );
        expect(container.innerHTML).toBe('');
    });

    it('debe renderizar alertas cuando hay elementos', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert()]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('Faltan 15 minutos')).toBeDefined();
    });

    it('debe mostrar el contador de alertas', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert(), createAlert({ id: 'alert-2', reservationId: 43 })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('🔔 Recordatorios (2)')).toBeDefined();
    });

    it('debe mostrar botón Limpiar todos cuando hay más de 1 alerta', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert(), createAlert({ id: 'alert-2', reservationId: 43 })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('Limpiar todos')).toBeDefined();
    });

    it('no debe mostrar botón Limpiar todos con solo 1 alerta', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert()]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.queryByText('Limpiar todos')).toBeNull();
    });

    it('debe llamar onClearAll al hacer clic en Limpiar todos', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert(), createAlert({ id: 'alert-2', reservationId: 43 })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        fireEvent.click(screen.getByText('Limpiar todos'));
        expect(mockOnClearAll).toHaveBeenCalled();
    });

    it('debe llamar onDismiss con el id al hacer clic en descartar', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert({ id: 'my-alert-id' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        fireEvent.click(screen.getByText('✕'));
        expect(mockOnDismiss).toHaveBeenCalledWith('my-alert-id');
    });

    it('debe aplicar la clase alert-warning para reminder_15m', () => {
        const { container } = render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'reminder_15m' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(container.querySelector('.alert-warning')).not.toBeNull();
    });

    it('debe aplicar la clase alert-urgent para reminder_5m', () => {
        const { container } = render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'reminder_5m' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(container.querySelector('.alert-urgent')).not.toBeNull();
    });

    it('debe aplicar la clase alert-danger para overdue_10m', () => {
        const { container } = render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'overdue_10m' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    it('debe mostrar icono ⏰ para reminder_15m', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'reminder_15m' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('⏰')).toBeDefined();
    });

    it('debe mostrar icono ⚠️ para reminder_5m', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'reminder_5m' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('⚠️')).toBeDefined();
    });

    it('debe mostrar icono 🚨 para overdue_10m', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'overdue_10m' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('🚨')).toBeDefined();
    });

    it('debe mostrar badge 15 min para reminder_15m', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'reminder_15m' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('15 min')).toBeDefined();
    });

    it('debe mostrar badge 5 min para reminder_5m', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'reminder_5m' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('5 min')).toBeDefined();
    });

    it('debe mostrar badge Vencida para overdue_10m', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'overdue_10m' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('Vencida')).toBeDefined();
    });

    it('debe mostrar el número de reserva', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert({ reservationId: 42 })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('Reserva #42')).toBeDefined();
    });

    it('debe mostrar alert-info para tipo desconocido', () => {
        const { container } = render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'unknown_type' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(container.querySelector('.alert-info')).not.toBeNull();
    });

    it('debe mostrar icono 🔔 para tipo desconocido', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'unknown_type' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('🔔')).toBeDefined();
    });

    it('debe mostrar badge Alerta para tipo desconocido', () => {
        render(
            <ReminderAlertBanner
                alerts={[createAlert({ type: 'unknown_type' })]}
                onDismiss={mockOnDismiss}
                onClearAll={mockOnClearAll}
            />
        );
        expect(screen.getByText('Alerta')).toBeDefined();
    });
});
