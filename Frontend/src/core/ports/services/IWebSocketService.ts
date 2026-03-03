export interface Subscription {
    unsubscribe(): void;
}

/**
 * IWebSocketService - Port (Interface)
 * Defines the contract for WebSocket communication
 */
export interface IWebSocketService {
    connect(): void;
    disconnect(): void;
    subscribe(topic: string, callback: (payload: unknown) => void): Subscription;
    isConnected(): boolean;
}
