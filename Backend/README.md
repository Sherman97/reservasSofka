Ahora
# Reservas Sofka

Sistema integral para la gestión de reservas de locaciones y equipamiento adjunto, diseñado con una arquitectura moderna de microservicios para garantizar escalabilidad y mantenibilidad.

## 🚀 Descripción

El proyecto permite a los usuarios gestionar reservas de espacios físicos (locaciones) junto con el inventario necesario para su uso. El objetivo principal es optimizar la organización y disponibilidad de estos recursos dentro de la organización.

## 🏗️ Arquitectura

El sistema utiliza una arquitectura de **microservicios** en el backend y un frontend basado en **React** con un patrón de diseño orientado a **Features**.

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

| Servicio | Descripción | Tecnologías Clave |
| :--- | :--- | :--- |
| **API Gateway** | Punto de entrada único, maneja el ruteo y proxy de peticiones. | Express, http-proxy-middleware |
| **Auth Service** | Gestión de usuarios, autenticación (JWT) y autorización. | Bcrypt, JSONWebToken |
| **Bookings Service** | Lógica central de creación y gestión de reservas. | Express |
| **Inventory Service** | Control de existencias y asignación de equipos a reservas. | Express, MySQL2 |
| **Locations Service** | Gestión de espacios físicos y su disponibilidad. | Express |
| **Database Service** | Scripts de inicialización y conexión a MariaDB. | MariaDB, MySQL2 |

### Frontend

El frontend está construido con **Vite + React** y sigue una estructura modular:
**Features**: Módulos aislados que contienen componentes, servicios y lógica específica por función.
**Context**: Manejo de estado global (auth, temas, etc.).
**Services**: Capa de abstracción para el consumo de APIs.

## 🛠️ Tecnologías

### Core
**Frontend**: React 19, Vite, React Router DOM, Axios.
**Backend**: Node.js, Express 5.
**Base de Datos**: MariaDB.

### Herramientas de Desarrollo
**Linting**: ESLint.
**Procesos**: Nodemon (para desarrollo en backend).
**Seguridad**: Helmet, CORS.

## 📋 Requisitos Previos

Node.js (v18 o superior)
MariaDB
Docker (opcional, para despliegue de base de datos)

## 🔧 Instalación y Configuración

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
> Configura los archivos .env en cada servicio basándote en los ejemplos (si existen) o las necesidades de conexión a la DB.

### 3. Configurar el Frontend
bash
cd Frontend
npm install
npm run dev

## 📜 Licencia

ISC License
