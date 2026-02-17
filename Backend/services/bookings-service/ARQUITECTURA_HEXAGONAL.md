# Bookings Service - Arquitectura Hexagonal (Java 17)

## Objetivo
`bookings-service` administra reservas de espacios y los equipos asociados a cada reserva.

Tablas principales:
- `reservations`
- `reservation_equipments`

Validaciones de soporte:
- `users`
- `spaces`
- `equipments`

## Endpoints
- `GET /bookings/spaces/{spaceId}/availability?startAt=&endAt=`
- `POST /bookings/reservations`
- `GET /bookings/reservations`
- `GET /bookings/reservations/{id}`
- `PATCH /bookings/reservations/{id}/cancel`
- `GET /health`

Todas las rutas de negocio requieren JWT Bearer.

## RabbitMQ implementado
Se agrego publicacion de eventos de dominio (patron puerto + adapter):
- `bookings.reservation.created`
- `bookings.reservation.cancelled`

Configuracion:
- `RABBITMQ_ENABLED=true` para activar.
- `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`.
- exchange por defecto: `reservas.events`.

Si `RABBITMQ_ENABLED=false`, usa adapter `NoOp` y el servicio funciona igual sin broker.

## Capas
- `domain`: `Reservation`, `ReservationEquipment`, `SpaceAvailability`.
- `application`: casos de uso + puertos (`BookingUseCase`, `BookingPersistencePort`, `ReservationEventPublisherPort`).
- `adapters.in`: controller y DTOs HTTP.
- `adapters.out`: JDBC, JWT y RabbitMQ.
- `infrastructure`: seguridad stateless + propiedades JWT/Rabbit.




