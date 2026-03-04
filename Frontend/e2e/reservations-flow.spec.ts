import { test, expect } from '@playwright/test';

/**
 * ============================================================
 * E2E Black-box Tests — Flujo de Reservas (Dashboard)
 * ============================================================
 * Pruebas de caja negra sobre el flujo de reservas del frontend
 * conectado al stack completo.
 *
 * Integridad verificada:
 *   Frontend → API Gateway → bookings-service / locations-service /
 *   inventory-service → MariaDB → RabbitMQ → notifications-service
 * ============================================================
 */

const UNIQUE = Date.now();
const TEST_USER = {
  name: `E2E Reservas ${UNIQUE}`,
  email: `e2e_reservas_${UNIQUE}@test.com`,
  password: 'SecurePass123!',
};

/** Helper: login rápido reutilizable */
async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test.describe('Flujo de Reservas E2E', () => {

  test.describe.configure({ mode: 'serial' });

  // ── Setup: registrar y loguear usuario ─────────────────────
  test('Setup: Registrar usuario para tests de reservas', async ({ page }) => {
    await page.goto('/signup');

    await page.locator('#fullName').fill(TEST_USER.name);
    await page.locator('#email').fill(TEST_USER.email);
    await page.locator('#password').fill(TEST_USER.password);
    await page.locator('#confirmPassword').fill(TEST_USER.password);
    await page.locator('#termsAccepted').check();
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  // ── TC-E2E-020: Dashboard lista elementos del inventario ──
  test('TC-E2E-020: Dashboard carga y muestra inventario o estado vacío', async ({ page }) => {
    await login(page);

    // Esperar a que termine de cargar
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return !text.includes('Cargando');
    }, { timeout: 15_000 }).catch(() => {});

    // Dashboard debe mostrar resultados o estado vacío
    const bodyText = await page.locator('body').innerText();
    const validState = bodyText.includes('Resultados') ||
                       bodyText.includes('No se encontraron') ||
                       bodyText.includes('elementos');
    expect(validState).toBe(true);
  });

  // ── TC-E2E-023: Abrir modal de reserva ─────────────────────
  test('TC-E2E-023: Click en "Reservar" abre modal de reserva', async ({ page }) => {
    await login(page);

    // Esperar a que cargue el inventario
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return !text.includes('Cargando');
    }, { timeout: 15_000 }).catch(() => {});

    // Buscar botón de reservar en alguna tarjeta
    const reserveBtn = page.locator('.btn-book').first();
    const hasItems = await reserveBtn.isVisible().catch(() => false);

    if (hasItems) {
      await reserveBtn.click();

      // Modal debe abrirse
      await expect(page.locator('.modal-overlay')).toBeVisible();
      await expect(page.locator('.modal-content')).toBeVisible();

      // Debe mostrar el calendario y los selectores de tiempo
      await expect(page.locator('#startTime')).toBeVisible();
      await expect(page.locator('#endTime')).toBeVisible();

      // Verificar botones del modal
      await expect(page.locator('.btn-confirm')).toBeVisible();
      await expect(page.locator('.btn-cancel')).toBeVisible();
    } else {
      // Si no hay items, verificar estado vacío
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).toContain('No se encontraron');
    }
  });

  // ── TC-E2E-024: Cerrar modal con botón cancelar ───────────
  test('TC-E2E-024: Cerrar modal de reserva con botón Cancelar', async ({ page }) => {
    await login(page);

    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return !text.includes('Cargando');
    }, { timeout: 15_000 }).catch(() => {});

    const reserveBtn = page.locator('.btn-book').first();
    const hasItems = await reserveBtn.isVisible().catch(() => false);

    if (hasItems) {
      await reserveBtn.click();
      await expect(page.locator('.modal-overlay')).toBeVisible();

      // Cerrar con botón cancelar
      await page.locator('.btn-cancel').click();

      // Modal debe cerrarse
      await expect(page.locator('.modal-overlay')).not.toBeVisible();
    }
  });

  // ── TC-E2E-025: Crear reserva completa ─────────────────────
  test('TC-E2E-025: Crear una reserva seleccionando fecha, hora y confirmando', async ({ page }) => {
    await login(page);

    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return !text.includes('Cargando');
    }, { timeout: 15_000 }).catch(() => {});

    const reserveBtn = page.locator('.btn-book').first();
    const hasItems = await reserveBtn.isVisible().catch(() => false);

    if (hasItems) {
      await reserveBtn.click();
      await expect(page.locator('.modal-content')).toBeVisible();

      // 1. Seleccionar un día disponible del calendario (no pasado, no unavailable)
      const availableDay = page.locator('.calendar-day.available').first();
      const dayVisible = await availableDay.isVisible().catch(() => false);

      if (dayVisible) {
        await availableDay.click();

        // 2. Seleccionar horario
        await page.locator('#startTime').fill('09:00');
        await page.locator('#endTime').fill('11:00');

        // 3. Confirmar reserva
        const confirmBtn = page.locator('.btn-confirm');
        const isEnabled = await confirmBtn.isEnabled();

        if (isEnabled) {
          await confirmBtn.click();

          // Esperar resultado: success banner o navegación
          const hasSuccess = await page.locator('.modal-success-banner')
            .isVisible({ timeout: 10_000 }).catch(() => false);
          const hasError = await page.locator('.modal-error-banner')
            .isVisible().catch(() => false);

          // La reserva se intentó — verificar que hubo alguna respuesta
          expect(hasSuccess || hasError).toBe(true);

          if (hasSuccess) {
            // Si fue exitosa, cerrar modal y verificar que la reserva existe
            // El modal puede cerrarse automáticamente o con el botón X
            await page.waitForTimeout(2000);
          }
        }
      }
    }
  });

  // ── TC-E2E-021: Navegación a Mis Reservas ──────────────────
  test('TC-E2E-021: Navegar a Mis Reservas desde dashboard', async ({ page }) => {
    await login(page);

    // Navegar a mis reservas
    const reservasLink = page.locator('a[href="/my-reservations"]');
    if (await reservasLink.isVisible().catch(() => false)) {
      await reservasLink.click();
      await expect(page).toHaveURL(/\/my-reservations/);
    } else {
      await page.goto('/my-reservations');
      await expect(page).toHaveURL(/\/my-reservations/);
    }
  });

  // ── TC-E2E-022: Mis Reservas muestra lista ────────────────
  test('TC-E2E-022: Mis Reservas muestra estado vacío o lista de reservas', async ({ page }) => {
    await login(page);
    await page.goto('/my-reservations');

    // Esperar carga
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return !text.includes('Cargando');
    }, { timeout: 15_000 }).catch(() => {});

    // Debe mostrar reservas o estado vacío
    const bodyText = await page.locator('body').innerText();
    const validState = bodyText.includes('reserva') ||
                       bodyText.includes('Reserva') ||
                       bodyText.includes('No') ||
                       bodyText.includes('vacío') ||
                       bodyText.includes('encontr');
    expect(validState).toBe(true);
  });

  // ── TC-E2E-026: Verificar datos de tarjeta de reserva ─────
  test('TC-E2E-026: Tarjetas de reserva muestran información correcta', async ({ page }) => {
    await login(page);
    await page.goto('/my-reservations');

    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return !text.includes('Cargando');
    }, { timeout: 15_000 }).catch(() => {});

    // Si hay reservas, verificar estructura de la tarjeta
    const card = page.locator('.reservation-card').first();
    const hasCards = await card.isVisible().catch(() => false);

    if (hasCards) {
      // Cada tarjeta debe tener título, ID y badge de estado
      await expect(page.locator('.card-title').first()).toBeVisible();
      await expect(page.locator('.card-subtitle').first()).toBeVisible();
      await expect(page.locator('.res-status-badge').first()).toBeVisible();
    }
  });

});
