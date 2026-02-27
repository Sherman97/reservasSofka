import { Client, IMessage } from '@stomp/stompjs';
import type { IWebSocketService, Subscription } from '../../core/ports/services/IWebSocketService';

interface PendingSubscription {
    topic: string;
    callback: (payload: unknown) => void;
    resolve: (sub: Subscription) => void;
}

/**
 * StompWebSocketService - Adapter Pattern implementation
 * Implements IWebSocketService using STOMP over WebSocket
 */
export class StompWebSocketService implements IWebSocketService {
    private _client: Client | null = null;
    private _connected: boolean = false;
    private _subscriptions: Map<string, { unsubscribe: () => void }> = new Map();
    private _pendingSubscriptions: PendingSubscription[] = [];
    private _reconnectAttempts: number = 0;
    private _maxReconnectAttempts: number = 10;
    private _wsUrl: string;

    constructor(gatewayUrl: string) {
        const wsProtocol = gatewayUrl.startsWith('https') ? 'wss' : 'ws';
        const host = gatewayUrl.replace(/^https?:\/\//, '');
        this._wsUrl = `${wsProtocol}://${host}/notifications/ws`;
    }

    connect(): void {
        if (this._client?.active) return;

        this._client = new Client({
            brokerURL: this._wsUrl,
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            onConnect: () => {
                console.log('[WebSocket] Connected to', this._wsUrl);
                this._connected = true;
                this._reconnectAttempts = 0;
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

            onWebSocketError: () => {
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
            console.warn('[WebSocket] Failed to activate client:', (err as Error).message);
        }
    }

    disconnect(): void {
        if (this._client) {
            this._subscriptions.forEach((sub) => {
                try { sub.unsubscribe(); } catch (_) { /* ignore */ }
            });
            this._subscriptions.clear();
            this._pendingSubscriptions = [];
            try { this._client.deactivate(); } catch (_) { /* ignore */ }
            this._client = null;
            this._connected = false;
        }
    }

    subscribe(topic: string, callback: (payload: unknown) => void): Subscription {
        if (this._connected && this._client?.active) {
            return this._doSubscribe(topic, callback);
        }

        let resolveRef!: (sub: Subscription) => void;
        const promise = new Promise<Subscription>((resolve) => { resolveRef = resolve; });
        this._pendingSubscriptions.push({ topic, callback, resolve: resolveRef });

        if (!this._client?.active) this.connect();

        return {
            unsubscribe: () => {
                this._pendingSubscriptions = this._pendingSubscriptions.filter(p => p.topic !== topic);
                promise.then(sub => {
                    if (sub) { try { sub.unsubscribe(); } catch (_) { /* ignore */ } }
                });
                this._subscriptions.delete(topic);
            }
        };
    }

    isConnected(): boolean {
        return this._connected;
    }

    private _doSubscribe(topic: string, callback: (payload: unknown) => void): Subscription {
        if (this._subscriptions.has(topic)) {
            try { this._subscriptions.get(topic)!.unsubscribe(); } catch (_) { /* ignore */ }
        }
        const subscription = this._client!.subscribe(topic, (message: IMessage) => {
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
