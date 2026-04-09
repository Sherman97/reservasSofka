import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminReservationsPage } from '../../ui/pages/admin-reservations/AdminReservationsPage';

vi.mock('../../features/reservations/services/adminReservationsService', () => ({
    getAdminReservations: vi.fn(),
    getAdminReservationDetail: vi.fn(),
    searchAdminUsers: vi.fn(),
    checkAdminReservationAvailability: vi.fn(),
    createAdminReservation: vi.fn(),
    getAdminCities: vi.fn(),
    getAdminSpacesByCity: vi.fn(),
    getAdminEquipmentByCity: vi.fn(),
}));

import * as adminReservationsService from '../../features/reservations/services/adminReservationsService';

const emptyReservationsResponse = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
};

const openCreateReservation = async () => {
    fireEvent.click(await screen.findByRole('button', { name: /nueva reserva/i }));
};

const fillCreateReservationForm = async ({
    userSearch,
    userOption,
    site,
    space,
    dayOfMonth,
    startTime,
    endTime,
}) => {
    fireEvent.change(screen.getByLabelText(/usuario solicitante/i), { target: { value: userSearch } });
    fireEvent.click(await screen.findByText(userOption));
    fireEvent.change(screen.getByLabelText(/sede|locacion/i), { target: { value: site } });
    fireEvent.change(screen.getByLabelText(/espacio|sala/i), { target: { value: space } });
    fireEvent.click(screen.getByText(String(dayOfMonth)));
    fireEvent.change(screen.getByLabelText(/inicio|hora inicio/i), { target: { value: startTime } });
    fireEvent.change(screen.getByLabelText(/fin|hora fin/i), { target: { value: endTime } });
};

describe('HU-02 | Flujo | Crear reserva manual admin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        adminReservationsService.getAdminReservations.mockResolvedValue(emptyReservationsResponse);
        adminReservationsService.getAdminCities.mockResolvedValue([
            { id: '1', name: 'Medellin' },
        ]);
        adminReservationsService.getAdminSpacesByCity.mockResolvedValue([
            { id: '101', name: 'Sala de Innovacion A1' },
        ]);
        adminReservationsService.getAdminEquipmentByCity.mockResolvedValue([
            { id: '501', name: 'Video Beam', available: true },
        ]);
    });

    it('bloquea_creacion_con_conflicto_de_horario_y_muestra_mensaje_exacto', async () => {
        adminReservationsService.searchAdminUsers.mockResolvedValue([
            { id: 'u-002', fullName: 'Ana Rojas', email: 'ana.rojas@sofka.com' },
        ]);
        adminReservationsService.checkAdminReservationAvailability.mockResolvedValue({
            hasConflict: true,
        });

        render(<AdminReservationsPage />);

        await openCreateReservation();
        await fillCreateReservationForm({
            userSearch: 'Ana',
            userOption: /Ana Rojas/i,
            site: '1',
            space: '101',
            dayOfMonth: 22,
            startTime: '10:00',
            endTime: '11:00',
        });

        fireEvent.click(screen.getByRole('button', { name: 'Crear Reserva' }));

        const conflictMessages = await screen.findAllByText(
            'El espacio seleccionado ya se encuentra reservado en este horario',
        );
        expect(conflictMessages.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByRole('button', { name: 'Crear Reserva' })).toBeDisabled();
        expect(adminReservationsService.createAdminReservation).not.toHaveBeenCalled();
    });

    it('crea_reserva_sin_conflicto_y_muestra_feedback_visible_de_exito', async () => {
        adminReservationsService.searchAdminUsers.mockResolvedValue([
            { id: 'u-003', fullName: 'Carlos Mesa', email: 'carlos.mesa@sofka.com' },
        ]);
        adminReservationsService.checkAdminReservationAvailability.mockResolvedValue({
            hasConflict: false,
        });
        adminReservationsService.createAdminReservation.mockResolvedValue({
            id: 'RSV-900',
            status: 'Confirmada',
        });

        render(<AdminReservationsPage />);

        await openCreateReservation();
        await fillCreateReservationForm({
            userSearch: 'Carlos',
            userOption: /Carlos Mesa/i,
            site: '1',
            space: '101',
            dayOfMonth: 23,
            startTime: '13:00',
            endTime: '14:00',
        });

        expect(screen.getByRole('button', { name: 'Crear Reserva' })).toBeEnabled();
        fireEvent.click(screen.getByRole('button', { name: 'Crear Reserva' }));

        await waitFor(() => {
            expect(adminReservationsService.createAdminReservation).toHaveBeenCalled();
        });
        expect(await screen.findByRole('status')).toHaveTextContent('Reserva creada exitosamente');
        expect(screen.queryByRole('heading', { name: 'Nueva Reserva' })).not.toBeInTheDocument();
    });
});
