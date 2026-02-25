# Frontend — Sistema de Reservas Sofka

Sistema de gestión de reservas de espacios y equipos construido con **React 19** y una **Arquitectura Hexagonal (Puertos y Adaptadores)** que garantiza separación de responsabilidades, testabilidad y mantenibilidad a largo plazo.

---

## Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
  - [Diagrama General](#diagrama-general)
  - [Estructura de Carpetas](#estructura-de-carpetas)
  - [Flujo de Datos](#flujo-de-datos)
- [Capas de la Arquitectura](#capas-de-la-arquitectura)
  - [Capa de Dominio (Core)](#1-capa-de-dominio-core)
  - [Capa de Aplicación](#2-capa-de-aplicación)
  - [Capa de Infraestructura](#3-capa-de-infraestructura)
  - [Capa de Presentación (UI)](#4-capa-de-presentación-ui)
- [Patrones de Diseño](#patrones-de-diseño)
- [Principios SOLID](#principios-solid)
- [Inyección de Dependencias](#inyección-de-dependencias)
- [Comunicación en Tiempo Real](#comunicación-en-tiempo-real)
- [Estrategia de Manejo de Errores](#estrategia-de-manejo-de-errores)
- [Testing](#testing)
- [Scripts Disponibles](#scripts-disponibles)
- [Variables de Entorno](#variables-de-entorno)

---

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.2.0 | Librería de UI |
| **React Router DOM** | 7.13.0 | Enrutamiento SPA |
| **Axios** | 1.13.5 | Cliente HTTP |
| **@stomp/stompjs** | 7.3.0 | WebSocket (STOMP) en tiempo real |
| **Vite** | 7.3.1 | Bundler y dev server |
| **Vitest** | 4.0.18 | Framework de testing |
| **Testing Library** | React 16 / DOM 10 | Testing de componentes |
| **ESLint** | 9.39.1 | Linting y calidad de código |

> **Gestión de estado**: Se utiliza exclusivamente React hooks nativos (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`) + React Context — sin librerías externas de estado.

---

## Arquitectura

El frontend implementa una **Arquitectura Hexagonal (Ports & Adapters)**, también conocida como **Clean Architecture**, donde la lógica de negocio está completamente desacoplada del framework (React), de las librerías HTTP (Axios) y de cualquier detalle de infraestructura.

### Diagrama General

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN (UI)                       │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  Pages   │  │Components│  │  Layouts   │  │     Styles       │  │
│  └────┬─────┘  └────┬─────┘  └────────────┘  └──────────────────┘  │
│       │              │                                               │
│       ▼              ▼                                               │
│  ┌─────────────────────────────┐                                     │
│  │    Adapter Hooks (Input)    │◄── useLogin, useReservation, ...    │
│  └──────────────┬──────────────┘                                     │
└─────────────────┼───────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CAPA DE APLICACIÓN                               │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                    Casos de Uso                              │     │
│  │  LoginUseCase · RegisterUseCase · CreateReservationUseCase  │     │
│  │  CancelReservationUseCase · GetLocationsUseCase · ...       │     │
│  └──────────────────────────┬──────────────────────────────────┘     │
└─────────────────────────────┼───────────────────────────────────────┘
                              │ depende de
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CAPA DE DOMINIO (CORE)                           │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────────┐       │
│  │   Entidades   │  │    Puertos    │  │  Errores de        │       │
│  │  User         │  │ IAuthRepo     │  │  Dominio           │       │
│  │  Reservation  │  │ IReservRepo   │  │  AuthenticationErr │       │
│  │  Location     │  │ ILocationRepo │  │  InvalidCredentials│       │
│  │  InventoryItem│  │ IInventoryRepo│  │  TokenExpiredError │       │
│  └───────────────┘  │ IHttpClient   │  └────────────────────┘       │
│                      │ IStorageServ  │                               │
│                      │ IWebSocketServ│                               │
│                      └───────┬───────┘                               │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ implementa
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CAPA DE INFRAESTRUCTURA                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────┐   │
│  │ Repositories │  │   Mappers    │  │  HTTP    │  │  Storage  │   │
│  │ HttpAuthRepo │  │ UserMapper   │  │AxiosHttp│  │LocalStore │   │
│  │ HttpResRepo  │  │ ResMapper    │  │ Client  │  │ Service   │   │
│  │ HttpLocRepo  │  │ LocMapper    │  │HttpClient│ └───────────┘   │
│  │ HttpInvRepo  │  │ InvMapper    │  │ Factory │  ┌───────────┐   │
│  └──────────────┘  └──────────────┘  └──────────┘  │ WebSocket │   │
│                                                      │StompWS    │   │
│                                                      │ Service   │   │
│                                                      └───────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Estructura de Carpetas

```
src/
├── core/                                   # NÚCLEO DEL DOMINIO
│   ├── domain/                             # Entidades y reglas de negocio
│   │   ├── entities/                       # User, Reservation, Location, InventoryItem
│   │   └── errors/                         # Jerarquía de errores de dominio
│   │
│   ├── ports/                              # Contratos / Interfaces
│   │   ├── repositories/                   # IAuthRepository, IReservationRepository, ...
│   │   └── services/                       # IHttpClient, IStorageService, IWebSocketService
│   │
│   └── adapters/                           # Adaptadores de ENTRADA (hacia la UI)
│       ├── hooks/                          # useLogin, useReservation, useBookingEvents, ...
│       ├── providers/                      # DependencyProvider (React Context bridge)
│       └── di/                             # Contenedor de Inyección de Dependencias
│
├── application/                            # CASOS DE USO
│   └── use-cases/
│       ├── auth/                           # Login, Register, Logout, GetCurrentUser
│       ├── dashboard/                      # GetLocations, GetInventory, CreateReservation, ...
│       └── reservations/                   # GetUserReservations, CancelReservation
│
├── infrastructure/                         # ADAPTADORES DE SALIDA
│   ├── http/
│   │   └── clients/                        # AxiosHttpClient, HttpClientFactory
│   ├── repositories/                       # HttpAuthRepository, HttpReservationRepository, ...
│   ├── mappers/                            # UserMapper, ReservationMapper, LocationMapper, ...
│   ├── storage/                            # LocalStorageService
│   └── websocket/                          # StompWebSocketService
│
├── ui/                                     # CAPA DE PRESENTACIÓN
│   ├── components/
│   │   ├── auth/                           # LoginForm
│   │   ├── signup/                         # SignupForm
│   │   ├── common/                         # Header, Pagination, ProtectedRoute
│   │   ├── dashboard/                      # ItemCard, SearchBar, modales de reserva
│   │   └── reservations/                   # ReservationCard, ReservationList, FilterBar
│   ├── layouts/                            # MainLayout
│   ├── pages/                              # LoginPage, SignupPage, DashboardPage, MyReservationsPage
│   └── styles/                             # Estilos globales
│
├── routes/                                 # AppRouter — configuración de rutas
├── context/                                # ThemeContext (tema claro/oscuro)
└── main.jsx                                # Composition Root
```

### Flujo de Datos

El flujo de una acción del usuario sigue siempre la misma dirección unidireccional:

```
UI Component → Adapter Hook → Use Case → Port (Interface) → Repository (Infra) → API Backend
     ▲                                                                              │
     │                          Mapper (DTO → Entity)                               │
     └──────────────────────────────────────────────────────────────────────────────┘
```

**Ejemplo — Login:**

1. `LoginPage` renderiza `LoginForm`
2. El usuario envía credenciales → `LoginForm` llama a `handleLogin()` del hook `useLogin`
3. `useLogin` invoca `loginUseCase.execute(email, password)`
4. `LoginUseCase` valida los datos y delega a `authRepository.login(email, password)` (interfaz)
5. `HttpAuthRepository` (implementación concreta) hace la petición HTTP vía `AxiosHttpClient`
6. La respuesta pasa por `UserMapper.toDomain()` para transformar el DTO a entidad `User`
7. El hook `useLogin` recibe la entidad y actualiza el estado React de la UI

---

## Capas de la Arquitectura

### 1. Capa de Dominio (Core)

Es el corazón de la aplicación. **No tiene dependencias externas** — ni React, ni Axios, ni nada fuera del propio JavaScript.

#### Entidades

Clases con lógica de negocio encapsulada:

| Entidad | Responsabilidad | Métodos destacados |
|---|---|---|
| `User` | Modelo de usuario con roles | `isAdmin()`, `hasRole()`, `validate()`, `serialize()` |
| `Reservation` | Reserva con lógica temporal | `isActive()`, `isUpcoming()`, `overlaps(other)`, `getDurationHours()`, `canBeCancelled()` |
| `Location` | Espacio reservable | `hasCapacityFor(n)`, `hasAmenity(name)`, `validate()` |
| `InventoryItem` | Equipo asignable | `isAvailable()`, `hasEnoughQuantity(n)`, `validate()` |

#### Puertos (Interfaces)

Contratos que definen **qué** necesita la aplicación sin especificar **cómo** se implementa:

| Puerto | Métodos | Propósito |
|---|---|---|
| `IAuthRepository` | `login`, `register`, `logout`, `getCurrentUser`, `isAuthenticated`, `getStoredUser` | Operaciones de autenticación |
| `IReservationRepository` | `create`, `getByUserId`, `getById`, `cancel`, `getAvailability` | Gestión de reservas |
| `ILocationRepository` | `getAll`, `getById`, `search`, `assignInventory`, `removeInventory` | Gestión de ubicaciones |
| `IInventoryRepository` | `getAll`, `getById`, `getByCityId`, `search` | Gestión de inventario |
| `IHttpClient` | `get`, `post`, `put`, `delete`, `addRequestInterceptor`, `addResponseInterceptor` | Comunicación HTTP |
| `IStorageService` | `get`, `set`, `remove`, `clear`, `has` | Persistencia local |
| `IWebSocketService` | `connect`, `disconnect`, `subscribe`, `isConnected` | Comunicación en tiempo real |

#### Errores de Dominio

Jerarquía de errores tipados que permiten un manejo granular:

```
AuthenticationError (base)
  ├── InvalidCredentialsError   (código: INVALID_CREDENTIALS)
  ├── TokenExpiredError         (código: TOKEN_EXPIRED)
  ├── UnauthorizedError         (código: UNAUTHORIZED)
  └── RegistrationError         (código: REGISTRATION_FAILED)
```

### 2. Capa de Aplicación

Contiene los **Casos de Uso** — orquestadores que coordinan entidades y puertos para cumplir un requerimiento del negocio. Cada caso de uso:

- Recibe dependencias por **constructor** (inyección de dependencias).
- Expone un único método `execute()`.
- Valida la entrada antes de delegar a la capa de dominio/infraestructura.

| Módulo | Casos de Uso |
|---|---|
| **Auth** | `LoginUseCase`, `RegisterUseCase`, `LogoutUseCase`, `GetCurrentUserUseCase` |
| **Dashboard** | `GetLocationsUseCase`, `GetInventoryUseCase`, `CreateReservationUseCase`, `AssignInventoryUseCase`, `RemoveInventoryUseCase`, `GetSpaceAvailabilityUseCase` |
| **Reservations** | `GetUserReservationsUseCase`, `CancelReservationUseCase` |

**Ejemplo de caso de uso:**

```javascript
// LoginUseCase.js
export class LoginUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;  // Depende de la INTERFAZ, no de la implementación
  }

  async execute(email, password) {
    if (!email || !password) {
      throw new InvalidCredentialsError('Email y contraseña son requeridos');
    }
    return await this.authRepository.login(email, password);
  }
}
```

### 3. Capa de Infraestructura

Contiene las **implementaciones concretas** de los puertos. Es la única capa que conoce los detalles técnicos (Axios, localStorage, STOMP, formato de las APIs).

#### Repositorios HTTP

Implementan las interfaces de repositorio usando clientes HTTP:

| Repositorio | Implementa | Microservicio destino |
|---|---|---|
| `HttpAuthRepository` | `IAuthRepository` | auth-service |
| `HttpReservationRepository` | `IReservationRepository` | bookings-service |
| `HttpLocationRepository` | `ILocationRepository` | locations-service |
| `HttpInventoryRepository` | `IInventoryRepository` | inventory-service |

#### Mappers (Transformadores de Datos)

Transforman entre los DTOs de la API y las entidades de dominio:

| Mapper | Métodos principales |
|---|---|
| `UserMapper` | `toDomain(dto)`, `toDomainList(dtos)` |
| `ReservationMapper` | `toDomain(dto)`, `toDomainList(dtos)`, `toApi(entity)`, `normalizeStatus(status)` |
| `LocationMapper` | `toDomain(dto)`, `toDomainList(dtos)` |
| `InventoryMapper` | `toDomain(dto)`, `toDomainList(dtos)` |

#### Clientes HTTP y Almacenamiento

| Adaptador | Implementa | Tecnología |
|---|---|---|
| `AxiosHttpClient` | `IHttpClient` | Axios |
| `HttpClientFactory` | — | Factory que crea clientes preconfigurados por microservicio |
| `LocalStorageService` | `IStorageService` | `window.localStorage` |
| `StompWebSocketService` | `IWebSocketService` | `@stomp/stompjs` |

### 4. Capa de Presentación (UI)

Contiene **exclusivamente** componentes React, páginas y estilos. Los componentes:

- **No importan** repositorios ni infraestructura directamente.
- Obtienen sus datos a través de **Adapter Hooks** expuestos por `core/adapters/hooks/`.
- Acceden a las dependencias mediante el `DependencyProvider` (React Context).

| Tipo | Elementos |
|---|---|
| **Pages** | `LoginPage`, `SignupPage`, `DashboardPage`, `MyReservationsPage` |
| **Components** | `LoginForm`, `SignupForm`, `Header`, `ProtectedRoute`, `Pagination`, `ItemCard`, `SearchBar`, `ReservationCard`, `ReservationList`, `ReservationFilterBar`, `ReservationModal`, `Calendar`, `DurationSelector`, `EquipmentSelector`, `InventoryAssignmentModal` |
| **Layouts** | `MainLayout` (Header + Outlet de React Router) |

---

## Patrones de Diseño

### 1. Patrón Adapter (Adaptador)

**Propósito:** Convertir la interfaz de una clase en otra interfaz que los clientes esperan.

| Adaptador | Interfaz implementada | Lo que adapta |
|---|---|---|
| `AxiosHttpClient` | `IHttpClient` | Librería Axios → contrato genérico HTTP |
| `LocalStorageService` | `IStorageService` | `window.localStorage` → contrato de almacenamiento |
| `StompWebSocketService` | `IWebSocketService` | `@stomp/stompjs` → contrato WebSocket |
| `HttpAuthRepository` | `IAuthRepository` | API REST → contrato de repositorio de auth |
| Adapter Hooks (`useLogin`, etc.) | — | Casos de Uso → estado y efectos React |

**Ventaja:** Si mañana se reemplaza Axios por `fetch` nativo, solo se modifica `AxiosHttpClient`. Ningún caso de uso ni componente se ve afectado.

### 2. Patrón Factory (Fábrica)

**Propósito:** Centralizar la creación de objetos complejos.

`HttpClientFactory` expone métodos estáticos que encapsulan la configuración de cada cliente HTTP:

```javascript
HttpClientFactory.createAuthClient()      // Base URL: auth-service, interceptores de auth
HttpClientFactory.createBookingsClient()   // Base URL: bookings-service, interceptores de auth
HttpClientFactory.createInventoryClient()  // Base URL: inventory-service
HttpClientFactory.createLocationsClient()  // Base URL: locations-service
```

Cada método configura base URL, interceptores de autenticación (inyección de token JWT) e interceptores de errores.

### 3. Patrón Singleton

**Propósito:** Garantizar una única instancia del contenedor de dependencias.

`DIContainer` en `container.js` usa un campo estático `instance` con guarda en el constructor:

```javascript
class DIContainer {
  static instance = null;

  constructor() {
    if (DIContainer.instance) return DIContainer.instance;
    // ... inicialización
    DIContainer.instance = this;
  }
}
```

### 4. Patrón Repository (Repositorio)

**Propósito:** Abstraer el acceso a datos detrás de una interfaz de colección.

Cada repositorio HTTP implementa el contrato del puerto correspondiente, encapsulando las URLs, headers, y transformaciones de datos (mappers). Los consumidores (casos de uso) trabajan solo con entidades de dominio, sin conocer detalles HTTP.

### 5. Patrón Data Mapper

**Propósito:** Desacoplar el modelo de datos externo (DTO de la API) del modelo de dominio.

Los Mappers (`UserMapper`, `ReservationMapper`, etc.) contienen métodos estáticos:
- `toDomain(dto)` — Convierte respuesta de API a entidad de dominio.
- `toApi(entity)` — Convierte entidad de dominio a formato esperado por la API.
- `toDomainList(dtos)` — Mapeo en lote.
- `normalizeStatus(status)` — Normalización de enums del backend.

### 6. Patrón Facade (Fachada)

**Propósito:** Proveer una interfaz simplificada a un subsistema complejo.

`DependencyProvider` actúa como fachada del contenedor de DI hacia React, exponiendo hooks especializados:

```javascript
useAuthDependencies()         // → { loginUseCase, registerUseCase, logoutUseCase, ... }
useReservationDependencies()  // → { getUserReservationsUseCase, cancelReservationUseCase, ... }
useDashboardDependencies()    // → { getLocationsUseCase, createReservationUseCase, ... }
```

Los componentes nunca interactúan directamente con el `DIContainer`.

### 7. Patrón Command (Comando)

**Propósito:** Encapsular una solicitud como un objeto.

Cada caso de uso es un "comando" con un único método `execute()`:

```javascript
class CancelReservationUseCase {
  constructor(reservationRepository) { ... }
  async execute(reservationId) { ... }
}
```

Esto permite tratar los casos de uso como objetos intercambiables, testeables y componibles.

### 8. Patrón Observer (Observador)

**Propósito:** Notificar automáticamente a los suscriptores ante cambios de estado.

Implementado en la capa de WebSocket:
- `StompWebSocketService.subscribe(topic, callback)` registra observadores en temas STOMP.
- `useBookingEvents` suscribe al frontend a `reservation.created` y `reservation.cancelled`.
- Cuando otro usuario crea/cancela una reserva, la disponibilidad se refresca automáticamente.

### 9. Patrón Strategy (Estrategia) — Implícito

Los puertos (`IHttpClient`, `IStorageService`, `IWebSocketService`) definen familias de algoritmos intercambiables. La implementación concreta se decide en el **Composition Root** (`container.js`), permitiendo sustituir, por ejemplo, `LocalStorageService` por `SessionStorageService` sin modificar consumidores.

### Resumen de Patrones

| Patrón | Archivo(s) clave | Propósito en el proyecto |
|---|---|---|
| **Adapter** | `AxiosHttpClient`, `LocalStorageService`, `StompWebSocketService`, Hooks | Aislar frameworks y librerías externas |
| **Factory** | `HttpClientFactory` | Crear clientes HTTP preconfigurados por microservicio |
| **Singleton** | `DIContainer` | Única instancia del contenedor de dependencias |
| **Repository** | `HttpAuthRepository`, `HttpReservationRepository`, etc. | Abstraer acceso a datos |
| **Data Mapper** | `UserMapper`, `ReservationMapper`, `LocationMapper`, `InventoryMapper` | Desacoplar DTOs de entidades |
| **Facade** | `DependencyProvider`, hooks `use*Dependencies` | Simplificar acceso al DI para React |
| **Command** | Todos los Use Cases | Encapsular acciones como objetos con `execute()` |
| **Observer** | `StompWebSocketService`, `useBookingEvents` | Reactividad en tiempo real |
| **Strategy** | Puertos / Interfaces | Intercambiabilidad de implementaciones |

---

## Principios SOLID

### S — Single Responsibility Principle (Responsabilidad Única)

Cada clase y módulo tiene **una sola razón para cambiar**:

| Componente | Responsabilidad única |
|---|---|
| `LoginUseCase` | Orquestar el flujo de login (validar + delegar a repositorio) |
| `UserMapper` | Transformar DTOs de usuario a entidades de dominio |
| `useLogin` | Gestionar el estado React del flujo de login |
| `LoginForm` | Renderizar el formulario de login |
| `HttpAuthRepository` | Comunicar con el microservicio de auth |
| `InvalidCredentialsError` | Representar un error de credenciales inválidas |

**Beneficio:** Un cambio en el formato de la API solo afecta al Mapper correspondiente. Un cambio en la librería HTTP solo afecta a `AxiosHttpClient`. Un cambio en el diseño visual solo afecta a componentes de UI.

### O — Open/Closed Principle (Abierto/Cerrado)

Las interfaces (puertos) están **abiertas a extensión** pero **cerradas a modificación**:

```
IHttpClient (cerrado)
  ├── AxiosHttpClient          (extensión actual)
  └── FetchHttpClient          (extensión futura — sin tocar IHttpClient)

IStorageService (cerrado)
  ├── LocalStorageService      (extensión actual)
  └── IndexedDBStorageService  (extensión futura — sin tocar IStorageService)

IWebSocketService (cerrado)
  ├── StompWebSocketService    (extensión actual)
  └── SocketIOService          (extensión futura — sin tocar IWebSocketService)
```

### L — Liskov Substitution Principle (Sustitución de Liskov)

Todas las implementaciones concretas pueden **sustituir** a su interfaz base sin alterar el comportamiento esperado:

- `HttpAuthRepository` puede reemplazarse por `MockAuthRepository` en tests.
- `AxiosHttpClient` puede reemplazarse por un `FetchHttpClient` sin que los repositorios lo noten.
- Los tests de casos de uso utilizan implementaciones mock de los puertos, validando que el contrato se respeta.

### I — Interface Segregation Principle (Segregación de Interfaces)

**Interfaces pequeñas y cohesivas** en lugar de una interfaz monolítica:

```
✗ IRepository (monolítico — con métodos de auth, reservas, inventario, ubicaciones)

✓ IAuthRepository         (solo auth)
✓ IReservationRepository  (solo reservas)
✓ ILocationRepository     (solo ubicaciones)
✓ IInventoryRepository    (solo inventario)
✓ IHttpClient             (solo HTTP)
✓ IStorageService         (solo storage)
✓ IWebSocketService       (solo WebSocket)
```

Del mismo modo, los hooks de dependencias están segmentados por módulo:

```javascript
useAuthDependencies()          // Solo auth use cases
useReservationDependencies()   // Solo reservation use cases
useDashboardDependencies()     // Solo dashboard use cases
```

Cada componente recibe **únicamente** las dependencias que necesita.

### D — Dependency Inversion Principle (Inversión de Dependencias)

El principio más crítico de la arquitectura. Las dependencias **siempre apuntan hacia el dominio**:

```
UI  ──►  Application  ──►  Domain  ◄──  Infrastructure
         (Use Cases)       (Ports)      (Repositories, HTTP, Storage)
```

- Los **Casos de Uso** dependen de **interfaces** (`IAuthRepository`), no de implementaciones (`HttpAuthRepository`).
- El **contenedor de DI** (`container.js`) es el único lugar donde se "cablea" la implementación concreta a la abstracción.
- Los **Adapter Hooks** reciben los casos de uso vía Context, no por importación directa.

```javascript
// ✓ El caso de uso depende de la abstracción
class LoginUseCase {
  constructor(authRepository) {  // ← IAuthRepository (interfaz)
    this.authRepository = authRepository;
  }
}

// ✓ El container resuelve la dependencia concreta
container.register('loginUseCase', new LoginUseCase(httpAuthRepository));
```

---

## Inyección de Dependencias

El sistema de DI conecta todas las capas sin crear acoplamiento directo.

### Composition Root (`main.jsx`)

```
StrictMode → DependencyProvider → ThemeProvider → App → AppRouter
```

### Flujo de resolución

```
container.js (Singleton)
  │
  ├── Crea:  StorageService, HttpClients (via Factory)
  ├── Crea:  Repositories (con HttpClients + Mappers)
  ├── Crea:  UseCases (con Repositories)
  └── Registra todo con claves string: 'loginUseCase', 'authRepository', etc.
        │
        ▼
DependencyProvider.jsx (React Context)
  │
  ├── Lee del container todas las dependencias
  └── Expone hooks por módulo: useAuthDependencies(), useReservationDependencies()
        │
        ▼
Adapter Hooks (useLogin, useReservation, ...)
  │
  ├── Consumen las dependencias del Context
  └── Exponen estado + acciones a los componentes UI
```

### Testing con DI

La inyección de dependencias permite reemplazar cualquier implementación por un mock:

```javascript
// Test de LoginUseCase — mock del repositorio
const mockAuthRepo = {
  login: vi.fn().mockResolvedValue(mockUser),
};
const useCase = new LoginUseCase(mockAuthRepo);
const result = await useCase.execute('test@email.com', 'password123');
```

---

## Comunicación en Tiempo Real

El sistema integra **WebSockets vía STOMP** para actualizaciones en tiempo real:

```
bookings-service → RabbitMQ → notifications-service → STOMP WebSocket → Frontend
```

### Implementación

| Componente | Función |
|---|---|
| `StompWebSocketService` | Adaptador que implementa `IWebSocketService` con @stomp/stompjs |
| `useBookingEvents` | Hook que suscribe a eventos `reservation.created` y `reservation.cancelled` |

### Características

- **Cola de suscripciones pendientes:** Si se intenta suscribir antes de que la conexión esté lista, la suscripción se encola y se activa al conectar.
- **Auto-reconexión:** Hasta 10 reintentos con intervalo de 5 segundos.
- **Refresco silencioso:** Al recibir un evento, se actualiza la disponibilidad sin mostrar spinner de carga, con un indicador visual de "actualizado".
- **Fallback por polling:** Si WebSocket no está disponible, se utiliza polling periódico.

---

## Estrategia de Manejo de Errores

El manejo de errores atraviesa todas las capas con un patrón consistente:

| Capa | Estrategia |
|---|---|
| **Dominio** | Errores tipados (`InvalidCredentialsError`, `TokenExpiredError`, etc.) con códigos identificadores |
| **Infraestructura** | Los repositorios capturan errores HTTP y los traducen a errores de dominio según el status code |
| **Aplicación** | Los casos de uso validan inputs y lanzan errores de dominio antes de delegar |
| **UI (Hooks)** | Los adapter hooks capturan errores en `try/catch` y actualizan `setError(err.message)` para la UI |
| **UI (Componentes)** | Los componentes leen el estado `error` y lo renderizan condicionalmente |

### Enrutamiento Protegido

`ProtectedRoute` verifica la existencia del token JWT en `localStorage`. Si no existe, redirige a `/login`. Las rutas protegidas se anidan: `ProtectedRoute` → `MainLayout` → Página.

---

## Testing

El proyecto usa **Vitest** + **Testing Library** con estrategia enfocada en lógica de negocio:

| Qué se testea | Tipo | Cobertura |
|---|---|---|
| **Entidades de Dominio** | Unit tests | Validaciones, lógica de negocio, métodos de cálculo |
| **Casos de Uso** | Unit tests con mocks | Flujo de orquestación, validaciones de entrada |
| **Mappers** | Unit tests | Transformaciones DTO ↔ Entity, normalización de datos |
| **Adapter Hooks** | Integration tests | Interacción con casos de uso y estado React |

### Ejecución

```bash
npm test           # Ejecuta Vitest en modo watch
npx vitest run     # Ejecución única
```

### Mocking

Gracias a la DI, los tests inyectan mocks manuales de los puertos:

```javascript
const mockReservationRepo = {
  getByUserId: vi.fn().mockResolvedValue([mockReservation]),
  cancel: vi.fn().mockResolvedValue(true),
};
const useCase = new CancelReservationUseCase(mockReservationRepo);
```

---

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo Vite |
| `npm run build` | Genera el build de producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta los tests con Vitest |

---

## Variables de Entorno

Configuradas en archivos `.env` y consumidas por `HttpClientFactory`:

| Variable | Propósito |
|---|---|
| `VITE_AUTH_API_URL` | Base URL del microservicio de autenticación |
| `VITE_BOOKINGS_API_URL` | Base URL del microservicio de reservas |
| `VITE_INVENTORY_API_URL` | Base URL del microservicio de inventario |
| `VITE_LOCATIONS_API_URL` | Base URL del microservicio de ubicaciones |
| `VITE_WS_URL` | URL del endpoint WebSocket (STOMP) |

---

## Reglas Arquitectónicas

Para mantener la integridad de la arquitectura, se deben respetar las siguientes restricciones:

| Regla | Descripción |
|---|---|
| **UI → solo Hooks** | Los componentes de `ui/` solo pueden usar hooks de `core/adapters/hooks/` |
| **Use Cases → solo Ports** | Los casos de uso solo pueden depender de interfaces en `core/ports/` |
| **Entidades → cero dependencias** | Las entidades de dominio no importan nada externo |
| **Mappers obligatorios** | Toda transformación de datos externos ocurre en `infrastructure/mappers/` |
| **Sin imports cruzados** | `ui/` nunca importa de `infrastructure/` ; `application/` nunca importa de `infrastructure/` |
