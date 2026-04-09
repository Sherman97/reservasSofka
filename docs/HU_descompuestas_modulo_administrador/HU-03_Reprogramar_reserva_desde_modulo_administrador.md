# HU-03. Reprogramar reserva desde el módulo administrador

## 1) Narrativa
Como usuario administrador del sistema, quiero reprogramar una reserva existente, para ajustar la operación sin perder control sobre la disponibilidad de locaciones.

## 2) Objetivos
Permitir la modificación de fecha y franja horaria de una reserva existente validando conflictos antes de aplicar el cambio.

## 3) Alcance
- Reprogramación de fecha y franja horaria de reservas activas.
- Validación de disponibilidad para la nueva franja.
- Conservación de la información original cuando el cambio no sea válido.
- Actualización exitosa cuando no exista conflicto.

## 4) Fuera de Alcance
- Creación de nuevas reservas.
- Cancelación de reservas.
- Bloqueo de locaciones, insumos, días o franjas horarias.
- Cambios sobre reservas finalizadas por fuera de las reglas definidas.

## 5) DoR (Definición de Listo)
- Existan mockups aprobados para la edición o reprogramación.
- Estén definidos los estados de reserva que permiten reprogramación.
- Exista regla clara para conflicto de horario.
- Estén definidos los permisos del rol administrador para modificar reservas.

## 6) DoD (Definición de Hecho)
- Todos los criterios de aceptación pasan validación de QA.
- Se validan escenarios de éxito y conflicto de horario.
- El sistema conserva la información original cuando la actualización es rechazada.
- Las pruebas asociadas a reprogramación se encuentran ejecutadas y aprobadas.

## 7) Criterios de Aceptación
- El administrador puede modificar la fecha y franja de una reserva activa.
- El sistema valida disponibilidad antes de confirmar la reprogramación.
- El sistema bloquea la reprogramación si existe conflicto de horario.
- El sistema actualiza la reserva cuando la nueva franja está disponible.
- El sistema conserva la información original cuando la operación falla.

## 8) Criterios BDD
### Escenario 1: Reprogramación exitosa
- Dado: que el usuario administrador se encuentra autenticado, existe una reserva activa y la nueva fecha y franja horaria están disponibles.
- Cuando: el administrador reprograma la reserva.
- Entonces: el sistema actualiza la reserva correctamente.

### Escenario 2: Reprogramación fallida por conflicto
- Dado: que el usuario administrador se encuentra autenticado, existe una reserva activa y la nueva fecha y franja horaria se encuentran ocupadas.
- Cuando: el administrador intenta reprogramar la reserva.
- Entonces: el sistema bloquea la actualización, informa el conflicto y conserva la información original.

## 9) Estimación
| Task | Rol | P. Poker |
|---|---|---|
| Módulo Admin - Reprogramación | Backend | 5 |
| Módulo Admin - Reprogramación | Front | 3 |
