const locationItemsService = require("../services/locationItems.service");

function assignItem(req, res) {
    try {
        const { locationId } = req.params;
        const record = locationItemsService.assignItemToLocation({
            locationId,
            itemId: req.body.itemId,
            qty: req.body.qty,
        });
        return res.status(201).json({ ok: true, data: record });
    } catch (err) {
        return handleError(err, res);
    }
}

function listLocationItems(req, res) {
    try {
        const { locationId } = req.params;
        const list = locationItemsService.listItemsByLocation(locationId);
        return res.json({ ok: true, data: list });
    } catch (err) {
        return handleError(err, res);
    }
}

function getLocationItem(req, res) {
    try {
        const { locationId, itemId } = req.params;
        const record = locationItemsService.getLocationItem(locationId, itemId);
        return res.json({ ok: true, data: record });
    } catch (err) {
        return handleError(err, res);
    }
}

function handleError(err, res) {
    if (err.statusCode) return res.status(err.statusCode).json({ ok: false, message: err.message });
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
}

module.exports = { assignItem, listLocationItems, getLocationItem };
