# HU_NOTIFICACIONES — Recordatorios de fin de reserva y vencimiento sin entrega

## 1. Contexto y propósito

Esta HU documenta funcional y técnicamente el desarrollo ya implementado para notificaciones de reservas:

- Recordatorio **15 minutos antes** de finalizar.
- Recordatorio **5 minutos antes** de finalizar.
- Alerta de **10 minutos después** del fin cuando la reserva no se ha devuelto/cerrado.

La notificación se entrega por **WebSocket (STOMP)** y el frontend la muestra en la vista de reservas.

---

## 2. Definición de rol, objetivo y beneficio

En la estructura de HU:

- **Rol (Como...)**: quién obtiene valor directo de la funcionalidad.
- **Objetivo (Quiero...)**: la capacidad concreta que se habilita.
- **Beneficio (Para...)**: impacto de negocio/operación esperado.

Aplicado a esta HU:

- **Rol**: usuario autenticado que creó una reserva.
- **Objetivo**: recibir recordatorios de proximidad y vencimiento de su reserva.
- **Beneficio**: reducir retrasos en entrega/devolución y mejorar cumplimiento operativo.

---

## 3. Historia de Usuario

**ID sugerido:** HU-28 (extensión de Épica 5: Notificaciones en Tiempo Real)

**Como** usuario autenticado con una reserva activa,  
**quiero** recibir alertas en tiempo real cuando falten 15 y 5 minutos para finalizar mi reserva, y una alerta si pasan 10 minutos después del fin sin devolución,  
**para** gestionar oportunamente la entrega/devolución del espacio y evitar incumplimientos.

---

## 4. Alcance funcional implementado (estado actual)

### 4.1 Backend (notifications-service)

- Consume eventos RabbitMQ de reservas:
  - `bookings.reservation.created`
  - `bookings.reservation.delivered`
  - `bookings.reservation.cancelled`
  - `bookings.reservation.returned`
- Construye estado temporal en memoria por `reservationId`.
- Job programado cada `30s` (configurable) evalúa umbrales y publica:
  - `notifications.reservation.reminder.15m`
  - `notifications.reservation.reminder.5m`
  - `notifications.reservation.reminder.overdue.10m`
- Limpia recordatorios al recibir `cancelled` o `returned`.
- Limpia estado vencido > 1 día después de `endAt`.

### 4.2 Frontend

- Conecta STOMP a `/notifications/ws`.
- Se suscribe a topics de reminder:
  - `/topic/notifications.reservation.reminder.15m`
  - `/topic/notifications.reservation.reminder.5m`
  - `/topic/notifications.reservation.reminder.overdue.10m`
- Muestra alertas en `MyReservationsPage` mediante `ReminderAlertBanner`.
- Permite descartar una alerta y limpiar todas.
- Evita duplicados por combinación `(reservationId, tipo)`.

---

## 5. Reglas de negocio (derivadas del código)

1. Se genera alerta de 15m cuando `now >= endAt - 15m` y no se ha enviado antes.
2. Se genera alerta de 5m cuando `now >= endAt - 5m` y no se ha enviado antes.
3. Se genera alerta de vencimiento cuando `now >= endAt + 10m` y no se ha enviado antes.
4. Cada tipo de alerta se emite **máximo una vez por reserva**.
5. Una reserva cancelada elimina su estado de recordatorios.
6. Una reserva devuelta elimina su estado de recordatorios.
7. Si el payload de evento no trae `reservationId`, `userId`, `spaceId` o `endAt` válidos, no se agenda recordatorio.
8. Los tiempos se calculan con `Instant` (base UTC, sin zona de negocio explícita en esta lógica).
9. El backend publica a topics STOMP globales (`/topic/...`) del servicio de notificaciones.
10. El frontend renderiza mensaje recibido; si no viene mensaje, usa mensaje por defecto por tipo.

---

## 6. Criterios de aceptación (Gherkin)

```gherkin
Característica: Notificaciones de fin de reserva

  Escenario: Programar recordatorios al crear reserva
    Dado un evento "bookings.reservation.created" con reservationId, userId, spaceId y endAt válidos
    Cuando el notifications-service procesa el evento
    Entonces la reserva queda registrada para evaluación de recordatorios

  Escenario: Envío de recordatorio 15 minutos antes
    Dada una reserva registrada con endAt
    Y faltan 15 minutos o menos para endAt
    Cuando corre el scheduler de recordatorios
    Entonces se publica el evento "notifications.reservation.reminder.15m"
    Y la alerta incluye reservationId, userId, spaceId, endAt y minutesLeft=15

  Escenario: Envío de recordatorio 5 minutos antes
    Dada una reserva registrada con endAt
    Y faltan 5 minutos o menos para endAt
    Cuando corre el scheduler de recordatorios
    Entonces se publica el evento "notifications.reservation.reminder.5m"
    Y la alerta incluye reservationId, userId, spaceId, endAt y minutesLeft=5

  Escenario: Envío de alerta vencida 10 minutos después
    Dada una reserva registrada con endAt
    Y han pasado 10 minutos o más desde endAt
    Cuando corre el scheduler de recordatorios
    Entonces se publica el evento "notifications.reservation.reminder.overdue.10m"
    Y la alerta incluye reservationId, userId, spaceId, endAt y minutesOverdue=10

  Escenario: No duplicar recordatorios por tipo
    Dada una reserva para la que ya se emitió recordatorio de 15 minutos
    Cuando corre nuevamente el scheduler
    Entonces no se vuelve a publicar otro recordatorio de 15 minutos para esa reserva

  Escenario: Cancelación detiene recordatorios
    Dada una reserva registrada para recordatorios
    Cuando llega un evento "bookings.reservation.cancelled" de esa reserva
    Entonces se elimina el estado de recordatorios
    Y no se publican alertas futuras de esa reserva

  Escenario: Devolución detiene recordatorios
    Dada una reserva registrada para recordatorios
    Cuando llega un evento "bookings.reservation.returned" de esa reserva
    Entonces se elimina el estado de recordatorios
    Y no se publican alertas futuras de esa reserva

  Escenario: Frontend muestra alerta en tiempo real
    Dado que el usuario está en "Mis Reservas"
    Y existe conexión STOMP activa al topic de recordatorios
    Cuando llega una notificación de recordatorio
    Entonces se visualiza en el banner con tipo, mensaje y número de reserva

  Escenario: Usuario descarta una alerta
    Dada una alerta visible en el banner
    Cuando el usuario pulsa "descartar"
    Entonces la alerta desaparece del listado visible

  Escenario: Usuario limpia todas las alertas
    Dadas múltiples alertas visibles
    Cuando el usuario pulsa "Limpiar todos"
    Entonces no quedan alertas visibles en el banner
```

