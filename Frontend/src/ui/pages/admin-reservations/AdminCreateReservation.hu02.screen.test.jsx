import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminReservationsPage } from './AdminReservationsPage';

vi.mock('../../../features/reservations/services/adminReservationsService', () => ({
    getAdminReservations: vi.fn(),
    getAdminReservationDetail: vi.fn(),
    searchAdminUsers: vi.fn(),
    checkAdminReservationAvailability: vi.fn(),
    createAdminReservation: vi.fn(),
    getAdminCities: vi.fn(),
    getAdminSpacesByCity: vi.fn(),
    getAdminEquipmentByCity: vi.fn(),
}));

import * as adminReservationsService from '../../../features/reservations/services/adminReservationsService';

const emptyReservationsResponse = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
};

const openCreateReservation = async () => {
    fireEvent.click(await screen.findByRole('button', { name: /nueva reserva/i }));
};

describe('HU-02 | Pantalla | AdminCreateReservation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        adminReservationsService.getAdminReservations.mockResolvedValue(emptyReservationsResponse);
        adminReservationsService.getAdminCities.mockResolvedValue([
            { id: '1', name: 'Medellin' },
        ]);
        adminReservationsService.getAdminSpacesByCity.mockResolvedValue([
            { id: '101', name: 'Sala de Innovacion A1' },
        ]);
        adminReservationsService.getAdminEquipmentByCity.mockResolvedValue([]);
    });

    it('AdminCreateReservation.renderiza_formulario_con_campos_minimos_obligatorios_y_crear_reserva_deshabilitado_inicialmente', async () => {
        render(<AdminReservationsPage />);

        await openCreateReservation();

        expect(screen.getByRole('heading', { name: 'Nueva Reserva' })).toBeInTheDocument();
        expect(screen.getByLabelText(/usuario solicitante/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sede|locacion/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/espacio|sala/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /selecciona una fecha/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/inicio|hora inicio/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/fin|hora fin/i)).toBeInTheDocument();

        expect(screen.getByRole('button', { name: 'Crear Reserva' })).toBeDisabled();
    });

    it('AdminCreateReservation.muestra_validacion_visual_en_linea_cuando_faltan_datos_obligatorios', async () => {
        render(<AdminReservationsPage />);

        await openCreateReservation();
        fireEvent.click(screen.getByRole('button', { name: 'Crear Reserva' }));

        const requiredMessages = await screen.findAllByText(/obligatorio|requerido/i);
        expect(requiredMessages.length).toBeGreaterThanOrEqual(5);
        expect(screen.getByRole('button', { name: 'Crear Reserva' })).toBeDisabled();
    });
});
