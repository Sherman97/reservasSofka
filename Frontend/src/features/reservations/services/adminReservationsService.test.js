import { beforeEach, describe, expect, it, vi } from 'vitest';

const { clients, containerGet } = vi.hoisted(() => {
  const hoistedClients = {
    bookingsClient: { get: vi.fn(), post: vi.fn() },
    locationsClient: { get: vi.fn() },
    authClient: { get: vi.fn() },
    inventoryClient: { get: vi.fn() },
  };

  return {
    clients: hoistedClients,
    containerGet: vi.fn((name) => hoistedClients[name]),
  };
});

vi.mock('../../../core/adapters/di/container', () => ({
  default: {
    get: containerGet,
  },
}));

import {
  checkAdminReservationAvailability,
  createAdminReservation,
  getAdminCities,
  getAdminEquipmentByCity,
  getAdminReservationDetail,
  getAdminReservations,
  getAdminSpacesByCity,
  searchAdminUsers,
} from './adminReservationsService';

describe('adminReservationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAdminReservations normaliza filtros y mapea payload paginado', async () => {
    clients.bookingsClient.get.mockResolvedValueOnce({
      data: {
        ok: true,
        data: {
          items: [
            {
              id: 11,
              userId: 7,
              userName: 'Ana',
              userEmail: 'ana@demo.com',
              siteId: 2,
              siteName: 'Bogota',
              spaceId: 9,
              spaceName: 'Sala Norte',
              startAt: '2026-04-08T10:00:00Z',
              endAt: '2026-04-08T11:00:00Z',
              status: 'confirmed',
              attendeesCount: 5,
              equipments: [{ equipmentId: 100, name: 'TV' }],
            },
          ],
          totalItems: 50,
          page: 1,
          size: 20,
          totalPages: 3,
        },
      },
    });

    const result = await getAdminReservations({
      page: 2,
      pageSize: 20,
      filters: {
        from: '2026-04-01',
        to: '2026-04-30',
        status: 'Confirmada',
        user: '33',
        site: '2',
      },
    });

    expect(clients.bookingsClient.get).toHaveBeenCalledWith('/bookings/admin/reservations', {
      params: {
        page: 1,
        size: 20,
        desde: '2026-04-01T00:00:00Z',
        hasta: '2026-04-30T23:59:59Z',
        estado: 'Confirmada',
        usuario: 33,
        sede: 2,
      },
    });
    expect(result.total).toBe(50);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(20);
    expect(result.totalPages).toBe(3);
    expect(result.items[0].status).toBe('Confirmada');
    expect(result.items[0].equipment).toEqual([{ itemId: '100', name: 'TV', qty: 1 }]);
  });

  it('getAdminReservations maneja payload tipo array y fallback de paginacion', async () => {
    clients.bookingsClient.get.mockResolvedValueOnce({
      data: [{ id: 1, userId: 10, spaceId: 1, startAt: '2026-04-08T10:00:00Z', endAt: '2026-04-08T11:00:00Z' }],
    });

    const result = await getAdminReservations({ page: -3, pageSize: 0, filters: { user: 'x', site: '-1' } });

    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.totalPages).toBe(1);
  });

  it('getAdminReservations retorna vacio cuando backend falla', async () => {
    clients.bookingsClient.get.mockRejectedValueOnce(new Error('boom'));

    const result = await getAdminReservations({ page: 3, pageSize: 10 });

    expect(result).toEqual({
      items: [],
      total: 0,
      page: 3,
      pageSize: 10,
    });
  });

  it('getAdminReservationDetail retorna null cuando no hay id o no hay data', async () => {
    expect(await getAdminReservationDetail('')).toBeNull();

    clients.bookingsClient.get.mockResolvedValueOnce({ data: { ok: true, data: null } });
    expect(await getAdminReservationDetail('10')).toBeNull();
  });

  it('getAdminReservationDetail completa datos de usuario, sede, espacio y equipos', async () => {
    clients.bookingsClient.get.mockResolvedValueOnce({
      data: {
        ok: true,
        data: {
          id: 88,
          userId: 33,
          spaceId: 5,
          startAt: '2026-04-08T10:00:00Z',
          endAt: '2026-04-08T11:00:00Z',
          status: 'pending',
          equipments: [{ equipmentId: 1, name: '' }],
        },
      },
    });
    clients.authClient.get.mockResolvedValueOnce({
      data: { ok: true, data: [{ id: 33, name: 'Carlos', email: 'carlos@demo.com' }] },
    });
    clients.locationsClient.get
      .mockResolvedValueOnce({ data: { ok: true, data: { id: 5, name: 'Sala A', cityId: 2 } } })
      .mockResolvedValueOnce({ data: { ok: true, data: { id: 2, name: 'Medellin' } } });
    clients.inventoryClient.get.mockResolvedValueOnce({
      data: { ok: true, data: [{ id: 1, name: 'TV', available: true }] },
    });

    const result = await getAdminReservationDetail('88');

    expect(result.userName).toBe('Carlos');
    expect(result.userEmail).toBe('carlos@demo.com');
    expect(result.site).toBe('Medellin');
    expect(result.space).toBe('Sala A');
    expect(result.equipment[0].name).toBe('TV');
    expect(result.equipmentOptions).toEqual([{ id: '1', name: 'TV', available: true }]);
  });

  it('getAdminReservationDetail soporta errores secundarios sin romper respuesta', async () => {
    clients.bookingsClient.get.mockResolvedValueOnce({
      data: { ok: true, data: { id: 89, userId: 11, spaceId: 9, startAt: '2026-04-08T10:00:00Z', endAt: '2026-04-08T11:00:00Z' } },
    });
    clients.authClient.get.mockRejectedValueOnce(new Error('users down'));
    clients.locationsClient.get.mockRejectedValueOnce(new Error('space down'));

    const result = await getAdminReservationDetail('89');

    expect(result).not.toBeNull();
    expect(result.userId).toBe('11');
    expect(result.spaceId).toBe('9');
  });

  it('searchAdminUsers mapea y filtra filas invalidas', async () => {
    clients.authClient.get.mockResolvedValueOnce({
      data: {
        ok: true,
        data: [
          { id: 1, name: 'Ana', email: 'ana@demo.com' },
          { id: null, name: 'Nope', email: 'nope@demo.com' },
        ],
      },
    });

    const result = await searchAdminUsers('  an  ');

    expect(clients.authClient.get).toHaveBeenCalledWith('/auth/users', { params: { query: 'an' } });
    expect(result).toEqual([{ id: '1', fullName: 'Ana', email: 'ana@demo.com' }]);
  });

  it('searchAdminUsers retorna [] cuando falla', async () => {
    clients.authClient.get.mockRejectedValueOnce(new Error('down'));
    await expect(searchAdminUsers('x')).resolves.toEqual([]);
  });

  it('checkAdminReservationAvailability cubre ramas de validacion y backend', async () => {
    expect(await checkAdminReservationAvailability({})).toEqual({ hasConflict: false });

    clients.bookingsClient.get.mockResolvedValueOnce({ data: { ok: true, data: { available: false } } });
    await expect(
      checkAdminReservationAvailability({
        spaceId: '4',
        date: '2026-04-08',
        startTime: '10:00',
        endTime: '11:00',
      }),
    ).resolves.toEqual({ hasConflict: true });

    clients.bookingsClient.get.mockRejectedValueOnce(new Error('down'));
    await expect(
      checkAdminReservationAvailability({
        spaceId: '4',
        date: '2026-04-08',
        startTime: '10:00',
        endTime: '11:00',
      }),
    ).resolves.toEqual({ hasConflict: false });
  });

  it('createAdminReservation transforma request y usa fallback de respuesta', async () => {
    clients.bookingsClient.post.mockResolvedValueOnce({ data: { ok: true, data: { id: 100, status: 'confirmed' } } });
    const created = await createAdminReservation({
      spaceId: '7',
      date: '2026-04-08',
      startTime: '10:00',
      endTime: '11:00',
      attendeesCount: 3,
      equipmentIds: ['1', '2'],
      userId: '33',
    });

    expect(clients.bookingsClient.post).toHaveBeenCalledWith('/bookings/reservations', {
      spaceId: 7,
      startAt: '2026-04-08T10:00:00',
      endAt: '2026-04-08T11:00:00',
      attendeesCount: 3,
      equipmentIds: [1, 2],
      targetUserId: 33,
    });
    expect(created.id).toBe(100);

    clients.bookingsClient.post.mockResolvedValueOnce({ data: null });
    await expect(createAdminReservation({ spaceId: '1', date: '2026-04-08', startTime: '08:00', endTime: '09:00' })).resolves.toEqual({
      id: '',
      status: 'Confirmada',
    });
  });

  it('getAdminCities, getAdminSpacesByCity y getAdminEquipmentByCity cubren éxito y fallback', async () => {
    clients.locationsClient.get.mockResolvedValueOnce({
      data: { ok: true, data: [{ id: 1, name: 'Bogota' }, { id: null, name: 'No' }] },
    });
    await expect(getAdminCities()).resolves.toEqual([{ id: '1', name: 'Bogota' }]);

    clients.locationsClient.get.mockRejectedValueOnce(new Error('down'));
    await expect(getAdminCities()).resolves.toEqual([]);

    expect(await getAdminSpacesByCity('')).toEqual([]);
    clients.locationsClient.get.mockResolvedValueOnce({
      data: { ok: true, data: [{ id: 9, name: 'Sala 9', cityId: 1, capacity: 20 }, { id: 0, name: '', cityId: 1 }] },
    });
    await expect(getAdminSpacesByCity('1')).resolves.toEqual([{ id: '9', name: 'Sala 9', cityId: '1', capacity: 20 }]);

    clients.locationsClient.get.mockRejectedValueOnce(new Error('down'));
    await expect(getAdminSpacesByCity('1')).resolves.toEqual([]);

    expect(await getAdminEquipmentByCity('')).toEqual([]);
    clients.inventoryClient.get.mockResolvedValueOnce({
      data: { ok: true, data: [{ id: 5, name: 'Proyector', available: false }, { id: null, name: 'x' }] },
    });
    await expect(getAdminEquipmentByCity('1')).resolves.toEqual([{ id: '5', name: 'Proyector', available: false }]);

    clients.inventoryClient.get.mockRejectedValueOnce(new Error('down'));
    await expect(getAdminEquipmentByCity('1')).resolves.toEqual([]);
  });
});
