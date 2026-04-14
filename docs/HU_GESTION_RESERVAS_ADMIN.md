# HU: Gestion de reservas desde modulo administrador

## 1. Titulo
Gestion de reservas desde modulo administrador

## 2. Narrativa (Como / Quiero-Necesito / Para)
**COMO usuario administrador de operaciones, NECESITO crear, editar, cancelar, reasignar y consultar reservas PARA garantizar continuidad operativa, resolver incidencias y optimizar la ocupacion de recursos.**

## 3. Objetivo de negocio
Centralizar la operacion de reservas en un modulo administrativo con trazabilidad completa, reduccion de tiempos de gestion y menor tasa de errores operativos.

## 4. Alcance
- Listado de reservas con filtros por fecha, estado, sede/recurso y usuario.
- Vista de detalle de reserva con historial de cambios.
- Creacion manual de reserva por parte del administrador.
- Edicion y reprogramacion con validacion de disponibilidad.
- Cancelacion con motivo obligatorio.
- Reasignacion de reserva a otro usuario o recurso.
- Registro de auditoria por cada accion administrativa.

## 5. Fuera de alcance
- Creacion automatica de reservas por reglas de IA.
- Integraciones con facturacion o pagos.
- Notificaciones omnicanal avanzadas (SMS/WhatsApp).

## 6. Definition of Ready (DoR)
La HU puede pasar a desarrollo cuando:
- Existe mockup aprobado del modulo administrador (listado, detalle, formulario y confirmaciones).
- Estan definidos estados de reserva y transiciones permitidas.
- Existe diagrama de decision para conflictos de horario/solape.
- Estan definidos perfiles y permisos (admin, supervisor, solo lectura).
- QA tiene matriz de casos funcionales y de borde.
- Estan definidos eventos de analitica y campos de auditoria obligatorios.

## 7. Escenarios detallados (BDD)

### Escenario 1: Creacion manual de reserva exitosa
**Dado** que el administrador ingresa al modulo y selecciona "Nueva reserva"  
**Y** diligencia usuario, recurso, fecha y franja horaria disponible  
**Cuando** confirma la creacion  
**Entonces** el sistema registra la reserva en estado "Confirmada"  
**Y** muestra mensaje de exito  
**Y** guarda trazabilidad de la accion.

### Escenario 2: Intento de crear reserva con solape
**Dado** que el administrador diligencia una franja ya ocupada para el mismo recurso  
**Cuando** intenta guardar  
**Entonces** el sistema bloquea la operacion  
**Y** muestra mensaje de conflicto de disponibilidad  
**Y** sugiere franjas alternativas disponibles.

### Escenario 3: Cancelacion de reserva con motivo obligatorio
**Dado** que el administrador abre una reserva activa  
**Cuando** selecciona "Cancelar" sin registrar motivo  
**Entonces** el sistema no permite confirmar la cancelacion  
**Y** solicita motivo obligatorio.

### Escenario 4: Reasignacion de reserva
**Dado** que existe una reserva activa  
**Y** el administrador selecciona nuevo recurso o nuevo usuario valido  
**Cuando** confirma la reasignacion  
**Entonces** el sistema actualiza la reserva  
**Y** registra en auditoria el valor anterior y el nuevo valor.

## 8. Flujos y artefactos visuales
- Mockup 1: Listado administrativo con filtros.
- Mockup 2: Detalle de reserva con historial.
- Mockup 3: Formulario de creacion/edicion.
- Mockup 4: Modal de cancelacion con motivo.
- Diagrama de decision: disponibilidad, solapes, bloqueos operativos y reglas de transicion.
- Flujo de navegacion:
  1. Dashboard administrador
  2. Modulo de reservas
  3. Listado + filtros
  4. Detalle / Crear / Editar / Cancelar / Reasignar
  5. Confirmacion y auditoria

## 9. Recursos y contenidos requeridos (sin dependencias)
- Catalogo de estados de reserva y transiciones validas.
- Catalogo de motivos de cancelacion.
- Mensajes UX de error y exito:
  - "No hay disponibilidad para el horario seleccionado."
  - "Debes registrar un motivo de cancelacion."
  - "Reserva actualizada correctamente."
- Matriz de permisos por rol.
- Datos semilla para QA (usuarios, recursos, horarios, reservas en cada estado).
- Checklist de auditoria (quien, que, cuando, valor anterior, valor nuevo).

## 10. Metricas de exito y etiquetado

### Metricas de exito
- Tiempo promedio de gestion por reserva <= 2 minutos.
- Reduccion de errores operativos de reserva >= 30%.
- Porcentaje de conflictos resueltos por reasignacion >= 80%.
- Trazabilidad completa en acciones administrativas = 100%.

### Etiquetado para seguimiento (analytics)
- `admin_reservas_list_viewed`
- `admin_reserva_created`
- `admin_reserva_updated`
- `admin_reserva_canceled`
- `admin_reserva_reassigned`
- `admin_reserva_conflict_detected`
- `admin_reserva_action_denied_by_permission`

## 11. Criterios de aceptacion
- El modulo permite filtrar reservas por fecha, estado, usuario y recurso.
- El administrador puede consultar detalle e historial de cambios de una reserva.
- El sistema valida disponibilidad antes de crear o reprogramar una reserva.
- El sistema bloquea operaciones con solape y muestra mensaje claro.
- La cancelacion requiere motivo obligatorio.
- La reasignacion solo se permite si el nuevo recurso/horario esta disponible.
- Cada accion administrativa genera registro de auditoria completo.
- El sistema respeta la matriz de permisos por rol.
- Los mensajes de exito/error son consistentes con el catalogo definido.
- Los eventos de analitica se registran en cada hito operativo.

## 12. Definition of Done (DoD)
La HU se considera terminada cuando:
- Todos los criterios de aceptacion pasan validacion QA.
- Estan cubiertos escenarios de exito, error, permisos y conflictos de disponibilidad.
- Se valida auditoria en creacion, edicion, cancelacion y reasignacion.
- Se verifica instrumentacion de eventos de analitica en entorno de pruebas.
- Documentacion funcional y de QA queda actualizada.
- Product Owner y operaciones aprueban el flujo en staging.
- La HU queda en estado "Done" con evidencias adjuntas.

## 13. Riesgos y supuestos
- Supuesto: los calendarios de disponibilidad estan actualizados en tiempo real.
- Riesgo: reglas de negocio incompletas para transiciones excepcionales.
- Riesgo: permisos mal configurados podrian permitir acciones no autorizadas.
