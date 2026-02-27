# Estrategia de Testing — Frontend Reservas Sofka

## 1. Visión General

Este documento define la estrategia de QA del proyecto Frontend, diferenciando claramente entre pruebas de **verificación** (¿estamos construyendo el producto correctamente?) y pruebas de **validación** (¿estamos construyendo el producto correcto?).

| Concepto      | Pregunta clave                                    | Enfoque                                     |
|---------------|---------------------------------------------------|----------------------------------------------|
| Verificación  | ¿El código cumple con la especificación técnica?  | Lógica interna, contratos, estructura        |
| Validación    | ¿El producto cumple las necesidades del usuario?  | Comportamiento visible, flujos, experiencia  |

---

## 2. Stack de Testing

| Herramienta               | Rol                                    |
|----------------------------|----------------------------------------|
| **Vitest**                 | Test runner y framework de assertions  |
| **@testing-library/react** | Renderizado de componentes en jsdom    |
| **@testing-library/jest-dom** | Matchers extendidos para DOM        |
| **vi (vitest)**            | Mocks, spies, fake timers              |
| **jsdom**                  | Entorno de navegador simulado          |
| **MemoryRouter**           | Simulación de enrutamiento en tests    |

**Configuración:** [vite.config.js](vite.config.js) — `environment: 'jsdom'`, `globals: true`, setup en [src/test/setup.js](src/test/setup.js).

---

## 3. Pirámide de Tests

```
          ╱ ╲
         ╱ E2E ╲          ← (Pendiente) Cypress/Playwright
        ╱───────╲
       ╱ Integra-╲        ← Hooks + Routing (25 tests)
      ╱  ción     ╲
     ╱─────────────╲
    ╱   Unitarios    ╲    ← Domain + Use Cases + Mappers + Components (76 tests)
   ╱───────────────────╲
```

**Distribución actual: 101 tests en 16 archivos**

| Nivel               | Tests | % del total |
|---------------------|-------|-------------|
| Unitario (dominio)  | 19    | 18.8%       |
| Unitario (use case) | 5     | 5.0%        |
| Unitario (mapper)   | 6     | 5.9%        |
| Unitario (componentes UI) | 46 | 45.5%   |
| Integración (hooks) | 12    | 11.9%       |
| Integración (routing) | 8   | 7.9%        |
| Integración (auth guard) | 3 | 3.0%      |
| Integración (page composition) | 2 | 2.0% |
| **Total**           | **101** | **100%**  |

---

## 4. Pruebas de VERIFICACIÓN

> _"¿Estamos construyendo el producto correctamente?"_
>
> Verifican que el código cumple las especificaciones técnicas, los contratos entre capas y la lógica de negocio pura.

### 4.1 Entidades de Dominio (Capa Domain)

Verifican la lógica de negocio pura sin dependencias externas.

| Archivo de Test | Entidad | Tests | Qué se verifica |
|-----------------|---------|-------|-----------------|
| [Reservation.test.ts](src/core/domain/entities/Reservation.test.ts) | `Reservation` | 8 | `getRemainingMinutes()` retorna correctamente minutos restantes; `isAboutToExpire(threshold)` detecta umbrales; manejo de estados (cancelled, past, active); umbral por defecto de 10 min |
| [Delivery.test.ts](src/core/domain/entities/Delivery.test.ts) | `Delivery` | 11 | Construcción con todas las propiedades; fecha por defecto; `hasNotes()` con/sin contenido; `isValid()` con campos vacíos (locationId, userId, managerId); `toJSON()` serialización; `fromJSON()` deserialización |

**Técnica:** Tests unitarios puros, sin mocks. Se usa `vi.useFakeTimers()` solo para controlar el reloj del sistema en Reservation.

**Criterio de verificación:**
- Cada método de la entidad tiene al menos un test positivo y uno negativo
- Los getters derivados retornan valores calculados correctos
- Los validadores de estado respetan la máquina de estados (active → cancelled → past)

### 4.2 Casos de Uso (Capa Application)

Verifican la orquestación de la lógica: validación de precondiciones y delegación al repositorio.

| Archivo de Test | Use Case | Tests | Qué se verifica |
|-----------------|----------|-------|-----------------|
| [SubmitDeliveryUseCase.test.ts](src/application/use-cases/delivery/SubmitDeliveryUseCase.test.ts) | `SubmitDeliveryUseCase` | 5 | Envío exitoso invoca `repository.submit()`; validación de campos obligatorios (locationId, userId, managerId) lanza errores específicos; propagación de errores del repositorio |

