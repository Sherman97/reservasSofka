import type { ILocationRepository, LocationSearchCriteria } from '../../../core/ports/repositories/ILocationRepository';
import type { Location } from '../../../core/domain/entities/Location';

export class GetLocationsUseCase {
    constructor(private readonly locationRepository: ILocationRepository) {}

    async execute(filters: LocationSearchCriteria = {}): Promise<Location[]> {
        if (Object.keys(filters).length > 0) {
            return await this.locationRepository.search(filters);
        }
        return await this.locationRepository.getAll();
    }
}
