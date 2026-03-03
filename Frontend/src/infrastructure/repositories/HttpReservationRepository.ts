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

/** Detect whether the API response uses { ok, data } wrapper or returns data directly */
function isWrappedResponse(raw: unknown): raw is ApiResponse {
    return typeof (raw as ApiResponse).ok === 'boolean';
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
            const raw = response.data as ApiResponse & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error creating reservation');
                const reservation = ReservationMapper.toDomain(raw.data as unknown as Parameters<typeof ReservationMapper.toDomain>[0]);
                if (!reservation) throw new Error('Error mapping reservation data');
                return reservation;
            }

            // Direct object response
            const reservation = ReservationMapper.toDomain(raw as unknown as Parameters<typeof ReservationMapper.toDomain>[0]);
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
            const raw = response.data as ApiResponse<unknown[]> & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error fetching reservations');
                console.log('User reservations response:', raw);
                return ReservationMapper.toDomainList((raw.data || []) as Parameters<typeof ReservationMapper.toDomainList>[0]);
            }

            // Direct array response
            console.log('User reservations response (direct):', raw);
            const items = Array.isArray(raw) ? raw : [];
            return ReservationMapper.toDomainList(items as Parameters<typeof ReservationMapper.toDomainList>[0]);
        } catch (error) {
            console.error('Error in HttpReservationRepository.getByUserId:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<Reservation> {
        try {
            const response = await this.httpClient.get(`/bookings/reservations/${id}`);
            const raw = response.data as ApiResponse & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error fetching reservation');
                const reservation = ReservationMapper.toDomain(raw.data as Parameters<typeof ReservationMapper.toDomain>[0]);
                if (!reservation) throw new Error('Error mapping reservation data');
                return reservation;
            }

            // Direct object response
            const reservation = ReservationMapper.toDomain(raw as Parameters<typeof ReservationMapper.toDomain>[0]);
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
            const raw = response.data as ApiResponse & Record<string, unknown>;

            if (isWrappedResponse(raw) && !raw.ok) {
                throw new Error(raw.message || 'Error cancelling reservation');
            }
            // For unwrapped responses, if no error was thrown by HTTP client, consider it successful
        } catch (error) {
            console.error('Error in HttpReservationRepository.cancel:', error);
            throw error;
        }
    }

    async deliver(id: string, novelty?: string): Promise<Reservation> {
        try {
            const body = novelty ? { novelty } : undefined;
            const response = await this.httpClient.patch(`/bookings/reservations/${id}/deliver`, body);
            const raw = response.data as ApiResponse & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error al registrar la entrega');
                const reservation = ReservationMapper.toDomain(raw.data as unknown as Parameters<typeof ReservationMapper.toDomain>[0]);
                if (!reservation) throw new Error('Error mapping reservation data');
                return reservation;
            }

            const reservation = ReservationMapper.toDomain(raw as unknown as Parameters<typeof ReservationMapper.toDomain>[0]);
            if (!reservation) throw new Error('Error mapping reservation data');
            return reservation;
        } catch (error) {
            console.error('Error in HttpReservationRepository.deliver:', error);
            throw error;
        }
    }

    async returnReservation(id: string, novelty?: string): Promise<Reservation> {
        try {
            const body = novelty ? { novelty } : undefined;
            const response = await this.httpClient.patch(`/bookings/reservations/${id}/return`, body);
            const raw = response.data as ApiResponse & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error al registrar la devolución');
                const reservation = ReservationMapper.toDomain(raw.data as unknown as Parameters<typeof ReservationMapper.toDomain>[0]);
                if (!reservation) throw new Error('Error mapping reservation data');
                return reservation;
            }

            const reservation = ReservationMapper.toDomain(raw as unknown as Parameters<typeof ReservationMapper.toDomain>[0]);
            if (!reservation) throw new Error('Error mapping reservation data');
            return reservation;
        } catch (error) {
            console.error('Error in HttpReservationRepository.returnReservation:', error);
            throw error;
        }
    }

    async getAvailability(locationId: string, date: string): Promise<AvailabilityResult> {
        try {
            const response = await this.httpClient.get('/bookings/reservations', {
                params: { spaceId: locationId }
            });
            const raw = response.data as ApiResponse<Array<{ status?: string; startAt?: string; endAt?: string }>> & Record<string, unknown>;

            let reservations: Array<{ status?: string; startAt?: string; endAt?: string }>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) {
                    console.warn('Could not fetch reservations for availability check', raw.message);
                    return { locationId, date, busySlots: [] };
                }
                reservations = raw.data || [];
            } else {
                // Direct array response
                reservations = Array.isArray(raw) ? raw : [];
            }

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
