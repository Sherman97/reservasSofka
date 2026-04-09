# Análisis Técnico del Proyecto Reservas SK
## Principios SOLID, Patrones de Diseño y Arquitectura

**Fecha del análisis:** 2026-04-08  
**Ámbito:** Backend (Java 17 + Spring Boot) y Frontend (React + TypeScript)  
**Enfoque:** Evaluación de cobertura SOLID, patrones de diseño e implementación arquitectónica

---

## Introducción Contextual

El proyecto Reservas SK constituye una solución integral de microservicios orientada a la gestión de reservas de espacios y equipamiento. La arquitectura se fundamenta en principios hexagonales, que se materializan en una clara segregación entre la lógica empresarial y las dependencias técnicas. Este informe desglosa la aplicación de principios SOLID y patrones de diseño por cada servicio, identificando las prácticas implementadas y su alineación con estándares de calidad arquitectónica.

---

## I. BACKEND - ANÁLISIS POR SERVICIO

### 1. AUTH-SERVICE: Autenticación y Autorización

#### Descripción General
El `auth-service` encapsula la responsabilidad de autenticación, registro de usuarios, generación de tokens JWT y autorización mediante roles. Su estructura refleja una aplicación rigurosa de arquitectura hexagonal con desacoplamiento entre la lógica de negocio y las implementaciones técnicas.

#### Principios SOLID Identificados

##### **S - Single Responsibility Principle (SRP)**
La segregación de responsabilidades se manifiesta en:

- **`EmailNormalizer.java`**: Responsable exclusivamente de la normalización de direcciones de correo electrónico. Contiene una única operación que transforma el correo a minúsculas y elimina espacios en blanco.
  - *Justificación:* Aislamiento de la lógica de transformación de datos primitivos, facilitando su reutilización y testabilidad.
  - *Archivo relacionado:* `domain/service/EmailNormalizer.java` (línea 9-11)

- **`AuthApplicationService.java`**: Orquesta los casos de uso del dominio (registro, login, consulta de perfil) mediante la composición de puertos.
  - *Justificación:* Concentra la lógica de autenticación sin mezclar preocupaciones de persistencia, criptografía o publicación de eventos.
  - *Archivo relacionado:* `application/service/AuthApplicationService.java` (líneas 21-85)

- **`UserPersistenceAdapter.java`**: Maneja exclusivamente la interacción con la capa de persistencia mediante JPA/JDBC.
  - *Justificación:* Traduce entre el modelo de dominio y la representación relacional, sin injerencia en lógica de negocio.
  - *Archivo relacionado:* `adapters/out/persistence/UserPersistenceAdapter.java` (líneas 16-80)

- **`JwtTokenAdapter.java`**: Responsable única de generar y parsear tokens JWT.
  - *Justificación:* Encapsula la estrategia criptográfica, permitiendo cambios posteriores sin afectar el núcleo empresarial.

- **`BcryptPasswordHasherAdapter.java`**: Dedicado exclusivamente al hash y validación de contraseñas.
  - *Justificación:* Segrega la responsabilidad de criptografía de contraseñas en su propio adaptador.

##### **O - Open/Closed Principle (OCP)**
El principio se implementa mediante puertos (interfaces) que permiten extensión sin modificación:

- **`PasswordHasherPort`**: Define el contrato para hash de contraseñas; nuevas implementaciones (e.g., Argon2) pueden coexistir sin afectar `AuthApplicationService`.
  - *Patrón aplicado:* Strategy Pattern.
  - *Extensibilidad:* Se pueden implementar alternativas de hash sin modificar el código existente.

- **`UserEventPublisherPort`**: Define el contrato para publicación de eventos. Dos implementaciones coexisten:
  - `RabbitUserEventPublisherAdapter`: Publica via RabbitMQ cuando está activo (controlado por `@ConditionalOnProperty`).
  - `NoOpUserEventPublisherAdapter`: Fallback cuando RabbitMQ está deshabilitado.
  - *Justificación:* Nueva infraestructura de eventos puede ser inyectada sin modificar `AuthApplicationService`.
  - *Archivo relacionado:* `adapters/out/messaging/RabbitUserEventPublisherAdapter.java` (líneas 12-49)

- **`UserPersistencePort`**: Abstrae la persistencia, permitiendo cambios de tecnología (JPA, JDBC, NoSQL) sin impactar la aplicación.

##### **L - Liskov Substitution Principle (LSP)**
Se respeta mediante la implementación coherente de contratos en adaptadores:

- `RabbitUserEventPublisherAdapter` y `NoOpUserEventPublisherAdapter` implementan `UserEventPublisherPort` de manera intercambiable.
  - *Garantía:* Ambas implementaciones cumplen el contrato sin sorpresas en el comportamiento contractual.
  - Cualquier consumidor de `UserEventPublisherPort` puede utilizar indistintamente cualquier implementación.

- `UserPersistenceAdapter` implementa `UserPersistencePort` respetando la semántica de cada método (búsqueda, existencia, guardado).

##### **I - Interface Segregation Principle (ISP)**
Los puertos se definen con granularidad específica:

- `UserPersistencePort`: Contiene únicamente métodos relacionados con persistencia de usuarios.
  - No mezcla operaciones de autorización, criptografía o eventos.
  - *Archivo relacionado:* `application/port/out/UserPersistencePort.java`

- `TokenPort`: Define el contrato específico para generación y validación de tokens.
  - No asume ninguna responsabilidad adicional fuera del manejo de JWT.

- `PasswordHasherPort`: Contrato segregado para operaciones de hash.

- `UserEventPublisherPort`: Puerto específico para publicación de eventos de usuario creado.

*Beneficio:* Los clientes de estas interfaces no dependen de métodos innecesarios, reduciendo acoplamiento.

##### **D - Dependency Inversion Principle (DIP)**
La inyección de dependencias invierte el control de dependencias:

```
AuthApplicationService (aplicación)
        ↑ (depende de)
    Puertos (abstracciones)
        ↑ (implementados por)
Adaptadores (implementaciones)
```

- `AuthApplicationService` depende de puertos (`UserPersistencePort`, `PasswordHasherPort`, `TokenPort`, `UserEventPublisherPort`), no de implementaciones concretas.
- Los adaptadores (JPA, Bcrypt, JWT, RabbitMQ) se inyectan en tiempo de configuración.
- *Archivo relacionado:* `application/service/AuthApplicationService.java` (líneas 29-37)

*Ventaja:* Cambios en adaptadores no requieren recompilación de servicios.

#### Patrones de Diseño Implementados

##### **Hexagonal Architecture (Ports & Adapters)**
Estructura transversal a toda la aplicación:

