# HU-05. Cancelación masiva de reservas desde el módulo administrador

## 1) Narrativa
Como usuario administrador del sistema, quiero cancelar varias reservas en una sola operación, para responder con agilidad a situaciones operativas que afectan múltiples reservas.

## 2) Objetivos
Permitir la cancelación masiva de reservas seleccionadas bajo reglas claras y consistentes.

## 3) Alcance
- Selección múltiple de reservas activas.
- Ingreso obligatorio de motivo para la operación masiva.
- Cancelación de reservas válidas incluidas en la selección.
- Respuesta del sistema con resultado de la operación.

## 4) Fuera de Alcance
- Cancelación individual.
- Creación o reprogramación de reservas.
- Bloqueo de locaciones, insumos, días o franjas horarias.
- Edición detallada de cada reserva durante el flujo masivo.

## 5) DoR (Definición de Listo)
- Existan mockups aprobados para selección múltiple y confirmación.
- Esté definido el comportamiento de la operación ante reglas no válidas.
- Esté definido el campo de motivo como obligatorio.
- Estén definidos permisos del rol administrador para cancelación masiva.

## 6) DoD (Definición de Hecho)
- Todos los criterios de aceptación pasan validación de QA.
- Se validan escenarios de éxito y rechazo por ausencia de motivo.
- El sistema actualiza correctamente el estado de las reservas afectadas.
- Las pruebas asociadas a cancelación masiva se encuentran ejecutadas y aprobadas.

## 7) Criterios de Aceptación
- El administrador puede seleccionar varias reservas activas para cancelar.
- El sistema exige motivo obligatorio para ejecutar la cancelación masiva.
- El sistema cancela las reservas seleccionadas cuando la operación es válida.
- El sistema actualiza el estado de las reservas afectadas a cancelada.
- El sistema informa el resultado de la operación masiva.

## 8) Criterios BDD
### Escenario 1: Cancelación masiva exitosa
- Dado: que el usuario administrador se encuentra autenticado y existen múltiples reservas activas.
- Cuando: el administrador selecciona varias reservas e ingresa un motivo de cancelación.
- Entonces: el sistema cancela las reservas seleccionadas y actualiza su estado a cancelada.

### Escenario 2: Cancelación masiva rechazada por no ingresar motivo
- Dado: que el usuario administrador se encuentra autenticado y existen múltiples reservas activas seleccionadas.
- Cuando: el administrador intenta ejecutar la cancelación masiva sin registrar motivo.
- Entonces: el sistema rechaza la operación e indica que el motivo es obligatorio.

## 9) Estimación
| Task | Rol | P. Poker |
|---|---|---|
| Módulo Admin - Cancelación masiva | Backend | 5 |
| Módulo Admin - Cancelación masiva | Front | 3 |
