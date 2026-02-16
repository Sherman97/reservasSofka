-- ============================================================
-- Sistema de Reservas - Esquema (MariaDB / MySQL)
-- Basado en el PRIMER DISEÑO (users, cities, spaces, equipments,
-- reservations, reservation_equipments)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- USERS
-- ============================================================
DROP TABLE IF EXISTS reservation_equipments;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS equipments;
DROP TABLE IF EXISTS spaces;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CITIES
-- ============================================================
CREATE TABLE cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  country VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cities_name_country (name, country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SPACES
-- ============================================================
CREATE TABLE spaces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  capacity INT NULL,
  floor VARCHAR(30) NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_spaces_city_name (city_id, name),
  KEY idx_spaces_city_active (city_id, is_active),

  CONSTRAINT fk_spaces_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- EQUIPMENTS
-- ============================================================
CREATE TABLE equipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  serial VARCHAR(120) UNIQUE,
  barcode VARCHAR(120) UNIQUE,
  model VARCHAR(120) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'available', -- available, maintenance, retired
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_equipments_city_status (city_id, status),
  KEY idx_equipments_status (status),

  CONSTRAINT fk_equipments_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  space_id INT NOT NULL,
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled
  title VARCHAR(150) NULL,
  attendees_count INT NULL,
  notes TEXT NULL,
  cancellation_reason TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_reservations_space_time (space_id, start_datetime, end_datetime),
  KEY idx_reservations_user (user_id),
  KEY idx_reservations_status (status),
  KEY idx_reservations_date_status (start_datetime, status),

  CONSTRAINT fk_reservations_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT fk_reservations_space
    FOREIGN KEY (space_id) REFERENCES spaces(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- RESERVATION_EQUIPMENTS (equipos solicitados/track por reserva)
-- ============================================================
CREATE TABLE reservation_equipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  equipment_id INT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'requested', -- requested, confirmed, delivered, returned, damaged

  delivered_at TIMESTAMP NULL,
  delivered_by INT NULL,  -- FK users.id (SET NULL)
  returned_at TIMESTAMP NULL,
  returned_by INT NULL,   -- FK users.id (SET NULL)

  condition_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_reservation_equipment (reservation_id, equipment_id),
  KEY idx_res_eq_equipment_status (equipment_id, status),
  KEY idx_res_eq_reservation (reservation_id),
  KEY idx_res_eq_delivered_by (delivered_by),
  KEY idx_res_eq_returned_by (returned_by),

  CONSTRAINT fk_res_eq_reservation
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT fk_res_eq_equipment
    FOREIGN KEY (equipment_id) REFERENCES equipments(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT fk_res_eq_delivered_by
    FOREIGN KEY (delivered_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,

  CONSTRAINT fk_res_eq_returned_by
    FOREIGN KEY (returned_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Nota:
-- Para evitar "overbooking" (reservas solapadas) en un mismo espacio,
-- esto normalmente se valida en la lógica del servicio (app/backend)
-- con una consulta tipo:
--   WHERE space_id = ? AND start < new_end AND end > new_start
-- ============================================================
