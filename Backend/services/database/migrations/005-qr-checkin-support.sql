-- Migration: Add QR check-in support
-- Description: Adds QR code fields to spaces table and check-in fields to reservations table
-- Author: QR Feature Implementation
-- Date: 2026-04-01

-- Add QR-related fields to spaces table
ALTER TABLE spaces
ADD COLUMN qr_code BLOB NULL COMMENT 'QR code image (PNG binary)',
ADD COLUMN qr_token VARCHAR(500) NULL COMMENT 'JWT token embedded in QR code',
ADD COLUMN qr_etag VARCHAR(64) NULL COMMENT 'ETag hash (SHA-256) for cache validation';

-- Add index on qr_token for faster lookups
CREATE INDEX idx_spaces_qr_token ON spaces(qr_token);

-- Add check-in related fields to reservations table
ALTER TABLE reservations
ADD COLUMN qr_token VARCHAR(500) NULL COMMENT 'QR token used for check-in (audit)',
ADD COLUMN checked_in_at TIMESTAMP NULL COMMENT 'Timestamp when user checked in (UTC)';

-- Add indexes for scheduled job optimization
CREATE INDEX idx_reservations_status_start ON reservations(status, start_datetime);

-- Note: No data migration needed as these are new optional fields
-- Existing spaces will have NULL qr_code until regenerated
-- Existing reservations will have NULL qr_token and checked_in_at
