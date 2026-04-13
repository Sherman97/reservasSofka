import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { AdminReservationsPage } from './AdminReservationsPage';
import {
    getAdminReservations,
    getAdminReservationDetail,
    getAdminCities,
    searchAdminUsers,
} from '../../../features/reservations/services/adminReservationsService';

vi.mock('../../../features/reservations/services/adminReservationsService', () => ({
    getAdminReservations: vi.fn(),
    getAdminReservationDetail: vi.fn(),
    searchAdminUsers: vi.fn(),
    getAdminCities: vi.fn(),
    getAdminSpacesByCity: vi.fn(),
    getAdminEquipmentByCity: vi.fn(),
}));

const emptyReservationsResponse = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
};

const oneReservationResponse = {
    items: [
        {
            id: 'RSV-101',
            userName: 'Andres Rodriguez',
            site: 'Sede Medellin',
            space: 'Piso 4',
            executionDate: '2026-05-21',
            startTime: '08:00',
            endTime: '12:00',
            status: 'Confirmada',
        },
    ],
    total: 25,
    page: 1,
    pageSize: 20,
    totalPages: 2,
};

const reservationDetailResponse = {
    id: 'RSV-101',
    userName: 'Andres Rodriguez',
    userEmail: 'andres@sofka.com',
    siteId: '10',
    site: 'Sede Medellin',
    spaceId: '44',
    reservedSpace: 'Piso 4',
    space: 'Piso 4',
    executionDate: '2026-05-21',
    startTime: '08:00',
    endTime: '12:00',
    status: 'Confirmada',
    attendeesCount: 3,
    equipment: [{ itemId: '200', name: 'TV', qty: 1 }],
    equipmentOptions: [{ id: '200', name: 'TV', available: true }],
};

const renderPage = () => render(<AdminReservationsPage />);

describe('AdminReservationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getAdminCities.mockResolvedValue([
            { id: '10', name: 'Sede Medellin' },
            { id: '20', name: 'Sede Bogota' },
        ]);
        searchAdminUsers.mockResolvedValue([
            { id: '33', fullName: 'Laura Calle', email: 'laura@demo.com' },
            { id: '34', fullName: 'Andres Rojas', email: 'andres@demo.com' },
        ]);
    });

    it('AdminReservationsPage.carga_inicial_consulta_con_orden_desc_y_20_por_pagina', async () => {
        getAdminReservations.mockResolvedValue(emptyReservationsResponse);

        renderPage();

        await waitFor(() => {
            expect(getAdminReservations).toHaveBeenCalledWith({
                page: 1,
                pageSize: 20,
                sortBy: 'executionDate',
                sortDirection: 'desc',
                filters: {
                    from: '',
                    to: '',
                    status: '',
                    site: '',
                    user: '',
                },
            });
        });
    });

    it('AdminReservationsPage.aplicar_filtros_dispara_consulta_con_parametros_de_filtro', async () => {
        getAdminReservations.mockResolvedValue(emptyReservationsResponse);

        renderPage();
        await screen.findByRole('option', { name: 'Sede Medellin' });
        await screen.findByRole('option', { name: 'Laura Calle (laura@demo.com)' });

        fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-05-01' } });
        fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-05-31' } });
        fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'Confirmada' } });
        fireEvent.change(screen.getByLabelText('Sede'), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: '33' } });
        fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

        await waitFor(() => {
            expect(getAdminReservations).toHaveBeenLastCalledWith({
                page: 1,
                pageSize: 20,
                sortBy: 'executionDate',
                sortDirection: 'desc',
                filters: {
                    from: '2026-05-01',
                    to: '2026-05-31',
                    status: 'Confirmada',
                    site: '10',
                    user: '33',
                },
            });
        });
    });

    it('AdminReservationsPage.empty_state_muestra_mensaje_exacto_y_conserva_filtros', async () => {
        getAdminReservations.mockResolvedValue(emptyReservationsResponse);

        renderPage();
        await screen.findByRole('option', { name: 'Laura Calle (laura@demo.com)' });

        fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'Cancelada' } });
        fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: '33' } });
        fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

        expect(await screen.findByText('No se encontraron reservas con los filtros aplicados')).toBeInTheDocument();
        expect(screen.getByLabelText('Estado')).toHaveValue('Cancelada');
        expect(screen.getByLabelText('Usuario')).toHaveValue('33');
    });

    it('AdminReservationsPage.ver_detalle_desde_fila_muestra_campos_minimos_y_datos_consistentes', async () => {
        getAdminReservations.mockResolvedValue(oneReservationResponse);
        getAdminReservationDetail.mockResolvedValue(reservationDetailResponse);

        renderPage();

        fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle RSV-101' }));

        const detailSection = await screen.findByRole('region', { name: 'Detalle de reserva' });
        const detail = within(detailSection);

        expect(detail.getByText('Detalle de reserva')).toBeInTheDocument();
        expect(detail.getByText(/Reserva RSV-101 - Confirmada - andres@sofka\.com/)).toBeInTheDocument();
        expect(detail.getByDisplayValue('Andres Rodriguez')).toBeInTheDocument();
        expect(detail.getByDisplayValue('Sede Medellin')).toBeInTheDocument();
        expect(detail.getByDisplayValue('Piso 4')).toBeInTheDocument();
        expect(detail.getByDisplayValue('08:00')).toBeInTheDocument();
        expect(detail.getByDisplayValue('12:00')).toBeInTheDocument();
        expect(detail.getByDisplayValue('3')).toBeInTheDocument();
        expect(detail.getByText('TV')).toBeInTheDocument();
    });

    it('AdminReservationsPage.paginacion_mantiene_filtros_y_consulta_siguiente_pagina', async () => {
        getAdminReservations.mockResolvedValue(oneReservationResponse);

        renderPage();

        await screen.findByText('Mostrando 1-20 de 25 reservas');
        fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

        await waitFor(() => {
            expect(getAdminReservations).toHaveBeenLastCalledWith({
                page: 2,
                pageSize: 20,
                sortBy: 'executionDate',
                sortDirection: 'desc',
                filters: {
                    from: '',
                    to: '',
                    status: '',
                    site: '',
                    user: '',
                },
            });
        });
    });
});