```
domain/                    # Núcleo puro
├── model/User.java        # Entidades sin anotaciones externas
└── service/EmailNormalizer.java

application/               # Lógica de casos de uso
├── port/in/AuthUseCase.java (interfaz de entrada)
├── port/out/             # Contratos de salida
│   ├── UserPersistencePort.java
│   ├── PasswordHasherPort.java
│   ├── TokenPort.java
│   └── UserEventPublisherPort.java
└── service/AuthApplicationService.java

adapters/in/               # Entrada (HTTP)
└── web/AuthController.java

adapters/out/              # Salida (BD, criptografía, eventos)
├── persistence/UserPersistenceAdapter.java
├── security/BcryptPasswordHasherAdapter.java, JwtTokenAdapter.java
└── messaging/RabbitUserEventPublisherAdapter.java, NoOpUserEventPublisherAdapter.java

infrastructure/            # Configuración técnica
├── config/SecurityConfig.java, JwtProperties.java
└── security/JwtAuthenticationFilter.java
```

*Beneficio arquitectónico:* El dominio queda completamente aislado de Spring, JPA, JWT y RabbitMQ.

##### **Adapter Pattern (4+1 variantes)**

1. **Persistence Adapter**: `UserPersistenceAdapter`
   - Traduce entre modelos de dominio y entidades JPA.
   - Mapeo: `UserJpaEntity` ↔ `User`
   - *Archivo:* `adapters/out/persistence/UserPersistenceAdapter.java` (líneas 68-80)

2. **Security Adapters**:
   - `BcryptPasswordHasherAdapter`: Bcrypt → `PasswordHasherPort`
   - `JwtTokenAdapter`: JWT → `TokenPort`
   - *Justificación:* Desacopla algoritmo criptográfico del dominio.

3. **Messaging Adapters**:
   - `RabbitUserEventPublisherAdapter`: RabbitMQ → `UserEventPublisherPort`
   - `NoOpUserEventPublisherAdapter`: Sin-op → `UserEventPublisherPort`
   - *Patrón adicional:* Null Object Pattern para deshabilitación elegante.

4. **HTTP Adapter**: `AuthController`
   - Traduce solicitudes HTTP a comandos de aplicación.
   - Mapeo: `RegisterRequest` ↔ `RegisterCommand`
   - *Archivo:* `adapters/in/web/AuthController.java`

##### **Strategy Pattern**
- `PasswordHasherPort`: Estrategia de hash intercambiable.
- `UserEventPublisherPort`: Estrategia de publicación (RabbitMQ vs. NoOp).

*Flexibilidad operacional:* Cambiar de estrategia mediante configuración (`@ConditionalOnProperty`) sin recompilación.

##### **Null Object Pattern**
- `NoOpUserEventPublisherAdapter`: Implementación neutra que ignora eventos cuando RabbitMQ está deshabilitado.
- *Ventaja:* Evita `if (eventPublisher != null)` en el código de aplicación.

##### **Value Object Pattern**
- `EmailNormalizer`: Encapsula la lógica de normalización de correo como una operación funcional pura.
- `AuthResult`: Record que encapsula resultado de autenticación (usuario + token).

##### **Exception Translation Pattern**
- `GlobalExceptionHandler`: Traduce excepciones de negocio (`ApiException`) a respuestas HTTP estandarizadas.
  - Códigos HTTP: 409 (CONFLICT para email duplicado), 401 (UNAUTHORIZED para credenciales inválidas), 404 (NOT_FOUND).
  - *Archivo:* `exception/GlobalExceptionHandler.java`

#### Flujos de Negocio Principales

##### POST /auth/register
1. `AuthController` recibe `RegisterRequest`, valida con `@Valid`.
2. Delega a `AuthUseCase.register(RegisterCommand)`.
3. `AuthApplicationService`:
   - Normaliza email con `EmailNormalizer.normalize()`.
   - Valida duplicidad con `userPersistencePort.existsByEmail()`.
   - Hash de password: `passwordHasherPort.hash()`.
   - Persiste: `userPersistencePort.save()`.
   - Genera JWT: `tokenPort.generate()`.
   - Publica evento: `userEventPublisherPort.publishUserCreated()`.
4. Retorna `AuthResult` (usuario + token).

##### POST /auth/login
1. `AuthController` recibe `LoginRequest`.
2. `AuthApplicationService`:
   - Normaliza email.
   - Busca usuario: `userPersistencePort.findByEmail()`.
   - Valida password: `passwordHasherPort.matches()`.
   - Genera JWT.
3. Responde con usuario + token.

##### GET /auth/me
1. `JwtAuthenticationFilter` valida Bearer token.
2. `AuthController` extrae `userId` del principal autenticado.
3. `AuthApplicationService.getMe()` consulta usuario.
4. Retorna perfil de usuario.

---

### 2. BOOKINGS-SERVICE: Gestión de Reservas

#### Descripción General
El `bookings-service` administra el ciclo de vida de las reservas (creación, consulta, cancelación, entrega y devolución). Implementa lógica transaccional compleja con validaciones de disponibilidad de espacios, gestión de equipos asociados y cambios de estado.

#### Principios SOLID Identificados

##### **S - Single Responsibility Principle**

- **`ReservationStatusCatalog.java`**: Responsable única de mapear y validar estados de reservas.
  - Contiene: `STATUS_PENDING`, `STATUS_CONFIRMED`, `STATUS_IN_PROGRESS`, `STATUS_COMPLETED`, `STATUS_CANCELLED`.
  - Métodos: normalización de estados, validación de estados permitidos, mapeo de estados administrativos a internos.
  - *Archivo:* `domain/model/ReservationStatusCatalog.java` (líneas 8-51)
  - *Justificación:* Centraliza la "fuente de verdad" sobre estados válidos, facilitando cambios futuros.

- **`Reservation.java`**: Modelo de dominio que encapsula los datos y comportamiento de una reserva.
  - Métodos: `isActive()`, `isConfirmed()`, `isCancelled()`, `isPast()`, `isUpcoming()`, `isOngoing()`.
  - *Justificación:* Concentra la lógica de consulta de estado sin depender de frameworks.
  - *Archivo:* `domain/model/Reservation.java` (líneas 6-111)

- **`CreateReservationCommand.java`**: Encapsula los parámetros de entrada para crear una reserva.
  - Record immutable que asegura que `equipmentIds` sea una colección no modificable.
  - *Justificación:* Segregación clara entre datos de entrada y lógica de procesamiento.
  - *Archivo:* `application/usecase/CreateReservationCommand.java` (líneas 7-41)

- **`BookingController.java`**: Mapea solicitudes HTTP a comandos y consultas de aplicación.
  - Responsabilidad única: traducir protocolo HTTP a conceptos de dominio.
  - *Archivo:* `adapters/in/web/BookingController.java` (líneas 37-180)

