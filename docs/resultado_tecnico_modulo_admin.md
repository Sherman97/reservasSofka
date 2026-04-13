# Análisis Técnico - Módulo de Administración de Reservas
## Feature: Consulta y Creación Manual de Reservas (HU-01 y HU-02)

**Fecha del análisis:** 2026-04-08  
**Scope:** Backend (Bookings-Service) y Frontend (Admin Module)  
**Historias de Usuario:** HU-01 (Consultar Reservas), HU-02 (Crear Reserva Manual)  
**Enfoque:** Análisis SOLID, Patrones de Diseño, y Arquitectura de Implementación

---

## Introducción

Las Historias de Usuario HU-01 y HU-02 conforman el módulo de administración de reservas, permitiendo a administradores del sistema consultar el historial de reservas con filtros avanzados y crear manualmente nuevas reservas respetando restricciones de disponibilidad. Este análisis desglosa los principios SOLID y patrones de diseño implementados en ambas capas (Backend y Frontend).

---

## I. BACKEND - BOOKINGS-SERVICE

### 1. Casos de Uso (Use Cases)

#### 1.1 AdminListReservationsQuery - Query CQRS
**Archivo:** `application/usecase/AdminListReservationsQuery.java`

```java
public record AdminListReservationsQuery(
    String fromExecutionDate,     // Fecha inicio de ejecución
    String toExecutionDate,       // Fecha fin de ejecución
    String status,                // Estado (pending, confirmed, cancelled, completed)
    Long userId,                  // ID de usuario (filtro)
    Long siteId,                  // ID de sede/ciudad (filtro)
    Integer page,                 // Página (0-indexed)
    Integer size                  // Tamaño de página (default 20)
)
```

**Principios SOLID:**

- **S (Single Responsibility):** Responsabilidad única: encapsular parámetros de consulta administrativa.
  - Separación clara entre parámetros de filtrado, paginación y ordenamiento.

- **D (Dependency Inversion):** Record immutable sin dependencias externas.
  - No depende de frameworks, permite testabilidad total.

**Patrón Aplicado: Command Object Pattern**
- Encapsula múltiples parámetros en un objeto cohesivo.
- Facilita transmisión entre capas sin tuplas o mapas desordenados.

**Justificación:**
- Separación clara de responsabilidades: `AdminListReservationsQuery` vs `ListReservationsQuery` (consultas de usuario regular).
- Permite evolución independiente de consultas administrativas sin afectar las regulares.

---

#### 1.2 Procesamiento en BookingApplicationService
**Archivo:** `application/service/BookingApplicationService.java` (métodos: `listAdminReservations()`, `countAdminReservations()`)

```
Flujo de Procesamiento:
1. BookingController recibe parámetros HTTP
2. Construye AdminListReservationsQuery
3. Delega a BookingUseCase.listAdminReservations()
4. BookingApplicationService valida/normaliza:
   - Rangos de fecha
   - Estados válidos (mediante ReservationStatusCatalog)
   - Índices de página
5. Invoca BookingPersistencePort.listAdminReservations()
6. Retorna List<Reservation> sin filtrar (DB ya filtró)
```

**Principios SOLID:**

- **O (Open/Closed):** Abierto a nuevos filtros sin modificación.
  - Nuevos campos de filtro pueden agregarse a `AdminListReservationsQuery` sin cambiar lógica de aplicación.

- **D (Dependency Inversion):** Depende de `BookingPersistencePort`, no de JdbcTemplate directo.

**Patrón Aplicado: Query Object Pattern**
- Encapsula criterios de búsqueda complejos.
- Permite optimización de consultas en capa de persistencia.

---

### 2. Adaptadores HTTP - Input

#### 2.1 BookingController - Endpoint de Consulta Administrativa
**Archivo:** `adapters/in/web/BookingController.java` (líneas 83-114)

```java
@GetMapping("/admin/reservations")
public ApiResponse<AdminReservationsPageResponse> listAdminReservations(
    @RequestParam(required = false) String desde,           // Desde (fecha)
    @RequestParam(required = false) String hasta,           // Hasta (fecha)
    @RequestParam(required = false) String estado,          // Estado (filtro)
    @RequestParam(required = false) Long usuario,           // Usuario ID
    @RequestParam(required = false) Long sede,              // Sede/City ID
    @RequestParam(required = false, defaultValue = "0") Integer page,
    @RequestParam(required = false, defaultValue = "20") Integer size
)
```

**Responsabilidades:**
1. Recibe parámetros REST sin validación (validación ocurre después).
2. Traduce parámetros a `AdminListReservationsQuery`.
3. Invoca `BookingUseCase.listAdminReservations()` y `countAdminReservations()`.
4. Calcula metadatos de paginación:
   - `totalPages = Math.ceil(totalItems / size)`
   - `safePage = Math.max(0, page)`
   - `safeSize = Math.max(1, size)`
5. Envuelve respuesta en `AdminReservationsPageResponse`.

**Principios SOLID:**

- **S (Single Responsibility):** Responsabilidad única del controller: traducción HTTP ↔ Dominio.
  - No contiene lógica de negocio, validaciones complejas o acceso a datos.

- **I (Interface Segregation):** Método específico `listAdminReservations()` segregado de otros.
  - No mezcla endpoints de usuario regular con administrativo.

**Patrón Aplicado: Adapter Pattern**
- Traduce solicitud HTTP a `AdminListReservationsQuery`.
- Mapea respuesta de dominio a DTO `AdminReservationsPageResponse`.

**Mapeo de Parámetros:**

```
HTTP QueryParam          →  AdminListReservationsQuery Field
"desde" (YYYY-MM-DD)    →  fromExecutionDate
"hasta" (YYYY-MM-DD)    →  toExecutionDate
"estado" (string)       →  status
"usuario" (Long)        →  userId
"sede" (Long)           →  siteId
"page" (0-indexed)      →  page
"size" (≥1, default 20) →  size
```

---

#### 2.2 BookingHttpMapper - Mapeo de DTOs
**Archivo:** `adapters/in/web/BookingHttpMapper.java`

**Responsabilidad:** Traducir `Reservation` (dominio) → `AdminReservationResponse` (DTO HTTP).

```java
// Pseudo-código del mapeo
AdminReservationResponse toAdminResponse(Reservation reservation) {
    return new AdminReservationResponse(
        id: reservation.getId(),
        userId: reservation.getUserId(),
        userName: reservation.getUserName(),
        userEmail: reservation.getUserEmail(),
        siteId: reservation.getSiteId(),
        siteName: reservation.getSiteName(),
        spaceId: reservation.getSpaceId(),
        spaceName: reservation.getSpaceName(),
        executionDate: reservation.getStartDatetime(),  // Fecha de ejecución
        startTime: extractTime(reservation.getStartDatetime()),
        endTime: extractTime(reservation.getEndDatetime()),
        status: reservation.getStatus(),
        attendeesCount: reservation.getAttendeesCount(),
        notes: reservation.getNotes(),
        equipment: mapEquipments(reservation.getEquipments()),
        createdAt: reservation.getCreatedAt()
    );
}
```

**Principios SOLID:**

- **S (Single Responsibility):** Responsabilidad única: traducción entre capas.

- **D (Dependency Inversion):** No depende de detalles de implementación HTTP o persistencia.

