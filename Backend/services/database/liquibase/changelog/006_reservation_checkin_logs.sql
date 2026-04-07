-- Migration: Add check-in audit logs table
-- Description: Creates table to track all check-in attempts (successful and failed) for security auditing
-- Author: QR Feature Implementation - Phase 2
-- Date: 2026-04-06

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

-- Note: This table is append-only for security auditing
-- Failed attempts are logged with failure_reason for analysis
-- Successful attempts are logged with success=true and failure_reason=NULL
