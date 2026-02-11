const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth.middleware");

const {
    createItem,
    listItems,
    getItemById,
    updateItem,
    deleteItem
} = require("../controllers/items.controller");

router.post("/", requireAuth, createItem);
router.get("/", requireAuth, listItems);
router.get("/:id", requireAuth, getItemById);
router.put("/:id", requireAuth, updateItem);
router.delete("/:id", requireAuth, deleteItem);

module.exports = router;
