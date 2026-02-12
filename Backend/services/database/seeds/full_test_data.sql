-- ============================================================
-- SCRIPT DE DATOS DE PRUEBA (SEED)
-- DB: reservas_db (o app_db segun configuracion)
-- Este script limpia las tablas (opcional) e inserta datos consistentes.
-- ============================================================

USE app_db;

-- Desactivar chequeo de llaves foraneas para permitir truncates
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas (Opcional: puedes comentar esto si quieres preservar datos y usar INSERT IGNORE)
TRUNCATE TABLE booking_inventory;
TRUNCATE TABLE location_inventory;
TRUNCATE TABLE bookings;
TRUNCATE TABLE inventory;
TRUNCATE TABLE locations;
TRUNCATE TABLE users;

-- Reactivar chequeo
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. USUARIOS
-- ============================================================
INSERT INTO users (id, username, email, password, created_at) VALUES 
(1, 'admin', 'admin@sofka.com', '$2b$10$Pk/2...hash...pass', NOW()),  -- Password placeholder
(2, 'jdoe', 'john.doe@sofka.com', '$2b$10$Pk/2...hash...pass', NOW()),
(3, 'asmith', 'alice.smith@sofka.com', '$2b$10$Pk/2...hash...pass', NOW()),
(4, 'bwayne', 'bruce.wayne@sofka.com', '$2b$10$Pk/2...hash...pass', NOW());

-- ============================================================
-- 2. LOCACIONES (Salas / Espacios)
-- ============================================================
INSERT INTO locations (id, name, address, created_at) VALUES 
(1, 'Sala de Juntas Principal', 'Piso 3, Torre A', NOW()),
(2, 'Sala Creativa', 'Piso 2, Torre B', NOW()),
(3, 'Auditorio General', 'Planta Baja, Edificio Central', NOW()),
(4, 'Laboratorio de Innovación', 'Piso 4, Torre A', NOW());

-- ============================================================
-- 3. INVENTARIO (Equipos)
-- ============================================================
-- Nota: is_reservable se agrego en migracion 003
INSERT INTO inventory (id, name, type, status, is_reservable, created_at) VALUES 
(1, 'Proyector 4K', 'Tecnología', 'available', 1, NOW()),
(2, 'Pizarra Interactiva', 'Mobiliario', 'available', 1, NOW()),
(3, 'Sistema de Audio 5.1', 'Audio', 'available', 1, NOW()),
(4, 'Laptop Presentación', 'Computo', 'maintenance', 1, NOW()), -- En mantenimiento
(5, 'Silla Ergonómica Premium', 'Mobiliario', 'available', 0, NOW()), -- No reservable individualmente
(6, 'Cable HDMI 5m', 'Accesorio', 'available', 1, NOW());

-- ============================================================
-- 4. INVENTARIO POR LOCACION (Stock)
-- ============================================================
-- Asigna equipos a las salas
INSERT INTO location_inventory (location_id, inventory_id, qty, created_at) VALUES 
(1, 1, 1, NOW()), -- Sala Juntas tiene 1 Proyector
(1, 2, 1, NOW()), -- Sala Juntas tiene 1 Pizarra
(2, 2, 1, NOW()), -- Sala Creativa tiene 1 Pizarra
(3, 1, 2, NOW()), -- Auditorio tiene 2 Proyectores
(3, 3, 1, NOW()), -- Auditorio tiene Sonido
(4, 4, 5, NOW()), -- Lab tiene 5 Laptops
(4, 6, 10, NOW()); -- Lab tiene 10 Cables HDMI

-- ============================================================
-- 5. RESERVAS (Bookings)
-- ============================================================
-- Fechas relativas o fijas para 2026. Usaremos FECHAS FIJAS para consistencia visual.
-- Asumimos fecha actual aprox Febrero 2026.

INSERT INTO bookings (id, user_id, location_id, start_time, end_time, status, created_at) VALUES 
-- Reserva Pasada (Completada/Confirmada)
(1, 2, 1, '2026-02-10 09:00:00', '2026-02-10 11:00:00', 'confirmed', NOW()),

-- Reserva Futura Confirmada (John Doe en Sala Creativa)
(2, 2, 2, '2026-02-20 14:00:00', '2026-02-20 16:00:00', 'confirmed', NOW()),

-- Reserva Futura Pendiente (Alice Smith en Auditorio)
(3, 3, 3, '2026-02-25 08:00:00', '2026-02-25 12:00:00', 'pending', NOW()),

-- Reserva Cancelada (Bruce Wayne en Sala Juntas)
(4, 4, 1, '2026-02-22 10:00:00', '2026-02-22 11:00:00', 'cancelled', NOW()),

-- Reserva Conflicto Potencial (para pruebas de validacion) - Mismo horario que #2 pero otra sala (OK)
(5, 3, 1, '2026-02-20 14:00:00', '2026-02-20 16:00:00', 'pending', NOW());

-- ============================================================
-- 6. RESERVAS DE INVENTARIO (Items solcitados en reserva)
-- ============================================================
INSERT INTO booking_inventory (booking_id, inventory_id, qty) VALUES 
(1, 1, 1), -- Reserva 1 usó el Proyector (id 1)
(2, 2, 1), -- Reserva 2 solicita Pizarra (id 2)
(3, 1, 2), -- Reserva 3 solicita 2 Proyectores (id 1)
(3, 3, 1); -- Reserva 3 solicita Audio (id 3)

-- Fin del script
SELECT 'Datos de prueba insertados exitosamente' AS Resultado;
