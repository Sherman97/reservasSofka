import type { IReservationRepository, AvailabilityResult } from '../../../core/ports/repositories/IReservationRepository';

interface SpaceAvailabilityResult {
    busySlots: AvailabilityResult['busySlots'];
}

export class GetSpaceAvailabilityUseCase {
    constructor(private readonly reservationRepository: IReservationRepository) {}

    async execute(spaceId: string, date: string): Promise<SpaceAvailabilityResult> {
        if (!spaceId) {
            throw new Error('Space ID is required');
        }
        if (!date) {
            throw new Error('Date is required');
        }

        const result = await this.reservationRepository.getAvailability(spaceId, date);

        return {
            busySlots: result.busySlots || []
        };
    }
}