##### **O - Open/Closed Principle**

- **`BookingUseCase`** (interfaz): Contrato abierto para extensión mediante nuevos casos de uso sin modificar implementación.
  - *Métodos:* `checkAvailability()`, `createReservation()`, `updateReservation()`, `listReservations()`, `cancelReservation()`, `deliverReservation()`, `returnReservation()`.
  - *Extensibilidad:* Nuevos métodos pueden agregarse sin romper clientes existentes.

- **`ReservationEventPublisherPort`**: Permite agregar nuevos tipos de eventos sin modificar la aplicación.
  - Implementaciones intercambiables: RabbitMQ vs. NoOp.
  - *Patrón:* Strategy Pattern para publicación de eventos.

- **`SpaceAvailability`**: Model que encapsula lógica de disponibilidad, permitiendo evolución sin impacto en clientes.

##### **L - Liskov Substitution Principle**

- Adaptadores de persistencia implementan `BookingPersistencePort` de manera coherente.
- Adaptadores de eventos implementan `ReservationEventPublisherPort` intercambiablemente.
- Cada adaptador puede ser reemplazado sin cambiar el comportamiento observable de `BookingUseCase`.

##### **I - Interface Segregation Principle**

- **`BookingUseCase`**: Interfaz específica para casos de uso de reservas.
  - No incluye métodos de persistencia directa, seguridad o configuración.

- **`BookingPersistencePort`**: Contrato segregado para operaciones de persistencia.
  - Métodos específicos: crear, actualizar, buscar, listar, contar, cancelar, entregar, devolver.

- **`ReservationEventPublisherPort`**: Puerto segregado para publicación de eventos de reserva.

- **`TokenPort`**: Interfaz pequeña para validación de tokens JWT.

*Ventaja:* Implementadores no dependen de métodos innecesarios.

##### **D - Dependency Inversion Principle**

```
BookingApplicationService (aplicación)
        ↑ (depende de)
Puertos (abstracciones)
        ↑ (implementados por)
Adaptadores JDBC/RabbitMQ
```

- `BookingApplicationService` depende exclusivamente de puertos, no de implementaciones concretas.
- Inyección vía constructor: `BookingApplicationService(BookingPersistencePort, ReservationEventPublisherPort)`.

#### Patrones de Diseño Implementados

##### **Hexagonal Architecture**
```
domain/
├── model/Reservation.java
├── model/ReservationEquipment.java
├── model/SpaceAvailability.java
└── model/ReservationStatusCatalog.java

application/
├── port/in/BookingUseCase.java
├── port/out/BookingPersistencePort.java, ReservationEventPublisherPort.java, TokenPort.java
├── usecase/CreateReservationCommand.java, ListReservationsQuery.java, ...
└── service/BookingApplicationService.java

adapters/in/
└── web/BookingController.java, BookingHttpMapper.java

adapters/out/
├── persistence/JdbcReservationPersistenceAdapter.java
├── messaging/RabbitReservationEventPublisherAdapter.java, NoOpReservationEventPublisherAdapter.java
├── websocket/StompReservationRealtimeAdapter.java
└── security/JwtTokenAdapter.java

infrastructure/
├── config/WebSocketConfig.java, SecurityConfig.java, WebSocketProperties.java
└── security/JwtAuthenticationFilter.java
```

*Aislamiento de dominio:* El modelo de negocio (`Reservation`, `ReservationStatusCatalog`) no tiene anotaciones de Spring, JPA o JDBC.

##### **Command Query Responsibility Segregation (CQRS) - Parcial**

- **Comandos** (mutación de estado):
  - `CreateReservationCommand`: Crea nueva reserva.
  - `UpdateReservationCommand`: Actualiza datos de reserva.
  - `HandoverReservationCommand`: Entrega o devolución.
  - *Patrón:* Encapsulan intent de operación con datos necesarios.

- **Queries** (lectura de estado):
  - `ListReservationsQuery`: Filtra reservas por criterios (usuario, espacio, estado).
  - `AdminListReservationsQuery`: Consulta administrativa con paginación.
  - `CheckSpaceAvailabilityQuery`: Verifica disponibilidad.
  - *Patrón:* Segregan las operaciones de lectura de las mutaciones.

*Beneficio:* Escalabilidad: operaciones de lectura pueden optimizarse independientemente de escritura.

##### **State Pattern Implícito**
- `ReservationStatusCatalog` define los estados permitidos: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED (o CANCELLED).
- Métodos de `Reservation`: `isActive()`, `isConfirmed()`, `isCancelled()` encapsulan lógica de transición.

##### **Adapter Pattern - Variantes Múltiples**

1. **Persistence Adapter (JDBC)**: Implementa `BookingPersistencePort` usando `JdbcTemplate`.
   - Traduce queries SQL a objetos de dominio.

2. **Event Publisher Adapters**:
   - `RabbitReservationEventPublisherAdapter`: Publica a RabbitMQ.
   - `NoOpReservationEventPublisherAdapter`: No-op para deshabilitación.

3. **WebSocket Adapter**: `StompReservationRealtimeAdapter`
   - Publica eventos a clientes suscritos en tiempo real via STOMP/WebSocket.
   - *Implementación compleja:* Integra múltiples estrategias de transporte.

4. **HTTP Adapter**: `BookingController`
   - Mapea rutas REST a casos de uso.

##### **Strategy Pattern**
- Múltiples estrategias intercambiables:
  - `BookingPersistencePort`: Estrategia de persistencia (JDBC vs. futuro JPA).
  - `ReservationEventPublisherPort`: Estrategia de eventos (RabbitMQ vs. NoOp).
  - `TokenPort`: Estrategia de validación de tokens.

##### **Repository Pattern**
- `BookingPersistencePort` actúa como repositorio abstracto.
- `JdbcReservationPersistenceAdapter` implementa con JDBC.

##### **Value Object Pattern**
- `CreateReservationCommand`, `UpdateReservationCommand`: Encapsulan parámetros de entrada.
- `SpaceAvailability`: Encapsula información de disponibilidad sin ser una entidad mutable.
- `ReservationEquipment`: Value object que representa la relación entre reserva y equipo.

##### **Mapper Pattern**
- `BookingHttpMapper`: Traduce entre DTOs HTTP y objetos de dominio.
  - *Métodos:* `toResponse()`, `toAdminResponse()`, `toAvailabilityResponse()`.

##### **Exception Translation Pattern**
- `GlobalExceptionHandler`: Traduce excepciones a respuestas HTTP.
  - Códigos: 400 (validación), 404 (no encontrado), 409 (conflicto de disponibilidad), 403 (acceso denegado).

