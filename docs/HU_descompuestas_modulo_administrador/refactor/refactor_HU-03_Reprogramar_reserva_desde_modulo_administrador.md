# HU-03 (Refactor). Reprogramar reserva desde el módulo administrador

## 1) Narrativa
Como usuario administrador del sistema, quiero reprogramar una reserva existente, para ajustar la operación sin perder control sobre la disponibilidad de locaciones y recursos asociados.

## 2) Objetivos
Permitir la modificación de fecha y franja horaria de una reserva existente validando conflictos de espacio y equipos antes de aplicar el cambio.

## 3) Alcance
- Reprogramación de fecha, hora de inicio y hora de fin de reservas elegibles.
- Validación de disponibilidad del espacio para la nueva franja.
- Validación de disponibilidad de equipos asociados a la reserva original (si aplica).
- Conservación de la información original cuando el cambio no sea válido.
- Actualización exitosa cuando no exista conflicto.
- Registro de auditoría básica del cambio realizado por administrador.

## 4) Fuera de Alcance
- Creación de nuevas reservas.
- Cancelación de reservas.
- Bloqueo de locaciones, insumos, días o franjas horarias.
- Cambio de usuario titular de la reserva.
- Modificación del listado de equipos asociados durante esta operación (solo se valida disponibilidad de los ya asociados).

## 5) DoR (Definición de Listo)
- Existan mockups aprobados para la edición o reprogramación.
- Estén definidos los estados de reserva que permiten reprogramación.
- Exista regla clara para conflicto de horario de espacio y equipos.
- Estén definidos los permisos del rol administrador para modificar reservas.
- Estén definidos mensajes funcionales de éxito y error.

## 6) DoD (Definición de Hecho)
- Todos los criterios de aceptación pasan validación de QA.
- Se validan escenarios de éxito y conflicto de horario del espacio.
- Se validan escenarios de conflicto de equipos asociados.
- El sistema conserva la información original cuando la actualización es rechazada.
- Se registra evento de auditoría con fecha/hora, administrador y valores previos/nuevos.
- Las pruebas asociadas a reprogramación se encuentran ejecutadas y aprobadas.

## 7) Definiciones Funcionales
- **Estados elegibles para reprogramación:** `Pendiente`, `Confirmada`.
- **Estados no elegibles:** `Cancelada`, `Finalizada`.
- **Comportamiento en estado no elegible:** bloquear operación y mostrar modal con `La reserva no puede reprogramarse en su estado actual`.
- **Selección de tiempo:** `hora_inicio` y `hora_fin` con intervalos de 15 minutos.
- **Regla de solapamiento de espacio:** no se permite reprogramar si existe otra reserva activa del mismo espacio que se cruce total o parcialmente en el nuevo rango.
- **Regla de equipos asociados:** si la reserva tiene equipos asociados, todos deben estar disponibles en la nueva fecha y franja para permitir la reprogramación.
- **Conflicto de equipos:** si uno o más equipos no están disponibles, se bloquea la reprogramación y se informa cuáles presentan conflicto.
- **Mensaje por conflicto de espacio (modal):** `La franja horaria seleccionada ya no está disponible para el espacio`.
- **Mensaje por conflicto de equipos (modal):** `No es posible reprogramar porque uno o más equipos asociados no están disponibles`.
- **Mensaje de éxito:** toast no bloqueante con `Reserva reprogramada exitosamente`.
- **Auditoría mínima:** id de reserva, valores anteriores (fecha/hora), valores nuevos (fecha/hora), id de administrador, fecha/hora del cambio.

## 8) Criterios de Aceptación
- El administrador puede modificar fecha, hora de inicio y hora de fin de una reserva en estado `Pendiente` o `Confirmada`.
- El sistema bloquea la reprogramación para reservas en estado `Cancelada` o `Finalizada`.
- El sistema valida disponibilidad del espacio antes de confirmar la reprogramación.
- Si existe conflicto de horario del espacio, el sistema bloquea la operación y muestra `La franja horaria seleccionada ya no está disponible para el espacio`.
- Si la reserva tiene equipos asociados, el sistema valida su disponibilidad en la nueva franja.
- Si existe conflicto en uno o más equipos asociados, el sistema bloquea la operación y muestra `No es posible reprogramar porque uno o más equipos asociados no están disponibles`.
- El sistema actualiza la reserva cuando espacio y equipos (si aplica) se encuentran disponibles.
- El sistema conserva la información original cuando la operación falla.
- Al reprogramar exitosamente, el sistema muestra `Reserva reprogramada exitosamente`.
- La reprogramación deja registro de auditoría con datos previos y nuevos del cambio.

## 9) Criterios BDD
### Escenario 1: Reprogramación exitosa
- Dado: que el usuario administrador se encuentra autenticado, existe una reserva en estado `Confirmada` y la nueva fecha y franja horaria están disponibles para el espacio y equipos asociados.
- Cuando: el administrador reprograma la reserva.
- Entonces: el sistema actualiza la reserva correctamente, muestra `Reserva reprogramada exitosamente` y registra auditoría del cambio.

### Escenario 2: Reprogramación fallida por conflicto de espacio
- Dado: que el usuario administrador se encuentra autenticado, existe una reserva en estado `Pendiente` y la nueva fecha y franja horaria del espacio se encuentran ocupadas.
- Cuando: el administrador intenta reprogramar la reserva.
- Entonces: el sistema bloquea la actualización, muestra `La franja horaria seleccionada ya no está disponible para el espacio` y conserva la información original.

### Escenario 3: Reprogramación fallida por conflicto de equipos
- Dado: que el usuario administrador se encuentra autenticado, existe una reserva en estado `Confirmada` con equipos asociados y uno o más equipos no están disponibles en la nueva franja.
- Cuando: el administrador intenta reprogramar la reserva.
- Entonces: el sistema bloquea la actualización, muestra `No es posible reprogramar porque uno o más equipos asociados no están disponibles` e identifica los equipos en conflicto.

### Escenario 4: Reprogramación rechazada por estado no elegible
- Dado: que el usuario administrador se encuentra autenticado y la reserva se encuentra en estado `Cancelada`.
- Cuando: el administrador intenta reprogramar la reserva.
- Entonces: el sistema bloquea la operación, muestra `La reserva no puede reprogramarse en su estado actual` y no modifica la información existente.

## 10) Estimación
| Task | Rol | P. Poker |
|---|---|---|
| Módulo Admin - Reprogramación | Backend | 5 |
| Módulo Admin - Reprogramación | Front | 3 |