**Patrón Aplicado: Mapper/DTO Pattern**
- Encapsula transformación de datos entre capas.
- Permite cambios en estructura interna sin afectar API externa.

---

### 3. DTOs de Respuesta

#### 3.1 AdminReservationsPageResponse
**Archivo:** `adapters/in/web/dto/AdminReservationsPageResponse.java`

```java
public record AdminReservationsPageResponse(
    List<AdminReservationResponse> items,    // Reservas de la página actual
    Integer page,                            // Página actual (0-indexed)
    Integer size,                            // Tamaño de página
    Long totalItems,                         // Total de reservas que coinciden
    Integer totalPages                       // Total de páginas
)
```

**Responsabilidad:** Encapsular respuesta paginada de reservas administrativas.

**Principios SOLID:**

- **S (Single Responsibility):** Único propósito: estructurar respuesta paginada.

**Patrón Aplicado: Data Transfer Object (DTO) + Value Object**
- Immutable record que encapsula estructura de respuesta.
- Facilita serialización JSON y tipado fuerte.

**Información Incluida por Reserva (AdminReservationResponse):**

```
Campo                  Tipo      Descripción
─────────────────────────────────────────────────
id                     Long      ID único de reserva
userId                 Long      ID del usuario
userName               String    Nombre completo del usuario
userEmail              String    Email del usuario
siteId                 Long      ID de la sede/ciudad
siteName               String    Nombre de la sede
spaceId                Long      ID del espacio/sala
spaceName              String    Nombre del espacio
executionDate          Instant   Fecha de ejecución (inicio)
startTime              String    Hora de inicio (HH:mm:ss)
endTime                String    Hora de fin (HH:mm:ss)
status                 String    Estado (pending, confirmed, cancelled, completed)
attendeesCount         Integer   Cantidad de asistentes
notes                  String    Observaciones
equipment              List      Equipos asociados
createdAt              Instant   Fecha de creación de la reserva
```

---

### 4. HU-02: Creación Manual de Reservas

#### 4.1 Endpoint POST /bookings/reservations (Admin Context)
**Archivo:** `adapters/in/web/BookingController.java` (líneas 56-72)

```java
@PostMapping("/reservations")
public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
    @Valid @RequestBody CreateReservationRequest request,
    @AuthenticationPrincipal AuthenticatedUser user
)
```

**Flujo para Admin (targetUserId especificado):**

```
1. Controller recibe CreateReservationRequest con:
   - targetUserId: ID del usuario para quien se crea la reserva (admin-only)
   - spaceId: ID del espacio
   - startAt: ISO-8601 datetime
   - endAt: ISO-8601 datetime
   - equipmentIds: [opcional] IDs de equipos adicionales
   - attendeesCount: cantidad de asistentes
   - title: título de la reserva
   - notes: notas

2. Resuelve userId efectivo:
   - Si targetUserId es null → usa userId del admin (autoreserva)
   - Si targetUserId especificado y user.hasRole("ADMIN") → usa targetUserId
   - Si targetUserId especificado y NO es admin → error FORBIDDEN

3. Delega a BookingUseCase.createReservation(CreateReservationCommand)

4. Validaciones en aplicación:
   - Espacio existe
   - Fechas válidas (startAt < endAt)
   - No hay solapamiento con reservas activas
   - Equipos existen, están disponibles, pertenecen a la ciudad del espacio

5. Crea reserva con estado PENDING (por defecto)
   - O CONFIRMED si HU-02 especifica (admin = CONFIRMED)

6. Publica evento ReservationCreatedEvent

7. Retorna ReservationResponse (201 Created)
```

**Principios SOLID:**

- **S (Single Responsibility):** Controller delega toda lógica a casos de uso.

- **D (Dependency Inversion):** Depende de `BookingUseCase`, no de implementación.

- **O (Open/Closed):** Nuevas estrategias de resolución de usuario pueden agregarse sin modificar controller.

**Patrón Aplicado: Adapter Pattern + Strategy Pattern (Resolución de Usuario)**

```java
private Long resolveEffectiveUserId(AuthenticatedUser user, Long targetUserId) {
    if (targetUserId == null) {
        return user.userId();  // Usuario autenticado crea para sí mismo
    }
    
    if (user.hasRole("ADMIN")) {
        return targetUserId;   // Admin puede crear para otro usuario
    }
    
    if (!user.userId().equals(targetUserId)) {
        throw new ApiException(HttpStatus.FORBIDDEN, 
            "No tiene permisos para crear reservas para otros usuarios",
            "FORBIDDEN_TARGET_USER");
    }
    
    return user.userId();
}
```

*Beneficio:* Lógica de autorización centralizada, fácil de extender.

#### 4.2 CreateReservationCommand
**Archivo:** `application/usecase/CreateReservationCommand.java`

```java
public record CreateReservationCommand(
    Long userId,                    // Usuario para quien es la reserva
    Long spaceId,                   // Espacio a reservar
    String startAt,                 // Inicio (ISO-8601)
    String endAt,                   // Fin (ISO-8601)
    String title,                   // Título
    Integer attendeesCount,         // Asistentes
    String notes,                   // Notas
    List<Long> equipmentIds         // Equipos opcionales
)
```

**Particularidad en Records:**

```java
// Constructor personalizado para hacer equipmentIds inmutable
public CreateReservationCommand(..., List<Long> equipmentIds) {
    this.equipmentIds = immutableCopyAllowingNulls(equipmentIds);
}

private static <T> List<T> immutableCopyAllowingNulls(List<T> source) {
    return source == null ? null : Collections.unmodifiableList(new ArrayList<>(source));
}
```

**Principios SOLID:**

- **S (Single Responsibility):** Encapsula parámetros de creación de reserva.

- **I (Interface Segregation):** No expone métodos innecesarios.

**Patrón Aplicado: Value Object Pattern**
- Immutable, no tiene identidad de dominio.
- Garantiza que equipmentIds no sea modificable post-creación.

---

#### 4.3 Validaciones de Disponibilidad
**Contexto:** `BookingApplicationService.createReservation()`

```
Validaciones encadenadas:

1. Espacio existe
   └─ si no → throw ApiException(NOT_FOUND, "Space not found")

2. Rango de fechas válido
   └─ si startAt >= endAt → throw ApiException(BAD_REQUEST, "Invalid date range")

3. Sin solapamiento con reservas activas
   │
   └─ Query: SELECT * FROM reservations 
            WHERE space_id = ? 
            AND status IN ('pending', 'confirmed', 'in_progress')
            AND start_datetime < ?
            AND end_datetime > ?
   │
   └─ si hay coincidencia → throw ApiException(CONFLICT, "Space not available")

4. Equipos válidos (si especificados)
   │
   ├─ Existen en base de datos
   ├─ Pertenecen a la ciudad del espacio
   └─ si falla → throw ApiException(BAD_REQUEST, "Equipment not found")

5. Si todas pasan:
   └─ Inserta reserva con estado PENDING
   └─ Publica ReservationCreatedEvent
   └─ Retorna Reservation
```

**Principios SOLID:**

- **S (Single Responsibility):** Cada validación es responsable de UN aspecto.

- **O (Open/Closed):** Nuevas validaciones pueden agregarse sin modificar existentes.