#### Estados de Reserva Manejados

```
Estados definidos en ReservationStatusCatalog:
├── STATUS_PENDING      = "pending"        // Pendiente de confirmación
├── STATUS_CONFIRMED    = "confirmed"      // Confirmada
├── STATUS_IN_PROGRESS  = "in_progress"    // En progreso (entregada)
├── STATUS_COMPLETED    = "completed"      // Completada (devuelta)
└── STATUS_CANCELLED    = "cancelled"      // Cancelada

Transiciones permitidas (implícitas en lógica):
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
        → CANCELLED (en cualquier momento, con validaciones)
```

#### Flujos de Negocio Principales

##### POST /bookings/reservations
1. Controller valida `CreateReservationRequest`.
2. Delega a `BookingUseCase.createReservation(CreateReservationCommand)`.
3. `BookingApplicationService`:
   - Valida disponibilidad del espacio en el rango de tiempo.
   - Valida equipos: existen, están disponibles, pertenecen a la ciudad del espacio.
   - Crea reserva con estado `PENDING`.
   - Persiste: `bookingPersistencePort.create()`.
   - Publica evento: `eventPublisherPort.publishReservationCreated()`.
   - Broadcast WebSocket: `realtimeAdapter.broadcastReservationCreated()`.
4. Responde con `ReservationResponse`.

##### PATCH /bookings/reservations/{id}/cancel
1. Valida que reserva no esté ya cancelada o completada.
2. Cambia estado a `CANCELLED`.
3. Publica evento: `ReservationCancelledEvent`.
4. Broadcast WebSocket.

##### PATCH /bookings/reservations/{id}/deliver
1. Valida que reserva esté confirmada.
2. Cambia estado a `IN_PROGRESS`.
3. Publica evento: `ReservationDeliveredEvent`.
4. Broadcast en tiempo real.

##### PATCH /bookings/reservations/{id}/return
1. Valida que reserva esté en progreso.
2. Cambia estado a `COMPLETED`.
3. Publica evento: `ReservationReturnedEvent`.
4. Libera equipos.

---

### 3. INVENTORY-SERVICE: Gestión de Inventario

#### Descripción General
El `inventory-service` administra equipos por ciudad, incluyendo estados (disponible, mantenimiento, retirado). Implementa validaciones de integridad referencial y publica eventos para sincronización con otros servicios.

#### Principios SOLID Identificados

##### **S - Single Responsibility Principle**

- **`InventoryApplicationService.java`**: Orquesta casos de uso de equipos.
  - Métodos: crear, listar, actualizar, eliminar equipos.
  - *Responsabilidad única:* Lógica de negocio de inventario.
  - *Archivo:* `application/service/InventoryApplicationService.java` (líneas 21-159)

- **Métodos privados especializados**:
  - `requirePositive()`: Valida que valores sean positivos.
  - `normalizeRequired()`: Normaliza y valida campos obligatorios.
  - `normalizeNullable()`: Normaliza campos opcionales.
  - `normalizeStatus()`: Valida y normaliza estados de equipo (`available`, `maintenance`, `retired`).
  - *Justificación:* Segregación de validaciones en responsabilidades específicas.
  - *Archivo:* líneas 123-158

- **`JdbcInventoryPersistenceAdapter.java`**: Responsabilidad única de persistencia JDBC.
  - *Archivo:* `adapters/out/persistence/JdbcInventoryPersistenceAdapter.java` (líneas 20-202)
  - Métodos especializados: `insertEquipment()`, `updateEquipment()`, `deleteEquipment()`, `findEquipmentById()`, `listEquipments()`.

- **`EquipmentEventPublisherPort`**: Contrato segregado para eventos de equipos.
  - *Implementaciones:* RabbitMQ y NoOp.

##### **O - Open/Closed Principle**

- **`InventoryUseCase`**: Interfaz abierta para extensión sin modificación.
  - *Archivo:* `application/port/in/InventoryUseCase.java` (líneas 11-21)
  - Nuevos comandos pueden agregarse sin cambiar implementación existente.

- **`EquipmentEventPublisherPort`**: Estrategia de eventos intercambiable.
  - `RabbitEquipmentEventPublisherAdapter`: Publica a RabbitMQ.
  - `NoOpEquipmentEventPublisherAdapter`: Fallback.
  - *Justificación:* Extensión de estrategias sin modificación de aplicación.

- **`InventoryPersistencePort`**: Abstracción abierta a diferentes tecnologías de persistencia.

##### **L - Liskov Substitution Principle**

- `RabbitEquipmentEventPublisherAdapter` y `NoOpEquipmentEventPublisherAdapter` son intercambiables sin sorpresas.
- Ambas respetan el contrato de `EquipmentEventPublisherPort`.

##### **I - Interface Segregation Principle**

- **`InventoryUseCase`**: Define únicamente métodos de casos de uso.
- **`InventoryPersistencePort`**: Contrato específico para persistencia.
  - *Métodos:* `cityExists()`, `insertEquipment()`, `listEquipments()`, `findEquipmentById()`, `updateEquipment()`, `deleteEquipment()`.
- **`EquipmentEventPublisherPort`**: Contrato específico para eventos.
  - *Métodos:* `publishEquipmentCreated()`, `publishEquipmentUpdated()`, `publishEquipmentDeleted()`.

*Beneficio:* Clientes no dependen de métodos innecesarios.

##### **D - Dependency Inversion Principle**

```
InventoryApplicationService
        ↑
Puertos (abstracciones)
        ↑
Adaptadores (JDBC, RabbitMQ)
```

- Inyección de dependencias invierte el control.
- Constructor: `InventoryApplicationService(InventoryPersistencePort, EquipmentEventPublisherPort)`.
- *Archivo:* líneas 29-33

#### Patrones de Diseño Implementados

##### **Hexagonal Architecture**
```
domain/
└── model/Equipment.java

application/
├── port/in/InventoryUseCase.java
├── port/out/InventoryPersistencePort.java, EquipmentEventPublisherPort.java
├── usecase/CreateEquipmentCommand.java, UpdateEquipmentCommand.java, ...
└── service/InventoryApplicationService.java

adapters/in/
└── web/EquipmentsController.java, InventoryHttpMapper.java

adapters/out/
├── persistence/JdbcInventoryPersistenceAdapter.java
└── messaging/RabbitEquipmentEventPublisherAdapter.java, NoOpEquipmentEventPublisherAdapter.java

infrastructure/
├── config/SecurityConfig.java, JwtProperties.java, RabbitProperties.java
└── security/JwtAuthenticationFilter.java
```

##### **Command Pattern**
- `CreateEquipmentCommand`: Encapsula parámetros para creación.
- `UpdateEquipmentCommand`: Encapsula parámetros para actualización.
- *Beneficio:* Separación clara entre entrada y procesamiento.

