export interface InventoryItemProps {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    quantity: number;
    category: string;
    available?: boolean;
}

export interface InventoryDisplayInfo {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    type: string;
}

export class InventoryItem {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly imageUrl: string;
    public readonly quantity: number;
    public readonly category: string;
    public readonly available: boolean;

    constructor({ id, name, description, imageUrl, quantity, category, available = true }: InventoryItemProps) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.quantity = quantity;
        this.category = category;
        this.available = available;
    }

    isAvailable(): boolean {
        return this.available && this.quantity > 0;
    }

    hasSufficientQuantity(requestedQuantity: number): boolean {
        return this.quantity >= requestedQuantity;
    }

    getAvailableQuantity(): number {
        return this.available ? this.quantity : 0;
    }

    getDisplayInfo(): InventoryDisplayInfo {
        return {
            id: this.id,
            title: this.name,
            subtitle: `Disponibles: ${this.getAvailableQuantity()}`,
            image: this.imageUrl,
            type: 'inventory'
        };
    }

    toJSON(): InventoryItemProps {
        return {
            id: this.id, name: this.name, description: this.description,
            imageUrl: this.imageUrl, quantity: this.quantity,
            category: this.category, available: this.available
        };
    }

    static fromJSON(json: InventoryItemProps): InventoryItem {
        return new InventoryItem(json);
    }
}