**Técnica:** Mock del port `IDeliveryRepository` inyectado vía constructor. Se verifica el contrato entre use case y repositorio.

**Criterio de verificación:**
- Precondiciones: campos vacíos → excepción con mensaje descriptivo
- Postcondición: datos válidos → se delega al repositorio sin transformación
- Errores de infraestructura se propagan sin swallowing

### 4.3 Mappers (Capa Infrastructure)

Verifican la transformación fiel entre DTOs del API y entidades de dominio.

| Archivo de Test | Mapper | Tests | Qué se verifica |
|-----------------|--------|-------|-----------------|
| [DeliveryMapper.test.ts](src/infrastructure/mappers/DeliveryMapper.test.ts) | `DeliveryMapper` | 6 | `toDomain()` mapea camelCase y snake_case del backend; null safety retorna null; `toApi()` genera payload correcto; `toDomainList()` mapea arrays y tolera inputs no-array |

**Técnica:** Tests unitarios puros. Sin mocks. Se verifican ambas direcciones del mapeo (API → Domain, Domain → API).

**Criterio de verificación:**
- Bidireccionalidad: `toApi(toDomain(dto))` produce un payload equivalente
- Compatibilidad: soporta tanto `camelCase` como `snake_case` del backend
- Resiliencia: inputs null/undefined no causan excepciones

### 4.4 Contratos de Puerto (Verificación Implícita)

Los ports/interfaces en TypeScript se verifican en tiempo de compilación:
- [IDeliveryRepository.ts](src/core/ports/repositories/IDeliveryRepository.ts) — contrato `submit(): Promise<Delivery>`
- [IReservationRepository.ts](src/core/ports/repositories/IReservationRepository.ts) — contrato `create()`, `getByUserId()`, `cancel()`, `getAvailability()`

Se verifica vía `tsc --noEmit` (script `type-check`) que las implementaciones cumplen los contratos.

---

## 5. Pruebas de VALIDACIÓN

> _"¿Estamos construyendo el producto correcto?"_
>
> Validan que el usuario ve y experimenta lo que se espera: textos, flujos de navegación, estados de la UI, retroalimentación visual.

### 5.1 Componentes UI — Formularios

Validan que el usuario interactúa correctamente con formularios.

| Archivo de Test | Componente | Tests | Qué se valida |
|-----------------|------------|-------|---------------|
| [LoginForm.test.jsx](src/ui/components/auth/LoginForm.test.jsx) | `LoginForm` | 8 | Se renderizan inputs de email/password; botón de submit presente; link de registro visible; `onChange` notifica al hook; submit dispara handler; estado loading deshabilita botón y cambia texto; error se muestra al usuario |
| [SignupForm.test.jsx](src/ui/components/signup/SignupForm.test.jsx) | `SignupForm` | 8 | Se renderizan todos los campos (nombre, email, password, confirmar, términos); checkbox de términos visible; submit invoca handler; loading deshabilita botón; mensajes de error visibles |

**Técnica:** Mock del hook de estado (`useLogin`, `useSignup`) para aislar el componente. Se simula interacción real con `fireEvent.change/submit`.

**Criterio de validación:**
- Los placeholders guían al usuario con ejemplos claros
- Los estados de loading impiden doble-submit
- Los errores se muestran en texto legible (no códigos técnicos)

### 5.2 Componentes UI — Interacción

Validan el comportamiento de componentes interactivos compartidos.

| Archivo de Test | Componente | Tests | Qué se valida |
|-----------------|------------|-------|---------------|
| [Pagination.test.jsx](src/ui/components/common/Pagination.test.jsx) | `Pagination` | 10 | No renderiza si solo hay 1 página; renderiza números de página; botones Anterior/Siguiente habilitados/deshabilitados según posición; click invoca `onPageChange` con página correcta; clase `active` en página actual |
| [SearchBar.test.jsx](src/ui/components/dashboard/SearchBar.test.jsx) | `SearchBar` | 4 | Placeholder de búsqueda visible; muestra query actual; notifica cambios; icono de búsqueda presente |
| [ReservationFilterBar.test.jsx](src/ui/components/reservations/ReservationFilterBar.test.jsx) | `ReservationFilterBar` | 6 | Tabs Próximas/Pasadas/Canceladas visibles; tab activo tiene clase visual; click cambia tab; input de búsqueda funcional |
| [ReservationList.test.jsx](src/ui/components/reservations/ReservationList.test.jsx) | `ReservationList` | 4 | Muestra estado vacío con mensaje amigable; renderiza tarjetas por cada reserva; nombres de ubicación visibles |

