
> **Última actualización:** Marzo 2026  
> **Framework:** Vitest 4.x + V8 Coverage + jsdom  
> **Arquitectura:** Hexagonal / Clean Architecture con DI Container

---

## Resumen Ejecutivo

| Métrica        | Valor   |
|----------------|---------|
| **Statements** | 93.46%  |
| **Branches**   | 83.47%  |
| **Functions**  | 95.98%  |
| **Lines**      | 95.32%  |
| **Tests**      | 856     |
| **Archivos**   | 84      |
| **Duración**   | ~46s    |

### Evidencia de Cobertura

![Coverage Summary](./images/coverage-summary_2.png)

---

## Pirámide de Tests

```
          ╱  E2E  ╲           ← Pendiente
         ╱─────────╲
        ╱ Component  ╲        ← 300+ tests
       ╱──────────────╲
      ╱  Integration    ╲     ← 30+ tests
     ╱───────────────────╲
    ╱     Unit Tests      ╲   ← 520+ tests
   ╱───────────────────────╲
```

| Nivel              | Tests  | Archivos | Estado     |
|--------------------|--------|----------|------------|
| **Unit Tests**     | ~520   | 53       | ✅ Sólido  |
| **Component Tests**| ~300   | 28       | ✅ Sólido  |
| **Integration**    | ~30    | 3        | ✅ Cubierto|
| **E2E**            | 0      | 0        | ❌ Pendiente|

---

## Cobertura por Capa Arquitectónica

### 1. Domain Layer — Entidades y Errores

| Archivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| `Reservation.ts` | 100% | 83.33% | 100% | 100% |
| `User.ts` | 100% | 100% | 100% | 100% |
| `InventoryItem.ts` | 100% | 100% | 100% | 100% |
| `Location.ts` | 100% | 100% | 100% | 100% |
| `Delivery.ts` | 100% | 100% | 100% | 100% |
| `AuthenticationError.ts` | 100% | 100% | 100% | 100% |

**Estado:** ✅ Cobertura completa en lógica de dominio. `Reservation.ts` tiene branches para nuevos métodos (`isInProgress`, `isConfirmed`, `isCompleted`) con cobertura parcial en la rama `||` del `status`.

### 2. Application Layer — Casos de Uso

| Archivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| `LoginUseCase.ts` | 100% | 100% | 100% | 100% |
| `RegisterUseCase.ts` | 100% | 100% | 100% | 100% |
| `LogoutUseCase.ts` | 100% | 100% | 100% | 100% |
| `GetCurrentUserUseCase.ts` | 100% | 100% | 100% | 100% |
| `CreateReservationUseCase.ts` | 100% | 100% | 100% | 100% |
| `CancelReservationUseCase.ts` | 100% | 100% | 100% | 100% |
| `GetUserReservationsUseCase.ts` | 100% | 100% | 100% | 100% |
| `GetInventoryUseCase.ts` | 100% | 100% | 100% | 100% |
| `GetLocationsUseCase.ts` | 100% | 100% | 100% | 100% |
| `GetSpaceAvailabilityUseCase.ts` | 100% | 100% | 100% | 100% |
| `AssignInventoryUseCase.ts` | 100% | 100% | 100% | 100% |
| `RemoveInventoryUseCase.ts` | 100% | 100% | 100% | 100% |
| `SubmitDeliveryUseCase.ts` | 100% | 100% | 100% | 100% |
| `DeliverReservationUseCase.ts` | 100% | 100% | 100% | 100% |
| `ReturnReservationUseCase.ts` | 100% | 100% | 100% | 100% |

**Estado:** ✅ 100% en todos los casos de uso (15 use cases).

### 3. Infrastructure Layer — Adaptadores y Servicios

| Archivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| `AxiosHttpClient.ts` | 96.42% | 100% | 90% | 96.42% |
| `HttpClientFactory.ts` | 100% | 82.6% | 100% | 100% |
| `LocalStorageService.ts` | 100% | 100% | 100% | 100% |
| `StompWebSocketService.ts` | 85.5% | 83.33% | 83.33% | 88.33% |

#### Repositories

| Archivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| `HttpAuthRepository.ts` | 91.66% | 75.86% | 100% | 98.61% |
| `HttpDeliveryRepository.ts` | 100% | 90% | 100% | 100% |
| `HttpInventoryRepository.ts` | 90.19% | 62.5% | 100% | 95.55% |
| `HttpLocationRepository.ts` | 86.66% | 64.28% | 100% | 92.45% |
| `HttpReservationRepository.ts` | 64.1% | 49.38% | 72.72% | 70.58% |

#### Mappers

| Archivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| `DeliveryMapper.ts` | 100% | 71.42% | 100% | 100% |
| `InventoryMapper.ts` | 100% | 96.15% | 100% | 100% |
| `LocationMapper.ts` | 100% | 96.42% | 100% | 100% |
| `ReservationMapper.ts` | 100% | 92.72% | 100% | 100% |
| `UserMapper.ts` | 100% | 100% | 100% | 100% |

**Estado:** ⚠️ WebSocket tiene gaps menores en callbacks de error/reconexión. `HttpReservationRepository` descendió por nuevos métodos `deliver()`/`returnReservation()` que requieren integración con backend para testing completo.

### 4. Core Adapters — Hooks y Providers

| Archivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| `useLogin.ts` | 100% | 100% | 100% | 100% |
| `useLogout.ts` | 100% | 100% | 100% | 100% |
| `useSignup.ts` | 100% | 87.5% | 100% | 100% |
| `useDashboard.ts` | 100% | 86.36% | 100% | 100% |
| `useReservation.ts` | 89.1% | 70.96% | 84.61% | 92.3% |
| `useUserReservations.ts` | 100% | 86.2% | 100% | 100% |
| `useDelivery.ts` | 100% | 50% | 100% | 100% |
| `useBookingEvents.ts` | 100% | 85.71% | 100% | 100% |
| `useReservationAlert.ts` | 100% | 100% | 100% | 100% |
| `useReminderAlerts.ts` | 95.34% | 83.33% | 100% | 97.36% |
| `DependencyProvider.tsx` | 91.3% | 100% | 85.71% | 91.3% |
| `ThemeContext.tsx` | 100% | 100% | 100% | 100% |
| `container.ts` | 98.07% | 75% | 100% | 98.07% |

**Estado:** ✅ `useReminderAlerts` (nuevo) cubre suscripción WebSocket a 3 topics de recordatorio. `useUserReservations` mejoró de 72.72% a 86.2% en branches con tests de deliver/return.

### 5. UI Layer — Componentes y Páginas

| Archivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| `LoginForm.jsx` | 100% | 100% | 100% | 100% |
| `SignupForm.jsx` | 100% | 100% | 100% | 100% |
| `Header.jsx` | 91.42% | 78.94% | 92.3% | 91.42% |
| `Pagination.jsx` | 100% | 100% | 100% | 100% |
| `ProtectedRoute.jsx` | 100% | 100% | 100% | 100% |
| `ItemCard.jsx` | 85.71% | 90% | 66.66% | 85.71% |
| `SearchBar.jsx` | 100% | 100% | 100% | 100% |
| `Calendar.jsx` | 100% | 80% | 100% | 100% |
| `DurationSelector.jsx` | 96.66% | 97.61% | 100% | 100% |
| `EquipmentSelector.jsx` | 100% | 91.17% | 100% | 100% |
| `InventoryAssignmentModal.jsx` | 94.73% | 75% | 90.9% | 94.44% |
| `ReservationModal.jsx` | 100% | 96% | 100% | 100% |
| `ReservationCard.jsx` | 95.34% | 93.61% | 100% | 93.33% |
| `ReservationFilterBar.jsx` | 100% | 83.33% | 100% | 100% |
| `ReservationList.jsx` | 100% | 100% | 100% | 100% |
| `HandoverModal.jsx` | 100% | 94.44% | 100% | 100% |
| `ReminderAlertBanner.jsx` | 100% | 100% | 100% | 100% |
| `MainLayout.jsx` | 100% | 100% | 100% | 100% |
| `AppRouter.jsx` | 100% | 100% | 100% | 100% |

