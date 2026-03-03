# Matriz de Casos de Prueba Priorizada

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo | Implementación |
|---|---|---|---|---|---|---|---|---|---|
| BK-01 | bookings | App Service | `createReservation` exitoso publica evento y libera lock | Unit | P0 | M | Cubierto (ajustado) | Mantener | ✔️ |
| BK-02 | bookings | App Service | conflicto por solape (`OVERLAPPING_RESERVATION`) | Unit | P0 | M | Cubierto (ajustado) | Mantener | ✔️ |
| BK-03 | bookings | App Service | lock timeout (`SPACE_LOCK_TIMEOUT`) | Unit | P0 | S | Cubierto (ajustado) | Mantener | ✔️ |
| BK-04 | bookings | App Service | usuario inexistente | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| BK-05 | bookings | App Service | espacio inexistente | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| BK-06 | bookings | Web | POST `/reservations` 201 payload ok | WebMvc | P0 | M | Cubierto | Mantener | ✔️ |
| BK-07 | bookings | Web | POST `/reservations` 400 validación DTO | WebMvc | P0 | S | Cubierto | Mantener | ✔️ |
| BK-08 | bookings | Persistence | `countOverlappingReservations` con rangos límite | Jdbc/Jpa | P1 | M | Cubierto (verificado) | Mantener | ✔️ |
| BK-09 | bookings | App Service | validaciones de equipos (`NOT_FOUND`, `UNAVAILABLE`, `OUTSIDE_CITY`) | Unit | P0 | M | Cubierto (nuevo) | Mantener | ✔️ |
| BK-10 | bookings | App Service | `cancel/deliver/return` con estados inválidos y happy path | Unit | P0 | M | Cubierto (nuevo) | Mantener | ✔️ |
| BK-11 | bookings | Persistence | CRUD reserva + equipos + handover logs + filtros | Jdbc | P0 | L | Cubierto (nuevo) | Mantener | ✔️ |
| BK-12 | bookings | Security | `JwtTokenAdapter` parse + init error | Unit | P1 | S | Cubierto (nuevo) | Mantener | ✔️ |
| BK-13 | bookings | Security | `JwtAuthenticationFilter` token válido/inválido | Unit | P1 | S | Cubierto (nuevo) | Mantener | ✔️ |
| BK-14 | bookings | Exception | `GlobalExceptionHandler` rutas comunes + fallback code | Unit | P1 | M | Cubierto (nuevo) | Mantener | ✔️ |

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo | Implementación |
|---|---|---|---|---|---|---|---|---|---|
| AU-01 | auth | App Service | `register` exitoso hash + token + evento | Unit | P0 | M | Cubierto (verificado) | Mantener | ✔️ |
| AU-02 | auth | App Service | `login` exitoso credenciales válidas | Unit | P0 | M | Cubierto (verificado) | Mantener | ✔️ |
| AU-03 | auth | App Service | email ya registrado | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| AU-04 | auth | App Service | credenciales inválidas | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| AU-05 | auth | Web | POST `/auth/register` 201 + contrato respuesta | WebMvc | P0 | M | Cubierto | Mantener | ✔️ |
| AU-06 | auth | Web | POST `/auth/login` 401 error code correcto | WebMvc | P1 | S | Cubierto | Mantener | ✔️ |
| AU-07 | auth | Security | filtro JWT: token válido/inválido | Unit/Web slice | P1 | M | Cubierto (verificado) | Mantener | ✔️ |
| AU-08 | auth | Persistence | adapter usuario find/save/exists | Data/Jdbc | P1 | M | Cubierto (verificado) | Mantener | ✔️ |
| AU-09 | auth | Security | `JwtTokenAdapter` generate/parse + fallback secret | Unit | P1 | M | Cubierto (nuevo) | Mantener | ✔️ |
| AU-10 | auth | Security | `BcryptPasswordHasherAdapter` hash/matches | Unit | P2 | S | Cubierto (nuevo) | Mantener | ✔️ |
| AU-11 | auth | Exception | `GlobalExceptionHandler` rutas comunes + fallback code | Unit | P1 | M | Cubierto (nuevo) | Mantener | ✔️ |

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo | Implementación |
|---|---|---|---|---|---|---|---|---|---|
| LO-01 | locations | App Service | `createCity` exitoso + evento | Unit | P0 | S | Cubierto | Mantener | ✔️ |
| LO-02 | locations | App Service | `createSpace` exitoso + evento | Unit | P0 | S | Cubierto | Mantener | ✔️ |
| LO-03 | locations | App Service | `updateCity` not found | Unit | P1 | S | Cubierto (verificado) | Mantener | ✔️ |
| LO-04 | locations | App Service | `deleteCity` not found | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| LO-05 | locations | Web | POST `/cities` 201 y 400 validación | WebMvc | P0 | M | Cubierto | Mantener | ✔️ |
| LO-06 | locations | Web | POST `/spaces` 404 city not found | WebMvc | P1 | S | Cubierto | Mantener | ✔️ |
| LO-07 | locations | Persistence | CRUD ciudad/espacio + filtros | Jdbc/Jpa | P1 | M | Cubierto (verificado) | Mantener | ✔️ |
| LO-08 | locations | Web | controller unit: create/list/get/update/delete cities y spaces | Unit | P1 | M | Cubierto (nuevo) | Mantener | ✔️ |
| LO-09 | locations | Messaging | adapters Rabbit/NoOp publican/no fallan | Unit | P2 | S | Cubierto (nuevo) | Mantener | ✔️ |
| LO-10 | locations | App Service | `list/get/update/delete` de spaces + validaciones capacidad/estado | Unit | P1 | M | Cubierto (nuevo) | Mantener | ✔️ |
| LO-11 | locations | Security | `JwtTokenAdapter` parse + init error | Unit | P1 | S | Cubierto (nuevo) | Mantener | ✔️ |
| LO-12 | locations | Security | `JwtAuthenticationFilter` token válido/inválido | Unit | P1 | S | Cubierto (nuevo) | Mantener | ✔️ |
| LO-13 | locations | Exception | `GlobalExceptionHandler` rutas comunes + fallback code | Unit | P1 | M | Cubierto (nuevo) | Mantener | ✔️ |

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo | Implementación |
|---|---|---|---|---|---|---|---|---|---|
| IN-01 | inventory | App Service | `createEquipment` éxito normaliza datos y evento | Unit | P0 | S | Cubierto | Mantener | ✔️ |
| IN-02 | inventory | App Service | city inexistente | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| IN-03 | inventory | Web | POST `/equipments` validación body | WebMvc/MockMvc | P1 | S | Cubierto | Mantener | ✔️ |
| IN-04 | inventory | Web | GET `/equipments/{id}` not found | WebMvc/MockMvc | P1 | S | Cubierto | Mantener | ✔️ |
| IN-05 | inventory | Persistence | filtros city/status en listado | Jdbc | P1 | S | Cubierto | Mantener | ✔️ |
| IN-06 | inventory | Security | JWT filter paths protegidos | Unit/Web slice | P2 | M | Cubierto (verificado) | Mantener | ✔️ |
| IN-07 | inventory | Persistence | adapter JDBC: filtros/operaciones principales | Jdbc | P1 | M | Cubierto (nuevo) | Mantener | ✔️ |
| IN-08 | inventory | App Service | `list/get/update/delete` con validaciones y eventos | Unit | P1 | M | Cubierto (nuevo) | Mantener | ✔️ |
| IN-09 | inventory | Web | controller unit: create/list/get/update/delete | Unit | P2 | S | Cubierto (nuevo) | Mantener | ✔️ |
| IN-10 | inventory | Messaging | adapters Rabbit/NoOp publican/no fallan | Unit | P2 | S | Cubierto (nuevo) | Mantener | ✔️ |
| IN-11 | inventory | Security | `JwtTokenAdapter` parse + init error | Unit | P1 | S | Cubierto (nuevo) | Mantener | ✔️ |
| IN-12 | inventory | Exception | `GlobalExceptionHandler` rutas comunes + fallback code | Unit | P1 | M | Cubierto (nuevo) | Mantener | ✔️ |

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo | Implementación |
|---|---|---|---|---|---|---|---|---|---|
| NO-01 | notifications | App Service | notifica 15/5 min antes | Unit | P0 | S | Cubierto | Mantener | ✔️ |
| NO-02 | notifications | App Service | reintentos en falla (3 intentos) | Unit | P0 | S | Cubierto | Mantener | ✔️ |
| NO-03 | notifications | App Service | no notificar cancelada/modificada | Unit | P1 | S | Cubierto | Mantener | ✔️ |
| NO-04 | notifications | App Service | horario laboral determinista con `Clock` | Unit | P1 | M | Cubierto (implementado) | Mantener | ✔️ |
| NO-05 | notifications | Adapter Out | websocket broadcast payload | Unit/Integration | P1 | M | Cubierto | Mantener | ✔️ |
| NO-06 | notifications | Rabbit In | consume evento y dispara servicio | Integration slice | P2 | M | Cubierto | Mantener | ✔️ |
| NO-07 | notifications | App Service | `EventBroadcast`: mapeo routing key -> channel | Unit | P1 | S | Cubierto (nuevo) | Mantener | ✔️ |
| NO-08 | notifications | App Service | `ReservationReminder`: 15m/5m/overdue/cancel-return cleanup | Unit | P0 | M | Cubierto (nuevo) | Mantener | ✔️ |

