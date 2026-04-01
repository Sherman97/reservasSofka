# Agentes Especializados - Reservas SK

Este proyecto utiliza agentes especializados de GitHub Copilot para mantener altos estándares de código y arquitectura.

## 🤖 Agentes Disponibles

Invoca agentes usando `@nombre-agente` en el chat de Copilot:

### @backend-dev
**Especialización**: Microservicios Spring Boot con arquitectura hexagonal  
**Usa para**: REST endpoints, use cases, repositorios, RabbitMQ, WebSocket, JWT, migraciones DB  
**Herramientas**: read, edit, search, execute

### @frontend-dev
**Especialización**: React SPA con arquitectura hexagonal  
**Usa para**: Componentes React, use cases, hooks personalizados, routing, WebSocket, testing  
**Herramientas**: read, edit, search, execute

### @qr-feature
**Especialización**: Feature de verificación QR (HU-SOF-102)  
**Usa para**: Implementación del sistema de check-in con QR según planHUQR.md  
**Herramientas**: read, edit, search, execute  
**Subagentes**: backend-dev, frontend-dev, testing

### @testing
**Especialización**: Testing con cobertura 90%+  
**Usa para**: Tests unitarios, integración, E2E, verificación de cobertura  
**Herramientas**: read, edit, search, execute

### @architecture-review
**Especialización**: Revisión de arquitectura y SOLID  
**Usa para**: Validar hexagonal architecture, detectar anti-patterns, sugerir refactorings  
**Herramientas**: read, search (solo lectura)

## 📝 Instrucciones por Contexto

El sistema aplica automáticamente instrucciones específicas según el archivo que estés editando:

- **Backend services** (`Backend/services/**/src/**/*.java`): Arquitectura hexagonal, inyección de dependencias, DTOs como Records
- **Frontend code** (`Frontend/src/**/*.{jsx,tsx,ts}`): Componentes funcionales, hooks, separación de capas
- **Tests** (`**/*.{test,spec}.*`): Cobertura 90%+, naming conventions, anti-patterns

## 🎯 Ejemplos de Uso

### Implementar feature completa
```
@qr-feature Implementa FASE 1 del plan HUQR: Backend - Infraestructura Base.
Incluye generación de QR con ZXing, endpoints en locations-service, y tests
con 90%+ cobertura.
```

### Backend específico
```
@backend-dev Crea el use case CheckInReservationUseCase que:
1. Valide el token QR (JWT)
2. Verifique que spaceId coincida
3. Actualice estado PENDING → CHECKED_IN
4. Publique evento ReservationCheckedInEvent
Incluye tests unitarios.
```

### Frontend específico
```
@frontend-dev Crea el componente QrScannerModal que:
- Use html5-qrcode para escanear desde cámara
- Solicite permisos de cámara
- Llame al use case de check-in con el QR detectado
- Muestre errores si el QR es inválido
Incluye tests con React Testing Library.
```

### Solo testing
```
@testing Crea tests para CheckInReservationUseCase cubriendo:
- Check-in exitoso con QR válido
- QR inválido (firma incorrecta)
- Space ID no coincide
- Fuera del período de gracia (5 min)
- Reserva no en estado PENDING
Cobertura objetivo: 90%+
```

### Revisión de código
```
@architecture-review Revisa Backend/services/bookings-service/src/ y
verifica que siga:
1. Arquitectura hexagonal correcta
2. Principios SOLID
3. No anti-patterns (God Classes, Feature Envy, etc.)
Proporciona reporte con problemas CRÍTICOS y MAYORES.
```

## 📋 Convenciones del Proyecto

### Arquitectura
- **Hexagonal (Puertos y Adaptadores)**: Obligatoria en backend y frontend
- **SOLID Principles**: Revisar antes de cada commit
- **Test Coverage**: Mínimo 90% en código nuevo

### Backend
- Spring Boot 3.4.1 + Java 17
- Constructor injection (NO @Autowired en campos)
- DTOs como Java Records
- UTC timezone (Instant.now(), NO LocalDateTime)
- Logs con SLF4J

### Frontend
- React 19.2.0 funcional
- Custom hooks con prefijo `use`
- Props destructuradas
- Context API para estado global
- UTC timezone (.toISOString())

### Testing
- **Backend**: JUnit 5 + Mockito + Testcontainers
- **Frontend**: Vitest + React Testing Library + Playwright
- Naming: `shouldX_whenY_givenZ()`

## 🔗 Documentación de Referencia

- `.github/copilot-instructions.md` - Instrucciones generales del workspace
- `.github/README.md` - Guía detallada de agentes
- `planHUQR.md` - Plan de implementación QR check-in
- `Backend/docs/rutas-reserva.md` - Documentación API
- `docs/arquitectura_HUReservationVerfQR.md` - Arquitectura feature QR

## 🚀 Comandos Rápidos

```bash
# Backend tests + coverage
cd Backend && ./gradlew test jacocoTestReport

# Frontend tests + coverage
cd Frontend && npm run test:coverage

# E2E tests
cd Frontend && npm run test:e2e

# Linters
cd Backend && ./gradlew checkstyleMain pmdMain
cd Frontend && npm run lint

# Stack completo
docker-compose -f docker-compose.prod.yml up --build
```

---

**Tip**: Los agentes trabajan mejor con instrucciones específicas y contexto claro. Menciona archivos relacionados y el scope esperado (backend/frontend/ambos).
