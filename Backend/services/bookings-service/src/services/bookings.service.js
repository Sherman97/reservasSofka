const crypto = require("crypto");
const pool = require("../db");

function throwError(statusCode, message) {
    const e = new Error(message);
    e.statusCode = statusCode;
    throw e;
}

function parseISO(dateStr, field) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) throwError(400, `${field} es inválido`);
    return d;
}

function normalizeItems(items) {
    if (!Array.isArray(items)) return [];
    return items.map(it => ({
        itemId: Number(it.itemId),
        qty: Number(it.qty ?? 1),
    }));
}

// ✅ 1) disponibilidad para un item en un rango
async function getItemAvailability({ locationId, itemId, startAt, endAt }) {
    const locId = Number(locationId);
    const invId = Number(itemId);
    if (!locId || !invId) throwError(400, "locationId e itemId son obligatorios");

    const start = parseISO(startAt, "startAt");
    const end = parseISO(endAt, "endAt");
    if (start >= end) throwError(400, "startAt debe ser menor que endAt");

    // stock total en esa locación para ese item
    const [stockRows] = await pool.execute(
        `SELECT qty
     FROM location_inventory
     WHERE location_id = ? AND inventory_id = ?
     LIMIT 1`,
        [locId, invId]
    );

    const totalQty = stockRows.length ? Number(stockRows[0].qty) : 0;

    // reservado en ese rango (solo CONFIRMED)
    const [usedRows] = await pool.execute(
        `SELECT COALESCE(SUM(bi.qty), 0) AS usedQty
     FROM booking_inventory bi
     JOIN bookings b ON b.id = bi.booking_id
     WHERE b.location_id = ?
       AND bi.inventory_id = ?
       AND b.status = 'confirmed'
       AND b.start_time < ?
       AND b.end_time > ?`,
        [locId, invId, end, start]
    );

    const usedQty = Number(usedRows[0]?.usedQty ?? 0);
    const availableQty = Math.max(totalQty - usedQty, 0);

    return { totalQty, usedQty, availableQty };
}

