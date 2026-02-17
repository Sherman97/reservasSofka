# Estructura de Arquitectura Hexagonal - Frontend

## 📁 Estructura de Carpetas Creada

```
src/
├── core/                                    # ← TODA LA LÓGICA (Arquitectura Hexagonal)
│   ├── domain/                             # Capa de Dominio (aún por migrar)
│   │   ├── entities/                       # Entidades de negocio
│   │   ├── value-objects/                  # Value Objects
│   │   └── errors/                         # Errores de dominio
│   │
│   ├── ports/                              # Puertos (Interfaces)
│   │   ├── repositories/                   # Interfaces de repositorios
│   │   └── services/                       # Interfaces de servicios externos
│   │       ├── IHttpClient.js              ✅ Creado
│   │       └── IStorageService.js          ✅ Creado
│   │
│   └── adapters/                           # Adaptadores para UI
│       ├── hooks/                          # Custom hooks (por migrar)
│       ├── providers/                      # Context providers
│       │   └── DependencyProvider.jsx      ✅ Creado
│       └── di/                             # Dependency Injection
│           └── container.js                ✅ Creado (Singleton Pattern)
│
├── application/                            # Capa de Aplicación (por crear)
│   └── use-cases/                         # Casos de uso
│       ├── auth/                          # (por migrar)
│       ├── locations/                     # (por migrar)
│       ├── reservations/                  # (por migrar)
│       └── inventory/                     # (por migrar)
│
├── infrastructure/                         # Capa de Infraestructura
│   ├── http/
│   │   ├── clients/
│   │   │   ├── AxiosHttpClient.js         ✅ Creado (Adapter Pattern)
│   │   │   └── HttpClientFactory.js       ✅ Creado (Factory Pattern)
│   │   └── config/                        # (por crear)
│   │
│   ├── repositories/                       # Implementaciones de repositorios (por migrar)
│   ├── storage/
│   │   └── LocalStorageService.js         ✅ Creado (Adapter Pattern)
│   └── mappers/                           # DTOs ↔ Entidades (por migrar)
│
├── ui/                                     # ← TODA LA UI/UX (por migrar desde features/)
│   ├── pages/                             # Páginas
│   ├── components/                        # Componentes visuales
│   └── styles/                            # Estilos
│
└── features/                               # ← ESTRUCTURA ANTIGUA (por eliminar después)
    ├── auth/
    ├── dashboard/
    ├── reservations/
    └── signup/
```

## ✅ Fase 1 Completada: Infraestructura Base

### Componentes Creados

#### **1. Puertos (Interfaces)**

##### `IHttpClient.js`
- **Patrón**: Interface (Port)
- **Ubicación**: `core/ports/services/`
- **Propósito**: Define el contrato para clientes HTTP
- **Métodos**: `get()`, `post()`, `put()`, `delete()`, `addRequestInterceptor()`, `addResponseInterceptor()`
- **Beneficio**: Permite cambiar de axios a fetch/ky sin tocar casos de uso

##### `IStorageService.js`
- **Patrón**: Interface (Port)
- **Ubicación**: `core/ports/services/`
- **Propósito**: Define el contrato para almacenamiento de datos
- **Métodos**: `get()`, `set()`, `remove()`, `clear()`, `has()`
- **Beneficio**: Permite cambiar de localStorage a IndexedDB/SessionStorage

#### **2. Adaptadores de Infraestructura**

##### `AxiosHttpClient.js`
- **Patrón**: Adapter
- **Ubicación**: `infrastructure/http/clients/`
- **Propósito**: Adapta axios a la interfaz IHttpClient
- **Características**:
  - Manejo centralizado de errores
  - Soporte para interceptores
  - Retorna formato estandarizado `{ data, status }`
- **Beneficio**: Desacopla la app de axios

##### `LocalStorageService.js`
- **Patrón**: Adapter
- **Ubicación**: `infrastructure/storage/`
- **Propósito**: Adapta localStorage del navegador a IStorageService
- **Características**:
  - Manejo de errores
  - Métodos helper para JSON (`getJSON()`, `setJSON()`)
  - Detección de cuota excedida
- **Beneficio**: Testeable y reemplazable

##### `HttpClientFactory.js`
- **Patrón**: Factory
- **Ubicación**: `infrastructure/http/clients/`
- **Propósito**: Crea clientes HTTP pre-configurados
- **Métodos**:
  - `create()` - Factory genérico
  - `createAuthClient()` - Cliente para API de autenticación
  - `createBookingsClient()` - Cliente para API de reservas
  - `createInventoryClient()` - Cliente para API de inventario
  - `createLocationsClient()` - Cliente para API de ubicaciones
- **Características**:
  - Agrega automáticamente interceptor de autenticación
  - Manejo de errores comunes (401, 403, 500+)
  - Lee URLs de variables de entorno
- **Beneficio**: Evita duplicar configuración de clientes

#### **3. Dependency Injection**

