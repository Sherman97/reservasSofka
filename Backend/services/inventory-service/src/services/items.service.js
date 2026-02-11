const pool = require("../db");

function throwError(statusCode, message) {
    const e = new Error(message);
    e.statusCode = statusCode;
    throw e;
}

function toBool(val) {
    return Boolean(val);
}

async function createItem(payload) {
    const { name, category = "OTHER", isReservable = true } = payload || {};

    if (!name) throwError(400, "name es obligatorio");

    const cleanName = String(name).trim();

    const [result] = await pool.execute(
        `INSERT INTO inventory (name, type, status, is_reservable)
     VALUES (?, ?, 'available', ?)`,
        [cleanName, category, isReservable ? 1 : 0]
    );

    const [rows] = await pool.execute(
        `SELECT id, name, type, is_reservable, created_at
     FROM inventory
     WHERE id = ?`,
        [result.insertId]
    );

    const r = rows[0];
    return {
        id: r.id,
        name: r.name,
        category: r.type,
        isReservable: toBool(r.is_reservable),
        createdAt: r.created_at,
    };
}

async function listItems(filters = {}) {
    const where = [];
    const params = [];

    if (filters.category) {
        where.push("type = ?");
        params.push(filters.category);
    }

    if (typeof filters.isReservable !== "undefined") {
        const val = String(filters.isReservable) === "true" ? 1 : 0;
        where.push("is_reservable = ?");
        params.push(val);
    }

    const sql = `
    SELECT id, name, type, is_reservable, created_at
    FROM inventory
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY created_at DESC
  `;

    const [rows] = await pool.execute(sql, params);

    return rows.map(r => ({
        id: r.id,
        name: r.name,
        category: r.type,
        isReservable: toBool(r.is_reservable),
        createdAt: r.created_at,
    }));
}

async function getItemById(id) {
    const [rows] = await pool.execute(
        `SELECT id, name, type, is_reservable, created_at
     FROM inventory
     WHERE id = ?
     LIMIT 1`,
        [id]
    );

    if (!rows.length) throwError(404, "Item no encontrado");

    const r = rows[0];
    return {
        id: r.id,
        name: r.name,
        category: r.type,
        isReservable: toBool(r.is_reservable),
        createdAt: r.created_at,
    };
}

async function updateItem(id, payload) {
    // asegura existencia
    await getItemById(id);

    const fields = [];
    const params = [];

    if (payload.name !== undefined) {
        fields.push("name = ?");
        params.push(String(payload.name).trim());
    }
    if (payload.category !== undefined) {
        fields.push("type = ?");
        params.push(payload.category);
    }
    if (payload.isReservable !== undefined) {
        fields.push("is_reservable = ?");
        params.push(payload.isReservable ? 1 : 0);
    }

    if (!fields.length) {
        // nada que actualizar
        return await getItemById(id);
    }

    params.push(id);
    await pool.execute(`UPDATE inventory SET ${fields.join(", ")} WHERE id = ?`, params);

    const updated = await getItemById(id);
    updated.updatedAt = new Date().toISOString();
    return updated;
}

async function deleteItem(id) {
    // asegura existencia
    await getItemById(id);

    // limpia referencias (si aplica)
    await pool.execute(`DELETE FROM location_inventory WHERE inventory_id = ?`, [id]);
    await pool.execute(`DELETE FROM booking_inventory WHERE inventory_id = ?`, [id]);

    const [result] = await pool.execute(`DELETE FROM inventory WHERE id = ?`, [id]);
    if (result.affectedRows === 0) throwError(404, "Item no encontrado");

    return { id: Number(id) };
}

module.exports = {
    createItem,
    listItems,
    getItemById,
    updateItem,
    deleteItem,
};
