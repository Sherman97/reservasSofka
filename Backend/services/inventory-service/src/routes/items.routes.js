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

router.post("/createItem", requireAuth, createItem);
router.get("/listItems", requireAuth,listItems);
router.get("/getItemById/:id", requireAuth, getItemById);
router.put("/updateItem/:id", requireAuth, updateItem);
router.delete("/deleteItem/:id", requireAuth, deleteItem);

module.exports = router;
