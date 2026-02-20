# Inventory Service - Arquitectura Hexagonal (Java 17)

## Objetivo
`inventory-service` gestiona equipos (`equipments`) por ciudad.

Tabla principal:
- `equipments`

Validacion de referencia:
- `cities`

## Endpoints
- `POST /inventory/equipments`
- `GET /inventory/equipments` (filtros: `cityId`, `status`)
- `GET /inventory/equipments/{id}`
- `PUT /inventory/equipments/{id}`
- `DELETE /inventory/equipments/{id}`
- `GET /health`

Todas las rutas de negocio requieren JWT Bearer.

## RabbitMQ implementado
Se agrego publicacion de eventos:
- `inventory.equipment.created`
- `inventory.equipment.updated`
- `inventory.equipment.deleted`

Configuracion:
- `RABBITMQ_ENABLED=true` para activar.
- exchange por defecto: `reservas.events`.
- routing keys configurables por `application.properties`.

Con `RABBITMQ_ENABLED=false`, usa `NoOp` y no publica eventos.

## Limite de contexto
Este servicio **no** crea relaciones `reservation_equipments`; eso pertenece a `bookings-service`.

## Capas
- `domain`: `Equipment`.
- `application`: `InventoryUseCase` y puertos (`InventoryPersistencePort`, `EquipmentEventPublisherPort`).
- `adapters.in`: controller/DTO/mapper HTTP.
- `adapters.out`: JDBC, JWT y RabbitMQ.
- `infrastructure`: configuración de seguridad y propiedades.




