# HU-01. Consultar reservas desde el módulo administrador

## 1) Narrativa
Como usuario administrador del sistema, quiero consultar las reservas registradas mediante listados, filtros y vista de detalle, para dar seguimiento a la operación y tomar decisiones oportunas sobre los espacios y recursos.

## 2) Objetivos
Centralizar la consulta administrativa de reservas, facilitando la búsqueda, trazabilidad y revisión del estado de cada reserva.

## 3) Alcance
- Listado de reservas registradas en el sistema.
- Filtros por fecha, estado, sede y usuario.
- Visualización del detalle completo de una reserva.
- Consulta de resultados con información suficiente para revisión administrativa.

## 4) Fuera de Alcance
- Creación de reservas.
- Reprogramación o edición de reservas.
- Cancelación individual o masiva.
- Bloqueo de locaciones, insumos, días o franjas horarias.

## 5) DoR (Definición de Listo)
- Existan mockups aprobados del listado y detalle de reservas.
- Estén definidos los campos visibles en la grilla y en el detalle.
- Estén definidos los filtros disponibles para la consulta.
- Estén definidos los perfiles y permisos del rol administrador.

## 6) DoD (Definición de Hecho)
- Todos los criterios de aceptación pasan validación de QA.
- Se validan filtros combinados y visualización de resultados.
- Se valida acceso al detalle de una reserva existente.
- Las pruebas asociadas a la consulta se encuentran ejecutadas y aprobadas.

## 7) Criterios de Aceptación
- El módulo permite listar reservas registradas.
- El administrador puede filtrar por fecha, estado, usuario y sede.
- El sistema muestra únicamente los resultados que cumplen los filtros seleccionados.
- El administrador puede consultar el detalle de una reserva.
- El sistema conserva consistencia entre la información del listado y el detalle.

## 8) Criterios BDD
### Escenario 1: Consulta de reservas usando filtros
- Dado: que el usuario administrador se encuentra autenticado y existen reservas registradas en el sistema.
- Cuando: el administrador filtra por fecha, estado, usuario y sede.
- Entonces: el sistema muestra únicamente las reservas que cumplen con los criterios seleccionados.

### Escenario 2: Consulta del detalle de una reserva
- Dado: que el usuario administrador se encuentra autenticado y existe una reserva registrada.
- Cuando: el administrador selecciona ver el detalle de la reserva.
- Entonces: el sistema muestra la información completa de la reserva seleccionada.

## 9) Estimación
| Task | Rol | P. Poker |
|---|---|---|
| Módulo Admin - Consulta | Backend | 3 |
| Módulo Admin - Consulta | Front | 2 |
