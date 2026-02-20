import { IReservationRepository } from '../../core/ports/repositories/IReservationRepository';
import { ReservationMapper } from '../mappers/ReservationMapper';

/**
 * HttpReservationRepository - Repository Pattern implementation
 * Implements IReservationRepository using HTTP client
 */
export class HttpReservationRepository extends IReservationRepository {
    constructor(httpClient, storageService) {
        super();
        this.httpClient = httpClient;
        this.storageService = storageService;
    }

    async create(reservationData) {
        try {
            const payload = ReservationMapper.toApi(reservationData);
            const response = await this.httpClient.post('/bookings/reservations', payload);

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error creating reservation');
            }

            return ReservationMapper.toDomain(response.data.data);
        } catch (error) {
            console.error('Error in HttpReservationRepository.create:', error);
            throw error;
        }
    }

    async getByUserId(userId) {
        try {
            const response = await this.httpClient.get('/bookings/reservations', {
                params: { userId }
            });

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error fetching reservations');
            }

            console.log('User reservations response:', response.data);
            return ReservationMapper.toDomainList(response.data.data || []);
        } catch (error) {
            console.error('Error in HttpReservationRepository.getByUserId:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const response = await this.httpClient.get(`/bookings/reservations/${id}`);

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error fetching reservation');
            }

            return ReservationMapper.toDomain(response.data.data);
        } catch (error) {
            console.error('Error in HttpReservationRepository.getById:', error);
            throw error;
        }
    }

    async cancel(id) {
        try {
            const response = await this.httpClient.patch(`/bookings/reservations/${id}/cancel`);

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error cancelling reservation');
            }
        } catch (error) {
            console.error('Error in HttpReservationRepository.cancel:', error);
            throw error;
        }
    }

    async getAvailability(locationId, date) {
        try {
            // Fetch all reservations for this space to calculate availability
            const response = await this.httpClient.get('/bookings/reservations', {
                params: { spaceId: locationId }
            });

            if (!response.data.ok) {
                console.warn('Could not fetch reservations for availability check', response.data.message);
                return { locationId, date, busySlots: [], availableSlots: [] };
            }

            const reservations = response.data.data || [];
            const busySlots = [];

            // Format target date to compare (YYYY-MM-DD)
            const targetDate = date; // date is already YYYY-MM-DD string

            reservations.forEach(res => {
                // Ignore cancelled or rejected reservations
                if (res.status === 'CANCELLED' || res.status === 'REJECTED') return;

                // Parse reservation times
                const start = new Date(res.startAt);
                const end = new Date(res.endAt);

                // Compare dates (YYYY-MM-DD) in local time
                // start.toLocaleDateString() uses local timezone
                const resDate = start.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD

                if (resDate === targetDate) {
                    // Format HH:MM
                    const startStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    busySlots.push(`${startStr}-${endStr}`);
                }
            });

            return {
                locationId,
                date,
                busySlots,
                availableSlots: [] // Calculated by UI based on busy slots
            };
        } catch (error) {
            console.error('Error in HttpReservationRepository.getAvailability:', error);
            // Return empty to avoid UI crash
            return {
                locationId,
                date,
                busySlots: [],
                availableSlots: []
            };
        }
    }
}
