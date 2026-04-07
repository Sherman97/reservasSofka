# Migraciones de Base de Datos - Feature QR Check-In

## Resumen

Se necesitan **2 migraciones** para soportar el feature de QR Check-In:

| Migración | Descripción | Tablas Afectadas |
|-----------|-------------|------------------|
| **005-qr-checkin-support.sql** | Campos QR en espacios y reservas + índices | `spaces`, `reservations` |
| **006-reservation-checkin-logs.sql** | Tabla de auditoría de check-ins | `reservation_checkin_logs` (nueva) |

---

## Opción 1: Aplicar Migraciones Individualmente

### Migración 005: QR Support
```bash
# Desde el directorio Backend/services/database/migrations/
mysql -u root -p reservas_db < 005-qr-checkin-support.sql
```

**Cambios aplicados**:
- ✅ `spaces.qr_code` (BLOB) - Imagen QR en PNG
- ✅ `spaces.qr_token` (VARCHAR 500) - JWT token del QR
- ✅ `spaces.qr_etag` (VARCHAR 64) - Hash SHA-256 para cache
- ✅ Índice `idx_spaces_qr_token`
- ✅ `reservations.qr_token` (VARCHAR 500) - Token usado en check-in (auditoría)
- ✅ `reservations.checked_in_at` (TIMESTAMP) - Timestamp de check-in
- ✅ Índice `idx_reservations_status_start` (CRÍTICO para performance del job)

### Migración 006: Check-In Logs
```bash
mysql -u root -p reservas_db < 006-reservation-checkin-logs.sql
```

**Tabla creada**: `reservation_checkin_logs`

Campos:
- `id` - PK autoincremental
- `reservation_id` - FK a reservations
- `user_id` - FK a users
- `space_id` - FK a spaces
- `qr_token_prefix` - Primeros 10 chars del token (seguridad)
- `success` - Boolean (éxito/fallo)
- `failure_reason` - Código de error si falló
- `attempt_at` - Timestamp del intento (UTC)
- `created_at` - Timestamp de creación del registro

---

## Opción 2: Aplicar Todas las Migraciones (Recomendado)

Usa el script consolidado que aplica ambas migraciones y verifica:

```bash
mysql -u root -p reservas_db < apply-qr-migrations.sql
```

Este script:
1. ✅ Aplica migración 005
2. ✅ Aplica migración 006
3. ✅ Verifica columnas creadas
4. ✅ Verifica índices creados
5. ✅ Verifica tabla de logs creada
6. ✅ Muestra mensaje de éxito

---

## Verificación Manual

### Verificar campos en `spaces`
```sql
DESCRIBE spaces;
-- Debes ver: qr_code, qr_token, qr_etag
```

### Verificar campos en `reservations`
```sql
DESCRIBE reservations;
-- Debes ver: qr_token, checked_in_at
```

### Verificar índices críticos
```sql
SHOW INDEX FROM spaces WHERE Key_name = 'idx_spaces_qr_token';
SHOW INDEX FROM reservations WHERE Key_name = 'idx_reservations_status_start';
```

### Verificar tabla de logs
```sql
DESCRIBE reservation_checkin_logs;
SELECT COUNT(*) FROM reservation_checkin_logs; -- Debe ser 0 inicialmente
```

---

## Rollback (Si es necesario)

### Rollback Migración 006
```sql
DROP TABLE IF EXISTS reservation_checkin_logs;
```

### Rollback Migración 005
```sql
-- Eliminar columnas de spaces
ALTER TABLE spaces 
DROP COLUMN IF EXISTS qr_code,
DROP COLUMN IF EXISTS qr_token,
DROP COLUMN IF EXISTS qr_etag;

-- Eliminar índice de spaces
DROP INDEX IF EXISTS idx_spaces_qr_token ON spaces;

-- Eliminar columnas de reservations
ALTER TABLE reservations
DROP COLUMN IF EXISTS qr_token,
DROP COLUMN IF EXISTS checked_in_at;

-- Eliminar índice de reservations
DROP INDEX IF EXISTS idx_reservations_status_start ON reservations;
```

---

## Impacto en Datos Existentes

### Espacios Existentes
- Los espacios creados antes de la migración tendrán `qr_code = NULL`
- Se generarán QR codes automáticamente cuando:
  - Se cree un nuevo espacio
  - O se actualice un espacio existente (futura feature)

### Reservas Existentes
- Las reservas existentes tendrán `qr_token = NULL` y `checked_in_at = NULL`
- Solo las nuevas reservas con check-in por QR tendrán estos campos poblados

### Logs de Check-In
- Tabla nueva, empezará vacía
- Se poblará con cada intento de check-in (éxito o fallo)

---

## Consideraciones de Performance

### Índice CRÍTICO: `idx_reservations_status_start`

Este índice es **esencial** para el `ReservationMonitorJob`:

```sql
-- Query que ejecuta el job cada 60 segundos
SELECT * FROM reservations
WHERE status = 'pending'
  AND start_datetime < (CURRENT_TIMESTAMP - INTERVAL 5 MINUTE);
```

**Sin el índice**:
- Full table scan en cada ejecución
- Performance degradada con >1000 reservas

**Con el índice**:
- Lookup directo en el índice
- Performance constante O(log n)

**Verificar uso del índice**:
```sql
EXPLAIN SELECT * FROM reservations
WHERE status = 'pending'
  AND start_datetime < (NOW() - INTERVAL 5 MINUTE);
```

Debe mostrar: `key: idx_reservations_status_start`

---

## Estado de Aplicación

Marca cuando apliques cada migración:

- [ ] **Migración 005** - QR support (spaces + reservations)
- [ ] **Migración 006** - Check-in audit logs table
- [ ] **Verificación** - Todos los índices y campos creados
- [ ] **Testing** - Backend tests pasando con BD actualizada

---

## Comandos Docker (Si usas docker-compose)

```bash
# Opción A: Ejecutar desde contenedor MySQL
docker exec -i reservas-db mysql -uroot -p[PASSWORD] reservas_db < apply-qr-migrations.sql

# Opción B: Copiar archivo y ejecutar dentro del contenedor
docker cp apply-qr-migrations.sql reservas-db:/tmp/
docker exec -it reservas-db mysql -uroot -p
# Dentro de MySQL:
USE reservas_db;
SOURCE /tmp/apply-qr-migrations.sql;
```

---

## Troubleshooting

### Error: "Table/column already exists"
✅ **Normal** - Las migraciones usan `IF NOT EXISTS` y `ADD COLUMN IF NOT EXISTS`  
✅ Puedes ejecutarlas múltiples veces sin problemas (idempotentes)

### Error: "Foreign key constraint fails"
⚠️ Verifica que las tablas referenciadas (`users`, `spaces`, `reservations`) existan  
⚠️ Ejecuta las migraciones base primero (001, 002, 003, 004)

### Error: "Unknown column"
⚠️ Asegúrate de aplicar migración 005 antes que 006  
⚠️ La tabla `reservation_checkin_logs` depende de `reservations` existente

---

## Siguiente Paso

Después de aplicar las migraciones:

1. ✅ Reiniciar el backend para que detecte las nuevas columnas
2. ✅ Ejecutar tests: `.\gradlew.bat :bookings-service:test`
3. ✅ Verificar logs del `ReservationMonitorJob` en ejecución
4. ✅ Crear un espacio y verificar que genere QR automáticamente

🎉 **¡Feature QR Check-In completamente funcional!**
