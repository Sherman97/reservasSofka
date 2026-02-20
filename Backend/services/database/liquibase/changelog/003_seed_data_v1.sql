-- Seed base: 4 registros por tabla principal, manteniendo relaciones coherentes.

-- USERS (4)
INSERT INTO users (username, email, password_hash)
SELECT 'Juan Perez', 'juan.perez@demo.local', '$2a$10$7QJ5fI4Vw4l0nM5A0y5VkuY8uAiJfQ0G5m4wB0U1LwVf5fQxU7k2y'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'juan.perez@demo.local');

INSERT INTO users (username, email, password_hash)
SELECT 'Ana Gomez', 'ana.gomez@demo.local', '$2a$10$7QJ5fI4Vw4l0nM5A0y5VkuY8uAiJfQ0G5m4wB0U1LwVf5fQxU7k2y'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ana.gomez@demo.local');

INSERT INTO users (username, email, password_hash)
SELECT 'Carlos Ruiz', 'carlos.ruiz@demo.local', '$2a$10$7QJ5fI4Vw4l0nM5A0y5VkuY8uAiJfQ0G5m4wB0U1LwVf5fQxU7k2y'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'carlos.ruiz@demo.local');

INSERT INTO users (username, email, password_hash)
SELECT 'Maria Lopez', 'maria.lopez@demo.local', '$2a$10$7QJ5fI4Vw4l0nM5A0y5VkuY8uAiJfQ0G5m4wB0U1LwVf5fQxU7k2y'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'maria.lopez@demo.local');

-- CITIES (4)
INSERT INTO cities (name, country)
SELECT 'Bogota', 'Colombia'
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'Bogota' AND country = 'Colombia');

INSERT INTO cities (name, country)
SELECT 'Medellin', 'Colombia'
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'Medellin' AND country = 'Colombia');

INSERT INTO cities (name, country)
SELECT 'Lima', 'Peru'
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'Lima' AND country = 'Peru');

INSERT INTO cities (name, country)
SELECT 'Quito', 'Ecuador'
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = 'Quito' AND country = 'Ecuador');

-- SPACES (4)
INSERT INTO spaces (city_id, name, capacity, floor, description, image_url, is_active)
SELECT c.id, 'Sala Andina', 12, '3', 'Sala para reuniones ejecutivas', 'https://picsum.photos/seed/sala-andina/900/600', TRUE
FROM cities c
WHERE c.name = 'Bogota' AND c.country = 'Colombia'
  AND NOT EXISTS (SELECT 1 FROM spaces s WHERE s.city_id = c.id AND s.name = 'Sala Andina')
LIMIT 1;

INSERT INTO spaces (city_id, name, capacity, floor, description, image_url, is_active)
SELECT c.id, 'Cowork Norte', 20, '5', 'Espacio abierto para trabajo colaborativo', 'https://picsum.photos/seed/cowork-norte/900/600', TRUE
FROM cities c
WHERE c.name = 'Medellin' AND c.country = 'Colombia'
  AND NOT EXISTS (SELECT 1 FROM spaces s WHERE s.city_id = c.id AND s.name = 'Cowork Norte')
LIMIT 1;

INSERT INTO spaces (city_id, name, capacity, floor, description, image_url, is_active)
SELECT c.id, 'Laboratorio Innovacion', 8, '2', 'Area para sesiones de prototipado', 'https://picsum.photos/seed/lab-innovacion/900/600', TRUE
FROM cities c
WHERE c.name = 'Lima' AND c.country = 'Peru'
  AND NOT EXISTS (SELECT 1 FROM spaces s WHERE s.city_id = c.id AND s.name = 'Laboratorio Innovacion')
LIMIT 1;

INSERT INTO spaces (city_id, name, capacity, floor, description, image_url, is_active)
SELECT c.id, 'Sala Panorama', 16, '7', 'Sala con vista para sesiones de equipo', 'https://picsum.photos/seed/sala-panorama/900/600', TRUE
FROM cities c
WHERE c.name = 'Quito' AND c.country = 'Ecuador'
  AND NOT EXISTS (SELECT 1 FROM spaces s WHERE s.city_id = c.id AND s.name = 'Sala Panorama')
LIMIT 1;

