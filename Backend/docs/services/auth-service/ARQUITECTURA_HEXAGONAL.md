# Auth Service - Arquitectura Hexagonal (Java 17)

## Objetivo
Este servicio implementa autenticacion y autorizacion (`register`, `login`, `me`) en Spring Boot con Java 17, aplicando arquitectura hexagonal para desacoplar la logica de negocio de frameworks, base de datos y mensajeria.

## Vista de capas
La organizacion sigue este flujo:

1. `adapters.in` recibe solicitudes HTTP.
2. `application` ejecuta casos de uso a traves de puertos.
3. `application.port.out` define lo que la app necesita externamente.
4. `adapters.out` implementa esos puertos (JPA, JWT, BCrypt, RabbitMQ).
5. `domain` contiene el modelo de negocio puro.
6. `infrastructure` configura Spring Security y propiedades tecnicas.

## Estructura de carpetas y responsabilidades

### `src/main/java/com/reservas/sk/auth_service/domain`
- `model/User.java`: entidad de dominio (sin anotaciones JPA).
- `service/EmailNormalizer.java`: regla de dominio para normalizar correos.
- Dependencias: ninguna de Spring/JPA.

### `src/main/java/com/reservas/sk/auth_service/application`
- `port/in/AuthUseCase.java`: contrato de entrada del caso de uso.
- `port/out/*`: contratos de salida:
  - `UserPersistencePort`
  - `PasswordHasherPort`
  - `TokenPort`
  - `UserEventPublisherPort`
- `service/AuthApplicationService.java`: orquesta `register/login/me`.
- `usecase/*`: comandos y respuestas internas (`RegisterCommand`, `LoginCommand`, `AuthResult`, etc.).
- Dependencias: `domain` y puertos; no depende de controllers, JPA ni RabbitMQ directos.

### `src/main/java/com/reservas/sk/auth_service/adapters/in`
- `web/AuthController.java`: endpoints REST:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
- `web/HealthController.java`: `GET /health`.
- `web/dto/*`: contratos HTTP de entrada/salida.
- `web/AuthHttpMapper.java`: mapea resultado de caso de uso -> respuesta HTTP.
- Dependencias: `application.port.in`.

### `src/main/java/com/reservas/sk/auth_service/adapters/out`
- `persistence/*`:
  - `UserJpaEntity`: mapeo a tabla `users`.
  - `SpringDataUserRepository`: repositorio Spring Data JPA.
  - `UserPersistenceAdapter`: implementa `UserPersistencePort`.
- `security/*`:
  - `BcryptPasswordHasherAdapter`: implementa `PasswordHasherPort`.
  - `JwtTokenAdapter`: implementa `TokenPort` (generar/parsear JWT).
- `messaging/*`:
  - `RabbitUserEventPublisherAdapter`: implementa `UserEventPublisherPort` via RabbitMQ cuando `app.rabbit.enabled=true`.
  - `NoOpUserEventPublisherAdapter`: fallback cuando RabbitMQ esta deshabilitado.
- Dependencias: Spring/JPA/JWT/RabbitTemplate.

### `src/main/java/com/reservas/sk/auth_service/infrastructure`
- `config/SecurityConfig.java`: security chain stateless + filtro JWT.
- `config/JwtProperties.java`: binding de `app.jwt.*`.
- `config/RabbitProperties.java`: binding de `app.rabbit.*`.
- `security/JwtAuthenticationFilter.java`: toma token Bearer y carga principal autenticado.
- Dependencias: framework/configuracion tecnica.

### `src/main/java/com/reservas/sk/auth_service/exception`
- `ApiException.java`: excepcion de negocio con HTTP status.
- `GlobalExceptionHandler.java`: traduce excepciones a respuesta estandar.

### `src/main/resources`
- `application.properties`: configuracion de datasource, JWT, RabbitMQ y servidor.

### `src/test`
- tests del servicio.

## Conexiones externas

### Base de datos (MariaDB)
- Adapter: `adapters/out/persistence/UserPersistenceAdapter`.
- Tabla usada: `users`.
- Operaciones: existe por email, buscar por email/id, guardar usuario.

### JWT
- Adapter: `adapters/out/security/JwtTokenAdapter`.
- El caso de uso solo conoce el puerto `TokenPort`.
- Claims actuales: `sub` (id usuario), `email`.

### Hash de password
- Adapter: `adapters/out/security/BcryptPasswordHasherAdapter`.
- El caso de uso solo conoce `PasswordHasherPort`.

### RabbitMQ
- Puerto: `UserEventPublisherPort`.
- Evento publicado al registrar usuario: `UserCreatedEvent`.
- Implementaciones:
  - `RabbitUserEventPublisherAdapter` (activa si `app.rabbit.enabled=true`).
  - `NoOpUserEventPublisherAdapter` (por defecto).

## Flujo por endpoint

### `POST /auth/register`
1. Controller recibe y valida DTO.
2. Invoca `AuthUseCase.register`.
3. Caso de uso normaliza email, valida duplicado, hashea password, guarda usuario.
4. Genera JWT por `TokenPort`.
5. Publica `UserCreatedEvent` por `UserEventPublisherPort`.
6. Devuelve `user + token`.

### `POST /auth/login`
1. Controller valida DTO.
2. Caso de uso busca usuario por email normalizado.
3. Valida password con `PasswordHasherPort`.
4. Genera JWT y responde `user + token`.

### `GET /auth/me`
1. `JwtAuthenticationFilter` valida Bearer token y carga principal.
2. Controller extrae `userId` autenticado.
3. Caso de uso consulta usuario por id y responde perfil.

## Reglas de dependencia (hexagonal)
- `domain` no depende de nadie.
- `application` depende de `domain` y de interfaces (`port/out`).
- `adapters/in` depende de `application`.
- `adapters/out` depende de `application` (implementa puertos).
- `infrastructure` depende de adapters/ports para wiring tecnico.

## Beneficios logrados
- Cambiar HTTP, DB, JWT o broker no obliga a reescribir logica de negocio.
- Facilita pruebas unitarias del caso de uso mockeando puertos.
- El servicio queda preparado para microservicios orientados a eventos sin acoplarse fuerte a RabbitMQ.





