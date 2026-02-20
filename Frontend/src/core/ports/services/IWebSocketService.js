/**
 * IWebSocketService - Port (Interface)
 * Defines the contract for WebSocket real-time communication
 */
export class IWebSocketService {
    /**
     * Connect to the WebSocket server
     * @returns {void}
     */
    connect() {
        throw new Error('Method not implemented: connect');
    }

    /**
     * Disconnect from the WebSocket server
     * @returns {void}
     */
    disconnect() {
        throw new Error('Method not implemented: disconnect');
    }

    /**
     * Subscribe to a STOMP topic
     * @param {string} topic - Topic path (e.g. '/topic/events.bookings')
     * @param {function} callback - Callback to handle incoming messages
     * @returns {object} Subscription object with unsubscribe() method
     */
    subscribe(topic, callback) {
        throw new Error('Method not implemented: subscribe');
    }

    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnected() {
        throw new Error('Method not implemented: isConnected');
    }
}
