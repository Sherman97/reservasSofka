import type { Delivery } from '../../domain/entities/Delivery';

/**
 * IDeliveryRepository - Port (Interface)
 * Defines the contract for delivery/handover data access
 */
export interface IDeliveryRepository {
    submit(deliveryData: Record<string, unknown>): Promise<Delivery>;
}
