# Matriz de Casos de Prueba Priorizada

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo | Implementación |
|---|---|---|---|---|---|---|---|---|---|
| BK-01 | bookings | App Service | `createReservation` exitoso publica evento y libera lock | Unit | P0 | M | Faltante | Implementar | ❌ |
| BK-02 | bookings | App Service | conflicto por solape (`OVERLAPPING_RESERVATION`) | Unit | P0 | M | Parcial | Completar | ❌ |
| BK-03 | bookings | App Service | lock timeout (`SPACE_LOCK_TIMEOUT`) | Unit | P0 | S | Cubierto | Mantener | ✔️ |
| BK-04 | bookings | App Service | usuario inexistente | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| BK-05 | bookings | App Service | espacio inexistente | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| BK-06 | bookings | Web | POST `/reservations` 201 payload ok | WebMvc | P0 | M | Faltante | Implementar | ❌ |
| BK-07 | bookings | Web | POST `/reservations` 400 validación DTO | WebMvc | P0 | S | Faltante | Implementar | ❌ |
| BK-08 | bookings | Persistence | `countOverlappingReservations` con rangos límite | Jdbc/Jpa | P1 | M | Faltante | Implementar | ❌ |

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo |
|---|---|---|---|---|---|---|---|---|
| AU-01 | auth | App Service | `register` exitoso hash + token + evento | Unit | P0 | M | Faltante | Implementar | ❌ |
| AU-02 | auth | App Service | `login` exitoso credenciales válidas | Unit | P0 | M | Faltante | Implementar | ❌ |
| AU-03 | auth | App Service | email ya registrado | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| AU-04 | auth | App Service | credenciales inválidas | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| AU-05 | auth | Web | POST `/auth/register` 201 + contrato respuesta | WebMvc | P0 | M | Cubierto | Mantener | ✔️ |
| AU-06 | auth | Web | POST `/auth/login` 401 error code correcto | WebMvc | P1 | S | Cubierto | Mantener | ✔️ |
| AU-07 | auth | Security | filtro JWT: token válido/inválido | Unit/Web slice | P1 | M | Faltante | Implementar | ❌ |
| AU-08 | auth | Persistence | adapter usuario find/save/exists | Data/Jdbc | P1 | M | Faltante | Implementar | ❌ |

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo | Implementación |
|---|---|---|---|---|---|---|---|---|---|
| LO-01 | locations | App Service | `createCity` exitoso + evento | Unit | P0 | S | Cubierto | Mantener | ✔️ |
| LO-02 | locations | App Service | `createSpace` exitoso + evento | Unit | P0 | S | Cubierto | Mantener | ✔️ |
| LO-03 | locations | App Service | `updateCity` not found | Unit | P1 | S | Parcial | Completar | ❌ |
| LO-04 | locations | App Service | `deleteCity` not found | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| LO-05 | locations | Web | POST `/cities` 201 y 400 validación | WebMvc | P0 | M | Cubierto | Mantener | ✔️ |
| LO-06 | locations | Web | POST `/spaces` 404 city not found | WebMvc | P1 | S | Cubierto | Mantener | ✔️ |
| LO-07 | locations | Persistence | CRUD ciudad/espacio + filtros | Jdbc/Jpa | P1 | M | Faltante | Implementar | ❌ |

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo |
|---|---|---|---|---|---|---|---|---|
| IN-01 | inventory | App Service | `createEquipment` éxito normaliza datos y evento | Unit | P0 | S | Cubierto | Mantener | ✔️ |
| IN-02 | inventory | App Service | city inexistente | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| IN-03 | inventory | Web | POST `/equipments` validación body | WebMvc/MockMvc | P1 | S | Cubierto | Mantener | ✔️ |
| IN-04 | inventory | Web | GET `/equipments/{id}` not found | WebMvc/MockMvc | P1 | S | Cubierto | Mantener | ✔️ |
| IN-05 | inventory | Persistence | filtros city/status en listado | Jdbc | P1 | S | Cubierto | Mantener | ✔️ |
| IN-06 | inventory | Security | JWT filter paths protegidos | Unit/Web slice | P2 | M | Faltante | Implementar | ❌ |

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo | Implementación |
|---|---|---|---|---|---|---|---|---|---|
| NO-01 | notifications | App Service | notifica 15/5 min antes | Unit | P0 | S | Cubierto | Mantener | ✔️ |
| NO-02 | notifications | App Service | reintentos en falla (3 intentos) | Unit | P0 | S | Cubierto | Mantener | ✔️ |
| NO-03 | notifications | App Service | no notificar cancelada/modificada | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| NO-04 | notifications | App Service | horario laboral determinista con `Clock` | Unit | P1 | M | Débil | Refactor + test | ❌ |
| NO-05 | notifications | Adapter Out | websocket broadcast payload | Unit/Integration | P1 | M | Faltante | Implementar | ❌ |
| NO-06 | notifications | Rabbit In | consume evento y dispara servicio | Integration slice | P2 | M | Faltante | Implementar | ❌ |

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo |
|---|---|---|---|---|---|---|---|---|
| AG-01 | api-gateway | Smoke | `contextLoads` real (`@SpringBootTest`) | Integration | P1 | S | Placeholder | Reemplazar |
| AG-02 | api-gateway | Web | health endpoint 200 | WebMvc | P2 | S | Faltante | Implementar |
| AG-03 | api-gateway | Routing/Security | rutas protegidas/no protegidas | Web slice | P2 | M | Faltante | Implementar |

## Backlog transversal

| ID | Tema | Caso | Prioridad | Objetivo |
|---|---|---|---|---|
| TR-01 | Calidad test | Eliminar `applicationTestPlaceholder` en todos los servicios | P0 | Cero tests vacíos |
| TR-02 | Cobertura | JaCoCo agregado multi-módulo + reporte HTML | P0 | Medición real |
| TR-03 | CI Gate | Umbral inicial `line>=25%`, `branch>=15%` | P0 | Evitar regresión |
| TR-04 | Estabilidad | Sustituir `now()` por `Clock` inyectable en lógica temporal | P1 | Evitar flaky tests |
| TR-05 | Fortalecer asserts | Quitar asserts débiles (`atLeast(0)`, solo `assertDoesNotThrow`) | P1 | Mayor valor |
