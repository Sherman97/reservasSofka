-- ============================================================
-- MIGRACION 002 (SAFE): stock por locacion + qty en booking_inventory
-- DB: app_db
-- ============================================================

USE app_db;

-- 1) Agregar qty a booking_inventory si NO existe
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'booking_inventory'
    AND COLUMN_NAME = 'qty'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE booking_inventory ADD COLUMN qty INT NOT NULL DEFAULT 1;',
  'SELECT \"qty already exists\" AS info;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Crear tabla location_inventory (safe por IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS location_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id INT NOT NULL,
  inventory_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uniq_loc_inv (location_id, inventory_id),
  CONSTRAINT fk_locinv_location
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  CONSTRAINT fk_locinv_inventory
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE RESTRICT
);

-- 3) Indexes (SAFE)
-- idx_bookings_location_time
SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'bookings'
    AND INDEX_NAME = 'idx_bookings_location_time'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_bookings_location_time ON bookings(location_id, start_time, end_time, status);',
  'SELECT \"idx_bookings_location_time already exists\" AS info;'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- idx_booking_inventory_inv
SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'booking_inventory'
    AND INDEX_NAME = 'idx_booking_inventory_inv'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_booking_inventory_inv ON booking_inventory(inventory_id);',
  'SELECT \"idx_booking_inventory_inv already exists\" AS info;'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- idx_location_inventory_loc
SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'location_inventory'
    AND INDEX_NAME = 'idx_location_inventory_loc'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_location_inventory_loc ON location_inventory(location_id);',
  'SELECT \"idx_location_inventory_loc already exists\" AS info;'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
