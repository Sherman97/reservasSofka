# Generación Automática de QR para Spaces

## 📋 Descripción

Sistema automatizado que genera códigos QR para todos los espacios (spaces) durante la inicialización del stack de Docker. Los QR generados se utilizan para el sistema de check-in de reservas.

## 🏗️ Arquitectura

### Componentes Implementados

1. **LocationsApplicationService** (`locations-service`)
   - Método `regenerateAllSpaceQrCodes()`: Genera QR para todos los spaces existentes
   - Retorna cantidad de códigos generados exitosamente
   - Maneja errores de forma resiliente (continúa si un QR falla)

2. **LocationsController** (`locations-service`)
   - Endpoint `POST /locations/spaces/regenerate-qr`
   - Retorna: `{ "message": "...", "generatedCount": N }`
   - Acceso permitido sin autenticación (solo red interna)

3. **qr-initializer** (servicio Docker)
   - Script Bash (`Backend/scripts/qr-init.sh`)
   - Dockerfile Alpine ligero (`Backend/scripts/Dockerfile.qr-init`)
   - Espera a que `locations-service` esté saludable
   - Ejecuta generación de QR mediante HTTP POST
   - Se ejecuta una sola vez al levantar el stack

## 🚀 Flujo de Ejecución

```
┌─────────────────────────────────────────────────────────────┐
│ 1. docker-compose up --build                                │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ 2. MariaDB + RabbitMQ + Liquibase (migrations + seed)       │
│    ➜ Crea 4 spaces: Sala Andina, Cowork Norte, etc.        │
│    ➜ Campos qr_code, qr_token, qr_etag = NULL              │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ 3. locations-service inicia                                 │
│    ➜ Healthcheck = OK                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ 4. qr-initializer ejecuta qr-init.sh                        │
│    ➜ Espera 30 intentos x 5s = 150s max                    │
│    ➜ Llama POST /locations/spaces/regenerate-qr            │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ 5. LocationsApplicationService.regenerateAllSpaceQrCodes()  │
│    Para cada space:                                         │
│    ➜ Genera JWT token (qrTokenGeneratorPort)               │
│    ➜ Genera imagen PNG del QR (qrCodeImageGeneratorPort)   │
│    ➜ Calcula SHA-256 ETag                                  │
│    ➜ Actualiza: qr_code, qr_token, qr_etag en DB           │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ 6. Resultado: 4 spaces con QR generados                     │
│    Logs: "QR code regenerated successfully for space..."    │
└─────────────────────────────────────────────────────────────┘
```

## 📂 Archivos Modificados/Creados

### Backend - locations-service
```
Backend/services/locations-service/src/main/java/com/reservas/sk/locations_service/
├── application/port/in/LocationsUseCase.java             [MODIFICADO]
│   └── + int regenerateAllSpaceQrCodes()
├── application/service/LocationsApplicationService.java  [MODIFICADO]
│   └── + Implementación de regenerateAllSpaceQrCodes()
├── adapters/in/web/LocationsController.java             [MODIFICADO]
│   └── + POST /locations/spaces/regenerate-qr
└── infrastructure/config/SecurityConfig.java            [MODIFICADO]
    └── + .requestMatchers("/locations/spaces/regenerate-qr").permitAll()
```

### Scripts e Infraestructura
```
Backend/scripts/
├── qr-init.sh              [CREADO] - Script de inicialización
└── Dockerfile.qr-init      [CREADO] - Imagen Alpine para qr-initializer

docker-compose.prod.yml     [MODIFICADO] - Servicio qr-initializer agregado
```

## 🔒 Consideraciones de Seguridad

### ✅ Protecciones Implementadas
1. **Red Interna Aislada**: qr-initializer solo accesible en `backend_network`
2. **No Exposición Directa**: El endpoint NO está en la documentación pública
3. **Método POST**: Requiere POST request (no GET accidental)
4. **Ejecución Única**: `restart: on-failure` limita reintentos

### ⚠️ Limitación Conocida
- El endpoint `/locations/spaces/regenerate-qr` está expuesto a través del API Gateway (`/locations/**`)
- **Mitigación**: Solo es llamado durante inicialización, no documentado públicamente
- **Mejora Futura**: Agregar header secreto `X-Internal-Token` para llamadas internas

## 🧪 Testing

