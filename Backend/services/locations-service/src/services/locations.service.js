const pool = require("../db");

function throwError(statusCode, message) {
    const e = new Error(message);
    e.statusCode = statusCode;
    throw e;
}

async function findAll() {
    const [rows] = await pool.execute(
        `SELECT 
            l.id, 
            l.name, 
            l.address AS location,
            l.created_at
        FROM locations l
        ORDER BY l.name ASC`
    );

    // Get inventory for each location
    const locationIds = rows.map(r => r.id);
    let inventoryByLocation = {};

    if (locationIds.length > 0) {
        const [inventoryRows] = await pool.query(
            `SELECT 
                li.location_id,
                i.id AS inventory_id,
                i.name AS inventory_name,
                li.qty
            FROM location_inventory li
            JOIN inventory i ON i.id = li.inventory_id
            WHERE li.location_id IN (${locationIds.map(() => "?").join(",")})`,
            locationIds
        );

        for (const inv of inventoryRows) {
            (inventoryByLocation[inv.location_id] ||= []).push({
                id: inv.inventory_id,
                name: inv.inventory_name,
                qty: inv.qty,
            });
        }
    }

    return rows.map(r => ({
        id: r.id,
        name: r.name,
        location: r.location,
        tags: (inventoryByLocation[r.id] || []).map(inv => inv.name),
        inventory: inventoryByLocation[r.id] || [],
        createdAt: r.created_at,
    }));
}

async function findById(id) {
    const [rows] = await pool.execute(
        `SELECT id, name, address AS location, created_at
        FROM locations
        WHERE id = ?
        LIMIT 1`,
        [Number(id)]
    );

    if (!rows.length) throwError(404, "Locación no encontrada");

    const location = rows[0];

    // Get inventory
    const [inventoryRows] = await pool.execute(
        `SELECT 
            i.id AS inventory_id,
            i.name AS inventory_name,
            li.qty
        FROM location_inventory li
        JOIN inventory i ON i.id = li.inventory_id
        WHERE li.location_id = ?`,
        [Number(id)]
    );

    return {
        id: location.id,
        name: location.name,
        location: location.location,
        tags: inventoryRows.map(inv => inv.inventory_name),
        inventory: inventoryRows.map(inv => ({
            id: inv.inventory_id,
            name: inv.inventory_name,
            qty: inv.qty,
        })),
        createdAt: location.created_at,
    };
}

async function create(data) {
    const { name, address } = data;

    if (!name) throwError(400, "El nombre es obligatorio");

    const [result] = await pool.execute(
        `INSERT INTO locations (name, address) VALUES (?, ?)`,
        [name, address || ""]
    );

    return {
        id: result.insertId,
        name,
        location: address || "",
        tags: [],
        inventory: [],
    };
}

async function update(id, data) {
    const location = await findById(id);

    const { name, address } = data;

    await pool.execute(
        `UPDATE locations SET name = ?, address = ? WHERE id = ?`,
        [name || location.name, address !== undefined ? address : location.location, Number(id)]
    );

    return findById(id);
}

async function deleteLocation(id) {
    await findById(id); // Verify exists

    await pool.execute(`DELETE FROM locations WHERE id = ?`, [Number(id)]);

    return { id: Number(id), deleted: true };
}

async function assignInventory(locationId, inventoryId, qty) {
    const locId = Number(locationId);
    const invId = Number(inventoryId);
    const quantity = Number(qty) || 1;

    if (!locId || !invId) throwError(400, "locationId e inventoryId son obligatorios");
    if (quantity < 0) throwError(400, "qty debe ser mayor o igual a 0");

    // Verify location exists
    await findById(locId);

    // Verify inventory exists
    const [invRows] = await pool.execute(
        `SELECT id FROM inventory WHERE id = ? LIMIT 1`,
        [invId]
    );
    if (!invRows.length) throwError(404, "Inventario no encontrado");

    // Check current quantity
    const [currentRows] = await pool.execute(
        `SELECT qty FROM location_inventory WHERE location_id = ? AND inventory_id = ? LIMIT 1`,
        [locId, invId]
    );

    const currentQty = currentRows.length ? Number(currentRows[0].qty) : 0;

    // If reducing quantity, check for conflicts with bookings
    if (quantity < currentQty) {
        const reduction = currentQty - quantity;

        // Check future bookings that use this inventory at this location
        const [bookingRows] = await pool.execute(
            `SELECT COALESCE(SUM(bi.qty), 0) AS maxReserved
            FROM booking_inventory bi
            JOIN bookings b ON b.id = bi.booking_id
            WHERE b.location_id = ?
              AND bi.inventory_id = ?
              AND b.status = 'confirmed'
              AND b.end_time > NOW()`,
            [locId, invId]
        );

        const maxReserved = Number(bookingRows[0]?.maxReserved || 0);

        if (quantity < maxReserved) {
            throwError(
                409,
                `No se puede reducir la cantidad. Hay ${maxReserved} unidades reservadas en reservas futuras.`
            );
        }
    }

    // Upsert
    if (quantity === 0) {
        // Remove completely
        await pool.execute(
            `DELETE FROM location_inventory WHERE location_id = ? AND inventory_id = ?`,
            [locId, invId]
        );
    } else {
        await pool.execute(
            `INSERT INTO location_inventory (location_id, inventory_id, qty, updated_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE qty = ?, updated_at = NOW()`,
            [locId, invId, quantity, quantity]
        );
    }

    return {
        locationId: locId,
        inventoryId: invId,
        qty: quantity,
    };
}

async function removeInventory(locationId, inventoryId) {
    return assignInventory(locationId, inventoryId, 0);
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteLocation,
    assignInventory,
    removeInventory,
};
