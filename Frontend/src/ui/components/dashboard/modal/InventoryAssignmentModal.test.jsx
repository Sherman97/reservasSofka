import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InventoryAssignmentModal } from './InventoryAssignmentModal';

const mockGetInventoryExecute = vi.fn();
const mockAssignInventoryExecute = vi.fn();
const mockRemoveInventoryExecute = vi.fn();

// Use a STABLE reference so useCallback/useEffect don't re-fire on every render
const stableDeps = {
    getInventoryUseCase: { execute: mockGetInventoryExecute },
    assignInventoryUseCase: { execute: mockAssignInventoryExecute },
    removeInventoryUseCase: { execute: mockRemoveInventoryExecute }
};

vi.mock('../../../../core/adapters/hooks/useDependencies', () => ({
    useDependencies: () => stableDeps
}));

vi.mock('../../../styles/dashboard/InventoryAssignmentModal.css', () => ({}));

describe('InventoryAssignmentModal', () => {
    let defaultProps;

    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.stubGlobal('alert', vi.fn());
        vi.stubGlobal('confirm', vi.fn(() => true));

        mockGetInventoryExecute.mockReset();
        mockAssignInventoryExecute.mockReset();
        mockRemoveInventoryExecute.mockReset();

        mockGetInventoryExecute.mockResolvedValue([
            { id: 'inv1', name: 'Proyector', category: 'Multimedia' },
            { id: 'inv2', name: 'Pizarra', category: 'Oficina' }
        ]);
        mockAssignInventoryExecute.mockResolvedValue({});
        mockRemoveInventoryExecute.mockResolvedValue({});

        defaultProps = {
            isOpen: true,
            location: {
                id: 'loc1', name: 'Sala A', subtitle: 'Piso 2',
                inventory: [{ id: 'inv1', name: 'Proyector', qty: 2 }]
            },
            onClose: vi.fn(),
            onSuccess: vi.fn()
        };
    });

    afterEach(() => { vi.restoreAllMocks(); });

    it('no debe renderizar si isOpen=false', () => {
        const { container } = render(<InventoryAssignmentModal {...defaultProps} isOpen={false} />);
        expect(container.innerHTML).toBe('');
    });

    it('debe renderizar modal con nombre de locación', async () => {
        render(<InventoryAssignmentModal {...defaultProps} />);
        expect(screen.getByText('Gestionar Inventario - Sala A')).toBeDefined();
    });

    it('debe mostrar inventario actual', async () => {
        render(<InventoryAssignmentModal {...defaultProps} />);
        expect(screen.getByText('Proyector')).toBeDefined();
        expect(screen.getByText('Cantidad: 2')).toBeDefined();
    });

    it('debe cargar inventario disponible', async () => {
        render(<InventoryAssignmentModal {...defaultProps} />);
        await waitFor(() => {
            expect(mockGetInventoryExecute).toHaveBeenCalled();
        });
    });

    it('debe mostrar opciones en select', async () => {
        render(<InventoryAssignmentModal {...defaultProps} />);
        await waitFor(() => {
            expect(screen.getByText('Proyector (Multimedia)')).toBeDefined();
            expect(screen.getByText('Pizarra (Oficina)')).toBeDefined();
        });
    });

    it('debe asignar inventario exitosamente', async () => {
        render(<InventoryAssignmentModal {...defaultProps} />);
        await waitFor(() => screen.getByText('Proyector (Multimedia)'));

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'inv2' } });

        // Wait for button to become enabled
        const btn = await waitFor(() => {
            const b = screen.getByText('➕ Asignar Inventario');
            expect(b.disabled).toBe(false);
            return b;
        });
        fireEvent.click(btn);

        await waitFor(() => {
            expect(mockAssignInventoryExecute).toHaveBeenCalledWith({
                locationId: 'loc1', inventoryId: 'inv2', qty: 1
            });
        });
    });

    it('debe remover inventario con confirmación', async () => {
        render(<InventoryAssignmentModal {...defaultProps} />);
        await waitFor(() => screen.getByText('Proyector (Multimedia)'));

        fireEvent.click(screen.getByText('🗑️ Remover'));

        await waitFor(() => {
            expect(mockRemoveInventoryExecute).toHaveBeenCalledWith({
                locationId: 'loc1', inventoryId: 'inv1'
            });
        });
    });

    it('no debe remover si usuario cancela confirmación', async () => {
        vi.stubGlobal('confirm', vi.fn(() => false));
        render(<InventoryAssignmentModal {...defaultProps} />);
        await waitFor(() => screen.getByText('Proyector (Multimedia)'));

        fireEvent.click(screen.getByText('🗑️ Remover'));

        expect(mockRemoveInventoryExecute).not.toHaveBeenCalled();
    });

    it('debe mostrar mensaje cuando no hay inventario', () => {
        render(<InventoryAssignmentModal {...defaultProps}
            location={{ ...defaultProps.location, inventory: [] }}
        />);
        expect(screen.getByText('No hay inventario asignado')).toBeDefined();
    });

    it('debe cerrar modal al hacer clic en Cerrar', () => {
        render(<InventoryAssignmentModal {...defaultProps} />);
        fireEvent.click(screen.getByText('Cerrar'));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('debe manejar error al cargar inventario', async () => {
        mockGetInventoryExecute.mockRejectedValue(new Error('Error'));
        render(<InventoryAssignmentModal {...defaultProps} />);
        await waitFor(() => {
            expect(screen.getByText('Error al cargar el inventario disponible')).toBeDefined();
        });
    });

    it('debe tener botón deshabilitado sin selección', async () => {
        render(<InventoryAssignmentModal {...defaultProps} />);
        await waitFor(() => screen.getByText('Proyector (Multimedia)'));

        // Button should be disabled when no item is selected
        const btn = screen.getByText('➕ Asignar Inventario');
        expect(btn.disabled).toBe(true);
    });

    it('debe manejar error al asignar inventario', async () => {
        mockAssignInventoryExecute.mockRejectedValue(new Error('Assign failed'));
        render(<InventoryAssignmentModal {...defaultProps} />);
        await waitFor(() => screen.getByText('Proyector (Multimedia)'));

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'inv2' } });

        const btn = await waitFor(() => {
            const b = screen.getByText('➕ Asignar Inventario');
            expect(b.disabled).toBe(false);
            return b;
        });
        fireEvent.click(btn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Assign failed');
        });
    });

    it('debe manejar error al remover inventario', async () => {
        mockRemoveInventoryExecute.mockRejectedValue(new Error('Remove failed'));
        render(<InventoryAssignmentModal {...defaultProps} />);
        await waitFor(() => screen.getByText('Proyector (Multimedia)'));

        fireEvent.click(screen.getByText('🗑️ Remover'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Remove failed');
        });
    });

    it('debe cerrar al hacer clic en overlay', () => {
        render(<InventoryAssignmentModal {...defaultProps} />);
        const overlay = document.querySelector('.modal-overlay');
        fireEvent.click(overlay);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('debe cerrar al hacer clic en botón X', () => {
        render(<InventoryAssignmentModal {...defaultProps} />);
        fireEvent.click(screen.getByText('✕'));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
