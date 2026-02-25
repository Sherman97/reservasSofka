# Pecados capitales

> Auditoria hostil de arquitectura backend  
> Foco: `SRP` y `DIP`  
> Cobertura: `Backend/services/*` + `Backend/docker-compose.yml`

## Lectura rapida

| Nivel | Significado |
|---|---|
| CRITICO | Riesgo arquitectonico inmediato. Bloquea escalabilidad real. |
| ALTO | Deuda grave. Incrementa regresiones y costo de cambio. |
| MEDIO | Deuda recurrente. Penaliza consistencia y mantenibilidad. |

## Juicio final
- Esto no esta operando como microservicios autonomos.
- Esta operando como un **monolito distribuido** con base de datos compartida y acoplamientos directos.
- Si no se corrige, cada feature nueva sera mas lenta, mas fragil y mas costosa.

---

## Los 7 pecados del backend

### 1. Soberbia del Gateway (quiere ser Router + DBA) [CRITICO]
**Servicio:** `api-gateway`

**Evidencia**
- `Backend/services/api-gateway/src/server.js:24`
- `Backend/services/api-gateway/src/server.js:30`
- `Backend/docker-compose.yml:112`
- `Backend/services/api-gateway/package.json:22`

**Pecado**
- El gateway inicializa esquema de base de datos (`initializeDatabase`) y se acopla a `mysql2`.

**Violacion SOLID**
- `SRP`: el gateway no deberia administrar infraestructura de datos.
- `DIP`: depende de implementacion concreta de DB.

**Penitencia (mitigacion)**
- Mover bootstrap/migraciones a proceso dedicado (`migration-runner`, CI/CD, init container).
- Quitar `mysql2`, volumen `/database` y `DB_*` del gateway.

---

### 2. Avaricia de responsabilidades en Auth [ALTO]
**Servicio:** `auth-service`

**Evidencia**
- `Backend/services/auth-service/src/services/auth.service.js:24`
- `Backend/services/auth-service/src/services/auth.service.js:46`
- `Backend/services/auth-service/src/services/auth.service.js:74`
- `Backend/services/auth-service/src/services/auth.service.js:106`

**Pecado**
- Un solo archivo valida input, consulta SQL, hashea passwords, firma JWT, serializa respuesta y gestiona errores.

**Violacion SOLID**
- `SRP`: demasiadas razones de cambio en una unidad.

**Penitencia (mitigacion)**
- Separar en:
- `AuthUseCase`
- `UserRepository`
- `PasswordHasher` (adapter)
- `TokenIssuer` (adapter)
- `UserMapper/Presenter`

---

### 3. Gula de concretos en la capa de dominio [ALTO]
**Servicios:** `auth-service`, `bookings-service`

**Evidencia**
- `Backend/services/auth-service/src/services/auth.service.js:1`
- `Backend/services/auth-service/src/services/auth.service.js:2`
- `Backend/services/auth-service/src/services/auth.service.js:3`
- `Backend/services/bookings-service/src/services/bookings.service.js:2`
- `Backend/services/bookings-service/src/services/bookings.service.js:90`

**Pecado**
- Casos de uso acoplados a `bcrypt`, `jsonwebtoken`, `mysql2` y SQL embebido.

**Violacion SOLID**
- `DIP`: el alto nivel depende de detalles, no de abstracciones.

**Penitencia (mitigacion)**
- Introducir puertos (`IUserRepository`, `ITokenIssuer`, `IBookingRepository`) e inyeccion en composicion.

---

### 4. Lujuria por cruzar fronteras de dominio [CRITICO]
**Servicio:** `inventory-service`

**Evidencia**
- `Backend/services/inventory-service/src/services/locationItems.service.js:11`
- `Backend/services/inventory-service/src/services/locationItems.service.js:78`
- `Backend/services/inventory-service/src/services/locationItems.service.js:124`

**Pecado**
- Inventory consulta y hace join directo contra tabla `locations` (contexto ajeno) por DB compartida.

**Violacion SOLID**
- `SRP`: rompe limites de responsabilidad por contexto.
- `DIP`: dependencia dura al schema interno de otro servicio.

**Penitencia (mitigacion)**
- Consumir `locations-service` por API/cliente interno.
- Si necesitas lectura local, usar proyecciones/eventos, no joins cross-context.

---

