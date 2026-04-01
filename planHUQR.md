# Plan: Implementación Feature Verificación de Reserva por QR

**TL;DR**: Implementar sistema de check-in mediante QR para salas/espacios que incluye: (1) generación QR únicos por espacio al momento de crear el espacio, (2) endpoint de check-in con validación de QR y actualización de estado PENDING→CHECKED_IN, (3) scanner QR en frontend con acceso a cámara, (4) job automático que marca reservas como NO_SHOW y libera espacios tras 5 minutos de inasistencia. Se aplicarán patrones State, Strategy, Command y se mantendrá 90%+ de cobertura de pruebas.

---

## FASE 1: Backend - Infraestructura Base (5-8 horas)

### Paso 1: Agregar dependencias y configuración de QR/Jobs
- Agregar librería `com.google.zxing:core` (ZXing) para generación de QR en `Backend/services/bookings-service/build.gradle` Y `Backend/services/locations-service/build.gradle`
- Agregar Spring Scheduler: `@EnableScheduling` en la clase principal `BookingsServiceApplication`
- Crear `QrProperties.java` en `infrastructure/config/` de bookings-service con propiedades configurables: `qr.checkin.grace-period-minutes` (5)
- Crear `QrProperties.java` en `infrastructure/config/` de locations-service con propiedades configurables: `qr.image.size` (300), `qr.image.format` (PNG)

### Paso 2: Extender modelo de dominio con nuevos estados (*parallel with Step 1*)
- Actualizar `Reservation.java` (domain/model/) agregando constantes: `STATUS_CHECKED_IN = "checked_in"`, `STATUS_NO_SHOW = "no_show"`
- Agregar método de validación: `canCheckIn(): boolean` que verifica estado PENDING y tiempo dentro del grace period
- Agregar campo `qrToken: String` (opcional, para auditoría)
- Actualizar script SQL `Backend/services/database/schema.sql` con:
  - Nueva columna `qr_token VARCHAR(500)` en tabla `reservations`
  - Índice en columna `status` para optimizar consultas del job
  - Índice compuesto en `(status, start_datetime)` para el job de NO_SHOW

### Paso 3: Implementar generación de QR tokens (Adapter Pattern)
- Crear puerto `QrTokenGeneratorPort.java` en `application/port/out/` de bookings-service con métodos:
  - `generateQrToken(spaceId: Long): String` → retorna JWT firmado permanente
  - `validateQrToken(token: String): QrTokenData` → valida y extrae datos (spaceId)
- Crear adaptador `JwtQrTokenGeneratorAdapter.java` en `adapters/out/security/` de bookings-service:
  - Usar misma clave secreta que autenticación (JwtProperties)
  - Incluir claims: `spaceId`, `tokenType="QR_CHECKIN"`, `iat` (issued at)
  - Firma con algoritmo HS256
  - **NO incluir `exp` (expiration)** - el QR es permanente por espacio
- Crear `QrCodeImageGeneratorAdapter.java` (Facade Pattern) en `adapters/out/qr/` de locations-service:
  - Usa ZXing library para generar imagen QR (formato PNG, 300x300px)
  - Input: JWT token string
  - Output: byte[] de la imagen
- Escribir tests unitarios:
  - `JwtQrTokenGeneratorAdapterTest.java` en bookings-service (cobertura 90%+)
  - `QrCodeImageGeneratorAdapterTest.java` en locations-service (cobertura 90%+)

### Paso 3b: Integrar generación de QR en creación de espacios (*parallel with Step 3*)
- Modificar modelo `Space` en locations-service agregando campo `qrCode: byte[]`, `qrToken: String` y `qrETag: String`
- Actualizar script SQL `Backend/services/database/schema.sql` con:
  - Nueva columna `qr_code BYTEA` (PostgreSQL) o `BLOB` (MySQL) en tabla `spaces`
  - Nueva columna `qr_token VARCHAR(500)` en tabla `spaces`
  - Nueva columna `qr_etag VARCHAR(64)` para almacenar hash MD5/SHA-256 de la imagen
