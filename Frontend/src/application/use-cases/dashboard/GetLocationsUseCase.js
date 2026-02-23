/**
 * GetLocationsUseCase - Application Use Case
 * Retrieves all locations with optional filtering
 */
export class GetLocationsUseCase {
    constructor(locationRepository) {
        this.locationRepository = locationRepository;
    }

    /**
     * Execute use case
     * @param {object} filters - Optional filters
     * @returns {Promise<Location[]>} List of locations
     */
    async execute(filters = {}) {
        // If filters provided, use search
        if (Object.keys(filters).length > 0) {
            return await this.locationRepository.search(filters);
        }

        // Otherwise get all
        return await this.locationRepository.getAll();
    }
}
