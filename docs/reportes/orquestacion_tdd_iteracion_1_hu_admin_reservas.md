# Orquestación TDD — Iteración 1

## HU analizada
- HU-01 Consultar reservas desde el módulo administrador.
- HU-02 Crear reserva manual desde el módulo administrador.
- HU-03 Reprogramar reserva desde el módulo administrador.
- Código revisado:
- Backend: `Backend/services/bookings-service`.
- Frontend: `Frontend/src` (validación de contexto admin).

## Alcance de esta iteración
### Qué sí se atacará en esta primera fase Red
- Primer lote enfocado en **HU-02 backend**.
- Prioridad en reglas críticas:
- conflicto por solapamiento,
- mensajes funcionales exactos,
- estado inicial,
- persistencia/no persistencia.

### Qué quedará fuera por ahora
- HU-01 completa:
- filtros por fecha de ejecución/sede/usuario,
- paginación de 20,
- orden por fecha de ejecución descendente,
- mensaje exacto sin resultados,
- consistencia listado-detalle.
- HU-03 completa:
- elegibilidad por estado,
- conflicto de espacio y equipos asociados,
- conservación de datos originales,
- auditoría del cambio.
- Frontend administrativo:
- no hay evidencia clara de flujo administrativo dedicado en código actual.

## Reglas de negocio detectadas

| HU | Regla | Criticidad | Observabilidad | Notas |
|---|---|---|---|---|
| HU-02 | Crear reserva manual con usuario, espacio, fecha, hora inicio y hora fin | Alta | Parcial | Existe creación, pero no está explícita como flujo admin completo. |
| HU-02 | Estado inicial `Confirmada` | Alta | Parcial | Backend maneja estado técnico `confirmed`; validar equivalencia funcional. |
| HU-02 | Bloqueo por solapamiento total/parcial en el mismo espacio | Alta | Sí | Existe validación de solapamiento, pendiente alinear mensaje exacto HU. |
| HU-02 | Mensaje funcional exacto de conflicto | Alta | No | El texto actual no coincide literal con HU. |
| HU-02 | Intervalos de 15 minutos | Alta | No | No hay validación explícita en backend actual. |
| HU-01 | Filtros por fecha ejecución, estado, sede y usuario | Alta | No | Query actual soporta `userId`, `spaceId`, `status` únicamente. |
| HU-01 | Paginación 20 y orden por fecha ejecución descendente | Alta | No | No hay paginación; orden actual por `created_at`. |
| HU-03 | Reprogramación elegible solo `Pendiente`/`Confirmada` | Alta | No | No existe caso de uso de reprogramación admin dedicado. |
| HU-03 | Conflicto de equipos y auditoría mínima | Alta | No | No existe flujo específico de auditoría de reprogramación. |

## Estrategia de pruebas

| HU | Componente probable | Capa | Tipo de prueba | Motivo |
|---|---|---|---|---|
| HU-02 | `BookingApplicationService.createReservation` | backend-aplicación | unitaria | Validar reglas de negocio críticas y mensajes. |
| HU-02 | `BookingController` + `GlobalExceptionHandler` | backend-web | integración | Verificar contrato HTTP y mensaje funcional exacto. |
| HU-02 | `JdbcBookingPersistenceAdapter` | backend-integración | integración | Confirmar persistencia y no persistencia según resultado. |
| HU-01 | servicio/listado + adapter de persistencia | backend-aplicación/integración | unitaria/integración | Preparado para iteración siguiente. |
| HU-03 | caso de uso de reprogramación + persistencia/auditoría | backend-aplicación/integración | unitaria/integración | Preparado para iteración siguiente. |

## Separación propuesta
### Backend
- unitarias:
- Rechazo por solapamiento con mensaje funcional exacto.
- Estado inicial al crear reserva.
- Intervalos de 15 minutos.
- integración:
- `POST /bookings/reservations` retorna conflicto con mensaje exacto HU.
- No persistencia cuando hay conflicto de horario.