- Modificar use case de creación de espacios en locations-service:
  - Después de guardar el espacio, generar token QR con `spaceId`
  - Generar imagen QR con `QrCodeImageGeneratorAdapter`
  - Calcular ETag (hash SHA-256 de la imagen QR)
  - Actualizar registro del espacio con `qrCode`, `qrToken` y `qrETag`
- Agregar endpoint `GET /locations/spaces/{spaceId}/qr` en locations-service:
  - Endpoint autenticado (solo admin/usuarios autenticados)
  - Retorna imagen QR ya generada desde BD
  - **Headers de caché optimizados**:
    - `Content-Type: image/png`
    - `Cache-Control: public, max-age=31536000, immutable` (1 año, inmutable)
    - `ETag: <hash-sha256>` - permite validación condicional
    - Soporte para `If-None-Match`: retornar 304 Not Modified si ETag coincide
  - Implementar lógica de cache validation: si request incluye `If-None-Match` con ETag correcto, responder 304 sin body
- Escribir tests:
  - Test de creación de espacio verificando que QR se genera automáticamente con ETag
  - Test de endpoint GET /qr verificando que retorna imagen correcta con headers de cache
  - Test de validación condicional: verificar respuesta 304 cuando ETag coincide

---

## FASE 2: Backend - Lógica de Negocio Check-In (6-10 horas)

### Paso 4: Crear Use Case de Check-In (*depends on Step 3*)
- Crear command `CheckInReservationCommand.java` en `application/usecase/`:
  ```java
  public record CheckInReservationCommand(
      Long reservationId,
      Long userId,
      String qrToken
  ) {}
  ```
- Crear `CheckInReservationUseCase.java` en `application/service/` implementando lógica:
  1. Validar existencia de reserva y pertenencia al usuario
  2. Validar QR token con `QrTokenGeneratorPort.validateQrToken()` (verifica firma JWT)
  3. Verificar que spaceId del token coincida con spaceId de la reserva
  4. Validar que reserva esté en estado PENDING
  5. Validar tiempo: dentro de 5 min después de startDatetime (usando UTC)
  6. Actualizar estado a CHECKED_IN con timestamp de check-in (UTC)
  7. Publicar evento `ReservationCheckedInEvent` (RabbitMQ + WebSocket)
  - **Logs de Auditoría**: 
    - Log de éxito: `INFO: Check-in exitoso - reservationId={}, userId={}, spaceId={}, timestamp={}`
    - Log de fallos: `WARN: Intento de check-in fallido - reservationId={}, userId={}, spaceId={}, qrTokenPrefix={}, reason={}, timestamp={}` (incluir primeros 10 chars del token para análisis)
    - Crear métricas de fallos por tipo (QR_INVALID, SPACE_MISMATCH, TIME_EXPIRED) para identificar QRs dañados en salas específicas
- Agregar método al puerto `BookingPersistencePort.java`:
  - `updateReservationStatus(reservationId: Long, newStatus: String): void`
  - `updateReservationStatusBatch(reservationIds: List<Long>, newStatus: String): int`
  - `logCheckInAttempt(reservationId: Long, success: boolean, failureReason: String): void` - para auditoría
- Implementar en `JdbcBookingPersistenceAdapter.java`
- Escribir tests:
  - `CheckInReservationUseCaseTest.java` con casos: éxito, QR inválido (firma incorrecta), reserva no PENDING, fuera de tiempo de gracia, spaceId no coincide (cobertura 90%+)
  - Verificar que logs de auditoría se generan correctamente en cada caso

### Paso 5: Crear endpoint REST de Check-In (*depends on Step 4*)
- Crear DTO `CheckInRequest.java` en `adapters/in/web/dto/`:
  ```java
  public record CheckInRequest(
      @NotBlank(message = "qrToken es obligatorio")
      String qrToken
  ) {}
  ```
- Agregar endpoint en `BookingController.java`:
  ```java
  @PostMapping("/reservations/{reservationId}/checkin")
  public ResponseEntity<ApiResponse<ReservationResponse>> checkIn(
      @PathVariable Long reservationId,
      @Valid @RequestBody CheckInRequest request,
      @AuthenticationPrincipal AuthenticatedUser user
  )
  ```
