const itemsService = require("../services/items.service");

async function createItem(req, res) {
    try {
        const item = await itemsService.createItem(req.body);
        return res.status(201).json({ ok: true, data: item });
    } catch (err) {
        return handleError(err, res);
    }
}

async function listItems(req, res) {
    console.log("listItems");
    try {
        const items = await itemsService.listItems(req.query);
        console.log(items);
        return res.json({ ok: true, data: items });
    } catch (err) {
        return handleError(err, res);
    }
}

async function getItemById(req, res) {
    try {
        const item = await itemsService.getItemById(req.params.id);
        return res.json({ ok: true, data: item });
    } catch (err) {
        return handleError(err, res);
    }
}

async function updateItem(req, res) {
    try {
        const item = await itemsService.updateItem(req.params.id, req.body);
        return res.json({ ok: true, data: item });
    } catch (err) {
        return handleError(err, res);
    }
}

async function deleteItem(req, res) {
    try {
        const deleted = await itemsService.deleteItem(req.params.id);
        return res.json({ ok: true, data: deleted });
    } catch (err) {
        return handleError(err, res);
    }
}

function handleError(err, res) {
    if (err.statusCode) return res.status(err.statusCode).json({ ok: false, message: err.message });
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
}

module.exports = { createItem, listItems, getItemById, updateItem, deleteItem };
