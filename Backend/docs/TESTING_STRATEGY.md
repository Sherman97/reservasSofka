> **Ultima actualizacion:** Marzo 2026  
> **Framework:** JUnit 5 + Mockito + Spring Boot Test + JaCoCo  
> **Arquitectura:** Hexagonal / Clean Architecture (Ports & Adapters)

---

## Resumen Ejecutivo

| Metrica | Valor |
|---|---|
| **Line Coverage** | **90.37%** |
| **Branch Coverage** | **70.91%** |
| **Instruction Coverage** | **90.53%** |
| **Tests ejecutados** | **169** |
| **Tests en verde** | **169** |
| **Tests fallando** | **0** |
| **Pass rate** | **100%** |
| **Duracion suite** | **~2 min** |

---

## Piramide de Tests

```text
          /  E2E  \          <- Pendiente
         /---------\
        / Integration\       <- Parcial por modulo
       /-------------\
      /  Web Slice    \      <- Controllers + filtros + seguridad
     /-----------------\
    /   Unit Tests      \    <- Capa application/domain/adapters
   /---------------------\
```

| Nivel | Estado |
|---|---|
| **Unit Tests** | ✅ Solido |
| **Web/Controller Tests** | ✅ Solido |
| **Integration Tests** | ⚠️ Parcial |
| **E2E** | ❌ Pendiente |

---

## Cobertura por Servicio

| Servicio | Tests | Fallas | Line | Branch | Instruction | Estado |
|---|---:|---:|---:|---:|---:|---|
| `api-gateway` | 3 | 0 | 87.76% | 50.00% | 82.26% | ✅ |
| `auth-service` | 21 | 0 | 83.62% | 54.55% | 82.28% | ✅ |
| `bookings-service` | 51 | 0 | 93.23% | 75.35% | 93.53% | ✅ |
| `inventory-service` | 31 | 0 | 95.17% | 75.71% | 95.19% | ✅ |
| `locations-service` | 35 | 0 | 94.18% | 66.67% | 94.47% | ✅ |
| `notifications-service` | 28 | 0 | 74.58% | 69.83% | 76.33% | ✅ |

---

## Defensa de Estrategia: Verificar vs Validar

### 1. Verificar (arquitectura)

Objetivo: confirmar que los casos de uso invocan correctamente puertos de salida.

Ejemplo real:
- Archivo: `services/bookings-service/src/test/java/com/reservas/sk/bookings_service/application/service/BookingApplicationServiceTest.java`
- Caso: `createReservation_exitoso_publicaEventoYLiberarLock`

```java
verify(eventPublisherPort, times(1)).publishReservationCreated(any());
verify(persistencePort, times(1)).releaseSpaceReservationLock(2L);
```

Resultado: se verifica cumplimiento de arquitectura hexagonal (use case -> port), sin acoplar test a infraestructura concreta.

### 2. Validar (negocio)

Objetivo: confirmar reglas funcionales del dominio.

Ejemplo real:
- Archivo: `services/bookings-service/src/test/java/com/reservas/sk/bookings_service/application/service/BookingApplicationServiceTest.java`
- Caso: `createReservation_conflictoPorSolape`

```java
ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));
assertEquals(HttpStatus.CONFLICT, ex.getStatus());
assertEquals("SPACE_ALREADY_RESERVED", ex.getErrorCode());
```

Resultado: se valida una regla core de negocio (no doble reserva por solape de horario).

---

## Configuracion y Gate de Calidad

En el root `build.gradle`:
- `check` depende de `jacocoRootCoverageVerification`.
- Umbral actual:
  - `LINE >= 25%`
  - `BRANCH >= 15%`

Estado QA:
- El gate evita regresion grave, pero es bajo para estandar productivo.
- Recomendacion: subir gradualmente (ej. `LINE >= 70%`, `BRANCH >= 55%`) para prevenir regresiones.

---

## Gaps Conocidos y Plan de Mejora

