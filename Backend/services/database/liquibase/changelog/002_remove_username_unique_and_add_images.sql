SET @username_idx_exists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND index_name = 'username'
);
SET @drop_username_idx_sql := IF(
  @username_idx_exists > 0,
  'ALTER TABLE users DROP INDEX username',
  'SELECT 1'
);
PREPARE stmt_drop_username_idx FROM @drop_username_idx_sql;
EXECUTE stmt_drop_username_idx;
DEALLOCATE PREPARE stmt_drop_username_idx;

SET @spaces_image_col_exists := (
  SELECT COUNT(1)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'spaces'
    AND column_name = 'image_url'
);
SET @add_spaces_image_col_sql := IF(
  @spaces_image_col_exists = 0,
  'ALTER TABLE spaces ADD COLUMN image_url VARCHAR(500) NULL AFTER description',
  'SELECT 1'
);
PREPARE stmt_add_spaces_image_col FROM @add_spaces_image_col_sql;
EXECUTE stmt_add_spaces_image_col;
DEALLOCATE PREPARE stmt_add_spaces_image_col;

SET @equipments_image_col_exists := (
  SELECT COUNT(1)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'equipments'
    AND column_name = 'image_url'
);
SET @add_equipments_image_col_sql := IF(
  @equipments_image_col_exists = 0,
  'ALTER TABLE equipments ADD COLUMN image_url VARCHAR(500) NULL AFTER notes',
  'SELECT 1'
);
PREPARE stmt_add_equipments_image_col FROM @add_equipments_image_col_sql;
EXECUTE stmt_add_equipments_image_col;
DEALLOCATE PREPARE stmt_add_equipments_image_col;
