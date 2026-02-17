# Guía de Migración a Arquitectura Hexagonal

## 🎯 Objetivo

Migrar el frontend React de una arquitectura basada en features a una **Arquitectura Hexagonal (Ports & Adapters)** aplicando principios SOLID y patrones de diseño, sin romper funcionalidad existente.

## ✅ Fase 1: Infraestructura Base (COMPLETADA)

La infraestructura base está lista y la app funciona correctamente con la nueva arquitectura coexistiendo con la antigua.

### Componentes Creados
- ✅ Puertos: `IHttpClient`, `IStorageService`
- ✅ Adaptadores: `AxiosHttpClient`, `LocalStorageService`
- ✅ Factory: `HttpClientFactory`
- ✅ DI Container: `container.js` (Singleton)
- ✅ Provider: `DependencyProvider.jsx` (Facade)
- ✅ Integración en `main.jsx`

**Ver detalles completos en:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## 📋 Próximo: Fase 2 - Migrar Feature Auth

### Pasos a Realizar

#### 1. Crear Capa de Dominio
```bash
# Crear entidades
src/core/domain/entities/User.js
src/core/domain/errors/AuthenticationError.js
```

#### 2. Crear Puerto de Repositorio
```bash
src/core/ports/repositories/IAuthRepository.js
```

#### 3. Implementar Infraestructura
```bash
src/infrastructure/repositories/HttpAuthRepository.js
src/infrastructure/mappers/UserMapper.js
```

#### 4. Crear Casos de Uso
```bash
src/application/use-cases/auth/LoginUseCase.js
src/application/use-cases/auth/LogoutUseCase.js
src/application/use-cases/auth/RegisterUseCase.js
```

#### 5. Registrar en DI Container
Actualizar `core/adapters/di/container.js`:
```javascript
// Repositorio
const authRepository = new HttpAuthRepository(authClient, storageService);
this.dependencies.authRepository = authRepository;

// Casos de uso
this.dependencies.loginUseCase = new LoginUseCase(authRepository);
this.dependencies.logoutUseCase = new LogoutUseCase(authRepository);
this.dependencies.registerUseCase = new RegisterUseCase(authRepository);
```

#### 6. Migrar Hooks a Adapters
```bash
# Mover y actualizar
features/auth/hooks/useLogin.js → core/adapters/hooks/useLogin.js
features/auth/hooks/useSignup.js → core/adapters/hooks/useSignup.js
```

#### 7. Migrar Componentes a UI
```bash
# Mover sin cambios visuales
features/auth/containers/LoginPage.jsx → ui/pages/auth/LoginPage.jsx
features/auth/components/LoginForm.jsx → ui/components/auth/LoginForm.jsx
features/auth/containers/SignupPage.jsx → ui/pages/auth/SignupPage.jsx
features/auth/components/SignupForm.jsx → ui/components/auth/SignupForm.jsx
features/auth/styles/ → ui/styles/auth/
```

#### 8. Actualizar Imports
Actualizar todos los imports en los archivos movidos para referenciar las nuevas ubicaciones.

#### 9. Validar
- [ ] Login funciona correctamente
- [ ] Signup funciona correctamente
- [ ] Logout funciona correctamente
- [ ] No hay errores en consola
- [ ] UI no cambió visualmente

#### 10. Eliminar Código Antiguo
```bash
# Solo después de validar
rm -rf features/auth/services/
rm -rf features/auth/hooks/
```

## 🔄 Flujo de Trabajo Recomendado

1. **Crear nuevos archivos** en la estructura hexagonal
2. **Actualizar DI Container** para registrar nuevas dependencias
3. **Actualizar hooks** para usar casos de uso
4. **Mover componentes** a `ui/`
5. **Actualizar imports**
6. **Probar exhaustivamente**
7. **Eliminar código antiguo** solo cuando todo funcione

## 📚 Patrones Aplicados

| Patrón | Ubicación | Propósito |
|--------|-----------|-----------|
| **Repository** | `core/ports/repositories/*` | Abstraer acceso a datos |
| **Adapter** | `infrastructure/*` | Adaptar bibliotecas externas |
| **Factory** | `HttpClientFactory` | Crear HTTP clients configurados |
| **Singleton** | `DIContainer` | Única instancia de dependencias |
| **Facade** | `useDependencies()` | API simple para componentes |
| **Use Case** | `application/use-cases/*` | Lógica de aplicación |

## 🎓 Principios SOLID Aplicados

- **S**ingle Responsibility: Cada clase tiene una única responsabilidad
- **O**pen/Closed: Abierto para extensión (nuevos adapters) sin modificar casos de uso
- **L**iskov Substitution: Todos los repositorios implementan la misma interfaz
- **I**nterface Segregation: Interfaces específicas (no gordas)
- **D**ependency Inversion: Casos de uso dependen de interfaces, no implementaciones

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Tests (cuando se creen)
npm run test

# Linter
npm run lint
```

## 📖 Documentación

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Estructura detallada y estado actual
- `implementation_plan.md` (en artifacts) - Plan completo de migración
- Este README - Guía rápida de trabajo

## ⚠️ Consideraciones Importantes

1. **No romper funcionalidad**: La app debe funcionar en todo momento
2. **Migración incremental**: Feature por feature, no todo a la vez
3. **Tests primero**: Validar antes de eliminar código antiguo
4. **Duplicación temporal**: Es normal tener código duplicado durante migración
5. **Sin cambios visuales**: Solo refactorización interna

## 🤝 Siguientes Features a Migrar

Después de Auth:
1. **Dashboard** (Locations + Inventory)
2. **Reservations**
3. **Signup** (reutiliza Auth)
4. **Limpieza final** - Eliminar `features/`

---

**Última actualización**: Fase 1 completada - Infrastructure base ✅  
**Estado actual**: Listo para migrar Auth
