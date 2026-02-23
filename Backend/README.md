Ahora
# Reservas Sofka

Sistema integral para la gestiÃ³n de reservas de locaciones y equipamiento adjunto, diseÃ±ado con una arquitectura moderna de microservicios para garantizar escalabilidad y mantenibilidad.

## ðŸš€ DescripciÃ³n

El proyecto permite a los usuarios gestionar reservas de espacios fÃ­sicos (locaciones) junto con el inventario necesario para su uso. El objetivo principal es optimizar la organizaciÃ³n y disponibilidad de estos recursos dentro de la organizaciÃ³n.

## ðŸ—ï¸ Arquitectura

El sistema utiliza una arquitectura de **microservicios** en el backend y un frontend basado en **React** con un patrÃ³n de diseÃ±o orientado a **Features**.

mermaid
graph TD
    Client[Frontend React] --> GW[API Gateway]
    GW --> Auth[Auth Service]
    GW --> Bookings[Bookings Service]
    GW --> Inv[Inventory Service]
    GW --> Loc[Locations Service]
    Auth --> DB[(MariaDB)]
    Bookings --> DB
    Inv --> DB
    Loc --> DB

### Backend (Microservicios)

| Servicio | DescripciÃ³n | TecnologÃ­as Clave |
| :--- | :--- | :--- |
| **API Gateway** | Punto de entrada Ãºnico, maneja el ruteo y proxy de peticiones. | Express, http-proxy-middleware |
| **Auth Service** | GestiÃ³n de usuarios, autenticaciÃ³n (JWT) y autorizaciÃ³n. | Bcrypt, JSONWebToken |
| **Bookings Service** | LÃ³gica central de creaciÃ³n y gestiÃ³n de reservas. | Express |
| **Inventory Service** | Control de existencias y asignaciÃ³n de equipos a reservas. | Express, MySQL2 |
| **Locations Service** | GestiÃ³n de espacios fÃ­sicos y su disponibilidad. | Express |
| **Database Service** | Scripts de inicializaciÃ³n y conexiÃ³n a MariaDB. | MariaDB, MySQL2 |

### Frontend

El frontend estÃ¡ construido con **Vite + React** y sigue una estructura modular:
**Features**: MÃ³dulos aislados que contienen componentes, servicios y lÃ³gica especÃ­fica por funciÃ³n.
**Context**: Manejo de estado global (auth, temas, etc.).
**Services**: Capa de abstracciÃ³n para el consumo de APIs.

## ðŸ› ï¸ TecnologÃ­as

### Core
**Frontend**: React 19, Vite, React Router DOM, Axios.
**Backend**: Node.js, Express 5.
**Base de Datos**: MariaDB.

### Herramientas de Desarrollo
**Linting**: ESLint.
**Procesos**: Nodemon (para desarrollo en backend).
**Seguridad**: Helmet, CORS.

## ðŸ“‹ Requisitos Previos

Node.js (v18 o superior)
MariaDB
Docker (opcional, para despliegue de base de datos)

## ðŸ”§ InstalaciÃ³n y ConfiguraciÃ³n

### 1. Clonar el repositorio
bash
git clone <url-del-repositorio>
cd reservasSofka

### 2. Configurar el Backend
bash
cd Backend
npm install
# Repetir en cada servicio dentro de /services si es necesario para desarrollo individual
> [!IMPORTANT]
> Configura los archivos .env en cada servicio basÃ¡ndote en los ejemplos (si existen) o las necesidades de conexiÃ³n a la DB.

### 3. Configurar el Frontend
bash
cd Frontend
npm install
npm run dev

## ðŸ“œ Licencia

ISC License





