import type { IReservationRepository, AvailabilityResult } from '../../core/ports/repositories/IReservationRepository';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';
import type { IStorageService } from '../../core/ports/services/IStorageService';
import type { Reservation } from '../../core/domain/entities/Reservation';
import { ReservationMapper } from '../mappers/ReservationMapper';

interface ApiResponse<T = unknown> {
    ok: boolean;
    message?: string;
    data?: T;
}

export class HttpReservationRepository implements IReservationRepository {
    constructor(
        private readonly httpClient: IHttpClient,
        private readonly storageService: IStorageService
    ) {}

    async create(reservationData: Record<string, unknown>): Promise<Reservation> {
        try {
            const payload = ReservationMapper.toApi(reservationData as unknown as Parameters<typeof ReservationMapper.toApi>[0]);
            const response = await this.httpClient.post('/bookings/reservations', payload);
            const data = response.data as ApiResponse;

            if (!data.ok) throw new Error(data.message || 'Error creating reservation');

            const reservation = ReservationMapper.toDomain(data.data as unknown as Parameters<typeof ReservationMapper.toDomain>[0]);
            if (!reservation) throw new Error('Error mapping reservation data');
            return reservation;
        } catch (error) {
            console.error('Error in HttpReservationRepository.create:', error);
            throw error;
        }
    }

    async getByUserId(userId: string): Promise<Reservation[]> {
        try {
            const response = await this.httpClient.get('/bookings/reservations', {
                params: { userId }
            });
            const data = response.data as ApiResponse<unknown[]>;

            if (!data.ok) throw new Error(data.message || 'Error fetching reservations');

            console.log('User reservations response:', data);
            return ReservationMapper.toDomainList((data.data || []) as Parameters<typeof ReservationMapper.toDomainList>[0]);
        } catch (error) {
            console.error('Error in HttpReservationRepository.getByUserId:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<Reservation> {
        try {
            const response = await this.httpClient.get(`/bookings/reservations/${id}`);
            const data = response.data as ApiResponse;

            if (!data.ok) throw new Error(data.message || 'Error fetching reservation');

            const reservation = ReservationMapper.toDomain(data.data as Parameters<typeof ReservationMapper.toDomain>[0]);
            if (!reservation) throw new Error('Error mapping reservation data');
            return reservation;
        } catch (error) {
            console.error('Error in HttpReservationRepository.getById:', error);
            throw error;
        }
    }

    async cancel(id: string): Promise<void> {
        try {
            const response = await this.httpClient.patch(`/bookings/reservations/${id}/cancel`);
            const data = response.data as ApiResponse;

            if (!data.ok) throw new Error(data.message || 'Error cancelling reservation');
        } catch (error) {
            console.error('Error in HttpReservationRepository.cancel:', error);
            throw error;
        }
    }

    async getAvailability(locationId: string, date: string): Promise<AvailabilityResult> {
        try {
            const response = await this.httpClient.get('/bookings/reservations', {
                params: { spaceId: locationId }
            });
            const data = response.data as ApiResponse<Array<{ status?: string; startAt?: string; endAt?: string }>>;

            if (!data.ok) {
                console.warn('Could not fetch reservations for availability check', data.message);
                return { locationId, date, busySlots: [] };
            }

            const reservations = data.data || [];
            const busySlots: Array<{ start: string; end: string }> = [];
            const targetDate = date;

            reservations.forEach(res => {
                const status = (res.status || '').toLowerCase();
                if (status === 'cancelled' || status === 'rejected' || status === 'completed') return;

                const start = new Date(res.startAt || '');
                const end = new Date(res.endAt || '');
                const resDate = start.toLocaleDateString('en-CA');

                if (resDate === targetDate) {
                    const startStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    busySlots.push({ start: startStr, end: endStr });
                }
            });

            busySlots.sort((a, b) => a.start.localeCompare(b.start));
            return { locationId, date, busySlots };
        } catch (error) {
            console.error('Error in HttpReservationRepository.getAvailability:', error);
            return { locationId, date, busySlots: [] };
        }
    }
}
