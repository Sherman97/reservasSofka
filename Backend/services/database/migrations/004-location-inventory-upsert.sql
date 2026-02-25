USE app_db;

-- 1) agrega updated_at si no existe
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'location_inventory'
    AND COLUMN_NAME = 'updated_at'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE location_inventory ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL AFTER created_at;',
  'SELECT \"Column updated_at already exists\" AS info;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) agrega UNIQUE(location_id, inventory_id) si no existe (intentará crear)
-- Si ya existe, te puede decir duplicate key name y no pasa nada grave.
ALTER TABLE location_inventory
  ADD UNIQUE KEY uq_location_inventory (location_id, inventory_id);
