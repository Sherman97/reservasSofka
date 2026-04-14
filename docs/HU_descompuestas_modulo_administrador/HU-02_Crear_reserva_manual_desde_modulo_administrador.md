# HU-02. Crear reserva manual desde el módulo administrador

## 1) Narrativa
Como usuario administrador del sistema, quiero crear manualmente una reserva para un usuario, para gestionar solicitudes operativas desde el módulo administrativo manteniendo control sobre la disponibilidad.

## 2) Objetivos
Permitir la creación de reservas manuales por parte del administrador respetando las reglas de disponibilidad definidas.

## 3) Alcance
- Creación manual de reservas desde el módulo administrativo.
- Selección de usuario, locación, fecha y franja horaria.
- Validación de disponibilidad antes del registro.
- Registro exitoso de la reserva cuando no exista conflicto.

## 4) Fuera de Alcance
- Reprogramación de reservas existentes.
- Cancelación individual o masiva.
- Bloqueo de locaciones, insumos, días o franjas horarias.
- Administración de sedes o insumos.

## 5) DoR (Definición de Listo)
- Existan mockups aprobados del formulario de creación.
- Estén definidos los campos obligatorios de la reserva.
- Estén definidos los estados iniciales de la reserva.
- Exista regla clara para validar solapamiento de horario.

## 6) DoD (Definición de Hecho)
- Todos los criterios de aceptación pasan validación de QA.
- Se validan escenarios de éxito y conflicto de disponibilidad.
- Se registra correctamente la nueva reserva en el sistema.
- Las pruebas asociadas a creación se encuentran ejecutadas y aprobadas.

## 7) Criterios de Aceptación
- El administrador puede crear una reserva manual indicando usuario, locación, fecha y franja horaria.
- El sistema valida disponibilidad antes de registrar la reserva.
- El sistema bloquea la creación si existe solapamiento con otra reserva.
- El sistema registra la reserva cuando la franja se encuentra disponible.
- El sistema no permite crear reservas con datos incompletos.

## 8) Criterios BDD
### Escenario 1: Creación manual de reserva exitosa
- Dado: que el usuario administrador se encuentra autenticado y la locación está disponible en la franja horaria deseada.
- Cuando: el administrador registra una reserva indicando usuario, locación, fecha y franja horaria.
- Entonces: el sistema registra exitosamente la reserva.

### Escenario 2: Intento de creación con conflicto de horario
- Dado: que el usuario administrador se encuentra autenticado y ya existe una reserva para la misma locación, fecha y franja horaria.
- Cuando: el administrador intenta registrar una nueva reserva con esas mismas condiciones.
- Entonces: el sistema bloquea la creación e informa que la franja horaria no está disponible.

## 9) Estimación
| Task | Rol | P. Poker |
|---|---|---|
| Módulo Admin - Creación | Backend | 5 |
| Módulo Admin - Creación | Front | 3 |