// ✅ 2) crear reserva en BD (con transacción)
async function createBooking(payload) {
    const { userId, locationId, startAt, endAt, items } = payload || {};

    if (!userId || !locationId || !startAt || !endAt) {
        throwError(400, "userId, locationId, startAt y endAt son obligatorios");
    }

    const locId = Number(locationId);
    const start = parseISO(startAt, "startAt");
    const end = parseISO(endAt, "endAt");

    if (start >= end) throwError(400, "startAt debe ser menor que endAt");

    const cleanItems = normalizeItems(items);

    for (const it of cleanItems) {
        if (!it.itemId) throwError(400, "items.itemId es obligatorio");
        if (!Number.isInteger(it.qty) || it.qty <= 0) throwError(400, "items.qty debe ser entero > 0");
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1) conflicto de locación (mismo check que en memoria)
        const [conflicts] = await conn.execute(
            `SELECT id
       FROM bookings
       WHERE location_id = ?
         AND status = 'confirmed'
         AND start_time < ?
         AND end_time > ?
       LIMIT 1`,
            [locId, end, start]
        );

        if (conflicts.length) {
            throwError(409, "La locación ya está reservada en ese rango de tiempo");
        }

        // 2) validar disponibilidad de items (si vienen)
        for (const it of cleanItems) {
            // stock total
            const [stockRows] = await conn.execute(
                `SELECT qty
         FROM location_inventory
         WHERE location_id = ? AND inventory_id = ?
         LIMIT 1`,
                [locId, it.itemId]
            );
            const totalQty = stockRows.length ? Number(stockRows[0].qty) : 0;

            // reservado en rango
            const [usedRows] = await conn.execute(
                `SELECT COALESCE(SUM(bi.qty), 0) AS usedQty
         FROM booking_inventory bi
         JOIN bookings b ON b.id = bi.booking_id
         WHERE b.location_id = ?
           AND bi.inventory_id = ?
           AND b.status = 'confirmed'
           AND b.start_time < ?
           AND b.end_time > ?`,
                [locId, it.itemId, end, start]
            );
            const usedQty = Number(usedRows[0]?.usedQty ?? 0);

            const availableQty = totalQty - usedQty;
            if (availableQty < it.qty) {
                throwError(
                    409,
                    `No hay disponibilidad suficiente del item ${it.itemId}. Disponible: ${Math.max(availableQty, 0)}`
                );
            }
        }

        // 3) insertar booking
        const [result] = await conn.execute(
            `INSERT INTO bookings (user_id, location_id, start_time, end_time, status)
       VALUES (?, ?, ?, ?, 'confirmed')`,
            [userId, locId, start, end]
        );

        const bookingId = result.insertId;

        // 4) insertar booking_inventory
        for (const it of cleanItems) {
            await conn.execute(
                `INSERT INTO booking_inventory (booking_id, inventory_id, qty)
         VALUES (?, ?, ?)`,
                [bookingId, it.itemId, it.qty]
            );
        }

        await conn.commit();

        return {
            id: bookingId,
            userId,
            locationId: locId,
            startAt: start.toISOString(),
            endAt: end.toISOString(),
            items: cleanItems,
            status: "CONFIRMED",
            createdAt: new Date().toISOString(),
        };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

async function listBookings(filters = {}) {
    const where = [];
    const params = [];

    if (filters.userId) {
        where.push("b.user_id = ?");
        params.push(Number(filters.userId));
    }
    if (filters.locationId) {
        where.push("b.location_id = ?");
        params.push(Number(filters.locationId));
    }
    if (filters.status) {
        where.push("b.status = ?");
        params.push(String(filters.status).toLowerCase());
    }

    const [rows] = await pool.execute(
        `SELECT b.id, b.user_id, b.location_id, b.start_time, b.end_time, b.status, b.created_at
     FROM bookings b
     ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY b.created_at DESC`,
        params
    );

    // opcional: traer items por booking (simple)
    const ids = rows.map(r => r.id);
    let itemsByBooking = {};
    if (ids.length) {
        const [itemsRows] = await pool.query(
            `SELECT booking_id, inventory_id, qty
       FROM booking_inventory
       WHERE booking_id IN (${ids.map(() => "?").join(",")})`,
            ids
        );
        for (const it of itemsRows) {
            (itemsByBooking[it.booking_id] ||= []).push({
                itemId: it.inventory_id,
                qty: it.qty,
            });
        }
    }

    return rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        locationId: r.location_id,
        startAt: new Date(r.start_time).toISOString(),
        endAt: new Date(r.end_time).toISOString(),
        items: itemsByBooking[r.id] || [],
        status: String(r.status).toUpperCase(),
        createdAt: r.created_at,
    }));
}

async function getBookingById(id) {
    const [rows] = await pool.execute(
        `SELECT id, user_id, location_id, start_time, end_time, status, created_at
     FROM bookings
     WHERE id = ?
     LIMIT 1`,
        [Number(id)]
    );

    if (!rows.length) throwError(404, "Reserva no encontrada");

    const r = rows[0];

    const [itemsRows] = await pool.execute(
        `SELECT inventory_id, qty
     FROM booking_inventory
     WHERE booking_id = ?`,
        [Number(id)]
    );

    return {
        id: r.id,
        userId: r.user_id,
        locationId: r.location_id,
        startAt: new Date(r.start_time).toISOString(),
        endAt: new Date(r.end_time).toISOString(),
        items: itemsRows.map(x => ({ itemId: x.inventory_id, qty: x.qty })),
        status: String(r.status).toUpperCase(),
        createdAt: r.created_at,
    };
}

async function cancelBooking(id) {
    // valida existencia
    const booking = await getBookingById(id);

    if (booking.status === "CANCELLED") throwError(400, "La reserva ya está cancelada");

    await pool.execute(
        `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
        [Number(id)]
    );

    return {
        ...booking,
        status: "CANCELLED",
        cancelledAt: new Date().toISOString(),
    };
}

module.exports = {
    createBooking,
    listBookings,
    getBookingById,
    cancelBooking,
    getItemAvailability,
};