#### Páginas

| Archivo | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| `LoginPage.jsx` | 100% | 100% | 100% | 100% |
| `SignupPage.jsx` | 100% | 100% | 100% | 100% |
| `DashboardPage.jsx` | 100% | 100% | 100% | 100% |
| `MyReservationsPage.jsx` | 96.66% | 91.66% | 100% | 100% |

**Estado:** ✅ Todas las páginas con cobertura sólida. `MyReservationsPage` integra flujo de handover modal y banner de alertas.

---

## Archivos Excluidos del Coverage (Intencionalmente)

| Archivo | Razón |
|---------|-------|
| `src/main.jsx` | Bootstrap de la aplicación (ReactDOM.render) |
| `src/App.jsx` | Wrapper trivial que renderiza providers + router |
| `src/test/**` | Setup de tests y helpers |
| `src/**/*.d.ts` | Declaraciones de tipos |
| **Port Interfaces** (`IAuthRepository.ts`, `IHttpClient.ts`, etc.) | Interfaces puras TypeScript — sin código ejecutable |
| `useDependencies.ts` | Hook trivial (`useContext(DependencyContext)`) — siempre mockeado en tests de consumidores |

---

## Configuración de Testing

### Vitest (`vite.config.js`)

```js
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.js',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'text-summary', 'html', 'json-summary', 'lcov'],
    reportsDirectory: './reports/coverage',
    include: ['src/**/*.{ts,tsx,js,jsx}'],
    exclude: ['src/test/**', 'src/**/*.test.*', 'src/**/*.d.ts', 'src/main.jsx'],
    thresholds: {
      statements: 40,
      branches: 40,
      functions: 40,
      lines: 40,
    },
  },
}
```

### Reporters

| Reporter | Salida | Uso |
|----------|--------|-----|
| `default` | Terminal | Desarrollo local |
| `junit` | `./reports/junit-report.xml` | CI/CD |
| `json` | `./reports/test-results.json` | Análisis automatizado |
| `html` | `./reports/html/` | Revisión visual |
| `lcov` | `./reports/coverage/lcov.info` | SonarQube / Codecov |

---

## Patrones de Testing

### 1. Mocks con Referencia Estable (Hooks)

Los hooks que retornan objetos/funciones requieren una referencia estable para evitar que `vi.clearAllMocks()` rompa las implementaciones:

```ts
// ❌ MAL — se pierde con clearAllMocks
vi.fn().mockImplementation(() => ({ data: [] }))

// ✅ BIEN — clase auto-contenida
const stableDeps = {
  reservationRepository: { create: vi.fn(), cancel: vi.fn() },
  inventoryRepository: { getAll: vi.fn() },
};
vi.mock('../useDependencies', () => ({
  useDependencies: () => stableDeps,
}));
```

### 2. Mocks Basados en Clase (Infraestructura)

Para clases con `new`, usar implementaciones basadas en clase en lugar de `vi.fn()`:

```ts
// ✅ Clase mock auto-contenida
vi.mock('axios', () => {
  const instance = { get: vi.fn(), post: vi.fn(), interceptors: { ... } };
  return { default: { create: vi.fn(() => instance) } };
});
```

### 3. Aislamiento con `vi.stubGlobal`

Para `window.alert`, `window.confirm` y otras APIs del navegador:

```ts
beforeEach(() => {
  vi.stubGlobal('alert', vi.fn());
  vi.stubGlobal('confirm', vi.fn(() => true));
});
```

### 4. Estructura de Tests por Capa

```
src/
├── application/use-cases/**/*.test.ts    → Unit tests puros
├── core/domain/entities/**/*.test.ts     → Unit tests de entidades
├── core/domain/errors/**/*.test.ts       → Unit tests de errores
├── core/adapters/hooks/**/*.test.ts      → Unit tests con renderHook
├── core/adapters/providers/**/*.test.tsx  → Component tests de providers
├── core/adapters/di/container.test.ts    → Unit tests del DI container
├── infrastructure/
│   ├── http/clients/**/*.test.ts         → Unit tests de HTTP
│   ├── mappers/**/*.test.ts              → Unit tests de mappers
│   ├── repositories/**/*.test.ts         → Unit tests de repositorios
│   ├── storage/**/*.test.ts              → Unit tests de storage
│   └── websocket/**/*.test.ts            → Unit tests de WebSocket
├── ui/
│   ├── components/**/*.test.jsx          → Component tests
│   ├── layouts/**/*.test.jsx             → Component tests
│   └── pages/**/*.test.jsx               → Component/page tests
├── routes/AppRouter.*.test.jsx           → Component + routing tests
└── test/integration/**/*.test.ts         → Integration tests (multi-capa)
```

