import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HandoverModal } from './HandoverModal';

vi.mock('../../styles/reservations/Reservations.css', () => ({}));

describe('HandoverModal', () => {
    const mockOnClose = vi.fn();
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockOnConfirm.mockResolvedValue(undefined);
    });

    it('no debe renderizar nada cuando isOpen es false', () => {
        const { container } = render(
            <HandoverModal isOpen={false} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );
        expect(container.innerHTML).toBe('');
    });

    it('debe renderizar el modal cuando isOpen es true', () => {
        render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );
        expect(screen.getByText('Registrar Entrega')).toBeDefined();
    });

    it('debe mostrar título de entrega para action=deliver', () => {
        render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );
        expect(screen.getByText('Registrar Entrega')).toBeDefined();
        expect(screen.getByText(/Confirmar la entrega del espacio "Sala A"/)).toBeDefined();
        expect(screen.getByText('Confirmar Entrega')).toBeDefined();
    });

    it('debe mostrar título de devolución para action=return', () => {
        render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="return" reservationName="Sala B" />
        );
        expect(screen.getByText('Registrar Devolución')).toBeDefined();
        expect(screen.getByText(/Confirmar la devolución del espacio "Sala B"/)).toBeDefined();
        expect(screen.getByText('Confirmar Devolución')).toBeDefined();
    });

    it('debe mostrar icono 📦 para deliver', () => {
        render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );
        expect(screen.getByText('📦')).toBeDefined();
    });

    it('debe mostrar icono ✅ para return', () => {
        render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="return" reservationName="Sala A" />
        );
        expect(screen.getByText('✅')).toBeDefined();
    });

    it('debe mostrar textarea para novedad', () => {
        render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );
        expect(screen.getByLabelText('Novedad (opcional)')).toBeDefined();
    });

    it('debe llamar onClose al hacer clic en Cancelar', () => {
        render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );
        fireEvent.click(screen.getByText('Cancelar'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('debe llamar onClose al hacer clic en el botón ✕', () => {
        render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );
        fireEvent.click(screen.getByText('✕'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('debe llamar onClose al hacer clic en el overlay', () => {
        const { container } = render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );
        fireEvent.click(container.querySelector('.handover-modal-overlay'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('no debe propagar clic del modal al overlay', () => {
        const { container } = render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );
        fireEvent.click(container.querySelector('.handover-modal'));
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('debe llamar onConfirm con la novedad al confirmar', async () => {
        render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );

        fireEvent.change(screen.getByLabelText('Novedad (opcional)'), {
            target: { value: 'Todo en buen estado' }
        });

        fireEvent.click(screen.getByText('Confirmar Entrega'));

        await waitFor(() => {
            expect(mockOnConfirm).toHaveBeenCalledWith('Todo en buen estado');
        });
    });

    it('debe llamar onConfirm con undefined si novedad está vacía', async () => {
        render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );

        fireEvent.click(screen.getByText('Confirmar Entrega'));

        await waitFor(() => {
            expect(mockOnConfirm).toHaveBeenCalledWith(undefined);
        });
    });

    it('debe mostrar "Procesando..." mientras se envía', async () => {
        let resolveConfirm;
        mockOnConfirm.mockImplementation(() => new Promise(resolve => { resolveConfirm = resolve; }));

        render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );

        fireEvent.click(screen.getByText('Confirmar Entrega'));

        await waitFor(() => {
            expect(screen.getByText('Procesando...')).toBeDefined();
        });

        resolveConfirm();
    });

    it('debe aplicar clase btn-deliver para acción deliver', () => {
        const { container } = render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="deliver" reservationName="Sala A" />
        );
        expect(container.querySelector('.btn-deliver')).not.toBeNull();
    });

    it('debe aplicar clase btn-return para acción return', () => {
        const { container } = render(
            <HandoverModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} action="return" reservationName="Sala A" />
        );
        expect(container.querySelector('.btn-return')).not.toBeNull();
    });
});