- Manejar excepciones específicas en `GlobalExceptionHandler.java`:
  - `QR_TOKEN_INVALID` (400) - Firma JWT inválida o token malformado
  - `SPACE_MISMATCH` (400) - SpaceId del QR no coincide con reserva
  - `CHECKIN_TIME_EXPIRED` (409) - Fuera del período de gracia de 5 min
  - `INVALID_RESERVATION_STATUS` (409) - Reserva no está en estado PENDING
- Escribir tests:
  - `BookingControllerTest.java` - test de integración con MockMvc para endpoint `/checkin` (cobertura 90%+)

### Paso 6: Validar integración con locations-service (*parallel with Step 5*)
- Verificar que bookings-service puede consultar información de espacios (si no existe, crear puerto `LocationPort.java`)
- Crear adaptador para comunicación HTTP con locations-service si es necesario
- Opcionalmente: Implementar caché de tokens QR en bookings-service para evitar llamadas frecuentes a locations-service durante validación
- Escribir tests de integración verificando flujo completo: generar QR en location → validar en booking (cobertura 90%+)

---

## FASE 3: Backend - Job Automático de Liberación (4-6 horas)

### Paso 7: Implementar Scheduled Job para NO_SHOW (*depends on Step 4*)
- Crear `ReservationMonitorJob.java` en `application/service/scheduled/`:
  - Anotaciones: `@Component`, `@EnableScheduling`
  - Método con `@Scheduled(fixedRate = 60000)` (ejecuta cada 1 minuto)
  - Lógica:
    1. Buscar reservas con estado PENDING y `startDatetime < (now - 5 minutes)` usando UTC
    2. Actualizar en batch a estado NO_SHOW
    3. Publicar eventos de liberación de espacios
    4. Loggear cantidad de reservas actualizadas con timestamp UTC
  - **Idempotencia**: Asegurar que la query de actualización incluya cláusula `WHERE status = 'pending'` para evitar actualizar registros ya procesados si el job se ejecuta múltiples veces
- Agregar query al puerto `BookingPersistencePort.java`:
  - `findExpiredPendingReservations(gracePeriodMinutes: int): List<Reservation>`
- Implementar en `JdbcBookingPersistenceAdapter.java` usando índice en `(status, start_datetime)`:
  - Ejemplo query: `UPDATE reservations SET status = 'no_show', updated_at = NOW() WHERE status = 'pending' AND start_datetime < (NOW() - INTERVAL ? MINUTE)`
  - Usar transacciones con nivel de aislamiento READ_COMMITTED
- Escribir tests:
  - `ReservationMonitorJobTest.java` usando `@SpringBootTest` con base de datos H2 in-memory
  - Simular reservas vencidas y verificar cambio de estado
  - Test de idempotencia: ejecutar job dos veces y verificar que no hay efectos secundarios
  - Cobertura 90%+

---

## FASE 4: Frontend - Infraestructura QR Scanner (5-7 horas)

### Paso 8: Agregar dependencias de QR y configurar
- Agregar a `Frontend/package.json`:
  - `html5-qrcode@^2.3.8` (librería de scanner con soporte de cámara)
- Ejecutar `npm install`

### Paso 9: Extender capa de dominio (*parallel with Step 8*)
- Actualizar `Reservation.ts` (core/domain/entities/) agregando:
  - Estados: `STATUS_CHECKED_IN`, `STATUS_NO_SHOW` a las constantes
  - Método `canCheckIn(): boolean` que valida estado PENDING y tiempo dentro de grace period
  - Método `isExpired(): boolean` para validación de tiempo
- Crear error personalizado `QrScanError.ts` en `core/domain/errors/`:
  - `InvalidQrCodeError`
  - `QrExpiredError`
  - `CameraPermissionDeniedError`

### Paso 10: Extender Repository Port y Use Cases (*depends on Step 9*)
- Agregar método a `IReservationRepository.ts` (core/ports/repositories/):
  ```typescript
  checkIn(reservationId: string, qrToken: string): Promise<Reservation>
  ```
- Implementar en `HttpReservationRepository.ts` (infrastructure/repositories/):
  ```typescript
  async checkIn(reservationId: string, qrToken: string): Promise<Reservation> {
      const response = await this.httpClient.post(
          `/bookings/reservations/${reservationId}/checkin`,
          { qrToken }
      );
      return ReservationMapper.toDomain(response.data);
  }
  ```
