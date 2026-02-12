const locationsService = require("../services/locations.service");

async function listLocations(req, res) {
    try {
        const locations = await locationsService.findAll();
        return res.json({ ok: true, data: locations });
    } catch (err) {
        return handleError(err, res);
    }
}

async function getLocationById(req, res) {
    try {
        const location = await locationsService.findById(req.params.id);
        return res.json({ ok: true, data: location });
    } catch (err) {
        return handleError(err, res);
    }
}

async function createLocation(req, res) {
    try {
        const location = await locationsService.create(req.body);
        return res.status(201).json({ ok: true, data: location });
    } catch (err) {
        return handleError(err, res);
    }
}

async function updateLocation(req, res) {
    try {
        const location = await locationsService.update(req.params.id, req.body);
        return res.json({ ok: true, data: location });
    } catch (err) {
        return handleError(err, res);
    }
}

async function deleteLocation(req, res) {
    try {
        const result = await locationsService.deleteLocation(req.params.id);
        return res.json({ ok: true, data: result });
    } catch (err) {
        return handleError(err, res);
    }
}

async function assignInventory(req, res) {
    try {
        const { inventoryId, qty } = req.body;
        const result = await locationsService.assignInventory(
            req.params.id,
            inventoryId,
            qty
        );
        return res.json({ ok: true, data: result });
    } catch (err) {
        return handleError(err, res);
    }
}

async function removeInventory(req, res) {
    try {
        const result = await locationsService.removeInventory(
            req.params.id,
            req.params.inventoryId
        );
        return res.json({ ok: true, data: result });
    } catch (err) {
        return handleError(err, res);
    }
}

function handleError(err, res) {
    if (err.statusCode) {
        return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
}

module.exports = {
    listLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    assignInventory,
    removeInventory,
};