-- EQUIPMENTS (4)
INSERT INTO equipments (city_id, name, serial, barcode, model, status, notes, image_url)
SELECT c.id, 'Proyector Epson', 'SER-PRO-001', 'BC-PRO-001', 'Epson X200', 'available', 'Equipo en excelente estado', 'https://picsum.photos/seed/proyector-epson/900/600'
FROM cities c
WHERE c.name = 'Bogota' AND c.country = 'Colombia'
  AND NOT EXISTS (SELECT 1 FROM equipments e WHERE e.serial = 'SER-PRO-001')
LIMIT 1;

INSERT INTO equipments (city_id, name, serial, barcode, model, status, notes, image_url)
SELECT c.id, 'Camara Logitech', 'SER-CAM-001', 'BC-CAM-001', 'Logitech C920', 'available', 'Ideal para videollamadas', 'https://picsum.photos/seed/camara-logitech/900/600'
FROM cities c
WHERE c.name = 'Medellin' AND c.country = 'Colombia'
  AND NOT EXISTS (SELECT 1 FROM equipments e WHERE e.serial = 'SER-CAM-001')
LIMIT 1;

INSERT INTO equipments (city_id, name, serial, barcode, model, status, notes, image_url)
SELECT c.id, 'Speaker JBL', 'SER-SPK-001', 'BC-SPK-001', 'JBL Flip 6', 'maintenance', 'Pendiente cambio de bateria', 'https://picsum.photos/seed/speaker-jbl/900/600'
FROM cities c
WHERE c.name = 'Lima' AND c.country = 'Peru'
  AND NOT EXISTS (SELECT 1 FROM equipments e WHERE e.serial = 'SER-SPK-001')
LIMIT 1;

INSERT INTO equipments (city_id, name, serial, barcode, model, status, notes, image_url)
SELECT c.id, 'Pantalla Samsung', 'SER-SCR-001', 'BC-SCR-001', 'Samsung Smart 55', 'retired', 'Equipo dado de baja por renovacion', 'https://picsum.photos/seed/pantalla-samsung/900/600'
FROM cities c
WHERE c.name = 'Quito' AND c.country = 'Ecuador'
  AND NOT EXISTS (SELECT 1 FROM equipments e WHERE e.serial = 'SER-SCR-001')
LIMIT 1;

-- RESERVATIONS (4)
INSERT INTO reservations (user_id, space_id, start_datetime, end_datetime, status, title, attendees_count, notes, cancellation_reason)
SELECT u.id, s.id, '2026-03-10 09:00:00', '2026-03-10 10:00:00', 'confirmed', 'Daily standup tecnologia', 8, 'Reunion diaria de seguimiento', NULL
FROM users u
JOIN spaces s ON s.name = 'Sala Andina'
JOIN cities c ON c.id = s.city_id AND c.name = 'Bogota' AND c.country = 'Colombia'
WHERE u.email = 'juan.perez@demo.local'
  AND NOT EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.user_id = u.id
      AND r.space_id = s.id
      AND r.start_datetime = '2026-03-10 09:00:00'
  )
LIMIT 1;

INSERT INTO reservations (user_id, space_id, start_datetime, end_datetime, status, title, attendees_count, notes, cancellation_reason)
SELECT u.id, s.id, '2026-03-11 14:00:00', '2026-03-11 15:30:00', 'pending', 'Workshop producto Q2', 12, 'Preparacion roadmap trimestral', NULL
FROM users u
JOIN spaces s ON s.name = 'Cowork Norte'
JOIN cities c ON c.id = s.city_id AND c.name = 'Medellin' AND c.country = 'Colombia'
WHERE u.email = 'ana.gomez@demo.local'
  AND NOT EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.user_id = u.id
      AND r.space_id = s.id
      AND r.start_datetime = '2026-03-11 14:00:00'
  )
LIMIT 1;

INSERT INTO reservations (user_id, space_id, start_datetime, end_datetime, status, title, attendees_count, notes, cancellation_reason)
SELECT u.id, s.id, '2026-03-12 11:00:00', '2026-03-12 12:00:00', 'completed', 'Demo cliente regional', 6, 'Sesion de demostracion comercial', NULL
FROM users u
JOIN spaces s ON s.name = 'Laboratorio Innovacion'
JOIN cities c ON c.id = s.city_id AND c.name = 'Lima' AND c.country = 'Peru'
WHERE u.email = 'carlos.ruiz@demo.local'
  AND NOT EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.user_id = u.id
      AND r.space_id = s.id
      AND r.start_datetime = '2026-03-12 11:00:00'
  )
LIMIT 1;