- **L (Liskov Substitution):** Excepciones personalizadas (ApiException) respetan contrato esperado.

**Patrón Aplicado: Validation Chain Pattern**
- Validaciones encadenadas evitan estado inválido.
- Fail-fast: primera validación que falla lanza excepción.

**Estados Iniciales por Contexto:**

```
Contexto                      Estado Inicial
─────────────────────────────────────────────
Usuario regular (.POST)       PENDING
Admin (.POST con targetUserId) CONFIRMED (según HU-02)
```

---

### 5. Estados y Transiciones en Contexto Admin

#### 5.1 ReservationStatusCatalog - Normalización
**Archivo:** `domain/model/ReservationStatusCatalog.java`

```java
public static Optional<String> mapAdminToSystem(String adminStatus) {
    // Mapea estados que muestra UI admin a estados internos del sistema
    String normalized = normalizeStatusOrNull(adminStatus);
    
    Map<String, String> ADMIN_TO_SYSTEM_STATUS = Map.of(
        "pendiente",   "pending",
        "confirmada",  "confirmed",
        "cancelada",   "cancelled",
        "finalizada",  "completed"
    );
    
    return Optional.ofNullable(ADMIN_TO_SYSTEM_STATUS.get(normalized));
}
```

**Estados Visibles en UI Admin (HU-01):**

```
UI Label          Sistema Interno    Descripción
─────────────────────────────────────────────────
Pendiente        pending           Creada, no confirmada
Confirmada       confirmed         Confirmada por admin
Cancelada        cancelled         Cancelada
Finalizada       completed         Completada y devuelta
```

**Principios SOLID:**

- **S (Single Responsibility):** Responsabilidad única: mapeo de vocabularios.

- **O (Open/Closed):** Nuevos estados pueden agregarse sin modificar código de aplicación.

**Patrón Aplicado: Strategy Pattern (Normalización de Estados)**
- Encapsula estrategia de mapeo de estados.
- Permite cambios de vocabulario sin afectar lógica de negocio.

---

### 6. Persistencia de Consulta Administrativa

#### 6.1 JdbcReservationPersistenceAdapter.listAdminReservations()
**Responsabilidad:** Ejecutar query SQL filtrada según criterios.

```sql
-- Pseudo-SQL (simplificado)
SELECT r.*, u.name, u.email, c.name as city_name, s.name as space_name
FROM reservations r
JOIN users u ON r.user_id = u.id
JOIN cities c ON r.city_id = c.id
JOIN spaces s ON r.space_id = s.id
WHERE 
    (r.start_datetime >= ? OR ? IS NULL)                    -- desde
    AND (r.start_datetime <= ? OR ? IS NULL)                -- hasta
    AND (r.status = ? OR ? IS NULL)                         -- estado
    AND (r.user_id = ? OR ? IS NULL)                        -- usuario
    AND (c.id = ? OR ? IS NULL)                             -- sede
ORDER BY r.start_datetime DESC
LIMIT ? OFFSET ?
```

**Principios SOLID:**

- **S (Single Responsibility):** Responsabilidad única: acceso a datos.

- **D (Dependency Inversion):** No expone SQL a capas superiores; oculta detalles de persistencia.

**Patrón Aplicado: Repository Pattern + Query Builder**
- Construye query dinámicamente según criterios.
- Encapsula SQL, facilita cambios de BD sin afectar aplicación.

**Optimizaciones Implementadas:**

1. **Paginación:** LIMIT/OFFSET en SQL, no en aplicación.
2. **Joins:** Un solo SELECT recupera datos denormalizados.
3. **Índices sugeridos:** `reservations(space_id, status, start_datetime)`

---

## II. FRONTEND - MÓDULO ADMIN

### 1. Estructura Arquitectónica

```
src/
├── core/
│   ├── domain/entities/
│   │   └── Reservation.ts            # Modelo de dominio
│   └── ports/repositories/
│       └── IReservationRepository.ts  # Interfaz de repositorio
│
├── application/
│   └── use-cases/reservations/
│       ├── GetUserReservationsUseCase.ts
│       ├── CancelReservationUseCase.ts
│       └── ... (casos de uso reutilizables)
│
├── infrastructure/
│   └── repositories/
│       └── HttpReservationRepository.ts  # Implementación HTTP
│
├── ui/
│   ├── pages/admin-reservations/
│   │   └── AdminReservationsPage.jsx     # Página principal admin
│   ├── components/admin-reservations/
│   │   ├── AdminCreateReservationPanel.jsx  # Modal de creación
│   │   ├── ReservationStatusFilter.jsx      # Filtros
│   │   ├── ReservationRequesterAutocomplete.jsx  # Búsqueda de usuario
│   │   └── AdminReservationTable.jsx        # Tabla de listado
│   └── styles/admin/
│       └── AdminReservations.css
│
└── features/reservations/services/
    └── adminReservationsService.ts    # Funciones para admin
```

---

### 2. AdminReservationsPage - Orquestador Principal

**Archivo:** `ui/pages/admin-reservations/AdminReservationsPage.jsx` (624 líneas)

**Responsabilidad:** Orquestar toda la funcionalidad de administración (consulta + creación).

**Estado Gestionado:**

```
Filtros (Consulta):
  - dateRangeFrom: desde (YYYY-MM-DD)
  - dateRangeTo: hasta (YYYY-MM-DD)
  - status: estado seleccionado
  - userId: usuario para filtrar
  - siteId: sede para filtrar
  - page: página actual

Creación de Reserva:
  - form: { userId, site, space, date, startTime, endTime, attendeesCount, equipment }
  - errors: { userId?, site?, space?, date?, startTime?, endTime?, attendeesCount? }
  - hasConflict: boolean (solapamiento detectado)
  - successMessage: string (éxito de creación)

UI:
  - reservations: List<Reservation> (resultados actuales)
  - totalPages: número de páginas
  - cityOptions: options para select de ciudades
  - spaceOptions: options para select de espacios
  - equipmentOptions: options para equipos
  - userSuggestions: resultados de búsqueda de usuarios
  - isCreateModalOpen: boolean
```

**Flujos Principales:**

#### 2.1 Flujo de Consulta Paginada

```
1. Usuario admin accede a página
   └─ useEffect → loadAdminReservations(filters, page=0)

2. buildReservationsQuery() construye:
   {
     page: 0,
     pageSize: 20,
     sortBy: 'executionDate',
     sortDirection: 'desc',
     filters: { desde, hasta, estado, usuario, sede }
   }

3. getAdminReservations() realiza:
   GET /bookings/admin/reservations?desde=...&hasta=...&estado=...&page=0&size=20

4. Respuesta AdminReservationsPageResponse:
   {
     items: [AdminReservationResponse, ...],
     page: 0,
     size: 20,
     totalItems: 150,
     totalPages: 8
   }

5. Actualiza state:
   setReservations(items)
   setTotalPages(totalPages)

6. UI Renderiza:
   - Tabla paginada
   - Botones de navegación
   - Información de página (1-8)
```

#### 2.2 Flujo de Aplicación de Filtros

