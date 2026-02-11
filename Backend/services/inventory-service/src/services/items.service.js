const crypto = require("crypto");

const items = [];

function createItem(payload) {
    const { name, category = "OTHER", isReservable = true } = payload || {};

    if (!name) throwError(400, "name es obligatorio");

    const item = {
        id: crypto.randomUUID(),
        name: String(name).trim(),
        category,
        isReservable: Boolean(isReservable),
        createdAt: new Date().toISOString()
    };

    items.push(item);
    return item;
}

function listItems(filters = {}) {
    let result = [...items];

    if (filters.category) {
        result = result.filter(i => i.category === filters.category);
    }

    if (typeof filters.isReservable !== "undefined") {
        const val = String(filters.isReservable) === "true";
        result = result.filter(i => i.isReservable === val);
    }

    return result;
}

function getItemById(id) {
    const item = items.find(i => i.id === id);
    if (!item) throwError(404, "Item no encontrado");
    return item;
}

function updateItem(id, payload) {
    const item = getItemById(id);

    if (payload.name !== undefined) item.name = String(payload.name).trim();
    if (payload.category !== undefined) item.category = payload.category;
    if (payload.isReservable !== undefined) item.isReservable = Boolean(payload.isReservable);

    item.updatedAt = new Date().toISOString();
    return item;
}

function deleteItem(id) {
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throwError(404, "Item no encontrado");
    const deleted = items.splice(idx, 1)[0];
    return deleted;
}

function throwError(statusCode, message) {
    const e = new Error(message);
    e.statusCode = statusCode;
    throw e;
}

module.exports = {
    createItem,
    listItems,
    getItemById,
    updateItem,
    deleteItem,
};
