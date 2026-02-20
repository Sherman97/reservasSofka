# Simulacion de reserva (bookings-service)

Este documento resume las rutas reales del servicio de reservas y el flujo minimo para simular una reserva end-to-end.

## Base URLs

- API Gateway: `http://localhost:3000`
- Bookings directo: `http://localhost:3003`

Nota: el gateway enruta ` /bookings/** ` hacia `bookings-service`.

## Login (obtener JWT)

### Endpoint

- Metodo: `POST`
- Ruta: `/auth/login`

Body:

```json
{
  "email": "usuario@correo.com",
  "password": "123456"
}
```

Ejemplo:

```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@correo.com","password":"123456"}'
```

JSON de flujo completo (create->cancel):

- `Backend/docs/reserva-simulacion-create-cancel.json`

## Autenticacion

Todos los endpoints de `/bookings/**` requieren JWT Bearer (excepto `/health`, que no esta bajo `/bookings`).

Header requerido:

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

El `subject` del token (`sub`) se usa como `userId` de la reserva.

## Rutas de reservas

### 1) Verificar disponibilidad de espacio

- Metodo: `GET`
- Ruta: `/bookings/spaces/{spaceId}/availability`
- Query params:
  - `startAt` (ISO-8601 UTC, ejemplo `2026-02-20T14:00:00Z`)
  - `endAt` (ISO-8601 UTC, ejemplo `2026-02-20T16:00:00Z`)

Ejemplo:

```bash
curl -X GET "http://localhost:3000/bookings/spaces/1/availability?startAt=2026-02-20T14:00:00Z&endAt=2026-02-20T16:00:00Z" \
  -H "Authorization: Bearer <JWT>"
```

### 2) Crear reserva

- Metodo: `POST`
- Ruta: `/bookings/reservations`
- Body: ver archivo `Backend/docs/reserva-prueba.json`

Ejemplo:

```bash
curl -X POST "http://localhost:3000/bookings/reservations" \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d @Backend/docs/reserva-prueba.json
```

### 3) Listar reservas

- Metodo: `GET`
- Ruta: `/bookings/reservations`
- Filtros opcionales:
  - `userId`
  - `spaceId`
  - `status` (`pending | confirmed | in_progress | completed | cancelled`)

Ejemplo:

```bash
curl -X GET "http://localhost:3000/bookings/reservations?status=confirmed" \
  -H "Authorization: Bearer <JWT>"
```

### 4) Consultar reserva por id

- Metodo: `GET`
- Ruta: `/bookings/reservations/{id}`

Ejemplo:

```bash
curl -X GET "http://localhost:3000/bookings/reservations/1" \
  -H "Authorization: Bearer <JWT>"
```

### 5) Cancelar reserva

- Metodo: `PATCH`
- Ruta: `/bookings/reservations/{id}/cancel`
- Body opcional:

```json
{
  "reason": "Cambio de agenda"
}
```

Ejemplo:

```bash
curl -X PATCH "http://localhost:3000/bookings/reservations/1/cancel" \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d @Backend/docs/cancelacion-prueba.json
```

## Flujo recomendado de simulacion

1. Verifica disponibilidad (`/spaces/{spaceId}/availability`).
2. Crea la reserva (`POST /reservations`).
3. Consulta la reserva creada (`GET /reservations/{id}`).
4. Lista por estado (`GET /reservations?status=confirmed`).
5. Cancela (`PATCH /reservations/{id}/cancel`).

JSONs usados en el flujo:

- Crear: `Backend/docs/reserva-prueba.json`
- Cancelar: `Backend/docs/cancelacion-prueba.json`
- Simulacion encadenada: `Backend/docs/reserva-simulacion-create-cancel.json`

## Reglas de negocio importantes

- `startAt` debe ser menor que `endAt`.
- No permite sobreposicion de reservas activas en el mismo espacio (`pending`, `confirmed`, `in_progress`).
- Si envias `equipmentIds`:
  - Deben existir.
  - Deben estar en estado `available` en `equipments`.
  - Deben pertenecer a la misma ciudad del espacio.
- Al crear reserva, el servicio persiste la reserva con estado `confirmed`.
- Al cancelar, cambia a `cancelled` y guarda `cancellation_reason`.

## Esquema para simulacion

Ver `Backend/docs/esquema-reserva-simulacion.json`.