| ID | Servicio | Capa | Caso | Tipo | Prioridad | Esfuerzo | Estado actual | Objetivo | Implementación |
|---|---|---|---|---|---|---|---|---|---|
| AG-01 | api-gateway | Smoke | `contextLoads` real (`@SpringBootTest`) | Integration | P1 | S | Cubierto (verificado) | Mantener | ✔️ |
| AG-02 | api-gateway | Web | health endpoint 200 | WebMvc | P2 | S | Cubierto (verificado) | Mantener | ✔️ |
| AG-03 | api-gateway | Routing/Security | rutas protegidas/no protegidas | Web slice | P2 | M | Cubierto (verificado) | Mantener | ✔️ |
| AG-04 | api-gateway | Config | `RouteLocator` carga rutas de gateway correctamente | Integration | P2 | S | Cubierto (nuevo) | Mantener | ✔️ |

## Backlog transversal

| ID | Tema | Caso | Prioridad | Objetivo |
|---|---|---|---|---|
| TR-01 | Calidad test | Eliminar `applicationTestPlaceholder` en todos los servicios | P0 | Cero tests vacíos |
| TR-02 | Cobertura | JaCoCo agregado multi-módulo + reporte HTML | P0 | Medición real |
| TR-03 | CI Gate | Umbral inicial `line>=25%`, `branch>=15%` | P0 | Evitar regresión |
| TR-04 | Estabilidad | Sustituir `now()` por `Clock` inyectable en lógica temporal | P1 | Evitar flaky tests |
| TR-05 | Fortalecer asserts | Quitar asserts débiles (`atLeast(0)`, solo `assertDoesNotThrow`) | P1 | Mayor valor |