## Riesgos y vacíos detectados
- No existe contrato backend completo para consulta administrativa HU-01.
- No existe paginación backend de 20 resultados por página.
- No existe caso de uso de reprogramación administrativa HU-03.
- No existe auditoría de reprogramación con los campos mínimos solicitados.
- Mensajes funcionales de HU no están alineados de forma literal en creación actual.
- Ambigüedad semántica entre estado funcional (`Confirmada`) y estado técnico (`confirmed`).
- Frontend actual representa principalmente flujo de usuario final (`/my-reservations`), no módulo admin explícito.

## Primer lote recomendado para fase Red

1. **HU:** HU-02  
   **Nombre sugerido de prueba:** `shouldRejectManualReservationWhenOverlapsWithActiveReservation_usingExactFunctionalMessage`  
   **Capa:** backend-aplicación  
   **Tipo:** unitaria  
   **Regla cubierta:** bloqueo por solapamiento + mensaje exacto de conflicto  
   **Motivo de priorización:** conflicto crítico de negocio y contrato funcional obligatorio.

2. **HU:** HU-02  
   **Nombre sugerido de prueba:** `shouldNotPersistManualReservationWhenOverlapConflictOccurs`  
   **Capa:** backend-aplicación  
   **Tipo:** unitaria  
   **Regla cubierta:** no persistencia al fallar por conflicto  
   **Motivo de priorización:** garantiza integridad y evita efectos colaterales.

3. **HU:** HU-02  
   **Nombre sugerido de prueba:** `shouldCreateManualReservationWithInitialStatusConfirmedWhenSlotIsAvailable`  
   **Capa:** backend-aplicación  
   **Tipo:** unitaria  
   **Regla cubierta:** estado inicial `Confirmada`  
   **Motivo de priorización:** regla base del flujo exitoso.

4. **HU:** HU-02  
   **Nombre sugerido de prueba:** `shouldRejectManualReservationWhenTimeRangeIsNotIn15MinuteIntervals`  
   **Capa:** backend-aplicación  
   **Tipo:** unitaria  
   **Regla cubierta:** intervalos de 15 minutos  
   **Motivo de priorización:** validación obligatoria con brecha actual.

5. **HU:** HU-02  
   **Nombre sugerido de prueba:** `shouldReturn409WithExactConflictMessageOnCreateReservationEndpoint`  
   **Capa:** backend-web  
   **Tipo:** integración  
   **Regla cubierta:** mensaje exacto en respuesta HTTP  
   **Motivo de priorización:** asegura comportamiento observable para cliente/UI.

## Entrega para el agente Red
- HU a tomar: **HU-02 únicamente**.
- Orden sugerido de escritura de pruebas:
1. `shouldRejectManualReservationWhenOverlapsWithActiveReservation_usingExactFunctionalMessage`
2. `shouldNotPersistManualReservationWhenOverlapConflictOccurs`
3. `shouldReturn409WithExactConflictMessageOnCreateReservationEndpoint`
4. `shouldCreateManualReservationWithInitialStatusConfirmedWhenSlotIsAvailable`
5. `shouldRejectManualReservationWhenTimeRangeIsNotIn15MinuteIntervals`

- Qué no debe intentar todavía:
- Implementar Green o Refactor.
- Expandir a HU-01 o HU-03.
- Cubrir frontend administrativo sin contrato admin explícito.

- Supuestos que debe respetar:
- Fuente de verdad funcional: HU-02 refactor.
- Mensaje exacto de conflicto requerido: `El espacio seleccionado ya se encuentra reservado en este horario`.
- Equivalencia temporal estado funcional/técnico: `Confirmada` ↔ `confirmed` (hasta definición de contrato de presentación).
- En conflicto no se debe persistir una nueva reserva.

## Evidencia de brechas observadas en código actual
- `ListReservationsQuery` no modela fecha ejecución, sede ni paginación.
- Orden actual de listado en persistencia: `ORDER BY created_at DESC` (no por fecha de ejecución).
- No existe método/caso de uso específico para reprogramación admin con auditoría.
- No existe validación explícita de intervalos de 15 minutos en creación backend.
