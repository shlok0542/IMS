import express from "express";
import protect from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  createOrder,
  listOrders,
  updateOrderStatus,
  softDeleteOrder
} from "../controllers/orderController.js";
import {
  createOrderValidator,
  orderListValidator,
  updateOrderStatusValidator
} from "../validators/orderValidators.js";

const router = express.Router();

router.use(protect);

router.get("/", orderListValidator, validateRequest, listOrders);
router.post("/", createOrderValidator, validateRequest, createOrder);
router.patch("/:id/status", updateOrderStatusValidator, validateRequest, updateOrderStatus);
router.delete("/:id", softDeleteOrder);

export default router;
