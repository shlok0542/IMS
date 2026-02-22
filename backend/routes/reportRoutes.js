import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getDailySalesReport,
  getMonthlySalesReport,
  getPlatformSalesReport,
  getDeadStockReport,
  getFastMovingProductsReport,
  getProfitReport
} from "../controllers/reportController.js";

const router = express.Router();

router.use(protect);

router.get("/daily-sales", getDailySalesReport);
router.get("/monthly-sales", getMonthlySalesReport);
router.get("/platform-sales", getPlatformSalesReport);
router.get("/dead-stock", getDeadStockReport);
router.get("/fast-moving", getFastMovingProductsReport);
router.get("/profit", getProfitReport);

export default router;
