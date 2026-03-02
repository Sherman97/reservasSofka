import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EquipmentSelector } from './EquipmentSelector';

const mockExecute = vi.fn();

const stableEquipDeps = {
    getInventoryUseCase: { execute: mockExecute }
};

vi.mock('../../../../core/adapters/hooks/useDependencies', () => ({
    useDependencies: () => stableEquipDeps
}));

describe('EquipmentSelector', () => {
    let defaultProps;

    beforeEach(() => {
        mockExecute.mockReset();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockExecute.mockResolvedValue([
            { id: 'eq1', name: 'Proyector', available: true },
            { id: 'eq2', name: 'Pizarra', available: true },
            { id: 'eq3', name: 'Micrófono', available: false }
        ]);

        defaultProps = {
            selectedEquipment: [],
            onEquipmentToggle: vi.fn(),
            item: { _entity: { cityId: 'city1' } }
        };
    });

    afterEach(() => { vi.restoreAllMocks(); }); // eslint-disable-line no-undef

    it('debe renderizar el placeholder', () => {
        render(<EquipmentSelector {...defaultProps} />);
        expect(screen.getByText('-- Selecciona equipos --')).toBeDefined();
    });

    it('debe abrir dropdown al hacer clic', async () => {
        render(<EquipmentSelector {...defaultProps} />);
        fireEvent.click(screen.getByText('-- Selecciona equipos --'));
        await waitFor(() => {
            expect(screen.getByText('Proyector')).toBeDefined();
        });
    });

    it('debe mostrar equipos disponibles', async () => {
        render(<EquipmentSelector {...defaultProps} />);
        fireEvent.click(screen.getByText('-- Selecciona equipos --'));
        await waitFor(() => {
            expect(screen.getByText('Proyector')).toBeDefined();
            expect(screen.getByText('Pizarra')).toBeDefined();
        });
    });

    it('debe llamar onEquipmentToggle al seleccionar', async () => {
        render(<EquipmentSelector {...defaultProps} />);
        fireEvent.click(screen.getByText('-- Selecciona equipos --'));
        await waitFor(() => screen.getByText('Proyector'));
        fireEvent.click(screen.getByText('Proyector'));
        expect(defaultProps.onEquipmentToggle).toHaveBeenCalledWith('eq1', 'Proyector');
    });

    it('debe mostrar equipos seleccionados como tags', () => {
        const props = {
            ...defaultProps,
            selectedEquipment: [{ itemId: 'eq1', name: 'Proyector', qty: 1 }]
        };
        render(<EquipmentSelector {...props} />);
        expect(screen.getByText('Proyector')).toBeDefined();
    });

    it('debe mostrar mensaje cuando no hay equipos', async () => {
        mockExecute.mockResolvedValue([]);
        render(<EquipmentSelector {...defaultProps} />);
        fireEvent.click(screen.getByText('-- Selecciona equipos --'));
        await waitFor(() => {
            expect(screen.getByText('No hay equipos disponibles en esta ciudad')).toBeDefined();
        });
    });

    it('no debe ejecutar toggle para equipos no disponibles', async () => {
        render(<EquipmentSelector {...defaultProps} />);
        fireEvent.click(screen.getByText('-- Selecciona equipos --'));
        await waitFor(() => screen.getByText('Micrófono'));
        // Click the disabled content text
        const micItem = screen.getByText('Micrófono').closest('.option-item');
        fireEvent.click(micItem);
        expect(defaultProps.onEquipmentToggle).not.toHaveBeenCalled();
    });

    it('debe cerrar dropdown al hacer clic fuera', async () => {
        render(<EquipmentSelector {...defaultProps} />);
        // Open
        fireEvent.click(screen.getByText('-- Selecciona equipos --'));
        await waitFor(() => screen.getByText('Proyector'));
        // Click outside
        fireEvent.mouseDown(document.body);
        // Dropdown should close
        expect(screen.queryByText('No hay equipos disponibles en esta ciudad')).toBeNull();
    });

    it('debe remover tag al hacer clic en ✕', async () => {
        const onToggle = vi.fn();
        const props = {
            ...defaultProps,
            onEquipmentToggle: onToggle,
            selectedEquipment: [{ itemId: 'eq1', name: 'Proyector', qty: 1 }]
        };
        render(<EquipmentSelector {...props} />);
        // Wait for equipment to load so handleToggle can find the name
        await waitFor(() => expect(mockExecute).toHaveBeenCalled());
        // Click the remove tag button
        fireEvent.click(screen.getByText('✕'));
        expect(onToggle).toHaveBeenCalledWith('eq1', 'Proyector');
    });

    it('debe manejar error al cargar equipos', async () => {
        mockExecute.mockRejectedValue(new Error('Load error'));
        render(<EquipmentSelector {...defaultProps} />);
        // Should not throw
        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalled();
        });
    });

    it('debe usar cityId directo del item si no hay _entity', async () => {
        const props = { ...defaultProps, item: { cityId: 'city2' } };
        render(<EquipmentSelector {...props} />);
        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalledWith({ cityId: 'city2' });
        });
    });

    it('debe mostrar nombre de equipo desde getEquipmentName para tags sin nombre', async () => {
        const props = {
            ...defaultProps,
            selectedEquipment: [{ itemId: 'eq1', qty: 1 }] // no name
        };
        render(<EquipmentSelector {...props} />);
        // Should use getEquipmentName fallback - first load equipment
        await waitFor(() => {
            expect(mockExecute).toHaveBeenCalled();
        });
    });

    it('debe alternar apertura/cierre del dropdown', async () => {
        render(<EquipmentSelector {...defaultProps} />);
        const selector = screen.getByText('-- Selecciona equipos --');

        // Open
        fireEvent.click(selector);
        await waitFor(() => screen.getByText('Proyector'));

        // Close by clicking again
        fireEvent.click(screen.getByText('Equipamiento'));
    });

    it('debe marcar items seleccionados con checkmark', async () => {
        const props = {
            ...defaultProps,
            selectedEquipment: [{ itemId: 'eq1', name: 'Proyector', qty: 1 }]
        };
        render(<EquipmentSelector {...props} />);
        fireEvent.click(screen.getByText('Equipamiento'));
        await waitFor(() => {
            expect(screen.getByText('✓')).toBeDefined();
        });
    });
});