- Crear `CheckInReservationUseCase.ts` en `application/use-cases/reservations/`:
  - Input: `{ reservationId: string, qrToken: string }`
  - Output: `Promise<Reservation>`
  - Orquesta la llamada al repository y maneja errores
- Escribir tests unitarios:
  - `CheckInReservationUseCase.test.ts` con mocks del repository (cobertura 90%+)

---

## FASE 5: Frontend - Componentes UI (6-9 horas)

### Paso 11: Crear hook personalizado para QR Scanner (*depends on Step 10*)
- Crear `useQrScanner.ts` en `core/adapters/hooks/`:
  - Estados: `scanning: boolean`, `error: string | null`, `hasPermission: boolean`
  - Métodos:
    - `startScanning(videoElement: HTMLVideoElement, onSuccess: (qrData: string) => void): void`
    - `stopScanning(): void`
    - `requestCameraPermission(): Promise<boolean>`
  - Integra librería `html5-qrcode` con cleanup en `useEffect`
- Crear `useCheckIn.ts` hook:
  - Conecta con `CheckInReservationUseCase` del DI container
  - Estados: `loading: boolean`, `error: string | null`, `success: boolean`
  - Método: `checkIn(reservationId: string, qrToken: string): Promise<void>`
- Escribir tests:
  - `useQrScanner.test.ts` usando `@testing-library/react-hooks` (cobertura 90%+)
  - `useCheckIn.test.ts` (cobertura 90%+)

### Paso 12: Crear componente QrScannerModal (*depends on Step 11*)
- Crear `QrScannerModal.jsx` en `ui/components/reservations/`:
  - Props: `isOpen: boolean`, `onClose: () => void`, `reservation: Reservation`, `onSuccess: () => void`
  - UI:
    - Video element para preview de cámara (640x480px)
    - Marco visual de guía para enfoque del QR
    - Botón "Cancelar"
    - Mensajes de error si QR inválido
    - Loading spinner durante validación
  - Flujo:
    1. Al abrir, solicitar permiso de cámara
    2. Iniciar scanner con `useQrScanner`
    3. Al detectar QR, llamar `checkIn` con el token
    4. Si éxito, mostrar mensaje y cerrar modal tras 2 segundos
    5. Si error, mostrar mensaje y mantener scanner activo
- Aplicar estilos siguiendo `HandoverModal.jsx` como referencia
- Escribir tests:
  - `QrScannerModal.test.jsx` renderizado, permisos denegados, lectura exitosa, errores (cobertura 90%+)

### Paso 13: Integrar botón Check-In en ReservationCard (*depends on Step 12*)
- Actualizar `ReservationCard.jsx` (ui/components/reservations/):
  - Mostrar botón "Verificar Asistencia" solo si `reservation.canCheckIn() === true`
  - Al click, abrir `QrScannerModal` pasando la reserva actual
  - Al cerrar exitosamente el modal, recargar lista de reservas
  - Mostrar badge "CHECKED_IN" si estado es `checked_in`
  - Mostrar badge "NO_SHOW" en rojo si estado es `no_show`
- Escribir tests:
  - `ReservationCard.test.jsx` - verificar renderizado condicional de botón y badges (cobertura 90%+)

### Paso 14: Actualizar DI Container (*parallel with Step 13*)
- Editar `container.ts` (core/adapters/di/):
  - Registrar `CheckInReservationUseCase` con dependencia de `reservationRepository`
  - Exportar en hook `useReservationDependencies()`
- Sin tests adicionales (cubierto por tests de integración)

---

## FASE 6: Testing E2E y Refinamiento (3-5 horas)

### Paso 15: Crear tests End-to-End (*depends on Fase 5 completa*)
- Crear `Frontend/e2e/checkin-flow.spec.ts`:
  - Test 1: Check-in exitoso escaneando QR válido
  - Test 2: Error con QR inválido
  - Test 3: Error con QR de espacio incorrecto
  - Test 4: Verificar que reserva cambia a CHECKED_IN tras scan
- Ejecutar con `npm run test:e2e` y validar cobertura

