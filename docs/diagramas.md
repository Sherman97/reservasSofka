# Diagramas del Proyecto Reservas SK

Este documento incluye un diagrama de arquitectura completo del proyecto y diagramas funcionales de la HU de modulo administrador.

## 1. Diagrama de Arquitectura General (todo el proyecto)

Diagrama por capas para visualizar de forma intuitiva el funcionamiento end-to-end.

```mermaid
flowchart TB
    %% ===== CAPA 1: CLIENTES =====
    subgraph L1["Capa de Clientes"]
        U1[Usuario Final]
        U2[Administrador]
        B1[Navegador Web]
    end

    %% ===== CAPA 2: PRESENTACION =====
    subgraph L2["Capa de Presentacion"]
        FE[Frontend React + Nginx :8080]
        RT1[STOMP WS /bookings/ws]
        RT2[STOMP WS /notifications/ws]
    end

    %% ===== CAPA 3: ENTRADA API =====
    subgraph L3["Capa de Entrada API"]
        GW[API Gateway :3000]
        SEC[JWT + Ruteo HTTP/WS]
    end

    %% ===== CAPA 4: DOMINIO =====
    subgraph L4["Capa de Microservicios de Dominio"]
        AUTH[auth-service :3001]
        BOOK[bookings-service :3003]
        LOC[locations-service :3004]
        INV[inventory-service :3005]
        NOTI[notifications-service :3006]
    end

    %% ===== CAPA 5: INTEGRACION =====
    subgraph L5["Capa de Integracion y Eventos"]
        MQ[(RabbitMQ :5672)]
        EX[(Exchange reservas.events)]
    end

    %% ===== CAPA 6: DATOS =====
    subgraph L6["Capa de Datos y Persistencia"]
        DB[(MariaDB :3306 / host 3307)]
        LB[Liquibase Migraciones]
    end

    U1 --> B1
    U2 --> B1
    B1 --> FE
    FE --> GW
    FE -. realtime .-> RT1
    FE -. realtime .-> RT2

    GW --> SEC
    SEC --> AUTH
    SEC --> BOOK
    SEC --> LOC
    SEC --> INV
    SEC --> NOTI

    AUTH --> DB
    BOOK --> DB
    LOC --> DB
    INV --> DB
    LB --> DB

    AUTH --> MQ
    BOOK --> MQ
    LOC --> MQ
    INV --> MQ
    MQ --> EX
    EX --> NOTI
    NOTI -. websocket .-> FE
    BOOK -. websocket .-> FE
```

## 2. Flujo Clave (Admin) - Gestion de reservas

```mermaid
sequenceDiagram
    participant Admin as Usuario Administrador
    participant FE as Frontend
    participant GW as API Gateway
    participant Auth as auth-service
    participant Book as bookings-service
    participant DB as MariaDB
    participant MQ as RabbitMQ
    participant Noti as notifications-service

    Admin->>FE: Crear/editar/cancelar reserva
    FE->>GW: Request HTTP (JWT)
    GW->>Auth: Validar token/rol
    Auth-->>GW: OK
    GW->>Book: Operacion sobre reserva
    Book->>DB: Insert/Update + validacion disponibilidad
    DB-->>Book: Resultado
    Book->>MQ: Publicar evento de dominio
    MQ->>Noti: Entregar evento
    Noti-->>FE: Notificacion en tiempo real (WS)
    FE-->>Admin: Confirmacion o error
```

## 3. Diagrama de Clases de Dominio (HU modulo administrador)

```mermaid
classDiagram
    class Usuario {
      +UUID id
      +String nombre
      +String email
      +Rol rol
    }

    class Reserva {
      +UUID id
      +Date fecha
      +Time horaInicio
      +Time horaFin
      +EstadoReserva estado
      +String motivoCancelacion
      +DateTime createdAt
      +DateTime updatedAt
    }

    class Locacion {
      +UUID id
      +String nombre
      +String sede
      +boolean activa
    }

    class AuditoriaReserva {
      +UUID id
      +UUID reservaId
      +UUID actorId
      +Accion accion
      +String detalle
      +DateTime fechaHora
    }

    class Notificacion {
      +UUID id
      +UUID usuarioId
      +UUID reservaId
      +TipoNotificacion tipo
      +String mensaje
      +DateTime fechaEnvio
    }

    Usuario "1" --> "0..*" Reserva : solicita
    Locacion "1" --> "0..*" Reserva : asignada
    Reserva "1" --> "0..*" AuditoriaReserva : registra
    Reserva "1" --> "0..*" Notificacion : genera
```

## 4. Fuentes de referencia usadas
- `compose.yml` (servicios, puertos y dependencias reales)
- `README.md` (arquitectura, mensajeria, websocket y endpoints)
- `Frontend/nginx/default.conf` (reverse proxy y rutas websocket)
- `docs/HU_modulo_administrador.docx` (flujo funcional de la HU)