## Pruebas nuevas implementadas por servicio

| Servicio | Nuevas pruebas agregadas |
|---|---|
| api-gateway | `adapters/in/web/HealthControllerTest`, `infrastructure/config/GatewayProxyConfigTest` |
| auth-service | `adapters/out/persistence/UserPersistenceAdapterTest`, `adapters/out/security/SecurityAdaptersTest`, `infrastructure/security/JwtAuthenticationFilterTest`, `exception/GlobalExceptionHandlerTest` |
| bookings-service | `adapters/in/web/BookingControllerUnitTest`, `application/service/BookingApplicationServiceTest` (ampliado), `adapters/out/persistence/JdbcBookingPersistenceAdapterTest` (ampliado), `adapters/out/persistence/JdbcBookingPersistenceAdapterUnitTest`, `adapters/out/messaging/*PublisherAdapterTest`, `adapters/out/security/JwtTokenAdapterTest`, `infrastructure/security/JwtAuthenticationFilterTest`, `exception/GlobalExceptionHandlerTest` |
| inventory-service | `adapters/in/web/EquipmentsControllerUnitTest`, `application/service/InventoryApplicationServiceTest` (ampliado), `adapters/out/persistence/JdbcInventoryPersistenceAdapterTest` (ampliado), `adapters/out/messaging/*PublisherAdapterTest`, `adapters/out/security/JwtTokenAdapterTest`, `exception/GlobalExceptionHandlerTest`, `infrastructure/config/SecurityConfigTest` |
| locations-service | `adapters/in/web/LocationsControllerUnitTest`, `application/service/LocationsApplicationServiceTest` (ampliado), `adapters/out/persistence/JdbcLocationsPersistenceAdapterTest` (ampliado), `adapters/out/messaging/*PublisherAdapterTest`, `adapters/out/security/JwtTokenAdapterTest`, `infrastructure/security/JwtAuthenticationFilterTest`, `exception/GlobalExceptionHandlerTest`, ajustes en controladores |
| notifications-service | `application/service/EventBroadcastApplicationServiceTest`, `application/service/ReservationReminderApplicationServiceTest`, ajustes en `InAppNotificationServiceTest` y `RabbitMqEventListenerTest` |

## Métrica global actual

- Cobertura JaCoCo global (`test + jacocoRootReport`): `LINE 92.15%`, `BRANCH 69.09%`, `INSTRUCTION 91.74%`.
