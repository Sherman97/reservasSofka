const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth.middleware");

const {
    listLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    assignInventory,
    removeInventory,
} = require("../controllers/locations.controller");

router.get("/", requireAuth, listLocations);
router.get("/:id", requireAuth, getLocationById);
router.post("/", requireAuth, createLocation);
router.put("/:id", requireAuth, updateLocation);
router.delete("/:id", requireAuth, deleteLocation);
router.post("/:id/inventory", requireAuth, assignInventory);
router.delete("/:id/inventory/:inventoryId", requireAuth, removeInventory);

module.exports = router;
