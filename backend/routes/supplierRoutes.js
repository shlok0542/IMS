import express from "express";
import { body } from "express-validator";
import protect, { authorizeRoles } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { createSupplier, listSuppliers } from "../controllers/supplierController.js";

const router = express.Router();

router.use(protect);

router.get("/", listSuppliers);
router.post(
  "/",
  authorizeRoles("admin"),
  [body("name").trim().notEmpty().withMessage("name is required")],
  validateRequest,
  createSupplier
);

export default router;