```
1. Usuario ingresa filtro(s):
   - Rango de fechas desde/hasta
   - Estado: Pendiente, Confirmada, Cancelada, Finalizada
   - Usuario: búsqueda por nombre/email
   - Sede: select de ciudades

2. handleApplyFilters()
   └─ Valida rangos de fecha
   └─ Resetea page = 0
   └─ Invoca loadAdminReservations(filters, 0)

3. Query se ejecuta con filtros
   └─ Retorna solo reservas que coinciden

4. Si sin resultados:
   └─ Muestra mensaje: "No se encontraron reservas con los filtros aplicados"
   └─ Mantiene filtros activos
```

#### 2.3 Flujo de Creación Manual (HU-02)

```
1. Admin hace clic en "Nueva Reserva"
   └─ setIsCreateModalOpen(true)

2. Modal AdminCreateReservationPanel se abre

3. Admin ingresa datos:
   a. Selecciona usuario: 
      │  - getAdminUsers() con búsqueda
      │  - Autocomplete sugiere usuario
      │  - onUserSelect() setea form.userId
      └─ Validación: requerido

   b. Selecciona sede/ciudad:
      │  - getAdminCities() carga opciones
      │  - onFieldChange('site', value)
      └─ Dispara: getAdminSpacesByCity(siteId) + getAdminEquipmentByCity(siteId)

   c. Selecciona espacio:
      │  - Opciones cargadas por ciudad
      │  - onFieldChange('space', value)
      └─ Validación: requerido

   d. Selecciona fecha (calendario):
      │  - buildAvailability() marca fechas pasadas como no-disponibles
      │  - onFieldChange('date', YYYY-MM-DD)
      └─ Validación: requerido, no pasada

   e. Ingresa hora inicio/fin:
      │  - DurationSelector con intervalos de 15 minutos
      │  - onFieldChange('startTime', HH:mm)
      │  - onFieldChange('endTime', HH:mm)
      └─ Validación: requerido, startTime < endTime

   f. (Opcional) Selecciona equipos:
      │  - Checkboxes de equipos por ciudad
      │  - onEquipmentToggle(equipmentId, name)
      └─ Validación: ninguna (opcional)

4. Admin hace clic "Crear Reserva"
   └─ onSubmit() → buildCreateReservationRequest(form)
   └─ Construye payload:
      {
        userId: 123,
        cityId: 1,
        spaceId: 101,
        date: "2026-04-15",
        startTime: "14:00",
        endTime: "15:30",
        attendeesCount: 5,
        equipmentIds: [1, 3, 5]
      }

5. createAdminReservation(payload)
   └─ POST /bookings/reservations
   └─ Backend valida disponibilidad

6. Respuesta Backend:
   
   CASO A: Éxito (201)
   │  └─ Muestra toast: "Reserva creada exitosamente"
   │  └─ Resetea form
   │  └─ Cierra modal
   │  └─ Recarga listado de reservas
   │  └─ User ve nueva reserva en listado
   
   CASO B: Conflicto de horario (409)
   │  └─ setHasConflict(true)
   │  └─ Muestra banner: "El espacio seleccionado ya se encuentra reservado en este horario"
   │  └─ Mantiene modal abierta
   │  └─ Permite usuario reintentrar con otros horarios
   
   CASO C: Validación de entrada (400)
   │  └─ Muestra errores por campo:
   │     { userId: "Usuario requerido", date: "Fecha inválida", ... }
   │  └─ Mantiene datos ingresados
   │  └─ Bloquea botón "Crear Reserva"
```

**Principios SOLID:**

- **S (Single Responsibility):** Page orquesta, delega a componentes especializados.

- **D (Dependency Inversion):** Inyecta servicios (`getAdminReservations`, etc.) como props.

- **O (Open/Closed):** Nuevos filtros pueden agregarse sin modificar estructura.

**Patrón Aplicado: Container Component Pattern + Composition**
- Componente contenedor que maneja estado y lógica.
- Delega renderización a componentes presentacionales.

---

### 3. AdminCreateReservationPanel - Componente de Creación

**Archivo:** `ui/components/admin-reservations/AdminCreateReservationPanel.jsx` (321 líneas)

**Responsabilidad:** Renderizar formulario de creación manual de reserva.

**Props Esperadas:**

```typescript
interface AdminCreateReservationPanelProps {
    // Estado de apertura
    isOpen: boolean;
    
    // Datos del formulario
    form: {
        requesterQuery: string;        // Búsqueda de usuario
        userId: string | null;         // ID usuario seleccionado
        site: string;                  // Ciudad/sede ID
        space: string;                 // Espacio ID
        date: string;                  // Fecha YYYY-MM-DD
        startTime: string;             // Hora HH:mm
        endTime: string;               // Hora HH:mm
        attendeesCount: number;        // Asistentes
    };
    
    // Errores de validación
    errors: Record<string, string>;
    
    // Estado de conflicto
    hasConflict: boolean;              // Solapamiento detectado
    successMessage?: string;           // Mensaje de éxito
    
    // Sugerencias y opciones
    userSuggestions: User[];
    cityOptions: SelectOption[];
    spaceOptions: SelectOption[];
    equipmentOptions: Equipment[];
    selectedEquipment: Equipment[];
    
    // Flags de carga
    loadingCities: boolean;
    loadingSpaces: boolean;
    loadingEquipment: boolean;
    
    // Callbacks
    onUserSearch: (query: string) => void;
    onUserSelect: (user: User) => void;
    onFieldChange: (field: string, value: any) => void;
    onAttendeesCountChange: (count: number) => void;
    onEquipmentToggle: (equipmentId: string, name: string) => void;
    onSubmit: (e: Event) => void;
    onClose: () => void;
    
    // Configuración
    mode: 'create' | 'view';
    readOnly: boolean;
    title: string;
    subtitle: string;
}
```

**Estructura JSX:**

```jsx
<div className="modal-overlay" onClick={onClose}>
  <section className="modal-content admin-create-modal">
    <button className="modal-close" onClick={onClose}>X</button>
    
    {/* Encabezado */}
    <div className="modal-header">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
    
    <form onSubmit={onSubmit}>
      {/* Sección 1: Usuario + Sede + Espacio */}
      <div className="admin-create-grid">
        <ReservationRequesterAutocomplete
          value={form.requesterQuery}
          onSearch={onUserSearch}
          onSelectUser={onUserSelect}
          suggestions={userSuggestions}
        />
        <select className="admin-create-site">
          {cityOptions.map(opt => <option>{opt.label}</option>)}
        </select>
        <select className="admin-create-space" disabled={!form.site}>
          {spaceOptions.map(opt => <option>{opt.label}</option>)}
        </select>
      </div>
      
      {/* Sección 2: Calendario + Horario */}
      <div className="modal-columns">
        <div className="modal-left-column">
          <Calendar
            currentDate={calendarDate}
            selectedDate={selectedDate}
            availability={availability}
            onDateSelect={handleDateSelect}
            onPreviousMonth={() => {...}}
            onNextMonth={() => {...}}
          />
        </div>
        
        <div className="modal-right-column">
          <DurationSelector
            startTime={form.startTime}
            endTime={form.endTime}
            busySlots={[]}
            hasTimeConflict={hasConflict}
            successMessage={successMessage}
          />
          
          {/* Asistentes */}
          <input
            type="number"
            min="1"
            value={attendeesCount}
            onChange={(e) => onAttendeesCountChange(Number(e.target.value))}
          />
          
          {/* Equipos */}
          {equipmentOptions.length > 0 && (
            <div className="admin-equipment-grid">
              {equipmentOptions.map(equip => (
                <label>
                  <input
                    type="checkbox"
                    checked={selectedEquipmentIds.includes(equip.id)}
                    onChange={() => onEquipmentToggle(equip.id, equip.name)}
                  />
                  <span>{equip.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Mensajes */}
      {hasConflict && (
        <div className="modal-error-banner">
          El espacio seleccionado ya se encuentra reservado en este horario
        </div>
      )}
      {successMessage && (
        <div className="modal-success-banner">
          {successMessage}
        </div>
      )}
      
      {/* Botones */}
      <div className="modal-footer">
        <button type="button" onClick={onClose}>Cancelar</button>
        <button type="submit" disabled={!canSubmit}>Crear Reserva</button>
      </div>
    </form>
  </section>
</div>
```

