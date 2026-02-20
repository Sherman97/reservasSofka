import { Client } from '@stomp/stompjs';

const BOOKINGS_WS_URL = import.meta.env.VITE_BOOKINGS_WS_URL || 'ws://localhost:3003/bookings/ws';

export const subscribeReservationsRealtime = (onEvent) => {
  // Human Check 🛡️: escucha eventos realtime para refrescar reservas en pestañas simultaneas.
  const client = new Client({
    brokerURL: BOOKINGS_WS_URL,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  client.onConnect = () => {
    client.subscribe('/topic/bookings.reservations', (message) => {
      try {
        const payload = JSON.parse(message.body);
        onEvent(payload);
      } catch (error) {
        console.error('Invalid websocket payload:', error);
      }
    });
  };

  client.onStompError = (frame) => {
    console.error('STOMP error:', frame.headers['message']);
  };

  client.activate();

  return () => {
    client.deactivate();
  };
};