**Criterio de validación:**
- El usuario recibe feedback visual inmediato (estados vacíos, clases activas)
- Los textos están en español y son comprensibles para el usuario final
- Los controles de navegación respetan límites (no avanzar más allá de la última página)

### 5.3 Páginas

Validan la composición correcta de páginas completas.

| Archivo de Test | Página | Tests | Qué se valida |
|-----------------|--------|-------|---------------|
| [LoginPage.test.jsx](src/ui/pages/auth/LoginPage.test.jsx) | `LoginPage` | 4 | Texto de bienvenida visible; formulario de login renderizado; branding (logo + nombre); subtítulo descriptivo |
| [SignupPage.test.jsx](src/ui/pages/signup/SignupPage.test.jsx) | `SignupPage` | 4 | Texto de onboarding visible; formulario de registro renderizado; branding; subtítulo para nuevos usuarios |

**Técnica:** Mock de componentes hijos para aislar la responsabilidad de la página (composición, estructura visual).

### 5.4 Routing y Guards de Acceso

Validan los flujos de navegación y protección de rutas.

| Archivo de Test | Funcionalidad | Tests | Qué se valida |
|-----------------|---------------|-------|---------------|
| [AppRouter.test.jsx](src/routes/AppRouter.test.jsx) | Enrutamiento | 8 | `/` y `/login` muestran login; `/signup` muestra registro; rutas protegidas (`/dashboard`, `/my-reservations`) redirigen a login sin token; con token muestran la página correcta dentro del layout |
| [ProtectedRoute.test.jsx](src/ui/components/common/ProtectedRoute.test.jsx) | Auth Guard | 3 | Sin token → redirige a login; con token → renderiza children; verifica key `"token"` en localStorage |

**Criterio de validación:**
- Un usuario no autenticado **nunca** ve contenido protegido
- Las redirecciones son transparentes (sin pantalla en blanco)
- Las rutas públicas son accesibles sin autenticación

### 5.5 Hooks — Comportamiento Reactivo

Validan que los hooks exponen el estado y comportamiento correcto a la UI.

| Archivo de Test | Hook | Tests | Qué se valida |
|-----------------|------|-------|---------------|
| [useReservationAlert.test.ts](src/core/adapters/hooks/useReservationAlert.test.ts) | `useReservationAlert` | 7 | Sin reservas → sin alertas; detecta reserva próxima a expirar; no alerta cuando hay tiempo suficiente; no alerta reservas canceladas; dismiss funciona; umbral personalizable; actualización periódica |
| [useDelivery.test.ts](src/core/adapters/hooks/useDelivery.test.ts) | `useDelivery` | 5 | Estado inicial vacío; envío exitoso actualiza success + delivery; errores se capturan en `error`; loading activo durante envío; reset limpia todo el estado |

**Criterio de validación:**
- El usuario recibe feedback en tiempo real (loading, success, error)
- Las alertas no molestan al usuario después de ser descartadas
- Las alertas se actualizan automáticamente sin intervención del usuario

---

## 6. Matriz Verificación vs Validación

| Capa Arquitectónica | Verificación | Validación | Justificación |
|---------------------|:------------:|:----------:|---------------|
| **Domain Entities** | ✅ 19 tests  | —          | Lógica de negocio pura, no tiene UI |
| **Use Cases**       | ✅ 5 tests   | —          | Orquestación y precondiciones, no visible al usuario |
| **Mappers**         | ✅ 6 tests   | —          | Transformación de datos, infraestructura interna |
| **Ports (TypeScript)** | ✅ compile-time | —    | Contratos verificados por el compilador |
| **Components UI**   | —            | ✅ 32 tests | El usuario ve e interactúa con estos elementos |
| **Pages**           | —            | ✅ 8 tests  | Composición visual que el usuario experimenta |
| **Routing**         | —            | ✅ 11 tests | Flujos de navegación del usuario |
| **Hooks (state)**   | —            | ✅ 12 tests | Comportamiento reactivo que afecta la UX |
| **Hooks (alert)**   | ✅ parcial   | ✅ parcial  | Verifican lógica temporal Y validan experiencia de alerta |

---

## 7. Metodología TDD Aplicada

Las features de **Alerta de Expiración** y **Entrega (Delivery)** se desarrollaron con TDD estricto:

```
┌─────────────────────────────────────────────────────┐
│  1. RED    → Se escribieron 38 tests que fallaban   │
│             (módulos no existían aún)               │
│                                                     │
│  2. GREEN  → Se implementó el código mínimo para    │
│             que los 38 tests pasaran                │
│                                                     │
│  3. REFACTOR → Se optimizó el hook de alertas       │
│             (cambio de useRef a useMemo reactivo)    │
└─────────────────────────────────────────────────────┘
```