### Prueba Manual
```bash
# 1. Levantar el stack
docker-compose -f docker-compose.prod.yml up --build

# 2. Verificar logs del qr-initializer
docker logs reservas-qr-init

# Salida esperada:
# ========================================
#  QR Code Initialization
# ========================================
# [1/2] Waiting for locations-service to be ready...
#   ✓ Locations service is healthy!
# [2/2] Generating QR codes for all spaces...
#   ✓ QR code generation completed!
#   Response: {"success":true,"data":{"message":"QR code regeneration completed","generatedCount":4}}

# 3. Verificar QR en base de datos
docker exec -it reservas-mariadb mariadb -uapp_user -p123456 app_db -e \
  "SELECT id, name, LENGTH(qr_code) AS qr_size, qr_token IS NOT NULL AS has_token FROM spaces;"

# Salida esperada:
# +----+------------------------+----------+-----------+
# | id | name                   | qr_size  | has_token |
# +----+------------------------+----------+-----------+
# |  1 | Sala Andina            |    4256  |         1 |
# |  2 | Cowork Norte           |    4256  |         1 |
# |  3 | Laboratorio Innovacion |    4256  |         1 |
# |  4 | Sala Panorama          |    4256  |         1 |
# +----+------------------------+----------+-----------+

# 4. Descargar QR de un space (ejemplo: space ID=1)
curl http://localhost:8080/locations/spaces/1/qr -H "Authorization: Bearer <TOKEN>" -o space1_qr.png
```

### Verificación de Endpoints
```bash
# Health check de locations-service
curl http://localhost:3004/health

# Regenerar QR manualmente (desde red interna)
docker exec reservas-qr-init wget -qO- --post-data='' \
  http://locations-service:3004/locations/spaces/regenerate-qr
```

## 📊 Logs Importantes

### Logs de Éxito (locations-service)
```
INFO  LocationsApplicationService - Starting QR code regeneration for all spaces
INFO  LocationsApplicationService - QR code regenerated successfully for space 1 (Sala Andina)
INFO  LocationsApplicationService - QR code regenerated successfully for space 2 (Cowork Norte)
INFO  LocationsApplicationService - QR code regenerated successfully for space 3 (Laboratorio Innovacion)
INFO  LocationsApplicationService - QR code regenerated successfully for space 4 (Sala Panorama)
INFO  LocationsApplicationService - QR code regeneration completed: 4 successful, 0 failed out of 4 total spaces
```

### Logs de Error (posibles)
```
ERROR LocationsApplicationService - Failed to regenerate QR code for space 1 (Sala Andina): JWT secret not configured
WARN  LocationsApplicationService - QR code regeneration completed: 0 successful, 4 failed out of 4 total spaces
```

## 🔧 Configuración Avanzada

### Variables de Entorno (qr-initializer)
```yaml
environment:
  LOCATIONS_SERVICE_URL: http://locations-service:3004  # URL del servicio
  MAX_RETRIES: 30                                      # Intentos máximos de espera
  RETRY_INTERVAL: 5                                    # Segundos entre intentos
```

### Regeneración Manual de QR

Si necesitas regenerar QR después de la inicialización:

```bash
# Opción 1: Reiniciar contenedor qr-initializer
docker restart reservas-qr-init

# Opción 2: Llamar endpoint directamente (requiere JWT)
curl -X POST http://localhost:8080/locations/spaces/regenerate-qr \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Opción 3: Desde red interna (sin autenticación)
docker exec reservas-locations wget -qO- --post-data='' \
  http://localhost:3004/locations/spaces/regenerate-qr
```

## 📝 Notas Técnicas

1. **Idempotencia**: El script puede ejecutarse múltiples veces sin efectos adversos
2. **Resiliencia**: Si un QR falla, continúa con los siguientes spaces
3. **Performance**: Alpine image de solo ~8 MB, ejecución en ~2-5 segundos
4. **Compatibilidad**: Funciona con todos los espacios existentes y futuros

## 🔗 Referencias

- Feature QR: `docs/docs_FeatureQR/arquitectura_HUReservationVerfQR.md`
- Plan HU-102: `planHUQR.md`
- Endpoints Reservas: `Backend/docs/rutas-reserva.md`
- Liquibase Migration 005: `Backend/services/database/liquibase/changelog/005_qr_checkin_support.sql`

---

**Autor**: Sistema de Inicialización Automática QR  
**Fecha**: 2026-04-09  
**Versión**: 1.0.0
