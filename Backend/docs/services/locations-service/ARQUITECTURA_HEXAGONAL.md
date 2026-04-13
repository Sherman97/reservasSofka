# Locations Service - Arquitectura Hexagonal (Java 17)

## Objetivo
`locations-service` administra ciudades y espacios:
- `cities`
- `spaces`

## Endpoints
- `POST /locations/cities`
- `GET /locations/cities`
- `GET /locations/cities/{id}`
- `PUT /locations/cities/{id}`
- `DELETE /locations/cities/{id}`
- `POST /locations/spaces`
- `GET /locations/spaces` (filtros: `cityId`, `activeOnly`)
- `GET /locations/spaces/{id}`
- `PUT /locations/spaces/{id}`
- `DELETE /locations/spaces/{id}`
- `GET /health`

Todas las rutas de negocio requieren JWT Bearer excepto `/health`.

## RabbitMQ implementado
Se agrego publicacion de eventos:
- `locations.city.created`
- `locations.city.updated`
- `locations.city.deleted`
- `locations.space.created`
- `locations.space.updated`
- `locations.space.deleted`

Configuracion:
- `RABBITMQ_ENABLED=true` para activar.
- exchange por defecto: `reservas.events`.
- routing keys configurables por propiedades.

Con `RABBITMQ_ENABLED=false`, el servicio usa `NoOp`.

## Capas
- `domain`: `City`, `Space`.
- `application`: casos de uso y puertos (`LocationsUseCase`, `LocationsPersistencePort`, `LocationEventPublisherPort`).
- `adapters.in`: API REST + DTOs + mapper.
- `adapters.out`: JDBC, JWT y RabbitMQ.
- `infrastructure`: configuración técnica y seguridad.




