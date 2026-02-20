# 🔥 PLAN DE ATAQUE ARQUITECTÓNICO

Este plan está diseñado para estabilizar el sistema de Reservas, corregir fugas en las capas y establecer una base de pruebas que justifique la complejidad de la Arquitectura Hexagonal.

---

## FASE 0 – Estabilización Inmediata (Hotfix)
**Objetivo:** Detener los fallos en cascada en el módulo de Reservas.

- **Qué se corrige:** `TypeError` en `useUserReservations` al intentar acceder a `authRepository`.
- **Cómo se corrige:**
    - Actualizar `DependencyProvider.jsx` para inyectar `authRepository` en el hook `useDependencies`.
    - Verificar que el `DIContainer` tenga el nombre correcto de la dependencia.
- **Riesgo:** Bajo. Es una corrección de cableado.
- **Criterio de validación:** El módulo de Reservas carga sin cerrarse inesperadamente y permite visualizar la lista (aunque sea con lógica filtrada).

## FASE 1 – Corrección de Contratos Arquitectónicos
**Objetivo:** Restaurar la integridad de las capas (Hooks no hablan con Repositorios).

- **Qué se corrige:** Violación de DIP en Hooks y lógica de negocio en Infraestructura.
- **Refactors concretos:**
    - **[NEW]** `GetCurrentUserUseCase.js`: Encapsulará la lógica de `authRepository.getStoredUser()`.
    - **[MODIFY]** `useUserReservations.js`: Sustituir la llamada directa al repo por el nuevo Use Case.
    - **[MODIFY]** `ReservationMapper.js`: Mover toda la lógica de `split` y formateo de fechas de `HttpReservationRepository` al método `toApi`.
- **Archivos impactados:** `useUserReservations.js`, `ReservationMapper.js`, `HttpReservationRepository.js`, `container.js`, `DependencyProvider.jsx`.
- **Efecto secundario:** Mayor número de archivos, pero cada uno con responsabilidad única (SRP).

## FASE 2 – Introducción de Testing Estratégico
**Objetivo:** Activar el ROI de la Arquitectura Hexagonal.

- **Qué se testea:** 
    1. **Use Cases**: Lógica de orquestación.
    2. **Mappers**: Lógica de transformación de datos (crítica por el tema de fechas).
    3. **Domain Entities**: Lógica autocontenida.
- **Framework:** `Vitest` (por velocidad y compatibilidad nativa con Vite).
- **Estrategia de Mocking:** Inyectar implementaciones manuales de los `IPorts` (ej. `MockReservationRepository`) en los tests de casos de uso.
- **Cobertura mínima:** 80% en `Application` y `Domain`. **0% en UI por ahora** (priorizar lógica sobre renderizado).

## FASE 3 – Simplificación Inteligente
**Objetivo:** Reducir la fricción para el equipo.

- **Postura Técnica Firme:** El `DIContainer` manual es un "Code Smell" de mantenimiento. 
- **Decisión:** 
    - **NO** adoptaremos una librería pesada como InversifyJS aún.
    - **SÍ** simplificaremos el `DependencyProvider`. En lugar de desestructurar manualmente 50 use cases en un objeto gigante, el hook `useDependencies` debería permitir solicitar una dependencia por nombre con tipado (o usar hooks específicos por módulo: `useAuthDependencies`, `useReservationDependencies`).
- **Reducción de Superficie:** Eliminar el export directo de Repositorios en el Provider. Si un componente necesita datos, DEBE pasar por un Use Case. Sin excepciones.

## FASE 4 – Eliminación del Estado Híbrido
**Objetivo:** Limpiar el "cementerio" de código.

1. **Rule of 3:** Si un feature está migrado al 100% a Hexagonal (ej. Auth), borrar inmediatamente su homólogo en `features/`.
2. **Linting de Capas:** Configurar `eslint-plugin-boundaries` para prohibir que `src/ui` importe de `src/infrastructure` legalmente.
3. **Mappers Mandatory:** Prohibir el uso de `response.data` directamente en la UI. Todo debe pasar por un Entity a través de un Mapper.

---

## 🧠 ANÁLISIS DE RIESGO
- **Inacción:** El sistema colapsará por "Deuda Técnica Invisibe". Los bugs de DI se volverán imposibles de rastrear y el equipo odiará la arquitectura por "lenta" y "frágil".
- **Ejecución Parcial:** Si se estabiliza (Fase 0) pero no se testea (Fase 2), tenemos lo peor de ambos mundos: toda la complejidad de Hexagonal sin ninguna de sus garantías de seguridad.
- **Riesgo Residual:** El costo cognitivo inicial para nuevos desarrolladores sigue siendo alto comparado con un modelo basado en features.

## 🏁 DEFINICIÓN DE “ARQUITECTURA SANA”
- **Onboarding:** Un desarrollador nuevo puede entender el flujo `UI -> UseCase -> Entity` en menos de 2 horas.
- **Tests:** Un cambio en la lógica de cancelación de reservas se valida en < 1 segundo con un unit test de Use Case.
- **Contratos:** Cero imports de `infrastructure` dentro de la carpeta `ui/components`.

---

## ⚔️ DECISIONES DIFÍCILES
> [!IMPORTANT]
> **La arquitectura está sobredimensionada para el estado actual de madurez del equipo (sin tests).**
> Si el equipo no se compromete a escribir tests para los Casos de Uso en las próximas 2 semanas, **recomiendo abortar Hexagonal y volver a un modelo de Features simplificado**. 
> Mantener Hexagonal sin testing es como construir un búnker y dejar la puerta abierta: pagas el costo de la construcción pesada sin obtener la seguridad.
