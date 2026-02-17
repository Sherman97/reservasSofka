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
            // Format dates for API
            const [year, month, day] = reservationData.date.split('-').map(Number);
            const [startHours, startMinutes] = reservationData.startTime.split(':').map(Number);
            const [endHours, endMinutes] = reservationData.endTime.split(':').map(Number);

            const startAt = new Date(year, month - 1, day, startHours, startMinutes).toISOString();
            const endAt = new Date(year, month - 1, day, endHours, endMinutes).toISOString();

            const payload = {
                spaceId: reservationData.locationId,
                startAt,
                endAt,
                title: reservationData.title || `Reserva de ${reservationData.locationName || 'espacio'}`,
                attendeesCount: reservationData.attendeesCount || 1,
                notes: reservationData.notes || '',
                items: (reservationData.equipment || []).map(id => ({
                    itemId: typeof id === 'object' ? (id.itemId || id.id) : id,
                    qty: 1
                }))
            };

            const response = await this.httpClient.post('/bookings/createBooking', payload);

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
            const response = await this.httpClient.get('/bookings/listBookings', {
                params: { userId }
            });

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error fetching reservations');
            }

            return ReservationMapper.toDomainList(response.data.data || []);
        } catch (error) {
            console.error('Error in HttpReservationRepository.getByUserId:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const response = await this.httpClient.get(`/bookings/${id}`);

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
            const response = await this.httpClient.put(`/bookings/${id}/cancel`);

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
            // This is a mock implementation for now
            // In real scenario, you'd call an API endpoint
            return {
                locationId,
                date,
                busySlots: [],
                availableSlots: []
            };
        } catch (error) {
            console.error('Error in HttpReservationRepository.getAvailability:', error);
            throw error;
        }
    }
}