##### **Strategy Pattern**
- `EquipmentEventPublisherPort`: Estrategia de publicación.
- Implementaciones: RabbitMQ o NoOp.

##### **Adapter Pattern**
1. **Persistence Adapter (JDBC)**: `JdbcInventoryPersistenceAdapter`
   - Mapea objetos `Equipment` a filas en tabla `equipments`.
   - Método `toEquipment()`: Traduce `ResultSet` → `Equipment`.
   - *Archivo:* líneas 179-193

2. **Event Publisher Adapters**:
   - `RabbitEquipmentEventPublisherAdapter`: Envía eventos a RabbitMQ.
   - `NoOpEquipmentEventPublisherAdapter`: Implementación neutral.

3. **HTTP Adapter**: `EquipmentsController`
   - Mapea rutas REST a casos de uso.

##### **Repository Pattern**
- `InventoryPersistencePort` actúa como repositorio abstracto.
- Implementación JDBC en `JdbcInventoryPersistenceAdapter`.

##### **Value Object Pattern**
- `CreateEquipmentCommand`, `UpdateEquipmentCommand`: Inmutables, encapsulan datos de entrada.
- `EquipmentCreatedEvent`, `EquipmentUpdatedEvent`, `EquipmentDeletedEvent`: Events que encapsulan cambios de estado.

##### **Builder Pattern (Implícito)**
- `Equipment.toEquipment()` en adapter actúa como construcción de objeto desde resultados SQL.

##### **Null Object Pattern**
- `NoOpEquipmentEventPublisherAdapter`: Implementación neutra que no publica.
- Permite deshabilitar eventos sin código condicional.

#### Validaciones de Integridad

```
Validaciones implementadas:
├── Ciudad debe existir (referencia a tabla `cities`)
├── Nombre obligatorio y normalizado
├── Estado debe ser: "available", "maintenance", "retired"
├── Campos opcionales: serial, barcode, model, notes, imageUrl
├── No se permite eliminar equipo si está en reservas activas
└── Cambios publican eventos para sincronización
```

#### Flujos de Negocio Principales

##### POST /inventory/equipments
1. Controller valida `CreateEquipmentRequest`.
2. Delega a `InventoryUseCase.createEquipment(CreateEquipmentCommand)`.
3. `InventoryApplicationService`:
   - Valida: ciudad existe, nombre obligatorio, estado válido.
   - Inserta: `persistencePort.insertEquipment()`.
   - Publica evento: `eventPublisherPort.publishEquipmentCreated()`.
4. Retorna `Equipment` creado.

##### PUT /inventory/equipments/{id}
1. Valida que equipo exista.
2. Actualiza campos no-nulos.
3. Publica evento: `EquipmentUpdatedEvent`.

##### DELETE /inventory/equipments/{id}
1. Valida que equipo exista.
2. Elimina: `persistencePort.deleteEquipment()`.
3. Publica evento: `EquipmentDeletedEvent`.

---

### 4. LOCATIONS-SERVICE: Gestión de Ubicaciones

#### Descripción General
El `locations-service` administra ciudades y espacios. Implementa jerarquía: ciudades contienen espacios. Publica eventos para sincronización cross-servicio.

#### Principios SOLID Identificados

*Arquitectura análoga a `inventory-service` con especialización en ubicaciones.*

##### **S - Single Responsibility Principle**
- Lógica de negocio segregada en casos de uso específicos.
- Adaptadores especializados por tecnología (JDBC, RabbitMQ).

##### **O - Open/Closed Principle**
- Puertos abiertos a nuevas estrategias de persistencia y eventos.

##### **L - Liskov Substitution Principle**
- Adaptadores intercambiables respetando contratos.

##### **I - Interface Segregation Principle**
- Puertos granulares: `LocationsPersistencePort`, `LocationEventPublisherPort`.

##### **D - Dependency Inversion Principle**
- Inyección de puertos en servicio de aplicación.

#### Patrones de Diseño

- **Hexagonal Architecture**: Segregación clara dominio/aplicación/adaptadores.
- **Command Pattern**: `CreateCityCommand`, `CreateSpaceCommand`, `UpdateCityCommand`, etc.
- **Strategy Pattern**: Publicación de eventos (RabbitMQ vs. NoOp).
- **Repository Pattern**: `LocationsPersistencePort`.
- **Adapter Pattern**: JDBC, RabbitMQ, HTTP.

---

### 5. API-GATEWAY: Enrutamiento Centralizado

#### Descripción General
El API Gateway actúa como punto de entrada único, enrutando solicitudes a servicios específicos. Implementa seguridad, rate limiting, y composición de respuestas.

#### Principios Aplicables

##### **S - Single Responsibility**
- Responsabilidad: enrutamiento de solicitudes, validación de autenticación.

##### **O - Open/Closed**
- Nuevas rutas pueden agregarse sin modificar configuración existente (mediante configuración externalized).

##### **L - Liskov Substitution**
- Implementaciones de estrategias de enrutamiento son intercambiables.

#### Patrones

- **Facade Pattern**: Expone interfaz única que oculta complejidad de múltiples servicios.
- **Proxy Pattern**: Actúa como proxy transparente a servicios internos.
- **Chain of Responsibility**: Cadena de filtros (autenticación, logging, rate limiting).

---

### 6. NOTIFICATIONS-SERVICE: Notificaciones en Tiempo Real

#### Descripción General
Consume eventos de RabbitMQ y los retransmite via WebSocket STOMP a clientes suscritos. Implementa pub/sub en tiempo real.

#### Principios SOLID

##### **S - Single Responsibility**
- Responsabilidad única: consumir eventos y retransmitir.

##### **O - Open/Closed**
- Nuevas estrategias de transporte (gRPC, Socket.io) pueden agregarse sin modificar consumidor de eventos.

##### **D - Dependency Inversion**
- Desacoplamiento entre RabbitMQ y WebSocket mediante puertos internos.

#### Patrones

- **Observer/Publish-Subscribe Pattern**: Patrón central para notificaciones.
- **Adapter Pattern**: RabbitMQ → WebSocket.
- **Event-Driven Architecture**: Notificaciones basadas en eventos del dominio.

#### Canales WebSocket

```
Estructura de tópicos:
├── /topic/events                              // Todos los eventos
├── /topic/events.{channel}                    // Por dominio (auth, bookings, inventory, locations)
└── /topic/events.{routingKey}                 // Evento específico (bookings.reservation.created)

Ejemplos:
├── /topic/events.bookings.reservation.created
├── /topic/events.inventory.equipment.updated
└── /topic/events.auth.user.created
```

---

