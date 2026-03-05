# Rutas para simular una reserva

Archivo principal de rutas para pruebas de reserva.

## Archivos relacionados

- JSON de prueba: `Backend/docs/reserva-prueba.json`
- JSON de cancelacion: `Backend/docs/cancelacion-prueba.json`
- JSON simulado create->cancel: `Backend/docs/reserva-simulacion-create-cancel.json`
- Esquema completo: `Backend/docs/esquema-reserva-simulacion.json`

## Base URL

- Gateway: `http://localhost:3000`

## Ruta de login (obtener JWT)

### Login

- `POST /auth/login`

```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"usuario@correo.com",
    "password":"123456"
  }'
```

Respuesta esperada (resumen):

```json
{
  "ok": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Usuario",
      "email": "usuario@correo.com"
    },
    "token": "eyJhbGciOi..."
  },
  "message": null
}
```

## Auth

Todos los endpoints requieren:

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

Usa el token de `/auth/login` en el header `Authorization`.

## Rutas

### 1) Disponibilidad de espacio

- `GET /bookings/spaces/{spaceId}/availability?startAt=2026-02-20T14:00:00Z&endAt=2026-02-20T16:00:00Z`

```bash
curl -X GET "http://localhost:3000/bookings/spaces/1/availability?startAt=2026-02-20T14:00:00Z&endAt=2026-02-20T16:00:00Z" \
  -H "Authorization: Bearer <JWT>"
```

### 2) Crear reserva

- `POST /bookings/reservations`

```bash
curl -X POST "http://localhost:3000/bookings/reservations" \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d @Backend/docs/reserva-prueba.json
```

### 3) Listar reservas

- `GET /bookings/reservations`
- Filtros opcionales: `userId`, `spaceId`, `status`

```bash
curl -X GET "http://localhost:3000/bookings/reservations?status=confirmed" \
  -H "Authorization: Bearer <JWT>"
```

### 4) Obtener reserva por id

- `GET /bookings/reservations/{id}`

```bash
curl -X GET "http://localhost:3000/bookings/reservations/1" \
  -H "Authorization: Bearer <JWT>"
```

### 5) Cancelar reserva

- `PATCH /bookings/reservations/{id}/cancel`

```bash
curl -X PATCH "http://localhost:3000/bookings/reservations/1/cancel" \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d @Backend/docs/cancelacion-prueba.json
```

## Simulacion JSON create y cancel de la misma reserva

Archivo: `Backend/docs/reserva-simulacion-create-cancel.json`

- `createReservation.request`: JSON real para crear.
- `cancelReservation.path`: usa el `id` retornado por create.
- `cancelReservation.request`: JSON real para cancelar esa misma reserva.