### Paso 16: Validación de cobertura de código (*depends on all previous steps*)
- Backend:
  - Ejecutar `./gradlew test jacocoTestReport`
  - Verificar que cobertura de clases nuevas sea >= 90%
  - Si no cumple, agregar tests faltantes
- Frontend:
  - Ejecutar `npm run test:coverage`
  - Verificar cobertura >= 90% en nuevos archivos
  - Si no cumple, agregar tests faltantes

### Paso 17: Refactoring y aplicación de patrones SOLID (*parallel with Step 16*)
- Revisar que se cumplan principios de arquitectura recomendada:
  - State Pattern: Verificar que estados estén encapsulados correctamente
  - Strategy Pattern: Asegurar que validación de QR es intercambiable
  - Command Pattern: Jobs usan comandos claros y desacoplados
  - Adapter Pattern: QR generation está aislado de lógica de negocio
- Ejecutar linters:
  - Backend: `./gradlew checkstyleMain checkstyleTest pmdMain pmdTest`
  - Frontend: `npm run lint`
- Corregir violaciones encontradas

---

## FASE 7: Integración y Documentación (2-3 horas)

### Paso 18: Configurar variables de entorno (*depends on FASE 1-3*)
- Actualizar `Backend/services/bookings-service/src/main/resources/application.properties`:
  ```properties
  qr.checkin.grace-period-minutes=5
  locations.service.url=${LOCATIONS_SERVICE_URL:http://localhost:3004}
  ```
- Actualizar `Backend/services/locations-service/src/main/resources/application.properties`:
  ```properties
  qr.image.size=300
  qr.image.format=PNG
  ```
- Documentar en `Backend/services/bookings-service/README.md` y `Backend/services/locations-service/README.md`

### Paso 19: Actualizar documentación de API
- Agregar a `Backend/docs/rutas-reserva.md`:
  - `POST /bookings/reservations/{id}/checkin` - Descripción, request/response, códigos de error
- Crear/actualizar `Backend/docs/rutas-locations.md`:
  - `GET /locations/spaces/{spaceId}/qr` - Descripción, formato de imagen, autenticación requerida
  - Documentar que QR se genera automáticamente al crear espacio
- Agregar diagramas de secuencia en `docs/arquitectura_HUReservationVerfQR.md`:
  - Flujo de creación de espacio con generación de QR
  - Flujo de check-in con validación de QR

### Paso 20: Pruebas manuales en entorno de staging (*depends on all previous*)
- Levantar stack completo con `docker-compose up`
- Crear un nuevo espacio y verificar que QR se genera automáticamente
- Obtener QR del espacio creado (GET /locations/spaces/{id}/qr)
- Imprimir QR o mostrarlo en pantalla (simular QR físico en sala)
- Crear reserva PENDING para ese espacio
- Escanear QR con el frontend y validar check-in exitoso
- Dejar pasar 5+ minutos sin check-in en otra reserva y verificar que job marca como NO_SHOW
- Validar que el mismo QR se puede usar múltiples veces (es permanente por espacio)
- Validar eventos en WebSocket (si aplica)
- Validar que notificaciones-service recibe eventos (out of scope para implementación pero verificar integración)

---

## Archivos Críticos a Modificar/Crear

**Backend (bookings-service):**
- `build.gradle` - agregar ZXing dependency
- `BookingsServiceApplication.java` - agregar @EnableScheduling
- **Nuevos:**
  - `infrastructure/config/QrProperties.java`
  - `application/port/out/QrTokenGeneratorPort.java`
  - `adapters/out/security/JwtQrTokenGeneratorAdapter.java`
  - `application/port/out/LocationPort.java` (si no existe)
  - `adapters/out/http/HttpLocationAdapter.java` (si es necesario)
  - `application/usecase/CheckInReservationCommand.java`
  - `application/service/CheckInReservationUseCase.java`
  - `application/service/scheduled/ReservationMonitorJob.java`
  - `adapters/in/web/dto/CheckInRequest.java`
  - Tests: 15+ archivos nuevos
