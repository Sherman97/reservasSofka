# Notifications Service - WebSocket + RabbitMQ (Java 17)

## Objetivo
`notifications-service` consume eventos de RabbitMQ y los publica en tiempo real via WebSocket STOMP.

## Endpoints
- `GET /notifications/health`
- `WS /notifications/ws` (STOMP)

## Flujo
1. Los microservicios publican eventos al exchange `reservas.events`.
2. `notifications-service` consume una cola dedicada (`notifications.events.q`).
3. Cada evento se retransmite a:
- `/topic/events`
- `/topic/events.{channel}`
- `/topic/events.{routingKey}`

Canales por prefijo:
- `auth.*` -> `auth`
- `bookings.*` -> `bookings`
- `inventory.*` -> `inventory`
- `locations.*` -> `locations`

## Suscripciones recomendadas frontend
- Global: `/topic/events`
- Dominio: `/topic/events.bookings`
- Evento exacto: `/topic/events.bookings.reservation.created`

## Conexion via gateway
- WS recomendado desde frontend: `ws://localhost:3000/notifications/ws`
- El gateway hace proxy al `notifications-service`.

## Configuracion clave
- `RABBITMQ_ENABLED=true`
- `RABBITMQ_EXCHANGE=reservas.events`
- `RABBITMQ_QUEUE=notifications.events.q`
- `RABBITMQ_ROUTING_KEYS=...`
- `WEBSOCKET_ALLOWED_ORIGINS=*`

## Nota
Este servicio no reemplaza API REST de negocio; solo entrega notificaciones realtime.






