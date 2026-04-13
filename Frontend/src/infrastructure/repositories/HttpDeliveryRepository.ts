import type { IDeliveryRepository } from '../../core/ports/repositories/IDeliveryRepository';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';
import type { Delivery } from '../../core/domain/entities/Delivery';
import { DeliveryMapper } from '../mappers/DeliveryMapper';

interface ApiResponse<T = unknown> {
    ok: boolean;
    message?: string;
    data?: T;
}

export class HttpDeliveryRepository implements IDeliveryRepository {
    constructor(private readonly httpClient: IHttpClient) {}

    async submit(deliveryData: Record<string, unknown>): Promise<Delivery> {
        try {
            const payload = DeliveryMapper.toApi(deliveryData as Parameters<typeof DeliveryMapper.toApi>[0]);
            const response = await this.httpClient.post('/bookings/deliveries', payload);
            const raw = response.data as ApiResponse & Record<string, unknown>;

            // Support both { ok, data } wrapper and direct object responses
            const isWrapped = typeof raw.ok === 'boolean';

            if (isWrapped && !raw.ok) {
                throw new Error(raw.message || 'Error submitting delivery');
            }

            const deliveryDTO = isWrapped ? raw.data : raw;
            const delivery = DeliveryMapper.toDomain(deliveryDTO as Parameters<typeof DeliveryMapper.toDomain>[0]);
            if (!delivery) throw new Error('Error mapping delivery data');
            return delivery;
        } catch (error) {
            console.error('Error in HttpDeliveryRepository.submit:', error);
            throw error;
        }
    }
}
