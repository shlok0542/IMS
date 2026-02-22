import express from "express";
import protect from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  createPurchase,
  listPurchases,
  softDeletePurchase
} from "../controllers/purchaseController.js";
import {
  createPurchaseValidator,
  purchaseListValidator
} from "../validators/purchaseValidators.js";

const router = express.Router();

router.use(protect);

router.get("/", purchaseListValidator, validateRequest, listPurchases);
router.post("/", createPurchaseValidator, validateRequest, createPurchase);
router.delete("/:id", softDeletePurchase);

export default router;
