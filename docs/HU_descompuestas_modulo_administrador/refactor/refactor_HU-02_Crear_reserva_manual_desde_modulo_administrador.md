# HU-02 (Refactor). Crear reserva manual desde el módulo administrador

## 1) Narrativa
Como usuario administrador del sistema, quiero crear manualmente una reserva para un usuario, para gestionar solicitudes operativas desde el módulo administrativo manteniendo control sobre la disponibilidad.

## 2) Objetivos
Permitir la creación de reservas manuales por parte del administrador respetando las reglas de disponibilidad definidas y dejando trazabilidad clara de la operación.

## 3) Alcance
- Creación manual de reservas desde el módulo administrativo.
- Selección de usuario mediante búsqueda con autocompletado.
- Selección de locación, fecha, hora de inicio y hora de fin.
- Validación de disponibilidad antes del registro (sin solapamiento en el mismo espacio).
- Registro exitoso de la reserva cuando no exista conflicto.
- Asignación automática de estado inicial al crear la reserva.

## 4) Fuera de Alcance
- Reprogramación de reservas existentes.
- Cancelación individual o masiva.
- Bloqueo de locaciones, insumos, días o franjas horarias.
- Administración de sedes o insumos.
- Asociación de equipos/insumos opcionales durante la creación manual (se define en una HU independiente).

## 5) DoR (Definición de Listo)
- Existan mockups aprobados del formulario de creación.
- Estén definidos los campos obligatorios de la reserva.
- Esté definido el estado inicial de la reserva creada por administrador.
- Exista regla clara para validar solapamiento de horario.
- Estén definidos los mensajes de éxito y error de la operación.

## 6) DoD (Definición de Hecho)
- Todos los criterios de aceptación pasan validación de QA.
- Se validan escenarios de éxito, datos incompletos y conflicto de disponibilidad.
- Se registra correctamente la nueva reserva en el sistema con estado inicial definido.
- Se validan mensajes funcionales de error y éxito en la UI.
- Las pruebas asociadas a creación se encuentran ejecutadas y aprobadas.

## 7) Definiciones Funcionales
- **Selección de usuario:** campo de búsqueda con autocompletado por nombre, apellido o correo electrónico.
- **Selección de tiempo:** el administrador debe seleccionar `hora_inicio` y `hora_fin` con intervalos de 15 minutos.
- **Regla de solapamiento:** no se permite registrar una reserva si existe otra reserva activa del mismo espacio que se cruce total o parcialmente en el rango de tiempo.
- **Mensajes de error de validación:** se muestran en línea debajo de los campos con problema.
- **Mensaje por conflicto de horario:** `El espacio seleccionado ya se encuentra reservado en este horario`.
- **Mensaje de éxito:** notificación tipo toast no bloqueante con el texto `Reserva creada exitosamente`.
- **Estado inicial de la reserva creada por administrador:** `Confirmada`.
- **Campos obligatorios mínimos:** usuario, locación/espacio, fecha, hora de inicio y hora de fin.

## 8) Criterios de Aceptación
- El administrador puede crear una reserva manual indicando usuario, locación, fecha, hora de inicio y hora de fin.
- El usuario de la reserva se selecciona mediante un campo de búsqueda con autocompletado.
- El sistema valida disponibilidad antes de registrar la reserva.
- El sistema bloquea la creación si existe solapamiento con otra reserva activa del mismo espacio.
- Al existir conflicto de horario, el sistema muestra el mensaje `El espacio seleccionado ya se encuentra reservado en este horario`.
- El sistema no permite crear reservas con datos incompletos y muestra errores en línea por campo.
- Cuando la creación es exitosa, el sistema registra la reserva con estado inicial `Confirmada`.
- Al crear exitosamente, el sistema muestra el mensaje `Reserva creada exitosamente`.

## 9) Criterios BDD
### Escenario 1: Creación manual de reserva exitosa
- Dado: que el usuario administrador se encuentra autenticado y el espacio está disponible en la fecha y rango horario deseado.
- Cuando: el administrador registra una reserva indicando usuario, locación, fecha, hora de inicio y hora de fin.
- Entonces: el sistema registra exitosamente la reserva, la deja en estado `Confirmada` y muestra `Reserva creada exitosamente`.

### Escenario 2: Intento de creación con conflicto de horario
- Dado: que el usuario administrador se encuentra autenticado y ya existe una reserva activa para la misma locación, fecha y un rango horario solapado.
- Cuando: el administrador intenta registrar una nueva reserva con esas mismas condiciones de espacio y cruce horario.
- Entonces: el sistema bloquea la creación y muestra `El espacio seleccionado ya se encuentra reservado en este horario`.

### Escenario 3: Intento de creación con datos incompletos
- Dado: que el usuario administrador se encuentra autenticado.
- Cuando: el administrador intenta registrar una reserva sin completar uno o más campos obligatorios.
- Entonces: el sistema no registra la reserva y muestra mensajes de validación en línea en los campos faltantes o inválidos.

## 10) Estimación
| Task | Rol | P. Poker |
|---|---|---|
| Módulo Admin - Creación | Backend | 5 |
| Módulo Admin - Creación | Front | 3 |
