-- QR Check-In Feature - Complete Migration Script
-- Execute this script to apply all QR-related database changes
-- Date: 2026-04-06

-- =============================================================================
-- MIGRATION 005: QR Check-In Support (Spaces + Reservations)
-- =============================================================================

-- Add QR-related fields to spaces table
ALTER TABLE spaces
ADD COLUMN IF NOT EXISTS qr_code BLOB NULL COMMENT 'QR code image (PNG binary)',
ADD COLUMN IF NOT EXISTS qr_token VARCHAR(500) NULL COMMENT 'JWT token embedded in QR code',
ADD COLUMN IF NOT EXISTS qr_etag VARCHAR(64) NULL COMMENT 'ETag hash (SHA-256) for cache validation';

-- Add index on qr_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_spaces_qr_token ON spaces(qr_token);

-- Add check-in related fields to reservations table
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS qr_token VARCHAR(500) NULL COMMENT 'QR token used for check-in (audit)',
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP NULL COMMENT 'Timestamp when user checked in (UTC)';

-- Add indexes for scheduled job optimization (CRITICAL for performance)
CREATE INDEX IF NOT EXISTS idx_reservations_status_start ON reservations(status, start_datetime);

-- =============================================================================
-- MIGRATION 006: Check-In Audit Logs Table
-- =============================================================================

-- Create table for check-in attempt logging (audit trail)
-- Note: No foreign keys for flexibility - this is an audit/logging table
CREATE TABLE IF NOT EXISTS reservation_checkin_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Log entry ID',
    reservation_id BIGINT NOT NULL COMMENT 'Reservation being checked in',
    user_id BIGINT NOT NULL COMMENT 'User attempting check-in',
    space_id BIGINT NOT NULL COMMENT 'Space associated with reservation',
    qr_token_prefix VARCHAR(10) NULL COMMENT 'First 10 chars of QR token (security)',
    success BOOLEAN NOT NULL COMMENT 'Whether check-in was successful',
    failure_reason VARCHAR(100) NULL COMMENT 'Reason code if failed (QR_INVALID, SPACE_MISMATCH, etc.)',
    attempt_at TIMESTAMP NOT NULL COMMENT 'Timestamp of check-in attempt (UTC)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time',
    
    -- Indexes for query performance
    INDEX idx_checkin_logs_reservation (reservation_id),
    INDEX idx_checkin_logs_user (user_id),
    INDEX idx_checkin_logs_space (space_id),
    INDEX idx_checkin_logs_attempt_at (attempt_at),
    INDEX idx_checkin_logs_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Audit log for all QR check-in attempts';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify spaces table has QR columns
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'spaces' 
  AND COLUMN_NAME IN ('qr_code', 'qr_token', 'qr_etag')
ORDER BY ORDINAL_POSITION;

-- Verify reservations table has check-in columns
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'reservations' 
  AND COLUMN_NAME IN ('qr_token', 'checked_in_at')
ORDER BY ORDINAL_POSITION;

-- Verify indexes exist
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND (
      (TABLE_NAME = 'spaces' AND INDEX_NAME = 'idx_spaces_qr_token')
      OR (TABLE_NAME = 'reservations' AND INDEX_NAME = 'idx_reservations_status_start')
  )
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Verify reservation_checkin_logs table exists
SHOW CREATE TABLE reservation_checkin_logs;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
SELECT 'QR Check-In migrations applied successfully!' AS Status;
