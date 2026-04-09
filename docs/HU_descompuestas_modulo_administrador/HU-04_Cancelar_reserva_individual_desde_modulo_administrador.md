# HU-04. Cancelar reserva individual desde el módulo administrador

## 1) Narrativa
Como usuario administrador del sistema, quiero cancelar una reserva individual con motivo obligatorio, para gestionar cambios operativos asegurando trazabilidad y control del proceso.

## 2) Objetivos
Permitir la cancelación individual de reservas respetando reglas de negocio y exigiendo justificación de la operación.

## 3) Alcance
- Cancelación individual de reservas activas.
- Ingreso obligatorio de motivo o justificación.
- Validación de restricción cuando la franja ya inició.
- Actualización del estado a cancelada cuando la operación es válida.

## 4) Fuera de Alcance
- Cancelación masiva.
- Creación o reprogramación de reservas.
- Bloqueo de locaciones, insumos, días o franjas horarias.
- Gestión de políticas de notificación fuera del flujo de cancelación individual.

## 5) DoR (Definición de Listo)
- Existan mockups aprobados para el flujo de cancelación.
- Esté definido el campo de motivo como obligatorio.
- Estén definidas las reglas sobre reservas que ya iniciaron.
- Estén definidos los permisos del rol administrador para cancelar.

## 6) DoD (Definición de Hecho)
- Todos los criterios de aceptación pasan validación de QA.
- Se validan escenarios de éxito, ausencia de motivo y restricción por inicio de franja.
- El estado de la reserva cambia correctamente a cancelada cuando aplica.
- Las pruebas asociadas a cancelación individual se encuentran ejecutadas y aprobadas.

## 7) Criterios de Aceptación
- El administrador puede cancelar una reserva activa ingresando un motivo obligatorio.
- El sistema no permite completar la cancelación si no se registra motivo.
- El sistema no permite cancelar una reserva cuya franja horaria ya inició.
- El sistema cambia el estado a cancelada cuando la operación es válida.
- El sistema informa claramente la causa cuando la cancelación es rechazada.

## 8) Criterios BDD
### Escenario 1: Cancelación individual exitosa
- Dado: que el usuario administrador se encuentra autenticado y existe una reserva activa.
- Cuando: el administrador cancela la reserva e ingresa un motivo obligatorio.
- Entonces: el sistema cambia el estado de la reserva a cancelada.

### Escenario 2: Cancelación rechazada por no ingresar motivo
- Dado: que el usuario administrador se encuentra autenticado y existe una reserva activa.
- Cuando: el administrador intenta cancelar la reserva sin ingresar el motivo.
- Entonces: el sistema no permite completar la cancelación e indica que el motivo es obligatorio.

### Escenario 3: Cancelación no permitida de una reserva ya iniciada
- Dado: que el usuario administrador se encuentra autenticado y existe una reserva activa cuya franja horaria ya inició.
- Cuando: el administrador intenta cancelar la reserva.
- Entonces: el sistema bloquea la operación e informa que la reserva no puede cancelarse porque ya inició.

## 9) Estimación
| Task | Rol | P. Poker |
|---|---|---|
| Módulo Admin - Cancelación individual | Backend | 4 |
| Módulo Admin - Cancelación individual | Front | 2 |
