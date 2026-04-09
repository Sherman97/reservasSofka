# HU-06. Notificación y auditoría de cambios en reservas

## 1) Narrativa
Como usuario administrador del sistema, quiero que las acciones administrativas sobre reservas queden auditadas y generen notificación al usuario afectado, para garantizar trazabilidad y comunicación de los cambios.

## 2) Objetivos
Registrar evidencia de las acciones administrativas y notificar al usuario final cuando una reserva sea creada, modificada o cancelada.

## 3) Alcance
- Registro de auditoría sobre creación, reprogramación y cancelación.
- Identificación de la acción realizada y del actor responsable.
- Notificación al usuario final cuando la reserva sea creada, modificada o cancelada.
- Disponibilidad de trazabilidad para revisión administrativa.

## 4) Fuera de Alcance
- Definición de nuevos canales de comunicación no aprobados por el proyecto.
- Gestión de plantillas avanzadas de mensajería.
- Bloqueo de locaciones, insumos, días o franjas horarias.
- Operaciones administrativas distintas a reservas.

## 5) DoR (Definición de Listo)
- Esté definido el modelo de auditoría requerido para reservas.
- Estén definidas las acciones que deben generar trazabilidad.
- Esté definido el mecanismo de notificación aprobado para el usuario final.
- Existan reglas claras sobre eventos que disparan auditoría y notificación.

## 6) DoD (Definición de Hecho)
- Todos los criterios de aceptación pasan validación de QA.
- Se verifica registro de auditoría en cada acción definida.
- Se verifica generación de notificación en los eventos configurados.
- Las pruebas funcionales y técnicas asociadas se encuentran ejecutadas y aprobadas.

## 7) Criterios de Aceptación
- Cada acción administrativa sobre reservas queda registrada para auditoría.
- El sistema registra al menos la acción ejecutada, la reserva afectada y el actor responsable.
- El sistema notifica al usuario final cuando la reserva es creada, modificada o cancelada.
- El registro de auditoría puede consultarse para trazabilidad.
- Las notificaciones solo se generan en eventos válidos definidos por el negocio.

## 8) Criterios BDD
### Escenario 1: Registro de auditoría por cambio administrativo
- Dado: que el usuario administrador ejecuta una acción válida sobre una reserva.
- Cuando: el sistema procesa la creación, reprogramación o cancelación.
- Entonces: el sistema registra la acción en la auditoría con la información necesaria para trazabilidad.

### Escenario 2: Notificación al usuario por cambio en su reserva
- Dado: que una reserva del usuario final fue creada, modificada o cancelada por una operación administrativa.
- Cuando: el sistema confirma la operación.
- Entonces: el sistema envía una notificación al usuario afectado informando el cambio realizado.

## 9) Estimación
| Task | Rol | P. Poker |
|---|---|---|
| Servicios transversales | Backend | 5 |
| Servicios transversales | Front | 2 |