---

## Tests de Integración

3 flujos end-to-end sin mocks de capa intermedia:

| Flujo | Archivo | Tests | Capas cubiertas |
|-------|---------|-------|-----------------|
| Auth | `auth-flow.integration.test.ts` | ~10 | UseCase → Mapper → Entity |
| Dashboard | `dashboard-flow.integration.test.ts` | ~10 | UseCase → Mapper → Entity |
| Reservation | `reservation-flow.integration.test.ts` | ~10 | UseCase → Mapper → Entity |

---

## Gaps Conocidos y Plan de Mejora

### Branches < 85%

| Archivo | Branch | Causa |
|---------|--------|-------|
| `HttpReservationRepository.ts` | 49.38% | Nuevos métodos deliver/return sin test de integración HTTP |
| `HttpInventoryRepository.ts` | 62.5% | Variantes de respuesta API (con/sin wrapper) |
| `HttpLocationRepository.ts` | 64.28% | Idem |
| `useReservation.ts` | 70.96% | Catch blocks anidados en flujos async |
| `DeliveryMapper.ts` | 71.42% | Variantes de payload API |
| `container.ts` | 75% | Branch de registro dinámico |
| `InventoryAssignmentModal.jsx` | 75% | Variantes de UI condicional |
| `HttpAuthRepository.ts` | 75.86% | Variantes de respuesta API |
| `Header.jsx` | 78.94% | Fallback de logout y responsividad |
| `Calendar.jsx` | 80% | Edge cases de fechas |
| `HttpClientFactory.ts` | 82.6% | Branches de configuración |
| `Reservation.ts` | 83.33% | Branches `\|\|` en status null guard |
| `useReminderAlerts.ts` | 83.33% | Branch de deduplicación |
| `ReservationFilterBar.jsx` | 83.33% | Variantes de tab activo |

### Mejoras Recomendadas

| Prioridad | Acción | Impacto |
|-----------|--------|---------|
| 🔴 Alta | Tests E2E con Playwright/Cypress | Validar flujos completos (deliver→return, alertas WS) |
| 🔴 Alta | Mejorar tests de `HttpReservationRepository` | +5% branches (deliver/return HTTP) |
| 🟡 Media | Aumentar coverage de branches en repositories | +3-5% branches global |
| 🟡 Media | Subir thresholds de `vite.config.js` a 85%+ branches | Prevenir regresiones |
| 🟢 Baja | Cubrir `App.jsx` (wrapper trivial) | +0.5% statements |

---

## Comandos Útiles

```bash
# Ejecutar todos los tests
npx vitest run

# Con cobertura
npx vitest run --coverage

# Watch mode
npx vitest

# Tests de un archivo específico
npx vitest run src/core/domain/entities/Reservation.core.test.ts

# Tests por patrón
npx vitest run --grep "useLogin"

# Reporte HTML de cobertura
npx vitest run --coverage && open reports/coverage/index.html
```

---

## Historial de Evolución

| Fecha | Tests | Archivos | Stmts | Lines | Hito |
|-------|-------|----------|-------|-------|------|
| Sprint 1 | 150 | 20 | ~43% | ~45% | Entidades + Use Cases base |
| Sprint 2 | 605 | 69 | 75.22% | 78% | Hooks + Components + Pages |
| Sprint 3 | 747 | 79 | 94.97% | 96.99% | Infraestructura + DI + Coverage ≥90% |
| Sprint 4 | 856 | 84 | 93.46% | 95.32% | Deliver/Return + WebSocket Alerts + Handover flow |
