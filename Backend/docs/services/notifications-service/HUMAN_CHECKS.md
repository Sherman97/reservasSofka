# Human Checks - Notifications Service

Fecha: 2026-03-02
Alcance: tests en `services/notifications-service/src/test/java`

## HC-NT-01 - Alineacion arquitectonica en tests de aplicacion

Estado: `OK (ajustado manualmente)`

Observacion:
- Parte de los tests generados por Copilot tendia a validar solo comportamiento superficial.
- Se reforzo el enfoque hexagonal probando servicios de aplicacion contra puertos de salida mockeados.

Evidencia:
- `application/service/EventBroadcastApplicationServiceTest` prueba `EventBroadcastApplicationService` usando `WebSocketBroadcastPort` mock.
- `application/service/ReservationReminderApplicationServiceTest` prueba `ReservationReminderApplicationService` usando `WebSocketBroadcastPort` mock.

Valor QA:
- Se verifica contrato de salida por puerto, no detalles de infraestructura.

## HC-NT-02 - Correccion de malas practicas con tiempo (`now()`)

Estado: `OK (corregido en InAppNotificationService)`

Observacion:
- Uso directo de tiempo del sistema (`now()`) genera pruebas no deterministas/flaky.
- Se inyecto `Clock` en el servicio para controlar el tiempo en pruebas.

Evidencia:
- `src/main/java/com/reservas/sk/notifications_service/application/service/InAppNotificationService.java`
  - Constructor con `Clock`.
  - Metodo interno `now()` basado en `LocalDateTime.now(clock)`.
- `src/test/java/com/reservas/sk/notifications_service/application/service/InAppNotificationServiceTest.java`
  - Uso de `Clock.fixed(...)` para escenarios deterministas.

Valor QA:
- Reproducibilidad de pruebas.
- Menor sensibilidad a zona horaria y a la hora de ejecucion.

## HC-NT-03 - Deuda tecnica detectada (tiempo en reminders)

Estado: `PENDIENTE`

Observacion:
- `ReservationReminderApplicationService` aun usa `Instant.now()` directo en `publishReminders()`.
- Los tests actuales pasan, pero existe riesgo de fragilidad temporal.

Evidencia:
- `src/main/java/com/reservas/sk/notifications_service/application/service/ReservationReminderApplicationService.java` (`Instant now = Instant.now();`)

Recomendacion:
- Inyectar `Clock` tambien en `ReservationReminderApplicationService`.
- Ajustar tests para usar `Clock.fixed(...)` y eliminar dependencia de reloj real.

