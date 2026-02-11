const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth.middleware");

const {
    assignItem,
    listLocationItems,
    getLocationItem
} = require("../controllers/locationItems.controller");

// POST /locations/:locationId/items
router.post("/:locationId/items", requireAuth, assignItem);

// GET /locations/:locationId/items
router.get("/:locationId/items", requireAuth, listLocationItems);

// GET /locations/:locationId/items/:itemId
router.get("/:locationId/items/:itemId", requireAuth, getLocationItem);

module.exports = router;
