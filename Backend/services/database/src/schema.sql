CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status ENUM('available', 'maintenance') DEFAULT 'available',
    is_reservable TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    /* Una locacion podra tener multiples reservas en distintos fechas/horarios mas no en la misma */
    CONSTRAINT unique_booking_in_timeslot UNIQUE (location_id, start_time, end_time) 
    /* Nota: Esta restricción unique es simple. Para validación completa de rangos se requiere lógica en aplicación o triggers */
);

CREATE INDEX IF NOT EXISTS idx_bookings_location_time ON bookings(location_id, start_time, end_time, status);

CREATE TABLE IF NOT EXISTS booking_inventory (
    booking_id INT NOT NULL,
    inventory_id INT NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    PRIMARY KEY (booking_id, inventory_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

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

CREATE INDEX IF NOT EXISTS idx_location_inventory_loc ON location_inventory(location_id);