## II. FRONTEND - ANÁLISIS ARQUITECTÓNICO

### Descripción General

El Frontend está construido en React + TypeScript con una arquitectura hexagonal similar a la del backend, aunque con patrones específicos para cliente.

### Estructura Arquitectónica

```
src/
├── core/                        # Núcleo independiente de framework
│   ├── domain/
│   │   ├── entities/            # Modelos de dominio
│   │   │   ├── User.ts
│   │   │   ├── Reservation.ts
│   │   │   ├── Location.ts
│   │   │   └── errors/
│   │   └── errors/              # Excepciones de dominio
│   └── ports/
│       ├── repositories/        # Interfaces de datos
│       │   ├── IAuthRepository.ts
│       │   ├── IReservationRepository.ts
│       │   ├── IInventoryRepository.ts
│       │   └── ILocationRepository.ts
│       └── services/            # Interfaces de servicios
│           ├── IHttpClient.ts
│           ├── IStorageService.ts
│           └── IWebSocketService.ts
│
├── application/                 # Lógica de casos de uso
│   └── use-cases/
│       ├── auth/                # Autenticación
│       ├── dashboard/           # Dashboard
│       ├── reservations/        # Gestión de reservas
│       │   ├── GetUserReservationsUseCase.ts
│       │   ├── CreateReservationUseCase.ts
│       │   ├── CancelReservationUseCase.ts
│       │   ├── DeliverReservationUseCase.ts
│       │   └── ReturnReservationUseCase.ts
│       └── delivery/            # Entregas
│
├── infrastructure/              # Implementaciones técnicas
│   ├── http/                    # Cliente HTTP (Axios wrapper)
│   ├── repositories/            # Implementaciones de IRepository
│   │   ├── HttpAuthRepository.ts
│   │   ├── HttpReservationRepository.ts
│   │   ├── HttpInventoryRepository.ts
│   │   ├── HttpLocationRepository.ts
│   │   └── HttpDeliveryRepository.ts
│   ├── mappers/                 # Traducción API ↔ Dominio
│   │   ├── UserMapper.ts
│   │   ├── ReservationMapper.ts
│   │   ├── InventoryMapper.ts
│   │   └── LocationMapper.ts
│   ├── storage/                 # Persistencia local
│   │   └── LocalStorageService.ts
│   └── websocket/               # Comunicación en tiempo real
│       └── StompWebSocketService.ts
│
├── ui/                          # Componentes de presentación (React)
│   ├── pages/                   # Páginas (componentes de nivel superior)
│   │   ├── auth/LoginPage.jsx
│   │   ├── signup/SignupPage.jsx
│   │   ├── dashboard/DashboardPage.jsx
│   │   ├── reservations/MyReservationsPage.jsx
│   │   └── admin-reservations/AdminReservationsPage.jsx
│   ├── components/              # Componentes reutilizables
│   │   ├── auth/
│   │   ├── reservations/
│   │   ├── dashboard/
│   │   ├── common/
│   │   └── admin-reservations/
│   ├── layouts/
│   └── styles/
│
├── features/                    # Feature modules (agrupación de funcionalidad)
│   └── reservations/
│       └── services/
│
└── routes/AppRouter.jsx         # Definición de rutas
```

### Principios SOLID en Frontend

#### **S - Single Responsibility Principle**

- **`Reservation.ts`**: Clase de dominio con responsabilidad única: representar una reserva.
  - Métodos: `isActive()`, `isConfirmed()`, `isCancelled()`, `isPast()`, `isUpcoming()`, `isOngoing()`, `overlaps()`.
  - *Archivo:* `core/domain/entities/Reservation.ts` (líneas 15-125)
  - No contiene lógica de persistencia, HTTP o rendering.

- **Casos de uso segregados**:
  - `GetUserReservationsUseCase.ts`: Responsabilidad única: obtener reservas del usuario.
  - `CancelReservationUseCase.ts`: Responsabilidad única: cancelar reserva.
  - `DeliverReservationUseCase.ts`: Responsabilidad única: marcar como entregada.
  - *Archivo:* `application/use-cases/reservations/` (líneas 1-13)

- **`LocalStorageService.ts`**: Responsabilidad única: persistencia local.
  - No mezcla lógica de negocio, HTTP o UI.

- **`UserMapper.ts`**: Responsabilidad única: traducción API ↔ Dominio.
  - Métodos: `toDomain()`, `toApi()`.

- **Componentes React presentacionales**:
  - `ReservationCard.jsx`: Presenta tarjeta de reserva.
  - `ReservationList.jsx`: Lista de reservas.
  - Delegan lógica de negocio a casos de uso.

#### **O - Open/Closed Principle**

- **Interfaces de puertos**:
  - `IReservationRepository.ts`: Abierta para nuevas implementaciones (Mock, LocalStorage, etc).
  - `IHttpClient.ts`: Abierta a nuevas estrategias de comunicación.
  - `IStorageService.ts`: Abierta a IndexedDB, SessionStorage, etc.
  - `IWebSocketService.ts`: Abierta a Socket.io, alternatives.

- *Beneficio:* Nuevas estrategias pueden agregarse sin modificar código existente.

#### **L - Liskov Substitution Principle**

- `HttpReservationRepository` y futuras implementaciones son intercambiables.
- Respetan contrato de `IReservationRepository` sin sorpresas.
- *Ejemplo:* Mock repository para tests puede usarse igual que implementación HTTP.

#### **I - Interface Segregation Principle**

- **`IReservationRepository.ts`**: Interfaz segregada para operaciones de reserva.
  - *Métodos:* `create()`, `update()`, `getByUserId()`, `getById()`, `cancel()`, `deliver()`, `returnReservation()`, `getAvailability()`.
  - *Archivo:* `core/ports/repositories/IReservationRepository.ts` (líneas 18-27)

- **`IAuthRepository.ts`**: Interfaz segregada para autenticación.
- **`IInventoryRepository.ts`**: Interfaz segregada para inventario.
- **`ILocationRepository.ts`**: Interfaz segregada para ubicaciones.

- **`IHttpClient.ts`**: Interfaz pequeña para HTTP.
  - *Métodos:* `get()`, `post()`, `put()`, `patch()`, `delete()`.

- **`IStorageService.ts`**: Interfaz pequeña para persistencia local.
  - *Métodos:* `set()`, `get()`, `remove()`, `clear()`.

*Beneficio:* Implementadores no dependen de métodos innecesarios.

#### **D - Dependency Inversion Principle**

```
Casos de uso (aplicación)
        ↑ (dependen de)
Interfaces de puertos
        ↑ (implementadas por)
Repositorios/Servicios (infraestructura)
```

