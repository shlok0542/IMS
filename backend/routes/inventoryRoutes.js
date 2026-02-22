import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getStats
} from "../controllers/inventoryController.js";

const router = express.Router();

router.use(protect);

router.get("/stats", getStats);
router.get("/", getItems);
router.post("/", createItem);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