**Constantes Definidas:**

```javascript
export const CREATE_RESERVATION_CONFLICT_MESSAGE = 
    'El espacio seleccionado ya se encuentra reservado en este horario';

export const CREATE_RESERVATION_SUCCESS_MESSAGE = 
    'Reserva creada exitosamente';

const FALLBACK_CITY_OPTIONS = [
    { value: '1', label: 'Sede Medellin' },
    { value: '2', label: 'Sede Bogota' },
];

const FALLBACK_SPACE_OPTIONS = [
    { value: '101', label: 'Sala de Innovacion A1' },
    { value: '102', label: 'Auditorio Principal' },
];
```

**Principios SOLID:**

- **S (Single Responsibility):** Componente renderiza solo formulario, no contiene lógica.

- **I (Interface Segregation):** Props bien segregadas, no recibe props innecesarios.

- **D (Dependency Inversion):** Depende de callbacks (props), no de servicios directos.

**Patrón Aplicado: Presentational Component (Dumb Component)**
- No tiene estado propio (excepto UI temporal como monthCursor).
- Todo estado crítico viene de props.
- Delega lógica a componente contenedor.

---

### 4. ReservationRequesterAutocomplete - Búsqueda de Usuario

**Archivo:** `ui/components/admin-reservations/ReservationRequesterAutocomplete.jsx`

**Responsabilidad:** Renderizar campo de búsqueda con autocompletado de usuarios.

```jsx
export const ReservationRequesterAutocomplete = ({
    value,                    // Texto de búsqueda
    onSearch,                 // Callback para buscar (debounced)
    onSelectUser,             // Callback al seleccionar usuario
    suggestions = []          // Usuarios sugeridos
}) => {
    const handleChange = (e) => {
        onSearch(e.target.value);  // Búsqueda en tiempo real
    };
    
    const handleSelectUser = (user) => {
        onSelectUser(user);  // Establece usuario seleccionado
    };
    
    return (
        <div className="requester-autocomplete">
            <input
                type="text"
                placeholder="Buscar usuario por nombre, apellido o email"
                value={value}
                onChange={handleChange}
            />
            {suggestions.length > 0 && (
                <ul className="autocomplete-suggestions">
                    {suggestions.map(user => (
                        <li
                            key={user.id}
                            onClick={() => handleSelectUser(user)}
                        >
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
```

**Principios SOLID:**

- **S (Single Responsibility):** Responsabilidad única: renderizar autocompletado.

- **I (Interface Segregation):** Props minimales, no recibe estado innecesario.

**Patrón Aplicado: Controlled Component Pattern**
- Estado externo (value) controlado por padre.
- Callbacks para notificar cambios.

---

### 5. ReservationStatusFilter - Filtros de Consulta

**Archivo:** `ui/components/admin-reservations/ReservationStatusFilter.jsx`

**Responsabilidad:** Renderizar controles de filtro (fecha, estado, usuario, sede).

```jsx
export const ReservationStatusFilter = ({
    filters,           // Estado actual de filtros
    setFilter,         // Setter de filtro individual
    clearFilters,      // Limpiar todos los filtros
    applyFilters,      // Aplicar y buscar
    cityOptions,       // Ciudades disponibles
    userOptions,       // Usuarios para filtro
    loadingUsers,      // Loading flag de usuarios
}) => {
    const stateOptions = [
        { value: '', label: 'Todos' },
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'confirmada', label: 'Confirmada' },
        { value: 'cancelada', label: 'Cancelada' },
        { value: 'finalizada', label: 'Finalizada' },
    ];
    
    return (
        <div className="filter-panel">
            <label>Desde (Fecha de Ejecución)</label>
            <input
                type="date"
                value={filters.dateRangeFrom}
                onChange={(e) => setFilter('dateRangeFrom', e.target.value)}
            />
            
            <label>Hasta (Fecha de Ejecución)</label>
            <input
                type="date"
                value={filters.dateRangeTo}
                onChange={(e) => setFilter('dateRangeTo', e.target.value)}
            />
            
            <label>Estado</label>
            <select
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value)}
            >
                {stateOptions.map(opt => (
                    <option value={opt.value}>{opt.label}</option>
                ))}
            </select>
            
            <label>Usuario</label>
            <select
                value={filters.userId}
                onChange={(e) => setFilter('userId', e.target.value)}
            >
                <option value="">Todos</option>
                {userOptions.map(user => (
                    <option value={user.id}>{user.name}</option>
                ))}
            </select>
            
            <label>Sede</label>
            <select
                value={filters.siteId}
                onChange={(e) => setFilter('siteId', e.target.value)}
            >
                <option value="">Todas</option>
                {cityOptions.map(city => (
                    <option value={city.id}>{city.name}</option>
                ))}
            </select>
            
            <button onClick={applyFilters}>Buscar</button>
            <button onClick={clearFilters}>Limpiar</button>
        </div>
    );
};
```

**Principios SOLID:**

- **S (Single Responsibility):** Renderiza solo filtros, no contiene lógica de búsqueda.

**Patrón Aplicado: Presentational Component**
- Props controladas desde arriba.
- Callbacks delegados al contenedor.

---

### 6. Servicios HTTP - adminReservationsService

**Archivo:** `features/reservations/services/adminReservationsService.ts`

**Responsabilidad:** Encapsular llamadas HTTP específicas del módulo admin.

