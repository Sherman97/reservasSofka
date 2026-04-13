import { test, expect, type Page } from '@playwright/test';

/**
 * ============================================================
 * E2E Black-box Tests — Flujo completo de Autenticación
 * ============================================================
 * Pruebas de caja negra sobre la UI real del frontend
 * conectado al stack completo (backend + DB + RabbitMQ).
 *
 * Valida la integridad del sistema end-to-end:
 *   Frontend (React) → Nginx → API Gateway → auth-service → MariaDB
 * ============================================================
 */

const UNIQUE = Date.now();
const TEST_USER = {
  name: `E2E User ${UNIQUE}`,
  email: `e2e_${UNIQUE}@test.com`,
  password: 'SecurePass123!',
};

// ── TC-E2E-001: La página de login carga correctamente ─────
test('TC-E2E-001: Página de login se muestra correctamente', async ({ page }) => {
  await page.goto('/login');

  // Verificar elementos principales visibles
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toContainText('Iniciar Sesión');

  // Verificar enlace a registro
  const signupLink = page.locator('a[href="/signup"]');
  await expect(signupLink).toBeVisible();
});

// ── TC-E2E-002: Navegar a la página de registro ────────────
test('TC-E2E-002: Navegar de login a registro', async ({ page }) => {
  await page.goto('/login');

  await page.locator('a[href="/signup"]').click();

  await expect(page).toHaveURL(/\/signup/);
  await expect(page.locator('#fullName')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('#confirmPassword')).toBeVisible();
  await expect(page.locator('#termsAccepted')).toBeVisible();
});

// ── TC-E2E-003: Validación de formulario de registro ───────
test('TC-E2E-003: Registro con campos vacíos muestra validación', async ({ page }) => {
  await page.goto('/signup');

  // Intentar submit sin llenar campos
  await page.locator('button[type="submit"]').click();

  // El navegador debe mostrar validación nativa (required) o error del form
  // Verificar que NO navegamos al dashboard
  await expect(page).not.toHaveURL(/\/dashboard/);
});

// ── TC-E2E-004: Validación de passwords que no coinciden ───
test('TC-E2E-004: Passwords que no coinciden muestran error', async ({ page }) => {
  await page.goto('/signup');

  await page.locator('#fullName').fill('Test User');
  await page.locator('#email').fill('mismatch@test.com');
  await page.locator('#password').fill('Password123');
  await page.locator('#confirmPassword').fill('DifferentPass456');
  await page.locator('#termsAccepted').check();

  await page.locator('button[type="submit"]').click();

  // Debe mostrar error de validación, NO navegar
  await expect(page).not.toHaveURL(/\/dashboard/);
});

// ── TC-E2E-005: Registro exitoso de usuario ────────────────
test('TC-E2E-005: Registro exitoso navega al dashboard', async ({ page }) => {
  await page.goto('/signup');

  // Llenar formulario con datos válidos
  await page.locator('#fullName').fill(TEST_USER.name);
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.locator('#confirmPassword').fill(TEST_USER.password);
  await page.locator('#termsAccepted').check();

  // Submit
  await page.locator('button[type="submit"]').click();

  // Debe navegar al dashboard tras registro+auto-login exitoso
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  // Verificar que el token se almacenó en localStorage
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBeTruthy();
  expect(token!.length).toBeGreaterThan(10);
});

// ── TC-E2E-006: Login con usuario recién creado ────────────
test('TC-E2E-006: Login exitoso con usuario registrado', async ({ page }) => {
  await page.goto('/login');

  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.locator('button[type="submit"]').click();

  // Debe navegar al dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  // Token debe existir
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBeTruthy();
});

// ── TC-E2E-007: Login fallido con credenciales incorrectas ─
test('TC-E2E-007: Login con password incorrecto muestra error', async ({ page }) => {
  await page.goto('/login');

  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill('WrongPassword999');
  await page.locator('button[type="submit"]').click();

  // Debe mostrar mensaje de error
  const errorMsg = page.locator('.error-message');
  await expect(errorMsg).toBeVisible({ timeout: 10_000 });

  // NO debe navegar al dashboard
  await expect(page).toHaveURL(/\/login/);
});

// ── TC-E2E-008: Ruta protegida redirige sin token ──────────
test('TC-E2E-008: Acceso a /dashboard sin token redirige a login', async ({ page }) => {
  // Asegurar que no hay token
  await page.goto('/login');
  await page.evaluate(() => localStorage.removeItem('token'));

  // Intentar acceder a ruta protegida
  await page.goto('/dashboard');

  // Debe redirigir a login
  await expect(page).toHaveURL(/\/login/);
});

// ── TC-E2E-009: Ruta protegida my-reservations redirige ────
test('TC-E2E-009: Acceso a /my-reservations sin token redirige a login', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.removeItem('token'));

  await page.goto('/my-reservations');

  await expect(page).toHaveURL(/\/login/);
});

// ── TC-E2E-010: Dashboard carga contenido tras login ───────
test('TC-E2E-010: Dashboard muestra contenido tras login exitoso', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  // Verificar que el dashboard muestra contenido (searchbar o resultados o loading)
  const hasContent = await page.locator('body').evaluate((body) => {
    const text = body.innerText;
    return text.includes('Resultados') ||
           text.includes('Cargando') ||
           text.includes('No se encontraron') ||
           text.includes('Reintentar');
  });
  expect(hasContent).toBe(true);
});

// ── TC-E2E-011: Registro duplicado muestra error ───────────
test('TC-E2E-011: Registro con email duplicado muestra error', async ({ page }) => {
  await page.goto('/signup');

  // Usar el mismo email que ya se registró en TC-E2E-005
  await page.locator('#fullName').fill('Duplicate User');
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.locator('#confirmPassword').fill(TEST_USER.password);
  await page.locator('#termsAccepted').check();

  await page.locator('button[type="submit"]').click();

  // Debe mostrar error (email ya registrado), NO navegar al dashboard
  const errorMsg = page.locator('.error-message');
  await expect(errorMsg).toBeVisible({ timeout: 10_000 });
  await expect(page).not.toHaveURL(/\/dashboard/);
});
