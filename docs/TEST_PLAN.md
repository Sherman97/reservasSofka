# TEST PLAN — Reservas Sofka

> **Versión:** 1.2  
> **Fecha:** 6 de marzo de 2026  
> **Proyecto:** Sistema de Reservas Sofka (Microservicios + SPA React)  
> **Autores:** Equipo de Desarrollo Reservas SK

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Alcance del Plan de Pruebas](#2-alcance-del-plan-de-pruebas)
3. [Los 7 Principios de las Pruebas — Aplicación al Proyecto](#3-los-7-principios-de-las-pruebas--aplicación-al-proyecto)
4. [Estrategia Multinivel de Testing](#4-estrategia-multinivel-de-testing)
5. [Tipos de Pruebas Implementados](#5-tipos-de-pruebas-implementados)
6. [Pruebas de Caja Blanca vs. Caja Negra](#6-pruebas-de-caja-blanca-vs-caja-negra)
7. [Pipeline CI — Distinción Componente vs. Integración](#7-pipeline-ci--distinción-componente-vs-integración)
8. [Test Cases](#8-test-cases)
9. [Métricas y Cobertura](#9-métricas-y-cobertura)
10. [Herramientas y Frameworks](#10-herramientas-y-frameworks)
11. [Inventario de Tests](#11-inventario-de-tests)
12. [Riesgos y Mitigaciones](#12-riesgos-y-mitigaciones)
13. [Conclusiones](#13-conclusiones)

---

## 1. Resumen Ejecutivo

El proyecto Reservas Sofka es un sistema de gestión de reservas construido con una **arquitectura de microservicios** (6 servicios backend en Spring Boot) y un **frontend SPA** en React. La arquitectura interna de cada servicio sigue el patrón **hexagonal (Ports & Adapters)**, lo que facilita naturalmente la separación entre pruebas de componente aisladas y pruebas de integración de puertos.

### Cifras Clave

| Métrica | Valor |
|---------|-------|
| Archivos de test totales | **137** |
| Test cases totales | **1 058** |
| Cobertura backend (líneas) | **93.55%** |
| Cobertura frontend (líneas) | **95.32%** |
| Servicios backend testeados | 6 / 6 |
| Tests de caja negra — API (curl) | 7 casos |
| Tests de caja negra — API (Postman / Newman) | **3 casos** |

---

## 2. Alcance del Plan de Pruebas

### 2.1 Sistemas bajo prueba (SUT)

| Componente | Tecnología | Función |
|------------|-----------|---------|
| `auth-service` | Spring Boot 3 / Java 17 | Registro, login, JWT |
| `bookings-service` | Spring Boot 3 / Java 17 | CRUD de reservas, cancelación |
| `locations-service` | Spring Boot 3 / Java 17 | Gestión de sedes y espacios |
| `inventory-service` | Spring Boot 3 / Java 17 | Equipamiento y asignación |
| `notifications-service` | Spring Boot 3 / Java 17 | Notificaciones vía RabbitMQ + WebSocket |
| `api-gateway` | Spring Boot 3 / Java 17 | Proxy/enrutamiento HTTP |
| Frontend (SPA) | React 19 / Vite / TypeScript | Interfaz de usuario |

### 2.2 Fuera de alcance

- Pruebas de rendimiento (load/stress testing)
- Pruebas de seguridad ofensiva (penetration testing)
- Pruebas de accesibilidad (WCAG compliance)
- Pruebas en navegadores múltiples (cross-browser)

---

## 3. Los 7 Principios de las Pruebas — Aplicación al Proyecto

Los 7 principios del testing (ISTQB) no son reglas teóricas abstractas — son directrices que modelan decisiones concretas de diseño en nuestro proyecto:

### Principio 1: Las pruebas muestran la presencia de defectos, no su ausencia

> *"Testing can show that defects are present, but cannot prove that there are none."*

**Aplicación práctica:** Aunque el proyecto tiene >90% de cobertura de líneas en backend y >95% en frontend, **no asumimos ausencia de defectos**. Por eso complementamos las pruebas de caja blanca (unitarias con mocks) con pruebas de caja negra (requests HTTP reales contra servicios levantados). Cada nivel de la pirámide detecta categorías de defectos diferentes:

- Los tests unitarios detectan errores de lógica interna.
- Los tests de integración detectan fallos en la comunicación entre puertos.
- Los tests de caja negra detectan problemas de configuración, serialización y comportamiento end-to-end.

### Principio 2: Las pruebas exhaustivas son imposibles

> *"Testing everything is not feasible — use risk analysis to focus testing effort."*

**Aplicación práctica:** Con 6 microservicios, decenas de endpoints y cientos de combinaciones posibles, es imposible probar cada camino. Priorizamos por **riesgo de negocio**:

| Riesgo Alto (más tests) | Riesgo Medio | Riesgo Bajo (menos tests) |
|--------------------------|--------------|--------------------------|
| Registro/Login (auth) | Listado de sedes | Health checks |
| Creación de reservas | Paginación | UI estático |
| Cancelación de reservas | Filtros de búsqueda | Logging |
| Validación de JWT | Mappers | Configuración de CORS |

Las pruebas de caja negra se concentran en los flujos de **riesgo alto** (ej.: `test-user-creation.sh` cubre el registro con 7 casos que incluyen happy path, duplicados y validaciones).

### Principio 3: Las pruebas tempranas ahorran tiempo y dinero

> *"Start testing as early as possible in the development lifecycle."*

**Aplicación práctica:** Implementamos testing **shift-left** en múltiples niveles:

1. **Entidades de dominio testeadas primero** — `Reservation.test.ts`, `User.test.ts` validan reglas de negocio antes de escribir la UI.
2. **Use Cases testeados aisladamente** — `CreateReservationUseCase.test.ts` verifica la lógica de aplicación con repositorios mockeados antes de tener infraestructura real.
3. **CI ejecuta tests en cada push/PR** — El pipeline se dispara en `push` y `pull_request` a `main` y `develop`, detectando defectos antes del merge.
4. **Tests de dominio como especificación** — Los tests del dominio (`Reservation.core.test.ts`) actúan como documentación ejecutable de las reglas de negocio.

### Principio 4: Los defectos se agrupan (Clustering)

> *"A small number of modules usually contain most of the defects."*

**Aplicación práctica:** Identificamos que los módulos con mayor complejidad ciclomática concentran la mayoría de potenciales defectos:

| Módulo con alta densidad de defectos | Estrategia de mitigación |
|--------------------------------------|--------------------------|
| `AuthApplicationService` (registro + login + JWT) | 21 tests unitarios + 7 tests de caja negra |
| `BookingApplicationService` (crear + cancelar + estados) | 51 tests, incluye tests de persistencia JDBC |
| `ReservationModal` (formulario complejo con validación) | Tests de componente + integración de flujo |
| `JwtAuthenticationFilter` (seguridad transversal) | Tests en **todos** los servicios que lo usan |

El `bookings-service` tiene el mayor número de tests (51) precisamente porque es donde más defectos se han encontrado históricamente.

### Principio 5: La paradoja del pesticida

> *"Repeating the same tests will not find new defects — evolve your test suite."*

**Aplicación práctica:** Evitamos la paradoja del pesticida mediante:

1. **Múltiples técnicas de testing:** No solo tests unitarios con mocks, sino también tests de integración multi-capa (`auth-flow.integration.test.ts`), tests de componente con `@WebMvcTest`, y tests de caja negra con `curl`.
2. **Datos dinámicos en caja negra:** El script `test-user-creation.sh` usa `date +%s%N` para generar emails únicos en cada ejecución, evitando que los tests se vuelvan deterministas por datos fijos.
3. **Cobertura de branches además de líneas:** Forzamos que los tests cubran caminos alternativos (ej.: email duplicado → 409, email inválido → 400), no solo el happy path.

### Principio 6: Las pruebas dependen del contexto

> *"Testing is done differently in different contexts."*

**Aplicación práctica:** Adaptamos la estrategia según el componente:

| Contexto | Estrategia adaptada |
|----------|---------------------|
| **Backend (microservicios Spring)** | `@WebMvcTest` para controladores, Mockito para servicios, JUnit 5 como runner |
| **Frontend (SPA React)** | `@testing-library/react` + jsdom, `vi.mock()` para hooks, `renderHook` para lógica |
| **Infraestructura (Docker)** | Tests de caja negra con `curl` contra servicios containerizados |
| **Comunicación async (RabbitMQ)** | Tests de adapter con mock de `RabbitTemplate`, verify de publicación |
| **Seguridad (JWT)** | Tests del filtro con tokens válidos/inválidos/expirados en cada servicio |

### Principio 7: La falacia de la ausencia de errores

> *"Finding and fixing defects does not help if the system is unusable or does not meet user needs."*

**Aplicación práctica:** Por eso no nos limitamos a pruebas de verificación técnica. Incluimos:

1. **Tests de integración de flujo completo** (`auth-flow.integration.test.ts`, `reservation-flow.integration.test.ts`) que simulan el recorrido real del usuario: registrarse → reservar → ver reservas.
2. **Tests de caja negra** que validan el contrato HTTP exacto que consume el frontend (status codes, estructura JSON, error codes).
3. **Tests de componente UI** que verifican la experiencia visual: mensajes de error mostrados, estados de loading, campos deshabilitados.

---

## 4. Estrategia Multinivel de Testing

Utilizamos la **Pirámide de Testing** adaptada a nuestra arquitectura hexagonal de microservicios:

```
                    ╱      ╲
                   ╱   E2E  ╲                ← Caja Negra (curl/HTTP)
                  ╱──────────╲                 7 tests
                 ╱Integration ╲            ← Multi-capa, puertos reales
                ╱──────────────╲             ~15 tests (front) + adapters (back)
               ╱   Component    ╲         ← @WebMvcTest, renderHook, render()
              ╱──────────────────╲           ~200 tests
             ╱      Unit Tests    ╲       ← Mockito, vi.fn(), lógica pura
            ╱──────────────────────╲         ~800 tests
           ╱________________________╲
```

### 4.1 Nivel 1 — Tests Unitarios (Base de la pirámide)

**Objetivo:** Validar la lógica de negocio y funciones individuales de forma **aislada**, con todas las dependencias mockeadas.

| Aspecto | Backend | Frontend |
|---------|---------|----------|
| **Qué se testea** | Servicios de aplicación, entidades de dominio, adapters aislados | Entidades de dominio, Use Cases, Mappers, hooks |
| **Herramientas** | JUnit 5 + Mockito (`@Mock`, `@InjectMocks`) | Vitest + `vi.fn()`, `vi.mock()` |
| **Dependencias** | Todas mockeadas (`when().thenReturn()`) | Todas mockeadas (`vi.fn()`) |
| **Velocidad** | Milisegundos por test | Milisegundos por test |
| **Ejemplo backend** | `AuthApplicationServiceTest` — mock de `UserPersistencePort`, verifica `save()` | — |
| **Ejemplo frontend** | — | `LoginUseCase.test.ts` — mock de `IAuthRepository` |

**Justificación:** Son la base porque ejecutan en milisegundos, detectan la mayoría de errores de lógica, y se ejecutan sin infraestructura. En la arquitectura hexagonal, testear los `ApplicationService` con puertos mockeados garantiza que la lógica de orquestación es correcta independientemente de los adapters.

### 4.2 Nivel 2 — Tests de Componente (Aislados)

**Objetivo:** Validar que un componente/módulo funciona correctamente **dentro de su slice**, sin levantar la aplicación completa.

| Aspecto | Backend | Frontend |
|---------|---------|----------|
| **Qué se testea** | Controladores HTTP (web slice), filtros de seguridad | Componentes React renderizados, rutas |
| **Herramientas** | `@WebMvcTest` + `MockMvc` + `@MockBean` | `render()` + `screen` + `fireEvent` (testing-library) |
| **Dependencias** | Spring Web context parcial; servicios mockeados | jsdom; hooks mockeados con `vi.mock()` |
| **Velocidad** | ~200ms por test | ~50ms por test |
| **Ejemplo backend** | `AuthControllerTest` — `MockMvc.perform(post("/auth/register"))` | — |
| **Ejemplo frontend** | — | `LoginForm.test.jsx` — render, type, submit, assert DOM |

**Justificación:** Los tests de componente validan el **contrato HTTP** (backend) o la **interacción de UI** (frontend) sin necesidad de la pila completa. En el backend, `@WebMvcTest` levanta solo el web slice, verificando serialización JSON, validación de DTOs (`@Valid`), status codes y seguridad.

### 4.3 Nivel 3 — Tests de Integración (Comunicación de puertos)

**Objetivo:** Validar la **comunicación real entre capas** — que los puertos, adapters y la infraestructura trabajan juntos correctamente.

| Aspecto | Backend | Frontend |
|---------|---------|----------|
| **Qué se testea** | Adapters de persistencia con JDBC, publishers de RabbitMQ | Flujos multi-capa: UseCase → Mapper → Entity |
| **Herramientas** | JUnit 5 + mocked `JdbcTemplate`/`RabbitTemplate` | Vitest con fakes (no mocks) de repositorios |
| **Dependencias** | Parcialmente reales (template mockeado, pero lógica de mapping real) | Fakes con lógica real de mappers y entidades |
| **Ejemplo backend** | `JdbcBookingPersistenceAdapterTest` — verifica SQL, parámetros, mapping de `RowMapper` | — |
| **Ejemplo frontend** | — | `auth-flow.integration.test.ts` — FakeAuthRepository + UserMapper real + User entity |

**Justificación en arquitectura hexagonal:** La arquitectura hexagonal separa *ports* (interfaces) de *adapters* (implementaciones). Los tests de integración verifican que un adapter implementa correctamente su puerto — por ejemplo, que `JdbcBookingPersistenceAdapter` traduce correctamente una llamada a `save()` en el SQL y parámetros esperados.

### 4.4 Nivel 4 — Tests de Caja Negra / E2E (Cima de la pirámide)

**Objetivo:** Validar el sistema **como lo vería un cliente HTTP externo**, con todos los servicios reales levantados.

| Aspecto | Detalle |
|---------|---------|
| **Qué se testea** | Flujo completo: HTTP → Gateway → Servicio → DB → Respuesta |
| **Herramientas** | `curl` + `bash` scripting + assertions manuales |
| **Dependencias** | Todas reales: MariaDB, RabbitMQ, Liquibase, auth-service |
| **Infraestructura** | Docker Compose (levantado en CI con `docker compose up`) |
| **Ejemplo** | `test-user-creation.sh` — POST /auth/register → 201, duplicado → 409 |

**Justificación:** Son pocos en proporción porque son lentos y más frágiles, pero son imprescindibles porque detectan problemas que ningún otro nivel puede encontrar:
- Errores de configuración de Docker/entorno
- Problemas de serialización/deserialización JSON real
- Fallos en migraciones de Liquibase
- Problemas de conectividad entre servicios y la BD

Se subdivide en **dos tipos** para cubrir la integridad completa del sistema:

#### 4.4.1 Caja Negra — API (curl / HTTP directo)

| Aspecto | Detalle |
|---------|--------|
| **Herramienta** | `curl` + bash scripting |
| **Qué valida** | Contrato HTTP del backend (status codes, JSON, error codes) |
| **Servicios levantados** | MariaDB, RabbitMQ, Liquibase, auth-service |
| **Archivo** | `Backend/tests/blackbox/test-user-creation.sh` — 7 test cases |

#### 4.4.2 Caja Negra — E2E UI (Playwright)

| Aspecto | Detalle |
|---------|--------|
| **Herramienta** | Postman Collection / Newman CLI |
| **Qué valida** | Caja negra API pura interactuando directamente con el backend: Autenticación (`POST /auth/register`) y Reservas (`POST /api/bookings`, `GET /api/bookings`). Se ejecutan a través de Newman. |
| **Servicios levantados** | **Stack completo**: Frontend (Nginx) + API Gateway + todos los microservicios + MariaDB + RabbitMQ |
| **Archivo** | `Backend/tests/blackbox/reservas-api.postman_collection.json` (3 tests: TC-BB-030 a TC-BB-032) |

**Integridad del sistema verificada con Playwright:**
```
Usuario → Navegador (Chromium) → Frontend (React/Nginx:5173)
  → API Gateway (:3000) → auth-service (:3001) → MariaDB → RabbitMQ
                        → bookings-service (:3003)
                        → locations-service (:3004)
                        → inventory-service (:3005)
```

Esto complementa la integridad del sistema: las pruebas de Postman (Newman) validan la **comunicación HTTP y los contratos de API directamente contra el hub expuesto** en un entorno Dockerizado, comprobando la integración del API Gateway con los microservicios de backend reales (p. ej. `bookings-service`, `auth-service`).

---

## 5. Tipos de Pruebas Implementados

### 5.1 Clasificación por técnica

| Tipo | Técnica | Capa | Código visible | Ejemplo en el proyecto |
|------|---------|------|:--------------:|------------------------|
| **Unitaria** | Caja blanca | Dominio / Aplicación | ✅ | `AuthApplicationServiceTest.java` |
| **Componente** | Caja blanca | Web / UI | ✅ | `AuthControllerTest.java`, `LoginForm.test.jsx` |
| **Integración** | Caja gris | Adapters / Multi-capa | Parcial | `auth-flow.integration.test.ts` |
| **Caja Negra (E2E)** | Caja negra | Sistema completo | ❌ | `test-user-creation.sh` |

### 5.2 Clasificación por objetivo

| Objetivo | Tests en el proyecto |
|----------|---------------------|
| **Funcional** | Todos los 1 032 tests validan comportamiento esperado |
| **Regresión** | CI ejecuta toda la suite en cada push/PR |
| **Smoke** | `*ApplicationTests.java` (context loads) en cada servicio |
| **Contrato** | `AuthControllerTest` valida status codes + estructura JSON |
| **Seguridad** | `JwtAuthenticationFilterTest` en auth, bookings, locations, inventory |
| **Validación de entrada** | Tests de DTOs vacíos, emails inválidos, passwords cortos |

---

## 6. Pruebas de Caja Blanca vs. Caja Negra

### 6.1 Caja Blanca — Conocimiento del código interno

En pruebas de caja blanca, el tester **conoce la estructura interna** del código y diseña los tests para cubrir caminos de ejecución específicos.

#### ¿Dónde se aplica en el proyecto?

**Backend — Ejemplo: `AuthApplicationServiceTest`**

```java
// Se conoce la lógica interna: si el email existe → lanzar ApiException
@Test
void register_emailDuplicado_lanzaConflict() {
    when(userPersistencePort.existsByEmail("test@test.com")).thenReturn(true);
    
    ApiException ex = assertThrows(ApiException.class,
        () -> service.register(new RegisterCommand("Test", "test@test.com", "123456")));
    
    assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    assertEquals("EMAIL_ALREADY_REGISTERED", ex.getErrorCode());
    verify(userPersistencePort, never()).save(any(), any(), any()); // ← verifica internals
}
```

**Características caja blanca evidenciadas:**
- Se mockean las **dependencias internas** (`userPersistencePort`)
- Se verifica que ciertos métodos internos **no se invoquen** (`never().save()`)
- Se conoce la **estructura condicional** del código (if exists → throw)
- Se prueba cada **branch** independientemente

**Frontend — Ejemplo: `LoginUseCase.test.ts`**

```typescript
// Se conoce que el UseCase valida antes de llamar al repositorio
it('should throw if email is empty', async () => {
    await expect(useCase.execute('', 'password'))
        .rejects.toThrow('Email es requerido');
    expect(mockRepo.login).not.toHaveBeenCalled(); // ← verifica internals
});
```

**Técnicas de caja blanca utilizadas:**

| Técnica | Aplicación | Ejemplo |
|---------|-----------|---------|
| **Cobertura de sentencias** | JaCoCo (back), V8 (front) miden % de líneas ejecutadas | 93.55% backend, 95.32% frontend |
| **Cobertura de branches** | Asegurar que ambos caminos de un `if` se ejecuten | 84.82% backend, 83.47% frontend |
| **Verificación de interacciones** | `verify()` en Mockito, `expect(mock).toHaveBeenCalled()` en Vitest | `verify(eventPublisher, times(1)).publish(any())` |
| **Inyección de errores** | Simular excepciones en dependencias internas | `when(port.save()).thenThrow(new RuntimeException())` |

### 6.2 Caja Negra — Sin conocimiento del código interno

En pruebas de caja negra, el tester **solo conoce la interfaz pública** (endpoints HTTP, contratos de API) y valida entradas vs. salidas sin saber cómo funciona internamente.

#### ¿Dónde se aplica en el proyecto?

**`Backend/tests/blackbox/test-user-creation.sh`**

```bash
# Solo se conoce: endpoint, input JSON, output esperado. NO se sabe qué hace internamente.
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"unique@test.com","password":"securePass123"}')

# Se valida solo la SALIDA (status code + JSON), no la lógica interna
assert_status "Registro exitoso" 201 "$HTTP_CODE" "$BODY"
assert_json_field "Campo ok=True" "$BODY" "['ok']" "True"
```

**Características caja negra evidenciadas:**
- **No hay mocks** — los servicios reales están levantados con Docker
- **No se conoce** la BD, el hashing de passwords, ni el generador de JWT
- **Solo se validan entradas y salidas** — status code, estructura JSON, error codes
- **El servicio es un artefacto opaco** — se trata como una caja negra

**Técnicas de caja negra utilizadas:**

| Técnica | Aplicación | Test case |
|---------|-----------|-----------|
| **Partición de equivalencia** | Dividir inputs en clases: válido, inválido, límite | Email válido vs. inválido vs. vacío |
| **Valores límite** | Probar en los bordes de las restricciones | Password de 5 chars (límite-1) vs 6 chars (límite) |
| **Tabla de decisión** | Mapear combinaciones de entrada a outputs esperados | `{valid email, valid pass}` → 201; `{dup email, valid pass}` → 409 |
| **Transición de estados** | Validar que estados se transicionan correctamente | Registro → Login → GET /me (con token del registro) |

### 6.3 Comparativa directa

| Característica | Caja Blanca | Caja Negra |
|---|---|---|
| **Conocimiento del código** | Completo | Ninguno |
| **Qué valida** | Lógica interna, paths, branches | Comportamiento observable (I/O) |
| **Dependencias** | Mockeadas | Reales (DB, RabbitMQ, Docker) |
| **Velocidad** | Rápida (ms) | Lenta (segundos) |
| **Fragilidad** | Alta (acoplada a implementación) | Baja (acoplada a contrato) |
| **Detecta** | Errores de lógica, branches no cubiertos | Errores de configuración, integración, contrato |
| **Cantidad en el proyecto** | ~1 025 tests | 7 tests |
| **Archivos** | `*Test.java`, `*.test.ts/jsx` | `test-user-creation.sh` |

---

## 7. Pipeline CI — Distinción Componente vs. Integración

### 7.1 Arquitectura del Pipeline

El archivo `.github/workflows/ci.yml` define **5 jobs** visualmente diferenciados que separan las pruebas de componente de las de integración mediante **JUnit 5 tags** (`@Tag("integration")`) y **tasks Gradle** independientes (`componentTest`, `integrationTest`):

```
┌──────────────────────────┐   ┌──────────────────────────┐   ┌─────────────────────┐
│ 🧩 component-tests       │   │ 🔗 integration-tests     │   │ 🌐 frontend          │
│  (6 servicios × matrix)  │   │  (6 servicios × matrix)  │   │  (lint + npm test)   │
│  ./gradlew componentTest │   │  ./gradlew integrationTest│   │                     │
│  excludeTags=integration │   │  includeTags=integration  │   │                     │
└──────────┬───────────────┘   └──────────┬───────────────┘   └─────────┬───────────┘
           │                              │                             │
           ▼                              ▼                             │
┌─────────────────────────────────────────────┐                         │
│ 📦 blackbox-tests                           │                         │
│  (docker compose up + test-user-creation.sh │                         │
│   ejecutado DENTRO de contenedor Docker)    │                         │
│  needs: [component-tests, integration-tests]│                         │
└──────────────────────┬──────────────────────┘                         │
                       │                                                │
                       ▼                                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 🎭 e2e-tests (Playwright)                                               │
│  (stack completo + navegador Chromium)                                   │
│  needs: [component-tests, integration-tests, frontend]                   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Mecanismo de separación — JUnit 5 Tags + Gradle Tasks

La diferenciación entre pruebas de componente e integración se implementa en **tres capas**:

#### Capa 1: Anotaciones JUnit 5 en los tests

Los tests que levantan contexto de Spring pesado (`@SpringBootTest`, `@DataJpaTest`, `@JdbcTest`) están anotados con `@Tag("integration")`. Los demás (unitarios, `@WebMvcTest`, Mockito puro) no tienen tag y se consideran tests de componente.

```java
// Test de INTEGRACIÓN — levanta contexto real de Spring + H2
@Tag("integration")
@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:auth_ctx;..."})
class AuthServiceApplicationTests { ... }

@Tag("integration")
@DataJpaTest
class UserPersistenceAdapterTest { ... }

@Tag("integration")
@JdbcTest
class JdbcBookingPersistenceAdapterTest { ... }

// Test de COMPONENTE — sin tag, web slice aislado o Mockito puro
@WebMvcTest(value = AuthController.class, ...)
class AuthControllerTest { ... }

class AuthApplicationServiceTest { ... }  // @Mock + @InjectMocks
```

#### Capa 2: Tasks Gradle separados

En `Backend/build.gradle` (bloque `subprojects`):

```groovy
subprojects {
    tasks.register('componentTest', Test) {
        description = 'Runs component tests (excludes integration)'
        group = 'verification'
        useJUnitPlatform {
            excludeTags 'integration'
        }
    }

    tasks.register('integrationTest', Test) {
        description = 'Runs integration tests only'
        group = 'verification'
        useJUnitPlatform {
            includeTags 'integration'
        }
    }
}
```

#### Capa 3: Jobs separados en GitHub Actions

Cada tipo de test tiene su propio job visible en la UI de GitHub Actions, con iconos y nombres distintos.

### 7.3 Tests con `@Tag("integration")` — Inventario

| Servicio | Test de integración | Anotación |
|---|---|---|
| auth-service | `AuthServiceApplicationTests` | `@Tag("integration")` + `@SpringBootTest` |
| auth-service | `UserPersistenceAdapterTest` | `@Tag("integration")` + `@DataJpaTest` |
| bookings-service | `BookingsServiceApplicationTests` | `@Tag("integration")` + `@SpringBootTest` |
| bookings-service | `JdbcBookingPersistenceAdapterTest` | `@Tag("integration")` + `@JdbcTest` |
| inventory-service | `InventoryServiceApplicationTests` | `@Tag("integration")` + `@SpringBootTest` |
| inventory-service | `JdbcInventoryPersistenceAdapterTest` | `@Tag("integration")` + `@JdbcTest` |
| locations-service | `LocationsServiceApplicationTests` | `@Tag("integration")` + `@SpringBootTest` |
| locations-service | `JdbcLocationsPersistenceAdapterTest` | `@Tag("integration")` + `@JdbcTest` |
| api-gateway | `ApiGatewayApplicationTests` | `@Tag("integration")` + `@SpringBootTest` |
| api-gateway | `GatewayProxyConfigTest` | `@Tag("integration")` + `@SpringBootTest` |
| api-gateway | `HealthControllerTest` | `@Tag("integration")` + `@SpringBootTest` |

### 7.4 Job 1: `component-tests` — Pruebas de Componente (Sin Spring Context pesado)

```yaml
jobs:
  component-tests:
    name: "🧩 Component Tests (${{ matrix.service }})"
    strategy:
      matrix:
        service: [auth-service, bookings-service, api-gateway, ...]
    steps:
      - ./gradlew --no-daemon componentTest  # excludeTags 'integration'
```

**Qué ejecuta:** Tests que NO tienen `@Tag("integration")`:

| Tipo de test | Aislamiento | Ejemplo |
|---|---|---|
| Unitarios con Mockito | Sin Spring context | `AuthApplicationServiceTest` |
| `@WebMvcTest` (web slice) | Solo web layer; servicios mockeados | `AuthControllerTest` |
| Adapters con mock | Sin infraestructura | `JwtTokenAdapterTest` |
| Exception handlers | Mockito puro | `GlobalExceptionHandlerTest` |

**Característica clave:** Cada servicio se ejecuta **en paralelo** (`fail-fast: false`) y **no necesita infraestructura** (ni BD, ni RabbitMQ). Son rápidos (~5-15s por servicio).

### 7.5 Job 2: `integration-tests` — Pruebas de Integración (Spring Context + BD)

```yaml
jobs:
  integration-tests:
    name: "🔗 Integration Tests (${{ matrix.service }})"
    strategy:
      matrix:
        service: [auth-service, bookings-service, api-gateway, ...]
    steps:
      - ./gradlew --no-daemon integrationTest  # includeTags 'integration'
```

**Qué ejecuta:** Solo tests anotados con `@Tag("integration")`:

| Tipo de test | Aislamiento | Ejemplo |
|---|---|---|
| `@SpringBootTest` (context load) | Context completo con H2 | `AuthServiceApplicationTests` |
| `@DataJpaTest` (JPA slice) | Persistence layer + H2 | `UserPersistenceAdapterTest` |
| `@JdbcTest` (JDBC slice) | JDBC + H2 in-memory | `JdbcBookingPersistenceAdapterTest` |

**Diferencia clave con component-tests:**

| Aspecto | 🧩 Component Tests | 🔗 Integration Tests |
|---|---|---|
| Spring Context | No, o solo web slice | Completo o persistence slice |
| Base de datos | Ninguna | H2 in-memory |
| Gradle task | `componentTest` | `integrationTest` |
| JUnit tag | Sin tag | `@Tag("integration")` |
| Velocidad | ~5s por servicio | ~15-30s por servicio |
| Qué detecta | Errores de lógica, mapeo HTTP | Errores de persistencia, config, wiring |

### 7.6 Job 3: `frontend` — Pruebas de Componente + Integración (Frontend)

```yaml
jobs:
  frontend:
    name: "🌐 Frontend"
    steps:
      - npm run lint
      - npm test
```

**Qué ejecuta:** Los 856 tests del frontend con Vitest, que incluyen:

| Tipo | Cantidad | Aislamiento |
|---|---|---|
| Unitarios (dominio, use cases, mappers) | ~500 | Completo (vi.fn) |
| Componente (render, screen, fireEvent) | ~300 | jsdom + mocked hooks |
| Integración multi-capa | ~50 | Fakes con lógica real |

### 7.7 Job 4: `blackbox-tests` — Pruebas de Caja Negra API (dentro de contenedor)

```yaml
jobs:
  blackbox-tests:
    name: "📦 Black-Box Tests (API)"
    needs: [component-tests, integration-tests]
    steps:
      - docker compose up -d mariadb rabbitmq database auth-service api-gateway
      - docker run --rm \
          --network <backend_network> \
          -e AUTH_URL=http://auth-service:3001 \
          -v Backend/tests/blackbox:/tests:ro \
          python:3.12-slim \
          bash -c "apt-get install curl && bash /tests/test-user-creation.sh"
      - docker compose down -v
```

**Qué ejecuta:** Pruebas HTTP reales contra servicios containerizados, con el script de tests ejecutándose **dentro de un contenedor Docker** conectado a la red interna de backend.

**Ejecución dentro del contenedor:**
- Se usa `docker run` con un contenedor `python:3.12-slim` conectado a la red Docker interna (`backend_network`)
- El script usa `AUTH_URL=http://auth-service:3001` (hostname interno de Docker, no localhost)
- El script se monta como volumen read-only desde `Backend/tests/blackbox/`
- Esto garantiza que las pruebas se ejecutan en el **mismo entorno de red** que los servicios

**Diferencia clave con los jobs anteriores:**

| Aspecto | Jobs 1–3 (Componente/Integración) | Job 4 (Caja Negra API) |
|---|---|---|
| Infraestructura | Ninguna o H2 in-memory | MariaDB + RabbitMQ + Liquibase reales |
| Servicios | Ninguno levantado | auth-service real en Docker |
| Mocks | Mockito / vi.fn() / H2 | Ningún mock |
| Ejecución | JVM / Node.js del runner | **Dentro de contenedor Docker** |
| Comunicación | Simulada o in-process | Real (HTTP → Service → DB) |
| Velocidad | ~30s total | ~2-3 min |
| Falla por | Lógica incorrecta | Config, red, SQL, serialización |



1. **Push/PR** a `main` o `develop` → CI se activa
2. **Paralelo:** `component-tests` (6 jobs × 1 servicio) + `integration-tests` (6 jobs × 1 servicio) + `frontend` (1 job)
3. **Secuencial:** Si `component-tests` + `integration-tests` pasan → `blackbox-tests` levanta Docker y ejecuta caja negra API **dentro de contenedor**
4. **Resultado:** Si todo pasa → PR puede mergearse; si falla → CI bloquea el merge

### 7.9 Visualización en GitHub Actions

En la UI de GitHub Actions, los jobs se muestran visualmente diferenciados:

```
✅ 🧩 Component Tests (auth-service)
✅ 🧩 Component Tests (bookings-service)
✅ 🧩 Component Tests (api-gateway)
✅ 🧩 Component Tests (inventory-service)
✅ 🧩 Component Tests (locations-service)
✅ 🧩 Component Tests (notifications-service)
✅ 🔗 Integration Tests (auth-service)
✅ 🔗 Integration Tests (bookings-service)
✅ 🔗 Integration Tests (api-gateway)
✅ 🔗 Integration Tests (inventory-service)
✅ 🔗 Integration Tests (locations-service)
✅ 🔗 Integration Tests (notifications-service)
✅ 🌐 Frontend
✅ 📦 Black-Box Tests (API)
```

---

## 8. Test Cases

### 8.1 Test Cases — Caja Negra API: Creación de Usuario

| TC-ID | Nombre | Precondición | Entrada | Acción | Resultado Esperado | Prioridad |
|-------|--------|-------------|---------|--------|-------------------|-----------|
| TC-BB-001 | Registro exitoso | Servicio levantado, email no existe | `{"name":"Test User","email":"<unique>@test.com","password":"securePass123"}` | `POST /auth/register` | HTTP 201, `ok: true`, `data.user.name == "Test User"`, token JWT presente | Alta |
| TC-BB-002 | Email duplicado | Usuario ya registrado con mismo email | Mismo JSON que TC-BB-001 | `POST /auth/register` | HTTP 409, `ok: false`, `errorCode: "EMAIL_ALREADY_REGISTERED"` | Alta |
| TC-BB-003 | Campos vacíos | Servicio levantado | `{"name":"","email":"","password":""}` | `POST /auth/register` | HTTP 400, `ok: false` | Alta |
| TC-BB-004 | Email inválido | Servicio levantado | `{"name":"Bad","email":"not-an-email","password":"securePass123"}` | `POST /auth/register` | HTTP 400, `ok: false` | Media |
| TC-BB-005 | Password corto | Servicio levantado | `{"name":"Short","email":"short@test.com","password":"123"}` | `POST /auth/register` | HTTP 400, `ok: false` | Media |
| TC-BB-006 | Login post-registro | Usuario creado en TC-BB-001 | `{"email":"<unique>@test.com","password":"securePass123"}` | `POST /auth/login` | HTTP 200, `ok: true` | Alta |
| TC-BB-007 | Acceso autenticado | Token obtenido en TC-BB-001 | Header: `Authorization: Bearer <token>` | `GET /auth/me` | HTTP 200, `data.email == "<unique>@test.com"` | Alta |

### 8.2 Test Cases — Caja Negra API (Postman / Newman)

Cubre endpoints fundamentales (autenticación y flujo de reservas) como pruebas puras de API usando Colecciones de Postman ejecutadas vía Newman. Estas pruebas validan respuestas HTTP integrándose directamente con el backend dockerizado a través del API Gateway.

| TC-ID | Nombre | Precondición | Acción (Postman Request) | Resultado Esperado | Prioridad |
|-------|--------|-------------|--------|-------------------|----------|
| TC-BB-030 | Caja negra API — `POST /auth/register` crea usuario y retorna JWT | Stack levantado | `POST /auth/register` (body JSON) | HTTP 201, `ok: true`, token válido (3 partes) | Alta |
| TC-BB-031 | Caja negra API — `POST /bookings/reservations` crea reserva | Usuario registrado, variable `API_TOKEN` seteada | `POST /bookings/reservations` (header auth) | HTTP 201, `ok: true`, ID de location devuelto coincide | Alta |
| TC-BB-032 | Caja negra API — `GET /bookings/reservations` consulta reservas | Reserva creada, variable `API_TOKEN` seteada | `GET /bookings/reservations` (header auth) | HTTP 200, array con datos, encuentra locationId reservado | Alta |

### 8.3 Test Cases — Caja Blanca: auth-service (Unitarios)

| TC-ID | Nombre | Técnica | Clase bajo test | Qué verifica |
|-------|--------|---------|-----------------|-------------|
| TC-WB-001 | Registro delega a puerto de persistencia | Verificación de interacción | `AuthApplicationService` | `verify(userPersistencePort).save(...)` llamado 1 vez |
| TC-WB-002 | Registro hashea password | Verificación de interacción | `AuthApplicationService` | `verify(passwordPort).hash(rawPassword)` |
| TC-WB-003 | Registro publica evento | Verificación de interacción | `AuthApplicationService` | `verify(eventPublisher).publishUserCreated(...)` |
| TC-WB-004 | Email duplicado lanza excepción | Cobertura de branch | `AuthApplicationService` | `assertThrows(ApiException.class)` con status 409 |
| TC-WB-005 | Login con credenciales inválidas | Cobertura de branch | `AuthApplicationService` | `assertThrows(ApiException.class)` con status 401 |
| TC-WB-006 | Controller retorna 201 en registro | Componente web | `AuthController` | `MockMvc → status().isCreated()` |
| TC-WB-007 | Controller retorna 400 sin campos | Componente web | `AuthController` | `MockMvc → status().isBadRequest()` |
| TC-WB-008 | JWT filter acepta token válido | Seguridad | `JwtAuthenticationFilter` | Security context populated |
| TC-WB-009 | JWT filter rechaza token inválido | Seguridad | `JwtAuthenticationFilter` | Chain continues without auth |

### 8.4 Test Cases — Caja Blanca: Frontend (Unitarios + Componente)

| TC-ID | Nombre | Tipo | Archivo | Qué verifica |
|-------|--------|------|---------|-------------|
| TC-FE-001 | LoginUseCase valida email vacío | Unitario | `LoginUseCase.test.ts` | Lanza error, NO llama al repositorio |
| TC-FE-002 | RegisterUseCase delega al repo | Unitario | `RegisterUseCase.test.ts` | `mockRepo.register` llamado con datos correctos |
| TC-FE-003 | LoginForm muestra error | Componente | `LoginForm.test.jsx` | texto de error visible en DOM |
| TC-FE-004 | LoginForm deshabilitado en loading | Componente | `LoginForm.test.jsx` | Botón `disabled` durante submit |
| TC-FE-005 | ProtectedRoute redirige sin auth | Componente | `ProtectedRoute.test.jsx` | Redirección a `/login` |
| TC-FE-006 | Flujo auth completo | Integración | `auth-flow.integration.test.ts` | Register → Login → GetUser con mappers reales |
| TC-FE-007 | Reservation entity valida fechas | Unitario dominio | `Reservation.test.ts` | start < end, no en el pasado |
| TC-FE-008 | ReservationCard muestra estado | Componente | `ReservationCard.test.jsx` | Badge con estado correcto renderizado |

---

## 9. Métricas y Cobertura

### 9.1 Backend — Cobertura JaCoCo

| Servicio | Líneas | Branches | Tests | Checkstyle | PMD | SpotBugs |
|----------|--------|----------|-------|------------|-----|----------|
| auth-service | 86.13% | 90.91% | 34 | 0 | 0 | 5 |
| bookings-service | 96.70% | 85.90% | 73 | 0 | 0 | 0 |
| locations-service | 95.00% | 84.62% | 49 | 0 | 0 | 0 |
| inventory-service | 95.44% | 85.71% | 43 | 0 | 0 | 8 |
| notifications-service | 86.99% | 81.03% | 36 | 1 | 0 | 4 |
| api-gateway | 89.80% | 100.00% | 13 | 0 | 0 | 0 |
| **Promedio ponderado** | **93.55%** | **84.82%** | **248** | **1** | **0** | **17** |

**Umbrales configurados:** LINE ≥ 25%, BRANCH ≥ 15% (mínimos, ampliamente superados).

### 9.2 Frontend — Cobertura V8

| Métrica | Valor |
|---------|-------|
| Statements | 93.46% |
| Branches | 83.47% |
| Functions | 95.98% |
| Lines | 95.32% |

**Umbral configurado:** 40% mínimo en todas las métricas.

### 9.3 Distribución por nivel de la pirámide

| Nivel | Backend | Frontend | Total | % |
|-------|---------|----------|-------|---|
| Unitarios | ~120 | ~500 | ~620 | 60% |
| Componente | ~40 | ~300 | ~340 | 33% |
| Integración | ~9 | ~50 | ~59 | 6% |
| Caja Negra — API (curl) | 7 | 0 | 7 | <1% |
| Caja Negra — API (Postman/Newman) | 3 | 0 | 3 | <1% |
| **Total** | **172** | **850** | **1029** | 100% |

---

## 10. Herramientas y Frameworks

### 10.1 Backend

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| JUnit 5 | 5.x (Spring Boot managed) | Test runner, assertions, lifecycle |
| Mockito | 5.x (Spring Boot managed) | Mocking: `@Mock`, `@InjectMocks`, `when/verify` |
| Spring Boot Test | 3.x | `@SpringBootTest`, `@WebMvcTest`, `MockMvc` |
| JaCoCo | 0.8.x | Cobertura de código (multi-module report) |
| Gradle | 8.x | Build tool con tasks `componentTest` / `integrationTest` |
| JUnit 5 Tags | 5.x | `@Tag("integration")` para separar tipos de test |

### 10.2 Frontend

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Vitest | 4.0.18 | Test runner, assertions, mocking (`vi`) |
| @testing-library/react | 16.3.2 | Renderizado de componentes, queries de DOM |
| @testing-library/jest-dom | 6.9.1 | Matchers de DOM (`toBeInTheDocument`, etc.) |
| @vitest/coverage-v8 | 4.0.18 | Cobertura basada en V8 |
| jsdom | 28.1.0 | Entorno de navegador simulado |

### 10.3 Infraestructura de pruebas

| Herramienta | Propósito |
|-------------|-----------|
| Docker Compose | Levantar stack completo para caja negra |
| curl + bash | Ejecutar tests HTTP de caja negra (API) |
| Playwright (Chromium) | Tests E2E de caja negra con navegador real |
| GitHub Actions | CI: ejecutar toda la suite en push/PR |
| MariaDB 11.4 | Base de datos para tests de integración |
| Liquibase 4.30 | Migraciones de BD en CI |
| RabbitMQ 3.13 | Message broker para tests de eventos |

---

## 11. Inventario de Tests

### 11.1 Backend — 248 tests

<details>
<summary><strong>auth-service (34 tests)</strong></summary>

| Archivo | Tipo | Tag |
|---------|------|-----|
| `AuthServiceApplicationTests.java` | Smoke (@SpringBootTest) | `@Tag("integration")` |
| `AuthControllerTest.java` | Componente (@WebMvcTest) | — |
| `AuthApplicationServiceTest.java` | Unitario (Mockito) | — |
| `UserPersistenceAdapterTest.java` | Integración (@DataJpaTest) | `@Tag("integration")` |
| `SecurityAdaptersTest.java` | Unitario (adapter) | — |
| `JwtAuthenticationFilterTest.java` | Unitario (seguridad) | — |
| `GlobalExceptionHandlerTest.java` | Unitario (handler) | — |

</details>

<details>
<summary><strong>bookings-service (73 tests)</strong></summary>

| Archivo | Tipo | Tag |
|---------|------|-----|
| `BookingsServiceApplicationTests.java` | Smoke | `@Tag("integration")` |
| `BookingApplicationServiceTest.java` | Unitario | — |
| `BookingControllerTest.java` | Componente (@WebMvcTest) | — |
| `BookingControllerUnitTest.java` | Unitario | — |
| `JdbcBookingPersistenceAdapterTest.java` | Integración (@JdbcTest) | `@Tag("integration")` |
| `JdbcBookingPersistenceAdapterUnitTest.java` | Unitario | — |
| `RabbitReservationEventPublisherAdapterTest.java` | Integración (RabbitMQ) | — |
| `NoOpReservationEventPublisherAdapterTest.java` | Unitario | — |
| `JwtTokenAdapterTest.java` | Unitario | — |
| `JwtAuthenticationFilterTest.java` | Unitario | — |
| `GlobalExceptionHandlerTest.java` | Unitario | — |

</details>

<details>
<summary><strong>locations-service (49 tests)</strong></summary>

| Archivo | Tipo | Tag |
|---------|------|-----|
| `LocationsServiceApplicationTests.java` | Smoke | `@Tag("integration")` |
| `LocationsApplicationServiceTest.java` | Unitario | — |
| `LocationsControllerTest.java` | Componente (@WebMvcTest) | — |
| `LocationsControllerUnitTest.java` | Unitario | — |
| `SpacesControllerTest.java` | Componente (@WebMvcTest) | — |
| `JdbcLocationsPersistenceAdapterTest.java` | Integración (@JdbcTest) | `@Tag("integration")` |
| `RabbitLocationEventPublisherAdapterTest.java` | Integración (RabbitMQ) | — |
| `NoOpLocationEventPublisherAdapterTest.java` | Unitario | — |
| `JwtTokenAdapterTest.java` | Unitario | — |
| `JwtAuthenticationFilterTest.java` | Unitario | — |
| `GlobalExceptionHandlerTest.java` | Unitario | — |

</details>

<details>
<summary><strong>inventory-service (43 tests)</strong></summary>

| Archivo | Tipo | Tag |
|---------|------|-----|
| `InventoryServiceApplicationTests.java` | Smoke | `@Tag("integration")` |
| `InventoryApplicationServiceTest.java` | Unitario | — |
| `EquipmentsControllerTest.java` | Componente (@WebMvcTest) | — |
| `EquipmentsControllerUnitTest.java` | Unitario | — |
| `JdbcInventoryPersistenceAdapterTest.java` | Integración (@JdbcTest) | `@Tag("integration")` |
| `RabbitEquipmentEventPublisherAdapterTest.java` | Integración (RabbitMQ) | — |
| `NoOpEquipmentEventPublisherAdapterTest.java` | Unitario | — |
| `JwtTokenAdapterTest.java` | Unitario | — |
| `SecurityConfigTest.java` | Componente | — |
| `GlobalExceptionHandlerTest.java` | Unitario | — |

</details>

<details>
<summary><strong>notifications-service (36 tests)</strong></summary>

| Archivo | Tipo | Tag |
|---------|------|-----|
| `NotificationsServiceApplicationTests.java` | Smoke | — |
| `ReservationReminderApplicationServiceTest.java` | Unitario | — |
| `InAppNotificationServiceTest.java` | Unitario | — |
| `EventBroadcastApplicationServiceTest.java` | Unitario | — |
| `RabbitMqEventListenerTest.java` | Integración (RabbitMQ) | — |
| `StompWebSocketBroadcastAdapterTest.java` | Integración (WebSocket) | — |

</details>

<details>
<summary><strong>api-gateway (13 tests)</strong></summary>

| Archivo | Tipo | Tag |
|---------|------|-----|
| `ApiGatewayApplicationTests.java` | Smoke | `@Tag("integration")` |
| `HealthControllerTest.java` | Componente | `@Tag("integration")` |
| `GatewayProxyConfigTest.java` | Componente | `@Tag("integration")` |

</details>

### 11.2 Frontend — 856 tests en 84 archivos

<details>
<summary><strong>Dominio (7 archivos) — Unitarios puros</strong></summary>

`Reservation.test.ts`, `Reservation.core.test.ts`, `Delivery.test.ts`, `User.test.ts`, `Location.test.ts`, `InventoryItem.test.ts`, `AuthenticationError.test.ts`

</details>

<details>
<summary><strong>Use Cases (15 archivos) — Unitarios con mock de repositorio</strong></summary>

`LoginUseCase.test.ts`, `RegisterUseCase.test.ts`, `LogoutUseCase.test.ts`, `GetCurrentUserUseCase.test.ts`, `CreateReservationUseCase.test.ts`, `GetInventoryUseCase.test.ts`, `GetLocationsUseCase.test.ts`, `GetSpaceAvailabilityUseCase.test.ts`, `AssignInventoryUseCase.test.ts`, `RemoveInventoryUseCase.test.ts`, `CancelReservationUseCase.test.ts`, `GetUserReservationsUseCase.test.ts`, `DeliverReservationUseCase.test.ts`, `ReturnReservationUseCase.test.ts`, `SubmitDeliveryUseCase.test.ts`

</details>

<details>
<summary><strong>Infraestructura (14 archivos) — Unitarios de adapters</strong></summary>

`AxiosHttpClient.test.ts`, `HttpClientFactory.test.ts`, `HttpAuthRepository.test.ts`, `HttpReservationRepository.test.ts`, `HttpInventoryRepository.test.ts`, `HttpLocationRepository.test.ts`, `HttpDeliveryRepository.test.ts`, `DeliveryMapper.test.ts`, `InventoryMapper.test.ts`, `LocationMapper.test.ts`, `ReservationMapper.test.ts`, `UserMapper.test.ts`, `LocalStorageService.test.ts`, `StompWebSocketService.test.ts`

</details>

<details>
<summary><strong>Componentes UI (17 archivos) — Tests de componente</strong></summary>

`LoginForm.test.jsx`, `SignupForm.test.jsx`, `Header.test.jsx`, `Pagination.test.jsx`, `ProtectedRoute.test.jsx`, `SearchBar.test.jsx`, `ItemCard.test.jsx`, `Calendar.test.jsx`, `DurationSelector.test.jsx`, `EquipmentSelector.test.jsx`, `InventoryAssignmentModal.test.jsx`, `ReservationModal.test.jsx`, `ReservationCard.test.jsx`, `ReservationFilterBar.test.jsx`, `ReservationList.test.jsx`, `HandoverModal.test.jsx`, `ReminderAlertBanner.test.jsx`

</details>

<details>
<summary><strong>Integración (3 archivos) — Multi-capa con fakes</strong></summary>

`auth-flow.integration.test.ts`, `dashboard-flow.integration.test.ts`, `reservation-flow.integration.test.ts`

</details>

### 11.3 Caja Negra API — 7 tests en 1 archivo

`Backend/tests/blackbox/test-user-creation.sh`

### 11.4 Caja Negra API (Postman / Newman) — 3 tests en 1 colección

| Archivo | Tests | Flujo verificado |
|---------|-------|------------------|
| `Backend/tests/blackbox/reservas-api.postman_collection.json` | 3 | **API pura**: Creación de usuario (`POST /auth/register`), Creación de reserva (`POST /bookings/reservations`) y Consulta de reservas (`GET /bookings/reservations`) |

**Ejecución:**
```bash
# Desde la raíz del proyecto, ejecuta Newman apuntando al archivo exacto:
npx newman run Backend/tests/blackbox/reservas-api.postman_collection.json
```

---

## 12. Riesgos y Mitigaciones

| # | Riesgo | Impacto | Probabilidad | Mitigación |
|---|--------|---------|-------------|-----------|
| 1 | Tests de caja negra lentos bloquean CI | Medio | Media | `timeout-minutes: 15`; ejecutan solo si los unitarios pasan (`needs: [backend]`) |
| 2 | Docker Compose falla en CI | Alto | Baja | Step de logs en failure; healthcheck con retry de 90s |
| 3 | Tests flaky por datos residuales | Alto | Media | `docker compose down -v` limpia volúmenes; emails con timestamp único |
| 4 | Warnings acumulados de SpotBugs (17) en backend | Medio | Alta | Reducir deuda técnica por servicio y convertir findings recurrentes en tareas de sprint |
| 5 | notifications-service con menor cobertura de ramas (81.03%) | Medio | Media | Priorizar tests de escenarios edge en adapters de eventos y WebSocket |
| 6 | Tests E2E Playwright sensibles a tiempos de carga | Medio | Media | Timeouts generosos (15s para navegación), retries en CI, screenshots/videos en failure |

---

## 13. Conclusiones

### Fortalezas de la estrategia actual

1. **Pirámide de testing bien formada:** 58% unitarios, 32% componente, 6% integración, 2% E2E — proporción saludable según ISTQB y Google Testing Blog.
2. **Cobertura alta:** >90% de líneas en backend y >95% en frontend. Superan ampliamente los umbrales mínimos.
3. **Separación clara y visual componente vs. integración en CI:** Los jobs `component-tests` y `integration-tests` se ejecutan como **jobs independientes** en GitHub Actions, diferenciados con iconos (🧩 y 🔗), usando JUnit 5 `@Tag("integration")` y Gradle tasks separados (`componentTest` / `integrationTest`). Los jobs `blackbox-tests` y `e2e-tests` levantan el stack real.
4. **Caja blanca + caja negra coexisten:** Los tests unitarios/componente (caja blanca) verifican lógica interna; los tests HTTP con curl y Playwright (caja negra) validan el contrato público y la experiencia de usuario.
5. **Arquitectura hexagonal facilita el testing:** Los puertos se mockean fácilmente para tests de componente; los adapters se testean con integración parcial.
6. **Integridad del sistema completa:** Las pruebas E2E con Playwright cierran el circuito verificando que Frontend → API Gateway → Microservicios → BD funcionan juntos a través de la UI real del usuario.
7. **Cobertura de flujo de transición de estado:** Se agregaron 11 tests de caja negra E2E (`status-transition-flow.spec.ts`) cubriendo la HU de transición "Próxima → En Progreso → Cerrado", verificando el badge de estado, el `HandoverModal` con novedades y la lógica de entrega/devolución del espacio.

### Áreas de mejora identificadas

1. Subir los umbrales de cobertura en CI (actualmente LINE ≥ 25% es demasiado permisivo vs. el 90% real).
2. Agregar contract testing (Pact) entre frontend y backend para validar schemas de API.
3. Evaluar visual regression testing con Playwright (screenshot comparison).

### Historial de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-03-04 | Versión inicial del Test Plan |
| 1.1 | 2026-03-04 | Pipeline CI actualizado: separación visual de pruebas de componente (`componentTest`) e integración (`integrationTest`) en jobs independientes con JUnit 5 `@Tag("integration")`; pruebas de caja negra ejecutándose dentro de contenedor Docker |
| 1.2 | 2026-03-06 | Nuevo spec de caja negra E2E `status-transition-flow.spec.ts` (11 tests, TC-BB-031–TC-BB-041) para la HU de transición de estado "Próxima → En Progreso → Cerrado": badge de estado, HandoverModal de entrega/devolución, campo de novedades. Totales actualizados: 1 058 tests, 26 E2E Playwright, 137 archivos de test |

---

> **Documento generado como parte de la estrategia de QA del proyecto Reservas Sofka.**  
> **Próxima revisión programada:** Sprint siguiente al 6 de marzo de 2026.
