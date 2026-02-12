USE app_db;

-- Agrega la columna is_reservable si NO existe
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'inventory'
    AND COLUMN_NAME = 'is_reservable'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE inventory ADD COLUMN is_reservable TINYINT(1) NOT NULL DEFAULT 1 AFTER status;',
  'SELECT \"Column is_reservable already exists\" AS info;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
