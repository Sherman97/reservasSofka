# ðŸ§  AI Workflow -- Sistema de Reservas (Microservicios Node.js)

## ðŸ“Œ DescripciÃ³n General

Sistema de reservas construido con arquitectura de microservicios, contenerizado con Docker para facilitar el despliegue y la escalabilidad.

TecnologÃ­as clave:
-   **Node.js & Express**: Backend runtime y framework.
-   **Docker & Docker Compose**: OrquestaciÃ³n de contenedores.
-   **MariaDB**: Base de datos relacional.
-   **JWT Authentication**: Seguridad stateless.

------------------------------------------------------------------------

# ðŸ—ï¸ Arquitectura de Servicios

El sistema estÃ¡ compuesto por los siguientes contenedores Docker interconectados:

## 1. ðŸŒ API Gateway
**Puerto**: 3000
-   **FunciÃ³n**: Punto de entrada Ãºnico para todas las peticiones externas.
-   **Responsabilidades**:
    -   Enrutamiento de peticiones a los microservicios correspondientes (`/auth`, `/bookings`, `/inventory`).
    -   Manejo de CORS y Headers de seguridad (Helmet).
    -   Logs centralizados de peticiones (Morgan).
    -   InicializaciÃ³n de la base de datos compartida.

## 2. ðŸ” Auth Service
**Puerto**: 3001
-   **FunciÃ³n**: GestiÃ³n de identidad y acceso.
-   **Responsabilidades**:
    -   Registro y Login de usuarios.
    -   GeneraciÃ³n y validaciÃ³n de tokens JWT.
    -   ProtecciÃ³n de contraseÃ±as con bcrypt.
    -   Provee middleware de autenticaciÃ³n a otros servicios.

## 3. ðŸ“… Bookings Service
**Puerto**: 3002
-   **FunciÃ³n**: Core del negocio de reservas.
-   **Responsabilidades**:
    -   CreaciÃ³n de reservas con validaciÃ³n de conflictos de horario y stock.
    -   GestiÃ³n del ciclo de vida de la reserva (Confirmada, Cancelada).
    -   CÃ¡lculo de disponibilidad en tiempo real.
    -   Manejo de transacciones ACID para asegurar consistencia.

## 4. ðŸ“¦ Inventory Service
**Puerto**: 3003
-   **FunciÃ³n**: GestiÃ³n de recursos fÃ­sicos.
-   **Responsabilidades**:
    -   CRUD de items (equipos, recursos).
    -   AsociaciÃ³n de inventario a locaciones especÃ­ficas.
    -   Control de stock base por locaciÃ³n.

## 5. ðŸ“ Locations Service (Planificado)
**Puerto**: 3004 (Reservado)
-   **Estado**: Estructura base creada, lÃ³gica pendiente de migraciÃ³n/implementaciÃ³n.
-   **Objetivo**: GestiÃ³n dedicada de las locaciones fÃ­sicas, sus caracterÃ­sticas y disponibilidad general.

## 6. ðŸ—„ï¸ Database (MariaDB)
**Puerto**: 3306
-   **FunciÃ³n**: Persistencia de datos centralizada.
-   **ConfiguraciÃ³n**:
    -   Imagen oficial `mariadb:latest`.
    -   Volumen persistente `mariadb_data` para seguridad de datos.
    -   Healthchecks configurados para asegurar disponibilidad antes de arrancar los servicios dependientes.

------------------------------------------------------------------------

# ðŸ”„ Flujo de ComunicaciÃ³n (Docker)

1.  **OrquestaciÃ³n**: `docker-compose.yml` levanta todos los servicios en una red privada `reservas-network`.
2.  **Service Discovery**: Los servicios se comunican entre sÃ­ usando sus nombres de host de Docker (ej: `auth-service`, `mariadb`).
3.  **Variables de Entorno**: Inyectadas dinÃ¡micamente para configurar conexiones a la BD y URLs entre servicios.

------------------------------------------------------------------------

# ðŸ§  LÃ³gica de Negocio y Estructura de Datos

## Tablas Principales

-   **users**: Usuarios del sistema.
-   **bookings**: Cabecera de las reservas (quiÃ©n, dÃ³nde, cuÃ¡ndo).
-   **booking_inventory**: Detalle de items reservados (quÃ©, cuÃ¡nto).
-   **inventory**: CatÃ¡logo de items disponibles.
-   **locations**: Sedes o espacios reservables.
-   **location_inventory**: Stock de items por sede.

## Reglas CrÃ­ticas
1.  **No Solapamiento**: Una locaciÃ³n no puede tener dos reservas confirmadas en el mismo rango de tiempo.
2.  **Stock Suficiente**: `Stock Total` - `Stock Reservado en Rango` >= `Solicitado`.
3.  **Integridad Transaccional**: La creaciÃ³n de una reserva y la asignaciÃ³n de inventario ocurren en una Ãºnica transacciÃ³n de base de datos.





