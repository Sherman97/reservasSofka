const pool = require("../db");
const { getItemById } = require("./items.service");

function throwError(statusCode, message) {
    const e = new Error(message);
    e.statusCode = statusCode;
    throw e;
}

async function locationExists(locationId) {
    const [rows] = await pool.execute(
        `SELECT id FROM locations WHERE id = ? LIMIT 1`,
        [locationId]
    );
    return rows.length > 0;
}

// { id, locationId, itemId, qty, createdAt, updatedAt }
async function assignItemToLocation({ locationId, itemId, qty }) {
    if (!locationId || !itemId) throwError(400, "locationId y itemId son obligatorios");
    if (qty === undefined || qty === null) throwError(400, "qty es obligatorio");

    const parsedQty = Number(qty);
    if (!Number.isInteger(parsedQty) || parsedQty < 0) {
        throwError(400, "qty debe ser un entero >= 0");
    }

    // valida que la locación exista
    const locOk = await locationExists(locationId);
    if (!locOk) throwError(404, "Locación no encontrada");

    // valida que el item exista (reusa tu lógica)
    await getItemById(itemId);

    // UPSERT: si existe relación, actualiza qty
    await pool.execute(
        `INSERT INTO location_inventory (location_id, inventory_id, qty, created_at, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, NULL)
     ON DUPLICATE KEY UPDATE
       qty = VALUES(qty),
       updated_at = CURRENT_TIMESTAMP`,
        [locationId, itemId, parsedQty]
    );

    // devolver el registro (igual que antes)
    const [rows] = await pool.execute(
        `SELECT id, location_id, inventory_id, qty, created_at, updated_at
     FROM location_inventory
     WHERE location_id = ? AND inventory_id = ?
     LIMIT 1`,
        [locationId, itemId]
    );

    const r = rows[0];
    return await getLocationItem(locationId, itemId);
}

async function listItemsByLocation(locationId) {
    if (!locationId) throwError(400, "locationId es obligatorio");

    const [rows] = await pool.execute(
        `SELECT
        li.id,
        li.location_id,
        li.inventory_id,
        li.qty,
        li.created_at,
        li.updated_at,

        l.name   AS location_name,
        l.address AS location_address,

        i.name   AS item_name,
        i.type   AS item_category,
        i.status AS item_status,
        i.is_reservable AS item_is_reservable
     FROM location_inventory li
     JOIN locations l ON l.id = li.location_id
     JOIN inventory i ON i.id = li.inventory_id
     WHERE li.location_id = ?
     ORDER BY i.name ASC`,
        [locationId]
    );

    return rows.map(r => ({
        id: r.id,
        qty: r.qty,
        location: {
            id: r.location_id,
            name: r.location_name,
            address: r.location_address,
        },
        item: {
            id: r.inventory_id,
            name: r.item_name,
            category: r.item_category,
            status: r.item_status,
            isReservable: Boolean(r.item_is_reservable),
        },
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    }));
}


async function getLocationItem(locationId, itemId) {
    const [rows] = await pool.execute(
        `SELECT
        li.id,
        li.location_id,
        li.inventory_id,
        li.qty,
        li.created_at,
        li.updated_at,

        l.name   AS location_name,
        l.address AS location_address,

        i.name   AS item_name,
        i.type   AS item_category,
        i.status AS item_status,
        i.is_reservable AS item_is_reservable
     FROM location_inventory li
     JOIN locations l ON l.id = li.location_id
     JOIN inventory i ON i.id = li.inventory_id
     WHERE li.location_id = ? AND li.inventory_id = ?
     LIMIT 1`,
        [locationId, itemId]
    );

    if (!rows.length) throwError(404, "Item no asignado a esta locación");

    const r = rows[0];
    return {
        id: r.id,
        qty: r.qty,
        location: {
            id: r.location_id,
            name: r.location_name,
            address: r.location_address,
        },
        item: {
            id: r.inventory_id,
            name: r.item_name,
            category: r.item_category,
            status: r.item_status,
            isReservable: Boolean(r.item_is_reservable),
        },
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}


module.exports = {
    assignItemToLocation,
    listItemsByLocation,
    getLocationItem,
};