- **Modificados:**
  - `domain/model/Reservation.java` - nuevos estados y métodos
  - `application/port/out/BookingPersistencePort.java` - nuevos métodos
  - `adapters/out/persistence/JdbcBookingPersistenceAdapter.java` - implementaciones
  - `adapters/in/web/BookingController.java` - nuevo endpoint
  - `exception/GlobalExceptionHandler.java` - nuevos códigos de error
  - `services/database/schema.sql` - nueva columna y índices en reservations

**Backend (locations-service):**
- `build.gradle` - agregar ZXing dependency
- **Nuevos:**
  - `infrastructure/config/QrProperties.java`
  - `application/port/out/QrCodeGeneratorPort.java`
  - `adapters/out/qr/QrCodeImageGeneratorAdapter.java`
  - `adapters/in/web/dto/SpaceQrResponse.java`
  - Tests: 5+ archivos nuevos
- **Modificados:**
  - `domain/model/Space.java` - campos qrCode y qrToken
  - `application/service/SpaceService.java` - lógica de generación QR en creación
  - `adapters/in/web/SpaceController.java` - endpoint GET /spaces/{id}/qr
  - `services/database/schema.sql` - nuevas columnas en spaces

**Frontend:**
- `package.json` - agregar html5-qrcode
- **Nuevos:**
  - `core/domain/errors/QrScanError.ts` (y subclases)
  - `application/use-cases/reservations/CheckInReservationUseCase.ts`
  - `core/adapters/hooks/useQrScanner.ts`
  - `core/adapters/hooks/useCheckIn.ts`
  - `ui/components/reservations/QrScannerModal.jsx`
  - Tests: 8+ archivos nuevos
  - `e2e/checkin-flow.spec.ts`
- **Modificados:**
  - `core/domain/entities/Reservation.ts` - nuevos estados y métodos
  - `core/ports/repositories/IReservationRepository.ts` - método checkIn
  - `infrastructure/repositories/HttpReservationRepository.ts` - implementación
  - `ui/components/reservations/ReservationCard.jsx` - botón y badges
  - `core/adapters/di/container.ts` - registro de use case

---

## Verificación de Cumplimiento

**Pruebas:**
- [ ] Backend: cobertura >= 90% en clases nuevas (verificado con JaCoCo)
- [ ] Frontend: cobertura >= 90% en componentes/hooks/use cases nuevos (verificado con Vitest coverage)
- [ ] 5+ tests E2E pasando en Playwright
- [ ] Linters pasan sin errores (backend: CheckStyle + PMD, frontend: ESLint)

**Funcionalidad:**
- [ ] QR se genera automáticamente al crear espacio con token JWT firmado permanente
- [ ] QR generado se almacena correctamente en BD (columnas qr_code y qr_token)
- [ ] Endpoint GET /locations/spaces/{id}/qr retorna imagen QR correcta
- [ ] Check-in exitoso cambia estado PENDING → CHECKED_IN
- [ ] Validaciones de QR: firma inválida, spaceId incorrecto retornan errores apropiados
- [ ] Mismo QR puede usarse múltiples veces (es permanente por espacio)
- [ ] Job automático marca NO_SHOW tras 5 minutos de inasistencia
- [ ] Frontend muestra scanner con preview de cámara
- [ ] Permisos de cámara se solicitan correctamente
- [ ] Badges de estado se muestran correctamente en ReservationCard
- [ ] Eventos de check-in se publican a RabbitMQ y WebSocket

**Arquitectura:**
- [ ] Hexagonal Architecture mantenida (puertos y adaptadores)
- [ ] State Pattern aplicado para estados de reserva
- [ ] Strategy Pattern aplicado para validación de QR
- [ ] Command Pattern aplicado en job de liberación
- [ ] SOLID principles respetados (verificado en code review)
- [ ] No hay "God Classes" creadas

---

## Decisiones Técnicas

1. **Librería de QR**: ZXing (backend) y html5-qrcode (frontend) - Son estándar de la industria, bien mantenidas y con soporte activo
2. **Job Scheduler**: Spring @Scheduled en lugar de Quartz - Suficiente para un job simple de 1 minuto de intervalo; evita complejidad innecesaria
3. **Tiempo de gracia**: 5 minutos configurables - Cumple requisito de HU-SOF-102.3, permite ajuste sin redeployment
4. **Token QR**: JWT firmado con misma clave que auth - Reutiliza infraestructura existente, consistente con arquitectura actual
5. **QR permanente por espacio**: Se genera una vez al crear el espacio y se almacena en BD - Permite impresión física sin necesidad de regeneración, simplifica operación
6. **Camera library**: html5-qrcode sobre jsQR - Mejor manejo de permisos y cross-browser compatibility
7. **Almacenamiento de QR**: Imagen en columna BYTEA/BLOB - Evita regeneración frecuente y permite servir imagen directamente desde BD con alta cache

