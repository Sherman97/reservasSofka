### HU-28: Actualizar reserva

**Como** usuario autenticado dueño de una reserva o administrador,  
**quiero** poder actualizar los detalles de mi reserva (título, cantidad de asistentes, notas y horarios),  
**para** ajustar la reserva a cambios en mis planes sin tener que cancelarla y crear una nueva.

**Criterios de aceptación:**

- Se permite la actualización solo si la reserva está en estado `pending` o `confirmed`.
- Los campos editables son: fecha/hora de inicio, fecha/hora de fin, título, asistentes y notas.
- `startAt` debe seguir siendo menor que `endAt`.
- Al cambiar las fechas/horas, el sistema debe reverificar la disponibilidad (no deben existir solapamientos).
- Se emite un evento `bookings.reservation.updated` vía RabbitMQ y WebSocket (si el backend lo contempla, o se refresca la vista).
- Si la edición tiene éxito, se muestra una confirmación UI y se actualiza la reserva en la lista/detalle.

**Datos técnicos:**

- Endpoint: `PUT /bookings/reservations/{id}`
- Casos de Uso (Frontend): `UpdateReservationUseCase`
- Componentes: `UpdateReservationModal` en `MyReservationsPage`