### Archivos creados en cada fase:

| Fase  | Archivos de Test (RED)                            | Archivos de Implementación (GREEN) |
|-------|---------------------------------------------------|------------------------------------|
| Domain | `Reservation.test.ts` (8), `Delivery.test.ts` (11) | `Reservation.ts` (métodos nuevos), `Delivery.ts` |
| Mapper | `DeliveryMapper.test.ts` (6)                     | `DeliveryMapper.ts` |
| Use Case | `SubmitDeliveryUseCase.test.ts` (5)            | `SubmitDeliveryUseCase.ts` |
| Port  | —                                                 | `IDeliveryRepository.ts` |
| Infra | —                                                 | `HttpDeliveryRepository.ts` |
| Hooks | `useReservationAlert.test.ts` (7), `useDelivery.test.ts` (5) | `useReservationAlert.ts`, `useDelivery.ts` |
| DI    | —                                                 | `container.ts` (actualizado), `DependencyProvider.tsx` (actualizado) |

---

## 8. Patrones de Testing Utilizados

| Patrón | Dónde se aplica | Ejemplo |
|--------|-----------------|---------|
| **Mock de dependencias** | Hooks → Use Cases, Componentes → Hooks | `vi.mock('../hooks/useLogin')` |
| **Fake Timers** | Tests de expiración temporal | `vi.useFakeTimers(); vi.setSystemTime(...)` |
| **Arrange-Act-Assert** | Todos los tests | Setup datos → ejecutar → verificar |
| **Component isolation** | Pages mock children components | `vi.mock('./LoginForm', ...)` |
| **Contract testing** | Use cases con repositorios mock | `mockRepository.submit = vi.fn()` |
| **Boundary testing** | Paginación, validación de campos | `totalPages=0`, `locationId=''` |
| **State machine testing** | Reservation status | active → cancelled → past |

---

## 9. Cobertura y Gaps Identificados

### Cobertura actual por capa:

| Capa | Archivos con test | Archivos sin test | Cobertura estimada |
|------|-------------------|--------------------|--------------------|
| Domain Entities | 2/4 | `User.ts`, `Location.ts`, `InventoryItem.ts` | 50% |
| Use Cases | 1/9 | Login, Logout, Register, GetLocations, etc. | 11% |
| Mappers | 1/4 | `UserMapper`, `LocationMapper`, `ReservationMapper` | 25% |
| Components | 6/~15 | Dashboard cards, modals, reservation form | 40% |
| Pages | 2/~4 | Dashboard, MyReservations | 50% |
| Hooks | 2/8 | `useDashboard`, `useReservation`, `useLogin`, etc. | 25% |
| Routing | 1/1 | — | 100% |

### Gaps prioritarios:

1. **User/Location entities** — Dominio core sin coverage
2. **LoginUseCase / RegisterUseCase** — Flujos críticos de autenticación
3. **ReservationMapper** — Mapper complejo con muchos aliases (camelCase/snake_case)
4. **useReservation hook** — Hook más complejo del sistema (211 líneas)
5. **E2E tests** — No existen; flujos completos (login → reservar → entregar) sin verificar

---

## 10. Próximos Pasos

| Prioridad | Acción | Tipo | Impacto |
|-----------|--------|------|---------|
| 🔴 Alta | Tests para `LoginUseCase` y `RegisterUseCase` | Verificación | Flujos de autenticación críticos |
| 🔴 Alta | Tests para `useReservation` hook | Validación | Hook más complejo con lógica de calendario |
| 🟡 Media | Tests para `ReservationMapper` | Verificación | Mapper con muchos aliases propenso a regresiones |
| 🟡 Media | Tests para `User` y `Location` entities | Verificación | Dominio base sin coverage |
| 🟢 Baja | Setup de E2E con Playwright | Validación | Flujos completos de usuario |
| 🟢 Baja | Coverage threshold en CI | Ambos | Prevenir regresión de cobertura |

---

## 11. Convenciones

- **Nombrado:** `[Componente].test.tsx` o `[Entidad].test.ts` junto al archivo fuente
- **Idioma:** Descripciones de tests en español (alineado con el dominio de negocio)
- **Estructura:** `describe` por componente/clase → `it` por comportamiento
- **Mocks:** Siempre aislar la capa bajo test mockeando la capa inferior
- **No testear implementación:** Verificar comportamiento, no detalles internos
