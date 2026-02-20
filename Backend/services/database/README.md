# Database Service (Liquibase)

Este servicio aplica migraciones de base de datos usando Liquibase.

## Changelog principal
- `liquibase/changelog/db.changelog-master.yaml`

## Migracion inicial
- `liquibase/changelog/001_init_schema_v1.sql`

## Ejecucion
Se ejecuta desde `docker-compose` con la imagen oficial `liquibase/liquibase`.

## Flujo recomendado
1. Arranca MariaDB.
2. Corre este servicio de migracion (job one-shot).
3. Luego inician los microservicios (`auth`, `bookings`, `inventory`, `locations`, etc.).

## Nota
- No usa `DROP TABLE`.
- Los servicios Java deben mantenerse con `ddl-auto=none` (o `validate`) para evitar cambios de esquema automaticos.