---

## 7. NFR (Requisitos no funcionales)

1. **Tiempo de reacción**: el envío depende del scheduler (`30s` por defecto); tolerancia operativa de hasta un ciclo de scheduler.
2. **Confiabilidad de conexión cliente**: WebSocket con `reconnectDelay=5000ms`, heartbeats de `10s`.
3. **Idempotencia funcional**: no se repite una misma alerta por reserva/tipo.
4. **Resiliencia ante payload inválido**: eventos inválidos se descartan sin romper el flujo.
5. **Escalabilidad actual**: estado de recordatorios en memoria (`ConcurrentHashMap`), sin persistencia distribuida.
6. **Observabilidad**: eventos y fallos quedan en logs de servicios; no hay auditoría persistente de notificaciones.

---

## 8. Casos de prueba (existentes y recomendados)

## 8.1 Backend (automatizados existentes)

- `ReservationReminderApplicationServiceTest`
  - envío 15m y no duplicación
  - envío 5m + overdue 10m
  - limpieza por cancelación y devolución
  - descarte de payload inválido
  - no envío antes de umbrales
- `RabbitMqEventListenerTest`
  - delegación a broadcast + reminder service

## 8.2 Frontend (automatizados existentes)

- `useReminderAlerts.test.ts`
  - suscripción a 3 topics
  - creación de alertas por tipo
  - mensajes por defecto
  - deduplicación
  - dismiss y clear-all
- `ReminderAlertBanner.test.jsx`
  - render por tipo (`15m`, `5m`, `overdue`)
  - estilos, iconos, badges
  - acciones de descartar/limpiar

## 8.3 Casos E2E recomendados (faltantes)

1. Crear reserva con `endAt = now + 14m` y validar alerta `15m` en UI.
2. Esperar transición a ventana `5m` y validar segunda alerta.
3. No devolver reserva y validar alerta `overdue 10m`.
4. Cancelar reserva antes de umbral y validar ausencia de nuevas alertas.
5. Devolver reserva antes de umbral y validar ausencia de nuevas alertas.

---

## 9. Trazabilidad técnica

- Backend reminders:
  - `Backend/services/notifications-service/src/main/java/com/reservas/sk/notifications_service/application/service/ReservationReminderApplicationService.java`
- Listener Rabbit:
  - `Backend/services/notifications-service/src/main/java/com/reservas/sk/notifications_service/adapters/in/rabbit/RabbitEventListenerAdapter.java`
- Publicación WebSocket:
  - `Backend/services/notifications-service/src/main/java/com/reservas/sk/notifications_service/adapters/out/websocket/StompWebSocketBroadcastAdapter.java`
- Config WS/Rabbit:
  - `Backend/services/notifications-service/src/main/java/com/reservas/sk/notifications_service/infrastructure/config/WebSocketConfig.java`
  - `Backend/services/notifications-service/src/main/resources/application.properties`
- Frontend hook y banner:
  - `Frontend/src/core/adapters/hooks/useReminderAlerts.ts`
  - `Frontend/src/ui/components/reservations/ReminderAlertBanner.jsx`
  - `Frontend/src/ui/pages/reservations/MyReservationsPage.jsx`

---

## 10. Brechas detectadas frente al criterio "solo usuario creador"

1. El backend publica recordatorios en topics globales (`/topic/...`) sin segmentación por usuario.
2. El hook frontend `useReminderAlerts` no filtra por `userId` del payload.
3. Resultado: funcionalmente el flujo de recordatorio existe, pero la restricción estricta "solo creador" no queda garantizada de extremo a extremo en la implementación actual.

---

## 11. Criterio de completitud de HU

La HU se considera completa cuando:

1. Los 3 hitos temporales (15m, 5m, +10m) están operativos y validados.
2. Las reglas de no duplicación y limpieza por cancelación/devolución se cumplen.
3. El frontend muestra alertas en tiempo real y permite gestión básica (descartar/limpiar).
4. Se garantiza segmentación por usuario creador (pendiente de ajuste técnico según brecha identificada).
