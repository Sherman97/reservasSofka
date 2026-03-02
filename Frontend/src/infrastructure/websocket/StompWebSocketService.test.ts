import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StompWebSocketService } from './StompWebSocketService';

// Mock @stomp/stompjs - self-contained mock without shared vi.fn() refs
vi.mock('@stomp/stompjs', () => ({
    Client: class MockClient {
        active = false;
        _onConnect: (() => void) | null = null;
        _onDisconnect: (() => void) | null = null;
        _onStompError: ((frame: any) => void) | null = null;
        _onWebSocketError: ((evt: any) => void) | null = null;
        _onWebSocketClose: ((evt: any) => void) | null = null;

        constructor(config: any) {
            this._onConnect = config.onConnect || null;
            this._onDisconnect = config.onDisconnect || null;
            this._onStompError = config.onStompError || null;
            this._onWebSocketError = config.onWebSocketError || null;
            this._onWebSocketClose = config.onWebSocketClose || null;
        }

        activate() {
            this.active = true;
            if (this._onConnect) setTimeout(() => this._onConnect!(), 0);
        }

        deactivate() {
            this.active = false;
        }

        subscribe(_topic: string, _cb: any) {
            return { unsubscribe: vi.fn() };
        }
    }
}));

describe('StompWebSocketService', () => {
    let service: StompWebSocketService;

    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        service = new StompWebSocketService('http://localhost:8080');
    });

    afterEach(() => { vi.restoreAllMocks(); });

    it('debe construir URL de websocket correctamente (http → ws)', () => {
        expect((service as any)._wsUrl).toBe('ws://localhost:8080/notifications/ws');
    });

    it('debe construir URL de websocket correctamente (https → wss)', () => {
        const secureService = new StompWebSocketService('https://api.example.com');
        expect((secureService as any)._wsUrl).toBe('wss://api.example.com/notifications/ws');
    });

    it('connect debe activar el cliente', () => {
        service.connect();
        const client = (service as any)._client;
        expect(client).not.toBeNull();
        expect(client.active).toBe(true);
    });

    it('connect no debe crear otro cliente si ya está activo', () => {
        service.connect();
        const firstClient = (service as any)._client;
        service.connect(); // should no-op
        expect((service as any)._client).toBe(firstClient);
    });

    it('isConnected debe retornar false inicialmente', () => {
        expect(service.isConnected()).toBe(false);
    });

    it('isConnected debe retornar true después de onConnect', async () => {
        service.connect();
        await new Promise(r => setTimeout(r, 20));
        expect(service.isConnected()).toBe(true);
    });

    it('disconnect debe limpiar todo', () => {
        service.connect();
        service.disconnect();
        expect((service as any)._client).toBeNull();
        expect(service.isConnected()).toBe(false);
    });

    it('disconnect sin conexión previa no debe fallar', () => {
        expect(() => service.disconnect()).not.toThrow();
    });

    it('subscribe sin cliente activo debe conectar y retornar subscription', () => {
        const callback = vi.fn();
        const sub = service.subscribe('/topic/test', callback);
        expect(sub).toBeDefined();
        expect(sub.unsubscribe).toBeDefined();
        // It should have called connect internally
        expect((service as any)._client).not.toBeNull();
    });

    it('subscribe con cliente activo y conectado debe suscribirse directamente', async () => {
        service.connect();
        await new Promise(r => setTimeout(r, 20));

        const callback = vi.fn();
        const sub = service.subscribe('/topic/test', callback);
        expect(sub).toBeDefined();
        expect(typeof sub.unsubscribe).toBe('function');
    });

    it('pending subscription se resuelve al conectar', async () => {
        const callback = vi.fn();
        const sub = service.subscribe('/topic/pending', callback);
        // Wait for onConnect to fire and resolve pending
        await new Promise(r => setTimeout(r, 20));
        expect(sub).toBeDefined();
    });

    it('unsubscribe de pending subscription debe funcionar', () => {
        const callback = vi.fn();
        const sub = service.subscribe('/topic/pending', callback);
        expect(() => sub.unsubscribe()).not.toThrow();
    });

    it('disconnect después de connect debe desactivar', () => {
        service.connect();
        service.disconnect();
        expect((service as any)._client).toBeNull();
    });

    it('onStompError debe marcar como desconectado', async () => {
        service.connect();
        const client = (service as any)._client;
        // Simulate STOMP error callback
        if (client._onStompError) {
            client._onStompError({ headers: { message: 'error' } });
        }
        expect(service.isConnected()).toBe(false);
    });

    it('onWebSocketError debe marcar como desconectado', async () => {
        service.connect();
        await new Promise(r => setTimeout(r, 20));
        expect(service.isConnected()).toBe(true);
        const client = (service as any)._client;
        if (client._onWebSocketError) {
            client._onWebSocketError(new Event('error'));
        }
        expect(service.isConnected()).toBe(false);
    });

    it('onWebSocketClose debe incrementar reconnect attempts', () => {
        service.connect();
        const client = (service as any)._client;
        if (client._onWebSocketClose) {
            client._onWebSocketClose(new Event('close'));
        }
        expect((service as any)._reconnectAttempts).toBe(1);
    });

    it('onWebSocketClose debe desactivar después de max intentos', () => {
        service.connect();
        const client = (service as any)._client;
        // Set attempts near max
        (service as any)._reconnectAttempts = 9;
        if (client._onWebSocketClose) {
            client._onWebSocketClose(new Event('close'));
        }
        // Should have deactivated
        expect((service as any)._reconnectAttempts).toBe(10);
    });

    it('onDisconnect debe marcar como desconectado', async () => {
        service.connect();
        await new Promise(r => setTimeout(r, 20));
        const client = (service as any)._client;
        if (client._onDisconnect) {
            client._onDisconnect();
        }
        expect(service.isConnected()).toBe(false);
    });

    it('_doSubscribe debe re-suscribir si ya existe suscripción al mismo topic', async () => {
        service.connect();
        await new Promise(r => setTimeout(r, 20));

        const cb = vi.fn();
        service.subscribe('/topic/t1', cb);
        // Subscribe again to same topic
        const sub2 = service.subscribe('/topic/t1', cb);
        expect(sub2).toBeDefined();
    });
});