### 5. Ira del God Service en Bookings [CRITICO]
**Servicio:** `bookings-service`

**Evidencia**
- `Backend/services/bookings-service/src/services/bookings.service.js:10`
- `Backend/services/bookings-service/src/services/bookings.service.js:65`
- `Backend/services/bookings-service/src/services/bookings.service.js:178`
- `Backend/services/bookings-service/src/services/bookings.service.js:265`

**Pecado**
- Un archivo concentra parseo, validaciones, politicas de conflicto, transacciones, consultas y serializacion.

**Violacion SOLID**
- `SRP`: cohesion baja, acoplamiento alto.

**Penitencia (mitigacion)**
- Dividir en `CreateBookingUseCase`, `AvailabilityService`, `BookingRepository`, `BookingPolicy`.

---

### 6. Pereza operativa en configuracion y migraciones [ALTO]
**Servicios:** `bookings-service`, `inventory-service`, `database`

**Evidencia**
- `Backend/services/bookings-service/src/db.js:6`
- `Backend/services/inventory-service/src/db.js:6`
- `Backend/services/database/src/schema.sql:39`
- `Backend/services/database/migrations/002-inventory-booking-adjust.sql:18`
- `Backend/services/database/migrations/003-inventory-is-reservable.sql:1`
- `Backend/services/database/migrations/004-location-inventory-upsert.sql:23`

**Pecado**
- Fallback de puertos DB incorrectos (`3003` y `3005`).
- Baseline de schema inconsistente con lo que el codigo asume (`qty`).
- Migraciones con `USE app_db` fijo y un paso no idempotente real.

**Violacion SOLID**
- `SRP` operativo: configuracion/migracion sin responsabilidad clara ni pipeline robusto.
- `DIP`: configuracion atada a valores concretos.

**Penitencia (mitigacion)**
- Corregir `DB_PORT` a `3306`.
- Publicar schema baseline coherente.
- Migraciones parametrizadas e idempotentes.

---

### 7. Envidia de arquitectura: microservicio fantasma [CRITICO]
**Servicio:** `locations-service`

**Evidencia**
- `Backend/services/locations-service/package.json:1`
- `Backend/services/locations-service/package.json:7`
- `Backend/services/api-gateway/src/server.js:21`
- `Backend/services/api-gateway/docker-compose.yml:69`

**Pecado**
- Se enruta y despliega un servicio sin implementacion real (`src`, scripts de arranque funcionales).

**Violacion SOLID**
- `SRP` arquitectonica: frontera definida pero no ejecutable.

**Penitencia (mitigacion)**
- Implementar minimo viable (`health`, CRUD base) o retirarlo de gateway/compose hasta completar.

---

## Pecados adicionales (transversales)

### Duplicacion de middleware JWT [MEDIO]
**Evidencia**
- `Backend/services/auth-service/src/middlewares/auth.middleware.js:3`
- `Backend/services/bookings-service/src/middlewares/auth.middleware.js:7`
- `Backend/services/inventory-service/src/middlewares/auth.middleware.js:3`

**Mitigacion**
- Libreria compartida o validacion central con contratos claros de claims.

### Manejo de errores inconsistente [MEDIO]
**Evidencia**
- `Backend/services/auth-service/src/controllers/auth.controller.js:7`
- `Backend/services/bookings-service/src/controllers/bookings.controller.js:67`
- `Backend/services/inventory-service/src/controllers/items.controller.js:48`
- `Backend/services/inventory-service/src/controllers/locationItems.controller.js:37`

**Mitigacion**
- Estandarizar error handler global y excepciones tipadas por servicio.

---

## Plan de expiacion (orden recomendado)
1. Sacar inicializacion DB del gateway y corregir `DB_PORT` por defecto (`bookings`, `inventory`).
2. Cortar acoplamientos cross-context por DB (joins a tablas ajenas).
3. Refactor fuerte de `bookings.service.js` y `auth.service.js` hacia casos de uso + puertos + adapters.
4. Unificar autenticacion/autorizacion y manejo de errores.
5. Formalizar pipeline de migraciones: baseline consistente + idempotencia real.
6. Implementar o eliminar temporalmente `locations-service` de runtime.

## Sentencia
La deuda tecnica es **alta** y estructural.  
No se esta violando SOLID por accidente puntual: se esta violando por patron repetido de diseno.