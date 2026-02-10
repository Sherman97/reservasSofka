const crypto = require("crypto");
const { getItemById } = require("./items.service");

// stock por locación
const locationItems = [];
// { id, locationId, itemId, qty, createdAt }

function assignItemToLocation({ locationId, itemId, qty }) {
    if (!locationId || !itemId) throwError(400, "locationId y itemId son obligatorios");
    if (qty === undefined || qty === null) throwError(400, "qty es obligatorio");

    const parsedQty = Number(qty);
    if (!Number.isInteger(parsedQty) || parsedQty < 0) throwError(400, "qty debe ser un entero >= 0");

    // valida que el item exista
    getItemById(itemId);

    // si ya existe relación, actualiza qty
    const existing = locationItems.find(li => li.locationId === locationId && li.itemId === itemId);

    if (existing) {
        existing.qty = parsedQty;
        existing.updatedAt = new Date().toISOString();
        return existing;
    }

    const record = {
        id: crypto.randomUUID(),
        locationId,
        itemId,
        qty: parsedQty,
        createdAt: new Date().toISOString(),
    };

    locationItems.push(record);
    return record;
}

function listItemsByLocation(locationId) {
    if (!locationId) throwError(400, "locationId es obligatorio");
    return locationItems.filter(li => li.locationId === locationId);
}

function getLocationItem(locationId, itemId) {
    const record = locationItems.find(li => li.locationId === locationId && li.itemId === itemId);
    if (!record) throwError(404, "Item no asignado a esta locación");
    return record;
}

function throwError(statusCode, message) {
    const e = new Error(message);
    e.statusCode = statusCode;
    throw e;
}

module.exports = {
    assignItemToLocation,
    listItemsByLocation,
    getLocationItem,
};
