# Feedback - Evaluacion Frontend
**Equipo auditor:** Team 1
**Rol:** Desarrollador Frontend Senior
**Repositorio evaluado:** Sherman97/reservasSofka
**Fecha:** 2026-02-12

---

## Nota sobre el alcance

No se encontro en ningun lugar del repositorio (README, AI_WORKFLOW, issues, o cualquier otro documento) una definicion del alcance del MVP. Esto dificulta la evaluacion, ya que no es posible determinar si ciertas ausencias (como tests, integracion frontend-backend, o el locations-service incompleto) fueron decisiones conscientes del equipo o simplemente tareas pendientes. Un alcance definido y documentado habria permitido distinguir entre "no se hizo porque no estaba en scope" y "quedo pendiente".

---

## Rubrica de Evaluacion AI-First

### 1. Estrategia de IA (AI_WORKFLOW.md) — 2/5

Existen dos archivos `AI_WORKFLOW.md` (uno en Backend, otro en Frontend), ninguno en la raiz del proyecto.

**Backend/AI_WORKFLOW.md**: Describe la arquitectura de servicios, tablas, reglas de negocio y flujo Docker. Sin embargo, **no es un workflow de IA** — es documentacion tecnica. No menciona que herramienta de IA se uso, que prompts se iteraron, que se rechazo ni como fue el ciclo de trabajo humano-IA.

**Frontend/AI_WORKFLOW.md**: Mas cercano a lo esperado. Describe el proceso paso a paso: generacion de mockups con Google Stitch, prompts a la IA para implementarlos, correcciones cuando la IA no seguia la arquitectura. Sin embargo:
- Esta incompleto (termina en el punto 15 vacio)
- No menciona que herramienta/modelo de IA se uso para generar codigo
- No define roles, reglas ni metodologia formal
- Los errores de la IA se mencionan de pasada sin profundidad tecnica

### 2. Calidad del Codigo & HUMAN CHECK — 1/5

**Cero comentarios `// HUMAN CHECK`** en todo el codebase (frontend y backend). Este era un requisito explicito del taller.

Respecto a la calidad del codigo frontend:
- La estructura por features (auth, dashboard, reservations, signup) con separacion en components, containers, hooks, services y styles es una buena decision arquitectonica
- El sistema de temas (claro/oscuro) con CSS variables esta bien implementado
- Los hooks personalizados (useLogin, useSignup, useDashboard, useReservation) separan correctamente la logica del renderizado

Sin embargo:
- El interceptor de autenticacion en `api.js` esta **comentado** — el token JWT nunca se envia al backend:
  ```js
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  ```
- `useLogin.js` y `useSignup.js` tienen `// TODO: Implement actual login logic` — hacen `console.log` y navegan al dashboard sin validar nada contra el backend
- Todos los servicios del frontend (`dashboardService.js`, `reservationService.js`, `userReservationsService.js`) usan **datos mock hardcodeados** con `setTimeout` simulando latencia de API
- El archivo `api.js` con axios configurado existe pero **ningun servicio lo importa**. La infraestructura de conexion se creo pero no se integro
- No hay proteccion de rutas — cualquier usuario accede a `/dashboard` sin autenticarse

### 3. Transparencia ("Lo que la IA hizo mal") — 1/5

No existe una seccion dedicada de "Lo que la IA hizo mal" en ningun README.

El `Frontend/AI_WORKFLOW.md` menciona errores superficialmente:
- "La IA divagar en la estructuracion del mockup ya que crea otra estructura de carpetas" (punto 4.1)
- "La IA no realiza aplica un diseno responsive" (punto 4.3)
- "La IA falla en el diseno de la ui del calendario" (punto 11)

Pero en ningun caso se explica tecnicamente que hizo mal la IA, como se detecto o como se corrigio. No hay evidencia de alucinaciones identificadas ni rechazos documentados.

### 4. Arquitectura & Docker — 2/5

**Hallazgo critico: el `docker-compose up` no levanta limpio.**

El API Gateway crashea al iniciar con:
```
Error: Cannot find module 'mysql2/promise'
Require stack:
- /database/src/init.js
- /app/src/server.js
```

El `docker-compose.yml` monta `./services/database:/database` como volumen en el gateway, pero el directorio `database/` no tiene `node_modules` instalados. El fix requiere ejecutar `npm install` manualmente dentro del contenedor del gateway — algo que no esta documentado en ningun README.

