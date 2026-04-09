-- Admin de pruebas agregado para acceso al modulo administrativo.
-- Credenciales:
--   email: prueba.admin@demo.com
--   password: admin123
-- Nota: cambiar esta clave en ambientes no locales.

INSERT INTO users (username, email, password_hash)
SELECT 'Prueba Admin', 'prueba.admin@demo.com', '$2a$10$U9.V3i.5Zn4UnwsrSBRwjel77IFNzOhQLb8WuI9ToXoDjjHcDAYWa'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'prueba.admin@demo.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'USER'
LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.role_id = r.id
WHERE u.email = 'prueba.admin@demo.com'
  AND ur.user_id IS NULL;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.role_id = r.id
WHERE u.email = 'prueba.admin@demo.com'
  AND ur.user_id IS NULL;
