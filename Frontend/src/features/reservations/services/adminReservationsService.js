import container from '../../../core/adapters/di/container';

const unwrapData = (response) => {
    const raw = response?.data;
    if (raw && typeof raw.ok === 'boolean') {
        if (!raw.ok) {
            throw new Error(raw.message || 'Error consultando servicio');
        }
        return raw.data;
    }
    return raw;
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const getBookingsClient = () => container.get('bookingsClient');
const getLocationsClient = () => container.get('locationsClient');
const getAuthClient = () => container.get('authClient');
const getInventoryClient = () => container.get('inventoryClient');

const toDate = (isoValue) => {
    if (!isoValue) return '';
    const date = new Date(isoValue);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const toTime = (isoValue) => {
    if (!isoValue) return '';
    const date = new Date(isoValue);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(11, 16);
};

const toStringId = (value) => (value === null || value === undefined ? '' : String(value));

const normalizeStatusLabel = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (!normalized) return '';
    if (normalized === 'pending') return 'Pendiente';
    if (normalized === 'confirmed') return 'Confirmada';
    if (normalized === 'in_progress') return 'En curso';
    if (normalized === 'completed') return 'Completada';
    if (normalized === 'cancelled') return 'Cancelada';
    return normalized;
};

const mapReservationToAdminRow = (reservation) => ({
    id: String(reservation?.id ?? ''),
    userName: reservation?.userName || (reservation?.userId ? `Usuario #${reservation.userId}` : ''),
    userEmail: reservation?.userEmail || '',
    userId: reservation?.userId ? String(reservation.userId) : '',
    siteId: reservation?.siteId ? String(reservation.siteId) : '',
    site: reservation?.siteName || '',
    spaceId: reservation?.spaceId ? String(reservation.spaceId) : '',
    space: reservation?.spaceName || (reservation?.spaceId ? `Espacio #${reservation.spaceId}` : ''),
    reservedSpace: reservation?.spaceName || (reservation?.spaceId ? `Espacio #${reservation.spaceId}` : ''),
    executionDate: toDate(reservation?.startAt || reservation?.startDatetime),
    startTime: toTime(reservation?.startAt || reservation?.startDatetime),
    endTime: toTime(reservation?.endAt || reservation?.endDatetime),
    status: normalizeStatusLabel(reservation?.status),
    attendeesCount: Number(reservation?.attendeesCount) > 0 ? Number(reservation.attendeesCount) : 1,
    equipment: safeArray(reservation?.equipments).map((equipment) => ({
        itemId: toStringId(equipment?.equipmentId),
        name: equipment?.name || '',
        qty: 1,
    })),
});

export const getAdminReservations = async (query = {}) => {
    const filters = query?.filters || {};
    const pageValue = Number(query?.page);
    const page = Number.isFinite(pageValue) ? Math.max(0, pageValue - 1) : 0;
    const pageSizeValue = Number(query?.pageSize);
    const size = Number.isFinite(pageSizeValue) && pageSizeValue > 0 ? pageSizeValue : 20;

    const params = {
        page,
        size,
    };

    if (filters.from) params.desde = `${filters.from}T00:00:00Z`;
    if (filters.to) params.hasta = `${filters.to}T23:59:59Z`;
    if (filters.status) params.estado = filters.status;

    const userAsNumber = Number(filters.user);
    if (filters.user && Number.isFinite(userAsNumber) && userAsNumber > 0) {
        params.usuario = userAsNumber;
    }

    const siteAsNumber = Number(filters.site);
    if (filters.site && Number.isFinite(siteAsNumber) && siteAsNumber > 0) {
        params.sede = siteAsNumber;
    }

    try {
        const response = await getBookingsClient().get('/bookings/admin/reservations', { params });
        const payload = unwrapData(response);
        const rows = Array.isArray(payload) ? payload : safeArray(payload?.items);
        const items = rows.map(mapReservationToAdminRow);
        const total = Array.isArray(payload) ? items.length : Number(payload?.totalItems ?? items.length);
        const resolvedPage = Array.isArray(payload) ? page + 1 : Number(payload?.page ?? page) + 1;
        const resolvedPageSize = Array.isArray(payload) ? size : Number(payload?.size ?? size);
        const totalPages = Array.isArray(payload)
            ? (items.length === 0 ? 0 : 1)
            : Number(payload?.totalPages ?? 0);
        return {
            items,
            total,
            page: resolvedPage,
            pageSize: resolvedPageSize,
            totalPages,
        };
    } catch (error) {
        console.error('Error loading admin reservations:', error);
        return {
            items: [],
            total: 0,
            page: page + 1,
            pageSize: size,
        };
    }
};

export const getAdminReservationDetail = async (reservationId) => {
    if (!reservationId) return null;
    try {
        const response = await getBookingsClient().get(`/bookings/reservations/${reservationId}`);
        const data = unwrapData(response);
        if (!data) return null;

        const mapped = mapReservationToAdminRow(data);

        let userName = mapped.userName;
        let userEmail = mapped.userEmail;
        if (mapped.userId) {
            try {
                const usersResponse = await getAuthClient().get('/auth/users', { params: { query: '' } });
                const users = safeArray(unwrapData(usersResponse));
                const user = users.find((item) => String(item?.id) === mapped.userId);
                if (user) {
                    userName = user.name || userName;
                    userEmail = user.email || userEmail;
                }
            } catch (error) {
                console.error('Error loading users for reservation detail:', error);
            }
        }

        let siteId = mapped.siteId;
        let site = mapped.site;
        let spaceId = mapped.spaceId;
        let space = mapped.space;
        let equipmentOptions = [];
        let selectedEquipment = mapped.equipment || [];

        if (mapped.spaceId) {
            try {
                const spaceResponse = await getLocationsClient().get(`/locations/spaces/${mapped.spaceId}`);
                const spaceData = unwrapData(spaceResponse);
                if (spaceData) {
                    spaceId = toStringId(spaceData.id || mapped.spaceId);
                    space = spaceData.name || space;
                    siteId = toStringId(spaceData.cityId || siteId);

                    if (siteId) {
                        const cityResponse = await getLocationsClient().get(`/locations/cities/${siteId}`);
                        const cityData = unwrapData(cityResponse);
                        if (cityData?.name) {
                            site = cityData.name;
                        }

                        equipmentOptions = await getAdminEquipmentByCity(siteId);
                        if (selectedEquipment.length > 0 && equipmentOptions.length > 0) {
                            const namesById = new Map(
                                equipmentOptions.map((item) => [String(item.id), item.name]),
                            );
                            selectedEquipment = selectedEquipment.map((item) => ({
                                ...item,
                                name: namesById.get(String(item.itemId)) || item.name || `Equipo #${item.itemId}`,
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading location data for reservation detail:', error);
            }
        }

        return {
            ...mapped,
            userName,
            userEmail,
            siteId,
            site,
            spaceId,
            space,
            reservedSpace: space,
            equipment: selectedEquipment,
            equipmentOptions,
        };
    } catch (error) {
        console.error('Error loading admin reservation detail:', error);
        return null;
    }
};

export const searchAdminUsers = async (query) => {
    const trimmedQuery = query?.trim() ?? '';
    try {
        const response = await getAuthClient().get('/auth/users', {
            params: { query: trimmedQuery },
        });
        const rows = safeArray(unwrapData(response));
        return rows.map((user) => ({
            id: String(user.id ?? ''),
            fullName: user.name ?? '',
            email: user.email ?? '',
        })).filter((user) => user.id && (user.fullName || user.email));
    } catch (error) {
        console.error('Error searching admin users:', error);
        return [];
    }
};

export const checkAdminReservationAvailability = async (payload) => {
    if (!payload?.spaceId || !payload?.date || !payload?.startTime || !payload?.endTime) {
        return { hasConflict: false };
    }
    try {
        const startAt = `${payload.date}T${payload.startTime}:00`;
        const endAt = `${payload.date}T${payload.endTime}:00`;
        const response = await getBookingsClient().get(
            `/bookings/spaces/${payload.spaceId}/availability`,
            { params: { startAt, endAt } },
        );
        const data = unwrapData(response) || {};
        return { hasConflict: !data.available };
    } catch (error) {
        console.error('Error checking admin availability:', error);
        return { hasConflict: false };
    }
};

export const createAdminReservation = async (payload) => {
    const request = {
        spaceId: Number(payload.spaceId),
        startAt: `${payload.date}T${payload.startTime}:00`,
        endAt: `${payload.date}T${payload.endTime}:00`,
        attendeesCount: payload.attendeesCount || 1,
        equipmentIds: Array.isArray(payload.equipmentIds) ? payload.equipmentIds.map((id) => Number(id)) : [],
        targetUserId: payload.userId ? Number(payload.userId) : undefined,
    };
    const response = await getBookingsClient().post('/bookings/reservations', request);
    return unwrapData(response) || { id: '', status: 'Confirmada' };
};

export const getAdminCities = async () => {
    try {
        const response = await getLocationsClient().get('/locations/cities');
        const rows = safeArray(unwrapData(response));
        return rows.map((city) => ({
            id: String(city.id ?? ''),
            name: city.name ?? '',
        })).filter((city) => city.id && city.name);
    } catch (error) {
        console.error('Error loading admin cities:', error);
        return [];
    }
};

export const getAdminSpacesByCity = async (cityId) => {
    if (!cityId) return [];
    try {
        const response = await getLocationsClient().get(`/locations/cities/${cityId}/spaces`);
        const rows = safeArray(unwrapData(response));
        return rows.map((space) => ({
            id: String(space.id ?? ''),
            name: space.name ?? '',
            cityId: String(space.cityId ?? cityId),
            capacity: space.capacity ?? null,
        })).filter((space) => space.id && space.name);
    } catch (error) {
        console.error('Error loading admin spaces by city:', error);
        return [];
    }
};

export const getAdminEquipmentByCity = async (cityId) => {
    if (!cityId) return [];
    try {
        const response = await getInventoryClient().get('/inventory/equipments', {
            params: { cityId },
        });
        const rows = safeArray(unwrapData(response));
        return rows.map((item) => ({
            id: String(item.id ?? ''),
            name: item.name ?? '',
            available: item.available !== false,
        })).filter((item) => item.id && item.name);
    } catch (error) {
        console.error('Error loading admin equipment by city:', error);
        return [];
    }
};
