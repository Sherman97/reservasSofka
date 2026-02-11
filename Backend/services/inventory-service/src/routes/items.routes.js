const express = require("express");
const router = express.Router();

const {
    createItem,
    listItems,
    getItemById,
    updateItem,
    deleteItem
} = require("../controllers/items.controller");

router.post("/", createItem);
router.get("/", listItems);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