---

## Consideraciones Adicionales

**Seguridad:**
- Token QR es permanente por espacio pero solo contiene `spaceId` - no expone información sensible
- Endpoint GET /spaces/{id}/qr requiere autenticación para evitar scraping masivo de QRs
- Los QRs impresos físicamente no expiran, el control de acceso se hace en el check-in validando la reserva activa
- Validación de que userId del token de autenticación coincida con userId de la reserva durante check-in
- Recomendado: Rate limiting en endpoint de check-in para prevenir abuso

**Performance:**
- Índice compuesto en `(status, start_datetime)` crítico para performance del job
- Job ejecuta cada minuto pero consulta es acotada por WHERE con índice
- Batch update de reservas NO_SHOW reduce transacciones
- **ETags optimizados**: Endpoint GET /qr usa ETags y `immutable` cache para evitar descargas repetidas - el móvil valida con `If-None-Match` y recibe 304 Not Modified

**Escalabilidad:**
- Si volumen de reservas crece >10K/día, considerar job distribuido con lock de cluster
- Imágenes QR almacenadas en BD con cache HTTP de 1 año - no requiere regeneración
- Si BD se vuelve bottleneck, mover imágenes QR a S3/CDN manteniendo tokens en BD

**UX:**
- Guía visual en scanner para ayudar a usuarios a enfocar QR
- Mensaje claro si permisos de cámara denegados con instrucciones de cómo habilitarlos
- Loading state durante validación de QR para feedback inmediato

**Sincronización de Tiempo (CRÍTICO):**
- **Uso obligatorio de UTC** en toda la aplicación - tanto Backend como Base de Datos
- Configurar JVM con `-Duser.timezone=UTC` en application properties o docker-compose
- PostgreSQL/MySQL: verificar que `timezone = 'UTC'` en configuración del servidor
- En Java: usar `Instant.now()` en lugar de `LocalDateTime.now()` para evitar ambigüedades de zona horaria
- En JavaScript/Frontend: usar `new Date().toISOString()` para timestamps UTC
- **Prevención de problemas**: Esto evita errores cuando cambia horario de verano o si servidores están en distintas zonas horarias
- Tests de integración deben verificar que comparaciones de tiempo funcionan correctamente con UTC
- Documentar en README que el sistema opera completamente en UTC

**Auditoría y Monitoreo:**
- **Logs estructurados**: Todos los intentos de check-in (exitosos y fallidos) deben loguearse con formato JSON para facilitar análisis
- **Métricas por espacio**: Trackear fallos de check-in agrupados por `spaceId` para identificar QRs físicos dañados o mal impresos
- Dashboard recomendado con métricas:
  - Tasa de éxito de check-ins por espacio
  - Tipos de errores más comunes (QR_INVALID, SPACE_MISMATCH, TIME_EXPIRED)
  - Espacios con alta tasa de fallos → prioridad para reimprimir QR
- Alertas automáticas si un espacio tiene >20% de fallos en check-in en últimas 24h

**Idempotencia del Job:**
- Query de actualización debe incluir `WHERE status = 'pending'` para prevenir dobles procesamiento
- Si job falla a mitad de ejecución, al re-ejecutarse solo procesará reservas que quedaron pendientes
- Usar transacciones con `READ_COMMITTED` para evitar dirty reads
- Test específico de idempotencia: ejecutar job dos veces consecutivas y verificar que segunda ejecución actualiza 0 registros

**Rollback Plan:**
- Feature flag puede agregarse fácilmente con propiedad `qr.checkin.enabled=true/false`
- Job puede deshabilitarse comentando `@Scheduled` annotation sin afectar funcionalidad existente
- Nuevos estados no afectan estados legacy (backward compatible)