```typescript
// Consulta paginada de reservas admin
export async function getAdminReservations(query: AdminListReservationsQuery) {
    const response = await httpClient.get('/bookings/admin/reservations', {
        params: {
            desde: query.dateFrom,
            hasta: query.dateTo,
            estado: query.status,
            usuario: query.userId,
            sede: query.siteId,
            page: query.page,
            size: 20
        }
    });
    return ReservationMapper.toDomainList(response.data.data);
}

// Detalle de una reserva
export async function getAdminReservationDetail(reservationId: string) {
    const response = await httpClient.get(`/bookings/reservations/${reservationId}`);
    return ReservationMapper.toDomain(response.data.data);
}

// Búsqueda de usuarios
export async function searchAdminUsers(query: string) {
    const response = await httpClient.get('/auth/users', {
        params: { query }
    });
    return UserMapper.toDomainList(response.data.data);
}

// Validar disponibilidad
export async function checkAdminReservationAvailability(
    spaceId: string,
    date: string,
    startTime: string,
    endTime: string
) {
    const response = await httpClient.get('/bookings/spaces/{spaceId}/availability', {
        params: { startAt: `${date}T${startTime}`, endAt: `${date}T${endTime}` }
    });
    return response.data.data;  // { available: boolean, busySlots: [] }
}

// Crear reserva manualmente
export async function createAdminReservation(data: CreateReservationPayload) {
    const response = await httpClient.post('/bookings/reservations', {
        targetUserId: data.userId,
        spaceId: data.spaceId,
        startAt: `${data.date}T${data.startTime}`,
        endAt: `${data.date}T${data.endTime}`,
        attendeesCount: data.attendeesCount,
        equipmentIds: data.equipmentIds
    });
    return ReservationMapper.toDomain(response.data.data);
}

// Cargar ciudades
export async function getAdminCities() {
    const response = await httpClient.get('/locations/cities');
    return LocationMapper.toDomainList(response.data.data);
}

// Cargar espacios por ciudad
export async function getAdminSpacesByCity(cityId: string) {
    const response = await httpClient.get('/locations/spaces', {
        params: { cityId }
    });
    return LocationMapper.toDomainList(response.data.data);
}

// Cargar equipos por ciudad
export async function getAdminEquipmentByCity(cityId: string) {
    const response = await httpClient.get('/inventory/equipments', {
        params: { cityId }
    });
    return InventoryMapper.toDomainList(response.data.data);
}
```

**Principios SOLID:**

- **S (Single Responsibility):** Cada función responsable de UNA llamada HTTP.

- **D (Dependency Inversion):** Depende de `httpClient` (abstracción), no de Axios directo.

**Patrón Aplicado: Service Layer Pattern**
- Encapsula lógica de orquestación HTTP.
- Mapea respuestas a entidades de dominio.
- Reutilizable desde múltiples componentes.

---

### 7. Hooks Personalizados

#### 7.1 useAdminReservationFilters
**Responsabilidad:** Gestionar estado de filtros de búsqueda.

```typescript
export function useAdminReservationFilters() {
    const [filters, setFilters] = useState(ADMIN_RESERVATION_DEFAULT_FILTERS);
    
    const setFilter = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const clearFilters = () => {
        setFilters(ADMIN_RESERVATION_DEFAULT_FILTERS);
    };
    
    return { filters, setFilter, clearFilters };
}

const ADMIN_RESERVATION_DEFAULT_FILTERS = {
    dateRangeFrom: null,
    dateRangeTo: null,
    status: null,
    userId: null,
    siteId: null,
    page: 0
};
```

#### 7.2 useAdminCreateReservationForm
**Responsabilidad:** Gestionar estado del formulario de creación.

```typescript
export function useAdminCreateReservationForm() {
    const [form, setForm] = useState({
        requesterQuery: '',
        userId: null,
        site: '',
        space: '',
        date: '',
        startTime: '',
        endTime: '',
        attendeesCount: 1,
        equipment: []
    });
    
    const [errors, setErrors] = useState({});
    const [hasConflict, setHasConflict] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const setFieldValue = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Limpiar error de este campo si existía
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    
    const validate = () => {
        const newErrors = {};
        
        if (!form.userId) newErrors.userId = 'Usuario requerido';
        if (!form.site) newErrors.site = 'Sede requerida';
        if (!form.space) newErrors.space = 'Espacio requerido';
        if (!form.date) newErrors.date = 'Fecha requerida';
        if (!form.startTime) newErrors.startTime = 'Hora de inicio requerida';
        if (!form.endTime) newErrors.endTime = 'Hora de fin requerida';
        if (form.startTime >= form.endTime) {
            newErrors.endTime = 'Hora de fin debe ser posterior a inicio';
        }
        if (form.attendeesCount < 1) {
            newErrors.attendeesCount = 'Mínimo 1 asistente';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    return {
        form,
        setFieldValue,
        errors,
        setErrors,
        hasConflict,
        setHasConflict,
        successMessage,
        setSuccessMessage,
        validate,
        reset: () => setForm({...INITIAL_FORM})
    };
}
```

**Principios SOLID:**

- **S (Single Responsibility):** Cada hook gestiona UN aspecto del estado.

- **D (Dependency Inversion):** Lógica desacoplada de componentes.

**Patrón Aplicado: Custom Hooks Pattern**
- Reutilizable en múltiples componentes.
- Lógica testeable independientemente de React.

---

## III. FLUJOS DE NEGOCIO INTEGRADOS

### Flujo 1: Consulta Administrativa (HU-01)