INSERT INTO reservations (user_id, space_id, start_datetime, end_datetime, status, title, attendees_count, notes, cancellation_reason)
SELECT u.id, s.id, '2026-03-13 16:00:00', '2026-03-13 17:00:00', 'cancelled', 'Sesion financiera semanal', 5, 'Cancelada por cambio de agenda', 'Reprogramada para la proxima semana'
FROM users u
JOIN spaces s ON s.name = 'Sala Panorama'
JOIN cities c ON c.id = s.city_id AND c.name = 'Quito' AND c.country = 'Ecuador'
WHERE u.email = 'maria.lopez@demo.local'
  AND NOT EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.user_id = u.id
      AND r.space_id = s.id
      AND r.start_datetime = '2026-03-13 16:00:00'
  )
LIMIT 1;

-- RESERVATION_EQUIPMENTS (4)
INSERT INTO reservation_equipments (
  reservation_id,
  equipment_id,
  status,
  delivered_at,
  delivered_by,
  returned_at,
  returned_by,
  condition_notes
)
SELECT r.id, e.id, 'confirmed', NULL, NULL, NULL, NULL, 'Reservado y confirmado'
FROM reservations r
JOIN users u ON u.id = r.user_id
JOIN spaces s ON s.id = r.space_id
JOIN equipments e ON e.serial = 'SER-PRO-001'
WHERE u.email = 'juan.perez@demo.local'
  AND s.name = 'Sala Andina'
  AND r.start_datetime = '2026-03-10 09:00:00'
  AND NOT EXISTS (SELECT 1 FROM reservation_equipments re WHERE re.reservation_id = r.id AND re.equipment_id = e.id)
LIMIT 1;

INSERT INTO reservation_equipments (
  reservation_id,
  equipment_id,
  status,
  delivered_at,
  delivered_by,
  returned_at,
  returned_by,
  condition_notes
)
SELECT r.id, e.id, 'delivered', '2026-03-11 13:50:00', du.id, NULL, NULL, 'Entregado antes del inicio de la sesion'
FROM reservations r
JOIN users u ON u.id = r.user_id
JOIN spaces s ON s.id = r.space_id
JOIN equipments e ON e.serial = 'SER-CAM-001'
JOIN users du ON du.email = 'juan.perez@demo.local'
WHERE u.email = 'ana.gomez@demo.local'
  AND s.name = 'Cowork Norte'
  AND r.start_datetime = '2026-03-11 14:00:00'
  AND NOT EXISTS (SELECT 1 FROM reservation_equipments re WHERE re.reservation_id = r.id AND re.equipment_id = e.id)
LIMIT 1;

INSERT INTO reservation_equipments (
  reservation_id,
  equipment_id,
  status,
  delivered_at,
  delivered_by,
  returned_at,
  returned_by,
  condition_notes
)
SELECT r.id, e.id, 'returned', '2026-03-12 10:50:00', du.id, '2026-03-12 12:10:00', ru.id, 'Devuelto sin novedades'
FROM reservations r
JOIN users u ON u.id = r.user_id
JOIN spaces s ON s.id = r.space_id
JOIN equipments e ON e.serial = 'SER-SPK-001'
JOIN users du ON du.email = 'ana.gomez@demo.local'
JOIN users ru ON ru.email = 'carlos.ruiz@demo.local'
WHERE u.email = 'carlos.ruiz@demo.local'
  AND s.name = 'Laboratorio Innovacion'
  AND r.start_datetime = '2026-03-12 11:00:00'
  AND NOT EXISTS (SELECT 1 FROM reservation_equipments re WHERE re.reservation_id = r.id AND re.equipment_id = e.id)
LIMIT 1;

INSERT INTO reservation_equipments (
  reservation_id,
  equipment_id,
  status,
  delivered_at,
  delivered_by,
  returned_at,
  returned_by,
  condition_notes
)
SELECT r.id, e.id, 'requested', NULL, NULL, NULL, NULL, 'Solicitud pendiente por revision de inventario'
FROM reservations r
JOIN users u ON u.id = r.user_id
JOIN spaces s ON s.id = r.space_id
JOIN equipments e ON e.serial = 'SER-SCR-001'
WHERE u.email = 'maria.lopez@demo.local'
  AND s.name = 'Sala Panorama'
  AND r.start_datetime = '2026-03-13 16:00:00'
  AND NOT EXISTS (SELECT 1 FROM reservation_equipments re WHERE re.reservation_id = r.id AND re.equipment_id = e.id)
LIMIT 1;