- *Ejemplo:*
  ```typescript
  // GetUserReservationsUseCase depende de interfaz, no de implementación
  constructor(private readonly reservationRepository: IReservationRepository) {}
  
  // HttpReservationRepository implementa interfaz
  export class HttpReservationRepository implements IReservationRepository { ... }
  ```

- Inyección via contenedor DI (container.ts) permite cambiar implementaciones en tiempo de configuración.

### Patrones de Diseño en Frontend

#### **Hexagonal Architecture Adaptada a Frontend**

La arquitectura se materializa en capas:
1. **Core (Dominio)**: Entidades, puertos, lógica pura.
2. **Application**: Casos de uso que orquestan interacciones.
3. **Infrastructure**: Implementaciones técnicas (HTTP, Storage, WebSocket).
4. **UI (Presentación)**: Componentes React, páginas.

*Justificación:* Separación de concerns facilita testing, mantenimiento y evolución.

#### **Repository Pattern**

```typescript
// Puerto (Interfaz)
export interface IReservationRepository {
    create(reservationData: ...): Promise<Reservation>;
    getByUserId(userId: string): Promise<Reservation[]>;
    cancel(id: string): Promise<void>;
    // ...
}

// Adapter (Implementación HTTP)
export class HttpReservationRepository implements IReservationRepository {
    constructor(private httpClient: IHttpClient, private storageService: IStorageService) {}
    
    async create(reservationData): Promise<Reservation> {
        const payload = ReservationMapper.toApi(reservationData);
        const response = await this.httpClient.post('/bookings/reservations', payload);
        return ReservationMapper.toDomain(response.data);
    }
}
```

*Beneficio:* Abstracción de persistencia permite testing sin servidor real.

#### **Mapper Pattern (Data Transfer Object)**

```typescript
// UserMapper traduce entre capas
export class UserMapper {
    static toDomain(raw: unknown): User {
        // Transforma API response → Entidad de dominio
    }
    
    static toApi(user: User): Record<string, unknown> {
        // Transforma Entidad de dominio → Payload API
    }
}
```

*Uso:* En `HttpReservationRepository`, cada método mapea entrada/salida.

#### **Use Case Pattern**

```typescript
// Caso de uso encapsula lógica de negocio
export class CancelReservationUseCase {
    constructor(private reservationRepository: IReservationRepository) {}
    
    async execute(reservationId: string): Promise<void> {
        // Validaciones, orquestación
        await this.reservationRepository.cancel(reservationId);
    }
}
```

*Ventaja:* Lógica reutilizable en múltiples componentes/páginas.

#### **Dependency Injection (Manual DI Container)**

```typescript
// container.ts
export class ServiceContainer {
    private static instance: ServiceContainer;
    private services: Map<string, any> = new Map();
    
    static getInstance(): ServiceContainer {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer();
        }
        return ServiceContainer.instance;
    }
    
    register<T>(key: string, service: T): void {
        this.services.set(key, service);
    }
    
    resolve<T>(key: string): T {
        const service = this.services.get(key);
        if (!service) throw new Error(`Service ${key} not registered`);
        return service;
    }
}

// Uso en componentes
const reservationRepo = ServiceContainer.getInstance().resolve<IReservationRepository>('reservationRepository');
```

*Beneficio:* Configuración centralizada de dependencias; facilita testing con mocks.

#### **Observer/Pub-Sub (WebSocket)**

```typescript
// StompWebSocketService
export class StompWebSocketService implements IWebSocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, Subscription> = new Map();
    
    async subscribe(topic: string, callback: (message: any) => void): Promise<void> {
        const subscription = this.client!.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });
        this.subscriptions.set(topic, subscription);
    }
}
```

*Uso:* Notificaciones en tiempo real de cambios en reservas, equipos, etc.

#### **Facade Pattern (Service Locator)**

Componentes React usan container para acceder a servicios sin conocer implementación:

```jsx
// Componente React
export function ReservationList() {
    const reservationRepo = ServiceContainer.getInstance()
        .resolve<IReservationRepository>('reservationRepository');
    
    useEffect(() => {
        const useCase = new GetUserReservationsUseCase(reservationRepo);
        useCase.execute(userId).then(setReservations);
    }, [userId]);
    
    return <div>{/* Renderiza lista */}</div>;
}
```

#### **State Machine Pattern (Implícito)**

Entidad `Reservation` encapsula estados y transiciones:

```typescript
export class Reservation {
    isActive(): boolean {
        return ['active', 'confirmed', 'pending', 'created', 'in_progress'].includes(this.status?.toLowerCase());
    }
    
    isCancelled(): boolean {
        return this.status?.toLowerCase() === 'cancelled';
    }
    
    overlaps(startAt: Date, endAt: Date): boolean {
        return this.startAt < endAt && this.endAt > startAt;
    }
}
```

*Beneficio:* Lógica de estado centralizada, reutilizable.

#### **Async/Await Pattern para Promesas**

Casos de uso y repositorios usan `async/await` para operaciones asíncronas:

```typescript
async execute(userId: string): Promise<Reservation[]> {
    if (!userId) throw new Error('User ID is required');
    return await this.reservationRepository.getByUserId(userId);
}
```

#### **Error Handling Pattern**

Clase `AuthenticationError` personalizada:

```typescript
export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}
```

*Uso:* Captura específica de errores de autenticación en componentes.

### Integración Frontend-Backend

#### **HTTP Adapter con Wrapper de Respuestas**

`HttpReservationRepository` maneja dos formatos de respuesta:

```typescript
interface ApiResponse<T = unknown> {
    ok: boolean;
    message?: string;
    data?: T;
}

function isWrappedResponse(raw: unknown): raw is ApiResponse {
    return typeof (raw as ApiResponse).ok === 'boolean';
}

async create(reservationData): Promise<Reservation> {
    const response = await this.httpClient.post('/bookings/reservations', payload);
    const raw = response.data;
    
    if (isWrappedResponse(raw)) {
        if (!raw.ok) throw new Error(raw.message);
        return ReservationMapper.toDomain(raw.data);
    }
    
    // Fallback para respuesta directa
    return ReservationMapper.toDomain(raw);
}
```

*Flexibilidad:* Adaptable a cambios en formato de respuesta API.

#### **WebSocket en Tiempo Real**

`StompWebSocketService` integra STOMP para notificaciones:

```typescript
export class StompWebSocketService implements IWebSocketService {
    private client: Client | null = null;
    
    async connect(url: string): Promise<void> {
        this.client = new Client({
            brokerURL: url,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });
        
        await new Promise((resolve) => {
            this.client!.onConnect = () => resolve(undefined);
            this.client!.activate();
        });
    }
    
    async subscribe(topic: string, callback: (msg: any) => void): Promise<void> {
        this.client!.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });
    }
}
```