```
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - AdminReservationsPage                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User: Abre Admin Module                                         │
│  2. useEffect: loadAdminReservations(filters, page=0)               │
│  3. buildReservationsQuery → {filters, page, size, sort}            │
│  4. getAdminReservations()  → GET /bookings/admin/reservations      │
│                                                                      │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ HTTP Client (Axios)        │
                    │ + Interceptores JWT        │
                    │ + Error Handling           │
                    └──────────────┬──────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│ BACKEND - BookingController.listAdminReservations()                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. @GetMapping("/admin/reservations")                              │
│  2. Recibe: desde, hasta, estado, usuario, sede, page, size         │
│  3. Construye: AdminListReservationsQuery                           │
│  4. Invoca: bookingUseCase.listAdminReservations(query)             │
│  5. Invoca: bookingUseCase.countAdminReservations(query)            │
│  6. Calcula: totalPages = ceil(totalItems / size)                   │
│  7. Mapea: List<Reservation> → List<AdminReservationResponse>       │
│  8. Envuelve: AdminReservationsPageResponse                         │
│  9. Retorna: ApiResponse<AdminReservationsPageResponse> (200)       │
│                                                                      │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
         ┌─────────────────────────▼─────────────────────────────┐
         │ BookingApplicationService.listAdminReservations()     │
         ├──────────────────────────────────────────────────────┤
         │                                                        │
         │  1. Validaciones:                                     │
         │     - Rangos de fecha válidos                         │
         │     - Estado válido (via ReservationStatusCatalog)    │
         │     - Índices de página válidos                       │
         │                                                        │
         │  2. Invoca: bookingPersistencePort.listAdminReservations(query)
         │  3. Invoca: bookingPersistencePort.countAdminReservations(query)
         │  4. Retorna: List<Reservation>, totalCount            │
         │                                                        │
         └──────────────────────────────────┬────────────────────┘
                                            │
         ┌──────────────────────────────────▼──────────────────┐
         │ JdbcReservationPersistenceAdapter                   │
         ├────────────────────────────────────────────────────┤
         │                                                      │
         │  1. Construye SQL dinámico:                         │
         │     SELECT r.*, u.name, c.name, s.name             │
         │     FROM reservations r                            │
         │     JOIN users u ON r.user_id = u.id              │
         │     JOIN cities c ON r.city_id = c.id             │
         │     JOIN spaces s ON r.space_id = s.id            │
         │     WHERE (filtros)                                │
         │     ORDER BY r.start_datetime DESC                 │
         │     LIMIT ? OFFSET ?                               │
         │                                                      │
         │  2. Ejecuta query en MariaDB                        │
         │  3. Traduce ResultSet → List<Reservation>          │
         │  4. Retorna: List<Reservation>                      │
         │                                                      │
         └────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND - AdminReservationsPage (Continuación)                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  5. onSuccess(response)                                          │
│     - setReservations(response.items)                            │
│     - setTotalPages(response.totalPages)                         │
│                                                                   │
│  6. Renderiza:                                                   │
│     - Tabla con reservas (campos: ID, Usuario, Sede, Espacio,   │
│       Fecha, Hora inicio, Hora fin, Estado)                     │
│     - Paginación (página actual de totalPages)                  │
│     - Filtros aplicados visibles                                │
│     - Botón "Nueva Reserva" (HU-02)                             │
│                                                                   │
│  7. User: Puede hacer click en fila para ver detalle            │
│     └─ getAdminReservationDetail(reservationId)                 │
│     └─ Abre modal con información completa                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Flujo 2: Creación Manual de Reserva (HU-02)

```
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND - AdminReservationsPage                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Admin: Click "Nueva Reserva"                                    │
│  2. setIsCreateModalOpen(true)                                      │
│  3. AdminCreateReservationPanel abre                                │
│                                                                      │
│  4. Admin ingresa datos en secuencia:                               │
│     a. Busca usuario:                                              │
│        onUserSearch(query) → searchAdminUsers(query)               │
│        → lista sugerencias de usuarios                             │
│        → selecciona usuario → setForm({ userId })                  │
│                                                                      │
│     b. Selecciona sede/ciudad:                                      │
│        getAdminCities() → cargar opciones                          │
│        onFieldChange('site', siteId)                               │
│        → Dispara: getAdminSpacesByCity(siteId)                     │
│        → Dispara: getAdminEquipmentByCity(siteId)                  │
│                                                                      │
│     c. Selecciona espacio:                                          │
│        onFieldChange('space', spaceId)                             │
│                                                                      │
│     d. Selecciona fecha:                                            │
│        buildAvailability() filtra fechas pasadas                    │
│        onDateSelect(day) → setForm({ date: YYYY-MM-DD })           │
│                                                                      │
│     e. Ingresa hora inicio/fin:                                     │
│        DurationSelector (intervalos de 15min)                       │
│        onFieldChange('startTime', HH:mm)                           │
│        onFieldChange('endTime', HH:mm)                             │
│                                                                      │
│     f. (Opcional) Selecciona equipos:                               │
│        onEquipmentToggle(equipmentId, name)                        │
│        → Agrega/remueve equipo de selection                        │
│                                                                      │
│  5. Admin: Click "Crear Reserva"                                   │
│  6. validate() → Chequea campos obligatorios                        │
│     Si hay errores → Muestra inLineFieldError por campo             │
│     Si valida → Continúa                                           │
│                                                                      │
│  7. buildCreateReservationRequest(form) →                           │
│     {                                                              │
│       userId: 123,        (usuario seleccionado)                   │
│       spaceId: 101,       (espacio seleccionado)                   │
│       startAt: "2026-04-15T14:00",                                 │
│       endAt: "2026-04-15T15:30",                                   │
│       attendeesCount: 5,                                           │
│       equipmentIds: [1, 3]                                         │
│     }                                                              │
│                                                                      │
│  8. createAdminReservation(payload)                                │
│     → POST /bookings/reservations                                  │
│     → Con targetUserId = userId (admin override)                   │
│                                                                      │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ HTTP Client                │
                    │ + Auth JWT                 │
                    └──────────────┬──────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│ BACKEND - BookingController.createReservation()                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. @PostMapping("/reservations")                                   │
│  2. @Valid @RequestBody CreateReservationRequest request            │
│  3. @AuthenticationPrincipal AuthenticatedUser user (admin token)   │
│                                                                      │
│  4. Resuelve userId efectivo:                                       │
│     if (request.targetUserId != null && user.hasRole("ADMIN")) {    │
│         effectiveUserId = request.targetUserId  ← ADMIN OVERRIDE    │
│     } else {                                                        │
│         effectiveUserId = user.userId()                            │
│     }                                                              │
│                                                                      │
│  5. Construye CreateReservationCommand:                             │
│     - userId: effectiveUserId                                      │
│     - spaceId: request.spaceId                                     │
│     - startAt: request.startAt                                     │
│     - endAt: request.endAt                                         │
│     - attendeesCount: request.attendeesCount                       │
│     - equipmentIds: request.equipmentIds                           │
│                                                                      │
│  6. Invoca: bookingUseCase.createReservation(command)               │
│                                                                      │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
    ┌──────────────────────────────▼───────────────────────────────┐
    │ BookingApplicationService.createReservation()                │
    ├─────────────────────────────────────────────────────────────┤
    │                                                               │
    │  VALIDACIONES ENCADENADAS:                                  │
    │                                                               │
    │  1. ¿Espacio existe?                                        │
    │     if (bookingPersistencePort.findSpaceById(spaceId) == null)
    │        → throw ApiException(NOT_FOUND)                      │
    │                                                               │
    │  2. ¿Rango de fechas válido?                                │
    │     if (startAt >= endAt)                                   │
    │        → throw ApiException(BAD_REQUEST)                    │
    │                                                               │
    │  3. ¿Espacio disponible? (NO solapamiento)                  │
    │     query: SELECT * FROM reservations                       │
    │            WHERE space_id = spaceId                         │
    │            AND status IN ('pending','confirmed','in_progress')
    │            AND start < endAt AND end > startAt              │
    │     if (resultSet.size() > 0)                               │
    │        → throw ApiException(CONFLICT,                       │
    │             "El espacio seleccionado ya se encuentra...") │
    │                                                               │
    │  4. ¿Equipos válidos? (si especificados)                    │
    │     for each equipmentId:                                   │
    │        - ¿Equipo existe?                                    │
    │        - ¿Pertenece a la ciudad del espacio?                │
    │     if (error)                                              │
    │        → throw ApiException(BAD_REQUEST)                    │
    │                                                               │
    │  5. Si todas pasan → Crea reserva:                          │
    │     - INSERT INTO reservations                              │
    │       (user_id, space_id, start_datetime, end_datetime,    │
    │        status='PENDING', attendees_count, ...)              │
    │     - INSERT INTO reservation_equipments (rel)              │
    │       for each equipment_id                                 │
    │     - Retorna Reservation con estado PENDING                │
    │                                                               │
    │  6. Publica evento:                                          │
    │     eventPublisherPort.publishReservationCreated(event)      │
    │                                                               │
    │  7. Retorna Reservation                                      │
    │                                                               │
    └────────────────────┬─────────────────────────────────────────┘
                        │
          ┌─────────────▼──────────────┐
          │ EventPublisherPort         │
          │ (RabbitMQ o NoOp)          │
          │ → PublishReservationCreatedEvent
          │ → Consumida por:           │
          │   - Notifications-Service  │
          │   - Otros servicios (audit)│
          └────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND - AdminCreateReservationPanel (Respuesta)               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  CASO A: Éxito (201)                                             │
