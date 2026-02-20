/**
 * InventoryItem - Domain Entity
 * Represents a piece of equipment/inventory in the system
 */
export class InventoryItem {
    constructor({ id, name, description, imageUrl, quantity, category, available = true }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.quantity = quantity;
        this.category = category;
        this.available = available;
    }

    /**
     * Check if item is available
     * @returns {boolean}
     */
    isAvailable() {
        return this.available && this.quantity > 0;
    }

    /**
     * Check if item has sufficient quantity
     * @param {number} requestedQuantity
     * @returns {boolean}
     */
    hasSufficientQuantity(requestedQuantity) {
        return this.quantity >= requestedQuantity;
    }

    /**
     * Get available quantity
     * @returns {number}
     */
    getAvailableQuantity() {
        return this.available ? this.quantity : 0;
    }

    /**
     * Get display info for UI
     * @returns {object}
     */
    getDisplayInfo() {
        return {
            id: this.id,
            title: this.name,
            subtitle: `Disponibles: ${this.getAvailableQuantity()}`,
            image: this.imageUrl,
            type: 'inventory'
        };
    }

    /**
     * Convert to JSON
     * @returns {object}
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            imageUrl: this.imageUrl,
            quantity: this.quantity,
            category: this.category,
            available: this.available
        };
    }

    /**
     * Create from JSON
     * @param {object} json
     * @returns {InventoryItem}
     */
    static fromJSON(json) {
        return new InventoryItem(json);
    }
}