| Prioridad | Gap | Impacto | Accion |
|---|---|---|---|
| 🟡 Media | Branch coverage global 70.91% | Menor robustez en caminos alternos | Agregar tests negativos/errores por modulo |
| 🟡 Media | Sin E2E backend | Riesgo en flujos cross-servicio | Incorporar pruebas E2E (API Gateway + servicios) |
| 🟢 Baja | `notifications-service` con cobertura menor | Margen de mejora | Expandir pruebas de branches en recordatorios/eventos |

---

## Comandos Utiles

```bash
# Reporte QA completo (ejecuta tests + cobertura + detalle PASS/FAIL)
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\qa-report.ps1

# Solo leer reportes existentes (sin correr Gradle)
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\qa-report.ps1 -SkipGradle

# Suite completa + cobertura
./gradlew test jacocoRootReport --continue

# Solo bookings (ejemplo Verificar/Validar)
./gradlew :bookings-service:test --tests "com.reservas.sk.bookings_service.application.service.BookingApplicationServiceTest"

# Solo modulo notifications
./gradlew :notifications-service:test

# Reportes HTML
services/<modulo>/build/reports/tests/test/index.html
services/<modulo>/build/reports/jacoco/test/html/index.html
```

---

## Evidencias de Ejecucion QA (2026-03-02)

### Segmento 1 - Comando ejecutado

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\qa-report.ps1
```

Salida inicial reportada:

```text
Running full test suite with JaCoCo...
To honour the JVM settings for this build a single-use Daemon process will be forked...
Daemon will be stopped at the end of the build
```

### Segmento 2 - Resultado de build

```text
BUILD SUCCESSFUL in 6m 39s
38 actionable tasks: 38 executed
Problems report: build/reports/problems/problems-report.html
```

### Segmento 3 - Advertencias observadas en compilacion de tests

Resumen de warnings reportados durante la corrida:
- `auth-service`: 1 warning (`@MockBean` deprecated/marked for removal).
- `inventory-service`: 2 warnings (`@MockBean` deprecated/marked for removal).
- `locations-service`: 2 warnings (`@MockBean` deprecated/marked for removal).
- Se reportaron ademas notas por uso de API deprecated y `unchecked` en algunos tests (`bookings`, `inventory`, `locations`).

### Segmento 4 - Resumen de pruebas (evidencia)

```text
=== TEST SUMMARY ===
Total: 169
Passed: 169
Failed: 0
Pass Rate: 100%
```

### Segmento 5 - Cobertura global (evidencia)

```text
=== GLOBAL COVERAGE ===
LINE:        90.37%
BRANCH:      70.91%
INSTRUCTION: 90.53%
```

### Segmento 6 - Cobertura por modulo (evidencia)

```text
api-gateway -> LINE: 87.76% | BRANCH: 50% | INSTRUCTION: 82.26%
auth-service -> LINE: 83.62% | BRANCH: 54.55% | INSTRUCTION: 82.28%
bookings-service -> LINE: 93.23% | BRANCH: 75.35% | INSTRUCTION: 93.53%
inventory-service -> LINE: 95.17% | BRANCH: 75.71% | INSTRUCTION: 95.19%
locations-service -> LINE: 94.18% | BRANCH: 66.67% | INSTRUCTION: 94.47%
notifications-service -> LINE: 74.58% | BRANCH: 69.83% | INSTRUCTION: 76.33%
```

### Segmento 7 - Evidencia de casos ejecutados

El script `qa-report.ps1` imprime el listado completo de tests ejecutados por modulo bajo el bloque:

```text
=== TEST CASES (PASS/FAIL) ===
```

En la corrida reportada se listaron los `169` casos y todos quedaron en estado satisfactorio (`Pass Rate: 100%`).

---

## Historial de Evolucion (resumen)

| Fecha | Hito |
|---|---|
| Feb 2026 | Base de pruebas por microservicio consolidada |
| Mar 2026 | Refuerzo de cobertura en bookings/inventory/locations + estrategia Verificar vs Validar documentada |
| Mar 2026 | Correccion de tests de contexto en auth/bookings/inventory/locations y cobertura global >= 90% |