Adicionalmente:
- No existe `.env.example` — las variables necesarias (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_ROOT_PASSWORD`) hay que deducirlas del `docker-compose.yml` y los valores por defecto
- `locations-service` esta declarado en la arquitectura pero incompleto: no tiene `src/`, no tiene rutas, y su `Dockerfile.dev` expone el puerto incorrecto (3005 en vez de 3004)
- No hay health checks para los servicios Node en el compose (solo MariaDB los tiene)

Lo que funciona bien:
- Auth, Bookings e Inventory levantan correctamente una vez que el gateway se arregla
- MariaDB con healthcheck y volumen persistente
- El schema SQL se inicializa automaticamente desde el gateway

### 5. Git Flow & Colaboracion — 2/5

- Mensajes de commit inconsistentes y repetidos: `"feature, creacion de configuracion del docker y AI_workflow"` aparece 4 veces
- Mezcla de espanol e ingles sin convencion clara
- No se evidencia uso de conventional commits ni mensajes semanticos
- Varios PRs parecen ser auto-merges sin revision de pares
- Multiples ramas de sync y fix sugieren problemas de coordinacion entre miembros

---

## Resumen de Puntajes

| Criterio | Puntaje |
|----------|---------|
| Estrategia de IA (AI_WORKFLOW.md) | 2/5 |
| Calidad del Codigo & HUMAN CHECK | 1/5 |
| Transparencia ("Lo que la IA hizo mal") | 1/5 |
| Arquitectura & Docker | 2/5 |
| Git Flow & Colaboracion | 2/5 |
| **Total** | **8/25** |

---

## Optimizacion AI-First (Bonus)

### Deteccion: Login sin conexion al backend

**Archivo:** `Frontend/src/features/auth/hooks/useLogin.js`

**Codigo actual (funciona pero no hace nada real):**
```js
const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        console.log('Login attempt:', { email, password });
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/dashboard');
    } catch (err) {
        setError(err.message || 'Error occurred during login');
    } finally {
        setLoading(false);
    }
};
```

**Problema:** Cualquier combinacion de email/password permite acceder al dashboard. No hay autenticacion real. El `api.js` con axios existe pero no se usa.

**Propuesta de optimizacion:**

Primero, corregir el baseURL en `api.js` — actualmente apunta a `http://localhost:3000/api` pero el gateway no tiene prefijo `/api`:

```js
// api.js - antes:
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// api.js - despues:
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});
```

Segundo, descomentar el interceptor de autenticacion para que el token se envie en cada peticion:

```js
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

Tercero, conectar el login real:

```js
import api from '../../../services/api';

const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
    } catch (err) {
        setError(err.response?.data?.message || 'Credenciales invalidas');
    } finally {
        setLoading(false);
    }
};
```

**Nota sobre el routing del gateway:** Durante la verificacion se detecto que el proxy del gateway stripea el prefijo `/auth` antes de reenviarlo al auth-service, pero el auth-service monta sus rutas en `/auth/*`. Desde el frontend esto se puede resolver duplicando el prefijo en las llamadas (`/auth/auth/login`), aunque la solucion limpia seria corregir el mount path en el backend.

---

## Detector de Alucinaciones (Bonus)

### Alucinacion 1: Rutas "protegidas" sin proteccion real

**Archivo:** `Frontend/src/routes/AppRouter.jsx`

```jsx
{/* Protected Routes with Layout */}
<Route element={<MainLayout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/my-reservations" element={<MyReservationsPage />} />
</Route>
```

El comentario `{/* Protected Routes with Layout */}` fue claramente generado por la IA, pero las rutas **no tienen ninguna proteccion real**. No hay verificacion de token, no hay redirect al login, no hay componente `PrivateRoute` ni `AuthGuard`. Cualquier usuario puede acceder a `http://localhost:5173/dashboard` directamente sin autenticarse. La IA genero el comentario como si la proteccion existiera, pero nunca la implemento.

**Propuesta:**
```jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    return children;
};

// En el router:
<Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/my-reservations" element={<MyReservationsPage />} />
</Route>
```

Esto mejora la **seguridad** al impedir el acceso a rutas privadas sin autenticacion.

### Alucinacion 2: Disponibilidad del calendario generada con Math.random()

**Archivo:** `Frontend/src/features/dashboard/services/reservationService.js`

```js
export const getAvailabilityForMonth = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const availability = {};
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        availability[day] = {
            available: dayOfWeek !== 0 && dayOfWeek !== 6 && Math.random() > 0.3,
            slots: {
                morning: Math.random() > 0.5,
                afternoon: Math.random() > 0.5,
                fullDay: Math.random() > 0.7
            }
        };
    }
    return availability;
};
```

Esta funcion se usa dentro de un `useMemo` en `useReservation.js`, pero como `Math.random()` produce resultados distintos en cada ejecucion, cada vez que el componente se re-renderiza o el usuario navega entre meses y vuelve, **la disponibilidad cambia aleatoriamente**. Un dia que aparecia como disponible puede volverse no disponible al volver a ese mes. Esto genera una experiencia de usuario incoherente y confusa.

**Propuesta:** Si se mantiene como mock, usar un seed determinista basado en la fecha para que la disponibilidad sea consistente:

```js
const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export const getAvailabilityForMonth = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const availability = {};
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const seed = year * 10000 + month * 100 + day;
        availability[day] = {
            available: dayOfWeek !== 0 && dayOfWeek !== 6 && seededRandom(seed) > 0.3,
            slots: {
                morning: seededRandom(seed + 1) > 0.5,
                afternoon: seededRandom(seed + 2) > 0.5,
                fullDay: seededRandom(seed + 3) > 0.7
            }
        };
    }
    return availability;
};
```

Esto mejora la **consistencia** de la UI — los dias mantienen su disponibilidad entre navegaciones.
