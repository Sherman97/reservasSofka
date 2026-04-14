# Plan Técnico Arquitectónico: RBAC + Módulo Administrador

## 1. Objetivo
Diseñar e implementar un modelo de autorización por roles (RBAC) para soportar las HU refactor del módulo administrador (HU-02 y HU-03) sin romper el flujo actual de usuario final.

## 2. Principios de diseño
- Seguridad por defecto (`deny-by-default` y mínimo privilegio).
- Compatibilidad hacia atrás de APIs actuales.
- Evolución incremental (rollout por fases).
- Separación de responsabilidades: autorización en seguridad, reglas de negocio en servicios.
- Auditoría obligatoria para acciones privilegiadas.

## 3. Decisiones arquitectónicas (ADR)
1. **Modelo de roles:** usar tablas `roles` + `user_roles` (N:M), no columna única en `users`.
2. **JWT enriquecido:** incluir claim `roles` además de `sub` y `email`.
3. **Autorización en dos niveles:**
   - Nivel 1: Spring Security (`hasRole('ADMIN')`) por endpoint.
   - Nivel 2: validaciones de negocio (estado reprogramable, conflictos de espacio/equipos).
4. **Separación de endpoints admin:** prefijo `/admin` para operaciones privilegiadas.
5. **Auditoría dedicada:** tabla específica de reprogramación; no mezclar con handover logs.
6. **Frontend con guard por rol:** rutas admin separadas reutilizando componentes actuales.

## 4. Alcance funcional

### HU-02 (Admin crea reserva manual)
- Crear reserva para un usuario tercero.
- Validar disponibilidad de espacio.
- Validar disponibilidad de equipos asociados (si se incluyen).
- Estado inicial de reserva: `confirmed`.

### HU-03 (Admin reprograma reserva)
- Reprogramar reservas en estados elegibles (`pending`, `confirmed`).
- Validar conflicto de espacio excluyendo la misma reserva.
- Validar disponibilidad de equipos asociados en nueva franja.
- Registrar auditoría completa del cambio.

## 5. Plan por sprints

## Sprint 1: Fundaciones de seguridad y datos

### 5.1 Base de datos
- Crear migración `roles`:
  - `id`, `name` (unique), `description`, timestamps.
- Crear migración `user_roles`:
  - `user_id`, `role_id`, `created_at`.
  - índice único compuesto `(user_id, role_id)`.
- Sembrar roles base:
  - `USER`
  - `ADMIN`
- Backfill:
  - asignar `USER` a usuarios existentes.

### 5.2 Auth-service
- Extender dominio y persistencia de usuario para resolver roles.
- Incluir roles en:
  - respuesta de login/register.
  - respuesta `GET /auth/me`.
- JWT:
  - emitir claim `roles`.
  - parsear roles al autenticar.
- Cambiar principal autenticado a:
  - `AuthenticatedUser(userId, email, roles)`.

### 5.3 Servicios de negocio (bookings/inventory/locations)
- Actualizar filtros JWT para crear `GrantedAuthority` a partir de claim `roles`.
- Actualizar `SecurityConfig` por servicio:
  - `permitAll`: health, login, register.
  - `hasRole('ADMIN')`: rutas administrativas.
  - `authenticated()`: rutas de usuario autenticado.

### 5.4 DoD Sprint 1
- Tests unitarios de JWT con roles.
- Tests de seguridad (401/403) por endpoint protegido.
- Pruebas de regresión para flujo actual de login y usuario estándar.

---

## Sprint 2: Capacidades backend para HU-02/HU-03

### 5.5 Bookings-service: HU-02 Admin create
- Nuevo endpoint:
  - `POST /bookings/admin/reservations`
- Request sugerido:
  - `targetUserId`, `spaceId`, `startAt`, `endAt`, `title`, `attendeesCount`, `notes`, `equipmentIds`.
- Reusar lógica existente de creación:
  - extraer servicio interno común para evitar duplicidad.
- Respuesta uniforme:
  - `ApiResponse<ReservationResponse>`.
- Códigos de error consistentes:
  - `SPACE_ALREADY_RESERVED`
  - `EQUIPMENT_UNAVAILABLE`
  - `VALIDATION_ERROR`

