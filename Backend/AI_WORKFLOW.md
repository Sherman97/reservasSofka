# 🧠 AI Workflow -- Sistema de Reservas (Microservicios Node.js)

## 📌 Descripción General

Sistema de reservas construido con arquitectura de microservicios, contenerizado con Docker para facilitar el despliegue y la escalabilidad.

Tecnologías clave:
-   **Node.js & Express**: Backend runtime y framework.
-   **Docker & Docker Compose**: Orquestación de contenedores.
-   **MariaDB**: Base de datos relacional.
-   **JWT Authentication**: Seguridad stateless.

------------------------------------------------------------------------

# 🏗️ Arquitectura de Servicios

El sistema está compuesto por los siguientes contenedores Docker interconectados:

## 1. 🌐 API Gateway
**Puerto**: 3000
-   **Función**: Punto de entrada único para todas las peticiones externas.
-   **Responsabilidades**:
    -   Enrutamiento de peticiones a los microservicios correspondientes (`/auth`, `/bookings`, `/inventory`).
    -   Manejo de CORS y Headers de seguridad (Helmet).
    -   Logs centralizados de peticiones (Morgan).
    -   Inicialización de la base de datos compartida.

## 2. 🔐 Auth Service
**Puerto**: 3001
-   **Función**: Gestión de identidad y acceso.
-   **Responsabilidades**:
    -   Registro y Login de usuarios.
    -   Generación y validación de tokens JWT.
    -   Protección de contraseñas con bcrypt.
    -   Provee middleware de autenticación a otros servicios.

## 3. 📅 Bookings Service
**Puerto**: 3002
-   **Función**: Core del negocio de reservas.
-   **Responsabilidades**:
    -   Creación de reservas con validación de conflictos de horario y stock.
    -   Gestión del ciclo de vida de la reserva (Confirmada, Cancelada).
    -   Cálculo de disponibilidad en tiempo real.
    -   Manejo de transacciones ACID para asegurar consistencia.

## 4. 📦 Inventory Service
**Puerto**: 3003
-   **Función**: Gestión de recursos físicos.
-   **Responsabilidades**:
    -   CRUD de items (equipos, recursos).
    -   Asociación de inventario a locaciones específicas.
    -   Control de stock base por locación.

## 5. 📍 Locations Service (Planificado)
**Puerto**: 3004 (Reservado)
-   **Estado**: Estructura base creada, lógica pendiente de migración/implementación.
-   **Objetivo**: Gestión dedicada de las locaciones físicas, sus características y disponibilidad general.

## 6. 🗄️ Database (MariaDB)
**Puerto**: 3306
-   **Función**: Persistencia de datos centralizada.
-   **Configuración**:
    -   Imagen oficial `mariadb:latest`.
    -   Volumen persistente `mariadb_data` para seguridad de datos.
    -   Healthchecks configurados para asegurar disponibilidad antes de arrancar los servicios dependientes.

------------------------------------------------------------------------

# 🔄 Flujo de Comunicación (Docker)

1.  **Orquestación**: `docker-compose.yml` levanta todos los servicios en una red privada `reservas-network`.
2.  **Service Discovery**: Los servicios se comunican entre sí usando sus nombres de host de Docker (ej: `auth-service`, `mariadb`).
3.  **Variables de Entorno**: Inyectadas dinámicamente para configurar conexiones a la BD y URLs entre servicios.

------------------------------------------------------------------------

# 🧠 Lógica de Negocio y Estructura de Datos

## Tablas Principales

-   **users**: Usuarios del sistema.
-   **bookings**: Cabecera de las reservas (quién, dónde, cuándo).
-   **booking_inventory**: Detalle de items reservados (qué, cuánto).
-   **inventory**: Catálogo de items disponibles.
-   **locations**: Sedes o espacios reservables.
-   **location_inventory**: Stock de items por sede.

## Reglas Críticas
1.  **No Solapamiento**: Una locación no puede tener dos reservas confirmadas en el mismo rango de tiempo.
2.  **Stock Suficiente**: `Stock Total` - `Stock Reservado en Rango` >= `Solicitado`.
3.  **Integridad Transaccional**: La creación de una reserva y la asignación de inventario ocurren en una única transacción de base de datos.
