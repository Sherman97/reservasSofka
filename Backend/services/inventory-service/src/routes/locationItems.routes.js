const express = require("express");
const router = express.Router();

const {
    assignItem,
    listLocationItems,
    getLocationItem
} = require("../controllers/locationItems.controller");

// POST /locations/:locationId/items
router.post("/:locationId/items", assignItem);

// GET /locations/:locationId/items
router.get("/:locationId/items", listLocationItems);

// GET /locations/:locationId/items/:itemId
router.get("/:locationId/items/:itemId", getLocationItem);

module.exports = router;