### 5.6 Bookings-service: HU-03 Admin reschedule
- Nuevo endpoint:
  - `PUT /bookings/admin/reservations/{id}/reschedule`
- Validar estados elegibles:
  - `pending`, `confirmed`.
- Corregir query de solapamiento:
  - excluir `reservationId` en la validación.
- Validar disponibilidad de equipos asociados en nueva franja.
- Garantizar atomicidad:
  - si falla una validación, no persistir cambios.
- Crear auditoría de reprogramación:
  - tabla `reservation_reschedule_audit`.

### 5.7 Auth-service: soporte autocompletado usuario
- Endpoint admin:
  - `GET /auth/admin/users/search?q=&limit=`
- Búsqueda por:
  - nombre
  - apellido (si aplica)
  - correo

### 5.8 DoD Sprint 2
- Tests de contrato para endpoints admin.
- Tests de negocio:
  - éxito
  - conflicto espacio
  - conflicto equipos
  - estado no elegible
- Tests de auditoría de reprogramación.

---

## Sprint 3: Frontend admin y endurecimiento

### 5.9 Frontend: autorización y navegación por rol
- Extender `ProtectedRoute`:
  - aceptar `requiredRoles`.
- Añadir rutas admin:
  - `/admin/reservations`
- Mostrar/ocultar navegación en `Header` según rol.

### 5.10 Frontend: reutilización de código existente
- Reusar componentes:
  - `ReservationModal` para creación manual admin (añadiendo selector de usuario).
  - `UpdateReservationModal` para reprogramación admin.
  - `ReservationList` + filtros para consulta admin.
- Reusar arquitectura hexagonal:
  - agregar `AdminReservationRepository` (o ampliar `IReservationRepository` con operaciones admin).
  - agregar casos de uso admin sin romper casos de uso actuales.

### 5.11 Observabilidad y operación
- Logs estructurados para acciones admin:
  - `actorId`, `action`, `reservationId`, `before`, `after`, timestamp.
- Métricas operativas:
  - conflictos de horario
  - conflictos de equipos
  - tasa de 403
  - latencia p95 endpoints admin

### 5.12 DoD Sprint 3
- E2E:
  - admin crea reserva para tercero.
  - admin reprograma reserva ajena.
  - usuario estándar no accede al módulo admin.
- Validación UX:
  - mensajes de error/éxito definidos en HU refactor.
- Regresión completa de flujos existentes.

## 6. Contratos API mínimos (objetivo)

### 6.1 Endpoints nuevos
- `POST /bookings/admin/reservations`
- `PUT /bookings/admin/reservations/{id}/reschedule`
- `GET /auth/admin/users/search?q=...`

### 6.2 JWT (claim recomendado)
```json
{
  "sub": "123",
  "email": "usuario@dominio.com",
  "roles": ["USER", "ADMIN"]
}
```

## 7. Riesgos y mitigaciones

### 7.1 Riesgo: regresión transversal en autenticación
- **Mitigación:** rollout por feature flag y pruebas de contrato por servicio.

### 7.2 Riesgo: inconsistencia de autorización entre microservicios
- **Mitigación:** estandarizar parsing de JWT y matriz de permisos única por endpoint.

### 7.3 Riesgo: deuda técnica en validación de solape
- **Mitigación:** refactor inmediato de query para excluir reserva actual + test específico.

### 7.4 Riesgo: acoplamiento fuerte del frontend a localStorage
- **Mitigación:** centralizar sesión/rol en hook de auth y usar guard declarativo por rol.

## 8. Criterios de éxito
- 100% de endpoints admin protegidos por rol.
- 0 regresiones críticas en flujo de usuario estándar.
- HU-02 y HU-03 admin cumplidas de extremo a extremo.
- Auditoría disponible y consultable para reprogramaciones admin.
- Cobertura de pruebas de seguridad y negocio suficiente para despliegue controlado.

## 9. Backlog técnico sugerido (resumen)
- Épica 1: RBAC Foundation (DB + JWT + SecurityConfig).
- Épica 2: Admin Booking APIs (crear/reprogramar + auditoría).
- Épica 3: Admin Frontend Module (rutas, guard, UI reutilizada).
- Épica 4: Hardening (observabilidad, e2e, regresión, documentación operativa).