##### `container.js`
- **Patrón**: Singleton
- **Ubicación**: `core/adapters/di/`
- **Propósito**: Registro central de todas las dependencias
- **Métodos**:
  - `get(name)` - Obtiene dependencia por nombre
  - `register(name, instance)` - Registra nueva dependencia
  - `has(name)` - Verifica si existe dependencia
  - `reset()` - Reinicia contenedor (para testing)
- **Dependencias Registradas Actualmente**:
  - ✅ `storageService` (LocalStorageService)
  - ✅ `authClient` (AxiosHttpClient para auth)
  - ✅ `bookingsClient` (AxiosHttpClient para reservas)
  - ✅ `inventoryClient` (AxiosHttpClient para inventario)
  - ✅ `locationsClient` (AxiosHttpClient para ubicaciones)
- **Beneficio**: Un solo lugar para configurar todas las dependencias

##### `DependencyProvider.jsx`
- **Patrón**: Facade + Context Provider
- **Ubicación**: `core/adapters/providers/`
- **Propósito**: Provee dependencias a través de React Context
- **Hooks Exportados**:
  - `useDependencies()` - Hook principal (Facade)
  - `useContainer()` - Acceso directo al container (uso avanzado)
- **Características**:
  - Facade que expone solo casos de uso (no repositorios)
  - Validación de contexto
  - API limpia para componentes
- **Beneficio**: Componentes no conocen el contenedor directamente

#### **4. Integración con la App**

##### `main.jsx`
- **Cambio**: Envolver `<App />` con `<DependencyProvider>`
- **Efecto**: Todas las dependencias ahora están disponibles vía `useDependencies()`
- **Sin cambios visuales**: La app funciona exactamente igual

## 🎯 Estado Actual

### ✅ Completado
- Estructura de carpetas `core/` e `infrastructure/`
- Interfaces (Ports) para HTTP y Storage
- Adaptadores para Axios y localStorage
- Factory para crear HTTP clients
- DI Container con Singleton pattern
- Dependency Provider con Facade pattern
- Integración no-invasiva en la app

### 📋 Próximos Pasos (Fase 2: Migrar Auth)

1. **Crear capa de dominio**:
   - `core/domain/entities/User.js`
   - `core/domain/errors/AuthenticationError.js`
   
2. **Crear puerto de repositorio**:
   - `core/ports/repositories/IAuthRepository.js`

3. **Implementar repositorio**:
   - `infrastructure/repositories/HttpAuthRepository.js`
   - `infrastructure/mappers/UserMapper.js`

4. **Crear casos de uso**:
   - `application/use-cases/auth/LoginUseCase.js`
   - `application/use-cases/auth/LogoutUseCase.js`
   - `application/use-cases/auth/RegisterUseCase.js`

5. **Migrar hooks**:
   - Mover `features/auth/hooks/useLogin.js` → `core/adapters/hooks/useLogin.js`
   - Actualizar para usar `loginUseCase` del container

6. **Mover componentes a ui/**:
   - `features/auth/` → `ui/pages/auth/` y `ui/components/auth/`

## 🔍 Verificación

### Comandos de Verificación
```bash
# La app debe arrancar sin errores
npm run dev

# En el navegador, verificar consola: 0 errores
```

### Checklist de Validación
- [x] App arranca correctamente
- [x] No hay errores en consola
- [x] Funcionalidad existente NO se rompe
- [x] Nueva estructura coexiste con la antigua
- [ ] Tests pasan (cuando se creen)

## 📊 Patrones de Diseño Aplicados

| Patrón | Archivo | Propósito |
|--------|---------|-----------|
| **Port (Interface)** | `IHttpClient.js`, `IStorageService.js` | Contratos para inversión de dependencias |
| **Adapter** | `AxiosHttpClient.js`, `LocalStorageService.js` | Adaptar bibliotecas externas a nuestras interfaces |
| **Factory** | `HttpClientFactory.js` | Crear instancias configuradas de HTTP clients |
| **Singleton** | `container.js` | Una única instancia del contenedor de DI |
| **Facade** | `DependencyProvider.jsx` (useDependencies) | API simple para acceder a dependencias |

## 🚀 Ventajas Obtenidas

1. **Testabilidad**: Puedes mockear `IHttpClient` en tests sin tocar axios
2. **Flexibilidad**: Cambiar de axios a fetch requiere solo crear nuevo adapter
3. **Centralización**: Toda la configuración HTTP está en un solo lugar
4. **Type Safety (futuro)**: Las interfaces facilitan migrar a TypeScript
5. **No Breaking Changes**: El código antiguo sigue funcionando sin modificaciones

## 📝 Notas

- La estructura antigua (`features/`) se mantendrá hasta terminar la migración
- Durante la migración habrá duplicación temporal de código (normal)
- Los casos de uso se agregarán al container a medida que se migren features
- La carpeta `ui/` se creará cuando comencemos a mover componentes