│  ────────────────────                                            │
│  1. setSuccessMessage("Reserva creada exitosamente")             │
│  2. Muestra modal-success-banner por 3 segundos                  │
│  3. resetForm()                                                  │
│  4. setIsCreateModalOpen(false)                                  │
│  5. loadAdminReservations(filters, 0)  ← Recarga listado         │
│  6. User ve nueva reserva en el top del listado                  │
│                                                                   │
│  CASO B: Conflicto de horario (409)                              │
│  ─────────────────────────────────────                           │
│  1. setHasConflict(true)                                         │
│  2. Muestra modal-error-banner:                                  │
│     "El espacio seleccionado ya se encuentra reservado..."       │
│  3. Mantiene modal abierta                                       │
│  4. Botón "Crear Reserva" permanece clickeable                   │
│  5. User puede:                                                  │
│     - Cambiar hora inicio/fin                                    │
│     - Cambiar espacio                                            │
│     - Cambiar fecha                                              │
│     - Reintentar "Crear Reserva"                                 │
│                                                                   │
│  CASO C: Error de validación (400)                               │
│  ───────────────────────────────────                             │
│  1. Recibe errores: { userId: "...", date: "...", ... }          │
│  2. setErrors(errores)                                           │
│  3. Renderiza InlineFieldError por cada campo con error          │
│  4. Botón "Crear Reserva" deshabilitado mientras errors          │
│  5. User ve mensajes claramente por campo                        │
│     Ejemplo: "Usuario requerido", "Fecha inválida"               │
│  6. User completa campos y reintenta                             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## IV. PRINCIPIOS SOLID - MATRIZ POR ARTEFACTO

| Artefacto | S | O | L | I | D | Justificación |
|-----------|---|---|---|---|---|---------------|
| **AdminListReservationsQuery** | ✓ | ✓ | - | ✓ | ✓ | Encapsula parámetros de query; permite extensión de filtros |
| **BookingController.listAdminReservations()** | ✓ | - | - | ✓ | ✓ | Traduce HTTP a dominio; responsabilidad única |
| **AdminReservationsPageResponse** | ✓ | - | - | ✓ | - | DTO inmutable; responsabilidad única de estructura |
| **AdminCreateReservationPanel** | ✓ | - | - | ✓ | ✓ | Componente presentacional; depende de callbacks |
| **ReservationRequesterAutocomplete** | ✓ | - | - | ✓ | ✓ | Componente controlado; props segregadas |
| **adminReservationsService** | ✓ | ✓ | ✓ | ✓ | ✓ | Servicios segregados; cada método = 1 responsabilidad |
| **useAdminReservationFilters()** | ✓ | ✓ | - | ✓ | ✓ | Hook específico para filtros; reutilizable |
| **useAdminCreateReservationForm()** | ✓ | ✓ | - | ✓ | ✓ | Hook específico para formulario; validaciones centralizadas |

---

## V. PATRONES DE DISEÑO IMPLEMENTADOS

| Patrón | Backend | Frontend | Archivos Clave |
|--------|---------|----------|-----------------|
| **Hexagonal Architecture** | ✓ | ✓ | BookingController, AdminCreateReservationPanel |
| **CQRS (Query/Command Segregation)** | ✓ | ✓ | AdminListReservationsQuery, CreateReservationCommand |
| **Adapter Pattern** | ✓ | ✓ | BookingController, adminReservationsService |
| **Command Object Pattern** | ✓ | ✓ | CreateReservationCommand, AdminListReservationsQuery |
| **Repository Pattern** | ✓ | ✓ | JdbcReservationPersistenceAdapter, IReservationRepository |
| **Strategy Pattern** | ✓ | - | resolveEffectiveUserId(), PasswordHasher, EventPublisher |
| **DTO Pattern** | ✓ | ✓ | AdminReservationsPageResponse, ReservationResponse |
| **Mapper Pattern** | ✓ | ✓ | BookingHttpMapper, ReservationMapper |
| **Validation Chain** | ✓ | ✓ | createReservation() validaciones, useAdminCreateReservationForm.validate() |
| **Controlled Component** | - | ✓ | ReservationRequesterAutocomplete, ReservationStatusFilter |
| **Container Component** | - | ✓ | AdminReservationsPage |
| **Presentational Component** | - | ✓ | AdminCreateReservationPanel |
| **Custom Hooks** | - | ✓ | useAdminReservationFilters, useAdminCreateReservationForm |
| **Custom Hooks Pattern** | - | ✓ | useMemo para memoización de calendar |
| **Event-Driven** | ✓ | - | ReservationCreatedEvent |

---

## VI. VALIDACIONES IMPLEMENTADAS

### Backend

```
POST /bookings/reservations (Admin Context)
├─ Espacio existe (NOT_FOUND)
├─ Fechas válidas: startAt < endAt (BAD_REQUEST)
├─ Sin solapamiento en espacio (CONFLICT)
├─ Equipos existen (NOT_FOUND)
├─ Equipos pertenecen a ciudad (BAD_REQUEST)
└─ Usuario existe (NOT_FOUND)

GET /bookings/admin/reservations
├─ Rango de fechas válido
├─ Estado válido (via ReservationStatusCatalog)
└─ Índices de página válidos
```

### Frontend

```
Formulario de Creación Manual
├─ userId: obligatorio
├─ site (ciudad): obligatorio
├─ space (espacio): obligatorio, depende de site
├─ date (fecha): obligatorio, no pasada, formato YYYY-MM-DD
├─ startTime: obligatorio, formato HH:mm
├─ endTime: obligatorio, startTime < endTime
├─ attendeesCount: ≥ 1
└─ equipment: opcional (pero validado en backend si especificado)
```

---

## VII. CONCLUSIONES TÉCNICAS

### Fortalezas

1. **Separación Clara de Responsabilidades (SRP)**
   - Backend: Cada caso de uso, adaptador, DTO responsable de UN aspecto.
   - Frontend: Componentes segregados (Page, Panel, Filter, Autocomplete).

2. **Inversión de Dependencias (DIP)**
   - Backend: BookingApplicationService depende de puertos, no de JDBC/RabbitMQ.
   - Frontend: Componentes dependen de callbacks (props), no de servicios directos.

3. **Apertura a Extensión (OCP)**
   - Nuevos filtros en AdminListReservationsQuery sin modificación.
   - Nuevas validaciones en createReservation sin cambio de estructura.

4. **Interfaz Segregada (ISP)**
   - Puertos específicos: BookingPersistencePort, ReservationEventPublisherPort.
   - Props mínimas en componentes React.

5. **Consistencia Frontend-Backend**
   - Ambos implementan Query Object Pattern.
   - Ambos segregan lectura (queries) de escritura (comandos).

### Áreas de Mejora

1. **Validación de Disponibilidad en Real-Time**
   - Implementar WS de disponibilidad para que admin vea conflictos antes de submitear.

2. **Caché de Datos de Catálogo**
   - Cities, spaces, equipment podrían cachearse en frontend para evitar múltiples requests.

3. **Errores Específicos de Solapamiento**
   - Retornar `busySlots` desde backend para mostrar horarios ocupados al admin.

4. **Auditoría de Creación Manual**
   - Logging adicional en backend cuando admin crea reserva para otro usuario.

5. **Testing Automatizado**
   - Unit tests para validaciones de formulario en hooks.
   - Integration tests para flujo completo (filtrar + crear).

---

**Fin del Análisis - Módulo de Administración de Reservas**

*Documento generado: 2026-04-08*  
*Cobertura: HU-01 (Consultar Reservas), HU-02 (Crear Reserva Manual)*  
*Enfoque: SOLID, Patrones de Diseño, Flujos de Negocio Integrados*

