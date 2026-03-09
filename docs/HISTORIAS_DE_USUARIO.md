# Historias de Usuario — Reservas SK

Sistema integral de reservas de espacios y equipos.

---

## Tabla de Contenidos

- [Épica 1: Autenticación y Gestión de Usuarios](#épica-1-autenticación-y-gestión-de-usuarios)
- [Épica 2: Gestión de Ubicaciones (Ciudades y Espacios)](#épica-2-gestión-de-ubicaciones-ciudades-y-espacios)
- [Épica 3: Gestión de Inventario (Equipos)](#épica-3-gestión-de-inventario-equipos)
- [Épica 4: Reservas de Espacios](#épica-4-reservas-de-espacios)
- [Épica 5: Notificaciones en Tiempo Real](#épica-5-notificaciones-en-tiempo-real)
- [Épica 6: Panel de Control (Dashboard)](#épica-6-panel-de-control-dashboard)

---

## Épica 1: Autenticación y Gestión de Usuarios

### HU-01: Registro de usuario

**Como** visitante del sistema,  
**quiero** registrarme proporcionando mi nombre, correo electrónico y contraseña,  
**para** poder acceder al sistema de reservas.

**Criterios de aceptación:**

- El formulario solicita nombre, email y contraseña.
- El email debe ser único en el sistema; si ya existe, se muestra un mensaje de error.
- La contraseña se almacena de forma segura (hash).
- Al registrarse exitosamente, se crea el usuario en la base de datos y se emite el evento `auth.user.created` vía RabbitMQ.
- Se redirige al usuario a la página de login.
- Se muestran mensajes de validación claros ante datos inválidos.

**Datos técnicos:**

- Endpoint: `POST /auth/register`
- Servicio: `auth-service`
- Tabla: `users`

---

### HU-02: Inicio de sesión

**Como** usuario registrado,  
**quiero** iniciar sesión con mi correo electrónico y contraseña,  
**para** acceder a las funcionalidades protegidas del sistema.

**Criterios de aceptación:**

- El formulario solicita email y contraseña.
- Si las credenciales son válidas, se emite un token JWT y se almacena en el navegador (localStorage).
- El usuario es redirigido al dashboard después de iniciar sesión.
- Si las credenciales son inválidas, se muestra un mensaje de error claro sin revelar qué campo es incorrecto.
- El token JWT tiene un tiempo de expiración definido.

**Datos técnicos:**

- Endpoint: `POST /auth/login`
- Servicio: `auth-service`
- Respuesta: `{ ok, data: { user, token }, message }`

---

### HU-03: Consulta de perfil del usuario autenticado

**Como** usuario autenticado,  
**quiero** consultar mi información de perfil,  
**para** verificar que mis datos son correctos.

**Criterios de aceptación:**

- Al acceder a la ruta protegida, se muestra el nombre y correo del usuario autenticado.
- La información se obtiene a partir del token JWT vigente.
- Si el token ha expirado o es inválido, se redirige al login.

**Datos técnicos:**

- Endpoint: `GET /auth/me`
- Servicio: `auth-service`
- Requiere: JWT Bearer válido.

---

### HU-04: Cierre de sesión

**Como** usuario autenticado,  
**quiero** cerrar mi sesión,  
**para** proteger mi cuenta al dejar de usar el sistema.

**Criterios de aceptación:**

- Al hacer clic en el botón de cerrar sesión, se elimina el token JWT del almacenamiento local.
- Se desconecta la sesión WebSocket activa.
- El usuario es redirigido a la página de login.
- Después de cerrar sesión, no se puede acceder a rutas protegidas sin volver a iniciar sesión.

**Datos técnicos:**

- Acción en frontend: eliminar token de `localStorage`, desconectar STOMP client.
- Caso de uso: `LogoutUseCase`.

---

### HU-05: Protección de rutas

**Como** sistema,  
**quiero** restringir el acceso a las páginas del dashboard y reservas solo a usuarios autenticados,  
**para** garantizar la seguridad de la información.

**Criterios de aceptación:**

- Las rutas `/dashboard` y `/my-reservations` solo son accesibles con un token JWT válido.
- Si un usuario no autenticado intenta acceder, es redirigido al login.
- Cada servicio backend valida el token JWT de forma independiente en cada petición.

**Datos técnicos:**

- Componente: `ProtectedRoute`
- Rutas protegidas: `/dashboard`, `/my-reservations`

---

## Épica 2: Gestión de Ubicaciones (Ciudades y Espacios)

### HU-06: Crear ciudad

**Como** administrador,  
**quiero** registrar una nueva ciudad con su nombre y país,  
**para** asociar espacios de trabajo a una ubicación geográfica.

**Criterios de aceptación:**

- Se envía nombre y país de la ciudad.
- La combinación nombre-país debe ser única.
- Al crearse exitosamente, se emite el evento `locations.city.created`.
- Se devuelve la ciudad creada con su ID.

**Datos técnicos:**

- Endpoint: `POST /locations/cities`
- Servicio: `locations-service`
- Tabla: `cities`

---

### HU-07: Listar ciudades

**Como** usuario autenticado,  
**quiero** ver la lista de ciudades disponibles,  
**para** seleccionar una ubicación al buscar espacios o crear reservas.

**Criterios de aceptación:**

- Se muestra una lista de todas las ciudades registradas con su nombre y país.
- La lista se carga al acceder al dashboard.

**Datos técnicos:**

- Endpoint: `GET /locations/cities`
- Servicio: `locations-service`

---

### HU-08: Actualizar ciudad

**Como** administrador,  
**quiero** modificar el nombre o país de una ciudad existente,  
**para** corregir datos o reflejar cambios administrativos.

**Criterios de aceptación:**

- Se pueden actualizar los campos nombre y/o país.
- La combinación nombre-país sigue siendo validada como única.
- Se emite el evento `locations.city.updated`.

**Datos técnicos:**

- Endpoint: `PUT /locations/cities/{id}`
- Servicio: `locations-service`

---

### HU-09: Eliminar ciudad

**Como** administrador,  
**quiero** eliminar una ciudad que ya no se utiliza,  
**para** mantener el catálogo de ubicaciones limpio.

**Criterios de aceptación:**

- Solo se puede eliminar si no tiene espacios activos asociados.
- Se emite el evento `locations.city.deleted`.

**Datos técnicos:**

- Endpoint: `DELETE /locations/cities/{id}`
- Servicio: `locations-service`

---

### HU-10: Crear espacio

**Como** administrador,  
**quiero** registrar un nuevo espacio de trabajo asociado a una ciudad,  
**para** que los usuarios puedan reservarlo.

**Criterios de aceptación:**

- Se especifica: ciudad, nombre, capacidad, piso, descripción e imagen (opcional).
- El nombre del espacio debe ser único dentro de la misma ciudad.
- El espacio se crea en estado activo (`is_active = true`).
- Se emite el evento `locations.space.created`.

**Datos técnicos:**

- Endpoint: `POST /locations/spaces`
- Servicio: `locations-service`
- Tabla: `spaces`

---

### HU-11: Listar espacios

**Como** usuario autenticado,  
**quiero** ver la lista de espacios disponibles,  
**para** elegir el más adecuado para mi reserva.

**Criterios de aceptación:**

- Se muestra una lista de espacios con nombre, ciudad, capacidad, piso, descripción e imagen.
- Los espacios se presentan en formato de tarjetas (cards) en el dashboard.
- Se puede filtrar por ciudad.

**Datos técnicos:**

- Endpoint: `GET /locations/spaces`
- Servicio: `locations-service`

---

### HU-12: Actualizar espacio

**Como** administrador,  
**quiero** actualizar la información de un espacio existente,  
**para** reflejar cambios en capacidad, nombre, descripción o imagen.

**Criterios de aceptación:**

- Se pueden modificar los campos del espacio.
- Se emite el evento `locations.space.updated`.

**Datos técnicos:**

- Endpoint: `PUT /locations/spaces/{id}`
- Servicio: `locations-service`

---

### HU-13: Eliminar espacio

**Como** administrador,  
**quiero** eliminar un espacio que ya no está disponible,  
**para** que los usuarios no puedan reservarlo.

**Criterios de aceptación:**

- No se puede eliminar si tiene reservas activas (pendientes, confirmadas o en progreso).
- Se emite el evento `locations.space.deleted`.

**Datos técnicos:**

- Endpoint: `DELETE /locations/spaces/{id}`
- Servicio: `locations-service`

---

## Épica 3: Gestión de Inventario (Equipos)

### HU-14: Crear equipo

**Como** administrador,  
**quiero** registrar un nuevo equipo (proyector, pizarra, videoconferencia, etc.) asociado a una ciudad,  
**para** que pueda ser solicitado al crear una reserva.

**Criterios de aceptación:**

- Se especifica: ciudad, nombre, serial, código de barras, modelo, notas e imagen (opcionales).
- El serial y el código de barras deben ser únicos si se proporcionan.
- El equipo se crea con estado `available`.
- Se emite el evento `inventory.equipment.created`.

**Datos técnicos:**

- Endpoint: `POST /inventory/equipments`
- Servicio: `inventory-service`
- Tabla: `equipments`
- Estados posibles: `available`, `maintenance`, `retired`

---

### HU-15: Listar equipos

**Como** usuario autenticado,  
**quiero** ver la lista de equipos disponibles,  
**para** seleccionar los que necesito al crear una reserva.

**Criterios de aceptación:**

- Se muestra una lista de equipos con nombre, modelo, estado, serial y ciudad.
- Los equipos se presentan en formato de tarjetas en el dashboard.
- Se puede filtrar por ciudad.

**Datos técnicos:**

- Endpoint: `GET /inventory/equipments`
- Servicio: `inventory-service`

---

### HU-16: Actualizar equipo

**Como** administrador,  
**quiero** actualizar la información de un equipo existente (nombre, modelo, estado, notas),  
**para** reflejar cambios en su disponibilidad o características.

**Criterios de aceptación:**

- Se pueden actualizar los campos del equipo, incluyendo su estado (available, maintenance, retired).
- Se emite el evento `inventory.equipment.updated`.

**Datos técnicos:**

- Endpoint: `PUT /inventory/equipments/{id}`
- Servicio: `inventory-service`

---

### HU-17: Eliminar equipo

**Como** administrador,  
**quiero** eliminar un equipo del inventario,  
**para** retirarlo del sistema cuando ya no esté disponible.

**Criterios de aceptación:**

- No se puede eliminar si está asociado a reservas activas.
- Se emite el evento `inventory.equipment.deleted`.

**Datos técnicos:**

- Endpoint: `DELETE /inventory/equipments/{id}`
- Servicio: `inventory-service`

---

## Épica 4: Reservas de Espacios

### HU-18: Consultar disponibilidad de un espacio

**Como** usuario autenticado,  
**quiero** verificar la disponibilidad de un espacio en un rango de fecha y hora específico,  
**para** saber si puedo crear una reserva en ese horario.

**Criterios de aceptación:**

- Se indica el ID del espacio, fecha/hora de inicio y fecha/hora de fin (formato ISO-8601 UTC).
- El sistema responde indicando si el espacio está disponible (`available: true/false`) y la cantidad de reservas que se solapan.
- La fecha de inicio debe ser anterior a la fecha de fin.

**Datos técnicos:**

- Endpoint: `GET /bookings/spaces/{spaceId}/availability?startAt=...&endAt=...`
- Servicio: `bookings-service`
- Respuesta: `{ available: boolean, overlappingReservations: number }`

---

### HU-19: Crear reserva

**Como** usuario autenticado,  
**quiero** crear una reserva para un espacio en un horario específico, opcionalmente incluyendo equipos,  
**para** asegurar el uso del espacio y los recursos que necesito.

**Criterios de aceptación:**

- Se especifica: espacio, fecha/hora de inicio, fecha/hora de fin, título (opcional), cantidad de asistentes (opcional), notas (opcional) y lista de IDs de equipos (opcional).
- `startAt` debe ser menor que `endAt`.
- No se permite solapamiento de reservas activas (`pending`, `confirmed`, `in_progress`) en el mismo espacio.
- Si se envían `equipmentIds`:
  - Los equipos deben existir en el sistema.
  - Deben estar en estado `available`.
  - Deben pertenecer a la misma ciudad del espacio reservado.
- Al crearse exitosamente, la reserva se guarda con estado `confirmed`.
- Se emite el evento `bookings.reservation.created` vía RabbitMQ.
- Se envía un mensaje WebSocket al topic `/topic/bookings.reservations.created`.
- El usuario asociado a la reserva se obtiene del `subject` del token JWT.

**Datos técnicos:**

- Endpoint: `POST /bookings/reservations`
- Servicio: `bookings-service`
- Tablas: `reservations`, `reservation_equipments`
- Body ejemplo:
```json
{
  "spaceId": 1,
  "startAt": "2026-02-20T14:00:00Z",
  "endAt": "2026-02-20T16:00:00Z",
  "title": "Demo de producto cliente ACME",
  "attendeesCount": 8,
  "notes": "Se requiere videoconferencia y pizarra.",
  "equipmentIds": [1]
}
```

---

### HU-20: Listar reservas

**Como** usuario autenticado,  
**quiero** consultar la lista de reservas existentes, pudiendo filtrar por usuario, espacio o estado,  
**para** revisar las reservas realizadas.

**Criterios de aceptación:**

- Se pueden aplicar filtros opcionales: `userId`, `spaceId`, `status`.
- Los estados posibles son: `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`.
- Se retorna una lista de reservas con todos sus detalles.

**Datos técnicos:**

- Endpoint: `GET /bookings/reservations`
- Servicio: `bookings-service`

---

### HU-21: Ver mis reservas

**Como** usuario autenticado,  
**quiero** ver una lista de mis reservas personales con filtros por estado,  
**para** llevar un control de mis reservas activas, pasadas y canceladas.

**Criterios de aceptación:**

- La página muestra exclusivamente las reservas del usuario autenticado.
- Se puede filtrar por estado (confirmada, cancelada, completada, en progreso).
- Cada reserva muestra: espacio, fecha/hora, estado, título y equipos asociados.
- Se implementa paginación para listas largas.
- La lista se actualiza en tiempo real cuando se crea o cancela una reserva desde otra pestaña.

**Datos técnicos:**

- Página: `/my-reservations` → `MyReservationsPage`
- Componentes: `ReservationCard`, `ReservationList`, `FilterBar`, `Pagination`
- Caso de uso: `GetUserReservationsUseCase`

---

### HU-22: Ver detalle de una reserva

**Como** usuario autenticado,  
**quiero** consultar el detalle completo de una reserva por su ID,  
**para** ver toda la información asociada (espacio, horario, equipos, estado).

**Criterios de aceptación:**

- Se muestra la información completa de la reserva: espacio, fecha/hora inicio y fin, título, cantidad de asistentes, notas, estado, equipos asociados y motivo de cancelación (si aplica).

**Datos técnicos:**

- Endpoint: `GET /bookings/reservations/{id}`
- Servicio: `bookings-service`

---

### HU-23: Cancelar reserva

**Como** usuario autenticado,  
**quiero** cancelar una reserva que ya no necesito, indicando opcionalmente un motivo,  
**para** liberar el espacio y los equipos para otros usuarios.

**Criterios de aceptación:**

- Solo se pueden cancelar reservas en estado `pending`, `confirmed` o `in_progress`.
- Se puede proporcionar un motivo de cancelación (opcional).
- Al cancelarse, el estado cambia a `cancelled` y se guarda el `cancellation_reason`.
- Se emite el evento `bookings.reservation.cancelled` vía RabbitMQ.
- Se envía un mensaje WebSocket al topic `/topic/bookings.reservations.cancelled`.
- Los equipos asociados quedan disponibles para otras reservas.

**Datos técnicos:**

- Endpoint: `PATCH /bookings/reservations/{id}/cancel`
- Servicio: `bookings-service`
- Body ejemplo:
```json
{
  "reason": "Cambio de agenda"
}
```

---

## Épica 5: Notificaciones en Tiempo Real

### HU-24: Recibir notificaciones en tiempo real

**Como** usuario autenticado conectado al sistema,  
**quiero** recibir notificaciones en tiempo real cuando ocurran eventos relevantes (creación de reservas, cancelaciones, cambios en espacios o equipos),  
**para** mantenerme informado sin necesidad de refrescar la página.

**Criterios de aceptación:**

- Al iniciar sesión, el frontend establece una conexión WebSocket STOMP con el servicio de notificaciones.
- Se reciben eventos de todos los canales relevantes: reservas, ubicaciones, inventario.
- Las notificaciones se muestran en la interfaz de usuario de forma no intrusiva.
- Al cerrar sesión, la conexión WebSocket se desconecta.

**Datos técnicos:**

- Endpoint STOMP: `/notifications/ws`
- Topics: `/topic/events`, `/topic/events.{channel}`, `/topic/events.{routingKey}`
- Servicio: `notifications-service`
- Frontend: `StompWebSocketService`, hook `useBookingEvents`

---

### HU-25: Actualización en tiempo real de reservas

**Como** usuario con múltiples pestañas abiertas del sistema,  
**quiero** que los cambios en reservas (creaciones y cancelaciones) se reflejen automáticamente en todas las pestañas,  
**para** evitar conflictos y tener información siempre actualizada.

**Criterios de aceptación:**

- Cuando se crea una reserva en una pestaña, todas las demás pestañas del usuario actualizan automáticamente la lista de reservas y la disponibilidad.
- Cuando se cancela una reserva, todas las pestañas reflejan el cambio de estado.
- El mecanismo previene doble reserva en el mismo espacio y horario entre usuarios concurrentes.

**Datos técnicos:**

- Endpoint STOMP: `/bookings/ws`
- Topics: `/topic/bookings.reservations`, `/topic/bookings.reservations.created`, `/topic/bookings.reservations.cancelled`
- Servicio: `bookings-service`

---

## Épica 6: Panel de Control (Dashboard)

### HU-26: Visualizar dashboard con espacios y equipos

**Como** usuario autenticado,  
**quiero** acceder a un panel de control que muestre los espacios y equipos disponibles,  
**para** explorar las opciones y proceder a crear una reserva.

**Criterios de aceptación:**

- El dashboard muestra tarjetas (cards) con los espacios disponibles (nombre, ciudad, capacidad, imagen).
- Se muestra también una sección de equipos disponibles con sus detalles.
- Se puede buscar y filtrar espacios y equipos mediante una barra de búsqueda.
- El dashboard está disponible solo para usuarios autenticados.

**Datos técnicos:**

- Página: `/dashboard` → `DashboardPage`
- Componentes: `ItemCard`, `SearchBar`, modales de reserva
- Casos de uso: `GetLocationsUseCase`, `GetInventoryUseCase`

---

### HU-27: Crear reserva desde el dashboard

**Como** usuario autenticado,  
**quiero** iniciar el proceso de reserva directamente desde el dashboard seleccionando un espacio,  
**para** agilizar el flujo de creación de reservas.

**Criterios de aceptación:**

- Al seleccionar un espacio en el dashboard, se abre un modal de reserva.
- El modal permite seleccionar fecha/hora de inicio y fin, título, cantidad de asistentes, notas y equipos opcionales.
- Antes de confirmar, se verifica la disponibilidad del espacio (HU-18).
- Al confirmar, se crea la reserva (HU-19) y se cierra el modal mostrando confirmación.
- Si el espacio no está disponible, se informa al usuario.

**Datos técnicos:**

- Componentes: modal de reserva en `DashboardPage`
- Caso de uso: `CreateReservationUseCase`, `GetAvailabilityUseCase`

---

## Resumen de Historias de Usuario

| ID | Historia | Épica | Prioridad |
| --- | --- | --- | --- |
| HU-01 | Registro de usuario | Autenticación | Alta |
| HU-02 | Inicio de sesión | Autenticación | Alta |
| HU-03 | Consulta de perfil | Autenticación | Media |
| HU-04 | Cierre de sesión | Autenticación | Alta |
| HU-05 | Protección de rutas | Autenticación | Alta |
| HU-06 | Crear ciudad | Ubicaciones | Media |
| HU-07 | Listar ciudades | Ubicaciones | Alta |
| HU-08 | Actualizar ciudad | Ubicaciones | Baja |
| HU-09 | Eliminar ciudad | Ubicaciones | Baja |
| HU-10 | Crear espacio | Ubicaciones | Alta |
| HU-11 | Listar espacios | Ubicaciones | Alta |
| HU-12 | Actualizar espacio | Ubicaciones | Media |
| HU-13 | Eliminar espacio | Ubicaciones | Baja |
| HU-14 | Crear equipo | Inventario | Media |
| HU-15 | Listar equipos | Inventario | Alta |
| HU-16 | Actualizar equipo | Inventario | Media |
| HU-17 | Eliminar equipo | Inventario | Baja |
| HU-18 | Consultar disponibilidad | Reservas | Alta |
| HU-19 | Crear reserva | Reservas | Alta |
| HU-20 | Listar reservas | Reservas | Alta |
| HU-21 | Ver mis reservas | Reservas | Alta |
| HU-22 | Ver detalle de reserva | Reservas | Media |
| HU-23 | Cancelar reserva | Reservas | Alta |
| HU-24 | Notificaciones en tiempo real | Notificaciones | Media |
| HU-25 | Actualización en tiempo real | Notificaciones | Media |
| HU-26 | Visualizar dashboard | Dashboard | Alta |
| HU-27 | Crear reserva desde dashboard | Dashboard | Alta |
