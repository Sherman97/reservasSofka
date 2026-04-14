# HU-01 (Refactor). Consultar reservas desde el módulo administrador

## 1) Narrativa
Como usuario administrador del sistema, quiero consultar las reservas registradas mediante listados, filtros y vista de detalle, para dar seguimiento a la operación y tomar decisiones oportunas sobre los espacios y recursos.

## 2) Objetivos
Centralizar la consulta administrativa de reservas, facilitando la búsqueda, trazabilidad y revisión del estado de cada reserva.

## 3) Alcance
- Listado paginado de reservas registradas en el sistema.
- Filtros por rango de fechas de las reservas (`desde`/`hasta`), estado, sede y usuario.
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
- Estén definidos los estados de reserva del sistema para uso en el filtro.

## 6) DoD (Definición de Hecho)
- Todos los criterios de aceptación pasan validación de QA.
- Se validan filtros combinados y visualización de resultados.
- Se valida acceso al detalle de una reserva existente.
- Se valida comportamiento cuando no hay resultados.
- Las pruebas asociadas a la consulta se encuentran ejecutadas y aprobadas.

## 7) Definiciones Funcionales
- **Fecha de filtro:** aplica a la **fecha de ejecución de la reserva**, no a la fecha de creación.
- **Estados disponibles en filtro:** `Pendiente`, `Confirmada`, `Cancelada`, `Finalizada`.
- **Ordenamiento por defecto:** fecha de ejecución descendente (más próximas o recientes primero).
- **Paginación:** 20 resultados por página.
- **Campos mínimos del listado:** ID reserva, usuario (nombre), sede, espacio, fecha de ejecución, hora inicio, hora fin, estado.
- **Campos mínimos del detalle:** ID reserva, usuario (nombre y correo), sede, espacio reservado, fecha de ejecución, hora inicio, hora fin, equipos/insumos asociados, estado actual, observaciones (si existen), fecha de creación.
- **Sin resultados:** cuando una combinación de filtros no retorne datos, mostrar mensaje: `No se encontraron reservas con los filtros aplicados`.

## 8) Criterios de Aceptación
- El módulo permite listar reservas registradas en formato paginado.
- El administrador puede filtrar por rango de fechas de ejecución (`desde`/`hasta`), estado, usuario y sede.
- El filtro de estado solo presenta: `Pendiente`, `Confirmada`, `Cancelada`, `Finalizada`.
- El sistema muestra únicamente los resultados que cumplen los filtros seleccionados.
- El listado se presenta ordenado por fecha de ejecución descendente por defecto.
- El administrador puede consultar el detalle de una reserva.
- El detalle de reserva muestra, como mínimo, los campos funcionales definidos en esta HU.
- El sistema conserva consistencia entre la información del listado y el detalle.
- Si no hay resultados, el sistema muestra el mensaje definido y mantiene los filtros activos.

## 9) Criterios BDD
### Escenario 1: Consulta de reservas usando filtros
- Dado: que el usuario administrador se encuentra autenticado y existen reservas registradas en el sistema.
- Cuando: el administrador filtra por rango de fechas de ejecución, estado, usuario y sede.
- Entonces: el sistema muestra únicamente las reservas que cumplen con los criterios seleccionados.

### Escenario 2: Consulta del detalle de una reserva
- Dado: que el usuario administrador se encuentra autenticado y existe una reserva registrada.
- Cuando: el administrador selecciona ver el detalle de la reserva.
- Entonces: el sistema muestra la información completa de la reserva seleccionada, incluyendo los campos mínimos definidos.

### Escenario 3: Consulta sin resultados
- Dado: que el usuario administrador se encuentra autenticado.
- Cuando: el administrador aplica una combinación de filtros que no coincide con reservas existentes.
- Entonces: el sistema muestra el mensaje `No se encontraron reservas con los filtros aplicados` y no presenta filas en el listado.

### Escenario 4: Navegación de resultados paginados
- Dado: que el usuario administrador se encuentra autenticado y existen más de 20 reservas que cumplen una consulta.
- Cuando: el administrador consulta el listado.
- Entonces: el sistema muestra 20 resultados por página y permite navegar entre páginas conservando filtros y ordenamiento.

## 10) Estimación
| Task | Rol | P. Poker |
|---|---|---|
| Módulo Admin - Consulta | Backend | 3 |
| Módulo Admin - Consulta | Front | 2 |
