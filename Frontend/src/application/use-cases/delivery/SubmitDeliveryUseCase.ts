import type { IDeliveryRepository } from '../../../core/ports/repositories/IDeliveryRepository';
import type { Delivery } from '../../../core/domain/entities/Delivery';

interface SubmitDeliveryData {
    locationId: string;
    userId: string;
    managerId: string;
    notes: string;
    date: string;
}

export class SubmitDeliveryUseCase {
    constructor(private readonly deliveryRepository: IDeliveryRepository) {}

    async execute(data: SubmitDeliveryData): Promise<Delivery> {
        if (!data.locationId) {
            throw new Error('Location ID is required');
        }
        if (!data.userId) {
            throw new Error('User ID is required');
        }
        if (!data.managerId) {
            throw new Error('Manager ID is required');
        }
        return await this.deliveryRepository.submit(data);
    }
}
