import express from "express";
import protect from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  createManualTransaction,
  listTransactions
} from "../controllers/stockController.js";
import {
  createTransactionValidator,
  listTransactionValidator
} from "../validators/stockValidators.js";

const router = express.Router();

router.use(protect);

router.get("/", listTransactionValidator, validateRequest, listTransactions);
router.post("/", createTransactionValidator, validateRequest, createManualTransaction);

export default router;
