import { describe, expect, it, vi, beforeEach } from 'vitest';

const subscribeMock = vi.fn();
const activateMock = vi.fn();
const deactivateMock = vi.fn();
let lastClientConfig = null;
let lastClientInstance = null;

vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn().mockImplementation(function MockClient(config) {
    lastClientConfig = config;
    lastClientInstance = {
      subscribe: subscribeMock,
      activate: activateMock,
      deactivate: deactivateMock,
    };
    return lastClientInstance;
  }),
}));

import { subscribeReservationsRealtime } from './reservationsRealtimeService';

describe('reservationsRealtimeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastClientConfig = null;
    lastClientInstance = null;
  });

  it('configura y activa cliente STOMP; procesa evento valido', () => {
    const onEvent = vi.fn();
    const unsubscribe = subscribeReservationsRealtime(onEvent);

    expect(activateMock).toHaveBeenCalled();
    expect(lastClientConfig.brokerURL).toContain('ws://');
    expect(typeof lastClientInstance.onConnect).toBe('function');

    let callback;
    subscribeMock.mockImplementationOnce((_topic, handler) => {
      callback = handler;
    });
    lastClientInstance.onConnect();

    expect(subscribeMock).toHaveBeenCalledWith('/topic/bookings.reservations', expect.any(Function));

    callback({ body: JSON.stringify({ type: 'reservation.created' }) });
    expect(onEvent).toHaveBeenCalledWith({ type: 'reservation.created' });

    unsubscribe();
    expect(deactivateMock).toHaveBeenCalled();
  });

  it('maneja payload invalido y errores STOMP sin romper', () => {
    const onEvent = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    subscribeReservationsRealtime(onEvent);
    let callback;
    subscribeMock.mockImplementationOnce((_topic, handler) => {
      callback = handler;
    });
    lastClientInstance.onConnect();

    callback({ body: '{invalid-json' });
    expect(onEvent).not.toHaveBeenCalled();

    lastClientInstance.onStompError({ headers: { message: 'boom' } });
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
