import { Client } from '@stomp/stompjs';
import { IWebSocketService } from '../../core/ports/services/IWebSocketService';

/**
 * StompWebSocketService - Infrastructure implementation
 * Connects to the backend notifications-service via STOMP over WebSocket
 * through the API Gateway.
 * 
 * Backend flow: bookings-service → RabbitMQ → notifications-service → STOMP WebSocket
 * Frontend connects to: ws://<gateway>/notifications/ws
 */
export class StompWebSocketService extends IWebSocketService {
    constructor(gatewayUrl) {
        super();
        this._client = null;
        this._connected = false;
        this._subscriptions = new Map();
        this._pendingSubscriptions = [];
        this._reconnectAttempts = 0;
        this._maxReconnectAttempts = 10;

        // Build WebSocket URL from gateway base URL
        // Gateway: http://localhost:3000 → ws://localhost:3000/notifications/ws
        const wsProtocol = gatewayUrl.startsWith('https') ? 'wss' : 'ws';
        const host = gatewayUrl.replace(/^https?:\/\//, '');
        this._wsUrl = `${wsProtocol}://${host}/notifications/ws`;
    }

    connect() {
        if (this._client?.active) {
            return;
        }

        this._client = new Client({
            brokerURL: this._wsUrl,
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            onConnect: () => {
                console.log('[WebSocket] Connected to', this._wsUrl);
                this._connected = true;
                this._reconnectAttempts = 0;

                // Process any pending subscriptions that were queued before connection
                this._pendingSubscriptions.forEach(({ topic, callback, resolve }) => {
                    const sub = this._doSubscribe(topic, callback);
                    resolve(sub);
                });
                this._pendingSubscriptions = [];
            },

            onDisconnect: () => {
                console.log('[WebSocket] Disconnected');
                this._connected = false;
            },

            onStompError: (frame) => {
                console.error('[WebSocket] STOMP error:', frame.headers['message']);
                this._connected = false;
            },

            onWebSocketError: (_event) => {
                console.warn('[WebSocket] Connection error — backend may not be running');
                this._connected = false;
            },

            onWebSocketClose: () => {
                this._connected = false;
                this._reconnectAttempts++;
                if (this._reconnectAttempts >= this._maxReconnectAttempts) {
                    console.warn('[WebSocket] Max reconnect attempts reached, stopping');
                    this._client?.deactivate();
                }
            }
        });

        try {
            this._client.activate();
        } catch (err) {
            console.warn('[WebSocket] Failed to activate client:', err.message);
        }
    }

    disconnect() {
        if (this._client) {
            // Unsubscribe all
            this._subscriptions.forEach((sub) => {
                try { sub.unsubscribe(); } catch (_error) { /* ignore */ }
            });
            this._subscriptions.clear();
            this._pendingSubscriptions = [];

            try {
                this._client.deactivate();
            } catch (_error) { /* ignore */ }

            this._client = null;
            this._connected = false;
        }
    }

    subscribe(topic, callback) {
        if (this._connected && this._client?.active) {
            return this._doSubscribe(topic, callback);
        }

        // Queue the subscription for when connection is established
        let resolveRef;
        const promise = new Promise((resolve) => { resolveRef = resolve; });
        this._pendingSubscriptions.push({ topic, callback, resolve: resolveRef });

        // Ensure we're connecting
        if (!this._client?.active) {
            this.connect();
        }

        // Return an object that can unsubscribe even if not yet subscribed
        return {
            unsubscribe: () => {
                // Remove from pending if still queued
                this._pendingSubscriptions = this._pendingSubscriptions.filter(p => p.topic !== topic);
                // Or unsubscribe if already active
                promise.then(sub => {
                    if (sub) {
                        try { sub.unsubscribe(); } catch (_error) { /* ignore */ }
                    }
                });
                this._subscriptions.delete(topic);
            }
        };
    }

    isConnected() {
        return this._connected;
    }

    /**
     * Internal: perform actual STOMP subscription
     * @private
     */
    _doSubscribe(topic, callback) {
        if (this._subscriptions.has(topic)) {
            // Already subscribed to this topic, unsubscribe first
            try { this._subscriptions.get(topic).unsubscribe(); } catch (_error) { /* ignore */ }
        }

        const subscription = this._client.subscribe(topic, (message) => {
            try {
                const payload = JSON.parse(message.body);
                callback(payload);
            } catch (err) {
                console.error('[WebSocket] Error parsing message:', err);
            }
        });

        this._subscriptions.set(topic, subscription);
        return subscription;
    }
}