*Uso:* Notificaciones bidireccionales para cambios en reservas.

---

## III. PATRONES TRANSVERSALES

### 1. Command Query Responsibility Segregation (CQRS) - Parcial

**Backend Bookings-Service:**
- **Comandos:** `CreateReservationCommand`, `UpdateReservationCommand`, `HandoverReservationCommand`
- **Queries:** `ListReservationsQuery`, `AdminListReservationsQuery`, `CheckSpaceAvailabilityQuery`

**Frontend:**
- **Comandos:** Casos de uso de mutación (`CreateReservationUseCase`, `CancelReservationUseCase`)
- **Queries:** Casos de uso de lectura (`GetUserReservationsUseCase`)

*Beneficio:* Escalabilidad, optimización independiente de lectura/escritura.

### 2. Event-Driven Architecture

**Publicadores de Eventos:**
- `auth-service`: `UserCreatedEvent`
- `bookings-service`: `ReservationCreatedEvent`, `ReservationCancelledEvent`, `ReservationDeliveredEvent`, `ReservationReturnedEvent`
- `inventory-service`: `EquipmentCreatedEvent`, `EquipmentUpdatedEvent`, `EquipmentDeletedEvent`
- `locations-service`: Eventos de ciudad y espacio

**Consumidor:**
- `notifications-service`: Escucha todos los eventos y retransmite via WebSocket

*Arquitectura:* Event Sourcing + Pub-Sub = Sincronización eventual entre servicios.

### 3. Strangler Pattern (API Gateway)

El `api-gateway` actúa como fachada única, permitiendo evolución gradual de servicios internos sin impacto en clientes.

### 4. Circuit Breaker Pattern (Implícito)

Aunque no documentado explícitamente, la arquitectura permite implementar Circuit Breaker en adaptadores HTTP para resilencia ante fallos de servicios.

### 5. Mapper Pattern (Bidireccional)

**Backend:**
- `AuthHttpMapper`, `BookingHttpMapper`, `InventoryHttpMapper`: DTO ↔ Dominio

**Frontend:**
- `UserMapper`, `ReservationMapper`, `InventoryMapper`, `LocationMapper`: API ↔ Dominio

*Justificación:* Desacoplamiento entre protocolos de comunicación y lógica empresarial.

---

## IV. VERIFICACIÓN DE ESTADOS DE RESERVA

### Estados Identificados en Backend

```
Definición en ReservationStatusCatalog.java:
├── STATUS_PENDING      = "pending"        // Creada, pendiente de confirmación
├── STATUS_CONFIRMED    = "confirmed"      // Confirmada por administrador/sistema
├── STATUS_IN_PROGRESS  = "in_progress"    // Entregada al usuario
├── STATUS_COMPLETED    = "completed"      // Devuelta por usuario
└── STATUS_CANCELLED    = "cancelled"      // Cancelada por usuario o administrador

Transiciones permitidas (según BookingController y flujos):
PENDING → CONFIRMED (automática o manual)
CONFIRMED → IN_PROGRESS (mediante PATCH /deliver)
IN_PROGRESS → COMPLETED (mediante PATCH /return)
* → CANCELLED (mediante PATCH /cancel, con validaciones según estado)
```

### Estados en Frontend

```
Métodos de Reservation.ts:
├── isActive()      // Retorna true si está en pendiente, confirmada, en progreso
├── isConfirmed()   // Retorna true si está confirmada
├── isCancelled()   // Retorna true si está cancelada
├── isCompleted()   // Retorna true si está completada
├── isPast()        // Retorna true si la fecha de fin pasó
├── isUpcoming()    // Retorna true si no es pasada ni cancelada
└── isOngoing()     // Retorna true si la reserva está en progreso ahora
```

---

## V. CONCLUSIONES Y RECOMENDACIONES

### Fortalezas Arquitectónicas

1. **Hexagonal Architecture Bien Aplicada**: Segregación clara entre dominio, aplicación e infraestructura en todos los servicios.

2. **Principios SOLID Consistentemente Implementados**:
   - SRP: Cada clase tiene responsabilidad única bien definida.
   - OCP: Puertos permiten extensión sin modificación.
   - LSP: Adaptadores intercambiables respetan contratos.
   - ISP: Interfaces granulares, no monolíticas.
   - DIP: Inyección de dependencias invierte control.

3. **Patrones de Diseño Diversos y Apropiados**:
   - Adapter, Strategy, Repository, Command, Observer, etc.
   - Selección contextual según necesidad de cada servicio.

4. **Consistencia Conceptual Frontend-Backend**:
   - Ambos implementan arquitectura hexagonal.
   - Ambos segregan dominio, aplicación, infraestructura.
   - Ambos usan mappers para traducción de datos.

5. **Testabilidad Inherente**:
   - Desacoplamiento facilita testing unitario con mocks.
   - Casos de uso aislables de persistencia/HTTP/UI.

### Áreas de Mejora

1. **Documentación de Transiciones de Estado**:
   - Considerar diagrama de estados explícito en `ReservationStatusCatalog`.
   - Validaciones más estrictas de transiciones.

2. **Consistencia de Versionado API**:
   - Considerar versionado explícito (/v1/, /v2/) en endpoints.

3. **Circuit Breaker y Resilencia**:
   - Implementar resiliencia formal entre servicios.
   - Retry logic, timeout policies.

4. **Observabilidad**:
   - Logging centralizado, tracing distribuido (OpenTelemetry).
   - Métricas de rendimiento de servicios.

5. **Validación Compartida**:
   - Esquemas compartidos (e.g., JSON Schema) para validaciones consistentes.

---

## VI. MATRIZ DE REFERENCIA: PRINCIPIOS SOLID Y PATRONES

| Principio/Patrón | Auth-Service | Bookings-Service | Inventory-Service | Locations-Service | Frontend |
|---|---|---|---|---|---|
| **S - Single Responsibility** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **O - Open/Closed** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **L - Liskov Substitution** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **I - Interface Segregation** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **D - Dependency Inversion** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Hexagonal Architecture** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Adapter Pattern** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Strategy Pattern** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Repository Pattern** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Command Pattern** | - | ✓ | ✓ | ✓ | ✓ |
| **CQRS (Parcial)** | - | ✓ | - | - | ✓ |
| **Event-Driven** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Mapper Pattern** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Dependency Injection** | ✓ | ✓ | ✓ | ✓ | ✓ |

---

**Fin del Análisis Técnico**

*Documento generado: 2026-04-08*  
*Cobertura: Backend (6 servicios), Frontend (React + TypeScript)*  
*Enfoque: Principios SOLID, Patrones de Diseño, Arquitectura Hexagonal*

