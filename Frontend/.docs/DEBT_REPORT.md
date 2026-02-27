# Reporte de Deuda Técnica: "Pecados Capitales" y Mitigación

Este documento detalla los hallazgos de deuda técnica encontrados durante la migración del proyecto **Reservas Sofka** a una Arquitectura Hexagonal, y cómo se han mitigado estas deficiencias.

## 🍎 Los 7 Pecados Capitales del Código Inicial

### 1. Acoplamiento Extremo (Tight Coupling)
*   **Pecado**: Los componentes de la UI importaban directamente servicios de red (Axios) y lógica de negocio.
*   **Consecuencia**: Imposibilidad de cambiar el cliente HTTP o la fuente de datos sin editar decenas de archivos. Dificultad extrema para realizar unit testing.
*   **Mitigación**: Implementación de **Ports & Adapters**. La UI ahora solo conoce interfaces (`IReservationRepository`, `ILocationRepository`) y casos de uso.

### 2. Lógica de Negocio Dispersa (Business Logic Leakage)
*   **Pecado**: Reglas de negocio (como qué es una reserva "próxima" o cómo validar horarios) residían dentro de los componentes React o hooks de la capa `features/`.
*   **Consecuencia**: Duplicación de lógica y riesgo de inconsistencias entre diferentes vistas.
*   **Mitigación**: Creación de una **Capa de Dominio** pura. Entidades como `Reservation` y `Location` encapsulan sus propias reglas y estados.

### 3. El "Infierno" de los DTOs (DTO Hell)
*   **Pecado**: La UI dependía directamente de los nombres de los campos del API (ej. `bookingId`, `start_at`, `spaceName`).
*   **Consecuencia**: Cualquier cambio en el backend rompía inmediatamente el frontend. La UI tenía que manejar múltiples formatos de datos.
*   **Mitigación**: Implementación de **Mappers**. Los mappers transforman los DTOs del API en Objetos de Dominio estandarizados antes de que lleguen a la aplicación.

### 4. Ausencia de Inyección de Dependencias
*   **Pecado**: Las instancias de los servicios se creaban de forma ad-hoc en cada archivo.
*   **Consecuencia**: Difícil gestión de ciclos de vida de objetos y nula capacidad de sustituir implementaciones (ej. usar un `MockRepository` para pruebas).
*   **Mitigación**: Creación de un **DI Container** (Singleton) y un `DependencyProvider` (Context API) para inyectar dependencias de forma centralizada.

### 5. "Fat Hooks" y "God Components"
*   **Pecado**: Hooks y componentes que manejaban simultáneamente el estado de la UI, llamadas de red, filtrado de datos y formateo de fechas.
*   **Consecuencia**: Archivos de cientos de líneas difíciles de leer, mantener y debuguear.
*   **Mitigación**: Aplicación del **Principio de Responsabilidad Única (SRP)**. Los hooks ahora son adaptadores delgados que conectan la UI con los Casos de Uso.

### 6. Código "Hardcoded" e Inflexible
*   **Pecado**: URLs, configuraciones de storage y strings de error estaban quemados en el código.
*   **Consecuencia**: Cambiar el entorno (dev/prod) o el idioma requería cambios manuales en múltiples puntos.
*   **Mitigación**: Centralización mediante **HttpClientFactory** y abstracción de la infraestructura (Storage Service).

### 7. Estructura de Carpetas Tipo "Spaghetti"
*   **Pecado**: La carpeta `features/` mezclaba componentes visuales, lógica de negocio y llamadas a infraestructura sin límites claros.
*   **Consecuencia**: Navegación difícil por el proyecto y falta de claridad sobre dónde pertenece cada pieza de código.
*   **Mitigación**: Reorganización en **Capas Arquitectónicas**: `core/domain`, `application/use-cases`, `infrastructure/` y `ui/`.

---

## 🏛️ Patrones de Diseño Aplicados

Para mitigar la deuda técnica, se han implementado los siguientes patrones:

### 1. Repository Pattern
*   **Propósito**: Desacoplar la lógica de negocio del acceso a datos.
*   **Implementación**: `IReservationRepository`, `HttpReservationRepository`. Permite cambiar la infraestructura (ej. de REST a GraphQL o Firebase) sin afectar la aplicación.

### 2. Adapter Pattern (Wrappers)
*   **Propósito**: Adaptar interfaces de librerías externas (Axios, LocalStorage) a nuestros propios puertos.
*   **Implementación**: `AxiosHttpClient`, `LocalStorageService`. Protege el núcleo de la aplicación de cambios en dependencias externas.

### 3. Factory Pattern
*   **Propósito**: Centralizar la creación y configuración de objetos complejos.
*   **Implementación**: `HttpClientFactory`. Asegura que todas las instancias de Axios tengan la configuración (BaseURL, Interceptores) correcta.

### 4. Singleton Pattern
*   **Propósito**: Garantizar una única instancia de la gestión de dependencias.
*   **Implementación**: `DIContainer`. Evita múltiples inicializaciones y mantiene la coherencia de los servicios en toda la app.

### 5. Facade Pattern
*   **Propósito**: Proporcionar una interfaz simplificada a un sistema complejo.
*   **Implementación**: `useDependencies`. La UI no necesita saber cómo se instancian o conectan los casos de uso, solo los consume.

### 6. Data Mapper Pattern
*   **Propósito**: Traducir datos entre esquemas externos (API) y modelos internos (Dominio).
*   **Implementación**: `ReservationMapper`, `LocationMapper`. Evita el acoplamiento a los nombres de campos del backend.

### 7. Use Case (Command/Service)
*   **Propósito**: Orquestar el flujo de datos y ejecutar la lógica de aplicación.
*   **Implementación**: `GetUserReservationsUseCase`, `CreateReservationUseCase`. Cada acción del usuario está representada por una clase única y testeable.

---

## 📊 Resumen de Impacto

| Métrica | Antes (Features) | Después (Hexagonal) |
| :--- | :--- | :--- |
| **Separación de Intereses** | Nula | Alta (Capa de Dominio aislada) |
| **Testabilidad** | Difícil (requiere mocks de red) | Fácil (mocks de interfaces) |
| **Escalabilidad** | Riesgosa (efecto dominó) | Segura (cambios localizados) |
| **Mantenibilidad** | Alta complejidad | Baja complejidad (responsabilidades claras) |

---
**Generado por**: Antigravity AI  
**Fecha**: 2026-02-18
